import { spawnSync } from 'child_process';

// R1: nombres de probe internos — el input del usuario NUNCA llega al shell.
// `where`/`which` localizan TODAS las instalaciones de pnpm en PATH (R6
// duplicados); en win32 el comando es where.exe.
export const PROBES = {
  pnpm: 'pnpm',
  git: 'git',
  npm: 'npm',
  where: process.platform === 'win32' ? 'where.exe' : 'which',
};

/**
 * Ejecuta un probe interno de forma síncrona y devuelve {code, stdout, stderr}
 * sin crashear ante fallos (R1). En win32 los shims `.CMD` exigen shell: true;
 * en POSIX shell: false (el shell no interpreta nada).
 *
 * @param {string} probeName - Clave de PROBES (constante interna).
 * @param {string[]} [args] - Argumentos constantes del probe.
 * @param {object} [opts] - Overrides de spawnSync (seam de mock para tests).
 * @returns {{ code: number, stdout: string, stderr: string }}
 */
export function run(probeName, args = [], opts = {}) {
  const command = PROBES[probeName];
  if (!command) {
    throw new Error(`Probe desconocido: "${probeName}". Usa una constante de PROBES (R1).`);
  }
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    ...opts,
  });
  if (result.error) {
    // Probe no ejecutable (ENOENT, etc.): se reporta como finding, nunca crash.
    return { code: 1, stdout: '', stderr: result.error.message };
  }
  return {
    code: result.status ?? 0,
    stdout: String(result.stdout ?? ''),
    stderr: String(result.stderr ?? ''),
  };
}
