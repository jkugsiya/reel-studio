// Times are reel seconds unless noted. Set TOTAL to the reel length; put section and cut times here.
export const FPS = 30;
export const f = (sec: number) => Math.round(sec * FPS);
/** Sequence props for a [from, to) span in seconds. */
export const span = (from: number, to: number) => ({ from: f(from), durationInFrames: Math.max(1, f(to) - f(from)) });

/**
 * Beat grid from scripts/beats.py: `period` seconds per beat and the drop placed at reel second `drop`.
 * Start the music at (drop_beat - drop) seconds into the track so its drop lands on `drop`.
 */
export const beatGrid = (drop: number, period: number) => ({ drop, period, beat: (k: number) => drop + k * period });

export const TOTAL = 12;
