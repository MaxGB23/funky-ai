import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTodayDate } from './context.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMPLATES_DIR = path.join(__dirname, '../templates/estimate');

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
 * Interpola pricing-decisions-template.md con la fecha. El parámetro `today`
 * permite inyectar una fecha fija en tests (determinismo, D2); el default
 * conserva el comportamiento de producción.
 *
 * @param {string} [today] Fecha en formato ISO (YYYY-MM-DD); default getTodayDate().
 */
export function generateDecisionsTemplate(today = getTodayDate()) {
  const templatePath = path.join(__dirname, '../templates/estimate/pricing-decisions-template.md');

  let template;
  try {
    template = fs.readFileSync(templatePath, 'utf8');
  } catch (err) {
    throw new Error(`Template pricing-decisions-template.md no encontrado en ${templatePath}. La instalación está corrupta.`);
  }

  return template.replace(/{{DATE}}/g, today);
}
