// Manifest de recursos de la skill gemini-image-generation (R-SK-8: manifest = única fuente).
// El SKILL.md es el índice; las recetas viven en `references/` y se declaran una por
// una porque `copy` es archivo a archivo (fs-adapter no copia directorios).
export default [
  {
    src: 'skills/gemini-image-generation/SKILL.md',
    dest: '.agents/skills/gemini-image-generation/SKILL.md',
  },
  {
    src: 'skills/gemini-image-generation/references/chrome-session-gating.md',
    dest: '.agents/skills/gemini-image-generation/references/chrome-session-gating.md',
  },
  {
    src: 'skills/gemini-image-generation/references/gemini-upload-recipe.md',
    dest: '.agents/skills/gemini-image-generation/references/gemini-upload-recipe.md',
  },
  {
    src: 'skills/gemini-image-generation/references/gemini-download-recipe.md',
    dest: '.agents/skills/gemini-image-generation/references/gemini-download-recipe.md',
  },
  {
    src: 'skills/gemini-image-generation/references/gemini-postprocess.md',
    dest: '.agents/skills/gemini-image-generation/references/gemini-postprocess.md',
  },
  {
    src: 'skills/gemini-image-generation/references/locate-image.md',
    dest: '.agents/skills/gemini-image-generation/references/locate-image.md',
  },
  {
    src: 'skills/gemini-image-generation/references/prompts/fotos-certificado.md',
    dest: '.agents/skills/gemini-image-generation/references/prompts/fotos-certificado.md',
  },
  {
    src: 'skills/gemini-image-generation/references/prompts/_template.md',
    dest: '.agents/skills/gemini-image-generation/references/prompts/_template.md',
  },
];
