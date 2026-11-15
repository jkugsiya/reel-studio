import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

// Change these per brand. ACCENT drives caption pills, titles, buttons and glows.
export const ACCENT = "#0A7CFF";
export const ACCENT_GRADIENT = "linear-gradient(95deg, #0064E0 0%, #0A84FF 45%, #3FD0FF 100%)";
export const ACCENT_GLOW = "rgba(10,124,255,0.45)";
export const SECOND_ACCENT = "#D97757"; // badges and task cards (e.g. a tool or partner brand)

export const HEAVY = loadMontserrat("normal", { weights: ["700", "800", "900"], subsets: ["latin"] }).fontFamily;
export const UI = loadInter("normal", { weights: ["500", "600", "700", "800"], subsets: ["latin"] }).fontFamily;

export const BG = "#05070B";
export const GLASS_BG = "rgba(18, 22, 30, 0.58)";
export const GLASS_BORDER = "rgba(255, 255, 255, 0.16)";
// Bold display text that stays readable on bright footage.
export const TEXT_SHADOW = "0 4px 0 rgba(0,0,0,0.35), 0 0 26px rgba(0,0,0,0.65), 0 10px 40px rgba(0,0,0,0.55)";
