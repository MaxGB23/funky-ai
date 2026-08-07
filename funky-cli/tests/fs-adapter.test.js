import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { executeIntentions, executeIntentionsSync, existingGuides } from '../src/utils/fs-adapter.js';

vi.mock('fs');

describe('fs-adapter executeIntentions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('crea los directorios usando mkdirSync', async () => {
    fs.existsSync.mockReturnValue(false);

    await executeIntentions([{ action: 'mkdir', dest: '/fake/dir' }]);

    expect(fs.mkdirSync).toHaveBeenCalledWith('/fake/dir', { recursive: true });
  });

  it('no hace nada si el directorio ya existe', async () => {
    fs.existsSync.mockReturnValue(true);

    await executeIntentions([{ action: 'mkdir', dest: '/fake/dir' }]);

    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it('saltea la copia o creación si el destino ya existe (idempotency)', async () => {
    fs.existsSync.mockReturnValue(true);

    const result = await executeIntentions([
      { action: 'copy', src: '/fake/src.md', dest: '/fake/dest.md' },
      { action: 'create', dest: '/fake/created.md', content: 'test' }
    ]);

    expect(result.skipped).toBe(2);
    expect(result.created).toBe(0);
    expect(fs.copyFileSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('copia archivos si no existen', async () => {
    fs.existsSync.mockImplementation((p) => p === '/fake' || p === '/fake/src.md');

    const result = await executeIntentions([
      { action: 'copy', src: '/fake/src.md', dest: '/fake/dest.md' }
    ]);

    expect(result.created).toBe(1);
    expect(fs.copyFileSync).toHaveBeenCalledWith('/fake/src.md', '/fake/dest.md');
  });

  it('crea archivos si no existen', async () => {
    fs.existsSync.mockReturnValue(false);

    const result = await executeIntentions([
      { action: 'create', dest: '/fake/created.md', content: '<MANDATORY_RELEASE_PROTOCOL> content' }
    ]);

    expect(result.created).toBe(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith('/fake/created.md', '<MANDATORY_RELEASE_PROTOCOL> content', 'utf8');
  });

  it('saltea el copy si src opcional no existe (R-SK-3: nunca crashea)', async () => {
    fs.existsSync.mockImplementation((p) => p === '/fake');

    const result = await executeIntentions([
      { action: 'copy', src: '/fake/src.md', dest: '/fake/dest.md', optional: true }
    ]);

    expect(result.created).toBe(0);
    expect(result.skipped).toBe(1);
    expect(fs.copyFileSync).not.toHaveBeenCalled();
  });

  it('respeta la opción dryRun', async () => {
    fs.existsSync.mockReturnValue(false);

    const result = await executeIntentions([
      { action: 'mkdir', dest: '/fake/dir' },
      { action: 'copy', src: '/fake/src.md', dest: '/fake/dest.md' },
      { action: 'create', dest: '/fake/created.md', content: 'content' }
    ], { dryRun: true });

    expect(result.created).toBe(2);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.copyFileSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('usa "Omitiendo" (no "Salteando") en los logs de skip e incluye el basename (2.8)', async () => {
    fs.existsSync.mockReturnValue(true);

    const result = await executeIntentions([
      { action: 'copy', src: '/fake/src.md', dest: '/fake/dest.md' }
    ]);

    expect(result.logs[0]).toContain('Omitiendo');
    expect(result.logs[0]).toContain('dest.md');
    expect(result.logs[0]).not.toContain('Salteando');
  });

  describe('kind: guide — feedback Y/N sobre archivos existentes (2.3)', () => {
    it('dest existe + askConfirm true → sobrescribe (Actualizada) y cuenta como creado', async () => {
      fs.existsSync.mockReturnValue(true);
      const askConfirm = vi.fn().mockResolvedValue(true);

      const result = await executeIntentions(
        [{ action: 'copy', kind: 'guide', src: '/fake/guide.md', dest: '/fake/guide.md' }],
        { askConfirm }
      );

      expect(askConfirm).toHaveBeenCalledWith('/fake/guide.md', 'guide.md');
      expect(fs.copyFileSync).toHaveBeenCalledWith('/fake/guide.md', '/fake/guide.md');
      expect(result.created).toBe(1);
      expect(result.logs[0]).toContain('Actualizada');
    });

    it('dest existe + askConfirm false → NO sobrescribe (decisión válida, skip)', async () => {
      fs.existsSync.mockReturnValue(true);
      const askConfirm = vi.fn().mockResolvedValue(false);

      const result = await executeIntentions(
        [{ action: 'copy', kind: 'guide', src: '/fake/guide.md', dest: '/fake/guide.md' }],
        { askConfirm }
      );

      expect(fs.copyFileSync).not.toHaveBeenCalled();
      expect(result.skipped).toBe(1);
      expect(result.logs[0]).toContain('Omitiendo');
    });

    it('dest existe + sin askConfirm → skip por defecto (n), no sobrescribe (2.6)', async () => {
      fs.existsSync.mockReturnValue(true);

      const result = await executeIntentions([
        { action: 'copy', kind: 'guide', src: '/fake/guide.md', dest: '/fake/guide.md' }
      ]);

      expect(fs.copyFileSync).not.toHaveBeenCalled();
      expect(result.skipped).toBe(1);
      expect(result.logs[0]).toContain('Omitiendo');
    });

    it('askConfirm puede ser síncrono (booleano directo)', async () => {
      fs.existsSync.mockReturnValue(true);

      const result = await executeIntentions(
        [{ action: 'copy', kind: 'guide', src: '/fake/guide.md', dest: '/fake/guide.md' }],
        { askConfirm: () => true }
      );

      expect(result.created).toBe(1);
      expect(fs.copyFileSync).toHaveBeenCalled();
    });

    it('dest NO existe → crea normal sin consultar askConfirm', async () => {
      fs.existsSync.mockImplementation((p) => p === '/fake');
      const askConfirm = vi.fn();

      const result = await executeIntentions(
        [{ action: 'copy', kind: 'guide', src: '/fake/guide.md', dest: '/fake/dest.md' }],
        { askConfirm }
      );

      expect(askConfirm).not.toHaveBeenCalled();
      expect(fs.copyFileSync).toHaveBeenCalledWith('/fake/guide.md', '/fake/dest.md');
      expect(result.created).toBe(1);
    });
  });

  describe('kind: decision — nunca sobrescribir, solo recomendación (2.4)', () => {
    it('dest existe → skip + log de recomendación (eliminar/mover/backup), sin copiar', async () => {
      fs.existsSync.mockReturnValue(true);

      const result = await executeIntentions([
        { action: 'copy', kind: 'decision', src: '/fake/brief.md', dest: '/fake/brief.md' }
      ]);

      expect(fs.copyFileSync).not.toHaveBeenCalled();
      expect(result.skipped).toBe(1);
      expect(result.logs[0]).toContain('Omitiendo');
      expect(result.logs[0]).toContain('brief.md');
      expect(result.logs[0]).toContain('elimínalo');
      expect(result.logs[0]).toContain('backup');
    });

    it('dest NO existe → crea normal', async () => {
      fs.existsSync.mockReturnValue(false);

      const result = await executeIntentions([
        { action: 'copy', kind: 'decision', src: '/fake/brief.md', dest: '/fake/brief.md' }
      ]);

      expect(result.created).toBe(1);
      expect(fs.copyFileSync).toHaveBeenCalled();
    });

    it('nunca consulta askConfirm aunque exista dest (las decisiones no se preguntan)', async () => {
      fs.existsSync.mockReturnValue(true);
      const askConfirm = vi.fn();

      await executeIntentions(
        [{ action: 'copy', kind: 'decision', src: '/fake/brief.md', dest: '/fake/brief.md' }],
        { askConfirm }
      );

      expect(askConfirm).not.toHaveBeenCalled();
    });
  });

  describe('executeIntentionsSync — ejecución síncrona (Fase 0 estimate)', () => {
    it('procesa el plan de forma síncrona (devuelve resultado, no una Promise) y crea (0.2)', () => {
      fs.existsSync.mockReturnValue(false);

      const result = executeIntentionsSync([
        { action: 'create', dest: '/fake/created.md', content: 'contenido' }
      ]);

      expect(result).not.toBeInstanceOf(Promise);
      expect(result.created).toBe(1);
      expect(result.skipped).toBe(0);
      expect(Array.isArray(result.logs)).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith('/fake/created.md', 'contenido', 'utf8');
    });

    it('kind decision existente → skip + mensaje completo de backup, sin escribir (0.2)', () => {
      fs.existsSync.mockReturnValue(true);

      const result = executeIntentionsSync([
        { action: 'create', kind: 'decision', dest: '/fake/decisions.md', content: 'x' }
      ]);

      expect(result.skipped).toBe(1);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
      expect(result.logs[0]).toContain('Contiene decisiones del proyecto');
      expect(result.logs[0]).toContain('elimínalo o muévelo de ubicación');
    });

    it('kind guide existente → default n (skip logueado), no sobrescribe', () => {
      fs.existsSync.mockReturnValue(true);

      const result = executeIntentionsSync([
        { action: 'copy', kind: 'guide', src: '/fake/guide.md', dest: '/fake/guide.md' }
      ]);

      expect(result.skipped).toBe(1);
      expect(fs.copyFileSync).not.toHaveBeenCalled();
      expect(result.logs[0]).toContain('Omitiendo');
    });

    it('respeta la opción dryRun', () => {
      fs.existsSync.mockReturnValue(false);

      const result = executeIntentionsSync([
        { action: 'create', dest: '/fake/created.md', content: 'x' }
      ], { dryRun: true });

      expect(result.created).toBe(1);
      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });
  });

  describe('existingGuides — guías reales del plan de intenciones (Fase 0, 0.3)', () => {
    it('devuelve solo los dest de kind guide que ya existen en el filesystem', () => {
      fs.existsSync.mockImplementation((p) => String(p).endsWith('guide-existente.md'));

      const guides = existingGuides([
        { action: 'copy', kind: 'guide', src: '/g/s.md', dest: '/g/guide-existente.md' },
        { action: 'copy', kind: 'guide', src: '/g/s.md', dest: '/g/guide-faltante.md' },
        { action: 'copy', kind: 'decision', src: '/g/s.md', dest: '/g/decision.md' },
        { action: 'create', content: 'x', dest: '/g/derivado.md' },
        { action: 'mkdir', dest: '/g' }
      ]);

      expect(guides).toEqual(['/g/guide-existente.md']);
    });

    it('devuelve [] cuando ninguna guía existe', () => {
      fs.existsSync.mockReturnValue(false);

      expect(existingGuides([{ action: 'copy', kind: 'guide', dest: '/g/x.md' }])).toEqual([]);
    });
  });
});
