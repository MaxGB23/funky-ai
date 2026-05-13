import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

vi.mock('fs');

import fs from 'fs';
import { runGentle } from '../src/commands/gentle.js';

describe('runGentle()', () => {
  const fakeCliTemplatesDir = path.join('C:', 'fake', 'cli', 'templates', 'gentle');
  const fakeCwd = path.join('C:', 'fake', 'project');
  const goldenTemplatesDir = path.join(fakeCwd, '.agents', 'templates', 'gentle');

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('crea directorio y copia archivos desde golden templates', () => {
    const featureName = 'auth-login';
    const expectedFeaturePath = path.join(fakeCwd, 'docs', 'openspec', 'gentle', featureName);

    fs.existsSync.mockImplementation((p) => {
      if (p === goldenTemplatesDir) return true; // Golden templates existen
      if (p === expectedFeaturePath) return false; // El directorio destino NO existe
      if (typeof p === 'string' && p.startsWith(goldenTemplatesDir)) return true; // Los archivos dentro de golden existen
      return false;
    });

    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});

    const result = runGentle({ featureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd });

    expect(result.success).toBe(true);
    expect(result.path).toBe(expectedFeaturePath);
    expect(fs.mkdirSync).toHaveBeenCalledWith(expectedFeaturePath, { recursive: true });
    expect(fs.copyFileSync).toHaveBeenCalledTimes(7); // 7 files to copy
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('usa fallback templates si golden no existen', () => {
    const featureName = 'auth-login';
    const expectedFeaturePath = path.join(fakeCwd, 'docs', 'openspec', 'gentle', featureName);

    fs.existsSync.mockImplementation((p) => {
      if (p === goldenTemplatesDir) return false; // Golden templates NO existen
      if (p === expectedFeaturePath) return false;
      if (typeof p === 'string' && p.startsWith(fakeCliTemplatesDir)) return true; // Archivos en fallback existen
      return false;
    });

    fs.mkdirSync.mockImplementation(() => {});
    fs.copyFileSync.mockImplementation(() => {});

    const result = runGentle({ featureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd });

    expect(result.success).toBe(true);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Usando fallback de CLI'));
    expect(fs.copyFileSync).toHaveBeenCalledTimes(7);
    
    const expectedFirstSrcCall = path.join(fakeCliTemplatesDir, '01-explore.md');
    expect(fs.copyFileSync.mock.calls[0][0]).toBe(expectedFirstSrcCall);
  });

  it('sanitiza el nombre de la feature correctamente', () => {
    const rawFeatureName = '  Auth Login API  ';
    const expectedSanitized = 'auth-login-api';
    const expectedFeaturePath = path.join(fakeCwd, 'docs', 'openspec', 'gentle', expectedSanitized);

    fs.existsSync.mockImplementation((p) => {
      if (p === goldenTemplatesDir) return true;
      if (p === expectedFeaturePath) return false;
      return false;
    });

    const result = runGentle({ featureName: rawFeatureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd });

    expect(result.success).toBe(true);
    expect(result.path).toBe(expectedFeaturePath);
    expect(fs.mkdirSync).toHaveBeenCalledWith(expectedFeaturePath, { recursive: true });
  });

  it('falla si el directorio de la feature ya existe', () => {
    const featureName = 'auth-login';
    const expectedFeaturePath = path.join(fakeCwd, 'docs', 'openspec', 'gentle', featureName);

    fs.existsSync.mockImplementation((p) => {
      if (p === goldenTemplatesDir) return true;
      if (p === expectedFeaturePath) return true; // Directorio ya existe
      return false;
    });

    const result = runGentle({ featureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/ya existe/i);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });
});
