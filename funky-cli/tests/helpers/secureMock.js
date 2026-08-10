import path from 'path';

// Fixtures compartidos de la capability secure. Los mocks vi.hoisted
// (runner/clack) NO pueden exportarse desde un helper (vitest los hoistea al
// tope del test file): se definen inline en cada test file que los necesite,
// patrón estimateCommand.interactive.test.js.

export const CWD = process.cwd();
export const WORKSPACE_YAML_PATH = path.join(CWD, 'pnpm-workspace.yaml');
export const LOCKFILE_PATH = path.join(CWD, 'pnpm-lock.yaml');
export const PACKAGE_LOCK_PATH = path.join(CWD, 'package-lock.json');
export const PACKAGE_JSON_PATH = path.join(CWD, 'package.json');
export const AGENTS_PATH = path.join(CWD, 'AGENTS.md');
export const GITIGNORE_PATH = path.join(CWD, '.gitignore');
export const STATE_DIR_REL = path.join('.funky');
export const STATE_FILE_PATH = path.join(CWD, STATE_DIR_REL, 'secure-state.json');
export const VSCODE_TASKS_REL = path.join('.vscode', 'tasks.json');
export const CLAUDE_SETTINGS_REL = path.join('.claude', 'settings.json');

// Fixture YAML típico: packages + comentarios que el merge debe preservar (R2).
export const YAML_WITH_PACKAGES = `packages:
  - "apps/*"
  - "packages/*"

# Preferencias personales del repo
`;

// Bloque AGENTS byte-exacto (R8) — golden del diseño.
export const AGENTS_BLOCK = `<!-- funky-secure -->
## Package manager
Use \`pnpm\` for all package operations; do not use \`npm\` or \`yarn\`.
Standard: run \`funky secure check\`.
`;

export const AGENTS_MARKER = '<!-- funky-secure -->';

// package.json fixture sin packageManager (para el pin R9).
export const PACKAGE_JSON_WITHOUT_PM = {
  name: 'fixture',
  version: '1.0.0',
  dependencies: { esbuild: '^0.19.0' },
};

export const CONFORMANT_YAML = `ignoreScripts: true
minimumReleaseAge: 4320
engineStrict: true
blockExoticSubdeps: true
trustPolicy: no-downgrade
verifyStoreIntegrity: true
allowBuilds: []
`;

// Config efectiva (probe `pnpm config list --json`) de un repo conformante
// fail-silent: las 7 claves + ruido que el parser debe filtrar (R6/R11).
export function conformantConfigList() {
  return JSON.stringify({
    ignoreScripts: true,
    minimumReleaseAge: 4320,
    engineStrict: true,
    blockExoticSubdeps: true,
    trustPolicy: 'no-downgrade',
    verifyStoreIntegrity: true,
    allowBuilds: [],
    json: 'all',
    registry: 'https://registry.npmjs.org/',
    userAgent: 'pnpm/11.5.0 npm/? node/v22.13.0 win32 x64',
    packages: {},
  });
}

export const GITIGNORE_WITH_ENV = '# Funky AI\n.env\n.env.*\n';

/**
 * Fixture de repo pnpm conformante (posture fail-silent): el merge YAML, el
 * lockfile, el pin de packageManager y el baseline de hooks ya están aplicados.
 * Es la base "todo verde" para doctor/check y para los tests de init.
 */
export function secureRepoFiles(overrides = {}) {
  const mf = {
    [WORKSPACE_YAML_PATH]: CONFORMANT_YAML,
    [LOCKFILE_PATH]: '# lockfile\n',
    [PACKAGE_JSON_PATH]: JSON.stringify(
      { name: 'fixture', version: '1.0.0', dependencies: { esbuild: '0.19.0' } },
      null,
      2
    ) + '\n',
    [GITIGNORE_PATH]: GITIGNORE_WITH_ENV,
  };
  Object.assign(mf, overrides);
  return mf;
}
