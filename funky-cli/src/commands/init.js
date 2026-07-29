import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateProjectCanvasMarkdown, generateInfraCanvasMarkdown } from '../utils/canvas.js';
import { executeIntentions } from '../utils/fs-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Escanea un directorio recursivamente y devuelve todos los archivos
 * con su ruta relativa y absoluta.
 * Si el directorio no existe, devuelve array vacío (sin errores).
 *
 * @param {string} dirPath - Ruta absoluta del directorio a escanear
 * @returns {Array<{ relativePath: string, fullPath: string }>}
 */
export function collectDirFiles(dirPath) {
  try {
    const files = [];
    const walk = (currentDir, prefix) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath, relPath);
        } else {
          files.push({ relativePath: relPath, fullPath: fullPath });
        }
      }
    };
    walk(dirPath, '');
    return files;
  } catch {
    return [];
  }
}

/**
 * Lógica pura del comando `funky init`.
 * Separada del Command de Commander para ser 100% testeable de forma unitaria.
 *
 * @param {object} opts
 * @param {string} opts.templatesDir - Directorio absoluto de templates de bootstrap.
 * @param {string} opts.targetBase   - Directorio destino (normalmente process.cwd()).
 * @param {object} opts.canvasConfig - Opcional. Configuración para generar PROJECT-CANVAS.md dinámico.
 * @param {Array<{ relativePath: string, fullPath: string }>} [opts.rulesFiles] - Archivos pre-escaneados de funky-ai-rules/.
 * @param {Array<{ relativePath: string, fullPath: string }>} [opts.sddFiles] - Archivos pre-escaneados de bootstrap/sdd/.
 * @returns {Array<{ action: string, src?: string, dest: string, content?: string }>}
 */
export function runInit({ templatesDir, targetBase, canvasConfig, rulesFiles = [], sddFiles = [] }) {
  const intentions = [];

  /** @type {(src: string, dest: string) => void} */
  const addCopy = (src, dest) => {
    intentions.push({
      action: 'copy',
      src: path.join(templatesDir, src),
      dest: path.join(targetBase, dest),
    });
  };

  // ── Root files (siempre se copian) ──
  addCopy('ORCHESTRATOR-STATE.md', 'ORCHESTRATOR-STATE.md');
  addCopy('README.md', 'README.md');
  addCopy('TEMPLATE_GUIDE.md', 'TEMPLATE_GUIDE.md');

  // ── funky-ai-rules/ → .agents/rules/ ──
  for (const file of rulesFiles) {
    intentions.push({
      action: 'copy',
      src: file.fullPath,
      dest: path.join(targetBase, '.agents', 'rules', file.relativePath),
    });
  }

  // ── bootstrap/sdd/ → .agents/templates/sdd/ ──
  for (const file of sddFiles) {
    // Exception: 000-rfc-template.md va a openspec/rfcs/
    if (file.relativePath === '000-rfc-template.md') {
      intentions.push({
        action: 'copy',
        src: file.fullPath,
        dest: path.join(targetBase, 'openspec', 'rfcs', '000-rfc-template.md'),
      });
    } else {
      intentions.push({
        action: 'copy',
        src: file.fullPath,
        dest: path.join(targetBase, '.agents', 'templates', 'sdd', file.relativePath),
      });
    }
  }

  // ── Generar docs-live-index.md en .agents/templates/sdd/ ──
  intentions.push({
    action: 'create',
    dest: path.join(targetBase, '.agents', 'templates', 'sdd', 'docs-live-index.md'),
    content: `# 📚 Índice de Docs Vivos (SSOT)

| # | Doc | Cubre / Propósito | Índice Seccional | Aplica si... |
|---|-----|-------------------|------------------|--------------|
`,
  });

  // ── Crear directorios sharded de engram ──
  const engramDirs = ['architecture', 'pattern', 'discovery', 'decision', 'bugfix', 'session', 'release'];
  for (const dir of engramDirs) {
    const dirPath = path.join(targetBase, 'docs', 'engram', dir);
    intentions.push({ action: 'mkdir', dest: dirPath });
  }

  // ── Canvases (generación por CLI, no template estático) ──
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
          console.log('ℹ️  No se encontraron canvases. Instalando solo el framework Funky AI.');
          console.log('ℹ️  Si después querés los canvases, ejecutá `funky init` y luego `funky init --bootstrap` de nuevo.');
          canvasConfig = null;
        }

        // Escanear subárboles de templates
        const rulesFiles = collectDirFiles(path.join(templatesDir, 'funky-ai-rules'));
        const sddFiles = collectDirFiles(path.join(templatesDir, 'sdd'));

        const intentions = runInit({ templatesDir, targetBase, canvasConfig, rulesFiles, sddFiles });

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
        const guideSrc = path.join(__dirname, '../templates/funky-pipeline/canvas-planning-guide.md');
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
