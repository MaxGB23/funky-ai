import path from 'node:path';
import { seedForPosture, isPlaceholder, deepEqual } from './secureYaml.js';

// R8 — Marcador de idempotencia para AGENTS.md (design: marker + 3 líneas).
export const AGENTS_MARKER = '<!-- funky-secure -->';

// R8 — Bloque byte-exacto (golden del diseño): marker + política de package
// manager. Idempotencia = contiene el marker; nunca se duplica.
export const AGENTS_BLOCK = `${AGENTS_MARKER}
## Package manager
Use \`pnpm\` for all package operations; do not use \`npm\` or \`yarn\`.
Standard: run \`funky secure check\`.
`;

// R6 — Comando exacto que doctor recomienda para activar la cuarentena global.
// (pnpm 11: `config set` con --location=global escribe en la config del user.)
export const QUARANTINE_CMD = 'pnpm config set minimum-release-age 4320 --location=global';

/**
 * R8 — Inyección conservadora en AGENTS.md.
 * - ausente → bloque golden.
 * - con marcador → no-op (idempotente, sin duplicación).
 * - sin marcador → conserva TODO el contenido y appenda el bloque al final.
 * (El warn/confirm previo es responsabilidad del handler de init.)
 *
 * @param {string | null} content - Contenido actual de AGENTS.md.
 * @returns {{ content: string, changed: boolean }}
 */
export function ensureAgentsBlock(content) {
  if (!content) return { content: AGENTS_BLOCK, changed: true };
  if (content.includes(AGENTS_MARKER)) return { content, changed: false };
  const separator = content.endsWith('\n') ? '' : '\n';
  return { content: `${content}${separator}${AGENTS_BLOCK}`, changed: true };
}

/**
 * R9 — Pin de packageManager en package.json.
 * JSON.parse/stringify 2-space (convención repo); valor = `pnpm@<activo>`.
 * Campo distinto → warn + keep (conflicted), sin sobreescribir.
 *
 * @param {object} pkgJson - package.json parseado.
 * @param {string} activeVersion - Versión de pnpm activa (probe).
 * @returns {{ content: string, changed: boolean, conflicted: boolean }}
 */
export function pinPackageManager(pkgJson, activeVersion) {
  const pin = `pnpm@${activeVersion}`;
  if (pkgJson.packageManager === pin) {
    return { content: `${JSON.stringify(pkgJson, null, 2)}\n`, changed: false, conflicted: false };
  }
  const conflicted = pkgJson.packageManager !== undefined;
  const next = { ...pkgJson, packageManager: conflicted ? pkgJson.packageManager : pin };
  return {
    content: `${JSON.stringify(next, null, 2)}\n`,
    changed: !conflicted,
    conflicted,
  };
}

// R6/R11 — Claves de ruido del probe `pnpm config list --json` (design).
const CONFIG_NOISE = new Set(['json', 'registry', 'userAgent', 'packages']);

// R6/R11 — pnpm 10.x emite las claves estándar en kebab-case; 11.x en camelCase
// (empírica de verify: `config list --json` en 10.23.0 vs 11.5.0). Se normalizan
// para que doctor/check lean el estado real sin importar la versión del gestor.
const KEBAB_TO_CAMEL = {
  'allow-builds': 'allowBuilds',
  'block-exotic-subdeps': 'blockExoticSubdeps',
  'engine-strict': 'engineStrict',
  'ignore-scripts': 'ignoreScripts',
  'minimum-release-age': 'minimumReleaseAge',
  'trust-policy': 'trustPolicy',
  'verify-store-integrity': 'verifyStoreIntegrity',
  'strict-dep-builds': 'strictDepBuilds',
  'only-built-dependencies': 'onlyBuiltDependencies',
  'ignored-built-dependencies': 'ignoredBuiltDependencies',
};

/**
 * R6/R11 — Parsea la salida de `pnpm config list --json`, filtra el ruido
 * (json/registry/userAgent/packages) y normaliza las claves kebab-case de
 * pnpm 10.x a camelCase (11.x) para una lectura cross-version del estado.
 *
 * @param {string} stdout
 * @returns {Record<string, unknown> | null}
 */
export function parseConfigList(stdout) {
  try {
    const parsed = JSON.parse(stdout);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    const clean = {};
    for (const [key, value] of Object.entries(parsed)) {
      const canonical = KEBAB_TO_CAMEL[key] ?? key;
      if (!CONFIG_NOISE.has(canonical)) clean[canonical] = value;
    }
    return clean;
  } catch {
    return null;
  }
}

/**
 * R6 — Deduplica las rutas de `where pnpm`: en win32 un mismo install aparece
 * como <dir>/pnpm y <dir>/pnpm.CMD (shim de la misma instalación). Mismo
 * directorio + mismo nombre base → una sola instalación (case-insensitive en
 * win32); directorios distintos → instalaciones distintas (≥2 → WARNING R6).
 *
 * @param {string[]} paths
 * @returns {string[]}
 */
export function dedupeWherePaths(paths) {
  const seen = new Set();
  const out = [];
  for (const p of paths) {
    const ext = path.extname(p);
    const stem = ext ? p.slice(0, -ext.length) : p;
    let key = `${path.dirname(stem)}${path.sep}${path.basename(stem)}`;
    if (process.platform === 'win32') key = key.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(p);
  }
  return out;
}

/**
 * R6 — Cuarentena conductual activa si hay env var global
 * (pnpm_config_minimum_release_age) o la clave YAML por repo.
 *
 * @param {Record<string, unknown> | null} effectiveConfig
 * @param {Record<string, string | undefined>} env
 * @returns {boolean}
 */
export function isQuarantineActive(effectiveConfig, env) {
  if (env.pnpm_config_minimum_release_age !== undefined) return true;
  if (effectiveConfig && effectiveConfig.minimumReleaseAge !== undefined) return true;
  return false;
}

/**
 * R6 — Agregador de findings de `doctor` (diagnóstico; nada se escribe).
 * exit 0 del comando cuando el diagnóstico completa; severities solo informan.
 *
 * @param {object} input
 * @param {string} input.activeVersion - Versión activa de pnpm (probe).
 * @param {string[]} input.duplicates - Versiones/instalaciones distintas en PATH.
 * @param {Record<string, unknown> | null} input.effectiveConfig - Config filtrada.
 * @param {boolean} input.quarantineActive
 * @param {object} input.repoSignals - Señales de drift del repo (lecturas del handler).
 * @returns {Array<{ severity: 'info' | 'warning', text: string }>}
 */
export function diagnose({ activeVersion, duplicates, effectiveConfig, quarantineActive, repoSignals = {} }) {
  const findings = [{ severity: 'info', text: `pnpm activo: ${activeVersion}` }];

  if (duplicates.length >= 2) {
    findings.push({
      severity: 'warning',
      text: `Se detectaron ${duplicates.length} instalaciones de pnpm duplicadas en el PATH (${duplicates.join(', ')}). Usa una sola (preferible standalone).`,
    });
  }

  if (quarantineActive) {
    const value = effectiveConfig?.minimumReleaseAge ?? 'env';
    findings.push({
      severity: 'info',
      text: `Cuarentena conductual activa (minimumReleaseAge: ${value}).`,
    });
  } else {
    findings.push({
      severity: 'warning',
      text: `Cuarentena conductual INACTIVA: nada bloquea dependencias <72h. Aplica: ${QUARANTINE_CMD}.`,
    });
  }

  if (repoSignals.placeholder) {
    findings.push({
      severity: 'warning',
      text: 'allowBuilds tiene aprobación pendiente (placeholder de pnpm): revisa pnpm-workspace.yaml.',
    });
  }
  if (repoSignals.packageLock) {
    findings.push({
      severity: 'warning',
      text: 'package-lock.json presente: proyecto npm en repo pnpm (drift de lockfiles).',
    });
  }
  if (repoSignals.floatingRanges) {
    findings.push({
      severity: 'warning',
      text: 'Rangos flotantes (^/~) en package.json: inmutabilidad frágil.',
    });
  }
  if (repoSignals.envTracked && repoSignals.envTracked.length > 0) {
    findings.push({
      severity: 'warning',
      text: `.env* trackeado por git: ${repoSignals.envTracked.join(', ')} (secreto en historial).`,
    });
  }
  if (repoSignals.hooksSeeded && repoSignals.hooksDrift && repoSignals.hooksDrift.length > 0) {
    findings.push({
      severity: 'warning',
      text: `Drift de hooks vs baseline: ${repoSignals.hooksDrift.join(', ')} (rebasi con --rebaseline si es legítimo).`,
    });
  }
  if (repoSignals.agentsMarked === false) {
    findings.push({
      severity: 'info',
      text: 'AGENTS.md sin marcador funky-secure: inicia con `funky secure init`.',
    });
  }

  return findings;
}

/**
 * R11 — Rangos flotantes (^/~) en las secciones de dependencias de package.json.
 * @param {object | null} pkgJson
 * @returns {string[]} - Nombres/versiones flotantes detectados.
 */
export function floatingRanges(pkgJson) {
  const ranges = [];
  for (const section of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
    if (pkgJson && pkgJson[section]) {
      for (const [name, range] of Object.entries(pkgJson[section])) {
        if (typeof range === 'string' && /^[~^]/.test(range)) ranges.push(`${name}@${range}`);
      }
    }
  }
  return ranges;
}

/**
 * R10/R11 — Evaluador de `check`: convierte lecturas (fs + probes) en
 * violaciones. Repos npm/yarn (sin pnpm-workspace.yaml) → warnOnly, exit 0.
 *
 * @param {object} input - Lecturas crudas resueltas por el handler.
 * @param {boolean} input.hasPnpmWorkspace
 * @param {boolean} input.hasPnpmLockfile
 * @param {boolean} input.hasPackageLock
 * @param {boolean} input.hasYarnLock
 * @param {object | null} input.pkgJson
 * @param {Record<string, unknown> | null} input.effectiveConfig
 * @param {boolean} input.quarantineActive
 * @param {string[]} input.trackedEnvFiles
 * @param {boolean} input.envUnignored
 * @param {string[]} input.hooksDrift
 * @param {'fail-silent' | 'fail-fast'} input.posture
 * @returns {{ violations: Array<{ code: string, detail: string }>, warnOnly: boolean }}
 */
export function evaluate({
  hasPnpmWorkspace,
  hasPnpmLockfile,
  hasPackageLock,
  hasYarnLock,
  pkgJson,
  effectiveConfig,
  quarantineActive,
  trackedEnvFiles,
  envUnignored,
  hooksDrift,
  posture,
}) {
  if (!hasPnpmWorkspace && (hasPackageLock || hasYarnLock)) {
    return { violations: [], warnOnly: true };
  }
  if (!hasPnpmWorkspace) {
    return { violations: [], warnOnly: true };
  }

  const violations = [];

  if (!hasPnpmLockfile) {
    violations.push({ code: 'missing-lockfile', detail: 'pnpm-lock.yaml ausente: sin lockfile no hay inmutabilidad reproducible.' });
  }
  if (hasPackageLock) {
    violations.push({ code: 'package-lock', detail: 'package-lock.json presente en repo pnpm: mezcla npm/pnpm.' });
  }

  const ranges = floatingRanges(pkgJson);
  if (ranges.length > 0) {
    violations.push({ code: 'floating-ranges', detail: `Rangos flotantes (^/~) en package.json: ${ranges.join(', ')}.` });
  }

  const seed = seedForPosture(posture);
  const mismatched = [];
  for (const [key, value] of Object.entries(seed)) {
    const current = effectiveConfig ? effectiveConfig[key] : undefined;
    if (key === 'allowBuilds' && isPlaceholder(current)) continue; // → pending-approval
    if (!deepEqual(current, value)) mismatched.push(key);
  }
  if (mismatched.length > 0) {
    violations.push({ code: 'config-mismatch', detail: `Claves estándar (postura ${posture}) ausentes o distintas: ${mismatched.join(', ')}.` });
  }

  if (effectiveConfig && isPlaceholder(effectiveConfig.allowBuilds)) {
    violations.push({ code: 'pending-approval', detail: 'allowBuilds pendiente de aprobación (placeholder de pnpm tras install fallido).' });
  }

  if (!quarantineActive) {
    violations.push({ code: 'quarantine-inactive', detail: `Cuarentena conductual inactiva. Aplica: ${QUARANTINE_CMD}.` });
  }

  if (trackedEnvFiles.length > 0) {
    violations.push({ code: 'env-tracked', detail: `.env* trackeado por git: ${trackedEnvFiles.join(', ')}.` });
  }
  if (envUnignored) {
    violations.push({ code: 'env-unignored', detail: '.env presente sin entrada en .gitignore.' });
  }
  if (hooksDrift.length > 0) {
    violations.push({ code: 'hook-drift', detail: `Hooks cambiados vs baseline: ${hooksDrift.join(', ')}.` });
  }

  return { violations, warnOnly: false };
}
