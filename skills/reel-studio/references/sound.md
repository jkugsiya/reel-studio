# Music and Sound Effects

All files come from Mixkit (mixkit.co). The Mixkit License allows use inside social videos, commercial or personal,
without credit. Don't redistribute the files on their own.

Download a sound effect with `python3 SKILL_DIR/scripts/fetch_audio.py get sfx <id> <project>/public/sfx/s<id>.mp3`.

## Measured Sound Effects

Each was measured for length and where its peak sits. "Start" says how early to place it so the peak lands on the event.

| Id | Role | Length | Peak | Start |
|---|---|---|---|---|
| 166 | Short whoosh for cuts and transitions | 0.8 s | 0.2 s | 0.2 s before the cut |
| 168 | Slightly longer whoosh | 0.9 s | 0.3 s | 0.3 s before |
| 1484 | Air sweep with a tail | 4.0 s | 0.5 s | 0.5 s before |
| 1490 | Reverse whoosh that cuts off (suck-in) | 1.8 s | 0.7 s | 0.7 s before |
| 2719 | Long riser that peaks and cuts | 13.4 s | 6.9 s | Trim 4.0 s, start 2.9 s before the drop, end it at the drop |
| 1143 | Low boom (sub impact) | 4.1 s | 0.5 s | 0.45 s before the hit |
| 2608 | Short punchy hit | 1.3 s | 0.4 s | 0.4 s before |
| 1287 | Big sustained cinematic impact | 4.8 s | 1.0 s | 1.0 s before |
| 2055 | Notification chirp | 2.2 s | 0.2 s | 0.1 s before the card lands |
| 2569 | Single soft chime | 1.3 s | 0.0 s | On the event |
| 2574 | UI click (countdown numbers, button taps) | 2.4 s | 0.1 s | On the event |
| 2576 | Softer UI select (checklist ticks) | 2.2 s | 0.1 s | On the event |
| 2073 | Tiny pop (badges, stickers) | 0.3 s | 0.0 s | On the event |
| 2350 | Light pop-whoosh (cards appearing) | 3.5 s | 0.4 s | 0.4 s before |
| 1328 | Sword slash (game cuts) | 3.6 s | 0.85 s | 0.85 s before |
| 2353 | Glitch sweep (into a game or tech section) | 4.8 s | 0.9 s | 0.9 s before |
| 2701 | Aircraft flyby bed | 22.8 s | flat | Low volume under flight footage |

Volumes that worked: whooshes 0.35 to 0.55, impacts 0.75 to 0.85, clicks 0.5 to 0.7, pops 0.45 to 0.7.

## Picking Music

1. `fetch_audio.py list music electronica` (also `mood/energetic`, `trap`, `tag/technology`) and download 6 to 10
   candidates with `fetch_audio.py get music <id> work/music/m<id>.mp3`.
2. `<PYTHON> SKILL_DIR/scripts/beats.py work/music/*.mp3`. Prefer a track with a quiet intro of 10 to 16 s, then a
   clear jump to a steady loud section (the drop), at 115 to 130 BPM.
3. Start the track at `drop_beat - <reel second of the reveal>` so the drop lands on the reveal.
4. You can't hear the result. Say so, and always export the no-music version too.

A tested pick: Mixkit music id 132 (electronic, about 122 BPM, drop at 15.97 s after a 15 s build).

## Mix

- Voice at full volume. Music 0.2 under speech, rising to about 0.42 through the countdown, 0.8 to 0.9 after the drop.
- Game or engine audio from screen recordings at about 0.22 under the music.
- `finish.sh` normalises to about -14 LUFS.
