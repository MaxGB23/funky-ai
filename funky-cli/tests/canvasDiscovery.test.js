import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs', () => {
  const mockFns = {
    existsSync: vi.fn(),
    readFileSync: vi.fn()
  };
  return {
    ...mockFns,
    default: mockFns
  };
});

import { readFileSync, existsSync } from 'node:fs';
import { findCanvases, countUnfilledSections } from '../src/utils/canvasDiscovery.js';

const TARGET_BASE = '/test/project';

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
      return /funky-ai/.test(str) && (str.endsWith('PROJECT-CANVAS.md') || str.endsWith('INFRA-CANVAS.md'));
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
