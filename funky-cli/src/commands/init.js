import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import { generateCanvasMarkdown } from '../utils/canvas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lógica pura del comando `funky init`.
 * Separada del Command de Commander para ser 100% testeable de forma unitaria.
 *
 * @param {object} opts
 * @param {string} opts.templatesDir - Directorio absoluto de templates de bootstrap.
 * @param {string} opts.targetBase   - Directorio destino (normalmente process.cwd()).
 * @param {object} opts.canvasConfig - Opcional. Configuración para generar PROJECT-CANVAS.md dinámico.
 * @returns {{ created: number, skipped: number }}
 */
export function runInit({ templatesDir, targetBase, canvasConfig }) {
  const filesToCopy = [
    { src: 'ORCHESTRATOR-STATE.md', dest: 'ORCHESTRATOR-STATE.md' },
    { src: 'agents-rules-engram-protocol.md', dest: path.join('.agents', 'rules', 'engram-protocol.md') },
    { src: 'agents-rules-secops.md', dest: path.join('.agents', 'rules', 'secops.md') },
    { src: 'agents-rules-sdd-orchestrator.md', dest: path.join('.agents', 'rules', 'sdd-orchestrator.md') },
    { src: 'engram-discoveries.md', dest: path.join('docs', 'engram', 'discoveries.md') },
    { src: 'engram-bugfixes.md', dest: path.join('docs', 'engram', 'bugfixes.md') },
  ];

  let createdCount = 0;
  let skippedCount = 0;

  console.log('🚀 Inicializando Funky AI...');

  for (const file of filesToCopy) {
    const sourcePath = path.join(templatesDir, file.src);
    const destPath = path.join(targetBase, file.dest);

    if (fs.existsSync(destPath)) {
      console.log(`⚡ Salteando (ya existe): ${file.dest}`);
      skippedCount++;
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true });
      fs.copyFileSync(sourcePath, destPath);
      console.log(`✅ Creado: ${file.dest}`);
      createdCount++;
    }
  }

  if (canvasConfig) {
    const markdown = generateCanvasMarkdown(canvasConfig);
    const canvasPath = path.join(targetBase, 'PROJECT-CANVAS.md');
    fs.writeFileSync(canvasPath, markdown);
    console.log(`✅ Creado: PROJECT-CANVAS.md (Dinámico)`);
    createdCount++;
  }

  console.log(`\n✅ Funky AI inicializado. ${createdCount} archivos creados, ${skippedCount} ya existían.`);
  return { created: createdCount, skipped: skippedCount };
}

export const initCommand = new Command('init')
  .description('Inicializa el repositorio creando la estructura base del ecosistema Funky AI')
  .action(async () => {
    const templatesDir = path.join(__dirname, '../templates/bootstrap');
    const targetBase = process.cwd();
    let canvasConfig = null;

    try {
      const canvasPath = path.join(targetBase, 'PROJECT-CANVAS.md');
      if (fs.existsSync(canvasPath)) {
        console.log('📄 PROJECT-CANVAS.md detectado, inicializando en modo Headless...');
        // Simplemente leemos o pasamos un objeto para que sepa que es headless
        // En un futuro se podría parsear el markdown
        canvasConfig = { fromHeadless: true }; 
      } else {
        console.clear();
        p.intro('🚀 Bienvenido a Funky AI CLI');

        const group = await p.group(
          {
            pattern: () =>
              p.select({
                message: 'Elige el Patrón Arquitectónico Base:',
                options: [
                  { value: 'Clean Architecture', label: 'Clean Architecture' },
                  { value: 'Modular', label: 'Modular' },
                  { value: 'Feature-Sliced', label: 'Feature-Sliced' },
                ],
              }),
            ui: () =>
              p.select({
                message: 'Framework UI:',
                options: [
                  { value: 'Vanilla CSS', label: 'Vanilla CSS' },
                  { value: 'Tailwind', label: 'Tailwind' },
                ],
              }),
            testing: () =>
              p.confirm({
                message: '¿Configurar Testing estricto (TDD)?',
              }),
          },
          {
            onCancel: () => {
              p.cancel('Operación cancelada.');
              process.exit(0);
            },
          }
        );
        p.outro('📝 Generando Canvas...');
        canvasConfig = {
          pattern: group.pattern,
          ui: group.ui,
          testing: group.testing,
        };
      }

      runInit({ templatesDir, targetBase, canvasConfig });
    } catch (error) {
      console.error('❌ Error al inicializar Funky AI:', error.message);
      process.exit(1);
    }
  });
