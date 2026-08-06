import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks } from './helpers/fsMock.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { parseFrontmatter, assessCommand, runAssess } from '../src/commands/assess.js';

// ── Helpers ──

const __testDir = path.dirname(fileURLToPath(import.meta.url));
const TPL_DIR = path.resolve(__testDir, '../src/templates/assess');
const TPL_REVIEW_PATH = path.join(TPL_DIR, 'architecture-review-template.md');
const TPL_DECISIONS_PATH = path.join(TPL_DIR, 'architecture-decisions-template.md');
const TPL_RISK_PATTERNS_PATH = path.join(TPL_DIR, 'risk-patterns-template.md');

const CANVAS_PROJECT_CONTENT = 'React 18 + Next.js 14\nPatrón: Clean Architecture';
const CANVAS_INFRA_CONTENT = 'AWS EC2 + PostgreSQL\nDeploy: Docker Compose';
const CWD = process.cwd();

// Canvas location: docs/funky-ai/canvas/
const CANVAS_DIR = path.join(CWD, 'docs', 'funky-ai', 'canvas');
const RISK_PATTERNS_DEST_PATH = path.join(CWD, 'docs', 'funky-ai', 'assess', 'risk-patterns.md');

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

### Patrones de Riesgo a Considerar
Los patrones de referencia listados abajo son candidatos a evaluar, no riesgos confirmados. La IA debe leer los canvases embebidos arriba en la Fase 4 y decidir, junto con el equipo, cuáles aplican al proyecto concreto.

{{DYNAMIC_QUESTIONS}}

### Fase 4: Riesgos Detectados (15 min)
La IA analiza el stack completo buscando incompatibilidades conocidas, trade-offs no documentados y riesgos operacionales.

### Fase 5: Alternativas (10 min)
Para cada riesgo identificado, propón al menos una alternativa con pros/cons concretos.

### Fase 6: Acuerdos (5 min)
Documentar las decisiones finales en docs/architecture-decisions.md. Incluir rationale, alternativas descartadas y riesgos aceptados.
`;

const DEFAULT_DECISIONS_TEMPLATE = '# Decisiones Arquitectónicas\n{{DATE}}';

const DEFAULT_RISK_PATTERNS_TEMPLATE = `# Patrones de Riesgo de Referencia

> Documento VIVO y editable por el equipo.

## K8s / Kubernetes
- **Señal a buscar en los canvases:** el INFRA-CANVAS menciona K8s.
- **Riesgo a considerar:** costos operativos del clúster.

## SQLite
- **Señal a buscar en los canvases:** el INFRA-CANVAS elige SQLite.
- **Riesgo a considerar:** límites de concurrencia.`;

function createMockFiles() {
  return {
    [TPL_REVIEW_PATH]: DEFAULT_TEMPLATE,
    [TPL_DECISIONS_PATH]: DEFAULT_DECISIONS_TEMPLATE,
    [TPL_RISK_PATTERNS_PATH]: DEFAULT_RISK_PATTERNS_TEMPLATE
  };
}

function addContextJson(mf, data) {
  mf[path.join(CWD, 'docs', 'funky-ai', 'pipeline', 'context.json')] = JSON.stringify(data);
}

// Seed de context v2 (R-P8) con override por fase; status 'pending' por defecto.
function v2Context(overrides = {}) {
  return {
    version: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    currentPhase: null,
    assess: {
      status: 'pending', startedAt: null, finishedAt: null, durationMs: null,
      error: null, artifacts: [], runAt: null, surfacedPatterns: [], decisionsFile: null,
      ...(overrides.assess || {})
    },
    estimate: {
      status: 'pending', startedAt: null, finishedAt: null, durationMs: null,
      error: null, artifacts: [], runAt: null,
      ...(overrides.estimate || {})
    }
  };
}

function addCanvas(mockFiles, name, content) {
  mockFiles[path.join(CANVAS_DIR, name)] = content;
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

  it('exits 0 when both canvases exist in docs/funky-ai/canvas/', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    assessCommand.parse([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(vi.mocked(fs.writeFileSync).mock.calls.length).toBeGreaterThan(0);
  });

  it('warns when one canvas is missing and uses placeholder', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    assessCommand.parse([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('INFRA-CANVAS'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('warns when both canvases are missing but exits 0', () => {
    const mf = createMockFiles();
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    assessCommand.parse([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('PROJECT-CANVAS'))).toBe(true);
    expect(warnMsgs.some(m => m.includes('INFRA-CANVAS'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('warns when canvas contains [Responde aquí]', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', 'Framework: [Responde aquí]\nEstado: [Responde aquí]');
    addCanvas(mf, 'INFRA-CANVAS.md', 'DB: PostgreSQL');
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    assessCommand.parse([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('[Responde aquí]'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('generates output file with 6-phase structure and C1 questions', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    assessCommand.parse([], { from: 'user' });

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
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    assessCommand.parse([], { from: 'user' });
    expect(exitSpy).toHaveBeenCalledWith(0);

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const decisionsCall = writeCalls.find(c => String(c[0]).includes('architecture-decisions.md'));
    expect(decisionsCall).toBeTruthy();
    expect(String(decisionsCall[1])).toContain('Decisiones Arquitectónicas');
  });

  it('skips decisions template when file already exists', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[path.join(CWD, 'docs', 'funky-ai', 'assess', 'architecture-decisions.md')] = '# Existing content';
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    assessCommand.parse([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const logMsgs = logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('ya existe'))).toBe(true);

    logSpy.mockRestore();
  });

  it('overwrites architecture-review.md when the file already exists', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[path.join(CWD, 'docs', 'funky-ai', 'assess', 'architecture-review.md')] = '# Previous stale content';
    applyMocks(mf);

    assessCommand.parse([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const reviewCall = writeCalls.find(c => String(c[0]).includes('architecture-review.md'));
    expect(reviewCall).toBeTruthy();
    const writtenContent = String(reviewCall[1]);

    expect(writtenContent).toContain('Fase 1: Contexto');
    expect(writtenContent).toContain(CANVAS_PROJECT_CONTENT);
    expect(writtenContent).not.toContain('Previous stale content');
  });

  it('creates risk-patterns.md from the template when it does not exist', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    assessCommand.parse([], { from: 'user' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const patternsCall = writeCalls.find(c => String(c[0]).includes('risk-patterns.md'));
    expect(patternsCall).toBeTruthy();
    expect(String(patternsCall[1])).toContain('Patrones de Riesgo de Referencia');
  });

  it('does not overwrite an existing team risk-patterns.md', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[RISK_PATTERNS_DEST_PATH] = '# Patrones del Equipo\n\n## Microservicios\n';
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    assessCommand.parse([], { from: 'user' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const patternsCall = writeCalls.find(c => String(c[0]).includes('risk-patterns.md'));
    expect(patternsCall).toBeFalsy();
    const logMsgs = logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('risk-patterns.md ya existe'))).toBe(true);

    logSpy.mockRestore();
  });

  it('embeds the surfaced risk patterns in the guide as candidates to consider', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[RISK_PATTERNS_DEST_PATH] = '# Patrones del Equipo\n\n## Microservicios\n- **Riesgo:** complejidad de deploys.';
    applyMocks(mf);

    assessCommand.parse([], { from: 'user' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const reviewCall = writeCalls.find(c => String(c[0]).includes('architecture-review.md'));
    const writtenContent = String(reviewCall[1]);

    expect(writtenContent).toContain('Patrones de Riesgo a Considerar');
    expect(writtenContent).toContain('candidatos a evaluar');
    expect(writtenContent).toContain('Microservicios');
    expect(writtenContent).not.toContain('K8s / Kubernetes');
  });

  it('does not generate regex-detected C2 questions from canvas content', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', 'Equipo junior con React');
    addCanvas(mf, 'INFRA-CANVAS.md', 'Deploy en K8s cluster con SQLite en single node');
    applyMocks(mf);

    assessCommand.parse([], { from: 'user' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const reviewCall = writeCalls.find(c => String(c[0]).includes('architecture-review.md'));
    const writtenContent = String(reviewCall[1]);

    expect(writtenContent).not.toContain('Elegiste Kubernetes');
    expect(writtenContent).not.toContain('SQLite es liviano pero tiene límites');
    expect(writtenContent).not.toContain('Con un solo nodo, cualquier deploy');
    expect(writtenContent).not.toContain('El equipo es principalmente Junior');
  });

  it('exits 1 when --context file is missing (R-A1)', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    // No context.json
    applyMocks(mf);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    assessCommand.parse(['--context', 'missing.json'], { from: 'user' });

    // El exit(1) proviene del result status 'failed' (no del parseo de Commander).
    const errMsgs = errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('No se pudo leer context.json'))).toBe(true);
    expect(exitSpy).toHaveBeenCalledWith(1);
    errorSpy.mockRestore();
  });
});

// ── --context flag tests ──

describe('--context flag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
  });

  it('reads canvases from filesystem when --context is provided', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, v2Context());
    applyMocks(mf);

    const result = runAssess(CWD, { context: true });

    // R-P12: devuelve result object
    expect(result.phase).toBe('assess');
    expect(result.status).toBe('completed');
    expect(typeof result.durationMs).toBe('number');
    expect(Array.isArray(result.warnings)).toBe(true);

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const reviewCall = writeCalls.find(c => String(c[0]).includes('architecture-review.md'));
    expect(reviewCall).toBeTruthy();
    const writtenContent = String(reviewCall[1]);
    // Canvases come from filesystem, not context.json
    expect(writtenContent).toContain(CANVAS_PROJECT_CONTENT);
    expect(writtenContent).toContain(CANVAS_INFRA_CONTENT);
  });

  it('prints error when context file is missing', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    // No addContextJson — context.json is missing
    applyMocks(mf);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = runAssess(CWD, { context: true });

    expect(errorSpy).toHaveBeenCalled();
    // R-P12: resultado failed, sin artifacts
    expect(result.status).toBe('failed');
    expect(result.phase).toBe('assess');
    expect(result.artifacts).toEqual([]);
    // Should NOT have written context.json (early return)
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).endsWith('context.json'));
    expect(contextCall).toBeFalsy();

    errorSpy.mockRestore();
  });

  it('writes assess results to context.json', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, v2Context());
    applyMocks(mf);

    runAssess(CWD, { context: true });

    // Verify context.json was written with assess results
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).endsWith('context.json'));
    expect(contextCall).toBeTruthy();
    const writtenData = JSON.parse(contextCall[1]);
    expect(writtenData.assess.runAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(Array.isArray(writtenData.assess.surfacedPatterns)).toBe(true);
    // R-A1: estado completed + artifacts vía updatePhaseState
    expect(writtenData.assess.status).toBe('completed');
    expect(writtenData.assess.finishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(typeof writtenData.assess.durationMs).toBe('number');
    expect(Array.isArray(writtenData.assess.artifacts)).toBe(true);
    expect(writtenData.currentPhase).toBeNull();
    // dynamicQuestions NO debe escribirse (rename → surfacedPatterns)
    expect(writtenData.assess.dynamicQuestions).toBeUndefined();
  });

  it('writes the real decisions file path to assess.decisionsFile', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, v2Context());
    applyMocks(mf);

    runAssess(CWD, { context: true });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).endsWith('context.json'));
    const writtenData = JSON.parse(contextCall[1]);
    // Ruta relativa al targetBase, igual que las demás rutas del context
    expect(writtenData.assess.decisionsFile).toBe('docs/funky-ai/assess/architecture-decisions.md');
  });

  it('writes the surfaced risk pattern names to assess.surfacedPatterns', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, v2Context());
    mf[RISK_PATTERNS_DEST_PATH] = '# Patrones del Equipo\n\n## Microservicios\n## Cola Síncrona';
    applyMocks(mf);

    const result = runAssess(CWD, { context: true });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).endsWith('context.json'));
    const writtenData = JSON.parse(contextCall[1]);
    expect(writtenData.assess.surfacedPatterns).toEqual(['Microservicios', 'Cola Síncrona']);
    // R-P12: artifacts en el result object (guía generada)
    expect(result.artifacts.some(a => a.name === 'architecture-review.md' && a.kind === 'generated')).toBe(true);
    expect(result.artifacts.every(a => typeof a.path === 'string' && !a.path.startsWith('/'))).toBe(true);
  });

  it('honors a custom context path', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[path.join(CWD, 'custom', 'context.json')] = JSON.stringify(v2Context());
    applyMocks(mf);

    runAssess(CWD, { context: 'custom/context.json' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).replace(/\\/g, '/').endsWith('custom/context.json'));
    expect(contextCall).toBeTruthy();
    const writtenData = JSON.parse(contextCall[1]);
    expect(writtenData.assess.runAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(Array.isArray(writtenData.assess.surfacedPatterns)).toBe(true);
    expect(writtenData.assess.status).toBe('completed');
  });

  it('suppresses summary console.log when json:true (R-P11)', () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, v2Context());
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = runAssess(CWD, { context: true, json: true });

    expect(result.status).toBe('completed');
    const logMsgs = logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('Guía de discusión generada'))).toBe(false);
    expect(logMsgs.some(m => m.includes('Próximos pasos'))).toBe(false);

    logSpy.mockRestore();
  });
});
