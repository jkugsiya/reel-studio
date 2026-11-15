// The project's edit. This starter follows the proven structure: hook, talking head, split-screen B-roll,
// a countdown into the music drop, beat-cut demo sections, then an outro card. Replace the clip names, times,
// words and graphics for each project. Clips live in public/clips (made by scripts/prep_clips.sh).
import { LightLeak } from "@remotion/light-leaks";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { beatWords, toChunks, type WordsFile } from "./captions";
import { Captions } from "./components/Captions";
import { Framed } from "./components/Framed";
import { BadgePill, BeatWord, Chip, Notification, OutroCard, TitleSlam } from "./components/Graphics";
import { BOTTOM, CARD, Finish, Flash, Punch, Stage } from "./components/Stage";
import { FPS, TOTAL, beatGrid, f, span } from "./timeline";

const PORTRAIT = 9 / 16;
const WIDE = 16 / 9;

// ---- Timing -----------------------------------------------------------------------------------------------
// From scripts/beats.py: period = seconds per beat; MUSIC_TRIM = drop_beat - DROP puts the drop on DROP.
const { drop: DROP, period: BEAT, beat } = beatGrid(5.5, 0.4905);
const MUSIC_TRIM = 2.0;
const SEC = {
  hook: { from: 0, to: 2.5 },
  talk: { from: 2.5, to: DROP - 1.5 },
  countdown: { from: DROP - 1.5, to: DROP },
  demo: { from: DROP, to: beat(8) },
  outro: { from: beat(8), to: TOTAL },
};
const DEMO_CUTS = [0, 4].map((k, i) => ({ from: beat(k), to: beat(k + 4), screen: [10, 20][i], action: [1, 4][i] }));

// ---- Words: replace with the JSON from scripts/transcribe.py, e.g. import talkWords from "./data/talk.words.json"
const talkWords: WordsFile = { words: [{ t: 0.4, end: 0.8, text: "replace" }, { t: 0.8, end: 1.4, text: "me" }] };
const TALK_TRIM = 0; // clip second that plays at SEC.talk.from
const TALK_CAPS = toChunks(talkWords, { reelStart: SEC.talk.from, trimBefore: TALK_TRIM, until: SEC.talk.to, highlight: ["me"] });

// ---- Sound: Mixkit ids from references/sound.md, saved as public/sfx/s<id>.mp3 by scripts/fetch_audio.py ----
const SFX: { t: number; id: number; vol: number; trim?: number; dur?: number }[] = [
  { t: 0, id: 1143, vol: 0.75 }, // low boom on the first frame
  { t: 0.2, id: 2055, vol: 0.55 }, // notification chirp
  { t: SEC.talk.from - 0.18, id: 166, vol: 0.55 }, // whoosh into the next section
  { t: SEC.countdown.from - 1.4, id: 2719, vol: 0.6, trim: 4.0, dur: 1.4 + DROP - SEC.countdown.from }, // riser cut at the drop
  ...[-3, -2, -1].map((k) => ({ t: beat(k), id: 2574, vol: 0.55 })), // countdown clicks
  { t: DROP - 0.4, id: 2608, vol: 0.85 }, // hit on the drop
  { t: DROP - 0.45, id: 1143, vol: 0.85 },
  ...DEMO_CUTS.slice(1).map((c) => ({ t: c.from - 0.2, id: 166, vol: 0.35 })),
  { t: SEC.outro.from - 0.45, id: 1143, vol: 0.7 },
  { t: SEC.outro.from + 2.0, id: 2574, vol: 0.7 }, // button tap
];
const musicVolume = (fr: number) => {
  const t = fr / FPS;
  if (t < SEC.countdown.from) return 0.2; // under speech
  if (t < DROP) return interpolate(t, [SEC.countdown.from, DROP], [0.2, 0.42]);
  return interpolate(t, [TOTAL - 1.2, TOTAL], [0.85, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

/** Card pulse on every beat after the drop, plus a zoom kick on each cut. */
const useBeatKick = (cuts: number[]) => {
  const t = useCurrentFrame() / FPS + SEC.demo.from;
  const sinceBeat = t >= DROP ? (t - DROP) % BEAT : 1;
  const sinceCut = t - Math.max(...cuts.filter((c) => c <= t + 1e-6), -10);
  const kick = sinceCut < 0.3 ? interpolate(sinceCut, [0, 0.27], [0.09, 0], { extrapolateRight: "clamp" }) : 0;
  return 1 + 0.014 * Math.exp(-sinceBeat * 12) + kick;
};

const Demo: React.FC = () => {
  const scale = useBeatKick(DEMO_CUTS.map((c) => c.from));
  const rel = (t: number) => t - SEC.demo.from;
  return (
    <Stage
      topTransform={`scale(${scale})`}
      top={DEMO_CUTS.map((c) => (
        <Sequence key={c.from} {...span(rel(c.from), rel(c.to))}>
          <Framed src="screen.mp4" trimBefore={c.screen} w={CARD.w} h={CARD.h} aspect={WIDE} zoom={1.04} grade="contrast(1.07) saturate(1.22)" />
        </Sequence>
      ))}
      bottom={DEMO_CUTS.map((c) => (
        <Sequence key={c.from} {...span(rel(c.from), rel(c.to))}>
          <Framed src="action.mp4" trimBefore={c.action} w={1080} h={BOTTOM.h} aspect={PORTRAIT} zoom={1.06} fy={0.55} />
        </Sequence>
      ))}
    />
  );
};

export type ReelProps = { music: boolean };

export const Reel: React.FC<ReelProps> = ({ music }) => (
  <AbsoluteFill style={{ background: "#05070B" }}>
    {/* Pictures */}
    <Sequence {...span(SEC.hook.from, SEC.hook.to)}>
      <Punch exit><Framed src="hook.mp4" trimBefore={0} w={1080} h={1920} aspect={PORTRAIT} /></Punch>
    </Sequence>
    <Sequence {...span(SEC.talk.from, SEC.talk.to)}>
      <Punch enter exit><Framed src="talk.mp4" trimBefore={TALK_TRIM} w={1080} h={1920} aspect={PORTRAIT} zoom={1.3} fy={0.24} /></Punch>
    </Sequence>
    <Sequence {...span(SEC.countdown.from, SEC.countdown.to)}>
      <Punch enter><Framed src="action.mp4" trimBefore={0} w={1080} h={1920} aspect={PORTRAIT} zoom={1.1} /></Punch>
    </Sequence>
    <Sequence {...span(SEC.demo.from, SEC.demo.to)}><Demo /></Sequence>
    <Sequence {...span(SEC.outro.from, SEC.outro.to)}>
      <Punch enter>
        <AbsoluteFill style={{ filter: "blur(14px) brightness(0.5)" }}>
          <Framed src="action.mp4" trimBefore={0} freezeAfter={0} w={1080} h={1920} aspect={PORTRAIT} zoom={1.12} />
        </AbsoluteFill>
      </Punch>
    </Sequence>

    {/* Graphics */}
    <Sequence {...span(0.18, SEC.hook.to - 0.1)}><Notification icon="assets/logo_icon.png" app="Brand" title="Big news 🎉" body="Replace with the hook line" /></Sequence>
    <Sequence {...span(SEC.talk.from + 0.4, SEC.talk.to)}><BadgePill icon="assets/badge_icon.png" prefix="Built with" label="Your Tool" y={CARD.y + CARD.h - 130} /></Sequence>
    {[-3, -2, -1].map((k, i) => (
      <Sequence key={k} {...span(beat(k), beat(k + 1))}><BeatWord text={String(3 - i)} y={960} size={420} accent /></Sequence>
    ))}
    <Sequence {...span(SEC.demo.from, SEC.demo.to)}>
      <Chip label="SCREEN" x={CARD.x + 30} y={CARD.y + 30} />
      <Chip label="REAL LIFE" dot="#22C55E" x={40} y={BOTTOM.y + 110} />
    </Sequence>
    <Sequence {...span(DROP, beat(4) - 0.05)}><TitleSlam label="LIVE DEMO" title="THE THING" y={CARD.y + CARD.h + 20} /></Sequence>
    <Sequence {...span(SEC.outro.from, SEC.outro.to)}><OutroCard headline="KAISA LAGA?" sub="Comment karo 👇" tapAt={2.0} /></Sequence>

    {/* Captions use absolute time, so they sit outside offset Sequences */}
    <Captions chunks={TALK_CAPS} y={1330} />
    <Captions chunks={beatWords([[beat(4), "NO"], [beat(4.5), "CONTROLLERS", true]], beat(8))} y={1600} />

    {/* Transitions and finish */}
    {[[SEC.talk.from, 0.5], [DROP, 1], ...DEMO_CUTS.slice(1).map((c) => [c.from, 0.3]), [SEC.outro.from, 0.7]].map(([t, s]) => (
      <Sequence key={t} {...span(t, t + 0.3)}><Flash strength={s} /></Sequence>
    ))}
    {[DROP - 0.15].map((t) => (
      <Sequence key={t} {...span(t, t + 0.6)}><AbsoluteFill style={{ opacity: 0.5 }}><LightLeak seed={3} hueShift={200} /></AbsoluteFill></Sequence>
    ))}
    <Finish />

    {/* Sound */}
    <Sequence {...span(SEC.hook.from, SEC.hook.to)}><Audio src={staticFile("clips/hook.mp4")} /></Sequence>
    <Sequence {...span(SEC.talk.from, SEC.talk.to)}><Audio src={staticFile("clips/talk.mp4")} trimBefore={f(TALK_TRIM)} /></Sequence>
    {music && <Audio src={staticFile("music.mp3")} trimBefore={f(MUSIC_TRIM)} volume={musicVolume} />}
    {SFX.map((s, i) => (
      <Sequence key={i} from={f(s.t)} durationInFrames={s.dur ? f(s.dur) : undefined}>
        <Audio src={staticFile(`sfx/s${s.id}.mp3`)} trimBefore={s.trim ? f(s.trim) : undefined} volume={s.vol} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
