// Manifest de recursos de la skill funky-judge-protocol (R-SK-8: manifest = única fuente).
// La disciplina que todo run de `funky-judge` sigue. Sin este manifest la skill es
// invisible para `discoverSkills` (R-SK-7) y `funky skills` nunca la ofrece.
export default [
  {
    src: 'skills/funky-judge-protocol/SKILL.md',
    dest: '.agents/skills/funky-judge-protocol/SKILL.md',
  },
];
