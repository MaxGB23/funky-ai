import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { runSkills } from '../src/commands/skills.js';
import { executeIntentions } from '../src/utils/fs-adapter.js';
import sddReleaseManifest from '../src/skills/sdd-release/manifest.js';
import sddDocsSyncManifest from '../src/skills/sdd-docs-sync/manifest.js';

const MANIFESTS = [sddDocsSyncManifest, sddReleaseManifest];

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
    path.join(tmpDir, '.agents/templates/sdd/docs-index/_indice-seccional-template.md'),
    path.join(tmpDir, '.agents/templates/sdd/release-notes.md'),
  ];

  it('1ª ejecución: crea los 5 archivos (2 skills + 2 docs compartidos + release-notes)', async () => {
    const intentions = runSkills({ srcDir, targetBase: tmpDir, manifests: MANIFESTS });
    const result = await executeIntentions(intentions);

    expect(result.created).toBe(5);
    expect(result.skipped).toBe(0);

    for (const dest of skillDests) {
      expect(fs.existsSync(dest)).toBe(true);
    }
  });

  it('2ª ejecución: salteados y no sobrescribe custom rules (R-SK-3)', async () => {
    const customPath = path.join(tmpDir, '.agents/skills/sdd-release/SKILL.md');
    const custom = '# Custom rules del proyecto\n';
    fs.writeFileSync(customPath, custom, 'utf8');

    const intentions = runSkills({ srcDir, targetBase: tmpDir, manifests: MANIFESTS });
    const result = await executeIntentions(intentions);

    expect(result.created).toBe(0);
    expect(result.skipped).toBe(5);
    expect(fs.readFileSync(customPath, 'utf8')).toBe(custom);
  });

  it('estado parcial: skill faltante se crea, el resto se salta (R-SK-3 edge)', async () => {
    const missingPath = path.join(tmpDir, '.agents/skills/sdd-docs-sync/SKILL.md');
    fs.rmSync(missingPath, { recursive: true, force: true });

    const intentions = runSkills({ srcDir, targetBase: tmpDir, manifests: MANIFESTS });
    const result = await executeIntentions(intentions);

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

  it('docs fresh: índice seccional bytes == template distribuido por scaffold (R-SK-5)', () => {
    const livePath = path.join(tmpDir, '.agents/templates/sdd/docs-index/_indice-seccional-template.md');
    const templatePath = path.join(srcDir, 'templates/bootstrap/sdd/docs-index/_indice-seccional-template.md');

    const actual = fs.readFileSync(livePath, 'utf8');
    const template = fs.readFileSync(templatePath, 'utf8');

    expect(actual).toBe(template);
    expect(actual).toContain('Índice de Secciones');
  });

  it('R-SK-9: 0 referencias al nombre viejo del índice seccional en src/ y tests/', () => {
    const roots = [path.join(process.cwd(), 'src'), path.join(process.cwd(), 'tests')];
    const hits = [];
    const oldIndexName = 'docs-index/' + 'template.md';
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.isFile() && /\.(js|md)$/.test(entry.name)) {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes(oldIndexName)) hits.push(full);
        }
      }
    };
    for (const root of roots) walk(root);
    expect(hits).toEqual([]);
  });
});

