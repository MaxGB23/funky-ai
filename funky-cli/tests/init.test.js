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

  it('crea el plan de intenciones base (9 archivos + 5 engram dirs)', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    const mkdirIntentions = intentions.filter(i => i.action === 'mkdir');
    const copyIntentions = intentions.filter(i => i.action === 'copy');
    const createIntentions = intentions.filter(i => i.action === 'create');

    expect(mkdirIntentions).toHaveLength(5);
    expect(copyIntentions).toHaveLength(9);
    expect(createIntentions).toHaveLength(0);
  });

  it('incluye intenciones create para PROJECT-CANVAS e INFRA-CANVAS si se provee canvasConfig', () => {
    const config = { projectData: { pattern: 'Test Pattern' }, infraData: { db: 'Test DB' } };
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir, canvasConfig: config });

    const createIntentions = intentions.filter(i => i.action === 'create');
    expect(createIntentions).toHaveLength(2);

    expect(createIntentions[0].dest).toContain('PROJECT-CANVAS.md');
    expect(createIntentions[0].content).toContain('Test Pattern');
    
    expect(createIntentions[1].dest).toContain('INFRA-CANVAS.md');
  });

  it('NO incluye intenciones create si canvasConfig tiene los skips en true', () => {
    const config = { skipProjectCanvas: true, skipInfraCanvas: true };
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir, canvasConfig: config });

    const createIntentions = intentions.filter(i => i.action === 'create');
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
});
