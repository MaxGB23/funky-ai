import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTodayDate } from './context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '../templates/estimate');
const TOPICS_DIR = path.join(TEMPLATES_DIR, 'topics');

// TODO(Fase 2, Pendiente 1): estimateTopics.js fue ELIMINADO (decisión 2026-08-07:
// la guía corta de flags del template base es la única guía para decidir flags, sin
// heurísticas de texto). TOPICS/DISPLAY_NAMES viven acá como orden canónico de los
// 6 tópicos (topic key == flag name) hasta que 2.4 defina su hogar definitivo.
export const TOPICS = [
  'roles',
  'multi-tenant',
  'transactions',
  'security',
  'concurrency',
  'integrations',
];

export const DISPLAY_NAMES = {
  roles: 'Roles del equipo',
  'multi-tenant': 'Multi-tenant',
  transactions: 'Transacciones',
  security: 'Seguridad',
  concurrency: 'Concurrencia',
  integrations: 'Integraciones',
};

// Línea marcador de secciones opcionales, sola en su línea entre INFRA-CANVAS
// y ## Estructura de Discusión. Con sections === '' la línea desaparece y la
// salida 3-arg queda byte-idéntica a la legacy (R12).
const OPTIONAL_SECTIONS_RE = /^\s*\{\{OPTIONAL_SECTIONS\}\}\s*$/gm;

/**
 * Interpola pricing-guide-template.md con decisiones y contenidos de canvas.
 *
 * El 4º parámetro `opts` habilita secciones opcionales en el marcador
 * `{{OPTIONAL_SECTIONS}}` (R7-R10). Ausente o `{}` → salida byte-idéntica a la
 * legacy (R12). Orden de secciones: ficha → brief → topics (canónico) → team-cost.
 *
 * @param {string|null} decisions
 * @param {string|null} projectCanvas
 * @param {string|null} infraCanvas
 * @param {{ brief?: true|string, topics?: string[], pricingTeam?: boolean, scopeFicha?: boolean }} [opts]
 */
export function generatePricingGuide(decisions, projectCanvas, infraCanvas, opts = {}) {
  const templatePath = path.join(__dirname, '../templates/estimate/pricing-guide-template.md');

  let template;
  try {
    template = fs.readFileSync(templatePath, 'utf8');
  } catch (err) {
    throw new Error(`Template pricing-guide-template.md no encontrado en ${templatePath}. La instalación está corrupta.`);
  }

  const decisionsContent = decisions || 'Sin decisiones documentadas.';
  const projectContent = projectCanvas || 'Canvas no disponible.';
  const infraContent = infraCanvas || 'Canvas no disponible.';

  const sections = buildOptionalSections(opts, decisions, projectCanvas, infraCanvas);

  return template
    .replace('{{DECISIONS_CONTENT}}', decisionsContent)
    .replace('{{PROJECT_CANVAS_CONTENT}}', projectContent)
    .replace('{{INFRA_CANVAS_CONTENT}}', infraContent)
    .replace(OPTIONAL_SECTIONS_RE, sections);
}

/**
 * Ensambla las secciones opcionales en el orden del design (AD-3):
 * ficha (scope) → brief → topics (orden canónico) → team-cost.
 * Sin secciones → '' para que el marcador desaparezca sin dejar rastro (R12).
 */
function buildOptionalSections(opts, decisions, projectCanvas, infraCanvas) {
  const parts = [];
  // TODO(Fase 2, 1.5): la ficha de alcance (generateScopeExclusionTable, basada en
  // surfaceEstimateTopics de estimateTopics.js — eliminado) se reemplaza por la guía
  // corta de flags que vive en el template base (se refresca con cada Y/N aprobado).
  // if (opts.scopeFicha === true) {
  //   parts.push(generateScopeExclusionTable({ projectCanvas, infraCanvas }, decisions));
  // }
  if (opts.brief !== undefined && opts.brief !== false) {
    parts.push(generateBriefSection(opts.brief, process.cwd()).content);
  }
  if (Array.isArray(opts.topics) && opts.topics.length > 0) {
    parts.push(generateTopicFragments(opts.topics));
  }
  if (opts.pricingTeam === true) {
    parts.push(generateTeamCostReference());
  }
  if (parts.length === 0) {
    return '';
  }
  // \n inicial/final: respiración markdown entre el canvas y las secciones, y
  // entre la última sección y ## Estructura de Discusión.
  return `\n${parts.join('\n\n')}\n`;
}

/**
 * Sección opcional de brief (R7).
 * - briefPath true|undefined → checklist embebido (brief-questions-template.md)
 * - briefPath string → contenido del archivo, resuelto contra baseDir
 * - fallo de lectura del archivo → checklist + usedFallback: true (el caller advierte)
 *
 * @param {true|string|undefined} briefPath
 * @param {string} baseDir
 * @returns {{ content: string, usedFallback: boolean }}
 */
export function generateBriefSection(briefPath, baseDir) {
  const checklist = readOptionalTemplate('brief-questions-template.md');
  if (typeof briefPath === 'string') {
    const resolvedPath = path.resolve(baseDir, briefPath);
    try {
      return { content: fs.readFileSync(resolvedPath, 'utf8'), usedFallback: false };
    } catch (err) {
      return { content: checklist, usedFallback: true };
    }
  }
  return { content: checklist, usedFallback: false };
}

/**
 * Fragmentos de topics en orden canónico (TOPICS), con el contenido de
 * src/templates/estimate/topics/<topic>.md (R8, R14). Lanza si falta un
 * fragmento: los templates son living y su ausencia es un error de instalación.
 *
 * @param {string[]} topics
 * @returns {string} Fragmentos unidos, o '' si no hay topics solicitados.
 */
export function generateTopicFragments(topics) {
  const requested = Array.isArray(topics) ? topics : [];
  return TOPICS
    .filter((topic) => requested.includes(topic))
    .map((topic) => readTopicFragment(topic))
    .join('\n');
}

function readTopicFragment(topic) {
  const fragmentPath = path.join(TOPICS_DIR, `${topic}.md`);
  try {
    return fs.readFileSync(fragmentPath, 'utf8');
  } catch (err) {
    throw new Error(`Fragmento de topic "${topic}" no encontrado en ${fragmentPath}. Verificá que el template exista (R14).`);
  }
}

/**
 * Sección de referencia de costos de equipo (R10), sin calculadora.
 * Lanza si falta el template (instalación corrupta).
 *
 * @returns {string}
 */
export function generateTeamCostReference() {
  return readOptionalTemplate('team-cost-reference-template.md');
}

function readOptionalTemplate(relativeName) {
  const templatePath = path.join(TEMPLATES_DIR, relativeName);
  try {
    return fs.readFileSync(templatePath, 'utf8');
  } catch (err) {
    throw new Error(`Template ${relativeName} no encontrado en ${templatePath}. La instalación está corrupta.`);
  }
}

// TODO(Fase 2, 1.5): ficha de alcance ELIMINADA junto con estimateTopics.js
// (surfaceEstimateTopics daba falsos positivos, obs 3). La guía corta de flags
// del template base la reemplaza; la IA decide los flags con contexto, sin
// heurísticas de texto sobre canvas/decisiones.
// export function generateScopeExclusionTable(canvases, decisions) {
//   const { signals } = surfaceEstimateTopics(canvases, decisions);
//   const rows = signals
//     .map((signal) => `| ${DISPLAY_NAMES[signal.topic]} | ${signal.status} |`)
//     .join('\n');
//   const evidence = signals
//     .map((signal) => `${signal.topic} → ${signal.evidence}`)
//     .join(', ');
//   return [
//     '## Alcance: ¿Aplica en esta fase?',
//     '',
//     '| Tema | Estado |',
//     '|------|--------|',
//     rows,
//     '',
//     `> Nota de evidencia: ${evidence}`,
//   ].join('\n');
// }

/**
 * Interpola pricing-decisions-template.md con la fecha actual.
 */
export function generateDecisionsTemplate() {
  const templatePath = path.join(__dirname, '../templates/estimate/pricing-decisions-template.md');

  let template;
  try {
    template = fs.readFileSync(templatePath, 'utf8');
  } catch (err) {
    throw new Error(`Template pricing-decisions-template.md no encontrado en ${templatePath}. La instalación está corrupta.`);
  }

  const today = getTodayDate();
  return template.replace(/{{DATE}}/g, today);
}

/**
 * Genera el banner decorativo para el prompt de IA.
 * Separa la presentación del contenido del prompt para permitir reutilización.
 */
export function generateIAPromptBanner() {
  return '===== PROMPT PARA INICIAR SESIÓN DE PRICING =====';
}

/**
 * Genera prompt en español neutro para iniciar sesión de pricing colaborativa.
 * Referencia los archivos generados (material de análisis) en lugar de incrustar
 * su contenido: la IA del entorno de desarrollo puede leer los archivos.
 * Retorna solo el cuerpo del prompt (sin banner decorativo).
 */
export function generateIAPrompt(pricingGuidePath, decisionsPath) {
  return `Eres un asistente experto en pricing de proyectos de software. Vamos a realizar una sesión de pricing colaborativa para definir el presupuesto de un proyecto.

Material de análisis:
- ${pricingGuidePath}: contexto del proyecto, decisiones arquitectónicas y estructura de la sesión.

Los acuerdos de la sesión se documentan en:
- ${decisionsPath}

Por favor, guía la sesión con esta estructura:
1. Revisar el contexto del proyecto y las decisiones arquitectónicas.
2. Discutir factores de costo (infraestructura, complejidad técnica, equipo, timeline).
3. Definir acuerdos de pricing.

Comienza preguntando al equipo si tienen algún presupuesto o rango de precio en mente.`;
}

/**
 * Genera el footer decorativo para el prompt de IA.
 */
export function generateIAPromptFooter() {
  return '============================================';
}

// ═══════════════════════════════════════════════════════════════════════════
// Fase 2 (2.3): mecanismo de incrustación aditiva con marcadores XML.
// pricing-guide.md es una GUÍA (no un derivado regenerable): la zona de
// incrustación `<!-- topics --> ... <!-- /topics -->` envuelve los pares
// `<!-- topic:<key> --> ... <!-- /topic:<key> -->` de los 6 topics en orden
// canónico. El CLI detecta secciones existentes por marcador exacto (conjunto
// cerrado de 6 topics, checklist 1.2), incrusta las nuevas SIN preguntar y
// reincrusta todas al refrescar la base (contrato de feedback, decisión 2026-08-06).
const TOPIC_ZONE_OPEN = '<!-- topics -->';
const TOPIC_ZONE_CLOSE = '<!-- /topics -->';
const TOPIC_BLOCK_OPEN = (key) => `<!-- topic:${key} -->`;
const TOPIC_BLOCK_CLOSE = (key) => `<!-- /topic:${key} -->`;
// Par de marcadores: apertura, contenido opcional y cierre. El `\n?` opcional
// antes del cierre tolera el par VACÍO (`OPEN\nCLOSE`, un solo salto) y el par
// con contenido (`OPEN\n<fragmento>\nCLOSE`), con o sin doble salto.
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
  let zonePrefix = '';
  let lastEnd = 0;
  let match;
  let first = true;
  while ((match = blockRe.exec(zoneContent)) !== null) {
    if (first) {
      zonePrefix = zoneContent.slice(0, match.index);
      first = false;
    }
    blocks.set(match[1], { full: match[0], content: match[2] });
    lastEnd = match.index + match[0].length;
  }
  return { blocks, zonePrefix, zoneSuffix: zoneContent.slice(lastEnd) };
}

/**
 * Guía fresca desde pricing-guide-template.md con los topics solicitados ya
 * incrustados. Valida el template base (error claro de instalación si falta la
 * zona o el header de discusión).
 *
 * @param {string[]} topics Topics en orden canónico (TOPICS.filter del CLI).
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
 * los marcadores, guía corta de flags). Orden canónico (TOPICS). Sin topics
 * nuevos devuelve el contenido intacto (idempotente).
 *
 * @param {string} guideContent Guía existente (o template fresco).
 * @param {string[]} topics Topics solicitados en esta corrida.
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
  for (const key of TOPICS) {
    const existing = blocks.get(key);
    if (existing && existing.content.trim() !== '') {
      zoneBody.push(existing.full);
    } else if (requested.includes(key)) {
      zoneBody.push(`\n${TOPIC_BLOCK_OPEN(key)}\n${readTopicFragment(key)}${TOPIC_BLOCK_CLOSE(key)}`);
    } else {
      zoneBody.push(`\n${TOPIC_BLOCK_OPEN(key)}\n${TOPIC_BLOCK_CLOSE(key)}`);
    }
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
 * par `<!-- topic:<key> -->...<!-- /topic:<key> -->` tiene contenido. Los pares
 * vacíos (template fresco) no cuentan.
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
