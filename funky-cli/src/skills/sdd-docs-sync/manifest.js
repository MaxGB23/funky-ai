// Manifest de recursos de la skill sdd-docs-sync (R-SK-8: manifest = única fuente).
// Los docs compartidos viven en templates/bootstrap/sdd/ — el MISMO src que usa
// `funky scaffold` (paridad byte a byte, R-SK-5).
export default [
  { src: 'skills/sdd-docs-sync/SKILL.md', dest: '.agents/skills/sdd-docs-sync/SKILL.md' },
  { src: 'templates/bootstrap/sdd/docs-live-index.md', dest: '.agents/templates/sdd/docs-live-index.md' },
  { src: 'templates/bootstrap/sdd/docs-index/template.md', dest: '.agents/templates/sdd/docs-index/template.md' },
];
