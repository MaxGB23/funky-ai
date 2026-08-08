import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks, CWD, ESTIMATE_TPL_DIR as TPL_DIR, PRICING_GUIDE_TPL_PATH as TPL_PRICING_GUIDE_PATH, PRICING_DECISIONS_TPL_PATH as TPL_PRICING_DECISIONS_PATH, DEFAULT_GUIDE_TEMPLATE, DEFAULT_DECISIONS_TEMPLATE, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, DECISIONS_CONTENT, CHECKLIST_TEMPLATE, TOPIC_FRAGMENT_ROLES, TOPIC_FRAGMENT_SECURITY, TOPIC_FRAGMENT_TRANSACTIONS, TEAM_COST_TEMPLATE, addOptionalTemplates } from './helpers/fsMock.js';
import path from 'path';
import fs from 'fs';
import { generatePricingGuide, generateBriefSection, generateTopicFragments, generateTeamCostReference, generateDecisionsTemplate, generateIAPrompt, generateIAPromptBanner, generateIAPromptFooter, TOPICS, buildPricingGuide, embedTopicSections, detectEmbeddedTopics, refreshPricingGuideBase, validatePricingGuideTemplate } from '../src/utils/estimateDomain.js';

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

// ═══════════════════════════════════════════════════
// Fase 2, 2.3: mecanismo de incrustación aditiva (TDD red)
// La implementación vive en la tanda siguiente (2.4); estos tests
// expresan el CONTRATO y caen rojos con "Not implemented (Fase 2, 2.3)".
// ═══════════════════════════════════════════════════

describe('buildPricingGuide — 2.3a', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('produce una guía fresca desde el template base con la zona de topics y el header de discusión', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    addOptionalTemplates(mf);
    applyMocks(mf);

    const guide = buildPricingGuide([]);
    expect(guide).toContain('<!-- topics -->');
    expect(guide).toContain('<!-- /topics -->');
    expect(guide).toContain('## Estructura de Discusión');
  });

  it('valida el template base y lanza error de instalación claro si no tiene zona o header (1.2)', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = '# Guía sin zona ni header';
    applyMocks(mf);

    expect(() => buildPricingGuide([])).toThrow(/instalaci[oó]n/i);
  });
});

describe('embedTopicSections — 2.3b (aditivo, orden canónico)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('incrusta una sección de topic ausente sin tocar el resto de la guía', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const seeded = DEFAULT_GUIDE_TEMPLATE
      .replace('<!-- topic:roles -->\n<!-- /topic:roles -->', '<!-- topic:roles -->\n' + TOPIC_FRAGMENT_ROLES + '\n<!-- /topic:roles -->');
    const result = embedTopicSections(seeded, ['security']);

    expect(result).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(result).toContain(TOPIC_FRAGMENT_ROLES);
    expect(result.indexOf(TOPIC_FRAGMENT_ROLES)).toBeLessThan(result.indexOf(TOPIC_FRAGMENT_SECURITY));
    expect(result).toContain('## Estructura de Discusión');
  });

  it('es aditivo en orden canónico: respeta el orden de TOPICS aunque se pidan en otro orden', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const result = embedTopicSections(DEFAULT_GUIDE_TEMPLATE, ['security', 'roles']);
    const idxRoles = result.indexOf('<!-- topic:roles -->');
    const idxSecurity = result.indexOf('<!-- topic:security -->');
    expect(idxRoles).toBeGreaterThan(-1);
    expect(idxSecurity).toBeGreaterThan(-1);
    expect(idxRoles).toBeLessThan(idxSecurity);
  });

  it('no duplica una sección ya presente (idempotente)', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const once = embedTopicSections(DEFAULT_GUIDE_TEMPLATE, ['roles']);
    const twice = embedTopicSections(once, ['roles']);
    expect(twice).toBe(once);
    expect(twice.match(/<!-- topic:roles -->/g)).toHaveLength(1);
  });
});

describe('detectEmbeddedTopics — 2.3', () => {
  it('detecta los topics presentes por marcador exacto', () => {
    const guide = DEFAULT_GUIDE_TEMPLATE
      .replace('<!-- topic:roles -->\n<!-- /topic:roles -->', '<!-- topic:roles -->\n' + TOPIC_FRAGMENT_ROLES + '\n<!-- /topic:roles -->')
      .replace('<!-- topic:security -->\n<!-- /topic:security -->', '<!-- topic:security -->\n' + TOPIC_FRAGMENT_SECURITY + '\n<!-- /topic:security -->');

    const result = detectEmbeddedTopics(guide);
    expect(result).toEqual(expect.arrayContaining(['roles', 'security']));
    expect(result.sort()).toEqual(['roles', 'security']);
  });

  it('devuelve lista vacía cuando no hay topics incrustados', () => {
    expect(detectEmbeddedTopics(DEFAULT_GUIDE_TEMPLATE)).toEqual([]);
  });
});

describe('refreshPricingGuideBase — 2.3e (reincrusta TODOS los topics)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reconstruye la base fresca y reincrusta todos los topics detectados, ninguno se pierde', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    addOptionalTemplates(mf);
    applyMocks(mf);

    const stale = DEFAULT_GUIDE_TEMPLATE
      .replace('<!-- topic:roles -->\n<!-- /topic:roles -->', '<!-- topic:roles -->\n' + TOPIC_FRAGMENT_ROLES + '\n<!-- /topic:roles -->')
      .replace('<!-- topic:transactions -->\n<!-- /topic:transactions -->', '<!-- topic:transactions -->\n' + TOPIC_FRAGMENT_TRANSACTIONS + '\n<!-- /topic:transactions -->');

    const result = refreshPricingGuideBase(DEFAULT_GUIDE_TEMPLATE, stale);
    expect(result).toContain(TOPIC_FRAGMENT_ROLES);
    expect(result).toContain(TOPIC_FRAGMENT_TRANSACTIONS);
    expect(result).toContain('## Estructura de Discusión');
  });
});

describe('validatePricingGuideTemplate — 1.2', () => {
  it('acepta un template con zona de topics y header de discusión', () => {
    expect(() => validatePricingGuideTemplate(DEFAULT_GUIDE_TEMPLATE)).not.toThrow();
  });

  it('lanza error de instalación claro si falta la zona de topics', () => {
    expect(() => validatePricingGuideTemplate('# Guía sin zona')).toThrow(/instalaci[oó]n/i);
  });

  it('lanza error de instalación claro si falta ## Estructura de Discusión', () => {
    const noHeader = DEFAULT_GUIDE_TEMPLATE.replace('## Estructura de Discusión', '## Otra Sección');
    expect(() => validatePricingGuideTemplate(noHeader)).toThrow(/Estructura de Discusión/i);
  });
});

describe('TOPICS — orden canónico de flags (R8/R13)', () => {
  it('expone el orden canónico de los 6 tópicos', () => {
    expect(TOPICS).toEqual(['roles', 'multi-tenant', 'transactions', 'security', 'concurrency', 'integrations']);
  });
});
