import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock del runner de probes (vi.hoisted inline: no exportable desde helper).
const runnerMock = vi.hoisted(() => vi.fn(() => ({ code: 0, stdout: '', stderr: '' })));
vi.mock('../src/utils/runner.js', () => ({
  run: (...args) => runnerMock(...args),
}));

vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks } from './helpers/fsMock.js';
import fs from 'fs';
import path from 'path';
import {
  CWD,
  WORKSPACE_YAML_PATH,
  LOCKFILE_PATH,
  PACKAGE_LOCK_PATH,
  PACKAGE_JSON_PATH,
  AGENTS_PATH,
  GITIGNORE_PATH,
  STATE_FILE_PATH,
  AGENTS_BLOCK,
  CONFORMANT_YAML,
  conformantConfigList,
  secureRepoFiles,
} from './helpers/secureMock.js';
import { secureCommand } from '../src/commands/secure.js';

// sha256('hook-content') — golden del baseline (R4).
const HASH_OF_HOOK_CONTENT = '94f39e3efaa3b14ab383ecb860a5463e53d821ca4df14447dafe286f311a719f';

/**
 * Ruta las respuestas del runnerMock por probe (R1: argv constante).
 */
function routeRunner({
  pnpmVersion = '11.5.0',
  configList = conformantConfigList(),
  gitFiles = [],
  gitCode = 0,
  wherePaths = [],
} = {}) {
  runnerMock.mockImplementation((probe, args = []) => {
    const argv = args.join(' ');
    if (probe === 'pnpm' && argv === '--version') {
      return { code: 0, stdout: `${pnpmVersion}\n`, stderr: '' };
    }
    if (probe === 'pnpm' && argv === 'config list --json') {
      return { code: 0, stdout: configList, stderr: '' };
    }
    if (probe === 'git' && args[0] === 'ls-files') {
      return { code: gitCode, stdout: gitFiles.join('\n'), stderr: '' };
    }
    if (probe === 'where') {
      return { code: 0, stdout: wherePaths.join('\n'), stderr: '' };
    }
    return { code: 0, stdout: '', stderr: '' };
  });
}

/** Aplica las escrituras reales de un run al mock FS (idempotencia). */
function applyWrites(mf) {
  for (const call of vi.mocked(fs.writeFileSync).mock.calls) {
    mf[String(call[0])] = String(call[1]);
  }
}

describe('secureCommand — integración (R2-R11)', () => {
  let exitSpy;
  let logSpy;
  let warnSpy;
  let errSpy;
  const originalIsTTY = process.stdin.isTTY;

  beforeEach(() => {
    vi.clearAllMocks();
    runnerMock.mockReset();
    routeRunner();
    exitSpy = vi.spyOn(process, 'exit').mockImplementation((c) => c);
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    process.stdin.isTTY = undefined; // no-TTY por defecto en integración
  });

  afterEach(() => {
    process.stdin.isTTY = originalIsTTY;
    exitSpy.mockRestore();
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('R10: check en repo pnpm conformante → exit 0', async () => {
    applyMocks(secureRepoFiles());
    routeRunner({ configList: conformantConfigList() });

    await secureCommand.parseAsync(['check'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('R11: .env trackeado por git → exit 1 listando la violación', async () => {
    applyMocks(secureRepoFiles());
    routeRunner({ gitFiles: ['.env', '.env.local'] });

    await secureCommand.parseAsync(['check'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('env-tracked'));
  });

  it('R10: repo npm (package-lock, sin workspace) → WARN y exit 0, no bloquea', async () => {
    applyMocks({ [PACKAGE_LOCK_PATH]: '{}\n' });

    await secureCommand.parseAsync(['check'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/npm|yarn/i));
  });

  it('R10: probe pnpm no disponible (fail-closed) → exit 1 con mensaje claro', async () => {
    applyMocks(secureRepoFiles());
    runnerMock.mockImplementation((probe, args = []) => {
      if (probe === 'pnpm' && args.join(' ') === 'config list --json') {
        return { code: 1, stdout: '', stderr: 'command not found: pnpm' };
      }
      return { code: 0, stdout: '', stderr: '' };
    });

    await secureCommand.parseAsync(['check'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('pnpm'));
  });

  it('R5: drift de hooks → exit 1; check --rebaseline re-seedea y pasa', async () => {
    const mf = secureRepoFiles();
    // Claves ABSOLUTAS: hashFile lee path.join(cwd, rel) (R4).
    mf[path.join(CWD, '.vscode', 'tasks.json')] = 'hook-content';
    mf[path.join(CWD, '.claude', 'settings.json')] = 'settings-content';
    applyMocks(mf);

    // Primer check --rebaseline: seedea el baseline y pasa.
    await secureCommand.parseAsync(['check', '--rebaseline'], { from: 'user' });
    expect(exitSpy).toHaveBeenCalledWith(0);

    // Baseline guardado con el hash real del hook.
    const stateWrite = vi.mocked(fs.writeFileSync).mock.calls.find(
      (c) => String(c[0]) === STATE_FILE_PATH
    );
    expect(stateWrite).toBeTruthy();
    expect(JSON.parse(String(stateWrite[1])).baseline['.vscode/tasks.json']).toBe(
      HASH_OF_HOOK_CONTENT
    );
    applyWrites(mf);

    // Hook manipulado → drift → exit 1.
    mf[path.join(CWD, '.vscode', 'tasks.json')] = 'tampered';
    applyMocks(mf);
    await secureCommand.parseAsync(['check'], { from: 'user' });
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('hook-drift'));

    // Rebaseline explícito tras el cambio legítimo → pasa.
    exitSpy.mockClear();
    await secureCommand.parseAsync(['check', '--rebaseline'], { from: 'user' });
    expect(exitSpy).toHaveBeenCalledWith(0);
  });

  it('R7: init no-TTY sin --posture → exit 1 con mensaje claro y NINGUNA escritura', async () => {
    applyMocks(secureRepoFiles());

    await secureCommand.parseAsync(['init'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('--posture'));
    expect(vi.mocked(fs.writeFileSync)).not.toHaveBeenCalled();
  });

  it('R7: init --posture inválido → exit 1 listando posturas válidas, sin escrituras', async () => {
    applyMocks(secureRepoFiles());

    await secureCommand.parseAsync(['init', '--posture', 'paranoico'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errSpy).toHaveBeenCalledWith(expect.stringMatching(/fail-silent|fail-fast/));
    expect(vi.mocked(fs.writeFileSync)).not.toHaveBeenCalled();
  });

  it('R2/R9: init no-TTY fail-silent idempotente — 2 runs con estado de repo idéntico', async () => {
    const mf = secureRepoFiles();
    applyMocks(mf);

    await secureCommand.parseAsync(['init', '--posture', 'fail-silent'], { from: 'user' });
    expect(exitSpy).toHaveBeenCalledWith(0);

    const run1 = vi.mocked(fs.writeFileSync).mock.calls;
    const run1Count = run1.length; // snapshot: el array vive (run2 appendea)
    const ws1 = run1.find((c) => String(c[0]) === WORKSPACE_YAML_PATH);
    const wsWrite = String(ws1[1]);
    expect(wsWrite).toContain('ignoreScripts: true');
    // AGENTS.md ausente → creado desde template (R8).
    expect(run1.find((c) => String(c[0]) === AGENTS_PATH)).toBeTruthy();
    // State con posture + baseline (extensión de diseño: check la necesita).
    const stateWrite = JSON.parse(String(run1.find((c) => String(c[0]) === STATE_FILE_PATH)[1]));
    expect(stateWrite.posture).toBe('fail-silent');
    expect(stateWrite.baseline['.vscode/tasks.json']).toMatch(/^[0-9a-f]{64}$/);

    applyWrites(mf);
    // .gitignore ganó la entrada .funky/ (append idempotente, R5).
    expect(mf[GITIGNORE_PATH]).toContain('.funky/');
    const appendsBefore = vi.mocked(fs.appendFileSync).mock.calls.length;

    await secureCommand.parseAsync(['init', '--posture', 'fail-silent'], { from: 'user' });
    expect(exitSpy).toHaveBeenCalledWith(0);

    // Solo las escrituras NUEVAS del segundo run (los calls se acumulan).
    const run2 = vi.mocked(fs.writeFileSync).mock.calls.slice(run1Count);
    // Workspace byte-idéntico (segunda corrida no cambia nada).
    expect(String(run2.find((c) => String(c[0]) === WORKSPACE_YAML_PATH)[1])).toBe(wsWrite);
    // Sin re-escritura de package.json (pin ya igual) ni de AGENTS (marcador).
    expect(run2.filter((c) => String(c[0]) === PACKAGE_JSON_PATH)).toHaveLength(0);
    expect(run2.filter((c) => String(c[0]) === AGENTS_PATH)).toHaveLength(0);
    // .gitignore NO se vuelve a appendear.
    expect(vi.mocked(fs.appendFileSync).mock.calls.length).toBe(appendsBefore);
  });

  it('R3: init fail-fast seedea sus claves y emite el warning RFC', async () => {
    applyMocks({});

    await secureCommand.parseAsync(['init', '--posture', 'fail-fast'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    const wsWrite = String(
      vi.mocked(fs.writeFileSync).mock.calls.find((c) => String(c[0]) === WORKSPACE_YAML_PATH)[1]
    );
    expect(wsWrite).toContain('strictDepBuilds: true');
    expect(wsWrite).toContain('onlyBuiltDependencies: []');
    expect(wsWrite).toContain('ignoredBuiltDependencies: []');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/RFC/i));
  });

  it('R6: doctor diagnostica sin escribir nada y sale 0 (con WARNING de duplicados)', async () => {
    applyMocks(secureRepoFiles());
    routeRunner({
      wherePaths: ['C:\\tools\\pnpm\\pnpm.CMD', 'M:\\pnpm-standalone\\pnpm.exe'],
    });

    await secureCommand.parseAsync(['doctor'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(vi.mocked(fs.writeFileSync)).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('11.5.0'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringMatching(/duplicad/i));
  });

  it('R6: doctor con cuarentena inactiva reporta el comando exacto (nada se ejecuta)', async () => {
    applyMocks(secureRepoFiles());
    routeRunner({ configList: JSON.stringify({ json: 'all', packages: {} }) });

    await secureCommand.parseAsync(['doctor'], { from: 'user' });

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('pnpm config set minimum-release-age 4320 --location=global')
    );
  });

  it('smoke E2E: el probe real de pnpm devuelve la versión (omitido si pnpm no está)', async () => {
    const real = await vi.importActual('../src/utils/runner.js');
    const res = real.run('pnpm', ['--version']);
    if (res.code !== 0) {
      console.warn('smoke omitido: pnpm no disponible en PATH');
      return;
    }
    expect(res.stdout.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
