import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, isAbsolute, resolve } from 'node:path';

function pipelineDir(targetBase) {
  return join(targetBase, 'docs', 'funky-ai', 'pipeline');
}

function canvasDir(targetBase) {
  return join(targetBase, 'docs', 'funky-ai', 'canvas');
}

function resolveContextFile(targetBase, contextPath) {
  if (!contextPath) {
    return join(pipelineDir(targetBase), 'context.json');
  }
  return isAbsolute(contextPath) ? contextPath : resolve(targetBase, contextPath);
}

// ── Schema v2 (R-P8) ──

export const PHASE_STATUSES = ['pending', 'running', 'completed', 'failed', 'skipped'];
export const ARTIFACT_KINDS = ['generated', 'living'];

const ASSESS_DEFAULTS = {
  status: 'pending',
  startedAt: null,
  finishedAt: null,
  durationMs: null,
  error: null,
  artifacts: [],
  runAt: null,
  surfacedPatterns: [],
  decisionsFile: null
};

const ESTIMATE_DEFAULTS = {
  status: 'pending',
  startedAt: null,
  finishedAt: null,
  durationMs: null,
  error: null,
  artifacts: [],
  runAt: null
};

/**
 * v2 initial context (R-P8). `currentPhase` is null; every phase holds full
 * state with `status: 'pending'`.
 */
export function initContext() {
  return {
    version: 2,
    createdAt: new Date().toISOString(),
    currentPhase: null,
    assess: { ...ASSESS_DEFAULTS },
    estimate: { ...ESTIMATE_DEFAULTS }
  };
}

/**
 * Pure v1 → v2 migration (R-P9). Preserves createdAt/runAt/decisionsFile,
 * derives surfacedPatterns from dynamicQuestions, derives
 * status:'completed' + finishedAt from a present runAt, and drops the
 * vestigial `pipeline` block. Missing phase objects default to pending v2.
 * Throws on non-object input (malformed v1).
 */
export function migrateV1ToV2(v1) {
  if (v1 === null || typeof v1 !== 'object' || Array.isArray(v1)) {
    throw new TypeError('Invalid v1 context: expected an object');
  }

  const migratePhase = (phaseName, defaults, extra) => {
    const raw = v1[phaseName];
    const runAt = raw && typeof raw.runAt === 'string' ? raw.runAt : null;
    return {
      ...defaults,
      runAt,
      ...(runAt ? { status: 'completed', finishedAt: runAt } : {}),
      ...extra
    };
  };

  return {
    version: 2,
    createdAt: typeof v1.createdAt === 'string' ? v1.createdAt : new Date().toISOString(),
    currentPhase: null,
    assess: migratePhase('assess', ASSESS_DEFAULTS, {
      surfacedPatterns: Array.isArray(v1.assess?.dynamicQuestions) ? v1.assess.dynamicQuestions : [],
      decisionsFile: v1.assess?.decisionsFile ?? null
    }),
    estimate: migratePhase('estimate', ESTIMATE_DEFAULTS, {})
  };
}

function isNullishOr(v, check) {
  return v === null || v === undefined || check(v);
}

function isStringOrNull(v) {
  return isNullishOr(v, (x) => typeof x === 'string');
}

function isNumberOrNull(v) {
  return isNullishOr(v, (x) => typeof x === 'number');
}

function isValidPhase(phase) {
  if (phase === null || typeof phase !== 'object' || Array.isArray(phase)) return false;
  if (!PHASE_STATUSES.includes(phase.status)) return false;
  if (!isStringOrNull(phase.startedAt)) return false;
  if (!isStringOrNull(phase.finishedAt)) return false;
  if (!isNumberOrNull(phase.durationMs)) return false;
  if (!isStringOrNull(phase.error)) return false;
  if (!Array.isArray(phase.artifacts)) return false;
  if (!phase.artifacts.every(
    (a) => a && typeof a === 'object' && typeof a.name === 'string' && typeof a.path === 'string' && ARTIFACT_KINDS.includes(a.kind)
  )) return false;
  if (!isStringOrNull(phase.runAt)) return false;
  return true;
}

/**
 * Shape validation for schema v2 (R-P8): every known field must be present
 * with the right type; missing or malformed structure is invalid. Extra
 * unknown keys are tolerated for forward compatibility.
 */
export function isValidContext(ctx) {
  if (ctx === null || typeof ctx !== 'object' || Array.isArray(ctx)) return false;
  if (ctx.version !== 2) return false;
  if (typeof ctx.createdAt !== 'string') return false;
  if (ctx.currentPhase !== null && !['assess', 'estimate'].includes(ctx.currentPhase)) return false;
  if (!isValidPhase(ctx.assess)) return false;
  if (!isValidPhase(ctx.estimate)) return false;
  // assess-only extras (R-P8)
  if (!Array.isArray(ctx.assess.surfacedPatterns)) return false;
  if (!isStringOrNull(ctx.assess.decisionsFile)) return false;
  return true;
}

/**
 * Typed readContext (R-C2 / R-P9).
 * Returns { ok: true, ctx, migrated? } | { ok: false, reason, code?, message? }.
 * reason: 'missing' (ENOENT), 'invalid' (bad JSON/shape/unknown version — no
 * write), 'error' (EACCES or any other fs failure).
 * v1 files are auto-migrated in place and rewritten as v2.
 */
export function readContext(targetBase, contextPath) {
  const contextFile = resolveContextFile(targetBase, contextPath);
  let raw;
  try {
    raw = readFileSync(contextFile, 'utf-8');
  } catch (err) {
    if (err && err.code === 'ENOENT') {
      return { ok: false, reason: 'missing' };
    }
    return { ok: false, reason: 'error', code: err && err.code, message: err && err.message };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return { ok: false, reason: 'invalid', message: err && err.message };
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, reason: 'invalid', message: 'context.json must be a JSON object' };
  }

  if (parsed.version === 1) {
    let v2;
    try {
      v2 = migrateV1ToV2(parsed);
    } catch (err) {
      return { ok: false, reason: 'invalid', message: err.message };
    }
    try {
      writeContext(targetBase, v2, contextPath);
    } catch {
      // Persistence will be retried by the caller's own writes; the migrated
      // object is still valid to use in memory.
    }
    return { ok: true, ctx: v2, migrated: true };
  }

  if (parsed.version === 2) {
    if (!isValidContext(parsed)) {
      return { ok: false, reason: 'invalid', message: 'context.json does not match schema v2' };
    }
    return { ok: true, ctx: parsed };
  }

  return { ok: false, reason: 'invalid', message: `Unsupported context version: ${parsed.version}` };
}

export function writeContext(targetBase, ctx, contextPath) {
  const contextFile = resolveContextFile(targetBase, contextPath);
  try {
    if (!existsSync(dirname(contextFile))) {
      mkdirSync(dirname(contextFile), { recursive: true });
    }
  } catch {}
  writeFileSync(contextFile, JSON.stringify(ctx, null, 2), 'utf-8');
}

/**
 * Shared phase-state helper (R-P10). Merges `patch` into `ctx[phase]` and
 * owns `currentPhase`: running sets it to the phase; completed/failed/skipped
 * clear it. A patch without status leaves currentPhase untouched.
 */
export function updatePhaseState(ctx, phase, patch) {
  ctx[phase] = { ...ctx[phase], ...patch };
  if (patch.status === 'running') {
    ctx.currentPhase = phase;
  } else if (['completed', 'failed', 'skipped'].includes(patch.status)) {
    ctx.currentPhase = null;
  }
  return ctx;
}

/**
 * Lee un archivo de canvas desde docs/funky-ai/canvas/.
 */
function readCanvas(name, targetBase) {
  const path = join(canvasDir(targetBase), name);
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

export function findCanvases(targetBase) {
  const projectCanvas = readCanvas('PROJECT-CANVAS.md', targetBase);
  const infraCanvas = readCanvas('INFRA-CANVAS.md', targetBase);

  let unfilledCount = 0;
  if (projectCanvas) {
    unfilledCount += countUnfilledSections(projectCanvas);
  }
  if (infraCanvas) {
    unfilledCount += countUnfilledSections(infraCanvas);
  }

  return {
    projectCanvas,
    infraCanvas,
    unfilledCount
  };
}

export function countUnfilledSections(markdown) {
  const regex = /\[Responde aquí\]/g;
  const matches = markdown.match(regex);
  return matches ? matches.length : 0;
}

export function loadDecisions(targetBase, decisionsPath) {
  let resolvedPath;
  if (decisionsPath === null || decisionsPath === undefined) {
    resolvedPath = join(targetBase, 'docs', 'funky-ai', 'assess', 'architecture-decisions.md');
  } else if (isAbsolute(decisionsPath)) {
    resolvedPath = decisionsPath;
  } else {
    resolvedPath = resolve(targetBase, decisionsPath);
  }

  try {
    return readFileSync(resolvedPath, 'utf-8');
  } catch {
    return null;
  }
}
