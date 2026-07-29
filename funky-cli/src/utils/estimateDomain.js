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
  const templatePath = path.join(__dirname, '../templates/sdd/pricing-guide-template.md');

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
  const templatePath = path.join(__dirname, '../templates/sdd/pricing-decisions-template.md');

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
 * Retorna solo el cuerpo del prompt (sin banner decorativo).
 */
export function generateIAPrompt(decisions, projectCanvas, infraCanvas) {
  const decisionsSection = decisions
    ? `Decisiones arquitectónicas:\n${decisions}`
    : 'No hay decisiones arquitectónicas documentadas previamente. La discusión de pricing partirá desde cero con la información de los canvases disponible.';

  const projectSection = projectCanvas || 'No disponible.';
  const infraSection = infraCanvas || 'No disponible.';

  return `Eres un asistente experto en pricing de proyectos de software. Vamos a realizar una sesión de pricing colaborativa para definir el presupuesto de un proyecto.

Contexto del proyecto basado en los canvases:

[PROJECT-CANVAS]
${projectSection}

[INFRA-CANVAS]
${infraSection}

${decisionsSection}

Los materiales de apoyo se encuentran en el archivo .agents/prompts/pricing-guide.md.

Por favor, guía la sesión de pricing con esta estructura:
1. Revisar el contexto del proyecto y las decisiones arquitectónicas
2. Discutir factores de costo (infraestructura, complejidad técnica, equipo, timeline)
3. Definir acuerdos de pricing

Comienza preguntando al equipo si tienen algún presupuesto o rango de precio en mente.`;
}

/**
 * Genera el footer decorativo para el prompt de IA.
 */
export function generateIAPromptFooter() {
  return '============================================';
}
