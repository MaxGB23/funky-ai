import fs from 'fs';
import { Command } from 'commander';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import * as p from '@clack/prompts';
import { executeIntentions } from '../utils/fs-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
 * Autodetección (R-SK-7): directorios bajo srcDir/skills/ que son skills instalables,
 * es decir que contienen SKILL.md Y manifest.js (manifest = única fuente de recursos,
 * R-SK-8). Requiere nombre EXACTO de archivo: NTFS es case-insensitive y
 * `existsSync('SKILL.md')` aceptaría `skill.md`; la convención es SKILL.md/manifest.js.
 * @param {string} srcDir - Raíz de src de funky-cli.
 * @returns {string[]} Nombres de skills, orden estable (sort alfabético).
 */
export function discoverSkills(srcDir) {
  const skillsDir = path.join(srcDir, 'skills');
  return fs
    .readdirSync(skillsDir, { withFileTypes: true })
    .filter((entry) => {
      if (!entry.isDirectory()) return false;
      const names = fs.readdirSync(path.join(skillsDir, entry.name));
      return names.includes('SKILL.md') && names.includes('manifest.js');
    })
    .map((entry) => entry.name)
    .sort();
}

/**
 * Lógica pura del comando `funky skills`.
 * Cada skill declara sus recursos en su manifest.js (`src` relativo a srcDir,
 * `dest` relativo a targetBase, `optional` = src ausente permitido). Los docs
 * compartidos viven en templates/bootstrap/sdd/ — el MISMO src que usa
 * `funky scaffold` (paridad byte a byte, R-SK-5). NO realiza I/O; la carga de
 * los manifests la hace el llamador (la acción la carga dinámicamente por skill
 * seleccionada — R-SK-8: manifest = única fuente de recursos). El salto por
 * src opcional ausente lo resuelve executeIntentions (R-SK-3).
 *
 * Orden determinista (D3): sort por skill, luego orden del manifest.
 *
 * @param {object} opts
 * @param {string} opts.srcDir         - Raíz de src de funky-cli (contiene skills/ y templates/).
 * @param {string} opts.targetBase     - Directorio destino (normalmente process.cwd()).
 * @param {Array<Array<{ src: string, dest: string, optional?: boolean }>>} opts.manifests
 *                                     - Manifests de las skills a instalar (R-SK-8).
 * @param {string[]} [opts.selectedSkills] - Skills a instalar; omisión = todas las de manifests.
 * @returns {Array<{ action: 'copy', src: string, dest: string, optional?: boolean }>}
 */
export function runSkills({ srcDir, targetBase, selectedSkills, manifests }) {
  const byName = new Map(manifests.map((manifest) => [skillNameOf(manifest), manifest]));
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
  .description('Instala las skills detectadas bajo src/skills/ desde sus manifests y bootstrapa los docs compartidos de SDD (docs-live-index, formato canónico de índice seccional, release-notes)')
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

      const selection = await p.select({
        message: '¿Qué quieres instalar?',
        options: [
          { value: '__all__', label: 'Todas' },
          ...available.map((name) => ({ value: name, label: name })),
        ],
      });

      if (p.isCancel(selection)) {
        p.cancel('Operación cancelada.');
        process.exit(1);
      }

      // R-SK-6: cancelar ⇒ exit(1) sin I/O; select no admite selección vacía.
      const selected = selection === '__all__' ? available : [selection];

      // R-SK-8: los manifests se cargan dinámicamente de cada skill seleccionada;
      // una skill nueva con SKILL.md + manifest.js queda instalable sin tocar código.
      const manifests = [];
      for (const name of selected) {
        const mod = await import(
          pathToFileURL(path.join(srcDir, 'skills', name, 'manifest.js')).href
        );
        manifests.push(mod.default);
      }

      console.log('🚀 Instalando skills y docs compartidos SDD...');
      const intentions = runSkills({ srcDir, targetBase, selectedSkills: selected, manifests });

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
