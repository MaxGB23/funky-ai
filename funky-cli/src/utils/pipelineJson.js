// Serializadores deterministas para `pipeline status --json` y `pipeline all --json`
// (R-P11). El orden de claves es fijo: version, createdAt, currentPhase, assess,
// estimate, y en `runJson` además `run`. No se leen ni se escriben archivos.

const ASSESS_KEY_ORDER = ['status', 'startedAt', 'finishedAt', 'durationMs', 'error', 'artifacts', 'runAt', 'surfacedPatterns', 'decisionsFile'];
const ESTIMATE_KEY_ORDER = ['status', 'startedAt', 'finishedAt', 'durationMs', 'error', 'artifacts', 'runAt'];
const RUN_KEY_ORDER = ['status', 'durationMs', 'artifacts', 'warnings'];

function orderedPhase(phase, keyOrder) {
  const out = {};
  for (const key of keyOrder) {
    out[key] = phase[key];
  }
  return out;
}

/**
 * Estado del pipeline como objeto JSON con orden de claves determinista.
 * @param {object} ctx context.json v2 (R-P8)
 * @returns {{version, createdAt, currentPhase, assess, estimate}}
 */
export function statusJson(ctx) {
  return {
    version: ctx.version,
    createdAt: ctx.createdAt,
    currentPhase: ctx.currentPhase,
    assess: orderedPhase(ctx.assess, ASSESS_KEY_ORDER),
    estimate: orderedPhase(ctx.estimate, ESTIMATE_KEY_ORDER)
  };
}

/**
 * Resultado de una ejecución de `pipeline all`/`status` con detalle por fase.
 * `results` mapea phase → {status, durationMs, artifacts, warnings} (R-P12).
 * @param {object} ctx context.json v2 (R-P8)
 * @param {object} results
 * @returns {statusJson shape + run}
 */
export function runJson(ctx, results) {
  const run = {};
  for (const phase of Object.keys(results)) {
    const r = results[phase];
    const entry = {};
    for (const key of RUN_KEY_ORDER) {
      entry[key] = r[key];
    }
    run[phase] = entry;
  }
  return {
    ...statusJson(ctx),
    run
  };
}
