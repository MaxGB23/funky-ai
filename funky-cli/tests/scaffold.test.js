import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';

import { runScaffold } from '../src/commands/scaffold.js';

describe('runScaffold()', () => {
  const fakeTemplatesDir = '/fake/templates';
  const fakeTargetDir = '/fake/project';

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('crea el plan completo: 37 copy + 0 create + 7 mkdir (dirs fake: README cae al copy)', () => {
    const intentions = runScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    const mkdirIntentions = intentions.filter(i => i.action === 'mkdir');
    const copyIntentions = intentions.filter(i => i.action === 'copy');
    const createIntentions = intentions.filter(i => i.action === 'create');

    expect(mkdirIntentions).toHaveLength(7);
    expect(copyIntentions).toHaveLength(37);
    expect(createIntentions).toHaveLength(0);
  });

  it('incluye los 3 root files con rutas correctas (sin canvases — van a docs/funky-ai/canvas/)', () => {
    const intentions = runScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

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

    // Canvases are NOT copied by runScaffold — they're created in docs/funky-ai/canvas/ by init command action
    expect(intentions.filter(i => String(i.src || '').includes('PROJECT-CANVAS.md'))).toHaveLength(0);
    expect(intentions.filter(i => String(i.src || '').includes('INFRA-CANVAS.md'))).toHaveLength(0);
  });

  it('copia funky-ai-rules/ a .agents/rules/ con rutas correctas', () => {
    const intentions = runScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

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
    const intentions = runScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

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
    const intentions = runScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'sdd/000-rfc-template.md'),
      dest: path.join(fakeTargetDir, 'openspec', 'rfcs', '000-rfc-template.md'),
    });
  });

  it('copia docs-index/_indice-seccional-template.md (formato canónico del índice seccional)', () => {
    const intentions = runScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'sdd/docs-index/_indice-seccional-template.md'),
      dest: path.join(fakeTargetDir, '.agents', 'templates', 'sdd', 'docs-index', '_indice-seccional-template.md'),
    });
  });

  it('copia docs-live-index.md desde el template compartido (create → copy, R-SK-5)', () => {
    const intentions = runScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'sdd/docs-live-index.md'),
      dest: path.join(fakeTargetDir, '.agents', 'templates', 'sdd', 'docs-live-index.md'),
    });

    const liveIndex = intentions.find(i => String(i.dest).replace(/\\/g, '/').endsWith('.agents/templates/sdd/docs-live-index.md'));
    expect(liveIndex.action).toBe('copy');
  });

});

describe('runScaffold() — interpolación {{project_name}}', () => {
  const bootstrapDir = path.join(process.cwd(), 'src/templates/bootstrap');
  const tmpDir = path.join(process.cwd(), 'tmp-init-interpolation');

  beforeEach(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  const findReadme = (intentions) => {
    return intentions.find(i => String(i.dest).replace(/\\/g, '/').endsWith('README.md'));
  };

  it('interpola {{project_name}} con el campo name del package.json del targetBase', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ name: 'mi-proyecto' }));

    const intentions = runScaffold({ templatesDir: bootstrapDir, targetBase: tmpDir });

    const readme = findReadme(intentions);
    expect(readme).toBeTruthy();
    expect(readme.action).toBe('create');
    expect(readme.content).toContain('mi-proyecto');
    expect(readme.content).not.toContain('{{project_name}}');
  });

  it('usa el nombre del directorio destino como nombre de proyecto cuando no hay package.json', () => {
    const intentions = runScaffold({ templatesDir: bootstrapDir, targetBase: tmpDir });

    const readme = findReadme(intentions);
    expect(readme).toBeTruthy();
    expect(readme.action).toBe('create');
    expect(readme.content).toContain('tmp-init-interpolation');
    expect(readme.content).not.toContain('{{project_name}}');
  });
});
