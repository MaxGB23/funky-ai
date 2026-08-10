import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fsMock, applyMocks } from './helpers/fsMock.js';
import path from 'path';

vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));

import {
  hashFile,
  buildBaseline,
  compareBaseline,
  readState,
  writeState,
  stateFilePath,
  HOOK_FILES,
} from '../src/utils/secureSnapshot.js';
import { CWD, STATE_FILE_PATH } from './helpers/secureMock.js';

// sha256('hook-content') — golden verificable (R4).
const HASH_OF_HOOK_CONTENT = '94f39e3efaa3b14ab383ecb860a5463e53d821ca4df14447dafe286f311a719f';

// Rel paths del contrato (forward slashes, HOOK_FILES): el state file los usa
// tal cual (design: {".vscode/tasks.json": "sha256|absent"}).
const VSCODE_REL = '.vscode/tasks.json';
const CLAUDE_REL = '.claude/settings.json';
const VSCODE_ABS = path.join(CWD, VSCODE_REL);
const CLAUDE_ABS = path.join(CWD, CLAUDE_REL);

/**
 * Aplica mocks con algunos paths "ausentes": readFileSync lanza ENOENT para
 * ellos (el fsMock base devuelve '' sin lanzar, lo que impediría probar la
 * rama "absent" de hashFile).
 */
function withMissing(mf, missingPaths) {
  applyMocks(mf);
  const read = vi.mocked(fsMock.readFileSync);
  const base = read.getMockImplementation();
  read.mockImplementation((p, enc) => {
    if (missingPaths.includes(String(p))) {
      const err = new Error(`ENOENT: no such file "${p}"`);
      err.code = 'ENOENT';
      throw err;
    }
    return base(p, enc);
  });
}

describe('secureSnapshot — baseline de hooks (R4/R5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hashFile devuelve sha256 hex de 64 chars del contenido real', () => {
    applyMocks({ [VSCODE_ABS]: 'hook-content' });

    const hash = hashFile(VSCODE_ABS);

    expect(hash).toBe(HASH_OF_HOOK_CONTENT);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('hashFile devuelve "absent" para un archivo que no existe (o ilegible)', () => {
    withMissing({}, [CLAUDE_ABS]);

    expect(hashFile(CLAUDE_ABS)).toBe('absent');
  });

  it('buildBaseline registra sha256 por archivo y "absent" para los ausentes', () => {
    withMissing({ [VSCODE_ABS]: 'hook-content' }, [CLAUDE_ABS]);

    const state = buildBaseline(HOOK_FILES, CWD);

    expect(state).toEqual({
      version: 1,
      baseline: {
        [VSCODE_REL]: HASH_OF_HOOK_CONTENT,
        [CLAUDE_REL]: 'absent',
      },
    });
  });

  it('compareBaseline sin drift devuelve []', () => {
    applyMocks({ [VSCODE_ABS]: 'hook-content', [CLAUDE_ABS]: 'absent-marker' });
    const state = buildBaseline(HOOK_FILES, CWD);

    const drift = compareBaseline(state, CWD);

    expect(drift).toEqual([]);
  });

  it('archivo creado DESPUÉS del seed (baseline "absent") → drift (R5)', () => {
    // Seed: ambos ausentes.
    withMissing({}, [VSCODE_ABS, CLAUDE_ABS]);
    const state = buildBaseline(HOOK_FILES, CWD);
    expect(state.baseline[CLAUDE_REL]).toBe('absent');

    // Luego aparece .claude/settings.json.
    applyMocks({ [CLAUDE_ABS]: 'tokens' });

    const drift = compareBaseline(state, CWD);

    expect(drift).toContain(CLAUDE_REL);
  });

  it('contenido cambiado → drift; contenido igual → sin drift', () => {
    const mf = { [VSCODE_ABS]: 'original' };
    applyMocks(mf);
    const state = buildBaseline(HOOK_FILES, CWD);

    mf[VSCODE_ABS] = 'modificado';
    applyMocks(mf);
    expect(compareBaseline(state, CWD)).toContain(VSCODE_REL);

    mf[VSCODE_ABS] = 'original';
    applyMocks(mf);
    expect(compareBaseline(state, CWD)).toEqual([]);
  });

  it('rebaseline explícito: baseline re-seeded tras un cambio legítimo → sin drift (R5)', () => {
    const mf = { [VSCODE_ABS]: 'primera-version' };
    applyMocks(mf);
    const seeded = buildBaseline(HOOK_FILES, CWD);

    mf[VSCODE_ABS] = 'edicion-legitima';
    applyMocks(mf);
    expect(compareBaseline(seeded, CWD)).toContain(VSCODE_REL);

    // check --rebaseline reconstruye el baseline y vuelve a validar.
    const reseeded = buildBaseline(HOOK_FILES, CWD);
    expect(compareBaseline(reseeded, CWD)).toEqual([]);
  });

  it('writeState escribe JSON version 1 en .funky/secure-state.json creando el directorio', () => {
    applyMocks({});

    writeState({ version: 1, baseline: {} }, STATE_FILE_PATH);

    const call = vi.mocked(fsMock.writeFileSync).mock.calls.find(
      (c) => String(c[0]) === STATE_FILE_PATH
    );
    expect(call).toBeTruthy();
    expect(JSON.parse(String(call[1])).version).toBe(1);
    expect(vi.mocked(fsMock.mkdirSync)).toHaveBeenCalledWith(
      path.join(CWD, '.funky'),
      { recursive: true }
    );
  });

  it('readState: archivo ausente o JSON inválido → null; válido → objeto', () => {
    withMissing({}, [STATE_FILE_PATH]);
    expect(readState(STATE_FILE_PATH)).toBeNull();

    applyMocks({ [STATE_FILE_PATH]: 'no-json{' });
    expect(readState(STATE_FILE_PATH)).toBeNull();

    const good = JSON.stringify({ version: 1, baseline: {} });
    applyMocks({ [STATE_FILE_PATH]: good });
    expect(readState(STATE_FILE_PATH)).toEqual({ version: 1, baseline: {} });
  });

  it('stateFilePath resuelve a <cwd>/.funky/secure-state.json', () => {
    expect(stateFilePath(CWD)).toBe(STATE_FILE_PATH);
  });
});
