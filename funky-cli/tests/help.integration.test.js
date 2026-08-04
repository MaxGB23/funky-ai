import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { fileURLToPath } from 'url';

// R-SK-12: `funky help skills` debe inyectar el doc real del comando.
// help.js resuelve docs/funky-ai/<name>.md y solo skipea docs vacíos o con
// placeholder <ruta-del-doc> (R-HL-2) — por eso un doc que existe, no está
// vacío y sin placeholder es inyectable por construcción. Test de integración
// SIN mock de fs: valida el artefacto real del árbol del repo.
const skillsDoc = fileURLToPath(new URL('../../docs/funky-ai/skills.md', import.meta.url));

describe('R-SK-12: funky help skills inyecta el doc real', () => {
  it('docs/funky-ai/skills.md existe, no está vacío y no tiene placeholder', () => {
    expect(fs.existsSync(skillsDoc)).toBe(true);

    const content = fs.readFileSync(skillsDoc, 'utf8');
    expect(content.trim().length).toBeGreaterThan(0);
    expect(content).not.toContain('<ruta-del-doc>');
  });
});
