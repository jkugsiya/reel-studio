import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ACCENT_GLOW, BG } from "../theme";

// Split-screen geometry: headset view in a floating card on top, the person full-width underneath.
export const CARD = { x: 28, y: 112, w: 1024, h: 800, r: 44 };
export const BOTTOM = { y: 840, h: 1080 };

type StageProps = {
  top: React.ReactNode;
  bottom: React.ReactNode;
  glow?: string; // card glow colour
  topTransform?: string;
  topFilter?: string;
};

export const Stage: React.FC<StageProps> = ({ top, bottom, glow = ACCENT_GLOW, topTransform, topFilter }) => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 0, top: BOTTOM.y, width: 1080, height: BOTTOM.h, overflow: "hidden", maskImage: "linear-gradient(to bottom, transparent 0px, black 170px)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0px, black 170px)" }}>
      {bottom}
    </div>
    <div style={{ position: "absolute", left: CARD.x, top: CARD.y, width: CARD.w, height: CARD.h, borderRadius: CARD.r, transform: topTransform, filter: topFilter, boxShadow: `0 0 0 2px rgba(255,255,255,0.14), 0 0 70px ${glow}, 0 40px 90px rgba(0,0,0,0.7)` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: CARD.r, overflow: "hidden" }}>
        {top}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 22%, transparent 70%, rgba(0,0,0,0.45) 100%)" }} />
      </div>
    </div>
  </AbsoluteFill>
);

/** Zoom-blur in at the start and/or out at the end of the enclosing Sequence. */
export const Punch: React.FC<{ children: React.ReactNode; enter?: boolean; exit?: boolean }> = ({ children, enter, exit }) => {
  const frame = useCurrentFrame();
  const { durationInFrames: d } = useVideoConfig();
  let scale = 1;
  let blur = 0;
  if (enter) {
    const p = interpolate(frame, [0, 7], [1, 0], { extrapolateRight: "clamp" });
    scale += 0.24 * p * p;
    blur += 14 * p;
  }
  if (exit) {
    const p = interpolate(frame, [d - 5, d], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    scale += 0.2 * p * p;
    blur += 12 * p;
  }
  return <AbsoluteFill style={{ transform: `scale(${scale})`, filter: blur > 0.2 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>;
};

/** White flash that fades over `frames`. */
export const Flash: React.FC<{ strength?: number; frames?: number }> = ({ strength = 0.85, frames = 6 }) => {
  const frame = useCurrentFrame();
  return <AbsoluteFill style={{ background: "#fff", opacity: interpolate(frame, [0, frames], [strength, 0], { extrapolateRight: "clamp" }), pointerEvents: "none" }} />;
};

/** Animated film grain plus a soft vignette over the whole reel. */
export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,0.38) 100%)" }} />
      <AbsoluteFill style={{ opacity: 0.075, mixBlendMode: "overlay" }}>
        <svg width={1080} height={1920}>
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={frame % 12} />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
