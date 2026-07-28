import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateProjectCanvasMarkdown, generateInfraCanvasMarkdown } from '../utils/canvas.js';
import { executeIntentions } from '../utils/fs-adapter.js';

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
 * @param {string[]} [opts.selectedProtocols] - Array de nombres de archivo de protocolo a copiar.
 * @returns {{ created: number, skipped: number }}
 */
export function runInit({ templatesDir, targetBase, canvasConfig, selectedProtocols = [] }) {
  const intentions = [];

  const filesToCopy = [
    { src: 'ORCHESTRATOR-STATE.md', dest: 'ORCHESTRATOR-STATE.md' },
    { src: 'agents-rules-engram-protocol.md', dest: path.join('.agents', 'rules', 'engram-protocol.md') },
    { src: 'agents-rules-secops.md', dest: path.join('.agents', 'rules', 'secops.md') },
    { src: 'agents-rules-sdd-orchestrator.md', dest: path.join('.agents', 'rules', 'sdd-orchestrator.md') },
    { src: 'canvas-planning-guide.md', dest: path.join('docs', 'funky-ai', 'cli', 'canvas-planning-guide.md') },
    { src: path.join('..', 'sdd', 'architecture-assessment.md'), dest: path.join('docs', 'architecture-assessment.md') },
    { src: path.join('..', 'sdd', 'rfc-template.md'), dest: path.join('openspec', 'rfcs', '000-TEMPLATE.md') },
    { src: 'TEMPLATE_GUIDE.md', dest: 'TEMPLATE_GUIDE.md' },
    { src: path.join('..', 'README.md'), dest: 'README.md' },
    { src: 'engram-discoveries.md', dest: path.join('docs', 'engram', 'discoveries.md') },
    { src: 'engram-bugfixes.md', dest: path.join('docs', 'engram', 'bugfix', 'bugfixes.md') },
    { src: 'architecture-assessment-guide.md', dest: path.join('docs', 'architecture-assessment-guide.md') },
    { src: 'agents-rules-secops-setup.md', dest: path.join('.agents', 'rules', 'secops-setup.md') },
  ];

  for (const file of filesToCopy) {
    const sourcePath = path.join(templatesDir, file.src);
    const destPath = path.join(targetBase, file.dest);
    intentions.push({ action: 'copy', src: sourcePath, dest: destPath });
  }

  // Create sharded engram directories
  const engramDirs = ['architecture', 'pattern', 'discovery', 'decision', 'bugfix', 'session', 'release'];
  for (const dir of engramDirs) {
    const dirPath = path.join(targetBase, 'docs', 'engram', dir);
    intentions.push({ action: 'mkdir', dest: dirPath });
  }

  // Generar index base con todos los encabezados
  const engramIndexDest = path.join(targetBase, 'docs', 'engram', 'index.md');
  const engramIndexContent = '# Engram Index\n\nDirectorio unificado de conocimientos, decisiones y patrones.\n\n## Architecture\n\n## Pattern\n\n## Discovery\n\n## Decision\n\n## Bugfix\n\n## Session\n\n## Release\n';
  intentions.push({ action: 'create', dest: engramIndexDest, content: engramIndexContent });

  if (canvasConfig) {
    if (!canvasConfig.skipProjectCanvas) {
      const markdown = generateProjectCanvasMarkdown(canvasConfig.projectData || {});
      const canvasPath = path.join(targetBase, 'PROJECT-CANVAS.md');
      intentions.push({ action: 'create', dest: canvasPath, content: markdown });
    }

    if (!canvasConfig.skipInfraCanvas) {
      const markdown = generateInfraCanvasMarkdown(canvasConfig.infraData || {});
      const canvasPath = path.join(targetBase, 'INFRA-CANVAS.md');
      intentions.push({ action: 'create', dest: canvasPath, content: markdown });
    }
  }

  // Copia de protocolos on-demand seleccionados
  if (selectedProtocols && selectedProtocols.length > 0) {
    const protocolsSrcDir = path.join(templatesDir, '..', 'protocols');
    const protocolsDestDir = path.join(targetBase, '.agents', 'protocols');
    
    for (const protocolFile of selectedProtocols) {
      const srcPath = path.join(protocolsSrcDir, protocolFile);
      const destPath = path.join(protocolsDestDir, protocolFile);
      intentions.push({ action: 'copy', src: srcPath, dest: destPath });
    }

    // También copiar/regenerar index.md en destino listando solo los protocolos importados
    const indexDestPath = path.join(protocolsDestDir, 'index.md');
    const indexSrcPath = path.join(protocolsSrcDir, 'index.md');
    intentions.push({ action: 'copy', src: indexSrcPath, dest: indexDestPath });
  }

  return intentions;
}

export const initCommand = new Command('init')
  .description('Genera PROJECT-CANVAS.md e INFRA-CANVAS.md para iniciar la planificacion del proyecto. Usa --bootstrap para copiar toda la estructura del ecosistema Funky AI.')
  .option('-b, --bootstrap', 'Copia toda la estructura base del ecosistema Funky AI (reglas de agentes, ORCHESTRATOR-STATE, plantillas, directorios engram)')
  .action(async (options) => {
    const templatesDir = path.join(__dirname, '../templates/bootstrap');
    const targetBase = process.cwd();

    const projectCanvasPath = path.join(targetBase, 'PROJECT-CANVAS.md');
    const infraCanvasPath = path.join(targetBase, 'INFRA-CANVAS.md');
    
    const hasProjectCanvas = fs.existsSync(projectCanvasPath);
    const hasInfraCanvas = fs.existsSync(infraCanvasPath);

    if (options.bootstrap) {
      let canvasConfig = null;
      let selectedProtocols = [];
      let environment = 'ide';

      try {
        if (hasProjectCanvas && hasInfraCanvas) {
          console.log('📄 Inicializando estructura completa del ecosistema...');
          canvasConfig = { skipProjectCanvas: true, skipInfraCanvas: true, projectData: {}, infraData: {} };
        } else if (hasProjectCanvas && !hasInfraCanvas) {
          console.log('📄 PROJECT-CANVAS.md detectado, pero falta INFRA-CANVAS.md.');
          console.log('⚠️ MIGRACION PENDIENTE: Generando INFRA-CANVAS.md con warning para v1.7.0 Legacy.');
          fs.writeFileSync(infraCanvasPath, `> ⚠️ **MIGRACION PENDIENTE**\n\n${generateInfraCanvasMarkdown({})}`);
          canvasConfig = { skipProjectCanvas: true, skipInfraCanvas: true, projectData: {}, infraData: {}, migratingLegacy: true };
        } else {
          console.error('❌ No se encontraron PROJECT-CANVAS.md ni INFRA-CANVAS.md.');
          console.error('Ejecuta `funky init` primero para generarlos.');
          process.exit(1);
        }

        const intentions = runInit({ templatesDir, targetBase, canvasConfig, selectedProtocols });
        
        console.log('🚀 Inicializando Funky AI...');
        const { created, skipped, logs } = executeIntentions(intentions);
        for (const log of logs) {
          console.log(log);
        }
        console.log(`\n✅ Funky AI inicializado. ${created} archivos creados, ${skipped} ya existian.`);
      } catch (error) {
        console.error('❌ Error al inicializar Funky AI:', error.message);
        process.exit(1);
      }
    } else {
      try {
        if (hasProjectCanvas || hasInfraCanvas) {
          console.error('❌ Error: Ya existe PROJECT-CANVAS.md o INFRA-CANVAS.md en el directorio.');
          process.exit(1);
        }
        fs.writeFileSync(projectCanvasPath, generateProjectCanvasMarkdown({}));
        fs.writeFileSync(infraCanvasPath, generateInfraCanvasMarkdown({}));
        const guideSrc = path.join(templatesDir, 'canvas-planning-guide.md');
        const guideDest = path.join(targetBase, 'canvas-planning-guide.md');
        if (!fs.existsSync(guideDest)) {
          fs.copyFileSync(guideSrc, guideDest);
          console.log('✅ canvas-planning-guide.md copiado. Usala como referencia para llenar los Canvas.');
        }
        console.log('✅ PROJECT-CANVAS.md e INFRA-CANVAS.md generados. Llenalos con tu equipo y ejecuta `funky init --bootstrap` para inicializar el ecosistema.');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error al generar los canvases:', error.message);
        process.exit(1);
      }
    }
  });
