import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

import { runSkills, discoverSkills } from '../src/commands/skills.js';
import sddReleaseManifest from '../src/skills/sdd-release/manifest.js';
import sddDocsSyncManifest from '../src/skills/sdd-docs-sync/manifest.js';

const MANIFESTS = [sddDocsSyncManifest, sddReleaseManifest];

describe('runSkills()', () => {
  const fakeSrcDir = '/fake/src';
  const fakeTargetDir = '/fake/project';

  it('arma 5 intentions de copia desde srcDir (2 skills + 2 docs compartidos + release-notes), sin I/O', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir, manifests: MANIFESTS });

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
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir, manifests: MANIFESTS });

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
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir, manifests: MANIFESTS });

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

  it('ninguna intenciÃ³n referencia goldens de .agents/ del repo como fuente (R-SK-2)', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir, manifests: MANIFESTS });

    const srcPrefix = path.resolve(fakeSrcDir) + path.sep;
    for (const intention of intentions) {
      expect(intention.src).not.toContain('.agents');
      expect(path.resolve(intention.src).startsWith(srcPrefix)).toBe(true);
    }
  });


  it('runSkills filtra por selectedSkills: solo la skill elegida, sin I/O (R-SK-1, D3)', () => {
    const intentions = runSkills({
      srcDir: fakeSrcDir,
      targetBase: fakeTargetDir,
      selectedSkills: ['sdd-release'],
      manifests: MANIFESTS,
    });

    expect(intentions).toHaveLength(2);
    const dests = intentions.map(i => String(i.dest).replace(/\\/g, '/'));
    expect(dests[0]).toContain('.agents/skills/sdd-release/SKILL.md');
    expect(dests[1]).toContain('.agents/templates/sdd/release-notes.md');
  });

  it('skill nueva: su propio manifest produce sus intenciones (R-SK-8, sin hardcode)', () => {
    const pruebaManifest = [{ src: 'skills/prueba/SKILL.md', dest: '.agents/skills/prueba/SKILL.md' }];
    const intentions = runSkills({
      srcDir: fakeSrcDir,
      targetBase: fakeTargetDir,
      selectedSkills: ['prueba'],
      manifests: [pruebaManifest],
    });

    expect(intentions).toEqual([
      {
        action: 'copy',
        src: path.join(fakeSrcDir, 'skills/prueba/SKILL.md'),
        dest: path.join(fakeTargetDir, '.agents/skills/prueba/SKILL.md'),
      },
    ]);
  });

  it('runSkills sin selectedSkills inyecta todas las skills (default, R-SK-7)', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir, manifests: MANIFESTS });

    expect(intentions).toHaveLength(5);
    expect(String(intentions[0].src)).toContain(path.join('skills', 'sdd-docs-sync', 'SKILL.md'));
    expect(String(intentions[3].src)).toContain(path.join('skills', 'sdd-release', 'SKILL.md'));
  });

  it('orden determinista: sort por skill (docs-sync antes de release), luego orden del manifest (D3)', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir, manifests: MANIFESTS });

    const srcParts = intentions.map(i => String(i.src).replace(/\\/g, '/'));
    expect(srcParts[0]).toContain('skills/sdd-docs-sync/SKILL.md');
    expect(srcParts[1]).toContain('templates/bootstrap/sdd/docs-live-index.md');
    expect(srcParts[2]).toContain('templates/bootstrap/sdd/docs-index/_indice-seccional-template.md');
    expect(srcParts[3]).toContain('skills/sdd-release/SKILL.md');
    expect(srcParts[4]).toContain('templates/bootstrap/sdd/release-notes.md');
  });

  it('discoverSkills: dirs con SKILL.md + manifest.js, sort estable, excluye el resto (R-SK-7/R-SK-8)', () => {
    const fakeSrc = path.join(process.cwd(), '..', '.tmp', 'discover-fixture');
    fs.rmSync(fakeSrc, { recursive: true, force: true });
    const skillsDir = path.join(fakeSrc, 'skills');

    fs.mkdirSync(path.join(skillsDir, 'z-skill'), { recursive: true });
    fs.writeFileSync(path.join(skillsDir, 'z-skill', 'SKILL.md'), '# z');
    fs.writeFileSync(path.join(skillsDir, 'z-skill', 'manifest.js'), 'export default [];');
    fs.mkdirSync(path.join(skillsDir, 'a-no-skill'), { recursive: true }); // sin SKILL.md â†’ excluido
    fs.mkdirSync(path.join(skillsDir, 'p-no-manifest'), { recursive: true }); // SKILL.md sin manifest.js â†’ excluido
    fs.writeFileSync(path.join(skillsDir, 'p-no-manifest', 'SKILL.md'), '# p');
    fs.mkdirSync(path.join(skillsDir, 'l-lowercase'), { recursive: true }); // skill.md minÃºscula â†’ excluido (NTFS)
    fs.writeFileSync(path.join(skillsDir, 'l-lowercase', 'skill.md'), '# l');
    fs.writeFileSync(path.join(skillsDir, 'l-lowercase', 'manifest.js'), 'export default [];');
    fs.mkdirSync(path.join(skillsDir, 'm-skill'), { recursive: true });
    fs.writeFileSync(path.join(skillsDir, 'm-skill', 'SKILL.md'), '# m');
    fs.writeFileSync(path.join(skillsDir, 'm-skill', 'manifest.js'), 'export default [];');

    try {
      expect(discoverSkills(fakeSrc)).toEqual(['m-skill', 'z-skill']);
    } finally {
      fs.rmSync(fakeSrc, { recursive: true, force: true });
    }
  });
});

