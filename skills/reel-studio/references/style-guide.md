# Editing Style Guide

The grammar behind reels that feel hand-edited by a top creator, plus the mistakes that made earlier cuts look amateur.

## Layout

- **Canvas:** 1080x1920, 30 fps. Keep text out of the top 150 px and the bottom 320 px (Instagram UI sits there).
- **Full screen** for the hook and for the person talking without B-roll. Frame chest-up (zoom 1.25 to 1.4 on a
  portrait clip, focus near the face); wide full-body shots of a talking person look amateur.
- **Split screen** (the `Stage` component) once there is something to show: the screen, headset or product
  recording sits in a floating rounded card on top (y 112 to 912), and the person fills the bottom, fading up
  under the card. Label halves with `Chip`s ("HEADSET VIEW", "REAL LIFE") when the pairing is the point.
- **Wide (16:9) recordings** go in the top card cropped to fill it; never letterbox them full screen.

## Captions

- Word by word, 1 to 3 words per chunk, popping in when spoken. Heavy sans (Montserrat 900), uppercase, white with
  a soft dark shadow. Size 80 to 90 px.
- Keywords sit on a solid accent pill, rotated -2 degrees. One highlight per 2 to 3 chunks.
- Position: full screen about y 1300 (chest), split screen about y 1560 (over the person, under the card).
- Silent sections get short beat-timed lines (`beatWords`) only when they add a fact the picture doesn't show.
- Caption the words actually spoken, in the audience's spelling. Don't polish slang.

## Motion

- **Punch-in** on the punch word: jump zoom +0.3 with a 0.3 s shake.
- **Zoom-blur** transitions (`Punch enter/exit`) between full-screen sections; hard cuts with a white `Flash`
  (0.3 to 0.5 strength) inside beat sections; full-strength flash on the drop.
- **Beat pulse:** after the drop, the top card scales 1.4% on every beat and kicks 9% on every cut.
- **Glitch** (RGB-split drop-shadows and a horizontal jitter for 4 frames) only for game or high-energy sections.
- **Light leak** at 50% opacity, under 0.6 s, on 2 to 3 big moments only.
- Film grain and a soft vignette over everything (`Finish`).

## Titles and Cards

- `TitleSlam` at each new section: a small label pill ("LIVE DEMO", "BONUS ROUND") and a huge word, 12 characters or
  fewer so it fits at 100 px. Neon variant for game content.
- `Notification` for a news hook, `BadgePill` for credits ("Built with ..."), `ProductCard` when a product is
  named, `TaskCard` for "what got built" lists that tick on beats, `OutroCard` with a tapped Follow button.
- Glass surfaces (blurred, translucent, thin white border) everywhere for a consistent premium look.
- Brand logos must be real files (Wikimedia Commons, press kits) and recoloured for dark backgrounds, never redrawn.
- Avoid red or orange text for titles and captions; it read as cheap. Use one accent colour from the brand.

## Music and Pacing

- Find the drop with `beats.py` and put it on the main reveal (usually 12 to 15 s in). Before the drop, music sits
  low under the voice (volume about 0.2); a riser and a 3-2-1 countdown on the last 3 beats lead into it.
- After the drop, every cut lands on the beat grid: every 4 beats for demos, every 2 beats for high energy.
- Fade the music over the last 1.2 s; end on a hit.

## Sound Design

Every visual event gets a sound: whoosh on transitions (start 0.2 s early), hit and boom on the drop, click on
countdown numbers and button taps, pop on badges, chirp on notifications, sword slash or glitch on game cuts. See
`sound.md` for the measured picks. Keep effects 6 to 12 dB under the voice.

## Honesty

- Anything on screen must be true: claims, numbers, feature lists, "no controllers" style lines. If the footage
  doesn't prove it and the person didn't say it, ask.
- A notification-style card is a stylised graphic of real news; don't fake messages from real companies about
  things that didn't happen.
- Licensed images that require credit (CC BY, CC BY-SA) get a credit line in the post caption.

## Rejected Before (Avoid)

- Static outlined captions and hard cuts with no motion or sound design.
- Captions placed between panels covering hands or faces.
- Gradient-coloured caption words (invisible on white walls).
- Titles wider than the frame, light leaks washing out the reveal, words overlapping because the newest word grew.
- A video that froze for 2 s because overlays were chained over clips with mixed colour ranges.
