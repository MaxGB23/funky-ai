import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOPICS, TEAM_COST_KEY } from './estimateDomain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '../templates/estimate');
const TOPICS_DIR = path.join(TEMPLATES_DIR, 'topics');

// Orden de incrustación de la zona: topics canónicos + referencia de equipo al
// final. TOPICS se conserva puro en estimateDomain.js (los 6 flags de topic del
// CLI); EMBED_ORDER es el orden de emisión de la zona <!-- topics --> (privado,
// design D4: cada módulo conserva su propio helper de lectura privado).
const EMBED_ORDER = [...TOPICS, TEAM_COST_KEY];

// ═══════════════════════════════════════════════════════════════════════════
// Fase 2 (2.3): mecanismo de incrustación aditiva con marcadores XML.
// pricing-guide.md es una GUÍA (no un derivado regenerable): la zona de
// incrustación `<!-- topics --> ... <!-- /topics -->` envuelve los bloques
// `<!-- topic:<key> --> ... <!-- /topic:<key> -->` de las secciones incrustadas
// en orden EMBED_ORDER (Fase B M4: la zona SOLO contiene secciones con
// contenido, sin pares vacíos). El CLI detecta secciones existentes por marcador
// exacto (conjunto cerrado: 6 topics + pricing-team, checklist 1.2), incrusta
// las nuevas SIN preguntar y reincrusta todas al refrescar la base (contrato de
// feedback, decisión 2026-08-06).
const TOPIC_ZONE_OPEN = '<!-- topics -->';
const TOPIC_ZONE_CLOSE = '<!-- /topics -->';
const TOPIC_BLOCK_OPEN = (key) => `<!-- topic:${key} -->`;
const TOPIC_BLOCK_CLOSE = (key) => `<!-- /topic:${key} -->`;
// Par de marcadores: apertura, contenido opcional y cierre. El `\n?` opcional
// antes del cierre tolera el par VACÍO legacy (`OPEN\nCLOSE`, un solo salto) y el
// par con contenido (`OPEN\n<fragmento>\nCLOSE`), con o sin doble salto. Desde la
// Fase B M4 la zona NO emite pares vacíos; la tolerancia queda por retrocompat.
const TOPIC_BLOCK_RE = () => /\n<!-- topic:([a-z0-9-]+) -->\r?\n([\s\S]*?)\n?<!-- \/topic:\1 -->/g;

/**
 * Zona de incrustación con su contenido entre `<!-- topics -->` y `<!-- /topics -->`.
 * Valida el template base: sin zona o sin `## Estructura de Discusión` es un
 * error de instalación (checklist 1.2).
 *
 * @param {string} templateContent
 */
export function validatePricingGuideTemplate(templateContent) {
  const content = String(templateContent);
  if (!content.includes(TOPIC_ZONE_OPEN) || !content.includes(TOPIC_ZONE_CLOSE)) {
    throw new Error(`El template de pricing-guide no tiene la zona de incrustación de topics (${TOPIC_ZONE_OPEN} ... ${TOPIC_ZONE_CLOSE}). Verifica la instalación de funky-cli (src/templates/estimate/pricing-guide-template.md).`);
  }
  if (!content.includes('## Estructura de Discusión')) {
    throw new Error('El template de pricing-guide no tiene la sección "## Estructura de Discusión". Verifica la instalación de funky-cli (src/templates/estimate/pricing-guide-template.md).');
  }
}

/**
 * Parsea la zona de incrustación: prefijo literal (guía corta de flags, comentarios),
 * pares de marcadores `<!-- topic:<key> -->...<!-- /topic:<key> -->` y sufijo literal.
 *
 * @param {string} zoneContent
 * @returns {{ blocks: Map<string, { full: string, content: string }>, zonePrefix: string, zoneSuffix: string }}
 */
function parseTopicZone(zoneContent) {
  const blockRe = TOPIC_BLOCK_RE();
  const blocks = new Map();
  // Sin bloques (Fase B M4: la zona no trae pares vacíos), el contenido completo
  // es el prefijo: la zona queda intacta y los topics nuevos se agregan al final.
  let zonePrefix = zoneContent;
  let zoneSuffix = '';
  let match;
  let first = true;
  while ((match = blockRe.exec(zoneContent)) !== null) {
    if (first) {
      zonePrefix = zoneContent.slice(0, match.index);
      first = false;
    }
    blocks.set(match[1], { full: match[0], content: match[2] });
    zoneSuffix = zoneContent.slice(match.index + match[0].length);
  }
  return { blocks, zonePrefix, zoneSuffix };
}

/**
 * Guía fresca desde pricing-guide-template.md con las secciones solicitadas ya
 * incrustadas. Valida el template base (error claro de instalación si falta la
 * zona o el header de discusión).
 *
 * @param {string[]} topics Secciones en orden de emisión (topic keys canónicos
 * del CLI y/o TEAM_COST_KEY; los topic keys respetan EMBED_ORDER).
 * @returns {string} Guía declarativa lista para escribir.
 */
export function buildPricingGuide(topics) {
  const templateContent = readOptionalTemplate('pricing-guide-template.md');
  validatePricingGuideTemplate(templateContent);
  return embedTopicSections(templateContent, topics);
}

/**
 * Aditivo puro: incrusta SOLO las secciones de topic faltantes sobre una guía
 * existente, conservando todo lo demás (secciones previas, anotaciones fuera de
 * los marcadores, guía corta de flags). Orden de emisión: EMBED_ORDER (topics
 * canónicos + pricing-team al final). Sin secciones nuevas devuelve el contenido
 * intacto (idempotente).
 *
 * @param {string} guideContent Guía existente (o template fresco).
 * @param {string[]} topics Secciones solicitadas en esta corrida (topic keys
 * canónicos y/o TEAM_COST_KEY).
 * @returns {string}
 */
export function embedTopicSections(guideContent, topics) {
  const content = String(guideContent);
  validatePricingGuideTemplate(content);

  const zoneOpenIdx = content.indexOf(TOPIC_ZONE_OPEN);
  const zoneCloseIdx = content.indexOf(TOPIC_ZONE_CLOSE);
  const zone = content.slice(zoneOpenIdx + TOPIC_ZONE_OPEN.length, zoneCloseIdx);
  const { blocks, zonePrefix, zoneSuffix } = parseTopicZone(zone);

  const requested = Array.isArray(topics) ? topics : [];
  const hasNew = requested.some((key) => {
    const existing = blocks.get(key);
    return !existing || existing.content.trim() === '';
  });
  if (!hasNew) {
    return content;
  }

  const zoneBody = [zonePrefix];
  for (const key of EMBED_ORDER) {
    const existing = blocks.get(key);
    if (existing && existing.content.trim() !== '') {
      zoneBody.push(existing.full);
    } else if (requested.includes(key)) {
      zoneBody.push(`\n${TOPIC_BLOCK_OPEN(key)}\n${readTopicFragment(key)}${TOPIC_BLOCK_CLOSE(key)}`);
    }
    // Fase B M4: las secciones no solicitadas NO dejan pares de marcadores vacíos;
    // la zona solo contiene secciones con contenido.
  }
  zoneBody.push(zoneSuffix);

  return (
    content.slice(0, zoneOpenIdx) +
    TOPIC_ZONE_OPEN +
    zoneBody.join('') +
    TOPIC_ZONE_CLOSE +
    content.slice(zoneCloseIdx + TOPIC_ZONE_CLOSE.length)
  );
}

/**
 * Topics presentes en la guía por marcador exacto: un topic está incrustado si su
 * par `<!-- topic:<key> -->...<!-- /topic:<key> -->` tiene contenido. Los topics
 * sin contenido (pares vacíos legacy) no cuentan.
 *
 * @param {string} guideContent
 * @returns {string[]} Topics incrustados, en orden de aparición en el archivo.
 */
export function detectEmbeddedTopics(guideContent) {
  const content = String(guideContent);
  const blockRe = TOPIC_BLOCK_RE();
  const found = [];
  let match;
  while ((match = blockRe.exec(content)) !== null) {
    if (match[2].trim() !== '') {
      found.push(match[1]);
    }
  }
  return found;
}

/**
 * Refresca la base de una guía (estructura/guía corta de flags del template) sin
 * perder los flags: reconstruye desde la base fresca y REINCRUSTA todos los
 * topics detectados por marcador en la guía actual.
 *
 * @param {string} baseContent Template base fresco.
 * @param {string} guideContent Guía actual con topics incrustados.
 * @returns {string} Base fresca con todos los topics detectados reincrustados.
 */
export function refreshPricingGuideBase(baseContent, guideContent) {
  return embedTopicSections(baseContent, detectEmbeddedTopics(guideContent));
}

function readTopicFragment(topic) {
  // R10: la referencia de costos de equipo vive en un template propio (no en
  // topics/). Mismo error claro de instalación que los fragmentos de topic.
  if (topic === TEAM_COST_KEY) {
    return readOptionalTemplate('team-cost-reference-template.md');
  }
  const fragmentPath = path.join(TOPICS_DIR, `${topic}.md`);
  try {
    return fs.readFileSync(fragmentPath, 'utf8');
  } catch (err) {
    throw new Error(`Fragmento de topic "${topic}" no encontrado en ${fragmentPath}. Verificá que el template exista (R14).`);
  }
}

function readOptionalTemplate(relativeName) {
  const templatePath = path.join(TEMPLATES_DIR, relativeName);
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (err) {
    throw new Error(`Template ${relativeName} no encontrado en ${templatePath}. La instalación está corrupta.`);
  }
}
