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

  it('debería persistir PROJECT-CANVAS.md físico cuando se provee canvasConfig', () => {
    const config = {
      pattern: 'Integration Pattern',
      state: 'Test State'
    };

    const result = runInit({ templatesDir, targetBase: tmpDir, canvasConfig: config });

    const canvasPath = path.join(tmpDir, 'PROJECT-CANVAS.md');
    expect(fs.existsSync(canvasPath)).toBe(true);
    
    const content = fs.readFileSync(canvasPath, 'utf8');
    expect(content).toContain('Integration Pattern');
    expect(content).toContain('Test State');
    expect(result.created).toBeGreaterThan(0);
  });
});
