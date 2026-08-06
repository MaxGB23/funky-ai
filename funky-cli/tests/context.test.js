import { describe, it, expect, vi, beforeEach } from 'vitest';
import { join } from 'node:path';

vi.mock('node:fs', () => {
  const mockFns = {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn()
  };
  return {
    ...mockFns,
    default: mockFns
  };
});

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { initContext, readContext, writeContext, migrateV1ToV2, updatePhaseState, findCanvases, countUnfilledSections, loadDecisions } from '../src/utils/context.js';
import { V2_CTX, fsError } from './helpers/contextHelpers.js';

const TARGET_BASE = '/test/project';

// ═══════════════════════════════════════════════════
// initContext (R-P8)
// ═══════════════════════════════════════════════════

describe('initContext', () => {
  it('returns v2 shape with version 2 and full per-phase state (R-P8)', () => {
    const ctx = initContext();
    expect(ctx.version).toBe(2);
    expect(typeof ctx.createdAt).toBe('string');
    expect(ctx.currentPhase).toBeNull();
    expect(ctx.assess).toEqual({
      status: 'pending',
      startedAt: null,
      finishedAt: null,
      durationMs: null,
      error: null,
      artifacts: [],
      runAt: null,
      surfacedPatterns: [],
      decisionsFile: null
    });
    expect(ctx.estimate).toEqual({
      status: 'pending',
      startedAt: null,
      finishedAt: null,
      durationMs: null,
      error: null,
      artifacts: [],
      runAt: null
    });
  });

  it('does not include the vestigial v1 pipeline object', () => {
    const ctx = initContext();
    expect(ctx.pipeline).toBeUndefined();
  });
});

// ═══════════════════════════════════════════════════
// migrateV1ToV2 (R-P9) — pure function
// ═══════════════════════════════════════════════════

describe('migrateV1ToV2', () => {
  it('migrates a full v1 file: runAt → completed+finishedAt, dynamicQuestions → surfacedPatterns (R-P9)', () => {
    const v1 = {
      version: 1,
      createdAt: '2023-05-01T10:00:00.000Z',
      assess: {
        runAt: '2023-05-01T10:05:00.000Z',
        dynamicQuestions: ['Microservicios', 'Cola Síncrona'],
        decisionsFile: 'docs/funky-ai/assess/custom.md'
      },
      estimate: { runAt: '2023-05-01T10:10:00.000Z' },
      pipeline: { lastCommand: 'estimate', completed: ['assess', 'estimate'] }
    };

    const v2 = migrateV1ToV2(v1);

    expect(v2.version).toBe(2);
    expect(v2.createdAt).toBe('2023-05-01T10:00:00.000Z');
    expect(v2.currentPhase).toBeNull();
    // assess: completed + finishedAt from runAt
    expect(v2.assess.status).toBe('completed');
    expect(v2.assess.finishedAt).toBe('2023-05-01T10:05:00.000Z');
    expect(v2.assess.runAt).toBe('2023-05-01T10:05:00.000Z');
    expect(v2.assess.surfacedPatterns).toEqual(['Microservicios', 'Cola Síncrona']);
    expect(v2.assess.decisionsFile).toBe('docs/funky-ai/assess/custom.md');
    expect(v2.assess.artifacts).toEqual([]);
    expect(v2.assess.startedAt).toBeNull();
    expect(v2.assess.durationMs).toBeNull();
    expect(v2.assess.error).toBeNull();
    // estimate: completed + finishedAt from runAt
    expect(v2.estimate.status).toBe('completed');
    expect(v2.estimate.finishedAt).toBe('2023-05-01T10:10:00.000Z');
    expect(v2.estimate.runAt).toBe('2023-05-01T10:10:00.000Z');
    // vestigial v1 fields dropped
    expect(v2.pipeline).toBeUndefined();
    expect(v2.assess.dynamicQuestions).toBeUndefined();
  });

  it('treats null runAt as pending with finishedAt null', () => {
    const v1 = {
      version: 1,
      createdAt: '2023-05-01T10:00:00.000Z',
      assess: { runAt: null, dynamicQuestions: [], decisionsFile: null },
      estimate: { runAt: null }
    };

    const v2 = migrateV1ToV2(v1);

    expect(v2.assess.status).toBe('pending');
    expect(v2.assess.finishedAt).toBeNull();
    expect(v2.estimate.status).toBe('pending');
    expect(v2.estimate.finishedAt).toBeNull();
  });

  it('defaults missing dynamicQuestions to [] and preserves decisionsFile', () => {
    const v1 = {
      version: 1,
      createdAt: '2023-05-01T10:00:00.000Z',
      assess: { runAt: '2023-05-01T10:05:00.000Z', decisionsFile: 'docs/funky-ai/assess/decisions.md' },
      estimate: { runAt: null }
    };

    const v2 = migrateV1ToV2(v1);

    expect(v2.assess.surfacedPatterns).toEqual([]);
    expect(v2.assess.decisionsFile).toBe('docs/funky-ai/assess/decisions.md');
  });

  it('defaults missing phase objects to pending v2 defaults', () => {
    const v1 = {
      version: 1,
      createdAt: '2023-05-01T10:00:00.000Z'
    };

    const v2 = migrateV1ToV2(v1);

    expect(v2.assess.status).toBe('pending');
    expect(v2.assess.surfacedPatterns).toEqual([]);
    expect(v2.assess.runAt).toBeNull();
    expect(v2.estimate.status).toBe('pending');
    expect(v2.estimate.runAt).toBeNull();
  });

  it('throws on non-object input (malformed v1)', () => {
    expect(() => migrateV1ToV2(null)).toThrow();
    expect(() => migrateV1ToV2('v1')).toThrow();
    expect(() => migrateV1ToV2([1, 2])).toThrow();
  });
});

// ═══════════════════════════════════════════════════
// readContext — typed results (R-C2)
// ═══════════════════════════════════════════════════

describe('readContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns { ok: true, ctx } for a valid v2 file (not rewritten)', () => {
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(V2_CTX));

    const result = readContext(TARGET_BASE);

    expect(result.ok).toBe(true);
    expect(result.ctx).toEqual(V2_CTX);
    expect(result.migrated).toBeUndefined();
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it('returns { ok: false, reason: "missing" } when file does not exist (ENOENT)', () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw fsError('ENOENT');
    });

    const result = readContext(TARGET_BASE);
    expect(result).toEqual({ ok: false, reason: 'missing' });
  });

  it('returns { ok: false, reason: "invalid" } on malformed JSON', () => {
    vi.mocked(readFileSync).mockReturnValue('not valid json');

    const result = readContext(TARGET_BASE);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('invalid');
  });

  it('returns { ok: false, reason: "invalid" } for an unknown v2 shape', () => {
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: 2, assess: { status: 'weird' } }));

    const result = readContext(TARGET_BASE);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('invalid');
  });

  it('returns { ok: false, reason: "invalid" } for a non-object JSON value', () => {
    vi.mocked(readFileSync).mockReturnValue('42');

    const result = readContext(TARGET_BASE);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('invalid');
  });

  it('refuses unknown versions: { ok: false, reason: "invalid" } and no write (R-P9)', () => {
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: 99, whatever: true }));

    const result = readContext(TARGET_BASE);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('invalid');
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it('returns { ok: false, reason: "error", code: "EACCES" } on permission denied (not "missing")', () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw fsError('EACCES');
    });

    const result = readContext(TARGET_BASE);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('error');
    expect(result.code).toBe('EACCES');
  });

  it('auto-migrates v1 in place: rewrites as v2 and returns migrated ctx (R-P9)', () => {
    const v1 = {
      version: 1,
      createdAt: '2023-05-01T10:00:00.000Z',
      assess: { runAt: '2023-05-01T10:05:00.000Z', dynamicQuestions: ['Microservicios'], decisionsFile: null },
      estimate: { runAt: null },
      pipeline: { lastCommand: 'assess', completed: [] }
    };
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(v1));

    const result = readContext(TARGET_BASE);

    expect(result.ok).toBe(true);
    expect(result.migrated).toBe(true);
    expect(result.ctx.version).toBe(2);
    expect(result.ctx.assess.status).toBe('completed');
    expect(result.ctx.assess.surfacedPatterns).toEqual(['Microservicios']);
    // rewritten to the default context path as v2
    const writeCall = vi.mocked(writeFileSync).mock.calls[0];
    expect(String(writeCall[0]).replace(/\\/g, '/')).toContain('docs/funky-ai/pipeline/context.json');
    const written = JSON.parse(writeCall[1]);
    expect(written.version).toBe(2);
    expect(written.assess.surfacedPatterns).toEqual(['Microservicios']);
    expect(written.estimate.status).toBe('pending');
  });

  it('reads from custom contextPath when provided (and migrates there)', () => {
    const v1 = {
      version: 1,
      createdAt: '2023-05-01T10:00:00.000Z',
      assess: { runAt: null },
      estimate: { runAt: null }
    };
    vi.mocked(readFileSync).mockImplementation((p) => {
      const normalized = String(p).replace(/\\/g, '/');
      if (normalized.endsWith('custom/context.json')) return JSON.stringify(v1);
      throw fsError('ENOENT');
    });

    const result = readContext(TARGET_BASE, 'custom/context.json');

    expect(result.ok).toBe(true);
    expect(result.migrated).toBe(true);
    const writeCall = vi.mocked(writeFileSync).mock.calls[0];
    expect(String(writeCall[0]).replace(/\\/g, '/').endsWith('custom/context.json')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════
// updatePhaseState (R-P10 helper)
// ═══════════════════════════════════════════════════

describe('updatePhaseState', () => {
  it('sets currentPhase to the phase when status becomes running', () => {
    const ctx = structuredClone(V2_CTX);

    updatePhaseState(ctx, 'assess', { status: 'running', startedAt: '2024-01-01T12:00:00.000Z' });

    expect(ctx.currentPhase).toBe('assess');
    expect(ctx.assess.status).toBe('running');
    expect(ctx.assess.startedAt).toBe('2024-01-01T12:00:00.000Z');
  });

  it('clears currentPhase when a phase completes', () => {
    const ctx = structuredClone(V2_CTX);
    ctx.currentPhase = 'estimate';

    updatePhaseState(ctx, 'estimate', { status: 'completed', finishedAt: '2024-01-01T12:30:00.000Z', durationMs: 1200 });

    expect(ctx.currentPhase).toBeNull();
    expect(ctx.estimate.status).toBe('completed');
    expect(ctx.estimate.finishedAt).toBe('2024-01-01T12:30:00.000Z');
    expect(ctx.estimate.durationMs).toBe(1200);
  });

  it('clears currentPhase on failed', () => {
    const ctx = structuredClone(V2_CTX);
    ctx.currentPhase = 'assess';

    updatePhaseState(ctx, 'assess', { status: 'failed', error: 'boom' });

    expect(ctx.currentPhase).toBeNull();
    expect(ctx.assess.status).toBe('failed');
    expect(ctx.assess.error).toBe('boom');
  });

  it('clears currentPhase on skipped', () => {
    const ctx = structuredClone(V2_CTX);
    ctx.currentPhase = 'assess';

    updatePhaseState(ctx, 'estimate', { status: 'skipped' });

    expect(ctx.currentPhase).toBeNull();
    expect(ctx.estimate.status).toBe('skipped');
  });

  it('merges patch fields without touching unrelated phase state', () => {
    const ctx = structuredClone(V2_CTX);
    ctx.assess.status = 'running';
    ctx.currentPhase = 'assess';

    updatePhaseState(ctx, 'assess', { runAt: '2024-01-01T12:00:00.000Z' });

    expect(ctx.assess.runAt).toBe('2024-01-01T12:00:00.000Z');
    expect(ctx.assess.status).toBe('running');
    expect(ctx.currentPhase).toBe('assess');
  });
});

// ═══════════════════════════════════════════════════
// writeContext
// ═══════════════════════════════════════════════════

describe('writeContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('writes JSON with correct indentation to docs/funky-ai/pipeline/', () => {
    const ctx = { version: 2, name: 'test' };
    vi.mocked(existsSync).mockReturnValue(true);
    writeContext(TARGET_BASE, ctx);

    expect(writeFileSync).toHaveBeenCalledWith(
      join(TARGET_BASE, 'docs', 'funky-ai', 'pipeline', 'context.json'),
      JSON.stringify(ctx, null, 2),
      'utf-8'
    );
  });

  it('writes to custom contextPath when provided', () => {
    const ctx = { version: 2, name: 'test' };
    vi.mocked(existsSync).mockReturnValue(true);
    writeContext(TARGET_BASE, ctx, 'custom/context.json');

    const calls = vi.mocked(writeFileSync).mock.calls;
    const normalizedPath = String(calls[0][0]).replace(/\\/g, '/');
    expect(normalizedPath.endsWith('custom/context.json')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════
// findCanvases
// ═══════════════════════════════════════════════════

describe('findCanvases', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('finds both canvases in docs/funky-ai/canvas/', () => {
    vi.mocked(existsSync).mockImplementation((p) => {
      const str = String(p);
      return str.includes('funky-ai') && (str.endsWith('PROJECT-CANVAS.md') || str.endsWith('INFRA-CANVAS.md'));
    });
    vi.mocked(readFileSync).mockImplementation((p) => {
      if (String(p).endsWith('PROJECT-CANVAS.md')) return 'project content';
      if (String(p).endsWith('INFRA-CANVAS.md')) return 'infra content';
      return '';
    });

    const result = findCanvases(TARGET_BASE);
    expect(result.projectCanvas).toBe('project content');
    expect(result.infraCanvas).toBe('infra content');
    expect(result.unfilledCount).toBe(0);
  });

  it('handles missing canvases', () => {
    vi.mocked(existsSync).mockReturnValue(false);
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const result = findCanvases(TARGET_BASE);
    expect(result.projectCanvas).toBeNull();
    expect(result.infraCanvas).toBeNull();
    expect(result.unfilledCount).toBe(0);
  });
});

// ═══════════════════════════════════════════════════
// countUnfilledSections
// ═══════════════════════════════════════════════════

describe('countUnfilledSections', () => {
  it('counts occurrences', () => {
    expect(countUnfilledSections('[Responde aquí] first [Responde aquí] second')).toBe(2);
  });

  it('returns 0 when no matches', () => {
    expect(countUnfilledSections('no placeholders here')).toBe(0);
  });

  it('returns 0 for empty string', () => {
    expect(countUnfilledSections('')).toBe(0);
  });
});

// ═══════════════════════════════════════════════════
// loadDecisions
// ═══════════════════════════════════════════════════

describe('loadDecisions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('reads from default path (docs/funky-ai/assess/)', () => {
    const content = '# Decisions\nSome text';
    vi.mocked(readFileSync).mockReturnValue(content);

    const result = loadDecisions(TARGET_BASE);
    expect(result).toBe(content);
  });

  it('uses custom decisionsPath', () => {
    const content = '# Custom decisions';
    const customPath = '/custom/path/decisions.md';
    vi.mocked(readFileSync).mockReturnValue(content);

    const result = loadDecisions(TARGET_BASE, customPath);
    expect(result).toBe(content);
  });

  it('returns null if file not found', () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const result = loadDecisions(TARGET_BASE);
    expect(result).toBeNull();
  });

  it('resolves relative decisionsPath to targetBase', () => {
    const content = '# Relative decisions';
    const relativePath = 'relative/decisions.md';
    vi.mocked(readFileSync).mockImplementation((p) => {
      const normalized = String(p).replace(/\\/g, '/');
      if (normalized.endsWith(relativePath)) return content;
      throw new Error('ENOENT');
    });

    const result = loadDecisions(TARGET_BASE, relativePath);
    expect(result).toBe(content);
  });
});
