import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeIntentions } from '../utils/fs-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initCommand = new Command('init')
  .description('Genera PROJECT-CANVAS.md e INFRA-CANVAS.md para iniciar la planificacion del proyecto.')
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

      const guideDest = path.join(canvasDir, 'canvas-planning-guide.md');
      const intentions = [
        { action: 'mkdir', dest: canvasDir },
        { action: 'copy', src: path.join(initDir, 'PROJECT-CANVAS.md'), dest: projectCanvasPath },
        { action: 'copy', src: path.join(initDir, 'INFRA-CANVAS.md'), dest: infraCanvasPath },
      ];

      if (!fs.existsSync(guideDest)) {
        const guideSrc = path.join(initDir, 'canvas-planning-guide.md');
        intentions.push({ action: 'copy', src: guideSrc, dest: guideDest });
      }

      const { created, skipped, logs } = executeIntentions(intentions);
      for (const log of logs) {
        console.log(log);
      }
      console.log(`\n✅ Canvases creados. Ejecuta \`funky scaffold\` para instalar el ecosistema completo.`);
    } catch (error) {
      console.error('❌ Error al generar los canvases:', error.message);
      process.exit(1);
    }
  });
