import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

vi.mock('fs');
vi.mock('@inquirer/prompts');

import fs from 'fs';
import { runEngramAdd } from '../src/commands/engram.js';

const fakeCwd = path.join('C:', 'fake', 'project');

describe('runEngramAdd() — unit (fs mocked)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('crea el archivo .md en el subdirectorio correcto de la categoría', async () => {
    const tag = '[test-tag]';
    const category = 'discovery';
    const desc = 'Descubrimiento de prueba';
    const expectedDir = path.join(fakeCwd, 'docs', 'engram', category);
    const expectedFile = path.join(expectedDir, 'test-tag.md');

    fs.existsSync.mockImplementation(() => false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});

    const result = await runEngramAdd({ tag, category, desc, cwd: fakeCwd });

    expect(result.success).toBe(true);
    expect(result.path).toBe(expectedFile);
    expect(fs.mkdirSync).toHaveBeenCalledWith(expectedDir, { recursive: true });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      expectedFile,
      expect.stringContaining('[test-tag]'),
      'utf8'
    );
  });

  it('el contenido del archivo incluye el tag, la descripción y la fecha', async () => {
    const tag = '[nuevo-patron]';
    const category = 'pattern';
    const desc = 'Nuevo patrón detectado';
    const today = new Date().toISOString().split('T')[0];

    fs.existsSync.mockImplementation(() => false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});

    await runEngramAdd({ tag, category, desc, cwd: fakeCwd });

    const [, writtenContent] = fs.writeFileSync.mock.calls[0];
    expect(writtenContent).toContain('[nuevo-patron]');
    expect(writtenContent).toContain(desc);
    expect(writtenContent).toContain(today);
  });

  it('sanitiza el tag: strips brackets, lowercase, spaces → guiones', async () => {
    const tag = '[Fix Auth Bug]';
    const category = 'bugfix';
    const desc = 'Fix crítico';
    const expectedDir = path.join(fakeCwd, 'docs', 'engram', category);
    const expectedFile = path.join(expectedDir, 'fix-auth-bug.md');

    fs.existsSync.mockImplementation(() => false);
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});

    const result = await runEngramAdd({ tag, category, desc, cwd: fakeCwd });

    expect(result.path).toBe(expectedFile);
    expect(fs.writeFileSync.mock.calls[0][0]).toBe(expectedFile);
  });

  it('hace append a index.md si existe y la categoría header está presente', async () => {
    const tag = '[index-append]';
    const category = 'decision';
    const desc = 'Decisión importante';
    const indexPath = path.join(fakeCwd, 'docs', 'engram', 'index.md');
    const engramDir = path.join(fakeCwd, 'docs', 'engram', category);

    const mockIndex = `# Engram Index\n\n## Decision\n\n## Architecture\n`;

    fs.existsSync.mockImplementation((p) => {
      if (p === engramDir) return true;
      if (p === indexPath) return true;
      return false;
    });
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});
    fs.readFileSync.mockReturnValue(mockIndex);

    await runEngramAdd({ tag, category, desc, cwd: fakeCwd });

    // writeFileSync se llama dos veces: el archivo del engrama y el index.md
    const indexWrite = fs.writeFileSync.mock.calls.find(([p]) => p === indexPath);
    expect(indexWrite).toBeDefined();
    const [, updatedIndex] = indexWrite;
    expect(updatedIndex).toContain('[index-append]');
    expect(updatedIndex).toContain('decision/index-append.md');
  });

  it('no actualiza index.md si el archivo no existe', async () => {
    const tag = '[sin-index]';
    const category = 'architecture';
    const desc = 'Sin index presente';
    const indexPath = path.join(fakeCwd, 'docs', 'engram', 'index.md');

    fs.existsSync.mockImplementation((p) => {
      if (p === indexPath) return false;
      return false;
    });
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});

    await runEngramAdd({ tag, category, desc, cwd: fakeCwd });

    const indexWrite = fs.writeFileSync.mock.calls.find(([p]) => p === indexPath);
    expect(indexWrite).toBeUndefined();
  });

  it('no llama a mkdirSync si el directorio ya existe', async () => {
    const tag = '[dir-existe]';
    const category = 'pattern';
    const desc = 'Dir ya existe';
    const engramDir = path.join(fakeCwd, 'docs', 'engram', category);

    fs.existsSync.mockImplementation((p) => {
      if (p === engramDir) return true;
      return false;
    });
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});

    await runEngramAdd({ tag, category, desc, cwd: fakeCwd });

    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it('hace append a index.md en las nuevas secciones (session/release)', async () => {
    const tag = '[test-release]';
    const category = 'release';
    const desc = 'Test de release';
    const indexPath = path.join(fakeCwd, 'docs', 'engram', 'index.md');
    const engramDir = path.join(fakeCwd, 'docs', 'engram', category);

    const mockIndex = `# Engram Index\n\n## Session\n\n## Release\n`;

    fs.existsSync.mockImplementation((p) => {
      if (p === engramDir) return true;
      if (p === indexPath) return true;
      return false;
    });
    fs.mkdirSync.mockImplementation(() => {});
    fs.writeFileSync.mockImplementation(() => {});
    fs.readFileSync.mockReturnValue(mockIndex);

    await runEngramAdd({ tag, category, desc, cwd: fakeCwd });

    const indexWrite = fs.writeFileSync.mock.calls.find(([p]) => p === indexPath);
    expect(indexWrite).toBeDefined();
    const [, updatedIndex] = indexWrite;
    expect(updatedIndex).toContain('[test-release]');
    expect(updatedIndex).toContain('release/test-release.md');
  });

  it('lanza un error si la categoría enviada es inválida', async () => {
    await expect(
      runEngramAdd({ tag: '[test]', category: 'random', desc: 'test desc', cwd: fakeCwd })
    ).rejects.toThrow('Categoría inválida: random');
  });
});
