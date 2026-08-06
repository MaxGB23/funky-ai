import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks, CWD, ESTIMATE_TPL_DIR as TPL_DIR, PRICING_GUIDE_TPL_PATH as TPL_PRICING_GUIDE_PATH, PRICING_DECISIONS_TPL_PATH as TPL_PRICING_DECISIONS_PATH, DEFAULT_GUIDE_TEMPLATE, DEFAULT_DECISIONS_TEMPLATE, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, DECISIONS_CONTENT, NEUTRAL_DECISIONS, projectCanvasWith, infraCanvasWith, CHECKLIST_TEMPLATE, TOPIC_FRAGMENT_ROLES, TOPIC_FRAGMENT_SECURITY, TEAM_COST_TEMPLATE, addOptionalTemplates } from './helpers/fsMock.js';
import path from 'path';
import fs from 'fs';
import { generatePricingGuide, generateBriefSection, generateTopicFragments, generateTeamCostReference, generateScopeExclusionTable, generateDecisionsTemplate, generateIAPrompt, generateIAPromptBanner, generateIAPromptFooter } from '../src/utils/estimateDomain.js';
import { TOPICS, DISPLAY_NAMES, STATUS } from '../src/utils/estimateTopics.js';

// ═══════════════════════════════════════════════════
// Fase 3.3: generatePricingGuide
// ═══════════════════════════════════════════════════

describe('generatePricingGuide', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('includes decisions and canvases content when all provided', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    applyMocks(mf);

    const result = generatePricingGuide(DECISIONS_CONTENT, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT);
    expect(result).toContain('Next.js');
    expect(result).toContain('PostgreSQL');
    expect(result).toContain('React 18');
    expect(result).toContain('AWS EC2');
  });

  it('uses placeholder text when decisions is null', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    applyMocks(mf);

    const result = generatePricingGuide(null, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT);
    expect(result).toContain('Sin decisiones documentadas');
    expect(result).toContain('React 18');
  });

  it('uses placeholder text when projectCanvas is null', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    applyMocks(mf);

    const result = generatePricingGuide(DECISIONS_CONTENT, null, CANVAS_INFRA_CONTENT);
    expect(result).toContain('Canvas no disponible');
    expect(result).toContain('AWS EC2');
  });

  it('uses placeholder text when infraCanvas is null', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    applyMocks(mf);

    const result = generatePricingGuide(DECISIONS_CONTENT, CANVAS_PROJECT_CONTENT, null);
    expect(result).toContain('Canvas no disponible');
    expect(result).toContain('React 18');
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
// PR 2 (estimate-redesign): opts + helpers + marker (R7-R10, R12-R14)
// ═══════════════════════════════════════════════════

// Salida legacy esperada: template sin marcador + los 3 replaces (R12). El
// marcador {{OPTIONAL_SECTIONS}} debe desaparecer sin dejar rastro: con
// sections === '' la línea se elimina y la salida 3-arg es byte-idéntica.
const LEGACY_GUIDE = `# Guía de Discusión de Pricing

> Generado por \`funky estimate\`. Use este documento para su sesión de pricing colaborativa.

## Contexto del Proyecto

### Decisiones Arquitectónicas
${DECISIONS_CONTENT}

### PROJECT-CANVAS
${CANVAS_PROJECT_CONTENT}

### INFRA-CANVAS
${CANVAS_INFRA_CONTENT}

## Estructura de Discusión

### 1. Contexto de Pricing (5 min)
Revisar decisiones arquitectónicas y canvases para entender el alcance del proyecto.

### 2. Factores de Costo (10 min)
- Infraestructura: hosting, servicios, herramientas
- Complejidad técnica: stack, integraciones, deuda técnica
- Equipo: seniority, tamaño, dedicación
- Timeline: urgencia, hitos, mantenimiento post-lanzamiento

### 3. Referencia de Infraestructura (10 min)
Costos estimados de los servicios elegidos en los canvases. Investigar precios actuales de cada proveedor.

### 4. Acuerdos de Pricing (15 min)
Definir precio final usando la guía de la sesión. Documentar en pricing-decisions-template.md.

## Instrucciones
1. Revise esta guía con el equipo.
2. Discuta cada factor de costo.
3. Documente los acuerdos en el template de decisiones.`;

describe('generatePricingGuide — R12 legacy byte-identity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('3-arg call produce byte-identical legacy output (marker line stripped)', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    applyMocks(mf);

    const result = generatePricingGuide(DECISIONS_CONTENT, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT);
    expect(result).toBe(LEGACY_GUIDE);
  });

  it('empty opts {} produce byte-identical output to the 3-arg call', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    applyMocks(mf);

    const legacy = generatePricingGuide(DECISIONS_CONTENT, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT);
    const withEmptyOpts = generatePricingGuide(DECISIONS_CONTENT, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, {});
    expect(withEmptyOpts).toBe(legacy);
    expect(withEmptyOpts).not.toContain('{{OPTIONAL_SECTIONS}}');
  });
});

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

describe('generateScopeExclusionTable — R9 ficha', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the ficha heading, table header and 6 rows with exact status copy', () => {
    const result = generateScopeExclusionTable(
      { projectCanvas: projectCanvasWith(), infraCanvas: infraCanvasWith() },
      NEUTRAL_DECISIONS
    );
    expect(result).toContain('## Alcance: ¿Aplica en esta fase?');
    expect(result).toContain('| Tema | Estado |');
    for (const topic of TOPICS) {
      expect(result).toContain(`| ${DISPLAY_NAMES[topic]} | ${STATUS.NOT_APPLICABLE} |`);
    }
  });

  it('maps a detected signal to Aplica with its evidence in the note', () => {
    const canvases = {
      projectCanvas: projectCanvasWith({ 1: 'Dedicación: full-time' }),
      infraCanvas: infraCanvasWith(),
    };
    const result = generateScopeExclusionTable(canvases, NEUTRAL_DECISIONS);
    expect(result).toContain(`| ${DISPLAY_NAMES.roles} | ${STATUS.APPLIES} |`);
    expect(result).toContain('roles → dedicación');
  });

  it('maps an unfilled canvas section to Indeterminado (revisar)', () => {
    const canvases = {
      projectCanvas: projectCanvasWith(),
      infraCanvas: infraCanvasWith({ 1: '[Responde aquí]' }),
    };
    const result = generateScopeExclusionTable(canvases, NEUTRAL_DECISIONS);
    expect(result).toContain(`| ${DISPLAY_NAMES.transactions} | ${STATUS.INDETERMINATE} |`);
  });

  it('maps a missing canvas to Indeterminado (revisar) with canvas ausente in the note', () => {
    const result = generateScopeExclusionTable({}, NEUTRAL_DECISIONS);
    expect(result).toContain(`| ${DISPLAY_NAMES.roles} | ${STATUS.INDETERMINATE} |`);
    expect(result).toContain('roles → canvas ausente');
  });
});

describe('generatePricingGuide — optional sections assembly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inserts ficha → brief → topics → team-cost in design order at the marker', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    addOptionalTemplates(mf);
    applyMocks(mf);

    const out = generatePricingGuide(DECISIONS_CONTENT, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, {
      brief: true,
      topics: ['security'],
      pricingTeam: true,
      scopeFicha: true,
    });

    const idx = (s) => out.indexOf(s);
    const fichaIdx = idx('## Alcance: ¿Aplica en esta fase?');
    const briefIdx = idx('## Brief Funcional');
    const topicIdx = idx('## Seguridad');
    const teamIdx = idx('## Referencia de Costos de Equipo');
    expect(fichaIdx).toBeGreaterThan(-1);
    expect(briefIdx).toBeGreaterThan(fichaIdx);
    expect(topicIdx).toBeGreaterThan(briefIdx);
    expect(teamIdx).toBeGreaterThan(topicIdx);
    expect(out).not.toContain('{{OPTIONAL_SECTIONS}}');
  });

  it('does not include optional sections when opts is empty', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    applyMocks(mf);

    const out = generatePricingGuide(DECISIONS_CONTENT, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, {});
    expect(out).not.toContain('## Brief Funcional');
    expect(out).not.toContain('## Alcance: ¿Aplica en esta fase?');
    expect(out).not.toContain('## Referencia de Costos de Equipo');
    expect(out).not.toContain('{{OPTIONAL_SECTIONS}}');
  });
});
