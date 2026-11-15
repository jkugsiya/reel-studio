---
name: reel-studio
description: Edit raw phone clips, screen or headset recordings into a creator-grade vertical video (Instagram Reel, TikTok, YouTube Short) with word-timed animated captions, split-screen B-roll, motion graphics, real brand logos, beat-synced cuts, sound design, face-tracked effects and a ready-to-paste post caption. Use this whenever the user wants to make, cut, edit or improve a reel, short, TikTok or social video from their clips, add captions or subtitles timed to speech, sync cuts to music, match the editing style of a reference reel, or write the caption for a reel they are posting, even if they never say "skill" or name a tool.
---

# Reel Studio

Turn a folder of clips into a vertical video that looks hand-edited by a top creator, then write the post caption.
The person is often not technical: talk about what viewers see and hear, not files or code, and do the work for them.

`SKILL_DIR` is the folder holding this file. Scripts live in `SKILL_DIR/scripts`, the Remotion starter in
`SKILL_DIR/template`, face-tracked effects in `SKILL_DIR/effects`, and deeper guides in `SKILL_DIR/references`.

## The Bar

A plain cut with static subtitles reads as amateur and gets rejected. Every reel gets, at minimum:

- word-by-word captions timed to the voice, keywords on an accent pill;
- a hook in the first 2 seconds (a notification card, a spotlight effect or a title slam);
- motion: punch-ins on key words, zoom-blur transitions, a pulse on every beat after the drop;
- cuts on the beat grid, with a countdown or riser into the music drop;
- sound design under every visual event (whoosh, hit, click, pop);
- real logos or product images when a brand is named, never redrawn look-alikes.

Read `references/style-guide.md` before planning; it holds the editing grammar and the mistakes to avoid.

## 1. Setup (once per machine)

Run `bash SKILL_DIR/scripts/setup.sh --check`. It installs nothing and ends with `READY` or `NOT READY: <items>`.
If anything is missing, tell the person what each item is for and its size, and ask before installing
(`setup.sh --install` uses Homebrew, downloads a ~550 MB Whisper model and makes a Python venv in
`~/.cache/reel-studio`). Remember the `PYTHON=` path it prints: `beats.py` and the effects need that venv.

The first Remotion project on a machine also downloads ~200 MB of npm packages and a headless browser; mention it
in the same ask. Remotion is free for individuals and companies of up to 3 people; larger companies need a
Remotion license, so say so once.

## 2. Understand the Material

1. List the clips with durations and orientation (`ffprobe`). Note which have speech.
2. Look at every clip: `scripts/contact_sheet.sh <clip> 18 <sheet.jpg>` and read the sheet. Use 40 to 60 frames
   for long clips, then a second pass on the promising range (`contact_sheet.sh clip 30 out.jpg 120 220`).
   Note the exact seconds of the best moments and anything to avoid (menus, fail screens, blur).
3. If the person shares a reference reel URL and `yt-dlp` is available, download it to a scratch folder, make a
   contact sheet and detect cuts (`ffmpeg -i ref.mp4 -vf "select='gt(scene,0.3)',showinfo" -f null -`) to learn
   its pacing, layout, caption style and title style. Match the grammar, not the person or brand.
4. Respect the person's clip notes ("use only the named clips", "don't use the full clip").

## 3. Transcribe

For each clip with speech: `python3 SKILL_DIR/scripts/transcribe.py <clip> --lang <code|auto>`.
It writes `<clip>.words.json` with word times rescaled onto the measured speech window.

- Compare against what the person says the clip contains; trust the audio over their paraphrase.
- For Hinglish and other mixed audiences, romanise the words in the JSON (keep the times), in the spelling the
  audience types: "TOH HAMARI TEAM NE", not Devanagari, unless they ask for it.
- Pick 1 keyword per 2 to 3 chunks to highlight (product, claim, punch word). Too many pills read as noise.

## 4. Plan the Sequence and Script

Draft a table the person can read in 20 seconds: time, clip, what's on screen, what's said or shown as text.
Default structure for a 25 to 40 second reel (adapt it, do not force it):

| Part | Length | Purpose |
|---|---|---|
| Hook | 2 to 3 s | The most surprising fact or visual, with a notification card or spotlight |
| Talk | 6 to 10 s | The person explains; captions; split screen once B-roll exists |
| Countdown | 1.5 to 2.5 s | Transition clip, riser, 3-2-1 on beats |
| Demo | 8 to 12 s | Music drop; B-roll on top, person below; cut every 4 beats |
| Bonus or proof | 4 to 7 s | Faster cuts, every 2 beats |
| Outro | 3 to 4 s | Freeze or blur, glass card, call to action, button tap |

Ask only about genuine unknowns (a claim you cannot verify from the footage, a brand to credit, their handle).
Never invent numbers, quotes or features; anything on screen must be true or come from the person.

## 5. Assets, Music and Sound

- Logos and product images: `python3 SKILL_DIR/scripts/fetch_assets.py search "<brand> logo"`, then
  `fetch_assets.py get "File:<name>" <project>/public/assets/<name> --white-text` for dark backgrounds.
  Note each license; CC BY and CC BY-SA images need a credit line in the post caption.
- Music: list candidates (`scripts/fetch_audio.py list music electronica`, `mood/energetic`, `trap`), download 6 to
  10, run `<PYTHON> SKILL_DIR/scripts/beats.py *.mp3` and pick a track with a clear drop and a steady grid.
  Place the drop on the demo reveal. You cannot hear it: say so, and offer a no-music export.
- Sound effects: use the measured picks in `references/sound.md` (ids, roles and timing offsets), saved as
  `public/sfx/s<id>.mp3`.
- Ask before downloading from any new source the person has not approved.

## 6. Face-Tracked Effects (optional)

For talking-head shots, the bundled effects add a strong look before Remotion, for example `spotlight` (room goes
dark, a glowing word behind the head) for hooks. See `references/effects.md` for all 51 effects and the commands.
Always check still frames first, and keep text off faces.

## 7. Build in Remotion

1. `bash SKILL_DIR/scripts/new_project.sh <project_dir>` (copies the template, installs pinned packages).
2. Prepare clips: `bash SKILL_DIR/scripts/prep_clips.sh <project_dir> <input> <name> [--full] [--ss S --t T]`.
   Use `--full` for clips you punch into. Every clip goes through this, because mixed colour ranges break cuts.
3. Render the media-free `Demo` composition once to prove the machine works.
4. Edit `src/Reel.tsx`, `src/timeline.ts` and `src/theme.ts`. `references/components.md` lists every component
   and its props. Keep all times in seconds in one place; put cuts on `beat(k)`.
5. `npm run typecheck`, then `bash SKILL_DIR/scripts/stills.sh <project_dir> <sheet.jpg> <seconds...>` with one
   second per section and one per graphic. Read the sheet and fix: overlapping words, text covering faces,
   titles wider than the frame, unreadable text on bright walls, wrong crop, frozen or black frames.
6. Iterate on stills until clean. A full render costs minutes; stills cost seconds.

## 8. Finish

`bash SKILL_DIR/scripts/finish.sh <project_dir> <output_base>` renders the reel, a voice-and-effects-only version
for trending audio, and normalises both to about -14 LUFS. Then grab 10 to 12 frames from the final file with
ffmpeg, tile them, and check them before you report.

## 9. Report and Post Caption

Report in plain language: what the viewer sees section by section, where the files are, and what the person must
confirm (claims on screen, licenses needing credit, music taste, anything you assumed). Offer quick changes.
When asked for the post caption, follow `references/post-caption.md`.

## Gotchas

- Never chain ffmpeg overlays across clips with different colour ranges or frame rates; that froze video for
  seconds in testing. `prep_clips.sh` normalises everything to 30 fps, tv range.
- whisper.cpp's `-dtw` timing mode returned empty times; the default mode plus rescaling is reliable.
- `interpolate` needs strictly increasing input ranges; guard zero-length fades.
- In Remotion 4, `useVideoConfig().durationInFrames` inside a Sequence is the Sequence's length; graphics rely on it.
- Accent gradients as text colour disappear on white walls. Highlighted words go on a solid accent pill.
- Light leaks at full strength wash out the frame; keep them at about 50% opacity for under 0.6 s.
- Mixkit page titles can be misaligned with their audio files; trust measurements and `references/sound.md`.
