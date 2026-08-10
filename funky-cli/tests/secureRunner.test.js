import { describe, it, expect, vi, beforeEach } from 'vitest';

// R1: el runner ejecuta probes internos vía spawnSync. Se mockea child_process
// para espiar argv (constantes internas) y el comportamiento win32/.CMD.
const spawnSyncMock = vi.hoisted(() => vi.fn());

vi.mock('child_process', () => ({ spawnSync: spawnSyncMock }));

import { run, PROBES } from '../src/utils/runner.js';

describe('runner — probes internos (R1)', () => {
  beforeEach(() => {
    spawnSyncMock.mockReset();
  });

  it('ejecuta un probe con spawnSync y devuelve code/stdout/stderr', () => {
    spawnSyncMock.mockReturnValue({ status: 0, stdout: '11.5.0\n', stderr: '' });

    const res = run('pnpm', ['--version']);

    expect(spawnSyncMock).toHaveBeenCalledWith('pnpm', ['--version'], expect.any(Object));
    expect(res).toEqual({ code: 0, stdout: '11.5.0\n', stderr: '' });
  });

  it('en win32 pasa shell: true para los shims .CMD; en POSIX shell: false', () => {
    spawnSyncMock.mockReturnValue({ status: 0, stdout: '', stderr: '' });

    run('git', ['ls-files', '.env*']);

    const opts = spawnSyncMock.mock.calls[0][2];
    if (process.platform === 'win32') {
      expect(opts.shell).toBe(true);
    } else {
      expect(opts.shell).toBe(false);
    }
  });

  it('un probe que sale != 0 devuelve code/stdout/stderr sin crashear', () => {
    spawnSyncMock.mockReturnValue({ status: 1, stdout: 'err out', stderr: 'boom' });

    const res = run('git', ['ls-files', '.env*']);

    expect(res.code).toBe(1);
    expect(res.stdout).toBe('err out');
    expect(res.stderr).toBe('boom');
  });

  it('un spawn fallido (ENOENT) devuelve code 1 con mensaje en stderr, sin throw', () => {
    spawnSyncMock.mockReturnValue({ error: new Error('spawn pnpm ENOENT'), status: null });

    const res = run('pnpm', ['--version']);

    expect(res.code).toBe(1);
    expect(res.stdout).toBe('');
    expect(res.stderr).toContain('ENOENT');
  });

  it('un nombre de probe desconocido lanza (nombres internos: input de usuario nunca llega al shell)', () => {
    expect(() => run('rm -rf /', [])).toThrow(/rm -rf \//);
  });

  it('PROBES expone las constantes internas pnpm/git/npm', () => {
    expect(PROBES.pnpm).toBe('pnpm');
    expect(PROBES.git).toBe('git');
    expect(PROBES.npm).toBe('npm');
  });
});
