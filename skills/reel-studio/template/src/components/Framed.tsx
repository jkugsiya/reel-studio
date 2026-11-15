import { Freeze, OffthreadVideo, staticFile } from "remotion";

type Props = {
  src: string; // file under public/clips
  trimBefore: number; // seconds into the source
  w: number;
  h: number;
  aspect: number; // source width / height
  zoom?: number; // 1 = cover the box; below 1 shows more of the source over a blurred fill
  fx?: number; // focus point in the source, 0..1
  fy?: number;
  playbackRate?: number;
  freezeAfter?: number; // freeze on this local frame and hold it
  grade?: string; // CSS filter
};

/** Places a video inside a w x h box, cropped around a focus point. Audio is handled separately, so it is always muted. */
export const Framed: React.FC<Props> = ({ src, trimBefore, w, h, aspect, zoom = 1, fx = 0.5, fy = 0.5, playbackRate = 1, freezeAfter, grade }) => {
  const coverW = w / h > aspect ? w : h * aspect;
  const W = coverW * zoom;
  const H = W / aspect;
  const left = W >= w ? Math.min(0, Math.max(w - W, w / 2 - fx * W)) : (w - W) / 2;
  const top = H >= h ? Math.min(0, Math.max(h - H, h / 2 - fy * H)) : (h - H) / 2;
  const filter = grade ?? "contrast(1.07) saturate(1.14) brightness(0.98)";

  const video = (style: React.CSSProperties) => (
    <OffthreadVideo
      src={staticFile(`clips/${src}`)}
      trimBefore={Math.round(trimBefore * 30)}
      playbackRate={playbackRate}
      muted
      style={{ position: "absolute", filter, ...style }}
    />
  );
  const content = (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {zoom < 1 && video({ left: (w - coverW) / 2, top: (h - coverW / aspect) / 2, width: coverW, height: coverW / aspect, filter: `${filter} blur(28px) brightness(0.55)`, transform: "scale(1.1)" })}
      {video({ left, top, width: W, height: H })}
    </div>
  );
  if (freezeAfter === undefined) return content;
  return (
    <Freeze frame={freezeAfter} active={(fr) => fr >= freezeAfter}>
      {content}
    </Freeze>
  );
};
