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
  const guideFiles = ['canvas-planning-guide.md', 'init-prompt.md'];

  // Red de seguridad: si algo disparara exit por error de setup, el exit lanza
  // y el test falla ruidosamente en vez de matar el runner de vitest.
  let exitSpy;
  const ttyDescriptor = Object.getOwnPropertyDescriptor(process, 'stdin');

  beforeEach(() => {
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(code => {
      throw new Error(`exit ${code}`);
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Determinismo: el runner de vitest no es interactivo; forzamos no-TTY para
    // que el contrato Fase 2 (guías sin terminal → default n) sea estable.
    Object.defineProperty(process, 'stdin', { value: { isTTY: false }, configurable: true });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    if (ttyDescriptor) {
      Object.defineProperty(process, 'stdin', ttyDescriptor);
    } else {
      delete process.stdin;
    }
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

  it('init limpio → 5 archivos, brief PRIMERO, sin exit (exit 0)', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const target = await runInitIn('clean');
      const cd = canvasDir(target);

      const files = fs.readdirSync(cd);
      expect(files).toHaveLength(5);
      for (const name of ['brief-funcional.md', 'PROJECT-CANVAS.md', 'INFRA-CANVAS.md', 'canvas-planning-guide.md', 'init-prompt.md']) {
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

  it('brief pre-existente → NO se sobrescribe + log de recomendación, resto se crea, exit 0 (2.4)', async () => {
    const target = path.join(rootTmp, 'brief-existing');
    const cd = canvasDir(target);
    const briefPath = path.join(cd, 'brief-funcional.md');

    // Pre-condición R7: el brief ya existe con contenido del usuario; canvases NO.
    fs.mkdirSync(cd, { recursive: true });
    fs.writeFileSync(briefPath, 'CONTENIDO ORIGINAL DEL USUARIO', 'utf8');

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await runInitIn('brief-existing');

      expect(fs.readFileSync(briefPath, 'utf8')).toBe('CONTENIDO ORIGINAL DEL USUARIO');
      expect(fs.existsSync(path.join(cd, 'PROJECT-CANVAS.md'))).toBe(true);
      expect(fs.existsSync(path.join(cd, 'INFRA-CANVAS.md'))).toBe(true);
      for (const g of guideFiles) {
        expect(fs.existsSync(path.join(cd, g))).toBe(true);
      }

      const logs = logSpy.mock.calls.map(c => String(c[0]));
      expect(logs.some(l => /Contiene decisiones del proyecto/.test(l) && l.includes('brief-funcional.md'))).toBe(true);
      expect(exitSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
    }
  });

  it('guías pre-existentes sin TTY → default n (no sobrescribe), log neutro, exit 0 (2.6)', async () => {
    const target = path.join(rootTmp, 'guides-existing');
    const cd = canvasDir(target);
    const guidePaths = guideFiles.map(g => path.join(cd, g));

    fs.mkdirSync(cd, { recursive: true });
    guidePaths.forEach(g => fs.writeFileSync(g, 'GUIA ORIGINAL DEL USUARIO', 'utf8'));

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await runInitIn('guides-existing');

      for (const g of guidePaths) {
        expect(fs.readFileSync(g, 'utf8')).toBe('GUIA ORIGINAL DEL USUARIO');
      }
      expect(fs.existsSync(path.join(cd, 'brief-funcional.md'))).toBe(true);
      expect(fs.existsSync(path.join(cd, 'PROJECT-CANVAS.md'))).toBe(true);
      expect(fs.existsSync(path.join(cd, 'INFRA-CANVAS.md'))).toBe(true);

      const logs = logSpy.mock.calls.map(c => String(c[0]));
      expect(logs.some(l => /Entorno no interactivo/.test(l))).toBe(true);
      // Las líneas ⚡ del motor son deterministas (solo basename): el golden
      // prueba que AMBAS guías existentes se omiten con default n (2.6).
      expect(logs.filter(l => l.startsWith('⚡'))).toMatchSnapshot();
      expect(exitSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
    }
  });

  it('todo existe → decisiones con recomendación, guías con default n, "Salteando" NO aparece (2.8)', async () => {
    const target = path.join(rootTmp, 'all-existing');
    const cd = canvasDir(target);

    fs.mkdirSync(cd, { recursive: true });
    const allFiles = ['brief-funcional.md', 'PROJECT-CANVAS.md', 'INFRA-CANVAS.md', ...guideFiles];
    for (const name of allFiles) {
      fs.writeFileSync(path.join(cd, name), `ORIGINAL ${name}`, 'utf8');
    }

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await runInitIn('all-existing');

      for (const name of allFiles) {
        expect(fs.readFileSync(path.join(cd, name), 'utf8')).toBe(`ORIGINAL ${name}`);
      }

      const logs = logSpy.mock.calls.map(c => String(c[0]));
      expect(logs.some(l => /Entorno no interactivo/.test(l))).toBe(true);
      // 5 líneas ⚡ deterministas: 3 decisiones (recomendación completa) + 2
      // guías (default n) — cubre "Contiene decisiones del proyecto" (2.8).
      expect(logs.filter(l => l.startsWith('⚡'))).toMatchSnapshot();
      expect(logs.some(l => /Salteando/.test(l))).toBe(false);
      expect(exitSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
    }
  });

  it('M10: con archivos pre-existentes el título matiza "listo: N creados, M conservados" y NO dice "Canvases creados"', async () => {
    const target = path.join(rootTmp, 'm10-mixed');
    const cd = canvasDir(target);
    fs.mkdirSync(cd, { recursive: true });
    fs.writeFileSync(path.join(cd, 'brief-funcional.md'), 'ORIGINAL USER', 'utf8');
    fs.writeFileSync(path.join(cd, 'PROJECT-CANVAS.md'), 'ORIGINAL USER', 'utf8');

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await runInitIn('m10-mixed');

      const logs = logSpy.mock.calls.map(c => String(c[0]));
      expect(logs.some(l => /Canvases listos: 3 creados, 2 conservados/.test(l))).toBe(true);
      expect(logs.some(l => /Canvases creados/.test(l))).toBe(false);
      expect(exitSpy).not.toHaveBeenCalled();
    } finally {
      logSpy.mockRestore();
    }
  });
});
