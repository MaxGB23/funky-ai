import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initCommand = new Command('init')
  .description('Inicializa el repositorio creando la estructura base del ecosistema Funky AI')
  .action(() => {
    const templatesDir = path.join(__dirname, '../templates/bootstrap');
    const targetBase = process.cwd();

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

    try {
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
      console.log(`\n✅ Funky AI inicializado. ${createdCount} archivos creados, ${skippedCount} ya existían.`);
    } catch (error) {
      console.error('❌ Error al inicializar Funky AI:', error.message);
      process.exit(1);
    }
  });
