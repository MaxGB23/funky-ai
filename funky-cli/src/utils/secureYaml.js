import fs from 'fs';
import { Document, parseDocument } from 'yaml';

// R3 — Seed estándar de las 7 claves (deny-by-default: allowBuilds: []).
export const STANDARD_KEYS = {
  ignoreScripts: true,
  minimumReleaseAge: 4320,
  engineStrict: true,
  blockExoticSubdeps: true,
  trustPolicy: 'no-downgrade',
  verifyStoreIntegrity: true,
  allowBuilds: [],
};

// R3 — Postura fail-fast: builds estrictos además del seed estándar.
// Ortografía confirmada por el behavioral spike (design): camelCase top-level.
export const FAIL_FAST_KEYS = {
  strictDepBuilds: true,
  onlyBuiltDependencies: [],
  ignoredBuiltDependencies: [],
};

// Hallazgo spike: un install fallido muta pnpm-workspace.yaml con
// `allowBuilds: {<name>: "set this to true or false"}` (pendiente de
// aprobación). El merge lo tolera y doctor/check lo flaggean (design, Riesgos).
export const PLACEHOLDER = 'set this to true or false';

/**
 * Seed de claves para una postura (R3/R7). Lanza ante posturas desconocidas.
 * @param {string} posture - 'fail-silent' | 'fail-fast'
 * @returns {Record<string, unknown>}
 */
export function seedForPosture(posture) {
  if (posture === 'fail-silent') {
    return { ...STANDARD_KEYS };
  }
  if (posture === 'fail-fast') {
    return { ...STANDARD_KEYS, ...FAIL_FAST_KEYS };
  }
  throw new Error(`Postura desconocida: "${posture}". Usa fail-silent o fail-fast.`);
}

/**
 * True si el valor es el placeholder de aprobación pendiente de pnpm (string
 * o mapa de nombres → placeholder).
 * @param {unknown} value
 */
export function isPlaceholder(value) {
  if (value === PLACEHOLDER) return true;
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.values(value).every((v) => v === PLACEHOLDER);
  }
  return false;
}

function deepEqual(a, b) {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => deepEqual(v, b[i]));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a);
    const kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => deepEqual(a[k], b[k]));
  }
  return false;
}

export { deepEqual };

/**
 * Merge idempotente del seed de postura sobre pnpm-workspace.yaml (R2):
 * - faltantes → se añaden (added)
 * - iguales → no-op (kept)
 * - distintas → se conservan + warn (conflicted)
 * - placeholder allowBuilds → se conserva + flag (pending)
 * - YAML inválido → lanza (el comando aborta con exit 1)
 * - archivo ausente → seed estándar sin `packages:` sintetizado
 *
 * @param {string} filePath - Ruta a pnpm-workspace.yaml.
 * @param {string} posture
 * @returns {{ content: string, added: string[], kept: string[], conflicted: string[], pending: string[], existed: boolean }}
 */
export function mergeSeed(filePath, posture) {
  const seed = seedForPosture(posture);
  const raw = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : null;

  if (raw === null) {
    const doc = new Document(seed);
    return {
      content: `${doc.toString().trimEnd()}\n`,
      added: Object.keys(seed),
      kept: [],
      conflicted: [],
      pending: [],
      existed: false,
    };
  }

  const doc = parseDocument(raw);
  if (doc.errors.length > 0) {
    throw new Error(
      `pnpm-workspace.yaml inválido en ${filePath}: ${doc.errors[0].message}`
    );
  }

  // toJS() devuelve valores JS planos: doc.get() devuelve YAMLMap/YAMLSeq
  // (instancias con toJSON) cuyos Object.values revelan slots internos y rompen
  // deepEqual/isPlaceholder. El documento plano es la fuente de comparación.
  const plain = doc.toJS() ?? {};

  const added = [];
  const kept = [];
  const conflicted = [];
  const pending = [];

  for (const [key, value] of Object.entries(seed)) {
    if (!Object.prototype.hasOwnProperty.call(plain, key)) {
      doc.set(key, value);
      added.push(key);
      continue;
    }
    const current = plain[key];
    if (isPlaceholder(current)) {
      pending.push(key);
      continue;
    }
    if (deepEqual(current, value)) {
      kept.push(key);
      continue;
    }
    conflicted.push(key);
  }

  return {
    content: `${doc.toString().trimEnd()}\n`,
    added,
    kept,
    conflicted,
    pending,
    existed: true,
  };
}
