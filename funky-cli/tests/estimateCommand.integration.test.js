import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks, v2Context, estimateMockFiles as createMockFiles, addCanvas, addDecisions, addContextJson, CWD, DECISIONS_DIR, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, DECISIONS_CONTENT } from './helpers/fsMock.js';
import path from 'path';
import fs from 'fs';
import { estimateCommand, runEstimate } from '../src/commands/estimate.js';

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

  it('exits 0 with full flow (decisions + canvases)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    expect(writeCalls.some(c => String(c[0]).includes('pricing-guide.md'))).toBe(true);
    expect(writeCalls.some(c => String(c[0]).includes('pricing-decisions.md'))).toBe(true);
  });

  it('warns when decisions are missing and exits 0', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(warnSpy).toHaveBeenCalled();
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('architecture-decisions'))).toBe(true);
    // M6/M11: el aviso dice el comando correctivo (funky assess) y NO afirma
    // "contenido parcial" (la guía referencia archivos, no incrusta contenido).
    expect(warnMsgs.some(m => m.includes('funky assess'))).toBe(true);
    expect(warnMsgs.some(m => m.includes('contenido parcial'))).toBe(false);

    warnSpy.mockRestore();
  });

  it('warns when project canvas is missing and exits 0', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('PROJECT-CANVAS'))).toBe(true);
    // M11: el aviso de canvas faltante dice el comando correctivo (funky init).
    expect(warnMsgs.some(m => m.includes('funky init'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('M6: los avisos de canvas faltante describen la referencia (no "Usando placeholder") y dicen "funky init"', async () => {
    const mf = createMockFiles();
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('PROJECT-CANVAS') && m.includes('funky init'))).toBe(true);
    expect(warnMsgs.some(m => m.includes('INFRA-CANVAS') && m.includes('funky init'))).toBe(true);
    expect(warnMsgs.some(m => m.includes('placeholder'))).toBe(false);

    warnSpy.mockRestore();
  });

  it('warns on unfilled canvas sections and exits 0', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', 'Framework: [Responde aquí]');
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const warnMsgs = warnSpy.mock.calls.map(c => String(c));
    expect(warnMsgs.some(m => m.includes('[Responde aquí]'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('exits 0 even when nothing exists (graceful degradation)', async () => {
    const mf = createMockFiles();
    applyMocks(mf);

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('exits 1 when --context file is missing (R-E1)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    // No context.json
    applyMocks(mf);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await estimateCommand.parseAsync(['--context', 'missing.json'], { from: 'user' });

    // El exit(1) proviene del result status 'failed' (no del parseo de Commander).
    const errMsgs = errorSpy.mock.calls.map(c => String(c));
    expect(errMsgs.some(m => m.includes('No se pudo leer context.json'))).toBe(true);
    expect(exitSpy).toHaveBeenCalledWith(1);
    errorSpy.mockRestore();
  });

  it('writes pricing-guide.md and pricing-decisions-template.md', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    await estimateCommand.parseAsync([], { from: 'user' });

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

  it('overwrites pricing-guide.md when it already exists (derived artifact)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    mf[path.join(CWD, 'docs', 'funky-ai', 'estimate', 'pricing-guide.md')] = '# Guía obsoleta previa';
    applyMocks(mf);

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const guideCall = writeCalls.find(c => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    expect(guideContent).toContain('Guía de Discusión de Pricing');
    expect(guideContent).not.toContain('Guía obsoleta previa');
  });

  it('does NOT overwrite an existing pricing-decisions.md; logs the engine backup recommendation (0.2)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    mf[path.join(CWD, 'docs', 'funky-ai', 'estimate', 'pricing-decisions.md')] = '# Acuerdos previos del equipo';
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const decisionsCall = writeCalls.find(c => String(c[0]).includes('pricing-decisions.md'));
    expect(decisionsCall).toBeFalsy();
    // El mensaje completo viene del motor común (kind decision): la recomendación
    // de backup reemplaza al warning corto "No se sobrescribió" (Fase 0, 0.2).
    const logMsgs = logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('pricing-decisions.md') && m.includes('ya existe'))).toBe(true);
    expect(logMsgs.some(m => m.includes('Contiene decisiones del proyecto'))).toBe(true);
    expect(logMsgs.some(m => m.includes('elimínalo o muévelo de ubicación'))).toBe(true);

    logSpy.mockRestore();
  });

  it('M7: summary matiza el título con conteos (N creados, M conservados) en creación limpia', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const msgs = logSpy.mock.calls.map(c => String(c));
    expect(msgs.some(m => m.includes('Material de pricing listo: 2 creados, 0 conservados.'))).toBe(true);
    expect(msgs.some(m => m.includes('Material de pricing generado exitosamente'))).toBe(false);

    logSpy.mockRestore();
  });

  it('M7: summary muestra estado por archivo (generado / creado / conservado) cuando hubo omisiones', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    // pricing-decisions.md ya existe → se conserva; la guía se regenera; el prompt se crea.
    mf[path.join(CWD, 'docs', 'funky-ai', 'estimate', 'pricing-decisions.md')] = '# Acuerdos previos del equipo';
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const msgs = logSpy.mock.calls.map(c => String(c));
    expect(msgs.some(m => m.includes('pricing-guide.md') && m.includes('— generado'))).toBe(true);
    expect(msgs.some(m => m.includes('pricing-decisions.md') && m.includes('— conservado'))).toBe(true);
    expect(msgs.some(m => m.includes('estimate-prompt.md') && m.includes('— creado'))).toBe(true);

    logSpy.mockRestore();
  });

  it('sin TTY y sin guías en el plan → NO loguea aviso de entorno no interactivo (0.3)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    const logMsgs = logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('Entorno no interactivo'))).toBe(false);

    logSpy.mockRestore();
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

  it('prints error when context file is missing', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    applyMocks(mf);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await runEstimate(CWD, { context: true });

    expect(errorSpy).toHaveBeenCalled();
    // R-P12: resultado failed, sin artifacts
    expect(result.status).toBe('failed');
    expect(result.phase).toBe('estimate');
    expect(result.artifacts).toEqual([]);
    // Should NOT have written output (early return)
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const guideCall = writeCalls.find(c => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeFalsy();

    errorSpy.mockRestore();
  });

  it('uses decisions from filesystem when --context is provided', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addContextJson(mf, v2Context());
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    const result = await runEstimate(CWD, { context: true });

    // R-P12: result object
    expect(result.phase).toBe('estimate');
    expect(result.status).toBe('completed');
    expect(typeof result.durationMs).toBe('number');
    expect(Array.isArray(result.warnings)).toBe(true);

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const guideCall = writeCalls.find(c => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    // 2.1: la guía es declarativa — referencia las decisiones, no las incrusta.
    expect(guideContent).toContain('docs/funky-ai/assess/architecture-decisions.md');
    expect(guideContent).not.toContain('Next.js');
  });

  it('reads decisions from ctx.assess.decisionsFile when --context provides a custom path', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    // Ruta custom de decisiones (no la default) registrada por assess en context.json
    mf[path.join(DECISIONS_DIR, 'custom-decisions.md')] = '# Decisiones custom\n- Stack: Vue';
    addContextJson(mf, v2Context({
      assess: { decisionsFile: 'docs/funky-ai/assess/custom-decisions.md', runAt: '2024-01-01T00:00:00.000Z', status: 'completed', finishedAt: '2024-01-01T00:00:01.000Z', durationMs: 1000 }
    }));
    applyMocks(mf);

    const result = await runEstimate(CWD, { context: true });

    expect(result.status).toBe('completed');

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const guideCall = writeCalls.find(c => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    // 2.1: la guía no incrusta decisiones (se referencian). La ruta custom la
    // consume loadDecisions para el pipeline; TODO(2.4): la guía debe señalarla.
    expect(guideContent).not.toContain('Vue');
    expect(guideContent).not.toContain('DB: PostgreSQL');
    expect(guideContent).toContain('docs/funky-ai/assess/architecture-decisions.md');
  });

  it('writes estimate timestamp and completed state to context.json', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    addContextJson(mf, v2Context());
    applyMocks(mf);

    const result = await runEstimate(CWD, { context: true });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).endsWith('context.json'));
    expect(contextCall).toBeTruthy();
    const writtenData = JSON.parse(contextCall[1]);
    expect(writtenData.estimate.runAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    // R-P12/R-P10: estado completed + artifacts
    expect(writtenData.estimate.status).toBe('completed');
    expect(writtenData.estimate.finishedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(typeof writtenData.estimate.durationMs).toBe('number');
    expect(Array.isArray(writtenData.estimate.artifacts)).toBe(true);
    expect(writtenData.currentPhase).toBeNull();
    // R-P12: artifacts en el result object (guía generada)
    expect(result.artifacts.some(a => a.name === 'pricing-guide.md' && a.kind === 'generated')).toBe(true);
    expect(result.artifacts.every(a => typeof a.path === 'string' && !a.path.startsWith('/'))).toBe(true);
  });

  it('honors a custom context path', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    mf[path.join(CWD, 'custom', 'context.json')] = JSON.stringify(v2Context());
    applyMocks(mf);

    const result = await runEstimate(CWD, { context: 'custom/context.json' });

    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const contextCall = writeCalls.find(c => String(c[0]).replace(/\\/g, '/').endsWith('custom/context.json'));
    expect(contextCall).toBeTruthy();
    const writtenData = JSON.parse(contextCall[1]);
    expect(writtenData.estimate.runAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(writtenData.estimate.status).toBe('completed');
    expect(result.status).toBe('completed');
  });

  it('suppresses summary console.log when json:true (R-P11)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    addContextJson(mf, v2Context());
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await runEstimate(CWD, { context: true, json: true });

    expect(result.status).toBe('completed');
    const logMsgs = logSpy.mock.calls.map(c => String(c));
    expect(logMsgs.some(m => m.includes('Material de pricing generado'))).toBe(false);
    expect(logMsgs.some(m => m.includes('Material de pricing listo'))).toBe(false);
    expect(logMsgs.some(m => m.includes('PROMPT'))).toBe(false);

    logSpy.mockRestore();
  });
});
