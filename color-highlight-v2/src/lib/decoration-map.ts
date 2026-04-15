/**
 * decoration-map.ts
 *
 * Manages the lifecycle of VS Code TextEditorDecorationType instances,
 * keyed by color string. Avoids creating duplicate decoration types for the
 * same color by caching them internally.
 *
 * Supported markerType values:
 *   'background'  (default) – colored background with auto-contrast foreground
 *   'outline'               – colored border around the text
 *   'foreground'            – colored text
 *   'underline'             – colored underline (CSS border-bottom trick)
 *   'dot-after'             – small colored dot rendered after the token
 *   'dot-before'            – small colored dot rendered before the token
 *
 * Aliases accepted (legacy compatibility):
 *   'dot', 'dotafter', 'dot_after'  → treated as 'dot-after'
 *   'dotbefore', 'dot_before'       → treated as 'dot-before'
 */

import * as vscode from 'vscode';
import { getColorContrast } from './dynamic-contrast.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type MarkerType =
  | 'background'
  | 'outline'
  | 'foreground'
  | 'underline'
  | 'dot-after'
  | 'dot-before'
  // Legacy aliases kept for configuration compatibility
  | 'dot'
  | 'dotafter'
  | 'dot_after'
  | 'dotbefore'
  | 'dot_before';

export interface DecorationMapOptions {
  /**
   * Whether to color the overview ruler (the minimap gutter) with the matched
   * color. Mirrors the legacy `markRuler` option.
   */
  markRuler: boolean;

  /**
   * The visual style used to indicate a color match.
   * Defaults to 'background' when not provided.
   */
  markerType: MarkerType;
}

// ---------------------------------------------------------------------------
// DecorationMap
// ---------------------------------------------------------------------------

/**
 * A lazily-populated cache of VS Code TextEditorDecorationType objects,
 * one per unique color string. Disposing this map will dispose every
 * decoration type it holds.
 */
export class DecorationMap {
  private readonly options: DecorationMapOptions;

  /**
   * Internal store: color string → TextEditorDecorationType
   */
  private readonly _map: Map<string, vscode.TextEditorDecorationType>;

  /**
   * Ordered list of all color strings registered so far.
   * Kept separate so callers can iterate without exposing the Map directly.
   */
  private readonly _keys: string[];

  constructor(options: Partial<DecorationMapOptions> = {}) {
    this.options = {
      markRuler: options.markRuler ?? false,
      markerType: options.markerType ?? 'background',
    };
    this._map  = new Map<string, vscode.TextEditorDecorationType>();
    this._keys = [];
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  /**
   * Return (or lazily create) the TextEditorDecorationType for the given color.
   *
   * @param color - Any valid CSS color string (hex, rgb, rgba, …).
   *                Must be consistent in casing/format across calls because it
   *                is used as the cache key verbatim.
   */
  get(color: string): vscode.TextEditorDecorationType {
    if (!this._map.has(color)) {
      const decorationType = vscode.window.createTextEditorDecorationType(
        this._buildRenderOptions(color)
      );
      this._map.set(color, decorationType);
      this._keys.push(color);
    }

    // Non-null assertion is safe: we just ensured the key exists above.
    return this._map.get(color)!;
  }

  /**
   * Returns a snapshot of the registered color keys.
   * The returned array is a copy — mutating it has no effect on the map.
   */
  keys(): string[] {
    return this._keys.slice();
  }

  /**
   * Disposes every TextEditorDecorationType held by this map, clearing all
   * decorations from the editor. Should be called when the parent
   * DocumentHighlight is disposed.
   */
  dispose(): void {
    this._map.forEach((decoration) => decoration.dispose());
    this._map.clear();

    // Reset keys so a disposed map doesn't leak stale strings
    this._keys.length = 0;
  }

  // -------------------------------------------------------------------------
  // Private helpers
  // -------------------------------------------------------------------------

  /**
   * Build the DecorationRenderOptions object for a given color string,
   * taking `markerType` and `markRuler` into account.
   *
   * Mirrors the switch/case logic from legacy decoration-map.js exactly, with
   * the ruler rule applied orthogonally on top of any markerType.
   */
  private _buildRenderOptions(
    color: string
  ): vscode.DecorationRenderOptions {
    const rules: vscode.DecorationRenderOptions = {};

    // Overview ruler is independent of markerType
    if (this.options.markRuler) {
      rules.overviewRulerColor = color;
      rules.overviewRulerLane  = vscode.OverviewRulerLane.Right;
    }

    switch (this.options.markerType) {
      // ── Outline ────────────────────────────────────────────────────────
      case 'outline':
        rules.border       = `3px solid ${color}`;
        break;

      // ── Foreground (text color) ─────────────────────────────────────────
      case 'foreground':
        rules.color = color;
        break;

      // ── Underline (CSS border-bottom trick, preserves original color) ──
      case 'underline':
        // The legacy uses the `color` property as a CSS injection vector.
        // This is a well-known pattern for VS Code underline decorations:
        // setting an invalid color text forces VS Code to accept the rest
        // of the semicolon-separated style as raw CSS.
        rules.color = `invalid; border-bottom: solid 2px ${color}`;
        break;

      // ── Dot After ──────────────────────────────────────────────────────
      case 'dot':
      case 'dotafter':
      case 'dot-after':
      case 'dot_after':
        rules.after = {
          contentText:     ' ',
          margin:          '0.1em 0.2em 0 0.2em',
          width:           '0.7em',
          height:          '0.7em',
          backgroundColor: color,
          // borderRadius is not in the official vscode type, but we can inject
          // it via textDecoration using the CSS semicolon hack (same pattern
          // used by the underline markerType in the legacy implementation).
          textDecoration:  'none; border-radius: 50%',
        };
        break;

      // ── Dot Before ─────────────────────────────────────────────────────
      case 'dotbefore':
      case 'dot-before':
      case 'dot_before':
        rules.before = {
          contentText:     ' ',
          margin:          '0.1em 0.2em 0 0.2em',
          width:           '0.7em',
          height:          '0.7em',
          backgroundColor: color,
          textDecoration:  'none; border-radius: 50%',
        };
        break;

      // ── Background (default) ────────────────────────────────────────────
      case 'background':
      default:
        rules.backgroundColor = color;
        rules.color           = getColorContrast(color);
        rules.border          = `3px solid ${color}`;
        rules.borderRadius    = '3px';
        break;
    }

    return rules;
  }
}
