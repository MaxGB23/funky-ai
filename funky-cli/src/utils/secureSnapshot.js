import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// R4 — Archivos de hooks cuyo baseline de integridad registra init.
export const HOOK_FILES = ['.vscode/tasks.json', '.claude/settings.json'];

/**
 * sha256 hex de un archivo; literal "absent" si no existe o es ilegible (R4).
 * @param {string} filePath
 * @returns {string}
 */
export function hashFile(filePath) {
  try {
    const data = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(data).digest('hex');
  } catch {
    return 'absent';
  }
}

/**
 * Baseline de hooks: { version: 1, baseline: { '<rel>': 'sha256|absent' } } (R4).
 * @param {string[]} [hookFiles] - Rutas relativas a cwd.
 * @param {string} [cwd]
 * @returns {{ version: 1, baseline: Record<string, string> }}
 */
export function buildBaseline(hookFiles = HOOK_FILES, cwd = process.cwd()) {
  const baseline = {};
  for (const rel of hookFiles) {
    baseline[rel] = hashFile(path.join(cwd, rel));
  }
  return { version: 1, baseline };
}

/**
 * Ruta del state file: <cwd>/.funky/secure-state.json (R5: machine-local).
 * @param {string} [cwd]
 * @returns {string}
 */
export function stateFilePath(cwd = process.cwd()) {
  return path.join(cwd, '.funky', 'secure-state.json');
}

/**
 * Lee el state file; null si ausente o JSON inválido (sin baseline → sin drift).
 * @param {string} filePath
 * @returns {{ version: number, baseline: Record<string,string> } | null}
 */
export function readState(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Escribe el state file creando .funky/ recursivamente.
 * @param {object} state
 * @param {string} filePath
 */
export function writeState(state, filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

/**
 * Compara el baseline guardado contra el estado actual: devuelve las rutas con
 * drift (contenido cambiado, creado tras el seed o eliminado). Sin baseline
 * guardado → [] (check solo valida si init sembró el snapshot, R4).
 *
 * @param {{ version: number, baseline: Record<string,string> } | null} state
 * @param {string} [cwd]
 * @returns {string[]}
 */
export function compareBaseline(state, cwd = process.cwd()) {
  const drift = [];
  if (!state || !state.baseline) return drift;
  for (const [rel, expected] of Object.entries(state.baseline)) {
    const actual = hashFile(path.join(cwd, rel));
    if (actual !== expected) {
      drift.push(rel);
    }
  }
  return drift;
}
