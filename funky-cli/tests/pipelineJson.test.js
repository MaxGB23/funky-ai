import { describe, it, expect } from 'vitest';
import { statusJson, runJson } from '../src/utils/pipelineJson.js';

const V2_CTX = {
  version: 2,
  createdAt: '2024-01-01T00:00:00.000Z',
  currentPhase: null,
  assess: {
    status: 'completed',
    startedAt: '2024-01-01T10:00:00.000Z',
    finishedAt: '2024-01-01T10:05:00.000Z',
    durationMs: 5000,
    error: null,
    artifacts: [{ name: 'architecture-review.md', path: 'docs/funky-ai/assess/architecture-review.md', kind: 'generated' }],
    runAt: '2024-01-01T10:05:00.000Z',
    surfacedPatterns: ['Microservicios'],
    decisionsFile: 'docs/funky-ai/assess/architecture-decisions.md'
  },
  estimate: {
    status: 'running',
    startedAt: '2024-01-01T10:06:00.000Z',
    finishedAt: null,
    durationMs: null,
    error: null,
    artifacts: [],
    runAt: null
  }
};

// ── statusJson (R-P11) ──

describe('statusJson', () => {
  it('emits fixed top-level field order: version, createdAt, currentPhase, assess, estimate', () => {
    const json = statusJson(V2_CTX);
    expect(Object.keys(json)).toEqual(['version', 'createdAt', 'currentPhase', 'assess', 'estimate']);
  });

  it('keeps assess field order (status, startedAt, finishedAt, durationMs, error, artifacts, runAt, surfacedPatterns, decisionsFile)', () => {
    const json = statusJson(V2_CTX);
    expect(Object.keys(json.assess)).toEqual([
      'status', 'startedAt', 'finishedAt', 'durationMs', 'error', 'artifacts', 'runAt', 'surfacedPatterns', 'decisionsFile'
    ]);
  });

  it('keeps estimate field order (status, startedAt, finishedAt, durationMs, error, artifacts, runAt)', () => {
    const json = statusJson(V2_CTX);
    expect(Object.keys(json.estimate)).toEqual([
      'status', 'startedAt', 'finishedAt', 'durationMs', 'error', 'artifacts', 'runAt'
    ]);
  });

  it('passes phase values through unchanged', () => {
    const json = statusJson(V2_CTX);
    expect(json.assess.status).toBe('completed');
    expect(json.assess.surfacedPatterns).toEqual(['Microservicios']);
    expect(json.estimate.status).toBe('running');
    expect(json.currentPhase).toBeNull();
  });

  it('does not leak pipeline.completed/lastCommand (vestigial v1) into output', () => {
    const ctxWithVestiges = {
      ...V2_CTX,
      pipeline: { lastCommand: 'assess', completed: ['assess'] }
    };
    const json = statusJson(ctxWithVestiges);
    expect(json.pipeline).toBeUndefined();
  });

  it('stringifies deterministically (stable key order, 2-space indent)', () => {
    const str = JSON.stringify(statusJson(V2_CTX), null, 2);
    expect(JSON.parse(str)).toEqual(V2_CTX);
  });
});

// ── runJson (R-P11 / R-P12) ──

describe('runJson', () => {
  const results = {
    assess: {
      phase: 'assess',
      status: 'completed',
      durationMs: 5000,
      artifacts: [{ name: 'architecture-review.md', path: 'docs/funky-ai/assess/architecture-review.md', kind: 'generated' }],
      warnings: ['Canvas con secciones sin completar']
    },
    estimate: {
      phase: 'estimate',
      status: 'skipped',
      durationMs: null,
      artifacts: [],
      warnings: []
    }
  };

  it('returns statusJson shape plus a run section with fixed key order', () => {
    const json = runJson(V2_CTX, results);
    expect(Object.keys(json)).toEqual(['version', 'createdAt', 'currentPhase', 'assess', 'estimate', 'run']);
  });

  it('maps each phase result into run with { status, durationMs, artifacts, warnings }', () => {
    const json = runJson(V2_CTX, results);
    expect(json.run).toEqual({
      assess: {
        status: 'completed',
        durationMs: 5000,
        artifacts: [{ name: 'architecture-review.md', path: 'docs/funky-ai/assess/architecture-review.md', kind: 'generated' }],
        warnings: ['Canvas con secciones sin completar']
      },
      estimate: {
        status: 'skipped',
        durationMs: null,
        artifacts: [],
        warnings: []
      }
    });
  });

  it('warnings passthrough: warnings present on success do not fail', () => {
    const json = runJson(V2_CTX, results);
    expect(json.run.assess.warnings).toEqual(['Canvas con secciones sin completar']);
    expect(json.run.estimate.warnings).toEqual([]);
  });

  it('keeps artifact shape { name, path, kind } and order', () => {
    const json = runJson(V2_CTX, results);
    expect(json.run.assess.artifacts[0]).toEqual({
      name: 'architecture-review.md',
      path: 'docs/funky-ai/assess/architecture-review.md',
      kind: 'generated'
    });
  });

  it('accepts an empty results object', () => {
    const json = runJson(V2_CTX, {});
    expect(json.run).toEqual({});
    expect(Object.keys(json)).toEqual(['version', 'createdAt', 'currentPhase', 'assess', 'estimate', 'run']);
  });
});
