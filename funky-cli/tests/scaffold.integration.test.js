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

  it('debería interpolar {{project_name}} con el nombre del package.json en el README generado', () => {
    const targetDir = path.join(process.cwd(), 'tmp-integration-pkgname');
    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(path.join(targetDir, 'package.json'), JSON.stringify({ name: 'mi-proyecto-ejemplo' }));

    try {
      const intentions = runScaffold({ templatesDir, targetBase: targetDir });
      const result = executeIntentions(intentions);
      expect(result.created).toBeGreaterThan(0);

      const readmePath = path.join(targetDir, 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
      const content = fs.readFileSync(readmePath, 'utf8');
      expect(content).toContain('mi-proyecto-ejemplo');
      expect(content).not.toContain('{{project_name}}');
    } finally {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
  });

  it('debería usar basename(targetBase) como fallback cuando no hay package.json', () => {
    const targetDir = path.join(process.cwd(), 'tmp-integration-basename');
    fs.mkdirSync(targetDir, { recursive: true });

    try {
      const intentions = runScaffold({ templatesDir, targetBase: targetDir });
      const result = executeIntentions(intentions);
      expect(result.created).toBeGreaterThan(0);

      const readmePath = path.join(targetDir, 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
      const content = fs.readFileSync(readmePath, 'utf8');
      expect(content).toContain('tmp-integration-basename');
      expect(content).not.toContain('{{project_name}}');
    } finally {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
  });
});
