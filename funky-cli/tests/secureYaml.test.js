import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fsMock, applyMocks } from './helpers/fsMock.js';

vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));

import { mergeSeed, seedForPosture, PLACEHOLDER, STANDARD_KEYS } from '../src/utils/secureYaml.js';
import { WORKSPACE_YAML_PATH, YAML_WITH_PACKAGES } from './helpers/secureMock.js';

const TARGET = WORKSPACE_YAML_PATH;

// Golden byte-exacto del seed estándar (R3): las 7 claves, sin `packages:`
// sintetizado (R2) — deny-by-default con allowBuilds: [].
const SEED_GOLDEN = `ignoreScripts: true
minimumReleaseAge: 4320
engineStrict: true
blockExoticSubdeps: true
trustPolicy: no-downgrade
verifyStoreIntegrity: true
allowBuilds: []
`;

describe('secureYaml — merge idempotente (R2/R3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('archivo ausente → seed con las 7 claves estándar, sin packages: sintetizado', () => {
    applyMocks({});

    const res = mergeSeed(TARGET, 'fail-silent');

    expect(res.existed).toBe(false);
    expect(res.content).toBe(SEED_GOLDEN);
    expect(res.content).not.toContain('packages:');
    expect(res.added).toEqual(Object.keys(STANDARD_KEYS));
    expect(res.kept).toEqual([]);
    expect(res.conflicted).toEqual([]);
  });

  it('merge preserva packages:, comentarios y claves desconocidas; 2da corrida no cambia nada (idempotencia)', () => {
    const mf = { [TARGET]: YAML_WITH_PACKAGES };
    applyMocks(mf);

    const first = mergeSeed(TARGET, 'fail-silent');
    expect(first.content).toContain('packages:');
    expect(first.content).toContain('"apps/*"');
    expect(first.content).toContain('# Preferencias personales del repo');
    expect(first.content).toContain('minimumReleaseAge: 4320');

    // Simula la escritura del caller (init escribe el contenido mergeado):
    // la segunda corrida lee el archivo YA actualizado.
    mf[TARGET] = first.content;
    applyMocks(mf);

    // Segunda corrida sobre el resultado: todo kept, contenido byte-idéntico.
    const second = mergeSeed(TARGET, 'fail-silent');
    expect(second.added).toEqual([]);
    expect(second.kept.sort()).toEqual(Object.keys(STANDARD_KEYS).sort());
    expect(second.content).toBe(first.content);
  });

  it('valor existente distinto → se conserva, se lista como conflicto (warn + keep)', () => {
    const mf = { [TARGET]: `minimumReleaseAge: 1440\npackages:\n  - "apps/*"\n` };
    applyMocks(mf);

    const res = mergeSeed(TARGET, 'fail-silent');

    expect(res.conflicted).toContain('minimumReleaseAge');
    expect(res.content).toContain('minimumReleaseAge: 1440');
    expect(res.content).not.toContain('minimumReleaseAge: 4320');
  });

  it('valor existente igual → no-op (kept), sin conflicto', () => {
    const mf = { [TARGET]: `verifyStoreIntegrity: true\npackages:\n  - "apps/*"\n` };
    applyMocks(mf);

    const res = mergeSeed(TARGET, 'fail-silent');

    expect(res.kept).toContain('verifyStoreIntegrity');
    expect(res.conflicted).not.toContain('verifyStoreIntegrity');
  });

  it('YAML existente inválido → lanza (el comando aborta con exit 1, R2)', () => {
    const mf = { [TARGET]: 'packages:\n  - [unclosed\n' };
    applyMocks(mf);

    expect(() => mergeSeed(TARGET, 'fail-silent')).toThrow();
  });

  it('placeholder allowBuilds de pnpm (pendiente de aprobación) → tolerado como pending, sin crash', () => {
    const mf = {
      [TARGET]: `allowBuilds:\n  esbuild: "${PLACEHOLDER}"\npackages:\n  - "apps/*"\n`,
    };
    applyMocks(mf);

    const res = mergeSeed(TARGET, 'fail-silent');

    expect(res.pending).toContain('allowBuilds');
    expect(res.conflicted).not.toContain('allowBuilds');
    // El placeholder se conserva: es estado pendiente de aprobación del usuario.
    expect(res.content).toContain(PLACEHOLDER);
  });

  it('postura fail-fast añade las 3 claves de builds estrictos al seed estándar', () => {
    applyMocks({});

    const res = mergeSeed(TARGET, 'fail-fast');

    expect(res.content).toContain('strictDepBuilds: true');
    expect(res.content).toContain('onlyBuiltDependencies: []');
    expect(res.content).toContain('ignoredBuiltDependencies: []');
    expect(res.content).toContain('allowBuilds: []');
    expect(res.added).toEqual(Object.keys(seedForPosture('fail-fast')));
  });

  it('postura desconocida → lanza (validación de posturas de R7)', () => {
    expect(() => seedForPosture('fail-fast-sometimes')).toThrow();
  });
});
