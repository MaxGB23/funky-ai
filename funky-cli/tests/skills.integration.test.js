import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runSkills } from '../src/commands/skills.js';
import { executeIntentions } from '../src/utils/fs-adapter.js';

describe('runSkills() Integration', () => {
  const srcDir = path.join(process.cwd(), 'src');
  const harnessRoot = path.resolve(process.cwd(), '..', '.tmp');
  const tmpDir = path.join(harnessRoot, 'skills-integration');

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

  const skillDests = [
    path.join(tmpDir, '.agents/skills/sdd-release/SKILL.md'),
    path.join(tmpDir, '.agents/skills/sdd-docs-sync/SKILL.md'),
    path.join(tmpDir, '.agents/templates/sdd/docs-live-index.md'),
    path.join(tmpDir, '.agents/templates/sdd/docs-index/template.md'),
    path.join(tmpDir, '.agents/templates/sdd/release-notes.md'),
  ];

  it('1ª ejecución: crea los 5 archivos (2 skills + 2 docs compartidos + release-notes)', () => {
    const intentions = runSkills({ srcDir, targetBase: tmpDir });
    const result = executeIntentions(intentions);

    expect(result.created).toBe(5);
    expect(result.skipped).toBe(0);

    for (const dest of skillDests) {
      expect(fs.existsSync(dest)).toBe(true);
    }
  });

  it('2ª ejecución: salteados y no sobrescribe custom rules (R-SK-3)', () => {
    const customPath = path.join(tmpDir, '.agents/skills/sdd-release/SKILL.md');
    const custom = '# Custom rules del proyecto\n';
    fs.writeFileSync(customPath, custom, 'utf8');

    const intentions = runSkills({ srcDir, targetBase: tmpDir });
    const result = executeIntentions(intentions);

    expect(result.created).toBe(0);
    expect(result.skipped).toBe(5);
    expect(fs.readFileSync(customPath, 'utf8')).toBe(custom);
  });

  it('estado parcial: skill faltante se crea, el resto se salta (R-SK-3 edge)', () => {
    const missingPath = path.join(tmpDir, '.agents/skills/sdd-docs-sync/SKILL.md');
    fs.rmSync(missingPath, { recursive: true, force: true });

    const intentions = runSkills({ srcDir, targetBase: tmpDir });
    const result = executeIntentions(intentions);

    expect(result.created).toBe(1);
    expect(result.skipped).toBe(4);
    expect(fs.existsSync(missingPath)).toBe(true);
  });

  it('docs fresh: docs-live-index.md bytes == template distribuido (R-SK-4)', () => {
    const livePath = path.join(tmpDir, '.agents/templates/sdd/docs-live-index.md');
    const templatePath = path.join(srcDir, 'templates/bootstrap/sdd/docs-live-index.md');

    const actual = fs.readFileSync(livePath, 'utf8');
    const template = fs.readFileSync(templatePath, 'utf8');

    expect(actual).toBe(template);
    expect(actual).toContain('<ruta-del-doc>');
  });
});
