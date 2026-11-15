#!/usr/bin/env python3
"""Tempo, beat grid and drop of a music track, so cuts can land on the beat.

usage: <venv python> beats.py track.mp3 [more.mp3 ...] [--json out.json]

For each track prints the length, BPM, the drop (biggest jump into a sustained loud section), the first beat at or
after the drop, and a loudness bar per second. Needs numpy (the reel-studio venv from setup.sh has it).
To put the drop at reel time D: start the track at (drop_beat - D) seconds, then beat k of the reel = D + k * period.
"""
import argparse, json, subprocess, sys

import numpy as np

SR = 22050


def load(path, lowpass=None):
    af = ["-af", f"lowpass=f={lowpass}"] if lowpass else []
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), *af, "-f", "f32le", "-"], capture_output=True).stdout
    if not raw:
        sys.exit(f"Could not decode audio from {path}")
    return np.frombuffer(raw, np.float32)


def analyze(path):
    x = load(path)
    hop, n = 512, 2048
    frames = np.lib.stride_tricks.sliding_window_view(x, n)[::hop] * np.hanning(n)
    mag = np.abs(np.fft.rfft(frames, axis=1))
    flux = np.maximum(0, np.diff(np.log1p(mag), axis=0)).sum(1)
    flux = (flux - flux.mean()) / (flux.std() + 1e-9)
    fps = SR / hop
    ac = np.correlate(flux, flux, "full")[len(flux) - 1:]
    lags = np.arange(len(ac)) / fps
    window = (lags > 60 / 170) & (lags < 60 / 75)
    period = float(lags[window][np.argmax(ac[window])])

    # Loudness per quarter second; the drop is the biggest rise into a section that stays loud for 2 s.
    q = SR // 4
    db = 20 * np.log10(np.sqrt((x[: len(x) // q * q].reshape(-1, q) ** 2).mean(1)) + 1e-9)
    # Jumps out of near-silence are the music starting, not a drop, so they are skipped.
    scored = sorted(
        ((db[i : i + 8].mean() - db[i - 8 : i].mean(), i / 4) for i in range(8, len(db) - 8) if db[i - 8 : i].mean() > -26),
        reverse=True,
    )
    candidates = []
    for score, sec in scored:
        if all(abs(sec - c[1]) > 4 for c in candidates):
            candidates.append((round(float(score), 1), sec))
        if len(candidates) == 3:
            break
    drop = candidates[0][1] if candidates else 0.0

    # Refine the grid on kick onsets after the drop (low band), then snap the drop to it.
    low = load(path, lowpass=150)
    h = 128
    env = np.sqrt(np.convolve(low**2, np.ones(h) / h, "same"))[::h]
    d = np.maximum(0, np.diff(env))
    f2 = SR / h
    a, b = int(drop * f2), min(len(d) - 9, int((drop + 30) * f2))
    seg = d[a:b]
    onsets = [(a + i) / f2 for i in range(8, len(seg) - 8) if seg[i] == seg[i - 8 : i + 8].max() and seg[i] > seg.max() * 0.35]
    if len(onsets) >= 4:
        t = np.array(onsets)
        fit = []
        for p in np.arange(period * 0.97, period * 1.03, period / 2000):
            for ph in np.arange(0, p, 0.005):
                r = (t - ph) / p
                fit.append((np.abs(r - np.round(r)).mean(), p, ph))
        _, period, phase = min(fit)
        # The drop is the first grid beat after the loudness jump that has a kick on it
        # (the jump itself lands early on tracks with a build).
        beats_after = phase + np.ceil((drop - 0.3 - phase) / period) * period + np.arange(16) * period
        hits = [b for b in beats_after if np.min(np.abs(t - b)) < 0.06]
        drop_beat = hits[0] if hits else beats_after[0]
    else:
        drop_beat = drop
    return {
        "file": path,
        "seconds": round(len(x) / SR, 2),
        "bpm": round(60 / period, 2),
        "period": round(float(period), 4),
        "drop": round(float(drop), 2),
        "drop_beat": round(float(drop_beat), 3),
        "drop_candidates": [{"second": c[1], "jump_db": c[0]} for c in candidates],
        "loudness_db_per_s": [round(float(v), 1) for v in db[: len(db) // 4 * 4].reshape(-1, 4).mean(1)],
    }


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("tracks", nargs="+")
    ap.add_argument("--json")
    a = ap.parse_args()
    results = [analyze(p) for p in a.tracks]
    for r in results:
        bars = "".join(" ▁▂▃▄▅▆▇█"[max(0, min(8, int((v + 40) / 4.5)))] for v in r["loudness_db_per_s"])
        others = ", ".join(f"{c['second']}s (+{c['jump_db']} dB)" for c in r["drop_candidates"][1:])
        print(f"{r['file']}: {r['seconds']}s  {r['bpm']} BPM  drop≈{r['drop']}s  first beat of drop={r['drop_beat']}s" + (f"  other jumps: {others}" if others else ""))
        print(f"  loudness/s |{bars}|")
    if a.json:
        json.dump(results if len(results) > 1 else results[0], open(a.json, "w"), indent=1)


if __name__ == "__main__":
    main()
