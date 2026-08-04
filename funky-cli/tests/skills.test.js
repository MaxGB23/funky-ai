import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

vi.mock('fs', () => ({ default: {} }));

import { runSkills } from '../src/commands/skills.js';

describe('runSkills()', () => {
  const fakeTemplatesDir = '/fake/templates';
  const fakeTargetDir = '/fake/project';

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('arma 4 intentions de copia: 2 skills + 2 docs compartidos, sin I/O', () => {
    const intentions = runSkills({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    const templatesPrefix = path.resolve(fakeTemplatesDir) + path.sep;
    const targetPrefix = path.resolve(fakeTargetDir) + path.sep;

    expect(intentions).toHaveLength(4);
    for (const intention of intentions) {
      expect(intention.action).toBe('copy');
      expect(path.resolve(intention.src).startsWith(templatesPrefix)).toBe(true);
      expect(path.resolve(intention.dest).startsWith(targetPrefix)).toBe(true);
    }
  });

  it('subconjunto .agents/skills/: 2 skills con src/dest exactos (R-SK-1, D5)', () => {
    const intentions = runSkills({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    const skills = intentions.filter(i => String(i.dest).includes(path.join('.agents', 'skills')));
    expect(skills).toHaveLength(2);

    expect(skills).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'gentle/skills/sdd-release/SKILL.md'),
      dest: path.join(fakeTargetDir, '.agents/skills/sdd-release/SKILL.md'),
    });
    expect(skills).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'gentle/skills/sdd-docs-sync/SKILL.md'),
      dest: path.join(fakeTargetDir, '.agents/skills/sdd-docs-sync/SKILL.md'),
    });
  });

  it('docs compartidos: src bajo bootstrap/sdd/ y dest bajo .agents/templates/sdd/ (R-SK-4)', () => {
    const intentions = runSkills({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    const docs = intentions.filter(i => String(i.dest).includes(path.join('.agents', 'templates', 'sdd')));
    expect(docs).toHaveLength(2);

    expect(docs).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'bootstrap/sdd/docs-live-index.md'),
      dest: path.join(fakeTargetDir, '.agents/templates/sdd/docs-live-index.md'),
    });
    expect(docs).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'bootstrap/sdd/docs-index/template.md'),
      dest: path.join(fakeTargetDir, '.agents/templates/sdd/docs-index/template.md'),
    });
  });

  it('ninguna intención referencia goldens de .agents/ del repo como fuente (R-SK-2)', () => {
    const intentions = runSkills({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    const templatesPrefix = path.resolve(fakeTemplatesDir) + path.sep;
    for (const intention of intentions) {
      expect(intention.src).not.toContain('.agents');
      expect(path.resolve(intention.src).startsWith(templatesPrefix)).toBe(true);
    }
  });
});
