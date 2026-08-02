import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runScaffold } from '../src/commands/scaffold.js';
import { executeIntentions } from '../src/utils/fs-adapter.js';

describe('runScaffold() Integration', () => {
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

  it('NO debería copiar PROJECT-CANVAS.md desde bootstrap (va a docs/funky-ai/canvas/ via init command)', () => {
    const intentions = runScaffold({ templatesDir, targetBase: tmpDir });
    const result = executeIntentions(intentions);

    const canvasPath = path.join(tmpDir, 'PROJECT-CANVAS.md');
    expect(fs.existsSync(canvasPath)).toBe(false);
    expect(result.created).toBeGreaterThan(0);
  });

  it('debería copiar ORCHESTRATOR-STATE.md como root file', () => {
    const intentions = runScaffold({ templatesDir, targetBase: tmpDir });
    const result = executeIntentions(intentions);

    const statePath = path.join(tmpDir, 'ORCHESTRATOR-STATE.md');
    expect(fs.existsSync(statePath)).toBe(true);
    expect(result.created + result.skipped).toBeGreaterThan(0);
  });

  it('NO debería copiar la plantilla canónica worker-handoff al nuevo workspace', () => {
    const intentions = runScaffold({ templatesDir, targetBase: tmpDir });
    executeIntentions(intentions);

    const workerHandoffPath = path.join(tmpDir, 'docs', 'funky-ai', 'workers', 'plantilla-worker-handoff.md');
    expect(fs.existsSync(workerHandoffPath)).toBe(false);
  });

  it('NO debería sobreescribir ORCHESTRATOR-STATE.md si ya existe', () => {
    const statePath = path.join(tmpDir, 'ORCHESTRATOR-STATE.md');
    fs.writeFileSync(statePath, 'CONTENIDO ORIGINAL DEL USUARIO');

    const intentions = runScaffold({ templatesDir, targetBase: tmpDir });
    const result = executeIntentions(intentions);

    const content = fs.readFileSync(statePath, 'utf8');
    expect(content).toBe('CONTENIDO ORIGINAL DEL USUARIO');
    expect(result.skipped).toBeGreaterThan(0);
  });
});
