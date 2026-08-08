import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Module-level mocks ──

vi.mock('../src/utils/context.js', async () => {
  const mocks = {
    initContext: vi.fn(),
    readContext: vi.fn(),
    writeContext: vi.fn(),
    // Réplica mínima del helper real: muta ctx[phase] y es dueño de currentPhase.
    // Sin esto, el ctx en memoria del pipeline quedaría 'running' y el bug del
    // estado stale en all --json pasaría desapercibido (lo detectó el smoke E2E).
    updatePhaseState: vi.fn((ctx, phase, patch) => {
      if (ctx && ctx[phase]) {
        Object.assign(ctx[phase], patch);
        if (patch.status === 'running') {
          ctx.currentPhase = phase;
        } else if (['completed', 'failed', 'skipped'].includes(patch.status)) {
          ctx.currentPhase = null;
        }
      }
    })
  };
  return mocks;
});

vi.mock('../src/commands/assess.js', () => ({
  runAssess: vi.fn()
}));

vi.mock('../src/commands/estimate.js', () => ({
  runEstimate: vi.fn()
}));

import { initContext, readContext, writeContext, updatePhaseState } from '../src/utils/context.js';
import { runAssess } from '../src/commands/assess.js';
import { runEstimate } from '../src/commands/estimate.js';
import { pipelineCommand } from '../src/commands/pipeline.js';

// ── Helpers ──

// ctx compartido entre okRead() y persistPhaseResult(): replica el flujo real
// donde el pipeline y las fases operan sobre el estado persistido en disco.
let sharedCtx = null;

// Seed de context v2 (R-P8) — el contrato typed de readContext devuelve
// { ok:true, ctx } o { ok:false, reason }.
function v2Context(overrides = {}) {
  return {
    version: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    currentPhase: null,
    assess: {
      status: 'pending', startedAt: null, finishedAt: null, durationMs: null,
      error: null, artifacts: [], runAt: null, surfacedPatterns: [], decisionsFile: null,
      ...(overrides.assess || {})
    },
    estimate: {
      status: 'pending', startedAt: null, finishedAt: null, durationMs: null,
      error: null, artifacts: [], runAt: null,
      ...(overrides.estimate || {})
    }
  };
}

function okRead(ctx) {
  sharedCtx = ctx;
  readContext.mockReturnValue({ ok: true, ctx });
}

function missingRead() {
  sharedCtx = null;
  readContext.mockReturnValue({ ok: false, reason: 'missing' });
}

function invalidRead(message = 'Unsupported context version: 99') {
  sharedCtx = null;
  readContext.mockReturnValue({ ok: false, reason: 'invalid', message });
}

function completedResult(phase) {
  return {
    phase,
    status: 'completed',
    artifacts: [{ name: `${phase}.md`, path: `docs/funky-ai/${phase}/${phase}.md`, kind: 'generated' }],
    durationMs: 12,
    warnings: []
  };
}

// Simula que la fase PERSISTIÓ su completion en el ctx compartido (como hace
// el módulo real con su propio ctx re-leído de disco).
function persistPhaseResult(phase, result) {
  updatePhaseState(sharedCtx, phase, {
    status: result.status,
    finishedAt: '2024-01-01T14:00:00.000Z',
    durationMs: result.durationMs,
    artifacts: result.artifacts
  });
}

function mockPhase(phase, result) {
  const fn = phase === 'assess' ? runAssess : runEstimate;
  fn.mockImplementation(() => {
    persistPhaseResult(phase, result);
    return result;
  });
}

function setupActionFlow() {
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  const stdoutWriteSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  return { exitSpy, errorSpy, logSpy, stdoutWriteSpy };
}

function teardownActionFlow(spies) {
  spies.exitSpy.mockRestore();
  spies.errorSpy.mockRestore();
  spies.logSpy.mockRestore();
  spies.stdoutWriteSpy.mockRestore();
}

// ═══════════════════════════════════════════════════
// pipeline assess — typed reads (R-P2, R-C2)
// ═══════════════════════════════════════════════════

describe('pipeline assess', () => {
  let spies;

  beforeEach(() => {
    vi.clearAllMocks();
    spies = setupActionFlow();
  });

  afterEach(() => {
    teardownActionFlow(spies);
  });

  it('first run — initializes v2 context when context.json missing', async () => {
    missingRead();
    initContext.mockReturnValue(v2Context());
    runAssess.mockReturnValue(completedResult('assess'));

    await pipelineCommand.parseAsync(['assess'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(initContext).toHaveBeenCalledTimes(1);
    expect(writeContext).toHaveBeenCalledTimes(2); // init + running-mark
    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(updatePhaseState).toHaveBeenCalledWith(
      expect.anything(), 'assess',
      expect.objectContaining({ status: 'running', startedAt: expect.any(String) })
    );
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('subsequent run — reuses existing context, no init', async () => {
    okRead(v2Context());
    runAssess.mockReturnValue(completedResult('assess'));

    await pipelineCommand.parseAsync(['assess'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(initContext).not.toHaveBeenCalled();
    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(runAssess).toHaveBeenCalledWith(expect.anything(), { context: true });
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('contexto inválido (versión desconocida) → error en stderr y exit 1, sin avanzar el pipeline', async () => {
    invalidRead();

    await pipelineCommand.parseAsync(['assess'], { from: 'user' });

    expect(initContext).not.toHaveBeenCalled();
    expect(runAssess).not.toHaveBeenCalled();
    expect(writeContext).not.toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
    const errMsgs = spies.errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('context.json inválido'))).toBe(true);
  });

  it('termina con exit 1 cuando el assess falla', async () => {
    okRead(v2Context());
    runAssess.mockReturnValue({ phase: 'assess', status: 'failed', artifacts: [], durationMs: 1, warnings: [] });

    await pipelineCommand.parseAsync(['assess'], { from: 'user' });

    expect(spies.exitSpy).toHaveBeenCalledWith(1);
  });
});

// ═══════════════════════════════════════════════════
// pipeline estimate — typed reads
// ═══════════════════════════════════════════════════

describe('pipeline estimate', () => {
  let spies;

  beforeEach(() => {
    vi.clearAllMocks();
    spies = setupActionFlow();
  });

  afterEach(() => {
    teardownActionFlow(spies);
  });

  it('blocked when context.json missing', async () => {
    missingRead();

    await pipelineCommand.parseAsync(['estimate'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(runEstimate).not.toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
    const errMsgs = spies.errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('Contexto de pipeline no encontrado'))).toBe(true);
  });

  it('blocked when assess has not been run yet', async () => {
    okRead(v2Context({ assess: { status: 'pending', runAt: null } }));

    await pipelineCommand.parseAsync(['estimate'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(runEstimate).not.toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
    const errMsgs = spies.errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('aún no se ha ejecutado'))).toBe(true);
  });

  it('allowed when assess has been run', async () => {
    okRead(v2Context({ assess: { status: 'completed', runAt: '2024-01-01T12:00:00.000Z' } }));
    runEstimate.mockReturnValue(completedResult('estimate'));

    await pipelineCommand.parseAsync(['estimate'], { from: 'user' });

    expect(runEstimate).toHaveBeenCalledTimes(1);
    expect(updatePhaseState).toHaveBeenCalledWith(
      expect.anything(), 'estimate',
      expect.objectContaining({ status: 'running', startedAt: expect.any(String) })
    );
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });
});

// ═══════════════════════════════════════════════════
// pipeline all — state machine, resume, --json (R-P4, R-P10, R-P11)
// ═══════════════════════════════════════════════════

describe('pipeline all', () => {
  let spies;

  beforeEach(() => {
    vi.clearAllMocks();
    spies = setupActionFlow();
  });

  afterEach(() => {
    teardownActionFlow(spies);
  });

  it('completes full flow — assess then estimate, exit 0', async () => {
    const ctx = v2Context();
    missingRead();
    initContext.mockReturnValue(ctx);
    sharedCtx = ctx;
    mockPhase('assess', completedResult('assess'));
    mockPhase('estimate', completedResult('estimate'));

    await pipelineCommand.parseAsync(['all'], { from: 'user' });

    expect(initContext).toHaveBeenCalledTimes(1);
    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(runEstimate).toHaveBeenCalledTimes(1);
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('marks assess running + currentPhase and persists BEFORE assess executes (R-P10)', async () => {
    okRead(v2Context());
    mockPhase('assess', completedResult('assess'));
    mockPhase('estimate', completedResult('estimate'));

    await pipelineCommand.parseAsync(['all'], { from: 'user' });

    expect(updatePhaseState).toHaveBeenCalledWith(
      expect.anything(), 'assess',
      expect.objectContaining({ status: 'running', startedAt: expect.any(String) })
    );
    // writeContext(running) debe preceder a la ejecución de assess
    const writeCall = writeContext.mock.invocationCallOrder[0];
    const assessCall = runAssess.mock.invocationCallOrder[0];
    expect(writeCall).toBeLessThan(assessCall);
  });

  it('marks estimate running before estimate executes (R-P10)', async () => {
    okRead(v2Context());
    mockPhase('assess', completedResult('assess'));
    mockPhase('estimate', completedResult('estimate'));

    await pipelineCommand.parseAsync(['all'], { from: 'user' });

    expect(updatePhaseState).toHaveBeenCalledWith(
      expect.anything(), 'estimate',
      expect.objectContaining({ status: 'running', startedAt: expect.any(String) })
    );
    const writeEstimate = writeContext.mock.invocationCallOrder[writeContext.mock.invocationCallOrder.length - 1];
    const estimateCall = runEstimate.mock.invocationCallOrder[0];
    expect(writeEstimate).toBeLessThan(estimateCall);
  });

  it('assess failure — marks assess failed + estimate skipped, exits 1, estimate NOT run (R-P4/R-P10)', async () => {
    okRead(v2Context());
    runAssess.mockImplementation(() => {
      throw new Error('Template missing');
    });

    await pipelineCommand.parseAsync(['all'], { from: 'user' });

    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(runEstimate).not.toHaveBeenCalled();
    expect(updatePhaseState).toHaveBeenCalledWith(
      expect.anything(), 'assess',
      expect.objectContaining({ status: 'failed', error: 'Template missing', finishedAt: expect.any(String) })
    );
    expect(updatePhaseState).toHaveBeenCalledWith(expect.anything(), 'estimate', expect.objectContaining({ status: 'skipped' }));
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
    const errMsgs = spies.errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('Assess falló'))).toBe(true);
  });

  it('resume — phase left running (no finishedAt) is re-run, not skipped (R-P10)', async () => {
    okRead(v2Context({
      assess: { status: 'completed', runAt: '2024-01-01T12:00:00.000Z' },
      estimate: { status: 'running', startedAt: '2024-01-01T13:00:00.000Z', finishedAt: null }
    }));
    mockPhase('assess', completedResult('assess'));
    mockPhase('estimate', completedResult('estimate'));

    await pipelineCommand.parseAsync(['all'], { from: 'user' });

    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(runEstimate).toHaveBeenCalledTimes(1);
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('unknown version — stderr + exit 1, no write (R-P9/R-P7)', async () => {
    invalidRead();

    await pipelineCommand.parseAsync(['all'], { from: 'user' });

    expect(initContext).not.toHaveBeenCalled();
    expect(writeContext).not.toHaveBeenCalled();
    expect(runAssess).not.toHaveBeenCalled();
    expect(runEstimate).not.toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
  });

  it('all --json — single JSON on stdout with run detail, exit 0 (R-P11)', async () => {
    okRead(v2Context());
    mockPhase('assess', {
      phase: 'assess', status: 'completed',
      artifacts: [{ name: 'a.md', path: 'docs/funky-ai/assess/a.md', kind: 'generated' }],
      durationMs: 5, warnings: ['⚠️  canvas faltante']
    });
    mockPhase('estimate', completedResult('estimate'));

    await pipelineCommand.parseAsync(['all', '--json'], { from: 'user' });

    const writes = spies.stdoutWriteSpy.mock.calls.map(c => String(c));
    expect(writes.length).toBe(1);
    const parsed = JSON.parse(writes[0]);
    expect(parsed.version).toBe(2);
    expect(parsed.currentPhase).toBeNull();
    // El bloque de estado top-level refleja el estado PERSISTIDO (completed),
    // no el running-mark del pipeline en memoria (regresión detectada en smoke).
    expect(parsed.assess.status).toBe('completed');
    expect(parsed.estimate.status).toBe('completed');
    expect(parsed.run.assess.status).toBe('completed');
    expect(parsed.run.assess.warnings).toEqual(['⚠️  canvas faltante']);
    expect(parsed.run.estimate.status).toBe('completed');
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('all --json — top-level reflects PERSISTED state after refresh, not the running-mark (regresión smoke E2E)', async () => {
    // Simula el flujo real: las fases persisten su completion en un ctx distinto
    // (el que ellas leen de disco); el ctx en memoria del pipeline queda con el
    // running-mark. pipeline debe refrescar desde disco antes de emitir JSON.
    const initial = v2Context();
    const persisted = v2Context({
      assess: {
        status: 'completed', runAt: '2024-01-01T14:00:00.000Z',
        finishedAt: '2024-01-01T14:00:00.000Z', durationMs: 5,
        artifacts: [{ name: 'a.md', path: 'docs/funky-ai/assess/a.md', kind: 'generated' }],
        surfacedPatterns: ['Microservicios']
      },
      estimate: {
        status: 'completed', runAt: '2024-01-01T14:01:00.000Z',
        finishedAt: '2024-01-01T14:01:00.000Z', durationMs: 3,
        artifacts: [{ name: 'e.md', path: 'docs/funky-ai/estimate/e.md', kind: 'generated' }]
      }
    });
    readContext.mockReturnValueOnce({ ok: true, ctx: initial }); // ensureContext
    readContext.mockReturnValue({ ok: true, ctx: persisted });   // refreshes tras cada fase
    sharedCtx = persisted;
    mockPhase('assess', completedResult('assess'));
    mockPhase('estimate', completedResult('estimate'));

    await pipelineCommand.parseAsync(['all', '--json'], { from: 'user' });

    const parsed = JSON.parse(String(spies.stdoutWriteSpy.mock.calls[0]));
    expect(parsed.assess.status).toBe('completed');
    expect(parsed.assess.surfacedPatterns).toEqual(['Microservicios']);
    expect(parsed.estimate.status).toBe('completed');
    expect(parsed.currentPhase).toBeNull();
    expect(parsed.run.assess.status).toBe('completed');
    expect(parsed.run.estimate.status).toBe('completed');
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('all --json — human inter-phase text goes to stderr, NOT stdout', async () => {
    okRead(v2Context());
    mockPhase('assess', completedResult('assess'));
    mockPhase('estimate', completedResult('estimate'));

    await pipelineCommand.parseAsync(['all', '--json'], { from: 'user' });

    const stdout = spies.stdoutWriteSpy.mock.calls.map(c => String(c)).join('');
    expect(stdout.includes('Assess completado')).toBe(false);
    expect(stdout.includes('Pipeline completado')).toBe(false);
    // el texto humano se desvió a stderr
    const stderr = spies.errorSpy.mock.calls.map(c => String(c)).join('');
    expect(stderr.includes('Assess completado')).toBe(true);
  });

  it('all --json on assess failure — no JSON emitted, exit 1', async () => {
    okRead(v2Context());
    runAssess.mockImplementation(() => {
      throw new Error('boom');
    });

    await pipelineCommand.parseAsync(['all', '--json'], { from: 'user' });

    expect(spies.stdoutWriteSpy).not.toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
  });
});

// ═══════════════════════════════════════════════════
// pipeline status — human re-render + --json (R-P11, R-P5 removal)
// ═══════════════════════════════════════════════════

describe('pipeline status', () => {
  let spies;

  beforeEach(() => {
    vi.clearAllMocks();
    spies = setupActionFlow();
  });

  afterEach(() => {
    teardownActionFlow(spies);
  });

  it('shows not started when no context.json', async () => {
    missingRead();

    await pipelineCommand.parseAsync(['status'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
    const logMsgs = spies.logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('Pipeline no iniciado'))).toBe(true);
  });

  it('status --json with no context — single JSON not-started shape, exit 0, no human text on stdout (R-P11)', async () => {
    missingRead();
    initContext.mockReturnValue(v2Context());

    await pipelineCommand.parseAsync(['status', '--json'], { from: 'user' });

    const writes = spies.stdoutWriteSpy.mock.calls.map(c => String(c));
    expect(writes.length).toBe(1);
    const parsed = JSON.parse(writes[0]);
    expect(parsed.version).toBe(2);
    expect(parsed.currentPhase).toBeNull();
    expect(parsed.assess.status).toBe('pending');
    expect(parsed.estimate.status).toBe('pending');
    expect(parsed.run).toBeUndefined();
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
    const logMsgs = spies.logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('Pipeline no iniciado'))).toBe(false);
  });

  it('human status — per-phase status, runAt, surfacedPatterns; no pipeline.completed', async () => {
    okRead(v2Context({
      assess: {
        status: 'completed', runAt: '2024-01-01T12:00:00.000Z',
        surfacedPatterns: ['Microservicios', 'SQLite']
      },
      estimate: { status: 'pending', runAt: null }
    }));

    await pipelineCommand.parseAsync(['status'], { from: 'user' });

    expect(spies.exitSpy).toHaveBeenCalledWith(0);
    const logMsgs = spies.logSpy.mock.calls.map(c => String(c)).join('\n');
    expect(logMsgs.includes('Estado del Pipeline')).toBe(true);
    expect(logMsgs.includes('Estado: completed')).toBe(true);
    expect(logMsgs.includes('Completado: 2024-01-01T12:00:00.000Z')).toBe(true);
    expect(logMsgs.includes('Patrones detectados: 2')).toBe(true);
    expect(logMsgs.includes('Estado: pending')).toBe(true);
    expect(logMsgs.includes('pipeline')).toBe(false); // pipeline.completed eliminado
  });

  it('status --json — single JSON on stdout, exit 0 (R-P11)', async () => {
    okRead(v2Context({
      assess: { status: 'completed', runAt: '2024-01-01T12:00:00.000Z', surfacedPatterns: ['X'] }
    }));

    await pipelineCommand.parseAsync(['status', '--json'], { from: 'user' });

    const writes = spies.stdoutWriteSpy.mock.calls.map(c => String(c));
    expect(writes.length).toBe(1);
    const parsed = JSON.parse(writes[0]);
    expect(parsed.version).toBe(2);
    expect(parsed.assess.status).toBe('completed');
    expect(parsed.assess.surfacedPatterns).toEqual(['X']);
    expect(parsed.run).toBeUndefined();
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('unknown version — stderr + exit 1, no stdout JSON', async () => {
    invalidRead();

    await pipelineCommand.parseAsync(['status', '--json'], { from: 'user' });

    expect(spies.stdoutWriteSpy).not.toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
    const errMsgs = spies.errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('context.json inválido'))).toBe(true);
  });
});
