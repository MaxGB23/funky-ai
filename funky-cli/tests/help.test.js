import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

const { fsExistsMock, fsReadMock } = vi.hoisted(() => ({
  fsExistsMock: vi.fn(),
  fsReadMock: vi.fn(),
}));

vi.mock('fs', () => ({
  default: { existsSync: fsExistsMock, readFileSync: fsReadMock },
  existsSync: fsExistsMock,
  readFileSync: fsReadMock,
}));

import { resolveDocCandidates, loadCommandDoc, enrichCommandHelp } from '../src/utils/help.js';

const TARGET = '/fake/project';

describe('resolveDocCandidates()', () => {
  it('prioriza docs/funky-ai y cae a docs/funky-forge', () => {
    const candidates = resolveDocCandidates('scaffold', { targetBase: TARGET });

    expect(candidates).toEqual([
      path.join(TARGET, 'docs/funky-ai/scaffold.md'),
      path.join(TARGET, 'docs/funky-forge/scaffold.md'),
    ]);
  });
});

describe('loadCommandDoc()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('doc presente en docs/funky-ai → ok con contenido real y ruta (R-HL-1)', () => {
    fsExistsMock.mockImplementation(p => p.endsWith(path.join('funky-ai', 'scaffold.md')));
    fsReadMock.mockImplementation(() => '# Doc real\n');

    const doc = loadCommandDoc('scaffold', { targetBase: TARGET });

    expect(doc.ok).toBe(true);
    expect(doc.content).toBe('# Doc real\n');
    expect(doc.path.endsWith(path.join('funky-ai', 'scaffold.md'))).toBe(true);
  });

  it('fallback: ausente en funky-ai, presente en funky-forge → ok', () => {
    fsExistsMock.mockImplementation(p => p.endsWith(path.join('funky-forge', 'init.md')));
    fsReadMock.mockImplementation(() => '# Init\n');

    const doc = loadCommandDoc('init', { targetBase: TARGET });

    expect(doc.ok).toBe(true);
    expect(doc.path.endsWith(path.join('funky-forge', 'init.md'))).toBe(true);
  });

  it('ausente en ambos árboles → { ok: false, reason: "missing" }', () => {
    fsExistsMock.mockReturnValue(false);

    const doc = loadCommandDoc('skills', { targetBase: TARGET });

    expect(doc).toEqual({ ok: false, reason: 'missing' });
  });

  it('contenido con placeholder <ruta-del-doc> → { ok: false, reason: "placeholder" } (R-HL-2)', () => {
    fsExistsMock.mockReturnValue(true);
    fsReadMock.mockImplementation(() => '| 1 | `docs/<ruta-del-doc>.md` |');

    const doc = loadCommandDoc('scaffold', { targetBase: TARGET });

    expect(doc).toEqual({ ok: false, reason: 'placeholder' });
  });

  it('contenido vacío → { ok: false, reason: "missing" }', () => {
    fsExistsMock.mockReturnValue(true);
    fsReadMock.mockImplementation(() => '   \n  ');

    const doc = loadCommandDoc('scaffold', { targetBase: TARGET });

    expect(doc).toEqual({ ok: false, reason: 'missing' });
  });
});

describe('enrichCommandHelp()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const makeCommand = () => ({ addHelpText: vi.fn() });

  it('doc ok → addHelpText("after", "\\n" + content) y devuelve true (R-HL-1)', () => {
    fsExistsMock.mockReturnValue(true);
    fsReadMock.mockImplementation(() => '# Doc real\n');
    const command = makeCommand();

    const injected = enrichCommandHelp(command, 'scaffold', { targetBase: TARGET });

    expect(injected).toBe(true);
    expect(command.addHelpText).toHaveBeenCalledWith('after', '\n# Doc real\n');
  });

  it('doc ausente → no agrega help extra y devuelve false (R-HL-2)', () => {
    fsExistsMock.mockReturnValue(false);
    const command = makeCommand();

    const injected = enrichCommandHelp(command, 'skills', { targetBase: TARGET });

    expect(injected).toBe(false);
    expect(command.addHelpText).not.toHaveBeenCalled();
  });

  it('placeholder → no-op sin inyectar el literal (R-HL-2 edge)', () => {
    fsExistsMock.mockReturnValue(true);
    fsReadMock.mockImplementation(() => '| 1 | `docs/<ruta-del-doc>.md` |');
    const command = makeCommand();

    const injected = enrichCommandHelp(command, 'scaffold', { targetBase: TARGET });

    expect(injected).toBe(false);
    expect(command.addHelpText).not.toHaveBeenCalled();
  });
});
