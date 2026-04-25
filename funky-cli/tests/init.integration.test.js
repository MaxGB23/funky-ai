import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runInit } from '../src/commands/init.js';

describe('runInit() Integration', () => {
  const tmpDir = path.join(process.cwd(), 'tmp-integration');
  const templatesDir = path.join(process.cwd(), 'src/templates/bootstrap');

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

  it('debería persistir los CANVAS físicos cuando se provee canvasConfig', () => {
    const config = {
      projectData: { pattern: 'Integration Pattern' },
      infraData: { db: 'Test DB' }
    };

    const result = runInit({ templatesDir, targetBase: tmpDir, canvasConfig: config });

    const canvasPath = path.join(tmpDir, 'PROJECT-CANVAS.md');
    expect(fs.existsSync(canvasPath)).toBe(true);
    
    const content = fs.readFileSync(canvasPath, 'utf8');
    expect(content).toContain('Integration Pattern');
    expect(result.created).toBeGreaterThan(0);
  });

  it('debería copiar la plantilla canónica worker-handoff al nuevo workspace', () => {
    const workerHandoffPath = path.join(tmpDir, 'docs', 'funky-ai', 'workers', 'plantilla-worker-handoff.md');
    expect(fs.existsSync(workerHandoffPath)).toBe(true);
    const content = fs.readFileSync(workerHandoffPath, 'utf8');
    expect(content).toContain('Worker Handoff');
  });

  it('NO debería sobreescribir PROJECT-CANVAS.md si tiene skipProjectCanvas', () => {
    const canvasPath = path.join(tmpDir, 'PROJECT-CANVAS.md');
    fs.writeFileSync(canvasPath, 'CONTENIDO ORIGINAL DEL USUARIO');
    
    const config = { skipProjectCanvas: true, skipInfraCanvas: true };

    const result = runInit({ templatesDir, targetBase: tmpDir, canvasConfig: config });

    const content = fs.readFileSync(canvasPath, 'utf8');
    expect(content).toBe('CONTENIDO ORIGINAL DEL USUARIO');
    expect(result.skipped).toBeGreaterThan(0);
  });
});
