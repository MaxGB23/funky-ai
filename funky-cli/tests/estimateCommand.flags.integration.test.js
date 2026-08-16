import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks, estimateMockFiles as createMockFiles, addCanvas, addDecisions, addOptionalTemplates, CWD, ESTIMATE_TPL_DIR as TPL_DIR, PRICING_GUIDE_DEST, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, DECISIONS_CONTENT, DEFAULT_GUIDE_TEMPLATE, TOPIC_FRAGMENT_ROLES, TOPIC_FRAGMENT_SECURITY, TOPIC_FRAGMENT_MULTI_TENANT, TEAM_COST_TEMPLATE, embedTopicIntoGuide } from './helpers/fsMock.js';
import path from 'path';
import fs from 'fs';
import { estimateCommand } from '../src/commands/estimate.js';

// ═══════════════════════════════════════════════════
// PR 3 (estimate-redesign) + Fase 2 (2.1/2.2 verdes, 2.3/2.8 TDD red)
// ═══════════════════════════════════════════════════

function guideFromWriteCalls(writeCalls) {
  const call = writeCalls.find((c) => String(c[0]).includes('pricing-guide.md'));
  return call ? String(call[1]) : null;
}

function seedEmbeddedGuide(mf, topicKey, fragment) {
  mf[PRICING_GUIDE_DEST] = embedTopicIntoGuide(DEFAULT_GUIDE_TEMPLATE, topicKey, fragment);
}

describe('estimateCommand — guía declarativa (2.1)', () => {
  let exitSpy;
  let stderrSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
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

  it('2.1: la guía referencia los archivos del proyecto y NO incrusta su contenido', async () => {
    standardMocks();

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('docs/funky-ai/canvas/brief-funcional.md');
    expect(guide).toContain('docs/funky-ai/canvas/PROJECT-CANVAS.md');
    expect(guide).toContain('docs/funky-ai/canvas/INFRA-CANVAS.md');
    expect(guide).toContain('docs/funky-ai/assess/architecture-decisions.md');
    expect(guide).not.toContain('Next.js');
    // 2.1: el canvas incrusta estos valores (dato de fixture) → la guía NO los
    // incrusta; aserción de rama (regex semántico), no copy.
    expect(guide).not.toMatch(/AWS EC2/);
    expect(guide).not.toMatch(/React 18/);
  });

  it('2.1: sin flags no hay ficha de alcance, ni secciones de topics, ni brief embebido', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    // 2.1: sin flags → nada de secciones opcionales ni brief embebido
    // (los encabezados son anclas estructurales en forma regex).
    expect(guide).not.toMatch(/## Alcance: ¿Aplica en esta fase\?/);
    expect(guide).not.toMatch(/^\| Tema \| Estado \|$/m);
    expect(guide).not.toMatch(/## Roles del equipo/);
    expect(guide).not.toMatch(/## Seguridad/);
    expect(guide).not.toMatch(/## Brief Funcional/);
    expect(guide).not.toMatch(/## Referencia de Costos de Equipo/);
    expect(guide).not.toContain('{{OPTIONAL_SECTIONS}}');
    expect(guide).toMatch(/## Estructura de Discusión/);
  });
});

describe('estimateCommand — terminal limpia (2.2)', () => {
  let exitSpy;
  let stderrSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    exitSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it('2.2: no imprime sugerencias automáticas de flags (💡 Se detectó / Considerá)', async () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    // Señal clara de seguridad en el canvas: la terminal DEBE quedar igual limpia.
    addCanvas(mf, 'INFRA-CANVAS.md', '# INFRA CANVAS\n\n## 2. Autenticación\nLogin con JWT');
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    const msgs = logSpy.mock.calls.map((c) => String(c));
    expect(msgs.some((m) => /💡 Se detectó/.test(m))).toBe(false);
    expect(msgs.some((m) => /Considerá --/.test(m))).toBe(false);

    logSpy.mockRestore();
  });
});

describe('estimateCommand — incrustación aditiva por marcadores (2.3, TDD red)', () => {
  let exitSpy;
  let stderrSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
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

  it('2.3a: primera corrida crea la guía con la sección del flag incrustada por marcador, sobre ## Estructura de Discusión', async () => {
    standardMocks();

    await estimateCommand.parseAsync(['--security'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('<!-- topic:security -->');
    expect(guide).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(guide).toContain('<!-- /topic:security -->');
    expect(guide.indexOf('<!-- topic:security -->')).toBeLessThan(guide.indexOf('## Estructura de Discusión'));
  });

  it('2.3b: segunda corrida con otra flag incrusta la nueva sección sin preguntar, conserva la anterior y mantiene el orden canónico', async () => {
    const mf = standardMocks();
    seedEmbeddedGuide(mf, 'security', TOPIC_FRAGMENT_SECURITY);

    await estimateCommand.parseAsync(['--roles'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain(TOPIC_FRAGMENT_ROLES);
    expect(guide).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(guide.indexOf('<!-- topic:roles -->')).toBeLessThan(guide.indexOf('<!-- topic:security -->'));
  });

  it('2.3d: repetir la misma flag es idempotente: no duplica la sección y sale 0', async () => {
    standardMocks();

    await estimateCommand.parseAsync(['--security'], { from: 'user' });
    vi.mocked(fs.writeFileSync).mockClear();
    await estimateCommand.parseAsync(['--security'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide.match(/<!-- topic:security -->/g) || []).toHaveLength(1);
  });

  it('2.3e: template base modificado → refresco reincrusta TODOS los topics detectados (ninguno se pierde)', async () => {
    const mf = standardMocks();
    seedEmbeddedGuide(mf, 'security', TOPIC_FRAGMENT_SECURITY);
    seedEmbeddedGuide(mf, 'roles', TOPIC_FRAGMENT_ROLES);

    await estimateCommand.parseAsync(['--security', '--roles'], { from: 'user' });

    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain(TOPIC_FRAGMENT_ROLES);
    expect(guide).toContain(TOPIC_FRAGMENT_SECURITY);
  });
});

describe('estimateCommand — estimate-prompt.md (2.8, TDD red)', () => {
  let exitSpy;
  let stderrSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
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

  it('2.8: genera docs/funky-ai/estimate/estimate-prompt.md (intención kind guide)', async () => {
    standardMocks();

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const writeCalls = vi.mocked(fs.writeFileSync).mock.calls;
    const promptCall = writeCalls.find((c) => String(c[0]).includes('estimate-prompt.md'));
    expect(promptCall).toBeTruthy();
    // (b): el prompt completo es la expectativa centralizada (snapshot).
    expect(String(promptCall[1])).toMatchSnapshot();
  });

  it('2.8: no imprime el prompt gigante en consola (el material vive en estimate-prompt.md)', async () => {
    standardMocks();

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    const msgs = logSpy.mock.calls.map((c) => String(c));
    expect(msgs.some((m) => /PROMPT PARA INICIAR SESIÓN/.test(m))).toBe(false);
    expect(msgs.some((m) => /Material de análisis/.test(m))).toBe(false);

    logSpy.mockRestore();
  });
});

describe('estimateCommand — determinismo y resumen (R13 + 2.2)', () => {
  let exitSpy;
  let stderrSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
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

  it('R13: identical inputs and flags twice → byte-identical guide', async () => {
    standardMocks();

    await estimateCommand.parseAsync(['--security', '--roles'], { from: 'user' });
    const first = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(first).toMatch(/Guía de Discusión de Pricing/);

    vi.mocked(fs.writeFileSync).mockClear();

    await estimateCommand.parseAsync(['--security', '--roles'], { from: 'user' });
    const second = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);

    // R13: byte-identidad cubre el encabezado del segundo (heredado de first).
    expect(second).toBe(first);
  });

  it('resumen lista las secciones solicitadas sin la ficha de alcance', async () => {
    standardMocks();

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await estimateCommand.parseAsync(['--security', '--roles', '--brief', '--pricing-team'], { from: 'user' });

    const msgs = logSpy.mock.calls.map((c) => String(c));
    expect(msgs.some((m) => /Secciones solicitadas en la guía: brief funcional, roles del equipo, seguridad, referencia de costos de equipo\./.test(m))).toBe(true);
    expect(msgs.some((m) => /ficha de alcance/.test(m))).toBe(false);

    logSpy.mockRestore();
  });

  it('resumen sin flags → ninguna (guía base declarativa)', async () => {
    const mf = createMockFiles();
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    await estimateCommand.parseAsync([], { from: 'user' });

    const msgs = logSpy.mock.calls.map((c) => String(c));
    expect(msgs.some((m) => /Secciones solicitadas en la guía: ninguna \(guía base declarativa\)\./.test(m))).toBe(true);

    logSpy.mockRestore();
  });

  it('acepta --brief sin valor y sale 0; la guía queda declarativa (el contenido se referencia)', async () => {
    standardMocks();

    await estimateCommand.parseAsync(['--brief'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).not.toMatch(/## Brief Funcional/);
  });

  it('#33: sin init brief y sin --brief → no sección de brief en la guía', async () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    await estimateCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).not.toMatch(/## Brief Funcional/);
  });

  it('R10: --pricing-team incrusta la referencia de costos de equipo en la guía', async () => {
    standardMocks();

    await estimateCommand.parseAsync(['--pricing-team'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('<!-- topic:pricing-team -->');
    expect(guide).toContain(TEAM_COST_TEMPLATE);
  });

  it('R10.2: sin --pricing-team la guía no contiene la referencia de costos de equipo', async () => {
    standardMocks();

    await estimateCommand.parseAsync(['--roles'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).not.toContain('<!-- topic:pricing-team -->');
    expect(guide).not.toContain(TEAM_COST_TEMPLATE);
  });
});

// ── Guard de aceptación de flags Commander (R8): el parseo de todos los flags
//    se mantiene aunque la incrustación sea la nueva (2.3).
describe('estimateCommand — flags Commander (R8)', () => {
  let exitSpy;
  let stderrSpy;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fs.writeFileSync).mockReset();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
    stderrSpy = vi.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    exitSpy.mockRestore();
    stderrSpy.mockRestore();
  });

  it('R8: acepta --multi-tenant (Commander camelCase) y sale 0', async () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    mf[path.join(TPL_DIR, 'topics', 'multi-tenant.md')] = TOPIC_FRAGMENT_MULTI_TENANT;
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    await estimateCommand.parseAsync(['--multi-tenant'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
