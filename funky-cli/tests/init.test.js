import { describe, it, expect, vi, beforeEach } from 'vitest';
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

import { runInit } from '../src/commands/init.js';

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

  it('retorna 5 intenciones: mkdir + 4 copies, sin create ni optional (R8)', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetBase });

    expect(intentions).toHaveLength(5);
    expect(intentions.filter(i => i.action === 'mkdir')).toHaveLength(1);
    expect(intentions.filter(i => i.action === 'copy')).toHaveLength(4);
    expect(intentions.filter(i => i.action === 'create')).toHaveLength(0);
    expect(intentions.every(i => i.optional === undefined)).toBe(true);
  });

  it('el brief se copia ANTES que PROJECT/INFRA, y la guía es la última (R7)', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetBase });

    const indexOf = (basename) =>
      intentions.findIndex(i => i.action === 'copy' && path.basename(i.dest) === basename);

    const briefIdx = indexOf('brief-funcional.md');
    const projectIdx = indexOf('PROJECT-CANVAS.md');
    const infraIdx = indexOf('INFRA-CANVAS.md');
    const guideIdx = indexOf('canvas-planning-guide.md');

    expect(briefIdx).toBeGreaterThanOrEqual(0);
    expect(briefIdx).toBeLessThan(projectIdx);
    expect(projectIdx).toBeLessThan(infraIdx);
    expect(guideIdx).toBe(intentions.length - 1);
  });

  it('usa rutas correctas: template como src, canvas como dest (R1/R7)', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetBase });

    const brief = intentions.find(i => i.action === 'copy' && path.basename(i.dest) === 'brief-funcional.md');
    expect(brief.src).toBe(path.join(fakeTemplatesDir, 'brief-funcional.md'));
    expect(brief.dest).toBe(path.join(fakeTargetBase, 'docs/funky-ai/canvas', 'brief-funcional.md'));

    const guide = intentions.find(i => i.action === 'copy' && path.basename(i.dest) === 'canvas-planning-guide.md');
    expect(guide.src).toBe(path.join(fakeTemplatesDir, 'canvas-planning-guide.md'));
    expect(guide.dest).toBe(path.join(fakeTargetBase, 'docs/funky-ai/canvas', 'canvas-planning-guide.md'));
  });

  it('NO realiza I/O: no toca existsSync/mkdirSync/copyFileSync (R8)', () => {
    runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetBase });

    expect(sharedFsMock.existsSync).not.toHaveBeenCalled();
    expect(sharedFsMock.mkdirSync).not.toHaveBeenCalled();
    expect(sharedFsMock.copyFileSync).not.toHaveBeenCalled();
  });
});
