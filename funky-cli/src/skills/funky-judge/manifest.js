// Manifest de recursos de la skill funky-judge (R-SK-8: manifest = única fuente).
// `references/` son los archivos que el SKILL.md enlaza. `copy` es archivo a archivo
// (fs-adapter no copia directorios), así que cada referencia se declara explícita:
// sin su entrada el SKILL.md instalado quedaría con enlaces muertos.
export default [
  { src: 'skills/funky-judge/SKILL.md', dest: '.agents/skills/funky-judge/SKILL.md' },
  {
    src: 'skills/funky-judge/references/before-code.md',
    dest: '.agents/skills/funky-judge/references/before-code.md',
  },
  {
    src: 'skills/funky-judge/references/open-change.md',
    dest: '.agents/skills/funky-judge/references/open-change.md',
  },
  {
    src: 'skills/funky-judge/references/reproduce.md',
    dest: '.agents/skills/funky-judge/references/reproduce.md',
  },
  {
    src: 'skills/funky-judge/references/outbound-text.md',
    dest: '.agents/skills/funky-judge/references/outbound-text.md',
  },
];
