import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks, estimateMockFiles as createMockFiles, addCanvas, addDecisions, addOptionalTemplates, CWD, ESTIMATE_TPL_DIR as TPL_DIR, CANVAS_PROJECT_CONTENT, CANVAS_INFRA_CONTENT, DECISIONS_CONTENT, NEUTRAL_DECISIONS, projectCanvasWith, infraCanvasWith, CHECKLIST_TEMPLATE, TOPIC_FRAGMENT_ROLES, TOPIC_FRAGMENT_SECURITY } from './helpers/fsMock.js';
import path from 'path';
import fs from 'fs';
import { estimateCommand } from '../src/commands/estimate.js';

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

    estimateCommand.parse(['--security', '--roles'], { from: 'user' });

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

    estimateCommand.parse([], { from: 'user' });

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

    estimateCommand.parse(['--multi-tenant'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain(TOPIC_FRAGMENT_MULTI_TENANT);
    expect(guide).not.toContain('## Roles del equipo');
  });

  it('R7: --brief without a value embeds the checklist', () => {
    standardMocks();

    estimateCommand.parse(['--brief'], { from: 'user' });

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

    estimateCommand.parse(['--brief', 'missing.md'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('## Brief Funcional');
    const warnMsgs = warnSpy.mock.calls.map((c) => String(c));
    expect(warnMsgs.some((m) => m.includes('missing.md') && m.includes('brief'))).toBe(true);

    warnSpy.mockRestore();
  });

  it('R10: --pricing-team embeds the team-cost reference section', () => {
    standardMocks();

    estimateCommand.parse(['--pricing-team'], { from: 'user' });

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

    estimateCommand.parse([], { from: 'user' });

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

    estimateCommand.parse(['--security'], { from: 'user' });

    const msgs = logSpy.mock.calls.map((c) => String(c));
    expect(msgs.some((m) => m.includes('Considerá --security'))).toBe(false);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain(TOPIC_FRAGMENT_SECURITY);

    logSpy.mockRestore();
  });

  it('R13: identical inputs and flags twice → byte-identical guide', () => {
    standardMocks();

    estimateCommand.parse(['--security', '--roles', '--brief', '--pricing-team'], { from: 'user' });
    const first = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(first).toContain('Guía de Discusión de Pricing');

    vi.mocked(fs.writeFileSync).mockClear();

    estimateCommand.parse(['--security', '--roles', '--brief', '--pricing-team'], { from: 'user' });
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

    estimateCommand.parse(['--security'], { from: 'user' });

    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('Editado local: auditoría externa de cumplimiento');
    expect(guide).not.toContain('Auth y cumplimiento');
  });

  it('lists included sections in the console summary (canonical order)', () => {
    standardMocks();

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    estimateCommand.parse(['--security', '--roles', '--brief', '--pricing-team'], { from: 'user' });

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

    estimateCommand.parse([], { from: 'user' });

    const msgs = logSpy.mock.calls.map((c) => String(c));
    expect(msgs.some((m) => m.includes('Secciones incluidas en la guía: ficha de alcance.'))).toBe(true);

    logSpy.mockRestore();
  });

  // ── Issue #33: auto-detección del brief de init ──
  const INIT_BRIEF_CONTENT = '# 📋 BRIEF FUNCIONAL\n\n## 1. Nombre del Producto o Idea\n[Completar]';

  it('#33: auto-detects docs/funky-ai/canvas/brief-funcional.md when it exists and no --brief is passed', () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addCanvas(mf, 'brief-funcional.md', INIT_BRIEF_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    estimateCommand.parse([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain(INIT_BRIEF_CONTENT);
    expect(guide).not.toContain('¿Qué problema resuelve el producto?');
  });

  it('#33: --brief <path> explicit overrides the auto-detected init brief', () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addCanvas(mf, 'brief-funcional.md', INIT_BRIEF_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    mf[path.join(CWD, 'custom-brief.md')] = 'BRIEF DEL USUARIO CUSTOM';
    applyMocks(mf);

    estimateCommand.parse(['--brief', 'custom-brief.md'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain('BRIEF DEL USUARIO CUSTOM');
    expect(guide).not.toContain(INIT_BRIEF_CONTENT);
  });

  it('#33: --brief without a value still embeds the checklist (R7) even when the init brief exists', () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addCanvas(mf, 'brief-funcional.md', INIT_BRIEF_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    estimateCommand.parse(['--brief'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).toContain(CHECKLIST_TEMPLATE);
    expect(guide).not.toContain(INIT_BRIEF_CONTENT);
  });

  it('#33: no init brief and no --brief → no Brief Funcional section (fallback intacto)', () => {
    const mf = createMockFiles();
    addOptionalTemplates(mf);
    addCanvas(mf, 'PROJECT-CANVAS.md', CANVAS_PROJECT_CONTENT);
    addCanvas(mf, 'INFRA-CANVAS.md', CANVAS_INFRA_CONTENT);
    addDecisions(mf, DECISIONS_CONTENT);
    applyMocks(mf);

    estimateCommand.parse([], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const guide = guideFromWriteCalls(vi.mocked(fs.writeFileSync).mock.calls);
    expect(guide).not.toContain('## Brief Funcional');
  });
});
