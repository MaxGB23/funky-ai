import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Module-level mocks ──

vi.mock('../src/utils/context.js', () => ({
  initContext: vi.fn(),
  readContext: vi.fn(),
  writeContext: vi.fn()
}));

vi.mock('../src/commands/assess.js', () => ({
  runAssess: vi.fn()
}));

vi.mock('../src/commands/estimate.js', () => ({
  runEstimate: vi.fn()
}));

import { initContext, readContext, writeContext } from '../src/utils/context.js';
import { runAssess } from '../src/commands/assess.js';
import { runEstimate } from '../src/commands/estimate.js';
import { pipelineCommand } from '../src/commands/pipeline.js';

// ── Helpers ──

const DEFAULT_CTX = {
  version: 1,
  createdAt: '2024-01-01T00:00:00.000Z',
  assess: { runAt: null, dynamicQuestions: [] },
  estimate: { runAt: null },
  pipeline: { lastCommand: null, completed: [] }
};

// ═══════════════════════════════════════════════════
// pipeline assess
// ═══════════════════════════════════════════════════

describe('pipeline assess', () => {
  let exitSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('first run — initializes context when context.json missing', () => {
    readContext.mockReturnValue(null);
    initContext.mockReturnValue({ ...DEFAULT_CTX });

    pipelineCommand.parse(['assess'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(initContext).toHaveBeenCalledTimes(1);
    expect(writeContext).toHaveBeenCalledTimes(1);
    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('subsequent run — reuses existing context', () => {
    readContext.mockReturnValue({ ...DEFAULT_CTX });

    pipelineCommand.parse(['assess'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(initContext).not.toHaveBeenCalled();
    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});

// ═══════════════════════════════════════════════════
// pipeline estimate
// ═══════════════════════════════════════════════════

describe('pipeline estimate', () => {
  let exitSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('blocked when context.json missing', () => {
    readContext.mockReturnValue(null);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    pipelineCommand.parse(['estimate'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(runEstimate).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    const errMsgs = errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('context not found'))).toBe(true);

    errorSpy.mockRestore();
  });

  it('blocked when assess has not been run yet', () => {
    readContext.mockReturnValue({
      ...DEFAULT_CTX,
      assess: { runAt: null, dynamicQuestions: [] }
    });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    pipelineCommand.parse(['estimate'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(runEstimate).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    const errMsgs = errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('not been run yet'))).toBe(true);

    errorSpy.mockRestore();
  });

  it('allowed when assess has been run', () => {
    readContext.mockReturnValue({
      ...DEFAULT_CTX,
      assess: { runAt: '2024-01-01T12:00:00.000Z', dynamicQuestions: [] }
    });

    pipelineCommand.parse(['estimate'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(runEstimate).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});

// ═══════════════════════════════════════════════════
// pipeline all
// ═══════════════════════════════════════════════════

describe('pipeline all', () => {
  let exitSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('completes full flow — assess then estimate', () => {
    readContext.mockReturnValue(null);
    initContext.mockReturnValue({ ...DEFAULT_CTX });

    pipelineCommand.parse(['all'], { from: 'user' });

    expect(initContext).toHaveBeenCalledTimes(1);
    expect(writeContext).toHaveBeenCalledTimes(1);
    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(runEstimate).toHaveBeenCalledTimes(1);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('stops on assess failure — does not run estimate', () => {
    readContext.mockReturnValue(null);
    initContext.mockReturnValue({ ...DEFAULT_CTX });
    runAssess.mockImplementation(() => {
      throw new Error('Template missing');
    });

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    pipelineCommand.parse(['all'], { from: 'user' });

    expect(runAssess).toHaveBeenCalledTimes(1);
    expect(runEstimate).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);

    const errMsgs = errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('Assess failed'))).toBe(true);

    errorSpy.mockRestore();
  });
});

// ═══════════════════════════════════════════════════
// pipeline status
// ═══════════════════════════════════════════════════

describe('pipeline status', () => {
  let exitSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('shows not started when no context.json', () => {
    readContext.mockReturnValue(null);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    pipelineCommand.parse(['status'], { from: 'user' });

    expect(readContext).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);

    const logMsgs = logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('Pipeline not started'))).toBe(true);

    logSpy.mockRestore();
  });

  it('shows partial progress when assess done but estimate pending', () => {
    readContext.mockReturnValue({
      ...DEFAULT_CTX,
      assess: {
        runAt: '2024-01-01T12:00:00.000Z',
        dynamicQuestions: [{ category: 'test', question: '?' }]
      }
    });

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    pipelineCommand.parse(['status'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);

    const logMsgs = logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('Pipeline Status'))).toBe(true);
    expect(logMsgs.some(m => m.includes('Completed: 2024-01-01T12:00:00.000Z'))).toBe(true);
    expect(logMsgs.some(m => m.includes('Not run yet'))).toBe(true);
    expect(logMsgs.some(m => m.includes('estimate — pending'))).toBe(true);

    logSpy.mockRestore();
  });
});
