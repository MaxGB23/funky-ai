import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import { executeIntentions } from '../utils/fs-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Plan de intenciones de `funky init`, como función pura (R8).
 *
 * @param {{ templatesDir: string, targetBase: string }} opts
 * @param {string} opts.templatesDir - Directorio con las plantillas de init.
 * @param {string} opts.targetBase   - Directorio destino (normalmente process.cwd()).
 * @returns {Array<{action:'mkdir'|'copy', kind?:'decision'|'guide', src?:string, dest:string}>}
 */
export function runInit({ templatesDir, targetBase }) {
  const canvasDir = path.join(targetBase, 'docs', 'funky-ai', 'canvas');

  return [
    { action: 'mkdir', dest: canvasDir },
    // Las decisiones del proyecto (brief y canvases) NUNCA se sobrescriben
    // automáticamente: si ya existen se omiten con recomendación (kind decision).
    // El brief funcional va PRIMERO: define el "qué" antes del "cómo" (R7).
    { action: 'copy', kind: 'decision', src: path.join(templatesDir, 'brief-funcional.md'), dest: path.join(canvasDir, 'brief-funcional.md') },
    { action: 'copy', kind: 'decision', src: path.join(templatesDir, 'PROJECT-CANVAS.md'), dest: path.join(canvasDir, 'PROJECT-CANVAS.md') },
    { action: 'copy', kind: 'decision', src: path.join(templatesDir, 'INFRA-CANVAS.md'), dest: path.join(canvasDir, 'INFRA-CANVAS.md') },
    // Las guías se actualizan con confirmación Y/N si ya existen (kind guide);
    // la guía SIEMPRE entra al array, el skip/sobrescritura lo resuelve executeIntentions (D2).
    { action: 'copy', kind: 'guide', src: path.join(templatesDir, 'canvas-planning-guide.md'), dest: path.join(canvasDir, 'canvas-planning-guide.md') },
    { action: 'copy', kind: 'guide', src: path.join(templatesDir, 'init-prompt.md'), dest: path.join(canvasDir, 'init-prompt.md') },
  ];
}

export const initCommand = new Command('init')
  .description('Genera el brief funcional, PROJECT-CANVAS.md e INFRA-CANVAS.md para iniciar la planificacion del proyecto.')
  .action(async () => {
    const initDir = path.join(__dirname, '../templates/init');
    const targetBase = process.cwd();

    try {
      // Fase 2, 2.6: sin stdin interactivo (CI) no se pregunta; las guías se omiten.
      const interactive = Boolean(process.stdin && process.stdin.isTTY);
      let askConfirm;

      if (interactive) {
        askConfirm = async (dest, basename) => {
          const answer = await p.confirm({
            message: `Ya existe ${basename}. ¿Quieres actualizarla con la versión más reciente?`,
            initialValue: false,
          });
          // isCancel se trata como "no": no sobrescribir.
          return !p.isCancel(answer) && answer === true;
        };
      } else {
        // Hallazgo smoke 1: el aviso solo aporta si hay guías existentes que
        // podrían actualizarse; en creación limpia es ruido.
        const canvasDir = path.join(targetBase, 'docs', 'funky-ai', 'canvas');
        const anyGuideExists = ['canvas-planning-guide.md', 'init-prompt.md'].some(name =>
          fs.existsSync(path.join(canvasDir, name))
        );
        if (anyGuideExists) {
          console.log('⚠️ Entorno no interactivo: no se actualizan las guías existentes.');
        }
      }

      const { created, skipped, logs } = await executeIntentions(
        runInit({ templatesDir: initDir, targetBase }),
        { askConfirm }
      );
      for (const log of logs) {
        console.log(log);
      }
      if (created === 0) {
        // Hallazgo smoke 2: diferenciar el caso "todo existe" del éxito normal.
        console.log('\nℹ️ Nada que crear: todos los archivos ya existen.');
      } else {
        console.log(`\n✅ Canvases creados. Ejecuta \`funky scaffold\` para instalar el ecosistema completo.`);
      }
    } catch (error) {
      console.error(`❌ Error al generar los canvases: ${error.message}`);
      process.exit(1);
    }
  });
