import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

import { runSkills, discoverSkills } from '../src/commands/skills.js';
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
      src: path.join(fakeSrcDir, 'templates/bootstrap/sdd/docs-index/_indice-seccional-template.md'),
      dest: path.join(fakeTargetDir, '.agents/templates/sdd/docs-index/_indice-seccional-template.md'),
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

  it('runSkills filtra por selectedSkills: solo la skill elegida, sin I/O (R-SK-1, D3)', () => {
    const intentions = runSkills({
      srcDir: fakeSrcDir,
      targetBase: fakeTargetDir,
      selectedSkills: ['sdd-release'],
    });

    expect(intentions).toHaveLength(2);
    const dests = intentions.map(i => String(i.dest).replace(/\\/g, '/'));
    expect(dests[0]).toContain('.agents/skills/sdd-release/SKILL.md');
    expect(dests[1]).toContain('.agents/templates/sdd/release-notes.md');
  });

  it('runSkills sin selectedSkills inyecta todas las skills (default, R-SK-7)', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir });

    expect(intentions).toHaveLength(5);
    expect(String(intentions[0].src)).toContain(path.join('skills', 'sdd-docs-sync', 'SKILL.md'));
    expect(String(intentions[3].src)).toContain(path.join('skills', 'sdd-release', 'SKILL.md'));
  });

  it('orden determinista: sort por skill (docs-sync antes de release), luego orden del manifest (D3)', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir });

    const srcParts = intentions.map(i => String(i.src).replace(/\\/g, '/'));
    expect(srcParts[0]).toContain('skills/sdd-docs-sync/SKILL.md');
    expect(srcParts[1]).toContain('templates/bootstrap/sdd/docs-live-index.md');
    expect(srcParts[2]).toContain('templates/bootstrap/sdd/docs-index/_indice-seccional-template.md');
    expect(srcParts[3]).toContain('skills/sdd-release/SKILL.md');
    expect(srcParts[4]).toContain('templates/bootstrap/sdd/release-notes.md');
  });

  it('discoverSkills: dirs con SKILL.md, sort estable, excluye dirs sin SKILL.md (R-SK-7)', () => {
    const fakeSrc = path.join(process.cwd(), '..', '.tmp', 'discover-fixture');
    fs.rmSync(fakeSrc, { recursive: true, force: true });
    const skillsDir = path.join(fakeSrc, 'skills');

    fs.mkdirSync(path.join(skillsDir, 'z-skill'), { recursive: true });
    fs.writeFileSync(path.join(skillsDir, 'z-skill', 'SKILL.md'), '# z');
    fs.mkdirSync(path.join(skillsDir, 'a-no-skill'), { recursive: true }); // sin SKILL.md → excluido
    fs.mkdirSync(path.join(skillsDir, 'm-skill'), { recursive: true });
    fs.writeFileSync(path.join(skillsDir, 'm-skill', 'SKILL.md'), '# m');

    try {
      expect(discoverSkills(fakeSrc)).toEqual(['m-skill', 'z-skill']);
    } finally {
      fs.rmSync(fakeSrc, { recursive: true, force: true });
    }
  });
});
