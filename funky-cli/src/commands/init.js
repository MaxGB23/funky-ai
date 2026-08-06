import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeIntentions } from '../utils/fs-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Plan de intenciones de `funky init`, como función pura (R8).
 *
 * @param {{ templatesDir: string, targetBase: string }} opts
 * @param {string} opts.templatesDir - Directorio con las plantillas de init.
 * @param {string} opts.targetBase   - Directorio destino (normalmente process.cwd()).
 * @returns {Array<{action:'mkdir'|'copy', src?:string, dest:string}>}
 */
export function runInit({ templatesDir, targetBase }) {
  const canvasDir = path.join(targetBase, 'docs', 'funky-ai', 'canvas');

  return [
    { action: 'mkdir', dest: canvasDir },
    // El brief funcional va PRIMERO: define el "qué" antes del "cómo" (R7).
    { action: 'copy', src: path.join(templatesDir, 'brief-funcional.md'), dest: path.join(canvasDir, 'brief-funcional.md') },
    { action: 'copy', src: path.join(templatesDir, 'PROJECT-CANVAS.md'), dest: path.join(canvasDir, 'PROJECT-CANVAS.md') },
    { action: 'copy', src: path.join(templatesDir, 'INFRA-CANVAS.md'), dest: path.join(canvasDir, 'INFRA-CANVAS.md') },
    // La guía SIEMPRE entra al array; el skip-if-exists lo resuelve executeIntentions (D2).
    { action: 'copy', src: path.join(templatesDir, 'canvas-planning-guide.md'), dest: path.join(canvasDir, 'canvas-planning-guide.md') },
  ];
}

export const initCommand = new Command('init')
  .description('Genera el brief funcional, PROJECT-CANVAS.md e INFRA-CANVAS.md para iniciar la planificacion del proyecto.')
  .action(async () => {
    const initDir = path.join(__dirname, '../templates/init');
    const targetBase = process.cwd();

    try {
      const canvasDir = path.join(targetBase, 'docs', 'funky-ai', 'canvas');
      const projectCanvasPath = path.join(canvasDir, 'PROJECT-CANVAS.md');
      const infraCanvasPath = path.join(canvasDir, 'INFRA-CANVAS.md');

      if (fs.existsSync(projectCanvasPath) || fs.existsSync(infraCanvasPath)) {
        console.error('❌ Error: Ya existe PROJECT-CANVAS.md o INFRA-CANVAS.md en docs/funky-ai/canvas/.');
        process.exit(1);
      }

      const { created, skipped, logs } = executeIntentions(runInit({ templatesDir: initDir, targetBase }));
      for (const log of logs) {
        console.log(log);
      }
      console.log(`\n✅ Canvases creados. Ejecuta \`funky scaffold\` para instalar el ecosistema completo.`);
    } catch (error) {
      console.error('❌ Error al generar los canvases:', error.message);
      process.exit(1);
    }
  });
