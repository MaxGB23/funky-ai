import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lógica pura del comando `funky phase`.
 * Separada del Command de Commander para ser 100% testeable de forma unitaria.
 *
 * @param {object} opts
 * @param {string} opts.nombreFase    - Nombre de la fase SDD (ej: 'explore', 'proposal').
 * @param {string} opts.templatesDir  - Directorio absoluto donde viven los templates SDD.
 * @param {string} opts.cwd           - Directorio de trabajo destino (normalmente process.cwd()).
 * @returns {{ success: boolean, error?: string }}
 */
export function runPhase({ nombreFase, templatesDir, cwd }) {
  const templateName = nombreFase.toLowerCase();
  const templatePath = path.join(templatesDir, `${templateName}.md`);
  const targetFileName = `sdd-${templateName}.md`;
  const targetPath = path.join(cwd, targetFileName);

  if (!fs.existsSync(templatePath)) {
    const available = fs.readdirSync(templatesDir).join(', ');
    const error = `El template para la fase '${templateName}' no existe. Disponibles: ${available}`;
    console.error(`❌ Error: ${error}`);
    return { success: false, error };
  }

  if (fs.existsSync(targetPath)) {
    const error = `El archivo ${targetFileName} ya existe en el directorio actual. Abortando para evitar pérdida de datos.`;
    console.error(`❌ Error: ${error}`);
    return { success: false, error };
  }

  const templateContent = fs.readFileSync(templatePath, 'utf8');
  fs.writeFileSync(targetPath, templateContent, 'utf8');
  console.log(`🚀 Template SDD inyectado exitosamente en: ${targetPath}`);
  return { success: true };
}

export const phaseCommand = new Command('phase')
  .description('Inyecta templates vírgenes (Markdown) en el repositorio base para las Fases de SDD')
  .argument('<nombre_fase>', 'Nombre de la fase (ej: explore, design)')
  .action((nombreFase) => {
    const templatesDir = path.join(__dirname, '..', 'templates', 'sdd');
    const cwd = process.cwd();

    const result = runPhase({ nombreFase, templatesDir, cwd });

    if (!result.success) {
      process.exit(1);
    }
  });
