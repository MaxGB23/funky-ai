import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Interpola pricing-guide-template.md con decisiones y contenidos de canvas.
 */
export function generatePricingGuide(decisions, projectCanvas, infraCanvas) {
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

  return template
    .replace('{{DECISIONS_CONTENT}}', decisionsContent)
    .replace('{{PROJECT_CANVAS_CONTENT}}', projectContent)
    .replace('{{INFRA_CANVAS_CONTENT}}', infraContent);
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
