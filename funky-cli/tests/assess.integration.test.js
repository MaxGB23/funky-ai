import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const clackMock = vi.hoisted(() => ({
  confirm: vi.fn(),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
}));

vi.mock('@clack/prompts', () => clackMock);
vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));

import { fsMock, applyMocks, CWD, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, addCanvas, addContextJson, v2Context } from './helpers/fsMock.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

import { assessCommand, runAssess } from '../src/commands/assess.js';

// ── Helpers ──

const __testDir = path.dirname(fileURLToPath(import.meta.url));
const TPL_DIR = path.resolve(__testDir, '../src/templates/assess');
const TPL_REVIEW_PATH = path.join(TPL_DIR, 'architecture-review-template.md');
const TPL_DECISIONS_PATH = path.join(TPL_DIR, 'architecture-decisions-template.md');
const TPL_RISK_PATTERNS_PATH = path.join(TPL_DIR, 'risk-patterns-template.md');
const TPL_PROMPT_PATH = path.join(TPL_DIR, 'assess-prompt-template.md');
const ASSESS_DIR = path.join(CWD, 'docs', 'funky-ai', 'assess');
const REVIEW_DEST_PATH = path.join(ASSESS_DIR, 'architecture-review.md');
const DECISIONS_DEST_PATH = path.join(ASSESS_DIR, 'architecture-decisions.md');
const RISK_PATTERNS_DEST_PATH = path.join(ASSESS_DIR, 'risk-patterns.md');
const PROMPT_DEST_PATH = path.join(ASSESS_DIR, 'assess-prompt.md');

// Template nuevo (Fase 1): sin placeholders de contenido. El review referencia
// los archivos del proyecto en lugar de incrustarlos (obs 2, 2.1/2.2).
const DEFAULT_TEMPLATE = `# 🗣️ Guía de Discusión Arquitectónica

> Generado por \`funky assess\`. Agenda declarativa de la sesión: referencia los archivos del proyecto, no los incrusta.

## Cómo usar esta guía

1. Copia el contenido de \`assess-prompt.md\` (ubicado junto a esta guía) y pégalo como primer mensaje de tu sesión con la IA.
2. El agente lee los archivos referenciados abajo, en el orden que marca el prompt.
3. Anota cada decisión aprobada en \`architecture-decisions.md\` durante la discusión.

## Archivos de referencia

- \`docs/funky-ai/canvas/brief-funcional.md\` — contexto de **negocio** (obligatorio, léelo primero): qué se construye, para quién, casos de uso, KPIs y escala esperada.
- \`docs/funky-ai/canvas/PROJECT-CANVAS.md\` — decisiones de la **aplicación**: framework, patrón arquitectónico, gestión de estado, UI y testing.
- \`docs/funky-ai/canvas/INFRA-CANVAS.md\` — decisiones **operativas**: base de datos, autenticación, calidad de código y despliegue.
- \`docs/funky-ai/assess/risk-patterns.md\` — patrones de riesgo de **referencia**: pueden no aplicar a este proyecto.

## Fases de la Discusión

- **Fase 1 — Contexto y NFRs**: confirmar stack elegido y NFRs. Evalúa cada NFR explícitamente (derivan del brief: casos de uso, volumen y KPIs): si aplica, se acuerda cómo se cumple; si no aplica, se declara el porqué. Los patrones de referencia son condicionales, se aplican solo si el contexto los amerita.
- **Fase 2 — Preocupaciones del equipo**: ¿Qué les preocupa de la arquitectura actual? ¿Dónde ven riesgos? ¿Hay algo que no esté claro?
- **Fase 3 — Preguntas guía**: candidatos a plantear uno a la vez, cuando apliquen al proyecto concreto:
  - **Budget e Infraestructura**: ¿El presupuesto mensual alcanza para la infraestructura elegida? Considera costos de hosting, servicios y herramientas.
  - **Concurrencia y Base de Datos**: ¿La base de datos soporta la concurrencia esperada? Revisa límites de conexiones y estrategias de escalado.
  - **SLA y Redundancia**: ¿La arquitectura elegida puede cumplir el SLA requerido? Un solo nodo implica downtime en deploys y fallos de hardware.
- **Fase 4 — Riesgos con validación cruzada**: la IA analiza el stack completo y choca cada decisión técnica contra el brief para detectar incompatibilidades, sobreingeniería o un stack corto frente a las expectativas del producto.
- **Fase 5 — Alternativas**: para cada riesgo identificado, al menos una alternativa con pros/cons concretos.
- **Fase 6 — Acuerdos**: documentar las decisiones finales en \`docs/funky-ai/assess/architecture-decisions.md\`. Las decisiones aprobadas se anotan punto por punto durante la discusión.
`;

const DEFAULT_DECISIONS_TEMPLATE = '# Decisiones Arquitectónicas\n\n> Fecha de generación: {{DATE}}\n\n## Decisiones\n\n### [Decisión 1: Título breve]\n- **Fecha:** {{DATE}}\n';

const DEFAULT_RISK_PATTERNS_TEMPLATE = `# Patrones de Riesgo de Referencia

> Documento VIVO y editable por el equipo.

## K8s / Kubernetes
- **Señal a buscar en los canvases:** el INFRA-CANVAS menciona K8s.
- **Riesgo a considerar:** costos operativos del clúster.

## SQLite
- **Señal a buscar en los canvases:** el INFRA-CANVAS elige SQLite.
- **Riesgo a considerar:** límites de concurrencia.`;

const DEFAULT_PROMPT_TEMPLATE = `# 🗣️ Prompt de Discusión Arquitectónica — funky assess

Actúas como **segunda validación** de la arquitectura del proyecto.

## Contexto de entrada

1. \`docs/funky-ai/canvas/brief-funcional.md\` — contexto de **negocio** (obligatorio).
2. \`docs/funky-ai/canvas/PROJECT-CANVAS.md\`
3. \`docs/funky-ai/canvas/INFRA-CANVAS.md\`
4. \`docs/funky-ai/assess/architecture-review.md\`
5. \`docs/funky-ai/assess/risk-patterns.md\`

Si falta alguno de los archivos referenciados, señálalo y PREGUNTA el contexto al humano. Jamás lo inventes.`;

function createMockFiles() {
  return {
    [TPL_REVIEW_PATH]: DEFAULT_TEMPLATE,
    [TPL_DECISIONS_PATH]: DEFAULT_DECISIONS_TEMPLATE,
    [TPL_RISK_PATTERNS_PATH]: DEFAULT_RISK_PATTERNS_TEMPLATE,
    [TPL_PROMPT_PATH]: DEFAULT_PROMPT_TEMPLATE
  };
}

const ttyDescriptor = Object.getOwnPropertyDescriptor(process, 'stdin');
const setTTY = (value) => {
  Object.defineProperty(process, 'stdin', { value: { isTTY: value }, configurable: true });
};

function reviewWrite() {
  return vi.mocked(fs.writeFileSync).mock.calls.find(c => String(c[0]).includes('architecture-review.md'));
}

function allLogs(logSpy) {
  return logSpy.mock.calls.map(c => String(c));
}

// ── Integration tests for action flow ──

describe('assess Command - action flow', () => {
  let exitSpy;
  let logSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    clackMock.isCancel.mockReturnValue(false);
    clackMock.confirm.mockReset();
  });

  afterEach(() => {
    exitSpy.mockRestore();
    logSpy.mockRestore();
    if (ttyDescriptor) {
      Object.defineProperty(process, 'stdin', ttyDescriptor);
    } else {
      delete process.stdin;
    }
  });

  it('exits 0 when both canvases exist in docs/funky-ai/canvas/', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(vi.mocked(fs.writeFileSync).mock.calls.length).toBeGreaterThan(0);
  });

  it('warns when one canvas is missing', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await assessCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('INFRA-CANVAS'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('warns when both canvases are missing but exits 0', async () => {
    const mf = createMockFiles();
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await assessCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('PROJECT-CANVAS'))).toBe(true);
    expect(warnMsgs.some(m => m.includes('INFRA-CANVAS'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('warns when canvas contains [Responde aquí]', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', 'Framework: [Responde aquí]\nEstado: [Responde aquí]');
    addCanvas(mf, 'INFRA-CANVAS.md', 'DB: PostgreSQL');
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await assessCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('[Responde aquí]'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('escribe architecture-review.md con las 6 fases y referencias, sin embeber canvases (2.1)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);

    const reviewCall = reviewWrite();
    expect(reviewCall).toBeTruthy();
    const writtenContent = String(reviewCall[1]);

    expect(writtenContent).toContain('Fase 1 — Contexto y NFRs');
    expect(writtenContent).toContain('Fase 2 — Preocupaciones del equipo');
    expect(writtenContent).toContain('Fase 3 — Preguntas guía');
    expect(writtenContent).toContain('Fase 4 — Riesgos con validación cruzada');
    expect(writtenContent).toContain('Fase 5 — Alternativas');
    expect(writtenContent).toContain('Fase 6 — Acuerdos');
    expect(writtenContent).toContain('Budget e Infraestructura');
    expect(writtenContent).toContain('Concurrencia y Base de Datos');
    expect(writtenContent).toContain('SLA y Redundancia');
    // Referencias a los archivos, no copy paste de los canvases.
    expect(writtenContent).toContain('docs/funky-ai/canvas/brief-funcional.md');
    expect(writtenContent).toContain('docs/funky-ai/canvas/PROJECT-CANVAS.md');
    expect(writtenContent).toContain('docs/funky-ai/canvas/INFRA-CANVAS.md');
    expect(writtenContent).toContain('docs/funky-ai/assess/risk-patterns.md');
    expect(writtenContent).not.toContain(CANVAS_PROJECT_CONTENT);
    expect(writtenContent).not.toContain(CANVAS_INFRA_CONTENT);
  });

  it('creates architecture-decisions.md on first run with {{DATE}} replaced', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });
    expect(exitSpy).toHaveBeenCalledWith(0);

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const decisionsCall = writeCalls.find(c => String(c[0]).includes('architecture-decisions.md'));
    expect(decisionsCall).toBeTruthy();
    const writtenContent = String(decisionsCall[1]);
    expect(writtenContent).toContain('Decisiones Arquitectónicas');
    expect(writtenContent).not.toContain('{{DATE}}');
    expect(writtenContent).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('does not overwrite existing architecture-decisions.md; recommends removing or moving it (2.4)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[DECISIONS_DEST_PATH] = '# Decisiones del equipo ya tomadas';
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const decisionsWrite = writeCalls.find(c => String(c[0]).includes('architecture-decisions.md'));
    expect(decisionsWrite).toBeFalsy();
    const logMsgs = allLogs(logSpy);
    expect(logMsgs.some(m => m.includes('Contiene decisiones del proyecto'))).toBe(true);
    expect(logMsgs.some(m => m.includes('elimínalo o muévelo de ubicación'))).toBe(true);
  });

  it('overwrites architecture-review.md when the file already exists', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[REVIEW_DEST_PATH] = '# Previous stale content';
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);

    const reviewCall = reviewWrite();
    expect(reviewCall).toBeTruthy();
    const writtenContent = String(reviewCall[1]);

    expect(writtenContent).toContain('Fase 1 — Contexto y NFRs');
    expect(writtenContent).toContain('docs/funky-ai/canvas/PROJECT-CANVAS.md');
    expect(writtenContent).not.toContain('Previous stale content');
    expect(writtenContent).not.toContain(CANVAS_PROJECT_CONTENT);
  });

  it('creates risk-patterns.md from the template when it does not exist', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const patternsCall = writeCalls.find(c => String(c[0]).includes('risk-patterns.md'));
    expect(patternsCall).toBeTruthy();
    expect(String(patternsCall[1])).toContain('Patrones de Riesgo de Referencia');
  });

  it('does not overwrite an existing team risk-patterns.md; recommends removing or moving it (2.4)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[RISK_PATTERNS_DEST_PATH] = '# Patrones del Equipo\n\n## Microservicios\n';
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const patternsCall = writeCalls.find(c => String(c[0]).includes('risk-patterns.md'));
    expect(patternsCall).toBeFalsy();
    const logMsgs = allLogs(logSpy);
    expect(logMsgs.some(m => m.includes('risk-patterns.md'))).toBe(true);
    expect(logMsgs.some(m => m.includes('Contiene decisiones del proyecto'))).toBe(true);
  });

  it('references risk-patterns.md in the review but does not embed its content (2.2)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[RISK_PATTERNS_DEST_PATH] = '# Patrones del Equipo\n\n## Microservicios\n- **Riesgo:** complejidad de deploys.\n\n## Cola Síncrona\n';
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    const reviewCall = reviewWrite();
    const writtenContent = String(reviewCall[1]);

    expect(writtenContent).toContain('docs/funky-ai/assess/risk-patterns.md');
    expect(writtenContent).not.toContain('Microservicios');
    expect(writtenContent).not.toContain('Cola Síncrona');
    expect(writtenContent).not.toContain('Patrones del Equipo');
    expect(writtenContent).not.toContain('{{DYNAMIC_QUESTIONS}}');
  });

  it('creates assess-prompt.md in docs/funky-ai/assess/ on first run (2.3)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(vi.mocked(fs.copyFileSync)).toHaveBeenCalledWith(TPL_PROMPT_PATH, PROMPT_DEST_PATH);
    const logMsgs = allLogs(logSpy);
    expect(logMsgs.some(m => m.includes('assess-prompt.md'))).toBe(true);
  });

  it('existing assess-prompt.md + TTY + y → updated (2.3)', async () => {
    setTTY(true);
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[PROMPT_DEST_PATH] = '# Prompt viejo';
    applyMocks(mf);
    clackMock.confirm.mockResolvedValue(true);

    await assessCommand.parseAsync([], { from: 'user' });

    expect(clackMock.confirm).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fs.copyFileSync)).toHaveBeenCalledWith(TPL_PROMPT_PATH, PROMPT_DEST_PATH);
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('existing assess-prompt.md + TTY + n → not overwritten (valid decision), exit 0 (2.3)', async () => {
    setTTY(true);
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[PROMPT_DEST_PATH] = '# Prompt viejo';
    applyMocks(mf);
    clackMock.confirm.mockResolvedValue(false);

    await assessCommand.parseAsync([], { from: 'user' });

    expect(clackMock.confirm).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fs.copyFileSync)).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);
    const logMsgs = allLogs(logSpy);
    expect(logMsgs.some(m => m.includes('Omitiendo (ya existe): assess-prompt.md'))).toBe(true);
  });

  it('existing assess-prompt.md + no TTY → default n, no prompt asked, not overwritten', async () => {
    setTTY(false);
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[PROMPT_DEST_PATH] = '# Prompt viejo';
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    expect(clackMock.confirm).not.toHaveBeenCalled();
    expect(vi.mocked(fs.copyFileSync)).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('sin TTY + guía existente → aviso no-TTY GENÉRICO, no hardcodeado a assess-prompt.md (0.3)', async () => {
    setTTY(false);
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[PROMPT_DEST_PATH] = '# Prompt viejo';
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    const logMsgs = allLogs(logSpy);
    expect(logMsgs.some(m => m.includes('Entorno no interactivo'))).toBe(true);
    expect(logMsgs.some(m => m.includes('no se actualiza la guía assess-prompt.md existente'))).toBe(false);
  });

  it('TTY + guía existente → el Y/N advierte explícitamente que actualizar REEMPLAZA el contenido actual (0.4)', async () => {
    setTTY(true);
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[PROMPT_DEST_PATH] = '# Prompt viejo';
    applyMocks(mf);
    clackMock.confirm.mockResolvedValue(true);

    await assessCommand.parseAsync([], { from: 'user' });

    expect(clackMock.confirm).toHaveBeenCalledTimes(1);
    const message = clackMock.confirm.mock.calls[0][0].message;
    expect(message).toContain('REEMPLAZA la actual');
    expect(message).toContain('perderás el progreso previo');
    expect(message).toContain('respaldo');
    expect(message).not.toContain('¿Quieres actualizarla con la versión más reciente?');
  });

  it('does not generate regex-detected C2 questions from canvas content', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', 'Equipo junior con React');
    addCanvas(mf, 'INFRA-CANVAS.md', 'Deploy en K8s cluster con SQLite en single node');
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    const reviewCall = reviewWrite();
    const writtenContent = String(reviewCall[1]);

    expect(writtenContent).not.toContain('Elegiste Kubernetes');
    expect(writtenContent).not.toContain('SQLite es liviano pero tiene límites');
    expect(writtenContent).not.toContain('Con un solo nodo, cualquier deploy');
    expect(writtenContent).not.toContain('El equipo es principalmente Junior');
  });

  it('próximos pasos: pegar assess-prompt.md como primer mensaje (2.7)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    const logMsgs = allLogs(logSpy);
    expect(logMsgs.some(m => m.includes('assess-prompt.md') && m.includes('primer mensaje'))).toBe(true);
  });

  it('M10: summary muestra estado por archivo y matiza el título cuando hubo omisiones', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    // Decisiones ya existen → se conservan; risk-patterns y prompt se crean; el review siempre se regenera.
    mf[DECISIONS_DEST_PATH] = '# Decisiones del equipo';
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const msgs = allLogs(logSpy);
    expect(msgs.some(m => m.includes('Material de assess listo: 3 creados, 1 conservados.'))).toBe(true);
    expect(msgs.some(m => m.includes('Guía de discusión generada exitosamente'))).toBe(false);
    expect(msgs.some(m => m.includes('architecture-review.md') && m.includes('— generado'))).toBe(true);
    expect(msgs.some(m => m.includes('architecture-decisions.md') && m.includes('— conservado'))).toBe(true);
    expect(msgs.some(m => m.includes('risk-patterns.md') && m.includes('— creado'))).toBe(true);
    expect(msgs.some(m => m.includes('assess-prompt.md') && m.includes('— creado'))).toBe(true);
  });

  it('M10: en creación limpia el summary matiza "listo: 4 creados, 0 conservados"', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    await assessCommand.parseAsync([], { from: 'user' });

    const msgs = allLogs(logSpy);
    expect(msgs.some(m => m.includes('Material de assess listo: 4 creados, 0 conservados.'))).toBe(true);
    expect(msgs.some(m => m.includes('Guía de discusión generada exitosamente'))).toBe(false);
  });

  it('exits 1 when --context file is missing (R-A1), with neutral Spanish "Asegúrate" (2.5)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    // No context.json
    applyMocks(mf);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await assessCommand.parseAsync(['--context', 'missing.json'], { from: 'user' });

    const errMsgs = errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('No se pudo leer context.json'))).toBe(true);
    expect(errMsgs.some(m => m.includes('Asegúrate'))).toBe(true);
    expect(errMsgs.some(m => m.includes('Asegurate'))).toBe(false);
    expect(exitSpy).toHaveBeenCalledWith(1);
    errorSpy.mockRestore();
  });
});

// ── --context flag tests ──

describe('--context flag', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    clackMock.isCancel.mockReturnValue(false);
    clackMock.confirm.mockReset();
  });

  it('reads canvases from filesystem when --context is provided', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, v2Context());
    applyMocks(mf);

    const result = await runAssess(CWD, { context: true });

    // R-P12: devuelve result object
    expect(result.phase).toBe('assess');
    expect(result.status).toBe('completed');
    expect(typeof result.durationMs).toBe('number');
    expect(Array.isArray(result.warnings)).toBe(true);

    const reviewCall = reviewWrite();
    expect(reviewCall).toBeTruthy();
    const writtenContent = String(reviewCall[1]);
    // El review referencia los canvases; NO incrusta su contenido.
    expect(writtenContent).toContain('docs/funky-ai/canvas/PROJECT-CANVAS.md');
    expect(writtenContent).toContain('docs/funky-ai/canvas/INFRA-CANVAS.md');
    expect(writtenContent).not.toContain(CANVAS_PROJECT_CONTENT);
    expect(writtenContent).not.toContain(CANVAS_INFRA_CONTENT);
  });

  it('prints error when context file is missing', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    // No addContextJson — context.json is missing
    applyMocks(mf);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await runAssess(CWD, { context: true });

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

  it('writes assess results to context.json', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, v2Context());
    applyMocks(mf);

    await runAssess(CWD, { context: true });

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

  it('writes the real decisions file path to assess.decisionsFile', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, v2Context());
    applyMocks(mf);

    await runAssess(CWD, { context: true });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).endsWith('context.json'));
    const writtenData = JSON.parse(contextCall[1]);
    // Ruta relativa al targetBase, igual que las demás rutas del context
    expect(writtenData.assess.decisionsFile).toBe('docs/funky-ai/assess/architecture-decisions.md');
  });

  it('writes the surfaced risk pattern names to assess.surfacedPatterns; review does NOT embed them (2.2)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, v2Context());
    mf[RISK_PATTERNS_DEST_PATH] = '# Patrones del Equipo\n\n## Microservicios\n## Cola Síncrona';
    applyMocks(mf);

    const result = await runAssess(CWD, { context: true });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).endsWith('context.json'));
    const writtenData = JSON.parse(contextCall[1]);
    expect(writtenData.assess.surfacedPatterns).toEqual(['Microservicios', 'Cola Síncrona']);
    // El review referencia risk-patterns.md, no incrusta su contenido.
    const reviewCall = reviewWrite();
    expect(String(reviewCall[1])).not.toContain('Microservicios');
    // R-P12: artifacts en el result object (guía generada + prompt guía)
    expect(result.artifacts.some(a => a.name === 'architecture-review.md' && a.kind === 'generated')).toBe(true);
    expect(result.artifacts.some(a => a.name === 'assess-prompt.md' && a.kind === 'living')).toBe(true);
    expect(result.artifacts.every(a => typeof a.path === 'string' && !a.path.startsWith('/'))).toBe(true);
  });

  it('honors a custom context path', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    mf[path.join(CWD, 'custom', 'context.json')] = JSON.stringify(v2Context());
    applyMocks(mf);

    await runAssess(CWD, { context: 'custom/context.json' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).replace(/\\/g, '/').endsWith('custom/context.json'));
    expect(contextCall).toBeTruthy();
    const writtenData = JSON.parse(contextCall[1]);
    expect(writtenData.assess.runAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(Array.isArray(writtenData.assess.surfacedPatterns)).toBe(true);
    expect(writtenData.assess.status).toBe('completed');
  });

  it('suppresses summary console.log when json:true (R-P11)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, v2Context());
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await runAssess(CWD, { context: true, json: true });

    expect(result.status).toBe('completed');
    const logMsgs = allLogs(logSpy);
    expect(logMsgs.some(m => m.includes('Guía de discusión generada'))).toBe(false);
    expect(logMsgs.some(m => m.includes('Próximos pasos'))).toBe(false);

    logSpy.mockRestore();
  });
});
