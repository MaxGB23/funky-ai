import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks, PRICING_DECISIONS_TPL_PATH as TPL_PRICING_DECISIONS_PATH, DEFAULT_DECISIONS_TEMPLATE, TEAM_COST_TEMPLATE, addOptionalTemplates } from './helpers/fsMock.js';
import fs from 'fs';
import { generateTeamCostReference, generateDecisionsTemplate, TOPICS } from '../src/utils/estimateDomain.js';

// ═══════════════════════════════════════════════════
// Fase 3.4: generateDecisionsTemplate (D2: fecha inyectada)
// ═══════════════════════════════════════════════════

describe('generateDecisionsTemplate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('interpolates date in ISO format (YYYY-MM-DD)', () => {
    const mf = {};
    mf[TPL_PRICING_DECISIONS_PATH] = DEFAULT_DECISIONS_TEMPLATE;
    applyMocks(mf);

    const result = generateDecisionsTemplate();
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const expectedDate = `${year}-${month}-${day}`;

    expect(result).toContain(expectedDate);
    expect(result).toMatch(/^# Decisiones de Pricing$/m);
  });

  it('is deterministic when a fixed date is injected (D2)', () => {
    const mf = {};
    mf[TPL_PRICING_DECISIONS_PATH] = DEFAULT_DECISIONS_TEMPLATE;
    applyMocks(mf);

    const result = generateDecisionsTemplate('2024-01-02');
    expect(result).toMatch(/2024-01-02/);
  });
});

// ═══════════════════════════════════════════════════
// PR 2 (estimate-redesign): helpers R7-R10, R12, R14
// ═══════════════════════════════════════════════════

describe('generateTeamCostReference — R10', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the team-cost reference template content', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const result = generateTeamCostReference();
    expect(result).toBe(TEAM_COST_TEMPLATE);
  });

  it('throws when the template is missing', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    expect(() => generateTeamCostReference()).toThrow(/team-cost-reference-template/);
  });
});

describe('TOPICS — orden canónico de flags (R8/R13)', () => {
  it('expone el orden canónico de los 6 tópicos', () => {
    expect(TOPICS).toEqual(['roles', 'multi-tenant', 'transactions', 'security', 'concurrency', 'integrations']);
  });
});
