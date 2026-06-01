import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

// Mock fs antes de importar el módulo bajo test
vi.mock('fs');

import fs from 'fs';
import { runInit } from '../src/commands/init.js';

describe('runInit()', () => {
  const fakeTemplatesDir = '/fake/templates';
  const fakeTargetDir = '/fake/project';

  const filesToCopy = [
    { src: 'ORCHESTRATOR-STATE.md', dest: 'ORCHESTRATOR-STATE.md' },
    { src: 'agents-rules-engram-protocol.md', dest: '.agents/rules/engram-protocol.md' },
    { src: 'agents-rules-secops.md', dest: '.agents/rules/secops.md' },
    { src: 'agents-rules-sdd-orchestrator.md', dest: '.agents/rules/sdd-orchestrator.md' },
    { src: 'plantilla-worker-handoff.md', dest: 'docs/funky-ai/workers/plantilla-worker-handoff.md' },
    { src: 'canvas-planning-guide.md', dest: 'docs/funky-ai/cli/canvas-planning-guide.md' },
    { src: '../sdd/architecture-assessment.md', dest: 'docs/architecture-assessment.md' },
    { src: '../sdd/rfc-template.md', dest: 'docs/openspec/rfcs/000-TEMPLATE.md' },
    { src: 'TEMPLATE_GUIDE.md', dest: 'TEMPLATE_GUIDE.md' },
    { src: '../README.md', dest: 'README.md' }
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    // Silenciar console para tests más limpios
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('crea todos los archivos si ninguno existe', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});

    const result = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(result.created).toBe(filesToCopy.length);
    expect(result.skipped).toBe(0);
    expect(fs.mkdirSync).toHaveBeenCalledTimes(filesToCopy.length + 5); // +5 engram dirs
    expect(fs.copyFileSync).toHaveBeenCalledTimes(filesToCopy.length);
  });

  it('llama a writeFileSync para generar PROJECT-CANVAS e INFRA-CANVAS si se provee canvasConfig', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});
    fs.writeFileSync = vi.fn();

    const config = { projectData: { pattern: 'Test Pattern' }, infraData: { db: 'Test DB' } };
    const result = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir, canvasConfig: config });

    expect(result.created).toBe(filesToCopy.length + 2);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(2);
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('PROJECT-CANVAS.md'),
      expect.stringContaining('Test Pattern')
    );
  });

  it('saltea archivos que ya existen', () => {
    // Todos los archivos ya existen
    fs.existsSync.mockReturnValue(true);

    const result = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(result.created).toBe(0);
    expect(result.skipped).toBe(filesToCopy.length);
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });

  it('NO llama a writeFileSync si canvasConfig tiene los skips en true', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});
    fs.writeFileSync = vi.fn();

    const config = { skipProjectCanvas: true, skipInfraCanvas: true };
    const result = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir, canvasConfig: config });

    expect(fs.writeFileSync).not.toHaveBeenCalled();
    expect(result.created).toBe(filesToCopy.length);
  });

  it('crea solo los archivos que no existen (estado mixto)', () => {
    // Solo el primer archivo ya existe
    fs.existsSync.mockImplementation((p) => p.endsWith('ORCHESTRATOR-STATE.md'));
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});

    const result = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(result.created).toBe(filesToCopy.length - 1);
    expect(result.skipped).toBe(1);
  });

  it('propaga el error si fs.copyFileSync falla', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });

    expect(() => runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir }))
      .toThrow('Permission denied');
  });

  it('copia archivos desde templatesDir a targetBase con las rutas correctas', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});

    runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(fs.copyFileSync).toHaveBeenCalledWith(
      path.join(fakeTemplatesDir, 'ORCHESTRATOR-STATE.md'),
      path.join(fakeTargetDir, 'ORCHESTRATOR-STATE.md')
    );

    expect(fs.copyFileSync).toHaveBeenCalledWith(
      path.join(fakeTemplatesDir, 'agents-rules-engram-protocol.md'),
      path.join(fakeTargetDir, '.agents', 'rules', 'engram-protocol.md')
    );
  });

  it('copia archivos correctamente aunque se pase environment: "cli" (ignorado)', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});

    runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir, environment: 'cli' });

    expect(fs.copyFileSync).toHaveBeenCalledWith(
      path.join(fakeTemplatesDir, 'ORCHESTRATOR-STATE.md'),
      path.join(fakeTargetDir, 'ORCHESTRATOR-STATE.md')
    );
  });

  it('copia archivos correctamente aunque se pase environment: "ide" (ignorado)', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});

    runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir, environment: 'ide' });

    expect(fs.copyFileSync).toHaveBeenCalledWith(
      path.join(fakeTemplatesDir, 'ORCHESTRATOR-STATE.md'),
      path.join(fakeTargetDir, 'ORCHESTRATOR-STATE.md')
    );
  });
});
