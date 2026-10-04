// Manifest de recursos de la skill docs-sync (R-SK-8: manifest = única fuente).
// Los docs compartidos viven en templates/bootstrap/sdd/ — el MISMO src que usa
// `funky scaffold` (paridad byte a byte, R-SK-5).
export default [
  { src: 'skills/docs-sync/SKILL.md', dest: '.agents/skills/docs-sync/SKILL.md' },
  { src: 'templates/bootstrap/sdd/docs-live-index.md', dest: '.agents/templates/sdd/docs-live-index.md' },
  { src: 'templates/bootstrap/sdd/docs-index/_indice-seccional-template.md', dest: '.agents/templates/sdd/docs-index/_indice-seccional-template.md' },
];
