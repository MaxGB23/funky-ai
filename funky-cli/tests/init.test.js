import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock parcial de fs: readFileSync se mantiene REAL (el test real-file del
// template lee el archivo de verdad), existsSync/mkdirSync/copyFileSync son
// spies (I/O del action/executeIntentions). Patrón assess.test.js.
const sharedFsMock = vi.hoisted(() => ({
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
  copyFileSync: vi.fn(),
}));

// Mock de @clack/prompts (patrón skills.interactive.test.js): la action usa
// p.confirm para la confirmación Y/N de guías existentes (Fase 2, 2.3).
const clackMock = vi.hoisted(() => ({
  confirm: vi.fn(),
  isCancel: vi.fn(() => false),
  cancel: vi.fn(),
}));

vi.mock('fs', async () => {
  const actual = await vi.importActual('fs');
  const mockModule = {
    ...actual,
    existsSync: sharedFsMock.existsSync,
    mkdirSync: sharedFsMock.mkdirSync,
    copyFileSync: sharedFsMock.copyFileSync,
  };
  return { ...mockModule, default: mockModule };
});
vi.mock('node:fs', async () => {
  const actual = await vi.importActual('node:fs');
  const mockModule = {
    ...actual,
    existsSync: sharedFsMock.existsSync,
    mkdirSync: sharedFsMock.mkdirSync,
    copyFileSync: sharedFsMock.copyFileSync,
  };
  return { ...mockModule, default: mockModule };
});
vi.mock('@clack/prompts', () => clackMock);

import { runInit, initCommand } from '../src/commands/init.js';

// ── Template del brief funcional (R6) ──

describe('brief-funcional.md template (R6)', () => {
  const templatePath = path.join(__dirname, '../src/templates/init/brief-funcional.md');
  const content = fs.readFileSync(templatePath, 'utf8');

  // Los 12 ítems de §13 (recomendaciones-agente.md:415-426), en orden.
  const expectedHeaders = [
    '1. Nombre del Producto o Idea',
    '2. Objetivo del Sistema',
    '3. Tipo de Usuario',
    '4. Caso de Uso Principal',
    '5. Funcionalidades Principales',
    '6. Funcionalidades Secundarias / Futuras',
    '7. Roles y Permisos',
    '8. Requisitos de Seguridad',
    '9. Integraciones Esperadas',
    '10. Entregables por Fase',
    '11. MVP vs Fase 2',
    '12. KPI o Éxito del Producto',
  ];

  it('contiene los 12 ítems de §13 como headers `## N.` en orden (R6)', () => {
    const headers = (content.match(/^## (\d+\. .+)$/gm) ?? []).map(h => h.replace(/^## /, ''));
    expect(headers).toEqual(expectedHeaders);
  });

  it('cada campo usa el placeholder [Completar] (R6)', () => {
    const completarCount = (content.match(/\[Completar\]/g) ?? []).length;
    expect(completarCount).toBeGreaterThanOrEqual(expectedHeaders.length);
  });

  it('NO contiene [Responde aquí] (R6 — no infla countUnfilledSections)', () => {
    expect(content).not.toContain('[Responde aquí]');
  });

  it('abre con el título `# 📋 BRIEF FUNCIONAL` y una intro que define "qué" y "para quién" (D4)', () => {
    expect(content.startsWith('# 📋 BRIEF FUNCIONAL')).toBe(true);
    expect(content).toMatch(/QUÉ|qué/);
    expect(content).toMatch(/PARA QUIÉN|para quién/);
  });
});

// ── Contrato de docs (R9) ──

describe('docs/funky-forge/init.md (R9)', () => {
  // Real-file: readFileSync se mantiene REAL en el mock parcial de fs.
  const docPath = path.join(__dirname, '../../docs/funky-forge/init.md');
  const content = fs.readFileSync(docPath, 'utf8');

  it('lista los 5 outputs con brief-funcional.md PRIMERO (R9, Fase 2 — init-prompt.md)', () => {
    const outputBlock = content.split('### Archivos generados (outputs)')[1].split('## Diagrama de flujo')[0];

    expect(outputBlock).toContain('brief-funcional.md');
    expect(outputBlock).toContain('PROJECT-CANVAS.md');
    expect(outputBlock).toContain('INFRA-CANVAS.md');
    expect(outputBlock).toContain('canvas-planning-guide.md');
    expect(outputBlock).toContain('init-prompt.md');
    expect(outputBlock.indexOf('brief-funcional.md')).toBeLessThan(outputBlock.indexOf('PROJECT-CANVAS.md'));
  });

  it('el diagrama nombra runInit y la copia del brief (R9)', () => {
    const diagram = content.split('## Diagrama de flujo')[1].split('## canvas-planning-guide')[0];

    expect(diagram).toContain('runInit({ templatesDir, targetBase })');
    expect(diagram).toMatch(/copy brief-funcional\.md/);
  });
});

// ── runInit pura (R8) ──

describe('runInit()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fakeTemplatesDir = '/fake/templates/init';
  const fakeTargetBase = '/fake/project';

  it('la primera intención es mkdir de docs/funky-ai/canvas (R1)', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetBase });

    expect(intentions[0]).toEqual({
      action: 'mkdir',
      dest: path.join(fakeTargetBase, 'docs/funky-ai/canvas'),
    });
  });

  it('retorna 6 intenciones: mkdir + 5 copies, sin create ni optional (R8, Fase 2)', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetBase });

    expect(intentions).toHaveLength(6);
    expect(intentions.filter(i => i.action === 'mkdir')).toHaveLength(1);
    expect(intentions.filter(i => i.action === 'copy')).toHaveLength(5);
    expect(intentions.filter(i => i.action === 'create')).toHaveLength(0);
    expect(intentions.every(i => i.optional === undefined)).toBe(true);
  });

  it('asigna kind por archivo: decisiones = decision, guías = guide, mkdir sin kind (2.1/2.7)', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetBase });

    const kindOf = (basename) =>
      intentions.find(i => i.action === 'copy' && path.basename(i.dest) === basename)?.kind;

    expect(kindOf('brief-funcional.md')).toBe('decision');
    expect(kindOf('PROJECT-CANVAS.md')).toBe('decision');
    expect(kindOf('INFRA-CANVAS.md')).toBe('decision');
    expect(kindOf('canvas-planning-guide.md')).toBe('guide');
    expect(kindOf('init-prompt.md')).toBe('guide');
    expect(intentions[0].kind).toBeUndefined();
  });

  it('el brief se copia ANTES que PROJECT/INFRA, e init-prompt.md es la última (R7, Fase 2)', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetBase });

    const indexOf = (basename) =>
      intentions.findIndex(i => i.action === 'copy' && path.basename(i.dest) === basename);

    const briefIdx = indexOf('brief-funcional.md');
    const projectIdx = indexOf('PROJECT-CANVAS.md');
    const infraIdx = indexOf('INFRA-CANVAS.md');
    const guideIdx = indexOf('canvas-planning-guide.md');
    const promptIdx = indexOf('init-prompt.md');

    expect(briefIdx).toBeGreaterThanOrEqual(0);
    expect(briefIdx).toBeLessThan(projectIdx);
    expect(projectIdx).toBeLessThan(infraIdx);
    expect(guideIdx).toBeLessThan(promptIdx);
    expect(promptIdx).toBe(intentions.length - 1);
  });

  it('sitúa brief, guía y prompt del canvas en docs/funky-ai/canvas/ (R1/R7)', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetBase });

    const brief = intentions.find(i => i.action === 'copy' && path.basename(i.dest) === 'brief-funcional.md');
    expect(brief.src).toBe(path.join(fakeTemplatesDir, 'brief-funcional.md'));
    expect(brief.dest).toBe(path.join(fakeTargetBase, 'docs/funky-ai/canvas', 'brief-funcional.md'));

    const guide = intentions.find(i => i.action === 'copy' && path.basename(i.dest) === 'canvas-planning-guide.md');
    expect(guide.src).toBe(path.join(fakeTemplatesDir, 'canvas-planning-guide.md'));
    expect(guide.dest).toBe(path.join(fakeTargetBase, 'docs/funky-ai/canvas', 'canvas-planning-guide.md'));

    const prompt = intentions.find(i => i.action === 'copy' && path.basename(i.dest) === 'init-prompt.md');
    expect(prompt.src).toBe(path.join(fakeTemplatesDir, 'init-prompt.md'));
    expect(prompt.dest).toBe(path.join(fakeTargetBase, 'docs/funky-ai/canvas', 'init-prompt.md'));
  });

  it('planifica la copia sin tocar el sistema de archivos (R8)', () => {
    runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetBase });

    expect(sharedFsMock.existsSync).not.toHaveBeenCalled();
    expect(sharedFsMock.mkdirSync).not.toHaveBeenCalled();
    expect(sharedFsMock.copyFileSync).not.toHaveBeenCalled();
  });
});

// ── Contrato de feedback del action (Fase 2 — reemplaza el guard grueso R3) ──

describe('init action — contrato de feedback por archivo (Fase 2, 2.1-2.6)', () => {
  const ttyDescriptor = Object.getOwnPropertyDescriptor(process, 'stdin');

  let exitSpy;
  let errorSpy;
  let logSpy;

  const setTTY = (value) => {
    Object.defineProperty(process, 'stdin', { value: { isTTY: value }, configurable: true });
  };

  beforeEach(() => {
    // resetAllMocks (no clearAllMocks): el test EACCES deja copyFileSync con
    // mockImplementation que lanza; clearAllMocks NO resetea implementaciones y
    // ese throw se filtra al test de triangulación (aislamiento de mocks).
    vi.resetAllMocks();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    // exitSpy lanza para replicar la terminación real del proceso (patrón assess.test.js:189).
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });
    clackMock.isCancel.mockReturnValue(false);
  });

  afterEach(() => {
    exitSpy.mockRestore();
    errorSpy.mockRestore();
    logSpy.mockRestore();
    if (ttyDescriptor) {
      Object.defineProperty(process, 'stdin', ttyDescriptor);
    } else {
      delete process.stdin;
    }
  });

  const allLogs = () => logSpy.mock.calls.map(c => String(c[0]));

  it('decisiones existentes → skip + recomendación, guías nuevas se crean, exit 0 (reemplaza R3)', async () => {
    sharedFsMock.existsSync.mockImplementation(p => {
      const b = path.basename(String(p));
      return ['brief-funcional.md', 'PROJECT-CANVAS.md', 'INFRA-CANVAS.md'].includes(b);
    });

    await initCommand.parseAsync([], { from: 'user' }); // NO debe lanzar

    expect(exitSpy).not.toHaveBeenCalled();
    expect(clackMock.confirm).not.toHaveBeenCalled();
    const logs = allLogs();
    expect(logs.some(l => l.includes('Contiene decisiones del proyecto'))).toBe(true);
    expect(logs.some(l => l.includes('elimínalo'))).toBe(true);
    // Las decisiones nunca se sobrescriben: copyFileSync solo se usó para las guías nuevas.
    const copyDests = sharedFsMock.copyFileSync.mock.calls.map(c => c[1]);
    expect(copyDests.some(d => d.includes('brief-funcional.md'))).toBe(false);
    expect(copyDests).toHaveLength(2);
  });

  it('todo existe + TTY + confirm=y → guías sobrescritas (Actualizada), exit 0 (2.3)', async () => {
    setTTY(true);
    sharedFsMock.existsSync.mockReturnValue(true);
    clackMock.confirm.mockResolvedValue(true);

    await initCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).not.toHaveBeenCalled();
    expect(clackMock.confirm).toHaveBeenCalledTimes(2);
    const copyDests = sharedFsMock.copyFileSync.mock.calls.map(c => c[1]);
    expect(copyDests).toHaveLength(2);
    expect(copyDests.some(d => d.includes('canvas-planning-guide.md'))).toBe(true);
    expect(copyDests.some(d => d.includes('init-prompt.md'))).toBe(true);
    expect(allLogs().some(l => l.includes('Actualizada'))).toBe(true);
  });

  it('todo existe + TTY + confirm=n → NO sobrescribe nada, decisión válida, exit 0 (2.3)', async () => {
    setTTY(true);
    sharedFsMock.existsSync.mockReturnValue(true);
    clackMock.confirm.mockResolvedValue(false);

    await initCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).not.toHaveBeenCalled();
    expect(clackMock.confirm).toHaveBeenCalledTimes(2);
    expect(sharedFsMock.copyFileSync).not.toHaveBeenCalled();
    expect(allLogs().some(l => l.includes('Omitiendo'))).toBe(true);
    expect(allLogs().some(l => l.includes('Contiene decisiones del proyecto'))).toBe(true);
  });

  it('todo existe + sin TTY → no pregunta, log de entorno no interactivo, no sobrescribe, exit 0 (2.6)', async () => {
    setTTY(false);
    sharedFsMock.existsSync.mockReturnValue(true);

    await initCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).not.toHaveBeenCalled();
    expect(clackMock.confirm).not.toHaveBeenCalled();
    expect(sharedFsMock.copyFileSync).not.toHaveBeenCalled();
    const logs = allLogs();
    expect(logs.some(l => l.includes('Entorno no interactivo'))).toBe(true);
    expect(logs.some(l => l.includes('Omitiendo'))).toBe(true);
  });

  it('error real de I/O (EACCES) → mensaje claro y exit 1 (2.5)', async () => {
    sharedFsMock.existsSync.mockReturnValue(false);
    sharedFsMock.copyFileSync.mockImplementation(() => {
      const err = new Error('EACCES: permission denied, open');
      err.code = 'EACCES';
      throw err;
    });

    await expect(initCommand.parseAsync([], { from: 'user' })).rejects.toThrow('exit');

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('permisos'));
  });

  it('sin archivos existentes → completa sin exit y crea las 5 copias (triangulación)', async () => {
    sharedFsMock.existsSync.mockReturnValue(false);

    await initCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).not.toHaveBeenCalled();
    expect(sharedFsMock.copyFileSync).toHaveBeenCalledTimes(5);
    expect(sharedFsMock.mkdirSync).toHaveBeenCalled();
  });

  it('sin TTY + creación limpia → NO loguea "Entorno no interactivo" (no hay guías que actualizar, hallazgo smoke 1)', async () => {
    setTTY(false);
    sharedFsMock.existsSync.mockReturnValue(false);

    await initCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).not.toHaveBeenCalled();
    expect(allLogs().some(l => l.includes('Entorno no interactivo'))).toBe(false);
    expect(sharedFsMock.copyFileSync).toHaveBeenCalledTimes(5);
  });

  it('todo existe → log final "Nada que crear" en lugar de "Canvases creados" (hallazgo smoke 2)', async () => {
    setTTY(false);
    sharedFsMock.existsSync.mockReturnValue(true);

    await initCommand.parseAsync([], { from: 'user' });

    expect(exitSpy).not.toHaveBeenCalled();
    const logs = allLogs();
    expect(logs.some(l => l.includes('Nada que crear'))).toBe(true);
    expect(logs.some(l => l.includes('Canvases creados'))).toBe(false);
  });
});
