import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeIntentions } from '../utils/fs-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resuelve el nombre del proyecto destino para interpolación de templates.
 * Fuente (en orden): campo `name` del package.json del targetBase; si no existe
 * o no es legible, cae a basename(targetBase).
 * @param {string} targetBase - Directorio destino.
 * @returns {string}
 */
function resolveProjectName(targetBase) {
  const pkgPath = path.join(targetBase, 'package.json');
  try {
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (typeof pkg.name === 'string' && pkg.name.trim()) {
        return pkg.name.trim();
      }
    }
  } catch {
    // package.json ilegible o sin campo name: se cae al basename
  }
  return path.basename(targetBase);
}

/**
 * Lógica pura del comando `funky scaffold`.
 * Copia toda la estructura base del ecosistema Funky AI (reglas de agentes,
 * ORCHESTRATOR-STATE, plantillas SDD, directorios engram).
 *
 * @param {object} opts
 * @param {string} opts.templatesDir - Directorio absoluto de templates de bootstrap.
 * @param {string} opts.targetBase   - Directorio destino (normalmente process.cwd()).
 * @returns {Array<{ action: string, src?: string, dest: string, content?: string }>}
 */
export function runScaffold({ templatesDir, targetBase }) {
  const intentions = [];
  const projectName = resolveProjectName(targetBase);

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
  // README.md se genera interpolando {{project_name}}; si el template no se puede
  // leer, cae al copy del archivo crudo (placeholder literal).
  try {
    const readmeContent = fs
      .readFileSync(path.join(templatesDir, 'README.md'), 'utf8')
      .replace(/{{project_name}}/g, projectName);
    intentions.push({
      action: 'create',
      dest: path.join(targetBase, 'README.md'),
      content: readmeContent,
    });
  } catch {
    add('README.md', 'README.md');
  }
  add('TEMPLATE_GUIDE.md', 'TEMPLATE_GUIDE.md');

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
  add('funky-ai-rules/sabueso-route-a.md',                        '.agents/rules/sabueso-route-a.md');

  // ── bootstrap/sdd/ → .agents/templates/sdd/ ──
  add('sdd/docs.md',              '.agents/templates/sdd/docs.md');
  add('sdd/explore.md',           '.agents/templates/sdd/explore.md');
  add('sdd/proposal.md',          '.agents/templates/sdd/proposal.md');
  add('sdd/release-checklist.md', '.agents/templates/sdd/release-checklist.md');
  add('sdd/release-notes.md',     '.agents/templates/sdd/release-notes.md');
  add('sdd/report.md',            '.agents/templates/sdd/report.md');
  add('sdd/spec.template.md',              '.agents/templates/sdd/spec.template.md');
  add('sdd/tasks.md',             '.agents/templates/sdd/tasks.md');

  // ── Exception: rfc-template a openspec/rfcs/ ──
  add('sdd/000-rfc-template.md',  'openspec/rfcs/000-rfc-template.md');

  // ── Docs compartidos: docs-live-index.md e índice seccional (mismo template que funky skills — R-SK-5) ──
  add('sdd/docs-live-index.md', '.agents/templates/sdd/docs-live-index.md');
  add('sdd/docs-index/_indice-seccional-template.md', '.agents/templates/sdd/docs-index/_indice-seccional-template.md');

  // ── Custom workflows: prompts T3 para antigravity (siempre se copian) ──
  add('custom-workflows/sdd/funky-explore.md',  'docs/funky-ai/prompts/sdd/funky-explore.md');
  add('custom-workflows/sdd/funky-propose.md',  'docs/funky-ai/prompts/sdd/funky-propose.md');
  add('custom-workflows/sdd/funky-spec.md',     'docs/funky-ai/prompts/sdd/funky-spec.md');
  add('custom-workflows/sdd/funky-design.md',   'docs/funky-ai/prompts/sdd/funky-design.md');
  add('custom-workflows/sdd/funky-tasks.md',    'docs/funky-ai/prompts/sdd/funky-tasks.md');
  add('custom-workflows/sdd/funky-apply.md',    'docs/funky-ai/prompts/sdd/funky-apply.md');
  add('custom-workflows/sdd/funky-verify.md',   'docs/funky-ai/prompts/sdd/funky-verify.md');
  add('custom-workflows/sdd/funky-archive.md',  'docs/funky-ai/prompts/sdd/funky-archive.md');
  add('custom-workflows/sdd/funky-worker.md',   'docs/funky-ai/prompts/sdd/funky-worker.md');

  // ── Crear directorios sharded de engram ──
  const engramDirs = ['architecture', 'pattern', 'discovery', 'decision', 'bugfix', 'session', 'release'];
  for (const dir of engramDirs) {
    intentions.push({ action: 'mkdir', dest: path.join(targetBase, 'docs', 'engram', dir) });
  }

  return intentions;
}

/**
 * Lógica pura del comando `funky scaffold` (scaffold agnóstico OpenSpec/SDD).
 * Instala SOLO la base documental común a cualquier ecosistema que use
 * OpenSpec/SDD: README interpolado, ORCHESTRATOR-STATE, release-notes y RFC.
 * No instala reglas de agentes ni templates de proceso: eso es `funky sdd install`.
 *
 * @param {object} opts
 * @param {string} opts.templatesDir - Directorio absoluto de templates de bootstrap.
 * @param {string} opts.targetBase   - Directorio destino (normalmente process.cwd()).
 * @returns {Array<{ action: string, src?: string, dest: string, content?: string }>}
 */
export function runAgnosticScaffold({ templatesDir, targetBase }) {
  const intentions = [];
  const projectName = resolveProjectName(targetBase);

  /** @type {(src: string, dest: string) => void} */
  const add = (src, dest) => {
    intentions.push({
      action: 'copy',
      src: path.join(templatesDir, src),
      dest: path.join(targetBase, dest),
    });
  };

  // README.md se genera interpolando {{project_name}}; si el template no se puede
  // leer, cae al copy del archivo crudo (placeholder literal).
  try {
    const readmeContent = fs
      .readFileSync(path.join(templatesDir, 'README.md'), 'utf8')
      .replace(/{{project_name}}/g, projectName);
    intentions.push({
      action: 'create',
      dest: path.join(targetBase, 'README.md'),
      content: readmeContent,
    });
  } catch {
    add('README.md', 'README.md');
  }
  add('ORCHESTRATOR-STATE.md', 'ORCHESTRATOR-STATE.md');
  add('sdd/release-notes.md', '.agents/templates/sdd/release-notes.md');
  add('sdd/000-rfc-template.md', 'openspec/rfcs/000-rfc-template.md');

  return intentions;
}

/**
 * Handler compartido del flujo de instalación del framework.
 * Lo usa `funky sdd install` (nombre canónico).
 */
export async function runScaffoldCommand() {
  const bootstrapDir = path.join(__dirname, '../templates/bootstrap');
  const targetBase = process.cwd();

  try {
    console.log('🚀 Instalando estructura Funky AI...');
    const intentions = runScaffold({ templatesDir: bootstrapDir, targetBase });

    const { created, skipped, logs } = await executeIntentions(intentions);
    for (const log of logs) {
      console.log(log);
    }
    console.log(`\n✅ Funky AI instalado. ${created} archivos creados, ${skipped} ya existian.`);
  } catch (error) {
    console.error('❌ Error al instalar Funky AI:', error.message);
    process.exit(1);
  }
}

/**
 * Handler del comando agnóstico `funky scaffold`: instala solo la base
 * documental OpenSpec/SDD (README, ORCHESTRATOR-STATE, release-notes, RFC).
 */
export async function runAgnosticScaffoldCommand() {
  const bootstrapDir = path.join(__dirname, '../templates/bootstrap');
  const targetBase = process.cwd();

  try {
    console.log('🚀 Instalando scaffold agnóstico OpenSpec/SDD...');
    const intentions = runAgnosticScaffold({ templatesDir: bootstrapDir, targetBase });

    const { created, skipped, logs } = await executeIntentions(intentions);
    for (const log of logs) {
      console.log(log);
    }
    console.log(`\n✅ Scaffold agnóstico instalado. ${created} archivos creados, ${skipped} ya existian.`);
  } catch (error) {
    console.error('❌ Error al instalar el scaffold agnóstico:', error.message);
    process.exit(1);
  }
}

export const installCommand = new Command('install')
  .description('Copia toda la estructura base del ecosistema Funky AI (reglas de agentes, ORCHESTRATOR-STATE, plantillas SDD, directorios engram)')
  .action(runScaffoldCommand);

export const scaffoldCommand = new Command('scaffold')
  .description('Instala la base documental agnóstica OpenSpec/SDD (README, ORCHESTRATOR-STATE, release-notes, RFC template)')
  .action(runAgnosticScaffoldCommand);
