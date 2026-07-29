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

import { parseFrontmatter, assessCommand, runAssess } from '../src/commands/assess.js';

// ── Helpers ──

const __testDir = path.dirname(fileURLToPath(import.meta.url));
const TPL_DIR = path.resolve(__testDir, '../src/templates/sdd');
const TPL_REVIEW_PATH = path.join(TPL_DIR, 'architecture-review-template.md');
const TPL_DECISIONS_PATH = path.join(TPL_DIR, 'architecture-decisions-template.md');

const CANVAS_PROJECT_CONTENT = 'React 18 + Next.js 14\nPatrón: Clean Architecture';
const CANVAS_INFRA_CONTENT = 'AWS EC2 + PostgreSQL\nDeploy: Docker Compose';
const CWD = process.cwd();

const DEFAULT_TEMPLATE = `# 🗣️ Guía de Discusión Arquitectónica

> Generado por \`funky assess\`. Usa este documento como estructura para tu sesión de discusión.

## Contexto del Proyecto

### PROJECT-CANVAS
{{PROJECT_CANVAS_CONTENT}}

### INFRA-CANVAS
{{INFRA_CANVAS_CONTENT}}

## Fases de la Discusión

### Fase 1: Contexto (5 min)
Confirmar stack elegido y NFRs. Leer los canvases embebidos arriba. La IA descubre los NFRs preguntando al equipo.

### Fase 2: Preocupaciones del Equipo (10 min)
¿Qué les preocupa de la arquitectura actual? ¿Dónde ven riesgos? ¿Hay algo que no esté claro?

### Fase 3: Preguntas Guía (15 min)
- **Budget e Infraestructura**: ¿El presupuesto mensual alcanza para la infraestructura elegida? Considera costos de hosting, servicios y herramientas.
- **Concurrencia y Base de Datos**: ¿La base de datos soporta la concurrencia esperada? Revisa límites de conexiones y estrategias de escalado.
- **SLA y Redundancia**: ¿La arquitectura elegida puede cumplir el SLA requerido? Un solo nodo implica downtime en deploys y fallos de hardware.

{{DYNAMIC_QUESTIONS}}

### Fase 4: Riesgos Detectados (15 min)
La IA analiza el stack completo buscando incompatibilidades conocidas, trade-offs no documentados y riesgos operacionales.

### Fase 5: Alternativas (10 min)
Para cada riesgo identificado, propón al menos una alternativa con pros/cons concretos.

### Fase 6: Acuerdos (5 min)
Documentar las decisiones finales en docs/architecture-decisions.md. Incluir rationale, alternativas descartadas y riesgos aceptados.
`;

const DEFAULT_DECISIONS_TEMPLATE = '# Decisiones Arquitectónicas\n{{DATE}}';

function createMockFiles() {
  return {
    [TPL_REVIEW_PATH]: DEFAULT_TEMPLATE,
    [TPL_DECISIONS_PATH]: DEFAULT_DECISIONS_TEMPLATE
  };
}

function addContextJson(mf, data) {
  mf[path.join(CWD, 'context.json')] = JSON.stringify(data);
}

function addCanvas(mockFiles, name, content, location) {
  const dir = location === 'docs' ? path.join(CWD, 'docs') : CWD;
  mockFiles[path.join(dir, name)] = content;
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

// ── parseFrontmatter tests (unchanged) ──

describe('assess Command - parseFrontmatter', () => {
  it('should extract correct values including new NFRs', () => {
    const content = `---
budget: 50
rps: 1000
sla: 99.99
redundancy: "Multi-AZ"
db_tech: "PostgreSQL"
infra_tech: "AWS"
compliance: "GDPR"
team_seniority: "Senior"
---

# Architecture Assessment
`;
    const metadata = parseFrontmatter(content);
    expect(metadata.budget).toBe('50');
    expect(metadata.rps).toBe('1000');
    expect(metadata.sla).toBe('99.99');
    expect(metadata.redundancy).toBe('Multi-AZ');
    expect(metadata.db_tech).toBe('PostgreSQL');
    expect(metadata.infra_tech).toBe('AWS');
    expect(metadata.compliance).toBe('GDPR');
    expect(metadata.team_seniority).toBe('Senior');
  });

  it('should handle missing fields gracefully', () => {
    const content = `---
budget: 50
---
`;
    const metadata = parseFrontmatter(content);
    expect(metadata.budget).toBe('50');
    expect(metadata.compliance).toBeUndefined();
  });
});

// ── Integration tests for action flow ──

describe('assess Command - action flow', () => {
  let exitSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
  });

  afterEach(() => {
    exitSpy.mockRestore();
  });

  it('exits 0 when both canvases exist in root', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT, 'root');
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT, 'root');
    applyMocks(mf);

    assessCommand.parse(['node', 'assess'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(vi.mocked(fs.writeFileSync).mock.calls.length).toBeGreaterThan(0);
  });

  it('exits 0 when both canvases exist in docs/ fallback', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT, 'docs');
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT, 'docs');
    applyMocks(mf);

    assessCommand.parse(['node', 'assess'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(vi.mocked(fs.writeFileSync).mock.calls.length).toBeGreaterThan(0);
  });

  it('warns when one canvas is missing and uses placeholder', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT, 'root');
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    assessCommand.parse(['node', 'assess'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('INFRA-CANVAS'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('warns when both canvases are missing but exits 0', () => {
    const mf = createMockFiles();
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    assessCommand.parse(['node', 'assess'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('PROJECT-CANVAS'))).toBe(true);
    expect(warnMsgs.some(m => m.includes('INFRA-CANVAS'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('warns when canvas contains [Responde aquí]', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', 'Framework: [Responde aquí]\nEstado: [Responde aquí]', 'root');
    addCanvas(mf, 'INFRA-CANVAS.md', 'DB: PostgreSQL', 'root');
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    assessCommand.parse(['node', 'assess'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('[Responde aquí]'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('generates output file with 6-phase structure and C1 questions', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT, 'root');
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT, 'root');
    applyMocks(mf);

    assessCommand.parse(['node', 'assess'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const reviewCall = writeCalls.find(c => String(c[0]).includes('architecture-review.md'));
    expect(reviewCall).toBeTruthy();
    const writtenContent = String(reviewCall[1]);

    expect(writtenContent).toContain('Fase 1: Contexto');
    expect(writtenContent).toContain('Fase 2: Preocupaciones del Equipo');
    expect(writtenContent).toContain('Fase 3: Preguntas Guía');
    expect(writtenContent).toContain('Fase 4: Riesgos Detectados');
    expect(writtenContent).toContain('Fase 5: Alternativas');
    expect(writtenContent).toContain('Fase 6: Acuerdos');
    expect(writtenContent).toContain(CANVAS_PROJECT_CONTENT);
    expect(writtenContent).toContain(CANVAS_INFRA_CONTENT);
    expect(writtenContent).toContain('Budget e Infraestructura');
    expect(writtenContent).toContain('Concurrencia y Base de Datos');
    expect(writtenContent).toContain('SLA y Redundancia');
  });

  it('creates decisions template on first run and skips on second', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT, 'root');
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT, 'root');
    applyMocks(mf);

    assessCommand.parse(['node', 'assess'], { from: 'user' });
    expect(exitSpy).toHaveBeenCalledWith(0);

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const decisionsCall = writeCalls.find(c => String(c[0]).includes('architecture-decisions.md'));
    expect(decisionsCall).toBeTruthy();
    expect(String(decisionsCall[1])).toContain('Decisiones Arquitectónicas');
  });

  it('skips decisions template when file already exists', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT, 'root');
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT, 'root');
    mf[path.join(CWD, 'docs', 'architecture-decisions.md')] = '# Existing content';
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    assessCommand.parse(['node', 'assess'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const logMsgs = logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('ya existe'))).toBe(true);

    logSpy.mockRestore();
  });
});

// ── --context flag tests ──

describe('--context flag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
  });

  it('uses canvases from context when --context flag is provided', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT, 'root');
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT, 'root');
    addContextJson(mf, {
      canvases: {
        projectCanvas: 'Context Project Canvas',
        infraCanvas: 'Context Infra Canvas',
        unfilledCount: 0
      },
      assess: { runAt: null, dynamicQuestions: [] },
      estimate: { runAt: null },
      pipeline: { lastCommand: null, completed: [] }
    });
    applyMocks(mf);

    runAssess(CWD, { context: './context.json' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const reviewCall = writeCalls.find(c => String(c[0]).includes('architecture-review.md'));
    expect(reviewCall).toBeTruthy();
    const writtenContent = String(reviewCall[1]);
    expect(writtenContent).toContain('Context Project Canvas');
    expect(writtenContent).toContain('Context Infra Canvas');
  });

  it('prints error when context file is missing', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT, 'root');
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT, 'root');
    // No addContextJson — context.json is missing
    applyMocks(mf);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    runAssess(CWD, { context: './context.json' });

    expect(errorSpy).toHaveBeenCalled();
    // Should NOT have written context.json (early return)
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).endsWith('context.json'));
    expect(contextCall).toBeFalsy();

    errorSpy.mockRestore();
  });

  it('writes assess results to context.json', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT, 'root');
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT, 'root');
    addContextJson(mf, {
      canvases: {
        projectCanvas: 'project content',
        infraCanvas: 'infra content',
        unfilledCount: 0
      },
      assess: { runAt: null, dynamicQuestions: [] },
      estimate: { runAt: null },
      pipeline: { lastCommand: null, completed: [] }
    });
    applyMocks(mf);

    runAssess(CWD, { context: './context.json' });

    // Verify context.json was written with assess results
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).endsWith('context.json'));
    expect(contextCall).toBeTruthy();
    const writtenData = JSON.parse(contextCall[1]);
    expect(writtenData.assess.runAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(Array.isArray(writtenData.assess.dynamicQuestions)).toBe(true);
  });
});
