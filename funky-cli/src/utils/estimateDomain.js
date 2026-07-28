import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function findCanvas(name, targetBase) {
  const rootPath = path.join(targetBase, name);
  if (fs.existsSync(rootPath)) {
    return { content: fs.readFileSync(rootPath, 'utf8'), source: 'root' };
  }

  const docsPath = path.join(targetBase, 'docs', name);
  if (fs.existsSync(docsPath)) {
    return { content: fs.readFileSync(docsPath, 'utf8'), source: 'docs' };
  }

  return null;
}

function countUnfilledSections(content) {
  const regex = /\[Responde aquí\]/g;
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Lee docs/architecture-decisions.md.
 * Retorna el contenido del archivo o null si no existe.
 */
export function loadDecisions(targetBase) {
  const decisionsPath = path.join(targetBase, 'docs', 'architecture-decisions.md');
  if (fs.existsSync(decisionsPath)) {
    return fs.readFileSync(decisionsPath, 'utf8');
  }
  return null;
}

/**
 * Busca PROJECT-CANVAS.md e INFRA-CANVAS.md (root → docs/ fallback).
 * Retorna contenido, fuente y conteo de secciones sin completar.
 */
export function findCanvases(targetBase) {
  const projectResult = findCanvas('PROJECT-CANVAS.md', targetBase);
  const infraResult = findCanvas('INFRA-CANVAS.md', targetBase);

  let unfilledCount = 0;
  if (projectResult) {
    unfilledCount += countUnfilledSections(projectResult.content);
  }
  if (infraResult) {
    unfilledCount += countUnfilledSections(infraResult.content);
  }

  return {
    projectCanvas: projectResult ? projectResult.content : null,
    infraCanvas: infraResult ? infraResult.content : null,
    projectSource: projectResult ? projectResult.source : null,
    infraSource: infraResult ? infraResult.source : null,
    unfilledCount,
  };
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
 * Genera prompt en español neutro para iniciar sesión de pricing colaborativa.
 */
export function generateIAPrompt(decisions, projectCanvas, infraCanvas) {
  const decisionsSection = decisions
    ? `Decisiones arquitectónicas:\n${decisions}`
    : 'No hay decisiones arquitectónicas documentadas previamente. La discusión de pricing partirá desde cero con la información de los canvases disponible.';

  const projectSection = projectCanvas || 'No disponible.';
  const infraSection = infraCanvas || 'No disponible.';

  return `===== PROMPT PARA INICIAR SESIÓN DE PRICING =====

Eres un asistente experto en pricing de proyectos de software. Vamos a realizar una sesión de pricing colaborativa para definir el presupuesto de un proyecto.

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

Comienza preguntando al equipo si tienen algún presupuesto o rango de precio en mente.

============================================`;
}
