import fs from 'fs';
import { Command } from 'commander';
import path from 'path';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import { executeIntentions } from '../utils/fs-adapter.js';
import sddReleaseManifest from '../skills/sdd-release/manifest.js';
import sddDocsSyncManifest from '../skills/sdd-docs-sync/manifest.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// R-SK-8: manifest = única fuente de recursos de cada skill.
const MANIFESTS = [sddReleaseManifest, sddDocsSyncManifest];

/**
 * Nombre de skill de un manifest: carpeta destino de su propio SKILL.md en .agents/skills/.
 * @param {Array<{ src: string, dest: string, optional?: boolean }>} manifest
 * @returns {string}
 */
function skillNameOf(manifest) {
  const entry = manifest.find((item) => item.dest.startsWith('.agents/skills/'));
  return path.basename(path.dirname(entry.dest));
}

/**
 * Autodetección (R-SK-7): directorios bajo srcDir/skills/ que contienen SKILL.md.
 * @param {string} srcDir - Raíz de src de funky-cli.
 * @returns {string[]} Nombres de skills, orden estables (sort alfabético).
 */
export function discoverSkills(srcDir) {
  const skillsDir = path.join(srcDir, 'skills');
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && fs.existsSync(path.join(skillsDir, entry.name, 'SKILL.md'))
    )
    .map((entry) => entry.name)
    .sort();
}

/**
 * Lógica pura del comando `funky skills`.
 * Cada skill declara sus recursos en su manifest.js (`src` relativo a srcDir,
 * `dest` relativo a targetBase, `optional` = src ausente permitido). Los docs
 * compartidos viven en templates/bootstrap/sdd/ — el MISMO src que usa
 * `funky scaffold` (paridad byte a byte, R-SK-5). NO realiza I/O; el salto por
 * src opcional ausente lo resuelve executeIntentions (R-SK-3).
 *
 * Orden determinista (D3): sort por skill, luego orden del manifest.
 *
 * @param {object} opts
 * @param {string} opts.srcDir         - Raíz de src de funky-cli (contiene skills/ y templates/).
 * @param {string} opts.targetBase     - Directorio destino (normalmente process.cwd()).
 * @param {string[]} [opts.selectedSkills] - Skills a instalar; omisión = todas.
 * @returns {Array<{ action: 'copy', src: string, dest: string, optional?: boolean }>}
 */
export function runSkills({ srcDir, targetBase, selectedSkills }) {
  const byName = new Map(MANIFESTS.map((manifest) => [skillNameOf(manifest), manifest]));
  const selected = selectedSkills ?? [...byName.keys()];
  const intentions = [];

  for (const name of [...byName.keys()].sort()) {
    if (!selected.includes(name)) continue;

    for (const item of byName.get(name)) {
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
  .description('Instala las skills detectadas (sdd-release, sdd-docs-sync) desde sus manifests y bootstrapa los docs compartidos de SDD (docs-live-index, formato canónico de índice seccional, release-notes)')
  .action(async () => {
    const srcDir = path.join(__dirname, '..');
    const targetBase = process.cwd();

    try {
      const available = discoverSkills(srcDir);
      if (available.length === 0) {
        console.log('⚠️ No se encontraron skills en src/skills/.');
        return;
      }

      p.intro('funky skills — instalador interactivo');

      const selection = await p.multiselect({
        message: '¿Qué skills quieres instalar?',
        options: [
          { value: '__all__', label: 'Todas' },
          ...available.map((name) => ({ value: name, label: name })),
        ],
        required: false,
      });

      if (p.isCancel(selection)) {
        p.cancel('Operación cancelada.');
        process.exit(1);
      }

      // R-SK-6: selección vacía ⇒ mensaje y salida sin I/O.
      const selected = selection.includes('__all__') ? available : selection;
      if (selected.length === 0) {
        console.log('ℹ️ No seleccionaste ninguna skill. No se realizó ningún cambio.');
        return;
      }

      console.log('🚀 Instalando skills y docs compartidos SDD...');
      const intentions = runSkills({ srcDir, targetBase, selectedSkills: selected });

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
