import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import path from 'path';
import fs from 'fs';

// El handler del comando agnóstico delega la copia real a executeIntentions:
// mockear fs-adapter evita cualquier escritura en disco durante los tests del
// command (los planes puros runScaffold/runAgnosticScaffold son read-only).
const executeIntentionsMock = vi.hoisted(() => vi.fn());

vi.mock('../src/utils/fs-adapter.js', () => ({
  executeIntentions: executeIntentionsMock,
}));

import { runScaffold, runAgnosticScaffold, scaffoldCommand } from '../src/commands/scaffold.js';

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

describe('runAgnosticScaffold()', () => {
  const fakeTemplatesDir = '/fake/templates';
  const fakeTargetDir = '/fake/project';

  it('retorna exactamente 4 operaciones: README + ORCHESTRATOR-STATE + release-notes + RFC (sin reglas ni templates de proceso)', () => {
    const intentions = runAgnosticScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toHaveLength(4);
    expect(intentions.filter(i => i.action === 'copy')).toHaveLength(4);
    expect(intentions.some(i => i.action === 'mkdir')).toBe(false);
  });

  it('copia ORCHESTRATOR-STATE.md a la raíz del proyecto destino', () => {
    const intentions = runAgnosticScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'ORCHESTRATOR-STATE.md'),
      dest: path.join(fakeTargetDir, 'ORCHESTRATOR-STATE.md'),
    });
  });

  it('copia sdd/release-notes.md a .agents/templates/sdd/release-notes.md', () => {
    const intentions = runAgnosticScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'sdd/release-notes.md'),
      dest: path.join(fakeTargetDir, '.agents', 'templates', 'sdd', 'release-notes.md'),
    });
  });

  it('copia sdd/000-rfc-template.md a openspec/rfcs/000-rfc-template.md', () => {
    const intentions = runAgnosticScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'sdd/000-rfc-template.md'),
      dest: path.join(fakeTargetDir, 'openspec', 'rfcs', '000-rfc-template.md'),
    });
  });

  it('NO instala reglas de agentes, templates de proceso SDD, docs compartidos ni directorios engram', () => {
    const intentions = runAgnosticScaffold({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    const allSrc = intentions.map(i => String(i.src || ''));
    const allDest = intentions.map(i => String(i.dest));

    expect(allSrc.some(s => s.includes('.agents') || s.includes('funky-ai-rules'))).toBe(false);
    for (const procTemplate of ['docs.md', 'explore.md', 'proposal.md', 'spec.md', 'tasks.md', 'report.md', 'release-checklist.md', 'docs-live-index.md']) {
      expect(allSrc.some(s => s.endsWith(procTemplate))).toBe(false);
    }
    expect(allDest.some(d => d.includes('rules'))).toBe(false);
    expect(allDest.some(d => d.includes('engram'))).toBe(false);
  });
});

describe('runAgnosticScaffold() — interpolación {{project_name}}', () => {
  const bootstrapDir = path.join(process.cwd(), 'src/templates/bootstrap');
  const tmpDir = path.join(process.cwd(), 'tmp-agnostic-interpolation');

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

  it('interpola {{project_name}} con el campo name del package.json del targetBase (create)', () => {
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ name: 'mi-proyecto-agnostico' }));

    const intentions = runAgnosticScaffold({ templatesDir: bootstrapDir, targetBase: tmpDir });

    const readme = findReadme(intentions);
    expect(readme).toBeTruthy();
    expect(readme.action).toBe('create');
    expect(readme.content).toContain('mi-proyecto-agnostico');
    expect(readme.content).not.toContain('{{project_name}}');
  });

  it('usa el nombre del directorio destino como nombre de proyecto cuando no hay package.json', () => {
    const intentions = runAgnosticScaffold({ templatesDir: bootstrapDir, targetBase: tmpDir });

    const readme = findReadme(intentions);
    expect(readme).toBeTruthy();
    expect(readme.action).toBe('create');
    expect(readme.content).toContain('tmp-agnostic-interpolation');
    expect(readme.content).not.toContain('{{project_name}}');
  });

  it('con template legible genera 1 create (README) + 3 copies', () => {
    const intentions = runAgnosticScaffold({ templatesDir: bootstrapDir, targetBase: tmpDir });

    expect(intentions).toHaveLength(4);
    expect(intentions.filter(i => i.action === 'create')).toHaveLength(1);
    expect(intentions.filter(i => i.action === 'copy')).toHaveLength(3);
  });
});

describe('funky scaffold — comando agnóstico OpenSpec/SDD', () => {
  beforeEach(() => {
    executeIntentionsMock.mockReset();
    executeIntentionsMock.mockResolvedValue({ created: 0, skipped: 0, logs: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('scaffoldCommand se llama "scaffold" y ejecuta su propio handler sin warning de deprecación', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      expect(scaffoldCommand.name()).toBe('scaffold');

      await scaffoldCommand.parseAsync([], { from: 'user' });

      expect(warnSpy).not.toHaveBeenCalled();
      expect(executeIntentionsMock).toHaveBeenCalledTimes(1);
      const logs = logSpy.mock.calls.map(c => String(c[0]));
      expect(logs.some(l => l.includes('🚀 Instalando scaffold agnóstico'))).toBe(true);
      expect(logs.some(l => l.includes('✅ Scaffold agnóstico instalado.'))).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
      logSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });
});
