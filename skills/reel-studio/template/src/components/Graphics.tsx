// Motion-graphics pieces. Each animates from its own Sequence start (local frame 0) and ends with the Sequence,
// so wrap each one in <Sequence {...span(from, to)}>. Image props are paths under public/ (e.g. "assets/logo.png").
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ACCENT, ACCENT_GLOW, ACCENT_GRADIENT, GLASS_BG, GLASS_BORDER, HEAVY, SECOND_ACCENT, TEXT_SHADOW, UI } from "../theme";

/** Spring in at the start; fade out over the last `outFrames` of the sequence (0 = no fade). */
const useInOut = (outFrames = 6, config = { damping: 13, stiffness: 180 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const enter = spring({ frame, fps, config });
  const exit = outFrames ? interpolate(frame, [durationInFrames - outFrames, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  return { frame, fps, enter, exit };
};

export const glass: React.CSSProperties = {
  background: GLASS_BG,
  backdropFilter: "blur(28px) saturate(170%)",
  WebkitBackdropFilter: "blur(28px) saturate(170%)",
  border: `1.5px solid ${GLASS_BORDER}`,
  boxShadow: "0 24px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.18)",
};

/** Phone-style notification that drops from the top: a hook for news like "you got selected" or "order shipped". */
export const Notification: React.FC<{ icon: string; app: string; title: string; body: string; y?: number }> = ({ icon, app, title, body, y = 150 }) => {
  const { enter, exit } = useInOut(8, { damping: 14, stiffness: 140 });
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: y, transform: `translateY(${interpolate(enter, [0, 1], [-260, 0])}px) scale(${interpolate(enter, [0, 1], [0.92, 1])})`, opacity: exit }}>
      <div style={{ ...glass, borderRadius: 46, padding: "26px 30px", display: "flex", gap: 24, alignItems: "center", background: "rgba(245,247,250,0.82)" }}>
        <div style={{ width: 96, height: 96, borderRadius: 24, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,0.15)", flexShrink: 0 }}>
          <Img src={staticFile(icon)} style={{ width: 70, maxHeight: 70, objectFit: "contain" }} />
        </div>
        <div style={{ flex: 1, fontFamily: UI, color: "#111" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, fontWeight: 600, color: "#555", letterSpacing: 1 }}>
            <span>{app.toUpperCase()}</span>
            <span>now</span>
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, marginTop: 2 }}>{title}</div>
          <div style={{ fontSize: 31, fontWeight: 500, color: "#333", marginTop: 2 }}>{body}</div>
        </div>
      </div>
    </div>
  );
};

/** Small glass label with a pulsing dot, e.g. "HEADSET VIEW" / "REAL LIFE" on split screens. */
export const Chip: React.FC<{ label: string; dot?: string; x: number; y: number }> = ({ label, dot = "#FF3B30", x, y }) => {
  const { frame, enter } = useInOut(4);
  return (
    <div style={{ ...glass, position: "absolute", left: x, top: y, borderRadius: 999, padding: "12px 22px", display: "flex", alignItems: "center", gap: 12, transform: `scale(${enter})`, transformOrigin: "left center" }}>
      <div style={{ width: 14, height: 14, borderRadius: 7, background: dot, boxShadow: `0 0 12px ${dot}`, opacity: 0.55 + 0.45 * Math.abs(Math.sin(frame / 7)) }} />
      <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 27, color: "#fff", letterSpacing: 2.5 }}>{label}</span>
    </div>
  );
};

/** Credit pill with a light sweep, e.g. icon + "Built with" + "Claude Opus 5.5". Centered unless x is set. */
export const BadgePill: React.FC<{ icon: string; prefix: string; label: string; y: number; x?: number; accent?: string }> = ({ icon, prefix, label, y, x, accent = SECOND_ACCENT }) => {
  const { frame, enter, exit } = useInOut(6, { damping: 12, stiffness: 200 });
  const sweep = interpolate(frame, [8, 30], [-40, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: x ?? 0, right: x === undefined ? 0 : undefined, top: y, display: "flex", justifyContent: "center", opacity: exit }}>
      <div style={{ ...glass, background: "rgba(20,16,14,0.72)", borderRadius: 999, padding: "16px 30px 16px 18px", display: "flex", alignItems: "center", gap: 16, position: "relative", overflow: "hidden", transform: `scale(${enter})`, border: `1.5px solid ${accent}99`, boxShadow: `0 0 40px ${accent}59, 0 20px 60px rgba(0,0,0,0.5)` }}>
        <Img src={staticFile(icon)} style={{ width: 50, height: 50, objectFit: "contain" }} />
        <span style={{ fontFamily: UI, fontSize: 32, fontWeight: 600, color: "rgba(255,255,255,0.75)" }}>{prefix}</span>
        <span style={{ fontFamily: UI, fontSize: 34, fontWeight: 800, color: "#fff" }}>{label}</span>
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sweep}%`, width: 90, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)", transform: "skewX(-20deg)" }} />
      </div>
    </div>
  );
};

/** Floating 3D product card: a photo plus an optional wordmark image under it. */
export const ProductCard: React.FC<{ image: string; wordmark?: string; y?: number; width?: number }> = ({ image, wordmark, y = 210, width = 640 }) => {
  const { frame, enter, exit } = useInOut(7, { damping: 11, stiffness: 150 });
  const rot = interpolate(enter, [0, 1], [38, -6]) + Math.sin(frame / 14) * 3;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", perspective: 1400, opacity: exit }}>
      <div style={{ ...glass, width, borderRadius: 40, padding: 22, transform: `rotateY(${rot}deg) rotateX(6deg) scale(${interpolate(enter, [0, 1], [0.6, 1])}) translateY(${Math.sin(frame / 11) * 6}px)`, boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 60px ${ACCENT_GLOW}` }}>
        <Img src={staticFile(image)} style={{ width: "100%", borderRadius: 26, display: "block" }} />
        {wordmark && (
          <div style={{ display: "flex", justifyContent: "center", padding: "22px 0 8px" }}>
            <Img src={staticFile(wordmark)} style={{ width: width * 0.67 }} />
          </div>
        )}
      </div>
    </div>
  );
};

/** Big centred title that slams in: small label pill above, huge word below. Keep `title` under ~12 characters. */
export const TitleSlam: React.FC<{ label: string; title: string; y: number; neon?: boolean }> = ({ label, title, y, neon }) => {
  const { frame, enter, exit } = useInOut(6, { damping: 10, stiffness: 220 });
  const scale = interpolate(enter, [0, 1], [2.2, 1]);
  const blur = interpolate(frame, [0, 6], [14, 0], { extrapolateRight: "clamp" });
  const titleStyle: React.CSSProperties = neon
    ? { color: "#fff", textShadow: "0 0 10px #FF2D7A, 0 0 30px #FF2D7A, 0 0 60px #2D9BFF, 0 0 90px #2D9BFF" }
    : { backgroundImage: "linear-gradient(180deg, #FFFFFF 30%, #DCEBFF 100%)", WebkitBackgroundClip: "text", color: "transparent", filter: `drop-shadow(0 0 24px ${ACCENT_GLOW}) drop-shadow(0 8px 0 rgba(0,0,0,0.35))` };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, textAlign: "center", transform: `translateY(-50%) scale(${scale})`, filter: `blur(${blur}px)`, opacity: exit }}>
      <div style={{ display: "inline-block", fontFamily: UI, fontWeight: 800, fontSize: 30, letterSpacing: 8, color: "#fff", background: neon ? "linear-gradient(90deg,#FF2D7A,#2D9BFF)" : ACCENT_GRADIENT, padding: "8px 22px", borderRadius: 12, marginBottom: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.45)" }}>{label}</div>
      <div style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: 100, lineHeight: 1, letterSpacing: -3, ...titleStyle }}>{title}</div>
    </div>
  );
};

/** One word that punches in on a beat: countdowns (3, 2, 1) or short lines. */
export const BeatWord: React.FC<{ text: string; y: number; size?: number; accent?: boolean }> = ({ text, y, size = 220, accent }) => {
  const { frame, enter } = useInOut(0, { damping: 9, stiffness: 300 });
  const scale = interpolate(enter, [0, 1], [1.8, 1]) * interpolate(frame, [0, 14], [1, 0.94], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", transform: `translateY(-50%) scale(${scale})`, opacity: interpolate(enter, [0, 0.3], [0, 1], { extrapolateRight: "clamp" }) }}>
      <span style={{ fontFamily: HEAVY, fontWeight: 900, fontSize: size, letterSpacing: -4, color: accent ? ACCENT : "#fff", textShadow: accent ? `0 0 40px ${ACCENT_GLOW}, 0 8px 0 rgba(0,0,0,0.3)` : TEXT_SHADOW }}>{text}</span>
    </div>
  );
};

/** Task card whose lines spin, then tick green one by one (e.g. "what the AI built"). Ticks are seconds after the card appears. */
export const TaskCard: React.FC<{ icon: string; title: string; tag: string; items: string[]; firstTick: number; tickEvery: number; y?: number; accent?: string }> = ({ icon, title, tag, items, firstTick, tickEvery, y = 470, accent = SECOND_ACCENT }) => {
  const { frame, fps, enter, exit } = useInOut(6, { damping: 13, stiffness: 170 });
  return (
    <div style={{ position: "absolute", right: 46, top: y, width: 600, opacity: exit, transform: `translateX(${interpolate(enter, [0, 1], [420, 0])}px)` }}>
      <div style={{ ...glass, background: "rgba(16,14,13,0.78)", borderRadius: 34, padding: "24px 28px", border: `1.5px solid ${accent}73` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <Img src={staticFile(icon)} style={{ width: 44, height: 44, objectFit: "contain" }} />
          <div style={{ fontFamily: UI, color: "#fff", fontWeight: 800, fontSize: 30 }}>{title}</div>
          <div style={{ marginLeft: "auto", fontFamily: UI, fontSize: 22, fontWeight: 700, color: accent, letterSpacing: 2 }}>{tag}</div>
        </div>
        {items.map((item, i) => {
          const tickAt = Math.round((firstTick + i * tickEvery) * fps);
          const done = frame >= tickAt;
          const pop = spring({ frame: frame - tickAt, fps, config: { damping: 10, stiffness: 300 } });
          return (
            <div key={item} style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderTop: i ? "1px solid rgba(255,255,255,0.08)" : undefined }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? "#22C55E" : "transparent", border: done ? "none" : "3px solid rgba(255,255,255,0.25)", borderTopColor: done ? undefined : accent, transform: done ? `scale(${interpolate(pop, [0, 1], [0.4, 1])})` : `rotate(${frame * 24}deg)` }}>
                {done && <span style={{ color: "#fff", fontSize: 24, fontWeight: 900, fontFamily: UI }}>✓</span>}
              </div>
              <span style={{ fontFamily: UI, fontSize: 30, fontWeight: 600, color: done ? "#fff" : "rgba(255,255,255,0.6)" }}>{item}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type OutroProps = {
  logo?: string; // wide logo image (white version for dark glass)
  subtitle?: string;
  row?: React.ReactNode; // optional credits row, e.g. partner logos
  headline: string; // e.g. "KAISA LAGA?"
  sub: string; // e.g. "Comment karo 👇"
  button?: string;
  tappedLabel?: string;
  tapAt: number; // seconds after the card appears when the button is tapped
};

/** Closing card: logo, optional credits row, a call to action and a button that gets tapped. */
export const OutroCard: React.FC<OutroProps> = ({ logo, subtitle, row, headline, sub, button = "Follow", tappedLabel = "Following ✓", tapAt }) => {
  const { frame, fps, enter } = useInOut(0, { damping: 13, stiffness: 150 });
  const tapF = Math.round(tapAt * fps);
  const tapped = frame >= tapF;
  const press = spring({ frame: frame - tapF, fps, config: { damping: 8, stiffness: 400 } });
  const btnScale = tapped ? interpolate(press, [0, 0.5, 1], [0.86, 1.06, 1]) : 1;
  const hand = interpolate(frame, [tapF - 14, tapF - 2], [220, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const stagger = (i: number) => spring({ frame: frame - 4 - i * 4, fps, config: { damping: 13, stiffness: 170 } });
  const rise = (i: number): React.CSSProperties => ({ opacity: stagger(i), transform: `translateY(${interpolate(stagger(i), [0, 1], [40, 0])}px)` });
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 520, transform: `scale(${interpolate(enter, [0, 1], [0.85, 1])})`, opacity: enter }}>
      <div style={{ ...glass, background: "rgba(10,14,22,0.62)", borderRadius: 52, padding: "54px 40px 46px", textAlign: "center", boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 80px ${ACCENT_GLOW}` }}>
        {(logo || subtitle) && (
          <div style={rise(0)}>
            {logo && <Img src={staticFile(logo)} style={{ width: 420 }} />}
            {subtitle && <div style={{ fontFamily: UI, fontWeight: 700, fontSize: 34, letterSpacing: 6, color: "rgba(255,255,255,0.85)", marginTop: 16 }}>{subtitle}</div>}
          </div>
        )}
        {row && (
          <>
            <div style={{ ...rise(1), height: 2, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", margin: "34px 0" }} />
            <div style={{ ...rise(2), display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>{row}</div>
          </>
        )}
        <div style={{ ...rise(3), fontFamily: HEAVY, fontWeight: 900, fontSize: 76, color: "#fff", marginTop: 48, lineHeight: 1.05, letterSpacing: -2 }}>
          {headline}
          <div style={{ fontSize: 48, backgroundImage: ACCENT_GRADIENT, WebkitBackgroundClip: "text", color: "transparent", marginTop: 6 }}>{sub}</div>
        </div>
        <div style={{ ...rise(4), marginTop: 44, display: "flex", justifyContent: "center", position: "relative" }}>
          <div style={{ fontFamily: UI, fontWeight: 800, fontSize: 38, padding: "22px 0", width: 440, borderRadius: 22, color: "#fff", background: tapped ? "rgba(255,255,255,0.16)" : ACCENT, transform: `scale(${btnScale})`, boxShadow: tapped ? "none" : `0 12px 40px ${ACCENT_GLOW}` }}>
            {tapped ? tappedLabel : button}
          </div>
          <div style={{ position: "absolute", left: "58%", top: 40, fontSize: 92, transform: `translate(${hand}px, ${hand}px) scale(${tapped ? interpolate(press, [0, 1], [0.85, 1]) : 1})`, opacity: frame > tapF + 20 ? 0 : 1, filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.5))" }}>👆</div>
        </div>
      </div>
    </div>
  );
};
