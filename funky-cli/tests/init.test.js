import { describe, it, expect, vi, beforeEach } from 'vitest';

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

  it('saltea archivos que ya existen', () => {
    // Todos los archivos ya existen
    fs.existsSync.mockReturnValue(true);

    const result = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(result.created).toBe(0);
    expect(result.skipped).toBe(filesToCopy.length);
    expect(fs.copyFileSync).not.toHaveBeenCalled();
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
});
