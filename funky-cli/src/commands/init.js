import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import { generateProjectCanvasMarkdown, generateInfraCanvasMarkdown } from '../utils/canvas.js';

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
    { src: 'plantilla-worker-handoff.md', dest: path.join('docs', 'funky-ai', 'workers', 'plantilla-worker-handoff.md') },
    { src: 'canvas-planning-guide.md', dest: path.join('docs', 'funky-ai', 'cli', 'canvas-planning-guide.md') }
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
      try {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Creado: ${file.dest}`);
        createdCount++;
      } catch (error) {
        throw new Error(`Permisos denegados o error en el sistema de archivos al escribir en ${destPath}: ${error.message}`);
      }
    }
  }

  if (canvasConfig) {
    if (canvasConfig.skipProjectCanvas) {
      console.log(`⚡ Salteando (ya existe): PROJECT-CANVAS.md`);
      skippedCount++;
    } else {
      const markdown = generateProjectCanvasMarkdown(canvasConfig.projectData || {});
      const canvasPath = path.join(targetBase, 'PROJECT-CANVAS.md');
      fs.writeFileSync(canvasPath, markdown);
      console.log(`✅ Creado: PROJECT-CANVAS.md (Dinámico)`);
      createdCount++;
    }

    if (canvasConfig.skipInfraCanvas) {
      if (!canvasConfig.migratingLegacy) {
        console.log(`⚡ Salteando (ya existe): INFRA-CANVAS.md`);
      }
      skippedCount++;
    } else {
      const markdown = generateInfraCanvasMarkdown(canvasConfig.infraData || {});
      const canvasPath = path.join(targetBase, 'INFRA-CANVAS.md');
      fs.writeFileSync(canvasPath, markdown);
      console.log(`✅ Creado: INFRA-CANVAS.md (Dinámico)`);
      createdCount++;
    }
  }

  console.log(`\n✅ Funky AI inicializado. ${createdCount} archivos creados, ${skippedCount} ya existían.`);
  return { created: createdCount, skipped: skippedCount };
}

export const initCommand = new Command('init')
  .description('Inicializa el repositorio creando la estructura base del ecosistema Funky AI')
  .option('-t, --template', 'Genera templates vacíos de PROJECT-CANVAS.md e INFRA-CANVAS.md para inicialización Headless')
  .action(async (options) => {
    const templatesDir = path.join(__dirname, '../templates/bootstrap');
    const targetBase = process.cwd();

    const projectCanvasPath = path.join(targetBase, 'PROJECT-CANVAS.md');
    const infraCanvasPath = path.join(targetBase, 'INFRA-CANVAS.md');
    
    const hasProjectCanvas = fs.existsSync(projectCanvasPath);
    const hasInfraCanvas = fs.existsSync(infraCanvasPath);

    if (options.template) {
      try {
        if (hasProjectCanvas || hasInfraCanvas) {
          console.error('❌ Error: Ya existe PROJECT-CANVAS.md o INFRA-CANVAS.md en el directorio.');
          process.exit(1);
        }
        fs.writeFileSync(projectCanvasPath, generateProjectCanvasMarkdown({}));
        fs.writeFileSync(infraCanvasPath, generateInfraCanvasMarkdown({}));
        console.log('✅ Templates generados. Llénalos y vuelve a ejecutar `funky init`.');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error al generar los templates:', error.message);
        process.exit(1);
      }
    }

    let canvasConfig = null;

    try {
      if (hasProjectCanvas && hasInfraCanvas) {
        console.log('📄 Ambos Canvas detectados, inicializando en modo Headless...');
        canvasConfig = { skipProjectCanvas: true, skipInfraCanvas: true, projectData: {}, infraData: {} };
      } else if (hasProjectCanvas && !hasInfraCanvas) {
        console.log('📄 PROJECT-CANVAS.md detectado, pero falta INFRA-CANVAS.md.');
        console.log('⚠️ MIGRACIÓN PENDIENTE: Generando INFRA-CANVAS.md con warning para v1.7.0 Legacy.');
        fs.writeFileSync(infraCanvasPath, `> ⚠️ **MIGRACIÓN PENDIENTE**\n\n${generateInfraCanvasMarkdown({})}`);
        canvasConfig = { skipProjectCanvas: true, skipInfraCanvas: true, projectData: {}, infraData: {}, migratingLegacy: true };
      } else {
        console.clear();
        p.intro('🚀 Bienvenido a Funky AI CLI');

        const coreGroup = await p.group(
          {
            framework: () =>
              p.select({
                message: 'Framework Base:',
                options: [
                  { value: 'Next.js (App Router)', label: 'Next.js (App Router)' },
                  { value: 'React + Vite', label: 'React + Vite' },
                  { value: 'Astro', label: 'Astro' },
                ],
              }),
            pattern: () =>
              p.select({
                message: 'Patrón Arquitectónico Base:',
                options: [
                  { value: 'Clean Architecture', label: 'Clean Architecture' },
                  { value: 'Hexagonal', label: 'Hexagonal' },
                  { value: 'Modular', label: 'Modular' },
                ],
              }),
            styling: () =>
              p.select({
                message: 'Estrategia UI:',
                options: [
                  { value: 'Tailwind CSS', label: 'Tailwind CSS' },
                  { value: 'CSS Modules', label: 'CSS Modules' },
                  { value: 'Design System', label: 'Design System' },
                ],
              }),
            state: () =>
              p.select({
                message: 'Gestión de Estado:',
                options: [
                  { value: 'Zustand', label: 'Zustand' },
                  { value: 'Redux', label: 'Redux' },
                  { value: 'React Query', label: 'React Query' },
                  { value: 'Signals', label: 'Signals' },
                ],
              }),
            testing: () =>
              p.select({
                message: 'Estrategia de Testing:',
                options: [
                  { value: 'Sí, TDD (Test-Driven Development)', label: 'Sí, TDD' },
                  { value: 'Sí, BDD (Behavior-Driven Development)', label: 'Sí, BDD' },
                  { value: 'No definido / Decidir luego', label: 'No definido / Decidir luego' },
                ],
              }),
          },
          {
            onCancel: () => {
              p.cancel('Operación cancelada.');
              process.exit(1);
            },
          }
        );

        const infraGroup = await p.group(
          {
            database: () =>
              p.select({
                message: 'Base de Datos / ORM:',
                options: [
                  { value: 'Prisma', label: 'Prisma' },
                  { value: 'Drizzle', label: 'Drizzle' },
                  { value: 'Mongoose', label: 'Mongoose' },
                  { value: 'Supabase', label: 'Supabase' },
                  { value: 'No definido / Decidir luego', label: 'No definido / Decidir luego' },
                ],
              }),
            auth: () =>
              p.select({
                message: 'Autenticación:',
                options: [
                  { value: 'NextAuth', label: 'NextAuth' },
                  { value: 'Clerk', label: 'Clerk' },
                  { value: 'Firebase', label: 'Firebase' },
                  { value: 'Custom JWT', label: 'Custom JWT' },
                  { value: 'No definido / Decidir luego', label: 'No definido / Decidir luego' },
                ],
              }),
            linter: () =>
              p.select({
                message: 'Linter / Formatter:',
                options: [
                  { value: 'ESLint + Prettier Estricto', label: 'ESLint + Prettier Estricto' },
                  { value: 'Biome', label: 'Biome' },
                  { value: 'Standard', label: 'Standard' },
                  { value: 'No definido / Decidir luego', label: 'No definido / Decidir luego' },
                ],
              }),
            deployment: () =>
              p.select({
                message: 'Deployment & CI/CD:',
                options: [
                  { value: 'Vercel', label: 'Vercel' },
                  { value: 'AWS / Docker', label: 'AWS / Docker' },
                  { value: 'GitHub Actions', label: 'GitHub Actions' },
                  { value: 'GitLab CI', label: 'GitLab CI' },
                  { value: 'No definido / Decidir luego', label: 'No definido / Decidir luego' },
                ],
              }),
          },
          {
            onCancel: () => {
              p.cancel('Operación cancelada.');
              process.exit(1);
            },
          }
        );

        p.outro('📝 Generando Canvas...');
        canvasConfig = {
          skipProjectCanvas: false,
          skipInfraCanvas: false,
          projectData: {
            framework: coreGroup.framework,
            pattern: coreGroup.pattern,
            styling: coreGroup.styling,
            state: coreGroup.state,
            testing: coreGroup.testing,
          },
          infraData: {
            database: infraGroup.database,
            auth: infraGroup.auth,
            linter: infraGroup.linter,
            deployment: infraGroup.deployment,
          },
        };
      }

      runInit({ templatesDir, targetBase, canvasConfig });
    } catch (error) {
      console.error('❌ Error al inicializar Funky AI:', error.message);
      process.exit(1);
    }
  });
