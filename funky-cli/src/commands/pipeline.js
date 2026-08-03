import { Command } from 'commander';
import { initContext, readContext, writeContext, updatePhaseState } from '../utils/context.js';
import { statusJson, runJson } from '../utils/pipelineJson.js';
import { runAssess } from './assess.js';
import { runEstimate } from './estimate.js';

const nowIso = () => new Date().toISOString();

export const pipelineCommand = new Command('pipeline')
  .description('Orquesta el pipeline funky: init → assess → estimate');

// Typed-read branch (R-C2/R-P9): missing → init v2 en el lugar; invalid/error →
// stderr + exit 1, SIN escribir nada.
function ensureContext(targetBase) {
  const readResult = readContext(targetBase);
  if (readResult.ok) {
    return readResult.ctx;
  }
  if (readResult.reason === 'missing') {
    const ctx = initContext();
    writeContext(targetBase, ctx);
    return ctx;
  }
  const detail = readResult.message ? ` ${readResult.message}` : '';
  console.error(`❌ context.json inválido:${detail}`);
  process.exit(1);
  return null;
}

pipelineCommand
  .command('assess')
  .description('Ejecuta assess con el contexto compartido del pipeline')
  .action(() => {
    const targetBase = process.cwd();
    const ctx = ensureContext(targetBase);
    if (!ctx) return;

    // R-P10: marca running + startedAt + currentPhase ANTES de ejecutar la fase
    updatePhaseState(ctx, 'assess', { status: 'running', startedAt: nowIso() });
    writeContext(targetBase, ctx);

    const result = runAssess(targetBase, { context: true });
    process.exit(result.status === 'failed' ? 1 : 0);
    return;
  });

pipelineCommand
  .command('estimate')
  .description('Ejecuta estimate con el contexto compartido del pipeline')
  .action(() => {
    const targetBase = process.cwd();

    // Valida que exista el context
    const readResult = readContext(targetBase);
    if (!readResult.ok) {
      console.error('❌ Contexto de pipeline no encontrado. Ejecuta "funky pipeline assess" primero.');
      process.exit(1);
      return;
    }
    const ctx = readResult.ctx;

    // Valida que assess ya se haya ejecutado (runAt presente en v2/migrado)
    if (!ctx.assess?.runAt) {
      console.error('❌ Assess aún no se ha ejecutado. Ejecuta "funky pipeline assess" primero.');
      process.exit(1);
      return;
    }

    updatePhaseState(ctx, 'estimate', { status: 'running', startedAt: nowIso() });
    writeContext(targetBase, ctx);

    const result = runEstimate(targetBase, { context: true });
    process.exit(result.status === 'failed' ? 1 : 0);
    return;
  });

pipelineCommand
  .command('all')
  .description('Ejecuta el pipeline completo: assess → estimate')
  .option('--json', 'Emit JSON on stdout')
  .action((opts) => {
    const targetBase = process.cwd();
    const json = opts.json === true;
    // R-P11: en --json el texto humano va a stderr; stdout solo recibe el JSON.
    const log = (msg) => {
      if (json) console.error(msg);
      else console.log(msg);
    };

    let ctx = ensureContext(targetBase);
    if (!ctx) return;

    const results = {};

    // R-P10/R-P4: persiste running+startedAt+currentPhase, ejecuta la fase
    // (que persiste su propia completion vía updatePhaseState), y ante throw
    // marca failed+error+finishedAt+durationMs; assess fallido ⇒ estimate skipped.
    const runPhase = (phase, fn, optsJson) => {
      updatePhaseState(ctx, phase, { status: 'running', startedAt: nowIso() });
      writeContext(targetBase, ctx);
      const phaseStart = Date.now();
      try {
        const result = fn(targetBase, optsJson);
        if (result.status === 'failed') {
          throw new Error(result.error || `Fase ${phase} falló`);
        }
        results[phase] = {
          status: result.status,
          durationMs: result.durationMs,
          artifacts: result.artifacts,
          warnings: result.warnings
        };
        return true;
      } catch (err) {
        updatePhaseState(ctx, phase, {
          status: 'failed',
          error: err.message,
          finishedAt: nowIso(),
          durationMs: Date.now() - phaseStart
        });
        if (phase === 'assess') {
          updatePhaseState(ctx, 'estimate', { status: 'skipped' });
        }
        writeContext(targetBase, ctx);
        const label = phase === 'assess' ? 'Assess' : 'Estimate';
        console.error(`❌ ${label} falló: ${err.message}`);
        process.exit(1);
        return false;
      }
    };

    const phaseOpts = { context: true, json };
    // Las fases persisten su propia completion con un ctx re-leído de disco
    // (readContext dentro de assess/estimate); el ctx en memoria del pipeline
    // quedó en el mark 'running'. Se refresca desde el archivo (fuente de
    // verdad) para que runJson emita el estado REAL, no el running-mark.
    const refreshCtx = () => {
      const fresh = readContext(targetBase);
      if (fresh.ok) {
        ctx = fresh.ctx;
      }
    };

    const assessOk = runPhase('assess', runAssess, phaseOpts);
    if (!assessOk) return;
    refreshCtx();

    log('\n✅ Assess completado. Ejecutando estimate...\n');
    const estimateOk = runPhase('estimate', runEstimate, phaseOpts);
    if (!estimateOk) return;
    refreshCtx();

    if (json) {
      // R-P11: un único JSON en stdout, ANTES de process.exit; el pipeline
      // construye el resumen desde los results sin re-leer el archivo (R-P12).
      process.stdout.write(JSON.stringify(runJson(ctx, results), null, 2) + '\n');
    } else {
      log('\n✅ Pipeline completado.');
    }
    process.exit(0);
    return;
  });

pipelineCommand
  .command('status')
  .description('Muestra el estado actual del pipeline')
  .option('--json', 'Emit JSON on stdout')
  .action((opts) => {
    const targetBase = process.cwd();
    const json = opts.json === true;
    const readResult = readContext(targetBase);

    if (!readResult.ok) {
      if (readResult.reason === 'missing') {
        console.log('📋 Pipeline no iniciado.');
        console.log('Ejecuta "funky pipeline assess" para comenzar.');
        process.exit(0);
        return;
      }
      const detail = readResult.message ? ` ${readResult.message}` : '';
      console.error(`❌ context.json inválido:${detail}`);
      process.exit(1);
      return;
    }

    const ctx = readResult.ctx;

    if (json) {
      process.stdout.write(JSON.stringify(statusJson(ctx), null, 2) + '\n');
      process.exit(0);
      return;
    }

    console.log('📋 Estado del Pipeline');
    console.log('──────────────────────');
    console.log(`Creado: ${ctx.createdAt}`);
    if (ctx.currentPhase) {
      console.log(`▶ Fase actual: ${ctx.currentPhase}`);
    }
    console.log('');

    // Estado por fase (R-P5 removido: sin canvas state ni pipeline.completed)
    const phaseStatus = (label, phase) => {
      const status = phase?.status || 'pending';
      console.log(`${label}`);
      console.log(`  Estado: ${status}`);
      if (phase?.runAt) {
        console.log(`  Completado: ${phase.runAt}`);
      }
      if (phase?.error) {
        console.log(`  Error: ${phase.error}`);
      }
    };

    phaseStatus('🔍 Assess:', ctx.assess);
    if (ctx.assess?.surfacedPatterns?.length) {
      console.log(`  Patrones detectados: ${ctx.assess.surfacedPatterns.length}`);
    }
    console.log('');

    phaseStatus('💰 Estimate:', ctx.estimate);
    console.log('');

    process.exit(0);
    return;
  });
