import fs from 'fs';
import path from 'path';

/**
 * Superficia los patrones de riesgo de referencia del proyecto como candidatos
 * a considerar en la guía de discusión. NO detecta riesgos ni filtra por el
 * contenido de los canvases: presenta TODOS los patrones tal cual.
 *
 * Lee `docs/funky-ai/assess/risk-patterns.md` del proyecto. Si el archivo no
 * existe (o falla la lectura), devuelve el template recibido como respaldo.
 *
 * @param {string} targetBase Raíz del proyecto.
 * @param {string} templateContent Contenido del template embebido como respaldo.
 * @returns {{ content: string, patterns: string[] }} Contenido a insertar en la
 *   guía y nombres (categorías) de los patrones superfíciados.
 */
export function surfaceRiskPatterns(targetBase, templateContent = '') {
  const patternsPath = path.join(targetBase, 'docs', 'funky-ai', 'assess', 'risk-patterns.md');
  let content;
  try {
    content = fs.readFileSync(patternsPath, 'utf8');
  } catch {
    content = templateContent;
  }
  return {
    content,
    patterns: extractPatternNames(content)
  };
}

/**
 * Extrae los nombres de los patrones a partir de los encabezados `##` del
 * documento de patrones. No es detección de riesgos: solo lectura de secciones.
 */
function extractPatternNames(markdown) {
  const names = [];
  const lines = String(markdown || '').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^##\s+(.+?)\s*$/);
    if (match) {
      names.push(match[1].trim());
    }
  }
  return names;
}
