# Bundled Effects: Credits

The face-tracked effects in this folder are a copy of **claude-video-effects** by Vibha Ramprakash, used under the MIT License (see `LICENSE` here).

- Source: https://github.com/Vibha-Ramprakash/claude-video-effects (copied from commit 60840acc, 12 November 2026)
- Vibha's full studio (more effects, captions and sound): https://vibha.is/ai-video-studio
- Changes in this copy: only `scripts/fx.py`, `fonts/`, `models/`, `LICENSE` and `requirements.txt` are included. The transcription helper and setup script are replaced by reel-studio's own scripts.

Third-party parts keep their own licenses:

- Face tracking: OpenCV YuNet (`models/yunet.onnx`), MIT.
- Person cut-out: MediaPipe Selfie Segmenter (`models/selfie_segmenter.tflite`), Apache License 2.0. See `models/NOTICE.md`.
- Fonts: Archivo Black, Instrument Serif, Space Mono, Inter, Anton, Montserrat and Playfair Display (SIL OFL), Permanent Marker (Apache 2.0). License texts sit in `fonts/`.
