/**
 * dynamic-contrast.ts
 *
 * Returns a suggested contrast greyscale color (#FFFFFF or #000000) for the
 * given color string (hex / rgb / rgba).
 *
 * Uses the definitions of relative luminance and contrast ratio from
 * WCAG 2.0: https://www.w3.org/TR/WCAG20
 *
 * NOTE: Named CSS colors (e.g. "blue") are intentionally NOT supported here.
 * Our strategies always produce computed hex/rgb values, so the fallback
 * to #000000 is safe for any edge case that slips through.
 */

// ---------------------------------------------------------------------------
// sRGB → linear RGB lookup table (computed once at module load)
// ---------------------------------------------------------------------------

const srgbLookupTable = new Float64Array(256);
(function buildLookupTable() {
  for (let i = 0; i < 256; ++i) {
    const c = i / 255.0;
    srgbLookupTable[i] = c <= 0.04045
      ? c / 12.92
      : Math.pow((c + 0.055) / 1.055, 2.4);
  }
})();

/**
 * Convert a single 8-bit sRGB channel value to its linear-RGB equivalent.
 * Uses a lookup table to avoid re-computing the gamma curve on every call.
 */
function srgb8ToLinear(c8: number): number {
  const index = Math.min(Math.max(c8, 0), 255) & 0xff;
  return srgbLookupTable[index];
}

/**
 * Compute the relative luminance of an sRGB color (WCAG 2.0 §1.4.3).
 */
function relativeLuminance(r8: number, g8: number, b8: number): number {
  const bigR = srgb8ToLinear(r8);
  const bigG = srgb8ToLinear(g8);
  const bigB = srgb8ToLinear(b8);
  return 0.2126 * bigR + 0.7152 * bigG + 0.0722 * bigB;
}

/**
 * Compute the contrast ratio between two relative luminances (WCAG 2.0).
 * Order of arguments is commutative.
 */
function contrastRatio(l1: number, l2: number): number {
  if (l2 < l1) {
    return (0.05 + l1) / (0.05 + l2);
  } else {
    return (0.05 + l2) / (0.05 + l1);
  }
}

// ---------------------------------------------------------------------------
// Regex constants (compiled once)
// ---------------------------------------------------------------------------

const RGB_EXP = /^rgba?[\s+]?\(\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*,\s*([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])\s*(?:,\s*[\d.]+\s*)?\)/im;
const HEX_EXP = /^(?:#)|([a-fA-F0-9]{3}|[a-fA-F0-9]{6})$/gm;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Given a color string (hex or rgb/rgba), returns '#FFFFFF' or '#000000' —
 * whichever has the higher WCAG 2.0 contrast ratio against it.
 *
 * @param color - A valid hex (`#RGB`, `#RRGGBB`) or functional CSS color
 *                (`rgb(…)`, `rgba(…)`) string.
 * @returns '#FFFFFF' or '#000000'
 */
export function getColorContrast(color: string): string {
  let r: number;
  let g: number;
  let b: number;

  const rgb = color.match(RGB_EXP);
  if (rgb) {
    r = parseInt(rgb[1], 10);
    g = parseInt(rgb[2], 10);
    b = parseInt(rgb[3], 10);
  } else {
    // Reset lastIndex because HEX_EXP has the `g` flag
    HEX_EXP.lastIndex = 0;
    const hexMatches = color.match(HEX_EXP);
    if (hexMatches) {
      let hex = hexMatches.length > 1 ? hexMatches[1] : hexMatches[0];
      // Strip leading '#' if present
      hex = hex.replace('#', '');
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      r = parseInt(hex.substring(0, 2), 16);
      g = parseInt(hex.substring(2, 4), 16);
      b = parseInt(hex.substring(4, 6), 16);
    } else {
      // Unrecognised format — safe fallback
      return '#000000';
    }
  }

  const luminance      = relativeLuminance(r, g, b);
  const luminanceWhite = 1.0; // relativeLuminance(255, 255, 255) by definition
  const luminanceBlack = 0.0; // relativeLuminance(0,   0,   0)   by definition

  const contrastWhite = contrastRatio(luminance, luminanceWhite);
  const contrastBlack = contrastRatio(luminance, luminanceBlack);

  return contrastWhite > contrastBlack ? '#FFFFFF' : '#000000';
}
