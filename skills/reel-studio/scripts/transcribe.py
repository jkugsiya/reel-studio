#!/usr/bin/env python3
"""Word-level transcript of a clip with whisper.cpp, ready for animated captions.

usage: transcribe.py clip.mov [--lang auto|hi|en|...] [--out clip.words.json] [--no-rescale]

Writes {"source", "language", "speech": [start, end], "words": [{"t", "end", "text"}]} in clip seconds and prints a table.
whisper.cpp word times on short clips tend to start early and drift. By default they are rescaled onto the
speech window that ffmpeg's silence detection measures, which lands words within about 0.1 s of the audio.
Text comes out in the script Whisper picks (Hindi in Devanagari, for example). Romanise or fix spellings in the
JSON afterwards; keep the times.
Only the standard library is used, so the system python3 runs it.
"""
import argparse, json, os, re, shutil, subprocess, sys, tempfile

DEFAULT_MODEL = os.environ.get("WHISPER_MODEL", os.path.expanduser("~/.cache/whisper/ggml-large-v3-turbo-q5_0.bin"))


def speech_window(wav, duration):
    """First and last moment of speech, from ffmpeg silencedetect (-35 dB, 0.18 s)."""
    log = subprocess.run(["ffmpeg", "-i", wav, "-af", "silencedetect=n=-35dB:d=0.18", "-f", "null", "-"], capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: (-?[\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    gaps = [(s, ends[i] if i < len(ends) else duration) for i, s in enumerate(starts)]
    begin = gaps[0][1] if gaps and gaps[0][0] <= 0.05 else 0.0  # leading silence
    finish = gaps[-1][0] if gaps and gaps[-1][1] >= duration - 0.05 and gaps[-1][0] > begin else duration  # trailing silence
    return round(max(0.0, begin), 3), round(min(duration, finish), 3)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("clip")
    ap.add_argument("--lang", default="auto", help="whisper language code, or auto")
    ap.add_argument("--out")
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--no-rescale", action="store_true", help="keep whisper's raw word times")
    a = ap.parse_args()

    if not shutil.which("whisper-cli"):
        sys.exit("whisper-cli is not installed: run scripts/setup.sh --check")
    if not os.path.exists(a.model):
        sys.exit(f"Whisper model missing at {a.model}: run scripts/setup.sh --check")
    out = a.out or os.path.splitext(a.clip)[0] + ".words.json"

    with tempfile.TemporaryDirectory() as tmp:
        wav = os.path.join(tmp, "a.wav")
        r = subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.clip, "-map", "0:a:0", "-ar", "16000", "-ac", "1", wav], capture_output=True, text=True)
        if r.returncode:
            sys.exit(f"Audio extraction failed for {a.clip}: {r.stderr.strip()[-300:]}")
        duration = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav], capture_output=True, text=True).stdout)
        base = os.path.join(tmp, "w")
        r = subprocess.run(["whisper-cli", "-m", a.model, "-f", wav, "-l", a.lang, "-ml", "1", "-sow", "-ojf", "-of", base, "-np"], capture_output=True, text=True)
        if r.returncode or not os.path.exists(base + ".json"):
            sys.exit(f"whisper-cli failed: {r.stderr.strip()[-500:]}")
        data = json.load(open(base + ".json", encoding="utf-8"))
        lang = data.get("result", {}).get("language", a.lang)
        words = [
            {"t": s["offsets"]["from"] / 1000, "end": s["offsets"]["to"] / 1000, "text": s["text"].strip()}
            for s in data["transcription"]
            if s["text"].strip() and not s["text"].strip().startswith("[")
        ]
        speech = speech_window(wav, duration)

    if words and not a.no_rescale:
        w0, w1 = words[0]["t"], words[-1]["end"]
        s0, s1 = speech
        k = (s1 - s0) / (w1 - w0) if w1 > w0 else 1.0
        for w in words:
            w["t"] = s0 + (w["t"] - w0) * k
            w["end"] = s0 + (w["end"] - w0) * k
    for w in words:
        w["t"], w["end"] = round(w["t"], 2), round(w["end"], 2)

    json.dump({"source": os.path.abspath(a.clip), "language": lang, "speech": list(speech), "words": words}, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(f"language={lang} speech={speech[0]:.2f}-{speech[1]:.2f}s words={len(words)}")
    for w in words:
        print(f"{w['t']:7.2f} {w['end']:7.2f}  {w['text']}")
    print(f"saved {out}")


if __name__ == "__main__":
    main()
