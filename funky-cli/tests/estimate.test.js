import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Manual mock: provide both default export (for `import fs from 'fs'`)
// and named exports (for `import { writeFileSync } from 'fs'`)
const sharedFsMock = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  copyFileSync: vi.fn(),
  statSync: vi.fn(),
  lstatSync: vi.fn(),
  realpathSync: vi.fn(),
}));

vi.mock('fs', () => ({ ...sharedFsMock, default: sharedFsMock }));
vi.mock('node:fs', () => ({ ...sharedFsMock, default: sharedFsMock }));

import { generatePricingGuide, generateBriefSection, generateTopicFragments, generateTeamCostReference, generateScopeExclusionTable, generateDecisionsTemplate, generateIAPrompt, generateIAPromptBanner, generateIAPromptFooter } from '../src/utils/estimateDomain.js';
import { estimateCommand, runEstimate } from '../src/commands/estimate.js';
import { surfaceEstimateTopics, TOPICS, DISPLAY_NAMES, STATUS } from '../src/utils/estimateTopics.js';

const __testDir = path.dirname(fileURLToPath(import.meta.url));
const CWD = process.cwd();
const TPL_DIR = path.resolve(__testDir, '../src/templates/estimate');
const TPL_PRICING_GUIDE_PATH = path.join(TPL_DIR, 'pricing-guide-template.md');
const TPL_PRICING_DECISIONS_PATH = path.join(TPL_DIR, 'pricing-decisions-template.md');

// Canvas location: docs/funky-ai/canvas/
const CANVAS_DIR = path.join(CWD, 'docs', 'funky-ai', 'canvas');
// Decisions location: docs/funky-ai/assess/
const DECISIONS_DIR = path.join(CWD, 'docs', 'funky-ai', 'assess');
// Context location: docs/funky-ai/pipeline/
const CONTEXT_DIR = path.join(CWD, 'docs', 'funky-ai', 'pipeline');

const DEFAULT_GUIDE_TEMPLATE = `# Guía de Discusión de Pricing

> Generado por \`funky estimate\`. Use este documento para su sesión de pricing colaborativa.

## Contexto del Proyecto

### Decisiones Arquitectónicas
{{DECISIONS_CONTENT}}

### PROJECT-CANVAS
{{PROJECT_CANVAS_CONTENT}}

### INFRA-CANVAS
{{INFRA_CANVAS_CONTENT}}
{{OPTIONAL_SECTIONS}}
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

const DEFAULT_DECISIONS_TEMPLATE = `# Decisiones de Pricing

> Fecha: {{DATE}}

## Decisiones

### [Decisión 1: Título breve]
- **Decisión:** ...
- **Justificación:** ...
- **Impacto en presupuesto:** ...
- **Alternativas consideradas:** ...
- **Fecha:** {{DATE}}

### [Decisión 2: Título breve]
- **Decisión:** ...
- **Justificación:** ...
- **Impacto en presupuesto:** ...
- **Alternativas consideradas:** ...
- **Fecha:** {{DATE}}`;

const CANVAS_PROJECT_CONTENT = 'React 18 + Next.js 14\nPatrón: Clean Architecture';
const CANVAS_INFRA_CONTENT = 'AWS EC2 + PostgreSQL\nDeploy: Docker Compose';
const DECISIONS_CONTENT = '# Decisiones\n- Stack: Next.js\n- DB: PostgreSQL';

function createMockFiles() {
  return {
    [TPL_PRICING_GUIDE_PATH]: DEFAULT_GUIDE_TEMPLATE,
    [TPL_PRICING_DECISIONS_PATH]: DEFAULT_DECISIONS_TEMPLATE,
  };
}

function addCanvas(mockFiles, name, content) {
  mockFiles[path.join(CANVAS_DIR, name)] = content;
}

function addDecisions(mockFiles, content) {
  mockFiles[path.join(DECISIONS_DIR, 'architecture-decisions.md')] = content;
}

function applyMocks(mockFiles) {
  vi.mocked(fs.existsSync).mockImplementation((p) => {
    return Object.prototype.hasOwnProperty.call(mockFiles, String(p));
  });
  vi.mocked(fs.readFileSync).mockImplementation((p, enc) => {
    const key = String(p);
    if (Object.prototype.hasOwnProperty.call(mockFiles, key)) {
      return mockFiles[key];
    }
    return '';
  });
}

function addContextJson(mf, data) {
  mf[path.join(CONTEXT_DIR, 'context.json')] = JSON.stringify(data);
}

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
// Fase 3.6: Integration — full command flow
// ═══════════════════════════════════════════════════

describe('estimateCommand — integration', () => {
  let exitSpy;
  let stderrSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
    // Silence Commander.js stderr noise ("too many arguments")
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    exitSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it('exits 0 with full flow (decisions + canvases)', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    estimateCommand.parse(['node', 'estimate'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    expect(writeCalls.some(c => String(c[0]).includes('pricing-guide.md'))).toBe(true);
    expect(writeCalls.some(c => String(c[0]).includes('pricing-decisions.md'))).toBe(true);
  });

  it('warns when decisions are missing and exits 0', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    estimateCommand.parse(['node', 'estimate'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(warnSpy).toHaveBeenCalled();
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('architecture-decisions'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('warns when project canvas is missing and exits 0', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    estimateCommand.parse(['node', 'estimate'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('PROJECT-CANVAS'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('warns on unfilled canvas sections and exits 0', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', 'Framework: [Responde aquí]');
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    estimateCommand.parse(['node', 'estimate'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('[Responde aquí]'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('exits 0 even when nothing exists (graceful degradation)', () => {
    const mf = createMockFiles();
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    estimateCommand.parse(['node', 'estimate'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('writes pricing-guide.md and pricing-decisions-template.md', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    estimateCommand.parse(['node', 'estimate'], { from: 'user' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const guideCall = writeCalls.find(c => String(c[0]).includes('pricing-guide.md'));
    const decisionsCall = writeCalls.find(c => String(c[0]).includes('pricing-decisions.md'));

    expect(guideCall).toBeTruthy();
    expect(decisionsCall).toBeTruthy();

    const guideContent = String(guideCall[1]);
    const decisionsContent = String(decisionsCall[1]);

    expect(guideContent).toContain('Guía de Discusión de Pricing');
    expect(decisionsContent).toContain('Decisiones de Pricing');
  });

  it('overwrites pricing-guide.md when it already exists (derived artifact)', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    mf[path.join(CWD, 'docs', 'funky-ai', 'estimate', 'pricing-guide.md')] = '# Guía obsoleta previa';
    applyMocks(mf);

    estimateCommand.parse(['node', 'estimate'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const guideCall = writeCalls.find(c => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    expect(guideContent).toContain('Guía de Discusión de Pricing');
    expect(guideContent).not.toContain('Guía obsoleta previa');
  });

  it('does NOT overwrite an existing pricing-decisions.md (team living doc)', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    mf[path.join(CWD, 'docs', 'funky-ai', 'estimate', 'pricing-decisions.md')] = '# Acuerdos previos del equipo';
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    estimateCommand.parse(['node', 'estimate'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const decisionsCall = writeCalls.find(c => String(c[0]).includes('pricing-decisions.md'));
    expect(decisionsCall).toBeFalsy();
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('pricing-decisions.md') && m.includes('ya existe'))).toBe(true);

    warnSpy.mockRestore();
  });
});

// ═══════════════════════════════════════════════════
// --context flag tests
// ═══════════════════════════════════════════════════

describe('--context flag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
  });

  it('prints error when context file is missing', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    runEstimate(CWD, { context: true });

    expect(errorSpy).toHaveBeenCalled();
    // Should NOT have written output (early return)
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const guideCall = writeCalls.find(c => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeFalsy();

    errorSpy.mockRestore();
  });

  it('uses decisions from filesystem when --context is provided', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, {
      assess: { decisionsFile: null, runAt: null, dynamicQuestions: [] },
      estimate: { runAt: null },
      pipeline: { lastCommand: null, completed: [] }
    });
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    runEstimate(CWD, { context: true });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const guideCall = writeCalls.find(c => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    expect(guideContent).toContain('Next.js');  // from DECISIONS_CONTENT
  });

  it('reads decisions from ctx.assess.decisionsFile when --context provides a custom path', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    // Ruta custom de decisiones (no la default) registrada por assess en context.json
    mf[path.join(DECISIONS_DIR, 'custom-decisions.md')] = '# Decisiones custom\n- Stack: Vue';
    addContextJson(mf, {
      assess: { decisionsFile: 'docs/funky-ai/assess/custom-decisions.md', runAt: '2024-01-01T00:00:00.000Z', dynamicQuestions: [] },
      estimate: { runAt: null },
      pipeline: { lastCommand: null, completed: [] }
    });
    applyMocks(mf);

    runEstimate(CWD, { context: true });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const guideCall = writeCalls.find(c => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    // Se leyeron las decisiones desde la ruta custom (no el default)
    expect(guideContent).toContain('Vue');
    expect(guideContent).not.toContain('DB: PostgreSQL');
  });

  it('writes estimate timestamp to context.json', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    addContextJson(mf, {
      assess: { runAt: null, dynamicQuestions: [] },
      estimate: { runAt: null },
      pipeline: { lastCommand: null, completed: [] }
    });
    applyMocks(mf);

    runEstimate(CWD, { context: true });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).endsWith('context.json'));
    expect(contextCall).toBeTruthy();
    const writtenData = JSON.parse(contextCall[1]);
    expect(writtenData.estimate.runAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it('honors a custom context path', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    mf[path.join(CWD, 'custom', 'context.json')] = JSON.stringify({
      assess: { decisionsFile: null, runAt: null, dynamicQuestions: [] },
      estimate: { runAt: null },
      pipeline: { lastCommand: null, completed: [] }
    });
    applyMocks(mf);

    runEstimate(CWD, { context: 'custom/context.json' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).replace(/\\/g, '/').endsWith('custom/context.json'));
    expect(contextCall).toBeTruthy();
    const writtenData = JSON.parse(contextCall[1]);
    expect(writtenData.estimate.runAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

// ═══════════════════════════════════════════════════
// PR 1 (estimate-redesign): surfaceEstimateTopics
// ═══════════════════════════════════════════════════

const NEUTRAL_DECISIONS = '# Decisiones\n- Stack: Next.js\n- DB: PostgreSQL';

function projectCanvasWith(overrides = {}) {
  const sections = {
    1: 'Next.js App Router',
    2: 'Clean Architecture',
    3: 'React Query + Zustand',
    4: 'Tailwind',
    5: 'Vitest',
  };
  const merged = { ...sections, ...overrides };
  return `# PROJECT CANVAS

## 1. Framework Base
${merged[1]}

## 2. Patrón Arquitectónico
${merged[2]}

## 3. Gestión de Estado
${merged[3]}

## 4. Estrategia UI
${merged[4]}

## 5. Estrategia de Testing
${merged[5]}`;
}

function infraCanvasWith(overrides = {}) {
  const sections = {
    1: 'PostgreSQL con Prisma',
    2: 'No hay sistema de usuarios',
    3: 'Biome',
    4: 'Vercel + GitHub Actions',
  };
  const merged = { ...sections, ...overrides };
  return `# INFRA CANVAS

## 1. Base de Datos / ORM
${merged[1]}

## 2. Autenticación
${merged[2]}

## 3. Linter / Formatter
${merged[3]}

## 4. Deployment & CI/CD
${merged[4]}`;
}

// Por tópico: qué canvas usa, en qué región sembrar la señal y qué evidencia
// debe resultar. Lockea las Status Rules y los sets de señales del design.
const TOPIC_FIXTURES = [
  {
    topic: 'roles',
    canvasKey: 'projectCanvas',
    canvasWith: projectCanvasWith,
    section: 'whole',
    regionContent: 'Dedicación: full-time',
    regionEvidence: 'dedicación',
    upperContent: 'DEDICACIÓN 100%',
    upperEvidence: 'dedicación',
    decisionsSignal: 'dedicación 50%',
    decisionsEvidence: 'dedicación',
  },
  {
    topic: 'multi-tenant',
    canvasKey: 'infraCanvas',
    canvasWith: infraCanvasWith,
    section: 1,
    regionContent: 'Aislamiento por tenant',
    regionEvidence: 'tenant',
    upperContent: 'RLS HABILITADO',
    upperEvidence: 'RLS',
    decisionsSignal: 'Aislamiento por tenant',
    decisionsEvidence: 'tenant',
  },
  {
    topic: 'transactions',
    canvasKey: 'infraCanvas',
    canvasWith: infraCanvasWith,
    section: 1,
    regionContent: 'Procesamos pagos',
    regionEvidence: 'pagos',
    upperContent: 'USAMOS STRIPE',
    upperEvidence: 'stripe',
    decisionsSignal: 'El saldo se guarda en un ledger',
    decisionsEvidence: 'saldo',
  },
  {
    topic: 'security',
    canvasKey: 'infraCanvas',
    canvasWith: infraCanvasWith,
    section: 2,
    regionContent: 'Login con JWT',
    regionEvidence: 'jwt',
    upperContent: 'USAMOS JWT',
    upperEvidence: 'jwt',
    decisionsSignal: 'rate limit por api key',
    decisionsEvidence: 'api-key',
  },
  {
    topic: 'concurrency',
    canvasKey: 'infraCanvas',
    canvasWith: infraCanvasWith,
    section: 1,
    regionContent: 'Cola de jobs',
    regionEvidence: 'cola',
    upperContent: 'REDIS + WORKER',
    upperEvidence: 'worker',
    decisionsSignal: 'Eventos con retry',
    decisionsEvidence: 'retry',
  },
  {
    topic: 'integrations',
    canvasKey: 'projectCanvas',
    canvasWith: projectCanvasWith,
    section: 'whole',
    regionContent: 'Recibimos webhooks',
    regionEvidence: 'webhook',
    upperContent: 'CRM + ERP',
    upperEvidence: 'crm',
    decisionsSignal: 'Slack para terceros',
    decisionsEvidence: 'slack',
  },
];

describe('surfaceEstimateTopics', () => {
  describe.each(TOPIC_FIXTURES)('$topic', (fixture) => {
    const {
      topic, canvasKey, canvasWith, section, regionContent, regionEvidence,
      upperContent, upperEvidence, decisionsSignal, decisionsEvidence,
    } = fixture;

    const signalFor = (result) => result.signals.find((s) => s.topic === topic);

    function withRegion(content) {
      const overrides = section === 'whole' ? { 1: content } : { [section]: content };
      return { [canvasKey]: canvasWith(overrides) };
    }

    it('Aplica cuando la región relevante contiene una señal', () => {
      const result = surfaceEstimateTopics(withRegion(regionContent), NEUTRAL_DECISIONS);
      expect(signalFor(result)).toEqual({ topic, status: STATUS.APPLIES, evidence: regionEvidence });
    });

    it('Aplica cuando la señal aparece en mayúsculas (case-insensitive)', () => {
      const result = surfaceEstimateTopics(withRegion(upperContent), NEUTRAL_DECISIONS);
      expect(signalFor(result)).toEqual({ topic, status: STATUS.APPLIES, evidence: upperEvidence });
    });

    it('Aplica cuando la señal está solo en las decisiones', () => {
      const result = surfaceEstimateTopics({ [canvasKey]: canvasWith() }, decisionsSignal);
      expect(signalFor(result)).toEqual({ topic, status: STATUS.APPLIES, evidence: decisionsEvidence });
    });

    it('No aplica según lo documentado cuando no hay señales ni marcadores', () => {
      const result = surfaceEstimateTopics({ [canvasKey]: canvasWith() }, NEUTRAL_DECISIONS);
      expect(signalFor(result)).toEqual({
        topic,
        status: STATUS.NOT_APPLICABLE,
        evidence: 'sin señales en lo documentado',
      });
    });

    it('Indeterminado (revisar) cuando la región relevante está sin completar', () => {
      const result = surfaceEstimateTopics(withRegion('[Responde aquí]'), NEUTRAL_DECISIONS);
      expect(signalFor(result)).toEqual({
        topic,
        status: STATUS.INDETERMINATE,
        evidence: 'sección sin completar',
      });
    });

    it('Indeterminado (revisar) cuando el canvas está ausente', () => {
      const result = surfaceEstimateTopics({}, NEUTRAL_DECISIONS);
      expect(signalFor(result)).toEqual({
        topic,
        status: STATUS.INDETERMINATE,
        evidence: 'canvas ausente',
      });
    });
  });

  it('devuelve 6 señales en orden canónico (topic key == flag name)', () => {
    const result = surfaceEstimateTopics({}, '');
    expect(result.signals).toHaveLength(6);
    expect(result.signals.map((s) => s.topic)).toEqual(TOPICS);
    expect(TOPICS).toEqual(['roles', 'multi-tenant', 'transactions', 'security', 'concurrency', 'integrations']);
  });

  it('expone DISPLAY_NAMES y STATUS con el copy exacto del design', () => {
    expect(DISPLAY_NAMES).toEqual({
      roles: 'Roles del equipo',
      'multi-tenant': 'Multi-tenant',
      transactions: 'Transacciones',
      security: 'Seguridad',
      concurrency: 'Concurrencia',
      integrations: 'Integraciones',
    });
    expect(STATUS).toEqual({
      APPLIES: 'Aplica',
      NOT_APPLICABLE: 'No aplica según lo documentado',
      INDETERMINATE: 'Indeterminado (revisar)',
    });
  });

  it('precedencia: sección sin completar gana sobre señal detectada', () => {
    const result = surfaceEstimateTopics(
      { infraCanvas: infraCanvasWith({ 1: 'Pagos con Stripe\n[Responde aquí]' }) },
      NEUTRAL_DECISIONS
    );
    const txn = result.signals.find((s) => s.topic === 'transactions');
    expect(txn).toEqual({
      topic: 'transactions',
      status: STATUS.INDETERMINATE,
      evidence: 'sección sin completar',
    });
  });

  it('solo las regiones relevantes del canvas cuentan', () => {
    const infra = infraCanvasWith({ 3: '[Responde aquí]' });
    const result = surfaceEstimateTopics({ infraCanvas: infra }, NEUTRAL_DECISIONS);
    expect(result.signals.find((s) => s.topic === 'transactions').status).toBe(STATUS.NOT_APPLICABLE);

    const infra2 = infraCanvasWith({ 2: '[Responde aquí]' });
    const result2 = surfaceEstimateTopics({ infraCanvas: infra2 }, NEUTRAL_DECISIONS);
    expect(result2.signals.find((s) => s.topic === 'multi-tenant').status).toBe(STATUS.INDETERMINATE);

    const infra4 = infraCanvasWith({ 4: '[Responde aquí]' });
    const result4 = surfaceEstimateTopics({ infraCanvas: infra4 }, NEUTRAL_DECISIONS);
    expect(result4.signals.find((s) => s.topic === 'security').status).toBe(STATUS.INDETERMINATE);
    expect(result4.signals.find((s) => s.topic === 'concurrency').status).toBe(STATUS.INDETERMINATE);
    expect(result4.signals.find((s) => s.topic === 'transactions').status).toBe(STATUS.NOT_APPLICABLE);
  });

  it('normaliza el separador opcional de la señal como evidencia', () => {
    const result = surfaceEstimateTopics(
      { projectCanvas: projectCanvasWith({ 1: 'Contratación part time' }) },
      ''
    );
    const roles = result.signals.find((s) => s.topic === 'roles');
    expect(roles).toEqual({ topic: 'roles', status: STATUS.APPLIES, evidence: 'part-time' });
  });

  it('trata decisiones ausentes como vacías', () => {
    const result = surfaceEstimateTopics({
      projectCanvas: projectCanvasWith(),
      infraCanvas: infraCanvasWith(),
    });
    expect(result.signals).toHaveLength(6);
    expect(result.signals.every((s) => s.status === STATUS.NOT_APPLICABLE)).toBe(true);
  });

  it('acepta el marcador sin completar en mayúsculas', () => {
    const result = surfaceEstimateTopics(
      { infraCanvas: infraCanvasWith({ 1: '[RESPONDE AQUÍ]' }) },
      NEUTRAL_DECISIONS
    );
    expect(result.signals.find((s) => s.topic === 'transactions').status).toBe(STATUS.INDETERMINATE);
  });
});

// ═══════════════════════════════════════════════════
// PR 2 (estimate-redesign): opts + helpers + marker (R7-R10, R12-R14)
// ═══════════════════════════════════════════════════

const CHECKLIST_TEMPLATE = `## Brief Funcional

**Producto**
- ¿Qué problema resuelve el producto?`;

const TOPIC_FRAGMENT_ROLES = `## Roles del equipo

Impacto en costos:
- La composición del equipo domina el presupuesto.`;

const TOPIC_FRAGMENT_SECURITY = `## Seguridad

Impacto en costos:
- Auth y cumplimiento agregan esfuerzo recurrente.`;

const TEAM_COST_TEMPLATE = `## Referencia de Costos de Equipo

### Fórmula de referencia
Costo por rol = rol × seniority × dedicación × duración`;

function addOptionalTemplates(mf) {
  mf[path.join(TPL_DIR, 'brief-questions-template.md')] = CHECKLIST_TEMPLATE;
  mf[path.join(TPL_DIR, 'topics', 'roles.md')] = TOPIC_FRAGMENT_ROLES;
  mf[path.join(TPL_DIR, 'topics', 'security.md')] = TOPIC_FRAGMENT_SECURITY;
  mf[path.join(TPL_DIR, 'team-cost-reference-template.md')] = TEAM_COST_TEMPLATE;
}

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

// ═══════════════════════════════════════════════════
// PR 3 (estimate-redesign): CLI flags + suggestions + summary (R7-R11, R13-R14)
// ═══════════════════════════════════════════════════

const TOPIC_FRAGMENT_MULTI_TENANT = `## Multi-tenant

Impacto en costos:
- Aislamiento por tenant agrega complejidad de datos y permisos.`;

function guideFromWriteCalls(writeCalls) {
  const call = writeCalls.find((c) => String(c[0]).includes('pricing-guide.md'));
  return call ? String(call[1]) : null;
}

describe('estimateCommand — optional flags (R7-R11, R13-R14)', () => {
  let exitSpy;
  let stderrSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
    // Silence Commander.js stderr noise ("unknown option")
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    exitSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  function standardMocks() {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);
    return mf;
  }

  it('R8: --security --roles embeds both fragments in canonical order', () => {
    standardMocks();

    estimateCommand.parse(['node', 'estimate', '--security', '--roles'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('Guía de Discusión de Pricing');
    expect(guide).toContain(TOPIC_FRAGMENT_ROLES);
    expect(guide).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(guide.indexOf(TOPIC_FRAGMENT_ROLES)).toBeLessThan(guide.indexOf(TOPIC_FRAGMENT_SECURITY));
  });

  it('R8/R9: no topic flags → no topic sections, but the scope ficha is always present', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    estimateCommand.parse(['node', 'estimate'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('## Alcance: ¿Aplica en esta fase?');
    expect(guide).toContain('| Tema | Estado |');
    expect(guide).not.toContain('## Roles del equipo');
    expect(guide).not.toContain('## Seguridad');
    expect(guide).not.toContain('## Brief Funcional');
    expect(guide).not.toContain('## Referencia de Costos de Equipo');
  });

  it('R8: accepts --multi-tenant (Commander camelCase) and embeds its fragment', () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    mf[path.join(TPL_DIR, 'topics', 'multi-tenant.md')] = TOPIC_FRAGMENT_MULTI_TENANT;
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    estimateCommand.parse(['node', 'estimate', '--multi-tenant'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain(TOPIC_FRAGMENT_MULTI_TENANT);
    expect(guide).not.toContain('## Roles del equipo');
  });

  it('R7: --brief without a value embeds the checklist', () => {
    standardMocks();

    estimateCommand.parse(['node', 'estimate', '--brief'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('## Brief Funcional');
  });

  it('R7: --brief missing.md warns, falls back to the checklist and exits 0', () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);
    const missingResolved = path.join(CWD, 'missing.md');
    vi.mocked(fs.readFileSync).mockImplementation((p) => {
      const key = String(p);
      if (key === missingResolved) throw new Error('ENOENT');
      if (Object.prototype.hasOwnProperty.call(mf, key)) return mf[key];
      return '';
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    estimateCommand.parse(['node', 'estimate', '--brief', 'missing.md'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('## Brief Funcional');
    const warnMsgs = warnSpy.mock.calls.map((c) => String(c));
    expect(warnMsgs.some((m) => m.includes('missing.md') && m.includes('brief'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('R10: --pricing-team embeds the team-cost reference section', () => {
    standardMocks();

    estimateCommand.parse(['node', 'estimate', '--pricing-team'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('## Referencia de Costos de Equipo');
    expect(guide).toContain('Costo por rol = rol × seniority × dedicación × duración');
  });

  it('R11: prints a console suggestion for an Aplica signal whose flag is unset', () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    addCanvas(mf, 'PROJECT-CANVAS.md', projectCanvasWith());
    addCanvas(mf, 'INFRA-CANVAS.md', infraCanvasWith({ 2: 'Login con JWT' }));
    addDecisions(mf, NEUTRAL_DECISIONS);
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    estimateCommand.parse(['node', 'estimate'], { from: 'user' });

    const msgs = logSpy.mock.calls.map((c) => String(c));
    expect(msgs.some((m) => m.includes('💡 Se detectó Seguridad (jwt). Considerá --security para incluir su sección en la guía.'))).toBe(true);

    logSpy.mockRestore();
  });

  it('R11: does not print a suggestion when the flag is set, and embeds the section', () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    addCanvas(mf, 'PROJECT-CANVAS.md', projectCanvasWith());
    addCanvas(mf, 'INFRA-CANVAS.md', infraCanvasWith({ 2: 'Login con JWT' }));
    addDecisions(mf, NEUTRAL_DECISIONS);
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    estimateCommand.parse(['node', 'estimate', '--security'], { from: 'user' });

    const msgs = logSpy.mock.calls.map((c) => String(c));
    expect(msgs.some((m) => m.includes('Considerá --security'))).toBe(false);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain(TOPIC_FRAGMENT_SECURITY);

    logSpy.mockRestore();
  });

  it('R13: identical inputs and flags twice → byte-identical guide', () => {
    standardMocks();

    estimateCommand.parse(['node', 'estimate', '--security', '--roles', '--brief', '--pricing-team'], { from: 'user' });
    const first = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(first).toContain('Guía de Discusión de Pricing');

    vi.mocked(fs.writeFileSync).mockClear();

    estimateCommand.parse(['node', 'estimate', '--security', '--roles', '--brief', '--pricing-team'], { from: 'user' });
    const second = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);

    expect(second).toContain('Guía de Discusión de Pricing');
    expect(second).toBe(first);
  });

  it('R14: an edited topic fragment is reflected in the guide', () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    mf[path.join(TPL_DIR, 'topics', 'security.md')] = '## Seguridad\n\nImpacto en costos:\n- Editado local: auditoría externa de cumplimiento.';
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    estimateCommand.parse(['node', 'estimate', '--security'], { from: 'user' });

    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('Editado local: auditoría externa de cumplimiento');
    expect(guide).not.toContain('Auth y cumplimiento');
  });

  it('lists included sections in the console summary (canonical order)', () => {
    standardMocks();

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    estimateCommand.parse(['node', 'estimate', '--security', '--roles', '--brief', '--pricing-team'], { from: 'user' });

    const msgs = logSpy.mock.calls.map((c) => String(c));
    expect(msgs.some((m) => m.includes('Secciones incluidas en la guía: ficha de alcance, brief funcional, roles del equipo, seguridad, referencia de costos de equipo.'))).toBe(true);

    logSpy.mockRestore();
  });

  it('summary shows only the ficha when no optional flags are set', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    estimateCommand.parse(['node', 'estimate'], { from: 'user' });

    const msgs = logSpy.mock.calls.map((c) => String(c));
    expect(msgs.some((m) => m.includes('Secciones incluidas en la guía: ficha de alcance.'))).toBe(true);

    logSpy.mockRestore();
  });
});
