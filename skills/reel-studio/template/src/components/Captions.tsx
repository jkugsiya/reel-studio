import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Chunk } from "../captions";
import { ACCENT_GLOW, ACCENT_GRADIENT, HEAVY, TEXT_SHADOW } from "../theme";

/**
 * Word-by-word captions: each word pops in when spoken, and highlighted words sit on the accent pill.
 * Uses absolute reel time, so render it outside any offset Sequence.
 */
export const Captions: React.FC<{ chunks: Chunk[]; y: number; size?: number }> = ({ chunks, y, size = 86 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const chunk = chunks.find((c) => t >= c.words[0].t && t < c.end);
  if (!chunk) return null;
  const shown = chunk.words.filter((w) => w.t <= t);
  
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, display: "flex", flexWrap: "wrap", justifyContent: "center", transform: "translateY(-50%)" }}>
      {shown.map((w) => {
        const pop = spring({ frame: frame - Math.round(w.t * fps), fps, config: { damping: 11, stiffness: 260, mass: 0.6 } });
        const scale = interpolate(pop, [0, 1], [0.7, 1]);
        const base: React.CSSProperties = {
          fontFamily: HEAVY,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          display: "inline-block",
          margin: "2px 17px",
          transform: `translateY(${interpolate(pop, [0, 1], [26, 0])}px) scale(${scale})`,
          opacity: interpolate(pop, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }),
        };
        if (!w.hl) return <span key={w.t} style={{ ...base, color: "#fff", textShadow: TEXT_SHADOW }}>{w.text}</span>;
        // Highlighted words sit on a accent pill so they read on bright walls and dark cockpits alike.
        return (
          <span key={w.t} style={{ ...base, color: "#fff", background: ACCENT_GRADIENT, padding: "2px 20px 6px", borderRadius: 20, boxShadow: `0 10px 34px ${ACCENT_GLOW}, inset 0 1px 0 rgba(255,255,255,0.35)`, transform: `${base.transform} rotate(-2deg)` }}>
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
