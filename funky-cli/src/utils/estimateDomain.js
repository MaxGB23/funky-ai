import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { TOPICS, DISPLAY_NAMES, surfaceEstimateTopics } from './estimateTopics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '../templates/estimate');
const TOPICS_DIR = path.join(TEMPLATES_DIR, 'topics');

// Línea marcador de secciones opcionales, sola en su línea entre INFRA-CANVAS
// y ## Estructura de Discusión. Con sections === '' la línea desaparece y la
// salida 3-arg queda byte-idéntica a la legacy (R12).
const OPTIONAL_SECTIONS_RE = /^\s*\{\{OPTIONAL_SECTIONS\}\}\s*$/gm;

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
  if (opts.scopeFicha === true) {
    parts.push(generateScopeExclusionTable({ projectCanvas, infraCanvas }, decisions));
  }
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

/**
 * Ficha de alcance siempre presente a nivel CLI (R9): tabla de 6 filas con el
 * estado por Status Rules (estimateTopics.js) y la evidencia como nota de una
 * línea. Función pura: sin fs.
 *
 * @param {{ projectCanvas?: string, infraCanvas?: string }} canvases
 * @param {string|null} decisions
 * @returns {string} Ficha markdown lista para insertar en {{OPTIONAL_SECTIONS}}.
 */
export function generateScopeExclusionTable(canvases, decisions) {
  const { signals } = surfaceEstimateTopics(canvases, decisions);
  const rows = signals
    .map((signal) => `| ${DISPLAY_NAMES[signal.topic]} | ${signal.status} |`)
    .join('\n');
  const evidence = signals
    .map((signal) => `${signal.topic} → ${signal.evidence}`)
    .join(', ');
  return [
    '## Alcance: ¿Aplica en esta fase?',
    '',
    '| Tema | Estado |',
    '|------|--------|',
    rows,
    '',
    `> Nota de evidencia: ${evidence}`,
  ].join('\n');
}

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
