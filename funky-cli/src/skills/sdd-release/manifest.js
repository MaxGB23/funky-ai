// Manifest de recursos de la skill sdd-release (R-SK-8: manifest = única fuente).
// `src` se resuelve contra srcDir (raíz funky-cli/src): cubre skills/<skill>/ y
// templates/bootstrap/sdd/ (docs compartidos, paridad R-SK-5). `optional: true`
// = si el src falta se salta con log, nunca crashea (R-SK-3).
export default [
  { src: 'skills/sdd-release/SKILL.md', dest: '.agents/skills/sdd-release/SKILL.md' },
  {
    src: 'templates/bootstrap/sdd/release-notes.md',
    dest: '.agents/templates/sdd/release-notes.md',
    optional: true,
  },
];
