import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { executeIntentions } from '../src/utils/fs-adapter.js';

vi.mock('fs');

describe('fs-adapter executeIntentions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('crea los directorios usando mkdirSync', () => {
    fs.existsSync.mockReturnValue(false);
    
    executeIntentions([{ action: 'mkdir', dest: '/fake/dir' }]);

    expect(fs.mkdirSync).toHaveBeenCalledWith('/fake/dir', { recursive: true });
  });

  it('no hace nada si el directorio ya existe', () => {
    fs.existsSync.mockReturnValue(true);
    
    executeIntentions([{ action: 'mkdir', dest: '/fake/dir' }]);

    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  it('saltea la copia o creación si el destino ya existe (idempotency)', () => {
    fs.existsSync.mockReturnValue(true);

    const result = executeIntentions([
      { action: 'copy', src: '/fake/src.md', dest: '/fake/dest.md' },
      { action: 'create', dest: '/fake/created.md', content: 'test' }
    ]);

    expect(result.skipped).toBe(2);
    expect(result.created).toBe(0);
    expect(fs.copyFileSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('copia archivos si no existen', () => {
    fs.existsSync.mockImplementation((p) => p === '/fake' || p === '/fake/src.md');
    
    const result = executeIntentions([
      { action: 'copy', src: '/fake/src.md', dest: '/fake/dest.md' }
    ]);

    expect(result.created).toBe(1);
    expect(fs.copyFileSync).toHaveBeenCalledWith('/fake/src.md', '/fake/dest.md');
  });

  it('crea archivos si no existen', () => {
    fs.existsSync.mockReturnValue(false);
    
    const result = executeIntentions([
      { action: 'create', dest: '/fake/created.md', content: '<MANDATORY_RELEASE_PROTOCOL> content' }
    ]);

    expect(result.created).toBe(1);
    expect(fs.writeFileSync).toHaveBeenCalledWith('/fake/created.md', '<MANDATORY_RELEASE_PROTOCOL> content', 'utf8');
  });

  it('respeta la opción dryRun', () => {
    fs.existsSync.mockReturnValue(false);

    const result = executeIntentions([
      { action: 'mkdir', dest: '/fake/dir' },
      { action: 'copy', src: '/fake/src.md', dest: '/fake/dest.md' },
      { action: 'create', dest: '/fake/created.md', content: 'content' }
    ], { dryRun: true });

    expect(result.created).toBe(2);
    expect(fs.mkdirSync).not.toHaveBeenCalled();
    expect(fs.copyFileSync).not.toHaveBeenCalled();
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
