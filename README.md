# Reel Studio

A Claude Code skill that edits your raw clips into a creator-grade vertical video for Instagram Reels, TikTok or
YouTube Shorts, then writes the post caption.

Tell Claude something like "make a reel from the clips in this folder" and it will:

- watch your clips and suggest a sequence and script;
- time captions to your voice word by word with Whisper, with keywords on an accent pill;
- build split screens, title slams, notification and product cards, countdowns and a Follow-button outro;
- pull real brand logos from Wikimedia Commons and free music and sound effects from Mixkit;
- cut on the beat of the music, with the drop on your big reveal;
- add face-tracked effects such as a spotlight with a glowing word behind your head;
- export one version with music and one without (for trending audio), loudness-normalised;
- write the caption, hashtags and any credits you need to post.

## Install

In Claude Code:

```text
/plugin marketplace add jkugsiya/reel-studio
/plugin install reel-studio@reel-studio
```

Or copy the skill folder by hand:

```bash
git clone https://github.com/jkugsiya/reel-studio
cp -R reel-studio/skills/reel-studio ~/.claude/skills/reel-studio
```

The first time you use it, Claude checks what's missing and asks before installing anything:

- ffmpeg, ImageMagick and whisper.cpp (through Homebrew on a Mac);
- a ~550 MB Whisper speech model;
- a Python environment for the effects and beat detection;
- Remotion and React for each video project (~200 MB of packages).

Node.js 18+ and Python 3.10+ are needed. It's built and tested on macOS; Linux works with manual installs.

## Use

```text
Edit the clips in ~/Videos/launch into a 30-second reel. Hook is the clip where I say we launched.
Match the style of https://www.instagram.com/reel/your_reference_id/
```

Claude shows you the plan, renders preview frames, then the final files. Ask for changes in plain words
("the caption covers my hands", "make the hook faster").

## Licenses

- This skill: MIT.
- Bundled face-tracked effects: [claude-video-effects](https://github.com/Vibha-Ramprakash/claude-video-effects) by
  Vibha Ramprakash (MIT), with OpenCV YuNet (MIT), MediaPipe Selfie Segmenter (Apache 2.0) and fonts under the SIL
  OFL and Apache 2.0. See `skills/reel-studio/effects/CREDITS.md`. Vibha's full studio is at
  [vibha.is](https://vibha.is/ai-video-studio).
- [Remotion](https://www.remotion.dev/license) is free for individuals and companies of up to 3 people; larger
  companies need a Remotion company license.
- Logos and images you fetch keep their own licenses; Claude reports each one and adds required credits to the caption.
- Mixkit music and sound effects are free to use inside your videos under the Mixkit License.
