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
import { fsMock, applyMocks, estimateMockFiles as createMockFiles, addCanvas, addDecisions, addOptionalTemplates, PRICING_GUIDE_DEST, PRICING_GUIDE_TPL_PATH, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, DECISIONS_CONTENT, DEFAULT_GUIDE_TEMPLATE, TOPIC_FRAGMENT_ROLES, TOPIC_FRAGMENT_SECURITY, TOPIC_FRAGMENT_TRANSACTIONS } from './helpers/fsMock.js';
import fs from 'fs';
import path from 'path';
import { estimateCommand } from '../src/commands/estimate.js';

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
    guide = guide.replace(
      `<!-- topic:${key} -->\n<!-- /topic:${key} -->`,
      `<!-- topic:${key} -->\n${fragment}\n<!-- /topic:${key} -->`
    );
  }
  seedGuide(mf, guide);
}

describe('estimateCommand — guías interactivas (2.3c/2.3e, 2.8 — TDD red)', () => {
  let exitSpy;
  let stderrSpy;
  let logSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    clackMock.confirm.mockReset();
    clackMock.isCancel.mockReturnValue(false);
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
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

  it('2.3c: template de un topic modificado → confirma Y/N; con "n" conserva la sección actual y sale 0', () => {
    const mf = standardMocks();
    // El template REAL del topic cambió respecto a lo incrustado en la guía.
    mf[path.join(PRICING_GUIDE_TPL_PATH, '..', 'topics', 'security.md')] = '## Seguridad\n\nImpacto en costos:\n- Nueva versión del fragmento.';
    seedGuideWithTopics(mf, [['security', '## Seguridad\n\nImpacto en costos:\n- Versión antigua.']]);
    clackMock.confirm.mockResolvedValue(false);

    estimateCommand.parse(['--security'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(clackMock.confirm).toHaveBeenCalled();
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const guideCall = writeCalls.find((c) => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    expect(guideContent).toContain('Versión antigua');
    expect(guideContent).not.toContain('Nueva versión del fragmento');
  });

  it('2.3e: template base modificado → confirma Y/N; con "n" NO toca la guía actual y sale 0', () => {
    const mf = standardMocks();
    // El template base se actualizó: la guía existente está desactualizada.
    mf[PRICING_GUIDE_TPL_PATH] = DEFAULT_GUIDE_TEMPLATE + '\n\n## Sección Nueva de la Base';
    seedGuideWithTopics(mf, [['security', TOPIC_FRAGMENT_SECURITY], ['roles', TOPIC_FRAGMENT_ROLES]]);
    clackMock.confirm.mockResolvedValue(false);

    estimateCommand.parse(['--security', '--roles'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(clackMock.confirm).toHaveBeenCalled();
    const guideCall = vi.mocked(fs.writeFileSync).mock.calls.find((c) => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    // Ningún topic se pierde aunque la base haya cambiado (se conserva lo actual).
    expect(guideContent).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(guideContent).toContain(TOPIC_FRAGMENT_ROLES);
  });

  it('2.3e: con "y" reconstruye la base fresca y reincrusta TODOS los topics detectados', () => {
    const mf = standardMocks();
    mf[PRICING_GUIDE_TPL_PATH] = DEFAULT_GUIDE_TEMPLATE + '\n\n## Base Actualizada';
    seedGuideWithTopics(mf, [['security', TOPIC_FRAGMENT_SECURITY], ['transactions', TOPIC_FRAGMENT_TRANSACTIONS]]);
    clackMock.confirm.mockResolvedValue(true);

    estimateCommand.parse(['--security', '--transactions'], { from: 'user' });

    expect(clackMock.confirm).toHaveBeenCalled();
    const guideCall = vi.mocked(fs.writeFileSync).mock.calls.find((c) => String(c[0]).includes('pricing-guide.md'));
    expect(guideCall).toBeTruthy();
    const guideContent = String(guideCall[1]);
    expect(guideContent).toContain('## Base Actualizada');
    expect(guideContent).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(guideContent).toContain(TOPIC_FRAGMENT_TRANSACTIONS);
  });

  it('2.8: estimate-prompt.md existente → confirma Y/N (kind guide); con "n" no lo sobrescribe y sale 0', () => {
    const mf = standardMocks();
    mf[path.join(PRICING_GUIDE_DEST, '..', 'estimate-prompt.md')] = '# Prompt previo del equipo';
    clackMock.confirm.mockResolvedValue(false);

    estimateCommand.parse([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(clackMock.confirm).toHaveBeenCalled();
    const promptWrite = vi.mocked(fs.writeFileSync).mock.calls.find((c) => String(c[0]).includes('estimate-prompt.md'));
    expect(promptWrite).toBeFalsy();
  });
});
