import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mocks vi.hoisted inline (no exportables desde helper): runner + clack.
const runnerMock = vi.hoisted(() => vi.fn(() => ({ code: 0, stdout: '', stderr: '' })));
vi.mock('../src/utils/runner.js', () => ({
  run: (...args) => runnerMock(...args),
}));

const clackMock = vi.hoisted(() => ({
  select: vi.fn(),
  confirm: vi.fn(),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
}));
vi.mock('@clack/prompts', () => clackMock);

vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks } from './helpers/fsMock.js';
import fs from 'fs';
import {
  WORKSPACE_YAML_PATH,
  AGENTS_PATH,
  AGENTS_BLOCK,
  AGENTS_MARKER,
  secureRepoFiles,
} from './helpers/secureMock.js';
import { secureCommand } from '../src/commands/secure.js';

describe('secureCommand — interactivo (R7/R8)', () => {
  let exitSpy;
  let logSpy;
  let warnSpy;
  const originalIsTTY = process.stdin.isTTY;

  beforeEach(() => {
    vi.clearAllMocks();
    runnerMock.mockReset();
    runnerMock.mockImplementation((probe, args = []) => {
      if (probe === 'pnpm' && args.join(' ') === '--version') {
        return { code: 0, stdout: '11.5.0\n', stderr: '' };
      }
      return { code: 0, stdout: '', stderr: '' };
    });
    clackMock.isCancel.mockReturnValue(false);
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    process.stdin.isTTY = true;
  });

  afterEach(() => {
    process.stdin.isTTY = originalIsTTY;
    exitSpy.mockRestore();
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('R7: TTY → pide la postura con p.select SIN default; fail-silent → init exit 0', async () => {
    clackMock.select.mockResolvedValue('fail-silent');
    applyMocks(secureRepoFiles());

    await secureCommand.parseAsync(['init'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(clackMock.select).toHaveBeenCalledTimes(1);
    const selectArgs = clackMock.select.mock.calls[0][0];
    expect(selectArgs.options.map((o) => o.value)).toEqual(['fail-silent', 'fail-fast']);
    // "NO default": sin initialValue (R7).
    expect(selectArgs.initialValue).toBeUndefined();
    const wsWrite = vi.mocked(fs.writeFileSync).mock.calls.find(
      (c) => String(c[0]) === WORKSPACE_YAML_PATH
    );
    expect(wsWrite).toBeTruthy();
  });

  it('R7: cancelar el select → exit 1, NINGUNA escritura', async () => {
    clackMock.select.mockResolvedValue(undefined);
    clackMock.isCancel.mockReturnValue(true);
    applyMocks(secureRepoFiles());

    await secureCommand.parseAsync(['init'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(clackMock.cancel).toHaveBeenCalled();
    expect(vi.mocked(fs.writeFileSync)).not.toHaveBeenCalled();
  });

  it('R8: AGENTS existente SIN marcador → p.confirm (initialValue true); "no" → sin append, exit 0', async () => {
    clackMock.select.mockResolvedValue('fail-silent');
    clackMock.confirm.mockResolvedValue(false);
    const mf = secureRepoFiles();
    mf[AGENTS_PATH] = '# Mi AGENTS actual\n';
    applyMocks(mf);

    await secureCommand.parseAsync(['init'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(clackMock.confirm).toHaveBeenCalledWith(
      expect.objectContaining({ initialValue: true })
    );
    // "no" → el AGENTS original queda intacto.
    const agentsWrite = vi.mocked(fs.writeFileSync).mock.calls.find(
      (c) => String(c[0]) === AGENTS_PATH
    );
    expect(agentsWrite).toBeFalsy();
    expect(mf[AGENTS_PATH]).toBe('# Mi AGENTS actual\n');
  });

  it('R8: "sí" → appenda el bloque conservando TODO el contenido, marcador único', async () => {
    clackMock.select.mockResolvedValue('fail-silent');
    clackMock.confirm.mockResolvedValue(true);
    const mf = secureRepoFiles();
    mf[AGENTS_PATH] = '# Mi AGENTS actual\n';
    applyMocks(mf);

    await secureCommand.parseAsync(['init'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const agentsWrite = vi.mocked(fs.writeFileSync).mock.calls.find(
      (c) => String(c[0]) === AGENTS_PATH
    );
    expect(agentsWrite).toBeTruthy();
    const content = String(agentsWrite[1]);
    expect(content.startsWith('# Mi AGENTS actual\n')).toBe(true);
    expect(content).toContain(AGENTS_BLOCK);
    expect(content.split(AGENTS_MARKER)).toHaveLength(2);
  });

  it('R8: no-TTY con AGENTS sin marcador → procede con warning, sin preguntar', async () => {
    process.stdin.isTTY = undefined;
    const mf = secureRepoFiles();
    mf[AGENTS_PATH] = '# Mi AGENTS actual\n';
    applyMocks(mf);

    await secureCommand.parseAsync(['init', '--posture', 'fail-silent'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(clackMock.confirm).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/AGENTS/i));
    const agentsWrite = vi.mocked(fs.writeFileSync).mock.calls.find(
      (c) => String(c[0]) === AGENTS_PATH
    );
    expect(agentsWrite).toBeTruthy();
  });
});
