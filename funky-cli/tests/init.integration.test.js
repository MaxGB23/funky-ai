import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { initCommand } from '../src/commands/init.js';

// Integración real de `funky init` (R1/R7): ejecuta el action del comando
// con fs REAL en un tmp bajo process.cwd() (patrón scaffold.integration.test.js).
describe('funky init — integración real (R1/R7)', () => {
  const rootTmp = path.join(process.cwd(), 'tmp-init-integration');
  const templatesDir = path.join(process.cwd(), 'src/templates/init');
  const originalCwd = process.cwd();

  const canvasDir = target => path.join(target, 'docs', 'funky-ai', 'canvas');

  // Red de seguridad: si el guard se disparara por error de setup, el exit
  // lanza y el test falla ruidosamente en vez de matar el runner de vitest.
  let exitSpy;
  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(code => {
      throw new Error(`exit ${code}`);
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Ejecuta el action real con cwd dentro del subdirectorio tmp.
  const runInitIn = async sub => {
    const target = path.join(rootTmp, sub);
    fs.mkdirSync(target, { recursive: true });
    process.chdir(target);
    try {
      await initCommand.parseAsync([], { from: 'user' });
    } finally {
      process.chdir(originalCwd);
    }
    return target;
  };

  beforeAll(() => {
    if (fs.existsSync(rootTmp)) {
      fs.rmSync(rootTmp, { recursive: true, force: true });
    }
    fs.mkdirSync(rootTmp, { recursive: true });
  });

  afterAll(() => {
    process.chdir(originalCwd);
    if (fs.existsSync(rootTmp)) {
      fs.rmSync(rootTmp, { recursive: true, force: true });
    }
  });

  it('init limpio → 4 archivos, brief PRIMERO, sin exit (exit 0)', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const target = await runInitIn('clean');
      const cd = canvasDir(target);

      const files = fs.readdirSync(cd);
      expect(files).toHaveLength(4);
      for (const name of ['brief-funcional.md', 'PROJECT-CANVAS.md', 'INFRA-CANVAS.md', 'canvas-planning-guide.md']) {
        expect(files).toContain(name);
      }

      // El brief es el primer archivo copiado (R7): primer log "✅ Creado: ".
      const createdLogs = logSpy.mock.calls
        .map(c => String(c[0]))
        .filter(l => l.startsWith('✅ Creado: '));
      expect(createdLogs[0]).toContain('brief-funcional.md');

      // El brief se copia byte a byte del template (R1).
      const actual = fs.readFileSync(path.join(cd, 'brief-funcional.md'), 'utf8');
      const template = fs.readFileSync(path.join(templatesDir, 'brief-funcional.md'), 'utf8');
      expect(actual).toBe(template);

      expect(exitSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
    }
  });

  it('brief pre-existente → NO se sobrescribe, canvases OK, sin exit (R7)', async () => {
    const target = path.join(rootTmp, 'brief-existing');
    const cd = canvasDir(target);
    const briefPath = path.join(cd, 'brief-funcional.md');

    // Pre-condición R7: el brief ya existe con contenido del usuario; canvases NO.
    fs.mkdirSync(cd, { recursive: true });
    fs.writeFileSync(briefPath, 'CONTENIDO ORIGINAL DEL USUARIO', 'utf8');

    await runInitIn('brief-existing');

    expect(fs.readFileSync(briefPath, 'utf8')).toBe('CONTENIDO ORIGINAL DEL USUARIO');
    expect(fs.existsSync(path.join(cd, 'PROJECT-CANVAS.md'))).toBe(true);
    expect(fs.existsSync(path.join(cd, 'INFRA-CANVAS.md'))).toBe(true);
    expect(fs.existsSync(path.join(cd, 'canvas-planning-guide.md'))).toBe(true);
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('guide pre-existente → skip sin error, canvases + brief OK (R2/D2)', async () => {
    const target = path.join(rootTmp, 'guide-existing');
    const cd = canvasDir(target);
    const guidePath = path.join(cd, 'canvas-planning-guide.md');

    // Pre-condición: la guía ya existe; canvases NO.
    fs.mkdirSync(cd, { recursive: true });
    fs.writeFileSync(guidePath, 'GUIA ORIGINAL DEL USUARIO', 'utf8');

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await runInitIn('guide-existing');

      expect(fs.readFileSync(guidePath, 'utf8')).toBe('GUIA ORIGINAL DEL USUARIO');
      expect(fs.existsSync(path.join(cd, 'brief-funcional.md'))).toBe(true);
      expect(fs.existsSync(path.join(cd, 'PROJECT-CANVAS.md'))).toBe(true);
      expect(fs.existsSync(path.join(cd, 'INFRA-CANVAS.md'))).toBe(true);

      const skipLogs = logSpy.mock.calls.map(c => String(c[0])).filter(l => l.includes('Salteando'));
      expect(skipLogs.some(l => l.includes('canvas-planning-guide.md'))).toBe(true);
      expect(exitSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
    }
  });
});
