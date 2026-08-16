import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runEngramAdd } from '../src/commands/engram.js';

describe('runEngramAdd() Integration (headless, fs real)', () => {
  const tmpDir = path.join(process.cwd(), 'tmp-engram-integration');
  const engramBase = path.join(tmpDir, 'docs', 'engram');

  beforeAll(() => {
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

  it('crea el archivo .md en la categoría correcta cuando se pasan todos los flags', async () => {
    const result = await runEngramAdd({
      tag: '[headless-test]',
      category: 'discovery',
      desc: 'Integración headless sin interactividad',
      cwd: tmpDir,
    });

    const expectedFile = path.join(engramBase, 'discovery', 'headless-test.md');
    expect(result.success).toBe(true);
    expect(result.path).toBe(expectedFile);
    expect(fs.existsSync(expectedFile)).toBe(true);

    const content = fs.readFileSync(expectedFile, 'utf8');
    expect(content).toMatch(/\[headless-test\]/);
    expect(content).toMatch(/Integración headless sin interactividad/);
  });

  it('crea el directorio de categoría si no existía previamente', async () => {
    const categoryDir = path.join(engramBase, 'architecture');
    expect(fs.existsSync(categoryDir)).toBe(false);

    await runEngramAdd({
      tag: '[arch-discovery]',
      category: 'architecture',
      desc: 'Patrón de arquitectura detectado',
      cwd: tmpDir,
    });

    expect(fs.existsSync(categoryDir)).toBe(true);
  });

  it('hace append en index.md cuando el archivo ya existe con la sección de categoría', async () => {
    const indexPath = path.join(engramBase, 'index.md');
    fs.mkdirSync(engramBase, { recursive: true });
    fs.writeFileSync(
      indexPath,
      `# Engram Index\n\n## Bugfix\n\n## Discovery\n`,
      'utf8'
    );

    await runEngramAdd({
      tag: '[index-write]',
      category: 'bugfix',
      desc: 'Fixture de index append',
      cwd: tmpDir,
    });

    const updatedIndex = fs.readFileSync(indexPath, 'utf8');
    // Golden del index real: entrada appendeada bajo su header de categoría (sin fecha → determinista).
    expect(updatedIndex).toMatchSnapshot();
  });

  it('NO sobreescribe un engrama existente con el mismo tag — previene duplicados', async () => {
    const tag = '[duplicate-tag]';
    const category = 'pattern';

    await runEngramAdd({ tag, category, desc: 'Primera versión', cwd: tmpDir });
    const result = await runEngramAdd({ tag, category, desc: 'Segunda versión', cwd: tmpDir });

    expect(result.success).toBe(false);
    expect(result.skipped).toBe(true);
    // El contenido original se conserva
    const content = fs.readFileSync(result.path, 'utf8');
    expect(content).toMatch(/Primera versión/);
    expect(content).not.toMatch(/Segunda versión/);
  });
});
