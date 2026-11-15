# Template Components

All live in the project's `src/`. Times are reel seconds; wrap graphics in `<Sequence {...span(from, to)}>` so each
animates from its own start. Image props are paths under `public/` (for example `"assets/logo_white.png"`).

## Files

| File | What to change |
|---|---|
| `theme.ts` | `ACCENT`, `ACCENT_GRADIENT`, `ACCENT_GLOW` (brand colour), `SECOND_ACCENT` (6-digit hex, for badges) |
| `timeline.ts` | `TOTAL` length; `span()`, `f()` and `beatGrid(drop, period)` helpers |
| `captions.ts` | `toChunks(wordsFile, {reelStart, trimBefore, until, maxWords, highlight})`, `beatWords([[t, "WORD", hl?]], end)` |
| `Reel.tsx` | The edit: sections, cuts, graphics, captions, sound. `music` prop off renders the no-music version |
| `Demo.tsx` | Media-free check composition; leave as is |

## Pictures

- `Framed({src, trimBefore, w, h, aspect, zoom, fx, fy, playbackRate, freezeAfter, grade})`: a clip from
  `public/clips` cropped into a box around focus point (fx, fy). `zoom` 1 covers the box; above 1 punches in; below
  1 shows more of the source over a blurred fill (good for full-body action). `freezeAfter` holds a local frame.
  `playbackRate` speeds up (e.g. 2.2 for a headset going on). Muted: add sound with `<Audio>`.
- `Stage({top, bottom, glow, topTransform, topFilter})`: split screen. `CARD` (x 28, y 112, 1024x800) and `BOTTOM`
  (y 840, height 1080) give the box sizes for the `Framed` inside each half.
- `Punch({enter, exit})`: zoom-blur in at the start and/or out at the end of its Sequence.
- `Flash({strength, frames})`: white flash on cuts. `Finish`: grain and vignette over everything (render last).
- `LightLeak` from `@remotion/light-leaks`: wrap in `<AbsoluteFill style={{opacity: 0.5}}>`, 0.6 s, `hueShift` 200 for blue.

## Text

- `Captions({chunks, y, size})`: word-by-word captions with accent pills. Render outside offset Sequences.
- `TitleSlam({label, title, y, neon})`: section title; `title` 12 characters or fewer.
- `BeatWord({text, y, size, accent})`: one word or number punched in on a beat (countdowns).
- `Chip({label, dot, x, y})`: small live-style label.

## Cards

- `Notification({icon, app, title, body, y})`: phone notification dropping from the top (hook).
- `BadgePill({icon, prefix, label, y, x, accent})`: credit pill with light sweep ("Built with" + tool).
- `ProductCard({image, wordmark, y, width})`: floating 3D product photo with wordmark.
- `TaskCard({icon, title, tag, items, firstTick, tickEvery, y, accent})`: list ticking on beats; tick times are
  seconds after the card appears (use the beat period).
- `OutroCard({logo, subtitle, row, headline, sub, button, tappedLabel, tapAt})`: closing glass card with a
  call to action and a Follow button tapped at `tapAt` seconds.

## Patterns

- **Beat kick:** compute `1 + 0.014 * exp(-sinceBeat * 12)` plus a 0.09 decaying kick for 0.27 s after each cut, and
  pass it as `topTransform: scale(...)` to `Stage` (see `useBeatKick` in the starter `Reel.tsx`).
- **Punch on a word:** inside a full-screen talk section, raise `zoom` by 0.3 from the word's time and add a sine
  shake of about 9 px for 0.3 s.
- **Clip audio:** `<Sequence {...span(a, b)}><Audio src={staticFile("clips/talk.mp4")} trimBefore={f(trim)} /></Sequence>`.
- **Sound effects:** an array of `{t, id, vol, trim?, dur?}` mapped to `<Sequence from={f(t)}>` + `<Audio>`; see the starter.
