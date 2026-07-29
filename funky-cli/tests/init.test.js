import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

import { runInit } from '../src/commands/init.js';

describe('runInit()', () => {
  const fakeTemplatesDir = '/fake/templates';
  const fakeTargetDir = '/fake/project';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('crea el plan completo: 37 copy + 1 create + 8 mkdir', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    const mkdirIntentions = intentions.filter(i => i.action === 'mkdir');
    const copyIntentions = intentions.filter(i => i.action === 'copy');
    const createIntentions = intentions.filter(i => i.action === 'create');

    expect(mkdirIntentions).toHaveLength(8);
    expect(copyIntentions).toHaveLength(37);
    expect(createIntentions).toHaveLength(1);
  });

  it('incluye los 5 root files con rutas correctas', () => {
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

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'PROJECT-CANVAS.md'),
      dest: path.join(fakeTargetDir, 'PROJECT-CANVAS.md'),
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'INFRA-CANVAS.md'),
      dest: path.join(fakeTargetDir, 'INFRA-CANVAS.md'),
    });
  });

  it('copia funky-ai-rules/ a .agents/rules/ con rutas correctas', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'funky-ai-rules/engram-protocol.md'),
      dest: path.join(fakeTargetDir, '.agents', 'rules', 'engram-protocol.md'),
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'funky-ai-rules/tier2-delegation/t2-explore.md'),
      dest: path.join(fakeTargetDir, '.agents', 'rules', 'tier2-delegation', 't2-explore.md'),
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'funky-ai-rules/tier3-interactive/risk-decision.md'),
      dest: path.join(fakeTargetDir, '.agents', 'rules', 'tier3-interactive', 'risk-decision.md'),
    });
  });

  it('copia sdd/ a .agents/templates/sdd/', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'sdd/explore.md'),
      dest: path.join(fakeTargetDir, '.agents', 'templates', 'sdd', 'explore.md'),
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'sdd/release-notes.md'),
      dest: path.join(fakeTargetDir, '.agents', 'templates', 'sdd', 'release-notes.md'),
    });
  });

  it('inyecta 000-rfc-template.md a openspec/rfcs/ como excepción', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'sdd/000-rfc-template.md'),
      dest: path.join(fakeTargetDir, 'openspec', 'rfcs', '000-rfc-template.md'),
    });
  });

  it('crea el directorio docs-index/ vacío en .agents/templates/sdd/', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'mkdir',
      dest: path.join(fakeTargetDir, '.agents', 'templates', 'sdd', 'docs-index'),
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

});
