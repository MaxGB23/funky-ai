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
// El mecanismo de incrustación de la zona vive en su propio módulo de marcadores
// (testing-modernization, Front 2); este módulo conserva constantes, decisiones y R10.
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

// Key de la sección de referencia de costos de equipo (R10). NO es un topic
// temático: no vive en topics/ sino en team-cost-reference-template.md, y se
// incrusta al FINAL de la zona, después de los topics canónicos (orden del
// design AD-3: ficha → brief → topics → team-cost). El CLI la solicita con la
// flag --pricing-team.
export const TEAM_COST_KEY = 'pricing-team';

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
