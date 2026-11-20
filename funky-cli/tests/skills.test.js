import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

import { runSkills, discoverSkills } from '../src/commands/skills.js';
import releaseManifest from '../src/skills/release/manifest.js';
import docsSyncManifest from '../src/skills/docs-sync/manifest.js';

const MANIFESTS = [docsSyncManifest, releaseManifest];

const SKILLS_SRC = fileURLToPath(new URL('../src/skills', import.meta.url));

/**
 * Archivos de una skill, recursivo, relativo a su carpeta y con separador `/`
 * (el mismo formato que usa `src` en cada manifest).
 * @param {string} skillDir
 * @returns {string[]}
 */
function skillFiles(skillDir) {
  const found = [];
  const walk = (dir, prefix) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(path.join(dir, entry.name), rel);
      else found.push(rel);
    }
  };
  walk(skillDir, '');
  return found.sort();
}

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
      src: path.join(fakeSrcDir, 'skills/release/SKILL.md'),
      dest: path.join(fakeTargetDir, '.agents/skills/release/SKILL.md'),
      label: '.agents/skills/release/SKILL.md',
      skill: 'release',
    });
    expect(skills).toContainEqual({
      action: 'copy',
      src: path.join(fakeSrcDir, 'skills/docs-sync/SKILL.md'),
      dest: path.join(fakeTargetDir, '.agents/skills/docs-sync/SKILL.md'),
      label: '.agents/skills/docs-sync/SKILL.md',
      skill: 'docs-sync',
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
      label: '.agents/templates/sdd/docs-live-index.md',
      skill: 'docs-sync',
    });
    expect(docs).toContainEqual({
      action: 'copy',
      src: path.join(fakeSrcDir, 'templates/bootstrap/sdd/docs-index/_indice-seccional-template.md'),
      dest: path.join(fakeTargetDir, '.agents/templates/sdd/docs-index/_indice-seccional-template.md'),
      label: '.agents/templates/sdd/docs-index/_indice-seccional-template.md',
      skill: 'docs-sync',
    });
    expect(docs).toContainEqual({
      action: 'copy',
      src: path.join(fakeSrcDir, 'templates/bootstrap/sdd/release-notes.md'),
      dest: path.join(fakeTargetDir, '.agents/templates/sdd/release-notes.md'),
      optional: true,
      label: '.agents/templates/sdd/release-notes.md',
      skill: 'release',
    });
  });

  it('ninguna intenciÃ³n referencia goldens de .agents/ del repo como fuente (R-SK-2)', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir, manifests: MANIFESTS });

    const srcPrefix = path.resolve(fakeSrcDir) + path.sep;
    for (const intention of intentions) {
      expect(intention.src).not.toMatch(/\.agents/);
      expect(path.resolve(intention.src).startsWith(srcPrefix)).toBe(true);
    }
  });


  it('runSkills filtra por selectedSkills: solo la skill elegida, sin I/O (R-SK-1, D3)', () => {
    const intentions = runSkills({
      srcDir: fakeSrcDir,
      targetBase: fakeTargetDir,
      selectedSkills: ['release'],
      manifests: MANIFESTS,
    });

    expect(intentions).toHaveLength(2);
    const dests = intentions.map(i => String(i.dest).replace(/\\/g, '/'));
    expect(dests[0]).toContain('.agents/skills/release/SKILL.md');
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
        // Log legible: identifica el archivo, no solo su basename.
        label: '.agents/skills/prueba/SKILL.md',
        skill: 'prueba',
      },
    ]);
  });

  it('runSkills sin selectedSkills inyecta todas las skills (default, R-SK-7)', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir, manifests: MANIFESTS });

    expect(intentions).toHaveLength(5);
    expect(String(intentions[0].src)).toContain(path.join('skills', 'docs-sync', 'SKILL.md'));
    expect(String(intentions[3].src)).toContain(path.join('skills', 'release', 'SKILL.md'));
  });

  it('orden determinista: sort por skill (docs-sync antes de release), luego orden del manifest (D3)', () => {
    const intentions = runSkills({ srcDir: fakeSrcDir, targetBase: fakeTargetDir, manifests: MANIFESTS });

    const srcParts = intentions.map(i => String(i.src).replace(/\\/g, '/'));
    expect(srcParts[0]).toContain('skills/docs-sync/SKILL.md');
    expect(srcParts[1]).toContain('templates/bootstrap/sdd/docs-live-index.md');
    expect(srcParts[2]).toContain('templates/bootstrap/sdd/docs-index/_indice-seccional-template.md');
    expect(srcParts[3]).toContain('skills/release/SKILL.md');
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

describe('catálogo de skills (R-SK-7 / R-SK-8)', () => {
  const skillDirs = fs
    .readdirSync(SKILLS_SRC, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  it('toda skill con SKILL.md declara manifest.js, o `funky skills` la ignora para siempre', () => {
    const invisible = skillDirs.filter((name) => {
      const names = fs.readdirSync(path.join(SKILLS_SRC, name));
      return names.includes('SKILL.md') && !names.includes('manifest.js');
    });

    expect(invisible).toEqual([]);
  });

  it('cada archivo de la skill está declarado en su manifest y cada src declarado existe', async () => {
    const problems = [];

    for (const name of skillDirs) {
      const dir = path.join(SKILLS_SRC, name);
      if (!fs.readdirSync(dir).includes('manifest.js')) continue;

      const moduleUrl = pathToFileURL(path.join(dir, 'manifest.js')).href;
      const manifest = (await import(moduleUrl)).default;
      const prefix = `skills/${name}/`;
      const declared = new Set(
        manifest
          .filter((item) => String(item.src).startsWith(prefix))
          .map((item) => String(item.src).slice(prefix.length)),
      );

      for (const rel of skillFiles(dir)) {
        if (rel === 'manifest.js') continue;
        if (!declared.has(rel)) problems.push(`${name}/${rel} no está declarado en su manifest`);
      }
      for (const rel of declared) {
        if (!fs.existsSync(path.join(dir, rel))) problems.push(`${name}/${rel} declarado en el manifest pero ausente`);
      }
    }

    expect(problems).toEqual([]);
  });
});

