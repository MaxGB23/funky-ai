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

import { generatePricingGuide, generateDecisionsTemplate, generateIAPrompt, generateIAPromptBanner, generateIAPromptFooter } from '../src/utils/estimateDomain.js';
import { estimateCommand, runEstimate } from '../src/commands/estimate.js';

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
  it('includes canvas content when decisions is null (invite from scratch)', () => {
    const result = generateIAPrompt(null, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT);
    expect(result).toContain('React 18');
    expect(result).toContain('AWS EC2');
    expect(result).toContain('sesión de pricing');
    expect(result).toContain('No hay decisiones arquitectónicas documentadas previamente');
  });

  it('includes decisions context when decisions is present', () => {
    const result = generateIAPrompt(DECISIONS_CONTENT, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT);
    expect(result).toContain('Next.js');
    expect(result).toContain('PostgreSQL');
    expect(result).toContain('React 18');
    expect(result).toContain('sesión de pricing');
  });

  it('uses neutral Spanish with proper accents', () => {
    const result = generateIAPrompt(DECISIONS_CONTENT, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT);
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
});
