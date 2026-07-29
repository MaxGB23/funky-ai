import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

import { runInit, collectDirFiles } from '../src/commands/init.js';

describe('collectDirFiles()', () => {
  it('devuelve array vacío si el directorio no existe', () => {
    const files = collectDirFiles('/ruta/que/no/existe');
    expect(files).toEqual([]);
  });

  it('escanea archivos recursivamente desde un directorio real', () => {
    // Usamos el directorio real de funky-ai-rules para un test de integración
    const testDir = path.resolve(__dirname, '../src/templates/bootstrap/funky-ai-rules');
    const files = collectDirFiles(testDir);

    expect(files.length).toBeGreaterThan(0);

    // Debe incluir archivos de subdirectorios
    const tier2Files = files.filter(f => f.relativePath.startsWith('tier2-delegation/'));
    expect(tier2Files.length).toBe(6);

    const tier3Files = files.filter(f => f.relativePath.startsWith('tier3-interactive/'));
    expect(tier3Files.length).toBe(9);

    // Debe incluir archivos raíz
    const rootFiles = files.filter(f => !f.relativePath.includes('/'));
    expect(rootFiles.length).toBeGreaterThanOrEqual(8);

    // Cada entry debe tener relativePath y fullPath absoluto
    for (const file of files) {
      expect(file.relativePath).toBeTruthy();
      expect(file.fullPath).toBe(path.resolve(testDir, file.relativePath));
    }
  });
});

describe('runInit()', () => {
  const fakeTemplatesDir = '/fake/templates';
  const fakeTargetDir = '/fake/project';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('crea el plan base: 3 root files + 7 engram dirs + docs-live-index', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    const mkdirIntentions = intentions.filter(i => i.action === 'mkdir');
    const copyIntentions = intentions.filter(i => i.action === 'copy');
    const createIntentions = intentions.filter(i => i.action === 'create');

    expect(mkdirIntentions).toHaveLength(7);
    expect(copyIntentions).toHaveLength(3);
    expect(createIntentions).toHaveLength(1);
  });

  it('incluye los 3 root files con rutas correctas', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'ORCHESTRATOR-STATE.md'),
      dest: path.join(fakeTargetDir, 'ORCHESTRATOR-STATE.md'),
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'README.md'),
      dest: path.join(fakeTargetDir, 'README.md'),
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'TEMPLATE_GUIDE.md'),
      dest: path.join(fakeTargetDir, 'TEMPLATE_GUIDE.md'),
    });
  });

  it('copia rulesFiles a .agents/rules/ preservando relativePath', () => {
    const rulesFiles = [
      { relativePath: 'engram-protocol.md', fullPath: '/real/rules/engram-protocol.md' },
      { relativePath: 'tier2-delegation/t2-explore.md', fullPath: '/real/rules/tier2-delegation/t2-explore.md' },
    ];
    const intentions = runInit({
      templatesDir: fakeTemplatesDir,
      targetBase: fakeTargetDir,
      rulesFiles,
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: '/real/rules/engram-protocol.md',
      dest: path.join(fakeTargetDir, '.agents', 'rules', 'engram-protocol.md'),
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: '/real/rules/tier2-delegation/t2-explore.md',
      dest: path.join(fakeTargetDir, '.agents', 'rules', 'tier2-delegation', 't2-explore.md'),
    });
  });

  it('copia sddFiles a .agents/templates/sdd/ (excepto rfc)', () => {
    const sddFiles = [
      { relativePath: 'explore.md', fullPath: '/real/sdd/explore.md' },
      { relativePath: 'release-notes.md', fullPath: '/real/sdd/release-notes.md' },
    ];
    const intentions = runInit({
      templatesDir: fakeTemplatesDir,
      targetBase: fakeTargetDir,
      sddFiles,
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: '/real/sdd/explore.md',
      dest: path.join(fakeTargetDir, '.agents', 'templates', 'sdd', 'explore.md'),
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: '/real/sdd/release-notes.md',
      dest: path.join(fakeTargetDir, '.agents', 'templates', 'sdd', 'release-notes.md'),
    });
  });

  it('inyecta 000-rfc-template.md a openspec/rfcs/ como excepción', () => {
    const sddFiles = [
      { relativePath: '000-rfc-template.md', fullPath: '/real/sdd/000-rfc-template.md' },
    ];
    const intentions = runInit({
      templatesDir: fakeTemplatesDir,
      targetBase: fakeTargetDir,
      sddFiles,
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: '/real/sdd/000-rfc-template.md',
      dest: path.join(fakeTargetDir, 'openspec', 'rfcs', '000-rfc-template.md'),
    });
  });

  it('genera docs-live-index.md en .agents/templates/sdd/ con el header correcto', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'create',
      dest: path.join(fakeTargetDir, '.agents', 'templates', 'sdd', 'docs-live-index.md'),
      content: expect.stringContaining('Índice de Docs Vivos'),
    });
  });

  it('incluye intenciones create para PROJECT-CANVAS e INFRA-CANVAS si se provee canvasConfig', () => {
    const config = { projectData: { pattern: 'Test Pattern' }, infraData: { db: 'Test DB' } };
    const intentions = runInit({
      templatesDir: fakeTemplatesDir,
      targetBase: fakeTargetDir,
      canvasConfig: config,
    });

    const createIntentions = intentions.filter(i => i.action === 'create' && i.dest.includes('CANVAS'));
    expect(createIntentions).toHaveLength(2);

    expect(createIntentions[0].dest).toContain('PROJECT-CANVAS.md');
    expect(createIntentions[0].content).toContain('Test Pattern');

    expect(createIntentions[1].dest).toContain('INFRA-CANVAS.md');
  });

  it('NO incluye intenciones create si canvasConfig tiene los skips en true', () => {
    const config = { skipProjectCanvas: true, skipInfraCanvas: true };
    const intentions = runInit({
      templatesDir: fakeTemplatesDir,
      targetBase: fakeTargetDir,
      canvasConfig: config,
    });

    const createIntentions = intentions.filter(i => i.action === 'create' && i.dest.includes('CANVAS'));
    expect(createIntentions).toHaveLength(0);
  });
});
