import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks, CWD, ESTIMATE_TPL_DIR as TPL_DIR, PRICING_GUIDE_TPL_PATH as TPL_PRICING_GUIDE_PATH, PRICING_DECISIONS_TPL_PATH as TPL_PRICING_DECISIONS_PATH, DEFAULT_GUIDE_TEMPLATE, DEFAULT_DECISIONS_TEMPLATE, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, DECISIONS_CONTENT, CHECKLIST_TEMPLATE, TOPIC_FRAGMENT_ROLES, TOPIC_FRAGMENT_SECURITY, TOPIC_FRAGMENT_TRANSACTIONS, TEAM_COST_TEMPLATE, addOptionalTemplates, embedTopicIntoGuide } from './helpers/fsMock.js';
import path from 'path';
import fs from 'fs';
import { generatePricingGuide, generateBriefSection, generateTopicFragments, generateTeamCostReference, generateDecisionsTemplate, generateIAPrompt, generateIAPromptBanner, generateIAPromptFooter, TOPICS } from '../src/utils/estimateDomain.js';

// ═══════════════════════════════════════════════════
// Fase 3.3: generatePricingGuide (contrato 2.1: guía declarativa)
// ═══════════════════════════════════════════════════

describe('generatePricingGuide', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('referencia los archivos del proyecto en lugar de incrustar su contenido', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    applyMocks(mf);

    const result = generatePricingGuide(DECISIONS_CONTENT, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT);
    expect(result).toContain('docs/funky-ai/canvas/brief-funcional.md');
    expect(result).toContain('docs/funky-ai/canvas/PROJECT-CANVAS.md');
    expect(result).toContain('docs/funky-ai/canvas/INFRA-CANVAS.md');
    expect(result).toContain('docs/funky-ai/assess/architecture-decisions.md');
    expect(result).not.toContain('Next.js');
    expect(result).not.toContain('AWS EC2');
    expect(result).not.toContain('React 18');
    expect(result).not.toContain('PostgreSQL');
  });

  it('conserva la zona de incrustación y el header de discusión del template', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    applyMocks(mf);

    const result = generatePricingGuide(DECISIONS_CONTENT, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT);
    expect(result).toContain('<!-- topics -->');
    expect(result).toContain('<!-- /topics -->');
    expect(result).toContain('## Estructura de Discusión');
  });

  it('no deja marcadores de placeholder en la salida ni con inputs nulos', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    applyMocks(mf);

    const result = generatePricingGuide(null, null, null);
    expect(result).not.toContain('{{');
    expect(result).not.toContain('}}');
    expect(result).not.toContain('{{OPTIONAL_SECTIONS}}');
    expect(result).toContain('## Estructura de Discusión');
  });
});

// ═══════════════════════════════════════════════════
// Fase 3.4: generateDecisionsTemplate
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
    expect(result).toContain('Decisiones de Pricing');
  });
});

// ═══════════════════════════════════════════════════
// Fase 3.5: generateIAPrompt
// ═══════════════════════════════════════════════════

describe('generateIAPrompt', () => {
  it('referencia los archivos de material en lugar de incrustar contenido', () => {
    const result = generateIAPrompt('docs/funky-ai/estimate/pricing-guide.md', 'docs/funky-ai/estimate/pricing-decisions.md');
    expect(result).toContain('pricing-guide.md');
    expect(result).toContain('pricing-decisions.md');
    expect(result).toContain('sesión de pricing');
    expect(result).not.toContain('React 18');
    expect(result).not.toContain('AWS EC2');
  });

  it('uses neutral Spanish with proper accents', () => {
    const result = generateIAPrompt('docs/funky-ai/estimate/pricing-guide.md', 'docs/funky-ai/estimate/pricing-decisions.md');
    expect(result).toMatch(/[áéíóúñ]/i);
    expect(result).toContain('precio');
    expect(result).toMatch(/discutir/i);
  });
});

describe('generateIAPromptBanner', () => {
  it('returns the banner text', () => {
    const result = generateIAPromptBanner();
    expect(result).toContain('PROMPT');
    expect(result).toContain('SESIÓN DE PRICING');
  });
});

describe('generateIAPromptFooter', () => {
  it('returns the footer text', () => {
    const result = generateIAPromptFooter();
    expect(result).toContain('====');
  });
});

// ═══════════════════════════════════════════════════
// PR 2 (estimate-redesign): helpers R7-R10, R12, R14
// ═══════════════════════════════════════════════════

describe('generateBriefSection — R7', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('embeds the checklist template when briefPath is true', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const result = generateBriefSection(true, CWD);
    expect(result).toEqual({ content: CHECKLIST_TEMPLATE, usedFallback: false });
  });

  it('embeds the checklist template when briefPath is undefined', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const result = generateBriefSection(undefined, CWD);
    expect(result).toEqual({ content: CHECKLIST_TEMPLATE, usedFallback: false });
  });

  it('reads a user brief file resolved against baseDir when briefPath is a string', () => {
    const mf = {};
    addOptionalTemplates(mf);
    mf[path.join(CWD, 'brief.md')] = 'BRIEF DEL USUARIO';
    applyMocks(mf);

    const result = generateBriefSection('brief.md', CWD);
    expect(result).toEqual({ content: 'BRIEF DEL USUARIO', usedFallback: false });
  });

  it('falls back to the checklist with usedFallback: true when the file is missing', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);
    const missingPath = path.join(CWD, 'missing.md');
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const key = String(p);
      if (key === missingPath) throw new Error('ENOENT');
      if (Object.prototype.hasOwnProperty.call(mf, key)) return mf[key];
      return '';
    });

    const result = generateBriefSection('missing.md', CWD);
    expect(result).toEqual({ content: CHECKLIST_TEMPLATE, usedFallback: true });
  });
});

describe('generateTopicFragments — R8', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an empty string for an empty topics array', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    expect(generateTopicFragments([])).toBe('');
  });

  it('returns only requested fragments in canonical order regardless of request order', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const direct = generateTopicFragments(['roles', 'security']);
    const reversed = generateTopicFragments(['security', 'roles']);
    expect(reversed).toBe(direct);
    expect(direct).toContain(TOPIC_FRAGMENT_ROLES);
    expect(direct).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(direct.indexOf(TOPIC_FRAGMENT_ROLES)).toBeLessThan(direct.indexOf(TOPIC_FRAGMENT_SECURITY));
  });

  it('throws when a fragment file is missing', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const key = String(p);
      if (key === path.join(TPL_DIR, 'topics', 'roles.md')) throw new Error('ENOENT');
      if (Object.prototype.hasOwnProperty.call(mf, key)) return mf[key];
      return '';
    });

    expect(() => generateTopicFragments(['roles'])).toThrow(/roles/);
  });
});

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
