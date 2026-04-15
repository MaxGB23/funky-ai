/**
 * sass-importer.ts — Stub for scss-vars strategy
 *
 * The legacy version used `file-importer` to resolve @import statements
 * across SCSS files. That dependency is not included in v2 (it is a
 * transitive npm library that requires native bindings).
 *
 * scss-vars.js already wraps parseImports() in a try/catch and falls back
 * to parsing the local document text when the import fails. This stub
 * always resolves with importerOptions.data so the fallback path is used
 * cleanly — no crashes, no unresolved modules.
 *
 * Future work: replace with a pure-TS glob resolver if cross-file
 * SCSS variable resolution is required.
 */

export interface SassImporterOptions {
  data: string;
  cwd: string;
  extensions: string[];
  includePaths: string[];
}

/**
 * Stub implementation: returns the source text as-is.
 * scss-vars.js will parse local variables from it without attempting
 * to resolve external @imports.
 */
export async function parseImports(options: SassImporterOptions): Promise<string> {
  return options.data;
}
