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
    { src: 'engram-discoveries.md', dest: 'docs/engram/discoveries.md' },
    { src: 'engram-bugfixes.md', dest: 'docs/engram/bugfixes.md' },
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
    expect(fs.mkdirSync).toHaveBeenCalledTimes(filesToCopy.length);
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

  it('asume environment: "ide" por defecto y copia las rutas de ide', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});

    runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(fs.copyFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.join('ide', 'agents-rules-engram-protocol.md')),
      expect.stringContaining(path.join('.agents', 'rules', 'engram-protocol.md'))
    );

    expect(fs.copyFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.join('ide', 'agents-rules-sdd-orchestrator.md')),
      expect.stringContaining(path.join('.agents', 'rules', 'sdd-orchestrator.md'))
    );
  });

  it('copia las rutas de cli si se provee environment: "cli"', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});

    runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir, environment: 'cli' });

    expect(fs.copyFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.join('cli', 'agents-rules-engram-protocol.md')),
      expect.stringContaining(path.join('.agents', 'rules', 'engram-protocol.md'))
    );

    expect(fs.copyFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.join('cli', 'agents-rules-sdd-orchestrator.md')),
      expect.stringContaining(path.join('.agents', 'rules', 'sdd-orchestrator.md'))
    );
  });

  it('copia las rutas de ide si se provee environment: "ide" explícitamente', () => {
    fs.existsSync.mockReturnValue(false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});

    runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir, environment: 'ide' });

    expect(fs.copyFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.join('ide', 'agents-rules-engram-protocol.md')),
      expect.stringContaining(path.join('.agents', 'rules', 'engram-protocol.md'))
    );

    expect(fs.copyFileSync).toHaveBeenCalledWith(
      expect.stringContaining(path.join('ide', 'agents-rules-sdd-orchestrator.md')),
      expect.stringContaining(path.join('.agents', 'rules', 'sdd-orchestrator.md'))
    );
  });
});
