import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import { executeIntentions } from '../utils/fs-adapter.js';
import sddReleaseManifest from '../skills/sdd-release/manifest.js';
import sddDocsSyncManifest from '../skills/sdd-docs-sync/manifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// R-SK-8: manifest = única fuente de recursos de cada skill.
const MANIFESTS = [sddReleaseManifest, sddDocsSyncManifest];

/**
 * Lógica pura del comando `funky skills`.
 * Cada skill declara sus recursos en su manifest.js (`src` relativo a srcDir,
 * `dest` relativo a targetBase, `optional` = src ausente permitido). Los docs
 * compartidos viven en templates/bootstrap/sdd/ — el MISMO src que usa
 * `funky scaffold` (paridad byte a byte, R-SK-5). NO realiza I/O; el salto por
 * src opcional ausente lo resuelve executeIntentions (R-SK-3).
 *
 * @param {object} opts
 * @param {string} opts.srcDir      - Raíz de src de funky-cli (contiene skills/ y templates/).
 * @param {string} opts.targetBase  - Directorio destino (normalmente process.cwd()).
 * @returns {Array<{ action: 'copy', src: string, dest: string, optional?: boolean }>}
 */
export function runSkills({ srcDir, targetBase }) {
  const intentions = [];

  for (const manifest of MANIFESTS) {
    for (const item of manifest) {
      const intention = {
        action: 'copy',
        src: path.join(srcDir, item.src),
        dest: path.join(targetBase, item.dest),
      };
      if (item.optional) {
        intention.optional = true;
      }
      intentions.push(intention);
    }
  }

  return intentions;
}

export const skillsCommand = new Command('skills')
  .description('Instala las skills base (sdd-release, sdd-docs-sync) desde sus manifests y bootstrapa los docs compartidos de SDD (docs-live-index, formato canónico de índice seccional, release-notes)')
  .action(async () => {
    const srcDir = path.join(__dirname, '..');
    const targetBase = process.cwd();

    try {
      console.log('🚀 Instalando skills y docs compartidos SDD...');
      const intentions = runSkills({ srcDir, targetBase });

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
