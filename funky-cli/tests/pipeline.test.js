import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Module-level mocks ──

vi.mock('../src/utils/context.js', () => ({
  initContext: vi.fn(),
  readContext: vi.fn(),
  writeContext: vi.fn(),
  updatePhaseState: vi.fn()
}));

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
  readContext.mockReturnValue({ ok: true, ctx });
}

function missingRead() {
  readContext.mockReturnValue({ ok: false, reason: 'missing' });
}

function invalidRead(message = 'Unsupported context version: 99') {
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

  it('first run — initializes v2 context when context.json missing', () => {
    missingRead();
    initContext.mockReturnValue(v2Context());
    runAssess.mockReturnValue(completedResult('assess'));

    pipelineCommand.parse(['assess'], { from: 'user' });

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

  it('subsequent run — reuses existing context, no init', () => {
    okRead(v2Context());
    runAssess.mockReturnValue(completedResult('assess'));

    pipelineCommand.parse(['assess'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(initContext).not.toHaveBeenCalled();
    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(runAssess).toHaveBeenCalledWith(expect.anything(), { context: true });
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('invalid context (unknown version) — stderr + exit 1, NO init, NO runAssess, NO write', () => {
    invalidRead();

    pipelineCommand.parse(['assess'], { from: 'user' });

    expect(initContext).not.toHaveBeenCalled();
    expect(runAssess).not.toHaveBeenCalled();
    expect(writeContext).not.toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
    const errMsgs = spies.errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('context.json inválido'))).toBe(true);
  });

  it('exits 1 when runAssess returns a failed result', () => {
    okRead(v2Context());
    runAssess.mockReturnValue({ phase: 'assess', status: 'failed', artifacts: [], durationMs: 1, warnings: [] });

    pipelineCommand.parse(['assess'], { from: 'user' });

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

  it('blocked when context.json missing', () => {
    missingRead();

    pipelineCommand.parse(['estimate'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(runEstimate).not.toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
    const errMsgs = spies.errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('Contexto de pipeline no encontrado'))).toBe(true);
  });

  it('blocked when assess has not been run yet', () => {
    okRead(v2Context({ assess: { status: 'pending', runAt: null } }));

    pipelineCommand.parse(['estimate'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(runEstimate).not.toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
    const errMsgs = spies.errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('aún no se ha ejecutado'))).toBe(true);
  });

  it('allowed when assess has been run', () => {
    okRead(v2Context({ assess: { status: 'completed', runAt: '2024-01-01T12:00:00.000Z' } }));
    runEstimate.mockReturnValue(completedResult('estimate'));

    pipelineCommand.parse(['estimate'], { from: 'user' });

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

  it('completes full flow — assess then estimate, exit 0', () => {
    missingRead();
    initContext.mockReturnValue(v2Context());
    runAssess.mockReturnValue(completedResult('assess'));
    runEstimate.mockReturnValue(completedResult('estimate'));

    pipelineCommand.parse(['all'], { from: 'user' });

    expect(initContext).toHaveBeenCalledTimes(1);
    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(runEstimate).toHaveBeenCalledTimes(1);
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('marks assess running + currentPhase and persists BEFORE assess executes (R-P10)', () => {
    okRead(v2Context());
    runAssess.mockReturnValue(completedResult('assess'));
    runEstimate.mockReturnValue(completedResult('estimate'));

    pipelineCommand.parse(['all'], { from: 'user' });

    expect(updatePhaseState).toHaveBeenCalledWith(
      expect.anything(), 'assess',
      expect.objectContaining({ status: 'running', startedAt: expect.any(String) })
    );
    // writeContext(running) debe preceder a la ejecución de assess
    const writeCall = writeContext.mock.invocationCallOrder[0];
    const assessCall = runAssess.mock.invocationCallOrder[0];
    expect(writeCall).toBeLessThan(assessCall);
  });

  it('marks estimate running before estimate executes (R-P10)', () => {
    okRead(v2Context());
    runAssess.mockReturnValue(completedResult('assess'));
    runEstimate.mockReturnValue(completedResult('estimate'));

    pipelineCommand.parse(['all'], { from: 'user' });

    expect(updatePhaseState).toHaveBeenCalledWith(
      expect.anything(), 'estimate',
      expect.objectContaining({ status: 'running', startedAt: expect.any(String) })
    );
    const writeEstimate = writeContext.mock.invocationCallOrder[writeContext.mock.invocationCallOrder.length - 1];
    const estimateCall = runEstimate.mock.invocationCallOrder[0];
    expect(writeEstimate).toBeLessThan(estimateCall);
  });

  it('assess failure — marks assess failed + estimate skipped, exits 1, estimate NOT run (R-P4/R-P10)', () => {
    okRead(v2Context());
    runAssess.mockImplementation(() => {
      throw new Error('Template missing');
    });

    pipelineCommand.parse(['all'], { from: 'user' });

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

  it('resume — phase left running (no finishedAt) is re-run, not skipped (R-P10)', () => {
    okRead(v2Context({
      assess: { status: 'completed', runAt: '2024-01-01T12:00:00.000Z' },
      estimate: { status: 'running', startedAt: '2024-01-01T13:00:00.000Z', finishedAt: null }
    }));
    runAssess.mockReturnValue(completedResult('assess'));
    runEstimate.mockReturnValue(completedResult('estimate'));

    pipelineCommand.parse(['all'], { from: 'user' });

    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(runEstimate).toHaveBeenCalledTimes(1);
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('unknown version — stderr + exit 1, no write (R-P9/R-P7)', () => {
    invalidRead();

    pipelineCommand.parse(['all'], { from: 'user' });

    expect(initContext).not.toHaveBeenCalled();
    expect(writeContext).not.toHaveBeenCalled();
    expect(runAssess).not.toHaveBeenCalled();
    expect(runEstimate).not.toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
  });

  it('all --json — single JSON on stdout with run detail, exit 0 (R-P11)', () => {
    okRead(v2Context());
    runAssess.mockReturnValue({
      phase: 'assess', status: 'completed',
      artifacts: [{ name: 'a.md', path: 'docs/funky-ai/assess/a.md', kind: 'generated' }],
      durationMs: 5, warnings: ['⚠️  canvas faltante']
    });
    runEstimate.mockReturnValue(completedResult('estimate'));

    pipelineCommand.parse(['all', '--json'], { from: 'user' });

    const writes = spies.stdoutWriteSpy.mock.calls.map(c => String(c));
    expect(writes.length).toBe(1);
    const parsed = JSON.parse(writes[0]);
    expect(parsed.version).toBe(2);
    expect(parsed.currentPhase).toBeNull();
    expect(parsed.run.assess.status).toBe('completed');
    expect(parsed.run.assess.warnings).toEqual(['⚠️  canvas faltante']);
    expect(parsed.run.estimate.status).toBe('completed');
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('all --json — human inter-phase text goes to stderr, NOT stdout', () => {
    okRead(v2Context());
    runAssess.mockReturnValue(completedResult('assess'));
    runEstimate.mockReturnValue(completedResult('estimate'));

    pipelineCommand.parse(['all', '--json'], { from: 'user' });

    const stdout = spies.stdoutWriteSpy.mock.calls.map(c => String(c)).join('');
    expect(stdout.includes('Assess completado')).toBe(false);
    expect(stdout.includes('Pipeline completado')).toBe(false);
    // el texto humano se desvió a stderr
    const stderr = spies.errorSpy.mock.calls.map(c => String(c)).join('');
    expect(stderr.includes('Assess completado')).toBe(true);
  });

  it('all --json on assess failure — no JSON emitted, exit 1', () => {
    okRead(v2Context());
    runAssess.mockImplementation(() => {
      throw new Error('boom');
    });

    pipelineCommand.parse(['all', '--json'], { from: 'user' });

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

  it('shows not started when no context.json', () => {
    missingRead();

    pipelineCommand.parse(['status'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
    const logMsgs = spies.logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('Pipeline no iniciado'))).toBe(true);
  });

  it('human status — per-phase status, runAt, surfacedPatterns; no pipeline.completed', () => {
    okRead(v2Context({
      assess: {
        status: 'completed', runAt: '2024-01-01T12:00:00.000Z',
        surfacedPatterns: ['Microservicios', 'SQLite']
      },
      estimate: { status: 'pending', runAt: null }
    }));

    pipelineCommand.parse(['status'], { from: 'user' });

    expect(spies.exitSpy).toHaveBeenCalledWith(0);
    const logMsgs = spies.logSpy.mock.calls.map(c => String(c)).join('\n');
    expect(logMsgs.includes('Estado del Pipeline')).toBe(true);
    expect(logMsgs.includes('Estado: completed')).toBe(true);
    expect(logMsgs.includes('Completado: 2024-01-01T12:00:00.000Z')).toBe(true);
    expect(logMsgs.includes('Patrones detectados: 2')).toBe(true);
    expect(logMsgs.includes('Estado: pending')).toBe(true);
    expect(logMsgs.includes('pipeline')).toBe(false); // pipeline.completed eliminado
  });

  it('status --json — single JSON on stdout, exit 0 (R-P11)', () => {
    okRead(v2Context({
      assess: { status: 'completed', runAt: '2024-01-01T12:00:00.000Z', surfacedPatterns: ['X'] }
    }));

    pipelineCommand.parse(['status', '--json'], { from: 'user' });

    const writes = spies.stdoutWriteSpy.mock.calls.map(c => String(c));
    expect(writes.length).toBe(1);
    const parsed = JSON.parse(writes[0]);
    expect(parsed.version).toBe(2);
    expect(parsed.assess.status).toBe('completed');
    expect(parsed.assess.surfacedPatterns).toEqual(['X']);
    expect(parsed.run).toBeUndefined();
    expect(spies.exitSpy).toHaveBeenCalledWith(0);
  });

  it('unknown version — stderr + exit 1, no stdout JSON', () => {
    invalidRead();

    pipelineCommand.parse(['status', '--json'], { from: 'user' });

    expect(spies.stdoutWriteSpy).not.toHaveBeenCalled();
    expect(spies.exitSpy).toHaveBeenCalledWith(1);
    const errMsgs = spies.errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('context.json inválido'))).toBe(true);
  });
});
