import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock de @clack/prompts (patrón init.test.js/skills.interactive.test.js): la
// confirmación Y/N de guías existentes (kind 'guide', Fase 2 2.3/2.8) vivirá
// en la capa interactiva del comando estimate.
const clackMock = vi.hoisted(() => ({
  confirm: vi.fn(),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
}));

vi.mock('@clack/prompts', () => clackMock);

vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks, estimateMockFiles as createMockFiles, addCanvas, addDecisions, addOptionalTemplates, PRICING_GUIDE_DEST, PRICING_GUIDE_TPL_PATH, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, DECISIONS_CONTENT, DEFAULT_GUIDE_TEMPLATE, TOPIC_FRAGMENT_ROLES, TOPIC_FRAGMENT_SECURITY, TOPIC_FRAGMENT_TRANSACTIONS, embedTopicIntoGuide } from './helpers/fsMock.js';
import fs from 'fs';
import path from 'path';
import { estimateCommand } from '../src/commands/estimate.js';

// Datos de fixture para drift de templates (dato de prueba, no copy de
// producción): el fragmento NUEVO vive en el template real del topic, el VIEJO
// en la guía incrustada; BASE_SECTION es la sección añadida a la base.
const OLD_SECURITY_FRAGMENT = '## Seguridad\n\nImpacto en costos:\n- Versión antigua.';
const NEW_SECURITY_FRAGMENT = '## Seguridad\n\nImpacto en costos:\n- Nueva versión del fragmento.';
const BASE_SECTION = '## Base Actualizada';

// ═══════════════════════════════════════════════════
// Fase 2, 2.3c/2.3e y 2.8: confirmaciones Y/N (TDD red)
// La capa interactiva del comando estimate se implementa en la tanda siguiente
// (2.4/2.8); estos tests expresan el CONTRATO y caen rojos hasta entonces.
// ═══════════════════════════════════════════════════

function seedGuide(mf, content) {
  mf[PRICING_GUIDE_DEST] = content;
}

function seedGuideWithTopics(mf, topics) {
  let guide = DEFAULT_GUIDE_TEMPLATE;
  for (const [key, fragment] of topics) {
    guide = embedTopicIntoGuide(guide, key, fragment);
  }
  seedGuide(mf, guide);
}

describe('estimateCommand — guías interactivas (2.3c/2.3e, 2.8 — TDD red)', () => {
  let exitSpy;
  let stderrSpy;
  let logSpy;
  // Riesgo 1: el gate `interactive` lee process.stdin.isTTY por llamada. Los
  // tests Y/N simulan un terminal (true); el test no-TTY lo apaga (undefined).
  // Se guarda el valor original al cargar el archivo y se restaura en afterEach.
  const originalIsTTY = process.stdin.isTTY;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    clackMock.confirm.mockReset();
    clackMock.isCancel.mockReturnValue(false);
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    process.stdin.isTTY = true;
  });

  afterEach(() => {
    process.stdin.isTTY = originalIsTTY;
    exitSpy.mockRestore();
    stderrSpy.mockRestore();
    logSpy.mockRestore();
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

  it('2.3c: template de un topic modificado → confirma Y/N; con "n" conserva la sección actual y sale 0', async () => {
    const mf = standardMocks();
    // El template REAL del topic cambió respecto a lo incrustado en la guía.
    mf[path.join(PRICING_GUIDE_TPL_PATH, '..', 'topics', 'security.md')] = NEW_SECURITY_FRAGMENT;
    seedGuideWithTopics(mf, [['security', OLD_SECURITY_FRAGMENT]]);
    clackMock.confirm.mockResolvedValue(false);

    await estimateCommand.parseAsync(['--security'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(clackMock.confirm).toHaveBeenCalled();
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const guideCall = writeCalls.find((c) => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    expect(guideContent).toContain(OLD_SECURITY_FRAGMENT);
    expect(guideContent).not.toContain(NEW_SECURITY_FRAGMENT);
  });

  it('2.3e: template base modificado → confirma Y/N; con "n" NO toca la guía actual y sale 0', async () => {
    const mf = standardMocks();
    // El template base se actualizó: la guía existente está desactualizada.
    mf[PRICING_GUIDE_TPL_PATH] = DEFAULT_GUIDE_TEMPLATE + '\n\n## Sección Nueva de la Base';
    seedGuideWithTopics(mf, [['security', TOPIC_FRAGMENT_SECURITY], ['roles', TOPIC_FRAGMENT_ROLES]]);
    clackMock.confirm.mockResolvedValue(false);

    await estimateCommand.parseAsync(['--security', '--roles'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(clackMock.confirm).toHaveBeenCalled();
    const guideCall = vi.mocked(fs.writeFileSync).mock.calls.find((c) => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    // Ningún topic se pierde aunque la base haya cambiado (se conserva lo actual).
    expect(guideContent).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(guideContent).toContain(TOPIC_FRAGMENT_ROLES);
  });

  it('2.3e: con "y" reconstruye la base fresca y reincrusta TODOS los topics detectados', async () => {
    const mf = standardMocks();
    mf[PRICING_GUIDE_TPL_PATH] = DEFAULT_GUIDE_TEMPLATE + '\n\n' + BASE_SECTION;
    seedGuideWithTopics(mf, [['security', TOPIC_FRAGMENT_SECURITY], ['transactions', TOPIC_FRAGMENT_TRANSACTIONS]]);
    clackMock.confirm.mockResolvedValue(true);

    await estimateCommand.parseAsync(['--security', '--transactions'], { from: 'user' });

    expect(clackMock.confirm).toHaveBeenCalled();
    const guideCall = vi.mocked(fs.writeFileSync).mock.calls.find((c) => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    expect(guideContent).toContain(BASE_SECTION);
    expect(guideContent).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(guideContent).toContain(TOPIC_FRAGMENT_TRANSACTIONS);
  });

  it('2.8: estimate-prompt.md existente → confirma Y/N (kind guide); con "n" no lo sobrescribe y sale 0', async () => {
    const mf = standardMocks();
    mf[path.join(PRICING_GUIDE_DEST, '..', 'estimate-prompt.md')] = '# Prompt previo del equipo';
    clackMock.confirm.mockResolvedValue(false);

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(clackMock.confirm).toHaveBeenCalled();
    const promptWrite = vi.mocked(fs.writeFileSync).mock.calls.find((c) => String(c[0]).includes('estimate-prompt.md'));
    expect(promptWrite).toBeFalsy();
  });

  it('R1: sin TTY + drift de template → default n logueado: NO pregunta y conserva la guía', async () => {
    const mf = standardMocks();
    mf[PRICING_GUIDE_TPL_PATH] = DEFAULT_GUIDE_TEMPLATE + '\n\n' + BASE_SECTION;
    seedGuideWithTopics(mf, [['security', TOPIC_FRAGMENT_SECURITY]]);
    process.stdin.isTTY = undefined;

    await estimateCommand.parseAsync(['--security'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(clackMock.confirm).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('se conserva la guía actual'));
    const guideCall = vi.mocked(fs.writeFileSync).mock.calls.find((c) => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    expect(guideContent).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(guideContent).not.toContain(BASE_SECTION);
  });
});
