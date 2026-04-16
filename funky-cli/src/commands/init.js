import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

export const initCommand = new Command('init')
  .description('Inicializa el repositorio creando la estructura base del Engram de Funky AI')
  .action(() => {
    const targetDir = path.join(process.cwd(), 'docs', 'engram');
    try {
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
        console.log('🚀 Funky AI Engram inicializado en: ' + targetDir);
      } else {
        console.log('⚡ El directorio base del Engram ya existe en: ' + targetDir);
      }
    } catch (error) {
      console.error('❌ Error al inicializar el Engram:', error.message);
      process.exit(1);
    }
  });
