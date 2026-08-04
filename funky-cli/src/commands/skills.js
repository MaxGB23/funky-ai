import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeIntentions } from '../utils/fs-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lógica pura del comando `funky skills`.
 * Arma las intenciones de copia que inyectan las skills base de gentle-ai
 * (templates/gentle/skills/) y bootstrapean los docs compartidos de SDD
 * (templates/bootstrap/sdd/) en el proyecto destino. NO realiza I/O.
 *
 * @param {object} opts
 * @param {string} opts.templatesDir - Directorio raíz de templates (src/templates): contiene bootstrap/ y gentle/.
 * @param {string} opts.targetBase   - Directorio destino (normalmente process.cwd()).
 * @returns {Array<{ action: 'copy', src: string, dest: string }>}
 */
export function runSkills({ templatesDir, targetBase }) {
  const intentions = [];

  /** @type {(src: string, dest: string) => void} */
  const add = (src, dest) => {
    intentions.push({
      action: 'copy',
      src: path.join(templatesDir, src),
      dest: path.join(targetBase, dest),
    });
  };

  // ── Skills base gentle-ai → .agents/skills/ ──
  add('gentle/skills/sdd-release/SKILL.md', '.agents/skills/sdd-release/SKILL.md');
  add('gentle/skills/sdd-docs-sync/SKILL.md', '.agents/skills/sdd-docs-sync/SKILL.md');

  // ── Docs compartidos bootstrap/sdd/ → .agents/templates/sdd/ (mismo template que scaffold — R-SK-5) ──
  add('bootstrap/sdd/docs-live-index.md', '.agents/templates/sdd/docs-live-index.md');
  add('bootstrap/sdd/docs-index/template.md', '.agents/templates/sdd/docs-index/template.md');

  return intentions;
}

export const skillsCommand = new Command('skills')
  .description('Inyecta las skills base de gentle-ai (sdd-release, sdd-docs-sync) y bootstrapa los docs compartidos de SDD (docs-live-index, formato canónico de índice seccional)')
  .action(async () => {
    const templatesDir = path.join(__dirname, '../templates');
    const targetBase = process.cwd();

    try {
      console.log('🚀 Instalando skills base de gentle-ai y docs compartidos SDD...');
      const intentions = runSkills({ templatesDir, targetBase });

      const { created, skipped, logs } = executeIntentions(intentions);
      for (const log of logs) {
        console.log(log);
      }
      console.log(`\n✅ Skills y docs compartidos instalados. ${created} archivos creados, ${skipped} ya existian.`);
    } catch (error) {
      console.error('❌ Error al instalar skills y docs compartidos:', error.message);
      process.exit(1);
    }
  });
