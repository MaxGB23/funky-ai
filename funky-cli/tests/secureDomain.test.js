import { describe, it, expect } from 'vitest';
import {
  AGENTS_BLOCK,
  AGENTS_MARKER,
  PACKAGE_JSON_WITHOUT_PM,
  conformantConfigList,
} from './helpers/secureMock.js';
import { STANDARD_KEYS, FAIL_FAST_KEYS, seedForPosture } from '../src/utils/secureYaml.js';
import {
  ensureAgentsBlock,
  pinPackageManager,
  parseConfigList,
  isQuarantineActive,
  diagnose,
  evaluate,
  QUARANTINE_CMD,
} from '../src/utils/secureDomain.js';

describe('secureDomain — AGENTS.md conservador (R8)', () => {
  it('ausente → crea el bloque golden byte-exacto', () => {
    const out = ensureAgentsBlock(null);
    expect(out.changed).toBe(true);
    expect(out.content).toBe(AGENTS_BLOCK);

    expect(ensureAgentsBlock('').content).toBe(AGENTS_BLOCK);
  });

  it('con marcador → no-op (idempotente, sin duplicación)', () => {
    const existing = `# Mi repo\n${AGENTS_BLOCK}# Fin\n`;
    const out = ensureAgentsBlock(existing);
    expect(out.changed).toBe(false);
    expect(out.content).toBe(existing);
  });

  it('sin marcador → conserva TODO el contenido y appenda el bloque al final', () => {
    const existing = '# Mi repo sin política\n';
    const out = ensureAgentsBlock(existing);

    expect(out.changed).toBe(true);
    expect(out.content.startsWith('# Mi repo sin política\n')).toBe(true);
    expect(out.content.endsWith('Standard: run `funky secure check`.\n')).toBe(true);
    expect(out.content.split(AGENTS_MARKER)).toHaveLength(2); // exactamente una vez
  });
});

describe('secureDomain — pin packageManager (R9)', () => {
  it('campo ausente → añade pnpm@<activo> con JSON 2-space', () => {
    const out = pinPackageManager(PACKAGE_JSON_WITHOUT_PM, '11.5.0');

    expect(out.changed).toBe(true);
    expect(out.conflicted).toBe(false);
    expect(JSON.parse(out.content).packageManager).toBe('pnpm@11.5.0');
    expect(out.content).toContain('\n  "packageManager": "pnpm@11.5.0"');
    expect(out.content.trimEnd().endsWith('}')).toBe(true);
  });

  it('campo igual → no-op', () => {
    const pkg = { ...PACKAGE_JSON_WITHOUT_PM, packageManager: 'pnpm@11.5.0' };
    const out = pinPackageManager(pkg, '11.5.0');

    expect(out.changed).toBe(false);
    expect(out.conflicted).toBe(false);
    expect(JSON.parse(out.content).packageManager).toBe('pnpm@11.5.0');
  });

  it('campo distinto → se conserva (warn + keep)', () => {
    const pkg = { ...PACKAGE_JSON_WITHOUT_PM, packageManager: 'pnpm@9.0.0' };
    const out = pinPackageManager(pkg, '11.5.0');

    expect(out.changed).toBe(false);
    expect(out.conflicted).toBe(true);
    expect(JSON.parse(out.content).packageManager).toBe('pnpm@9.0.0');
  });
});

describe('secureDomain — parseo config list (R6/R11)', () => {
  it('parsea el JSON y filtra el ruido (json/registry/userAgent/packages)', () => {
    const cfg = parseConfigList(conformantConfigList());

    expect(cfg.ignoreScripts).toBe(true);
    expect(cfg.minimumReleaseAge).toBe(4320);
    expect(cfg.allowBuilds).toEqual([]);
    expect(cfg.json).toBeUndefined();
    expect(cfg.registry).toBeUndefined();
    expect(cfg.userAgent).toBeUndefined();
    expect(cfg.packages).toBeUndefined();
  });

  it('JSON inválido → null (check fail-closed)', () => {
    expect(parseConfigList('no-json{')).toBeNull();
    expect(parseConfigList('')).toBeNull();
  });
});

describe('secureDomain — cuarentena conductual (R6)', () => {
  it('activa por env var global o por YAML; inactiva si ambas ausentes', () => {
    expect(isQuarantineActive({ minimumReleaseAge: 4320 }, {})).toBe(true);
    expect(isQuarantineActive({}, { pnpm_config_minimum_release_age: '4320' })).toBe(true);
    expect(isQuarantineActive({}, {})).toBe(false);
    expect(isQuarantineActive(null, {})).toBe(false);
  });
});

describe('secureDomain — doctor diagnose (R6)', () => {
  it('reporta la versión activa y WARNING con ≥2 instalaciones distintas', () => {
    const findings = diagnose({
      activeVersion: '11.5.0',
      duplicates: ['10.23.0', '11.5.0'],
      effectiveConfig: parseConfigList(conformantConfigList()),
      quarantineActive: true,
      repoSignals: {},
    });

    expect(findings.some((f) => f.text.includes('11.5.0'))).toBe(true);
    expect(
      findings.some((f) => f.severity === 'warning' && /duplicad/i.test(f.text))
    ).toBe(true);
  });

  it('cuarentena inactiva → recomendación con el comando exacto; nada se ejecuta', () => {
    const findings = diagnose({
      activeVersion: '11.5.0',
      duplicates: [],
      effectiveConfig: {},
      quarantineActive: false,
      repoSignals: {},
    });

    const q = findings.find((f) => /cuarentena|quarantine/i.test(f.text));
    expect(q).toBeTruthy();
    expect(q.text).toContain(QUARANTINE_CMD);
  });

  it('señales de drift y placeholder pendiente se reportan como findings', () => {
    const findings = diagnose({
      activeVersion: '11.5.0',
      duplicates: [],
      effectiveConfig: {},
      quarantineActive: true,
      repoSignals: {
        packageLock: true,
        floatingRanges: true,
        envTracked: ['.env'],
        hooksSeeded: true,
        hooksDrift: ['.claude/settings.json'],
        agentsMarked: false,
        placeholder: true,
      },
    });

    expect(findings.some((f) => /package-lock/i.test(f.text))).toBe(true);
    expect(findings.some((f) => /flotante|floating/i.test(f.text))).toBe(true);
    expect(findings.some((f) => /\.env/.test(f.text))).toBe(true);
    expect(findings.some((f) => /hook/i.test(f.text))).toBe(true);
    expect(findings.some((f) => /AGENTS/i.test(f.text))).toBe(true);
    expect(findings.some((f) => /aprobaci|pending/i.test(f.text))).toBe(true);
  });
});

describe('secureDomain — evaluador check (R10/R11)', () => {
  function conformantRepo(overrides = {}) {
    return {
      hasPnpmWorkspace: true,
      hasPnpmLockfile: true,
      hasPackageLock: false,
      hasYarnLock: false,
      pkgJson: { name: 'x', version: '1.0.0', dependencies: { esbuild: '0.19.0' } },
      effectiveConfig: { ...STANDARD_KEYS },
      quarantineActive: true,
      trackedEnvFiles: [],
      envUnignored: false,
      hooksDrift: [],
      posture: 'fail-silent',
      ...overrides,
    };
  }

  it('repo pnpm conformante → sin violaciones (exit 0)', () => {
    const out = evaluate(conformantRepo());
    expect(out.violations).toEqual([]);
    expect(out.warnOnly).toBe(false);
  });

  it('pnpm-lock.yaml ausente → violation missing-lockfile', () => {
    const out = evaluate(conformantRepo({ hasPnpmLockfile: false }));
    expect(out.violations.map((v) => v.code)).toContain('missing-lockfile');
  });

  it('package-lock.json en repo pnpm → violation; repo npm/yarn → warnOnly exit 0 (R10)', () => {
    const pnpm = evaluate(conformantRepo({ hasPackageLock: true }));
    expect(pnpm.violations.map((v) => v.code)).toContain('package-lock');

    const npm = evaluate(
      conformantRepo({
        hasPnpmWorkspace: false,
        hasPnpmLockfile: false,
        hasPackageLock: true,
      })
    );
    expect(npm.violations).toEqual([]);
    expect(npm.warnOnly).toBe(true);
  });

  it('rangos ^/~ en package.json → violation floating-ranges', () => {
    const out = evaluate(
      conformantRepo({ pkgJson: { dependencies: { esbuild: '^0.19.0' } } })
    );
    expect(out.violations.map((v) => v.code)).toContain('floating-ranges');

    const ok = evaluate(
      conformantRepo({ pkgJson: { devDependencies: { vitest: '~3.0.0' } } })
    );
    expect(ok.violations.map((v) => v.code)).toContain('floating-ranges');
  });

  it('claves estándar faltantes o distintas (por postura) → violation config-mismatch', () => {
    const wrong = evaluate(conformantRepo({ effectiveConfig: { ...STANDARD_KEYS, ignoreScripts: false } }));
    expect(wrong.violations.map((v) => v.code)).toContain('config-mismatch');

    const missing = evaluate(conformantRepo({ effectiveConfig: {} }));
    expect(missing.violations.map((v) => v.code)).toContain('config-mismatch');
  });

  it('postura fail-fast exige sus claves; presente → conforma', () => {
    const noKeys = evaluate(
      conformantRepo({ posture: 'fail-fast', effectiveConfig: { ...STANDARD_KEYS } })
    );
    expect(noKeys.violations.map((v) => v.code)).toContain('config-mismatch');

    const full = evaluate(
      conformantRepo({
        posture: 'fail-fast',
        effectiveConfig: { ...STANDARD_KEYS, ...FAIL_FAST_KEYS },
      })
    );
    expect(full.violations).toEqual([]);
  });

  it('cuarentena inactiva → violation quarantine-inactive', () => {
    const out = evaluate(conformantRepo({ quarantineActive: false }));
    expect(out.violations.map((v) => v.code)).toContain('quarantine-inactive');
  });

  it('.env trackeado o presente sin entrada de .gitignore → violations (R11)', () => {
    const tracked = evaluate(conformantRepo({ trackedEnvFiles: ['.env'] }));
    expect(tracked.violations.map((v) => v.code)).toContain('env-tracked');

    const unignored = evaluate(conformantRepo({ envUnignored: true }));
    expect(unignored.violations.map((v) => v.code)).toContain('env-unignored');
  });

  it('drift de hooks → violation hook-drift', () => {
    const out = evaluate(conformantRepo({ hooksDrift: ['.claude/settings.json'] }));
    expect(out.violations.map((v) => v.code)).toContain('hook-drift');
  });

  it('placeholder allowBuilds (aprobación pendiente) → violation pending-approval', () => {
    const out = evaluate(
      conformantRepo({ effectiveConfig: { ...STANDARD_KEYS, allowBuilds: { esbuild: 'set this to true or false' } } })
    );
    expect(out.violations.map((v) => v.code)).toContain('pending-approval');
  });
});
