// Caption data: chunks of 1 to 4 words that appear as they are spoken.
export type Word = { t: number; text: string; hl?: boolean }; // t = reel second the word is spoken
export type Chunk = { words: Word[]; end: number }; // the chunk shows from its first word until `end`

/** Output of scripts/transcribe.py (times in clip seconds). */
export type WordsFile = { words: { t: number; end: number; text: string }[] };

type Options = {
  reelStart: number; // reel second where the clip starts playing
  trimBefore?: number; // clip second that plays at reelStart
  until?: number; // drop words spoken after this reel second (clip cut short)
  maxWords?: number; // words per chunk
  highlight?: string[]; // words drawn on the accent pill, matched case-insensitively
  upper?: boolean;
};

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}']/gu, "");

/**
 * Turns a transcribe.py words file into caption chunks on the reel timeline.
 * A new chunk starts after `maxWords` words, after a pause over 0.35 s, or after sentence punctuation.
 */
export const toChunks = (file: WordsFile, o: Options): Chunk[] => {
  const { reelStart, trimBefore = 0, until = Infinity, maxWords = 3, highlight = [], upper = true } = o;
  const hl = new Set(highlight.map(norm));
  const words = file.words
    .map((w) => ({ ...w, t: w.t - trimBefore + reelStart, end: w.end - trimBefore + reelStart }))
    .filter((w) => w.t >= reelStart - 0.05 && w.t < until);
  const groups: (typeof words)[] = [];
  for (const w of words) {
    const cur = groups[groups.length - 1];
    const prev = cur?.[cur.length - 1];
    if (!cur || cur.length >= maxWords || w.t - prev.end > 0.35 || /[.!?,;:]$/.test(prev.text)) groups.push([w]);
    else cur.push(w);
  }
  return groups.map((g, i) => ({
    words: g.map((w) => ({ t: w.t, text: upper ? w.text.toUpperCase() : w.text, hl: hl.has(norm(w.text)) })),
    end: i < groups.length - 1 ? groups[i + 1][0].t : Math.min(until, g[g.length - 1].end + 0.4),
  }));
};

/** Hand-timed words, e.g. punch lines that land on beats: [[second, "WORD", highlighted?], ...]. */
export const beatWords = (words: [number, string, boolean?][], end: number): Chunk[] => [
  { words: words.map(([t, text, hl]) => ({ t, text, hl })), end },
];
