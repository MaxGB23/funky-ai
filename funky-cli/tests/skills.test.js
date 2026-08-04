import { describe, it, expect } from 'vitest';
import path from 'path';

import { runSkills } from '../src/commands/skills.js';
import { runScaffold } from '../src/commands/scaffold.js';

describe('runSkills()', () => {
  const fakeSrcDir = '/fake/src';
  const fakeTargetDir = '/fake/project';

  it('arma 5 intentions de copia desde srcDir (2 skills + 2 docs compartidos + release-notes), sin I/O', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir });

    const srcPrefix = path.resolve(fakeSrcDir) + path.sep;
    const targetPrefix = path.resolve(fakeTargetDir) + path.sep;

    expect(intentions).toHaveLength(5);
    for (const intention of intentions) {
      expect(intention.action).toBe('copy');
      expect(path.resolve(intention.src).startsWith(srcPrefix)).toBe(true);
      expect(path.resolve(intention.dest).startsWith(targetPrefix)).toBe(true);
    }
  });

  it('subconjunto .agents/skills/: 2 skills con src/dest exactos contra srcDir (R-SK-1)', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir });

    const skills = intentions.filter(i => String(i.dest).includes(path.join('.agents', 'skills')));
    expect(skills).toHaveLength(2);

    expect(skills).toContainEqual({
      action: 'copy',
      src: path.join(fakeSrcDir, 'skills/sdd-release/SKILL.md'),
      dest: path.join(fakeTargetDir, '.agents/skills/sdd-release/SKILL.md'),
    });
    expect(skills).toContainEqual({
      action: 'copy',
      src: path.join(fakeSrcDir, 'skills/sdd-docs-sync/SKILL.md'),
      dest: path.join(fakeTargetDir, '.agents/skills/sdd-docs-sync/SKILL.md'),
    });
  });

  it('docs compartidos: src bajo srcDir/templates/bootstrap/sdd y dest bajo .agents/templates/sdd (R-SK-4)', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir });

    const docs = intentions.filter(i => String(i.dest).includes(path.join('.agents', 'templates', 'sdd')));
    expect(docs).toHaveLength(3);

    expect(docs).toContainEqual({
      action: 'copy',
      src: path.join(fakeSrcDir, 'templates/bootstrap/sdd/docs-live-index.md'),
      dest: path.join(fakeTargetDir, '.agents/templates/sdd/docs-live-index.md'),
    });
    expect(docs).toContainEqual({
      action: 'copy',
      src: path.join(fakeSrcDir, 'templates/bootstrap/sdd/docs-index/template.md'),
      dest: path.join(fakeTargetDir, '.agents/templates/sdd/docs-index/template.md'),
    });
    expect(docs).toContainEqual({
      action: 'copy',
      src: path.join(fakeSrcDir, 'templates/bootstrap/sdd/release-notes.md'),
      dest: path.join(fakeTargetDir, '.agents/templates/sdd/release-notes.md'),
      optional: true,
    });
  });

  it('ninguna intención referencia goldens de .agents/ del repo como fuente (R-SK-2)', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir });

    const srcPrefix = path.resolve(fakeSrcDir) + path.sep;
    for (const intention of intentions) {
      expect(intention.src).not.toContain('.agents');
      expect(path.resolve(intention.src).startsWith(srcPrefix)).toBe(true);
    }
  });

  it('paridad R-SK-5: runSkills y runScaffold copian docs-live-index.md desde el MISMO template', () => {
    const srcRoot = path.join(process.cwd(), 'src');
    const bootstrapDir = path.join(srcRoot, 'templates/bootstrap');
    const targetBase = '/fake/project';

    const skillsLive = runSkills({ srcDir: srcRoot, targetBase }).find(i =>
      String(i.dest).replace(/\\/g, '/').endsWith('docs-live-index.md')
    );
    const scaffoldLive = runScaffold({ templatesDir: bootstrapDir, targetBase }).find(i =>
      String(i.dest).replace(/\\/g, '/').endsWith('docs-live-index.md')
    );

    expect(skillsLive).toBeTruthy();
    expect(scaffoldLive).toBeTruthy();
    expect(scaffoldLive.action).toBe('copy');
    expect(path.resolve(skillsLive.src)).toBe(path.resolve(scaffoldLive.src));
  });
});
