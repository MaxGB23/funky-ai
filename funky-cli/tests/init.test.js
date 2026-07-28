import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

import { runInit } from '../src/commands/init.js';

describe('runInit()', () => {
  const fakeTemplatesDir = '/fake/templates';
  const fakeTargetDir = '/fake/project';

  const baseIntentionsCount = 9;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('crea el plan de intenciones base (9 archivos + 7 engram dirs + index)', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    const mkdirIntentions = intentions.filter(i => i.action === 'mkdir');
    const copyIntentions = intentions.filter(i => i.action === 'copy');
    const createIntentions = intentions.filter(i => i.action === 'create');

    expect(mkdirIntentions).toHaveLength(7);
    expect(copyIntentions).toHaveLength(13);
    expect(createIntentions).toHaveLength(1); // engram index.md
  });

  it('incluye intenciones create para PROJECT-CANVAS e INFRA-CANVAS si se provee canvasConfig', () => {
    const config = { projectData: { pattern: 'Test Pattern' }, infraData: { db: 'Test DB' } };
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir, canvasConfig: config });

    const createIntentions = intentions.filter(i => i.action === 'create' && i.dest.includes('CANVAS'));
    expect(createIntentions).toHaveLength(2);

    expect(createIntentions[0].dest).toContain('PROJECT-CANVAS.md');
    expect(createIntentions[0].content).toContain('Test Pattern');
    
    expect(createIntentions[1].dest).toContain('INFRA-CANVAS.md');
  });

  it('NO incluye intenciones create si canvasConfig tiene los skips en true', () => {
    const config = { skipProjectCanvas: true, skipInfraCanvas: true };
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir, canvasConfig: config });

    const createIntentions = intentions.filter(i => i.action === 'create' && i.dest.includes('CANVAS'));
    expect(createIntentions).toHaveLength(0);
  });

  it('copia archivos desde templatesDir a targetBase con las rutas correctas', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'ORCHESTRATOR-STATE.md'),
      dest: path.join(fakeTargetDir, 'ORCHESTRATOR-STATE.md')
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'agents-rules-engram-protocol.md'),
      dest: path.join(fakeTargetDir, '.agents', 'rules', 'engram-protocol.md')
    });
  });

  it('incluye los 4 archivos orphaned en las intenciones de copia', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'engram-discoveries.md'),
      dest: path.join(fakeTargetDir, 'docs', 'engram', 'discoveries.md')
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'engram-bugfixes.md'),
      dest: path.join(fakeTargetDir, 'docs', 'engram', 'bugfix', 'bugfixes.md')
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'architecture-assessment-guide.md'),
      dest: path.join(fakeTargetDir, 'docs', 'architecture-assessment-guide.md')
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'agents-rules-secops-setup.md'),
      dest: path.join(fakeTargetDir, '.agents', 'rules', 'secops-setup.md')
    });
  });
});
