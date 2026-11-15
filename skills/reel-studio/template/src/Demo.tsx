// A media-free composition that exercises captions, titles and cards. Render it to confirm a machine is set up:
//   npx remotion render src/index.ts Demo out/demo.mp4
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { beatWords, toChunks } from "./captions";
import { Captions } from "./components/Captions";
import { BeatWord, Chip, TitleSlam } from "./components/Graphics";
import { Finish, Flash } from "./components/Stage";
import { BG } from "./theme";
import { span } from "./timeline";

export const DEMO_SECONDS = 6;

const SAMPLE = {
  words: [
    { t: 0.3, end: 0.6, text: "this" },
    { t: 0.6, end: 0.9, text: "setup" },
    { t: 0.9, end: 1.5, text: "works," },
    { t: 1.7, end: 2.0, text: "captions" },
    { t: 2.0, end: 2.6, text: "pop" },
    { t: 2.6, end: 3.0, text: "in" },
  ],
};

const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: `radial-gradient(circle at ${50 + Math.sin(frame / 20) * 20}% 40%, #12305e 0%, ${BG} 65%)` }} />;
};

export const Demo: React.FC = () => (
  <AbsoluteFill>
    <Backdrop />
    <Sequence {...span(0.2, 6)}><Chip label="REEL STUDIO" x={60} y={140} /></Sequence>
    <Captions chunks={toChunks(SAMPLE, { reelStart: 0, highlight: ["works", "pop"] })} y={1300} />
    {[3.2, 3.7, 4.2].map((t, i) => (
      <Sequence key={t} {...span(t, t + 0.5)}><BeatWord text={String(3 - i)} y={900} size={380} accent /></Sequence>
    ))}
    <Sequence {...span(4.7, 6)}><TitleSlam label="READY" title="LET'S GO" y={900} /></Sequence>
    <Captions chunks={beatWords([[4.8, "BEAT"], [5.1, "SYNCED", true]], 6)} y={1300} />
    <Sequence {...span(4.7, 5.0)}><Flash /></Sequence>
    <Finish />
  </AbsoluteFill>
);
