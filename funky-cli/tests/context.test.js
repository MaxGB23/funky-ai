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
import { initContext, readContext, writeContext, findCanvases, countUnfilledSections, loadDecisions } from '../src/utils/context.js';

const TARGET_BASE = '/test/project';

// ═══════════════════════════════════════════════════
// initContext
// ═══════════════════════════════════════════════════

describe('initContext', () => {
  it('returns correct default structure with version: 1', () => {
    const ctx = initContext();
    expect(ctx.version).toBe(1);
    expect(typeof ctx.createdAt).toBe('string');
    expect(ctx.assess).toEqual({ runAt: null, dynamicQuestions: [] });
    expect(ctx.estimate).toEqual({ runAt: null });
    expect(ctx.pipeline).toEqual({ lastCommand: null, completed: [] });
  });
});

// ═══════════════════════════════════════════════════
// readContext
// ═══════════════════════════════════════════════════

describe('readContext', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns parsed object when file exists and valid', () => {
    const data = { version: 1, assess: { runAt: null } };
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(data));

    const result = readContext(TARGET_BASE);
    expect(result).toEqual(data);
  });

  it('returns null when file missing', () => {
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const result = readContext(TARGET_BASE);
    expect(result).toBeNull();
  });

  it('returns null when invalid JSON', () => {
    vi.mocked(readFileSync).mockReturnValue('not valid json');

    const result = readContext(TARGET_BASE);
    expect(result).toBeNull();
  });

  it('reads from custom contextPath when provided', () => {
    const data = { version: 1, assess: { runAt: null } };
    vi.mocked(readFileSync).mockImplementation((p) => {
      const normalized = String(p).replace(/\\/g, '/');
      if (normalized.endsWith('custom/context.json')) return JSON.stringify(data);
      throw new Error('ENOENT');
    });

    const result = readContext(TARGET_BASE, 'custom/context.json');
    expect(result).toEqual(data);

    const calls = vi.mocked(readFileSync).mock.calls;
    const normalizedPath = String(calls[0][0]).replace(/\\/g, '/');
    expect(normalizedPath.endsWith('custom/context.json')).toBe(true);
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
    const ctx = { version: 1, name: 'test' };
    vi.mocked(existsSync).mockReturnValue(true);
    writeContext(TARGET_BASE, ctx);

    expect(writeFileSync).toHaveBeenCalledWith(
      join(TARGET_BASE, 'docs', 'funky-ai', 'pipeline', 'context.json'),
      JSON.stringify(ctx, null, 2),
      'utf-8'
    );
  });

  it('writes to custom contextPath when provided', () => {
    const ctx = { version: 1, name: 'test' };
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
