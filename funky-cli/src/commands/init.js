import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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
 * @returns {Array<{ action: string, src?: string, dest: string, content?: string }>}
 */
export function runInit({ templatesDir, targetBase }) {
  const intentions = [];

  /** @type {(src: string, dest: string) => void} */
  const add = (src, dest) => {
    intentions.push({
      action: 'copy',
      src: path.join(templatesDir, src),
      dest: path.join(targetBase, dest),
    });
  };

  // ── Root files ──
  add('ORCHESTRATOR-STATE.md', 'ORCHESTRATOR-STATE.md');
  add('README.md', 'README.md');
  add('TEMPLATE_GUIDE.md', 'TEMPLATE_GUIDE.md');
  add('PROJECT-CANVAS.md', 'PROJECT-CANVAS.md');
  add('INFRA-CANVAS.md', 'INFRA-CANVAS.md');

  // ── funky-ai-rules/ → .agents/rules/ ──
  add('funky-ai-rules/engram-protocol.md',                '.agents/rules/engram-protocol.md');
  add('funky-ai-rules/sdd-escalation-matrix.md',          '.agents/rules/sdd-escalation-matrix.md');
  add('funky-ai-rules/sdd-orchestrator.md',               '.agents/rules/sdd-orchestrator.md');
  add('funky-ai-rules/sdd-preflight.md',                  '.agents/rules/sdd-preflight.md');
  add('funky-ai-rules/secops.md',                         '.agents/rules/secops.md');
  add('funky-ai-rules/tier1-router.md',                   '.agents/rules/tier1-router.md');
  add('funky-ai-rules/tier2-router.md',                   '.agents/rules/tier2-router.md');
  add('funky-ai-rules/tier3-router.md',                   '.agents/rules/tier3-router.md');
  add('funky-ai-rules/tier2-delegation/t2-archive.md',    '.agents/rules/tier2-delegation/t2-archive.md');
  add('funky-ai-rules/tier2-delegation/t2-explore.md',    '.agents/rules/tier2-delegation/t2-explore.md');
  add('funky-ai-rules/tier2-delegation/t2-propose.md',    '.agents/rules/tier2-delegation/t2-propose.md');
  add('funky-ai-rules/tier2-delegation/t2-spec.md',       '.agents/rules/tier2-delegation/t2-spec.md');
  add('funky-ai-rules/tier2-delegation/t2-tasks.md',      '.agents/rules/tier2-delegation/t2-tasks.md');
  add('funky-ai-rules/tier2-delegation/t2-verify.md',     '.agents/rules/tier2-delegation/t2-verify.md');
  add('funky-ai-rules/tier3-interactive/interactive-apply.md',   '.agents/rules/tier3-interactive/interactive-apply.md');
  add('funky-ai-rules/tier3-interactive/interactive-archive.md',  '.agents/rules/tier3-interactive/interactive-archive.md');
  add('funky-ai-rules/tier3-interactive/interactive-design.md',   '.agents/rules/tier3-interactive/interactive-design.md');
  add('funky-ai-rules/tier3-interactive/interactive-explore.md',  '.agents/rules/tier3-interactive/interactive-explore.md');
  add('funky-ai-rules/tier3-interactive/interactive-propose.md',  '.agents/rules/tier3-interactive/interactive-propose.md');
  add('funky-ai-rules/tier3-interactive/interactive-spec.md',     '.agents/rules/tier3-interactive/interactive-spec.md');
  add('funky-ai-rules/tier3-interactive/interactive-tasks.md',    '.agents/rules/tier3-interactive/interactive-tasks.md');
  add('funky-ai-rules/tier3-interactive/interactive-verify.md',   '.agents/rules/tier3-interactive/interactive-verify.md');
  add('funky-ai-rules/tier3-interactive/risk-decision.md',        '.agents/rules/tier3-interactive/risk-decision.md');

  // ── bootstrap/sdd/ → .agents/templates/sdd/ ──
  add('sdd/docs.md',              '.agents/templates/sdd/docs.md');
  add('sdd/explore.md',           '.agents/templates/sdd/explore.md');
  add('sdd/proposal.md',          '.agents/templates/sdd/proposal.md');
  add('sdd/release-checklist.md', '.agents/templates/sdd/release-checklist.md');
  add('sdd/release-notes.md',     '.agents/templates/sdd/release-notes.md');
  add('sdd/report.md',            '.agents/templates/sdd/report.md');
  add('sdd/spec.md',              '.agents/templates/sdd/spec.md');
  add('sdd/tasks.md',             '.agents/templates/sdd/tasks.md');

  // ── Exception: rfc-template a openspec/rfcs/ ──
  add('sdd/000-rfc-template.md',  'openspec/rfcs/000-rfc-template.md');

  // ── Generar docs-live-index.md en .agents/templates/sdd/ ──
  intentions.push({
    action: 'create',
    dest: path.join(targetBase, '.agents', 'templates', 'sdd', 'docs-live-index.md'),
    content: `# 📚 Índice de Docs Vivos (SSOT)

| # | Doc | Cubre / Propósito | Índice Seccional | Aplica si... |
|---|-----|-------------------|------------------|--------------|
| 1 | \`docs/<ruta-del-doc>.md\` | Descripción breve del alcance del documento. | [.agents/templates/sdd/docs-index/<nombre_doc>.md](.agents/templates/sdd/docs-index/<nombre_doc>.md) | Condición que activa la necesidad de actualizar esta documentación. |
`,
  });

  // ── Crear directorio docs-index para el agente ──
  intentions.push({ action: 'mkdir', dest: path.join(targetBase, '.agents', 'templates', 'sdd', 'docs-index') });

  // ── Crear directorios sharded de engram ──
  const engramDirs = ['architecture', 'pattern', 'discovery', 'decision', 'bugfix', 'session', 'release'];
  for (const dir of engramDirs) {
    intentions.push({ action: 'mkdir', dest: path.join(targetBase, 'docs', 'engram', dir) });
  }

  return intentions;
}

export const initCommand = new Command('init')
  .description('Genera PROJECT-CANVAS.md e INFRA-CANVAS.md para iniciar la planificacion del proyecto. Usa --bootstrap para copiar toda la estructura del ecosistema Funky AI.')
  .option('-b, --bootstrap', 'Copia toda la estructura base del ecosistema Funky AI (reglas de agentes, ORCHESTRATOR-STATE, plantillas, directorios engram)')
  .action(async (options) => {
    const templatesDir = path.join(__dirname, '../templates/bootstrap');
    const targetBase = process.cwd();

    if (options.bootstrap) {
      try {
        console.log('🚀 Inicializando Funky AI...');
        const intentions = runInit({ templatesDir, targetBase });

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
        const projectCanvasPath = path.join(targetBase, 'PROJECT-CANVAS.md');
        const infraCanvasPath = path.join(targetBase, 'INFRA-CANVAS.md');

        if (fs.existsSync(projectCanvasPath) || fs.existsSync(infraCanvasPath)) {
          console.error('❌ Error: Ya existe PROJECT-CANVAS.md o INFRA-CANVAS.md en el directorio.');
          process.exit(1);
        }

        const guideDest = path.join(targetBase, 'canvas-planning-guide.md');
        const intentions = [
          { action: 'copy', src: path.join(templatesDir, 'PROJECT-CANVAS.md'), dest: projectCanvasPath },
          { action: 'copy', src: path.join(templatesDir, 'INFRA-CANVAS.md'), dest: infraCanvasPath },
        ];

        if (!fs.existsSync(guideDest)) {
          const guideSrc = path.join(__dirname, '../templates/funky-pipeline/canvas-planning-guide.md');
          intentions.push({ action: 'copy', src: guideSrc, dest: guideDest });
        }

        const { created, skipped, logs } = executeIntentions(intentions);
        for (const log of logs) {
          console.log(log);
        }
        console.log(`\n✅ Canvases creados. Ejecuta \`funky init --bootstrap\` para instalar el ecosistema completo.`);
      } catch (error) {
        console.error('❌ Error al generar los canvases:', error.message);
        process.exit(1);
      }
    }
  });
