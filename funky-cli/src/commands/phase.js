import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const phaseCommand = new Command('phase')
  .description('Inyecta templates vírgenes (Markdown) en el repositorio base para las Fases de SDD')
  .argument('<nombre_fase>', 'Nombre de la fase (ej: explore, design)')
  .action((nombreFase) => {
    const templateName = nombreFase.toLowerCase();
    const templatePath = path.join(__dirname, '..', 'templates', `${templateName}.md`);
    const targetFileName = `sdd-${templateName}.md`;
    const targetPath = path.join(process.cwd(), targetFileName);

    if (!fs.existsSync(templatePath)) {
      console.error(`❌ Error: El template para la fase '${templateName}' no existe.`);
      console.error(`Archivos soportados en templates: ${fs.readdirSync(path.join(__dirname, '..', 'templates')).join(', ')}`);
      process.exit(1);
    }

    if (fs.existsSync(targetPath)) {
      console.error(`❌ Error: El archivo ${targetFileName} ya existe en el directorio actual. Abortando para evitar pérdida de datos.`);
      process.exit(1);
    }

    try {
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      fs.writeFileSync(targetPath, templateContent, 'utf8');
      console.log(`🚀 Template SDD inyectado exitosamente en: ${targetPath}`);
    } catch (error) {
      console.error('❌ Error fatal copiando el template:', error.message);
      process.exit(1);
    }
  });
