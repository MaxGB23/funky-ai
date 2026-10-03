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
        // Cada skill trae su propio SKILL.md: sin este label los logs dicen solo
        // "SKILL.md" y no se sabe de qué skill hablan (contrato 2.8 del fs-adapter
        // usa basename a propósito; aquí el llamador lo desambigua).
        label: item.dest,
        // La unidad de decisión es la skill, no el archivo: sin esto no se puede
        // agrupar para preguntar una vez y evitar dejar un SKILL.md nuevo junto a
        // docs viejos de la versión anterior.
        skill: name,
      };
      if (item.optional) {
        intention.optional = true;
      }
      intentions.push(intention);
    }
  }

  return intentions;
}

/**
 * ¿El destino ya tiene exactamente el contenido que se quiere instalar?
 *
 * Si es así, no hay conflicto: no se sobrescribe nada y no se pierde nada.
 * Tratarlo como conflicto sería un falso positivo que hace fallar un CI ya al día.
 * Ante cualquier error de lectura se devuelve false — no asumir, preguntar es más
 * seguro que afirmar que algo está actualizado sin poder comprobarlo.
 *
 * @param {{ src?: string, dest: string }} intention
 * @returns {boolean}
 */
function isUpToDate(intention) {
  if (!intention.src || !fs.existsSync(intention.src)) return false;
  try {
    return fs.readFileSync(intention.dest).equals(fs.readFileSync(intention.src));
  } catch {
    return false;
  }
}

/** Acumula `-s a -s b` en un array. Patrón estándar de commander para opciones repetibles. */
function collect(value, previous) {
  return previous.concat([value]);
}

const SKILLS_HELP = `
Ejemplos:
  funky skills                                Pregunta qué instalar (modo interactivo)
  funky skills --all                          Instala todas las skills detectadas
  funky skills --skill sdd-release            Instala solo esa skill
  funky skills -s sdd-release -s layout-debug  Instala varias

Conflicto (un archivo ya existe):
  Sin flag             Pregunta una vez por skill; por defecto conserva
  --force              Reemplaza sin preguntar. DESTRUCTIVO: pierde ediciones locales
  Sin --force y sin terminal   Conserva lo existente y avisa por stderr

Sin terminal (CI, agentes) es obligatorio usar --all o --skill. Sin ninguno el comando
falla con código 1 en vez de no hacer nada. Una skill desconocida también falla y lista
las disponibles.`;

export const skillsCommand = new Command('skills')
  .description('Instala las skills detectadas bajo src/skills/ desde sus manifests y bootstrapa los docs compartidos que usan (docs-live-index, formato canónico de índice seccional, release-notes)')
  .option('--all', 'Instala todas las skills detectadas, sin preguntar')
  .option('-s, --skill <nombre>', 'Instala solo la skill indicada (repetible)', collect, [])
  .option('--force', 'Reemplaza los archivos existentes sin preguntar (destructivo: pierde ediciones locales)')
  .addHelpText('after', SKILLS_HELP)
  .action(async (opts) => {
    const srcDir = path.join(__dirname, '..');
    const targetBase = process.cwd();

    try {
      const available = discoverSkills(srcDir);
      if (available.length === 0) {
        console.log('⚠️ No se encontraron skills en src/skills/.');
        return;
      }

      const interactive = Boolean(process.stdin && process.stdin.isTTY);
      const requested = [...new Set(opts.skill ?? [])];
      const catalog = `Disponibles: ${available.join(', ')}`;
      // Pasó una flag = intención de script. Un humano que quiere revisar los
      // conflictos omite las flags; un agente nunca debe quedarse esperando una
      // tecla que no va a llegar.
      const hasSelectionFlag = Boolean(opts.all) || requested.length > 0;

      if (opts.all && requested.length > 0) {
        console.error('❌ --all y --skill son excluyentes: usa uno u otro.');
        process.exit(1);
        return;
      }

      if (requested.length > 0) {
        // Una skill desconocida es un fallo, no un aviso: si el pedido no se puede
        // satisfacer entero, el código de salida debe decirlo. Un éxito parcial deja
        // al agente creyendo que instaló lo que pidió.
        const unknown = requested.filter((name) => !available.includes(name));
        if (unknown.length > 0) {
          console.error(
            `❌ Skills desconocidas: ${unknown.map((n) => `"${n}"`).join(', ')}. ${catalog}`
          );
          process.exit(1);
          return;
        }
      }

      let selected;
      if (requested.length > 0) {
        selected = requested;
      } else if (opts.all) {
        selected = available;
      } else if (!interactive) {
        console.error(
          `❌ Sin terminal no se puede preguntar qué instalar. Usa --all o --skill <nombre>. ${catalog}`
        );
        process.exit(1);
        return;
      } else {
        p.intro('funky skills — instalador interactivo');

        // Nada preseleccionado: el default es instalar NADA. Un Enter sin marcar nada lo
        // bloquea el prompt, que además enseña la tecla en su mensaje. Así el fallo va
        // hacia "no instala", nunca hacia "instala de más".
        //
        // `required` se omite a propósito: su default (true) hace que el prompt bloquee
        // la confirmación vacía. Pasarlo en false fue la causa raíz del revert
        // v4.2.0 -> v4.3.2 (un Enter directo devolvía [] en silencio).
        const ALL = '__all__';
        const selection = await p.multiselect({
          message: '¿Qué quieres instalar?  (Espacio: marcar o desmarcar · Enter: confirmar)',
          options: [
            { value: ALL, label: 'Todas' },
            ...available.map((name) => ({ value: name, label: name })),
          ],
        });

        if (p.isCancel(selection)) {
          p.cancel('Operación cancelada.');
          process.exit(1);
          return; // process.exit está mockeado en tests: sin return, `selection` sigue siendo el símbolo de cancelación
        }

        // Precedencia: ganan las skills marcadas. «Todas» significa "todo" solo cuando
        // es la única elección; si además se marcaron skills concretas, la decisión
        // explícita prevalece y desmarcar una sí la excluye. Por construcción el
        // instalador nunca copia más de lo marcado: el fallo posible va hacia "instalé
        // menos", que es el sesgo seguro para algo que escribe en disco.
        const marked = selection.filter((name) => name !== ALL);
        selected = marked.length === 0 && selection.includes(ALL) ? available : marked;

        // Defensa en profundidad: el prompt ya bloquea la confirmación vacía. Si aun así
        // llegara [], runSkills la trataría como entrada válida e instalaría cero archivos
        // en silencio — el mismo fallo que tumbó el multiselect en v4.3.2.
        if (selected.length === 0) {
          p.cancel('No se seleccionó ninguna skill. Presiona Espacio para marcar al menos una.');
          process.exit(1);
          return;
        }
      }

      // R-SK-8: los manifests se cargan dinámicamente de cada skill seleccionada;
      // una skill nueva con SKILL.md + manifest.js queda instalable sin tocar código.
      const manifests = [];
      for (const name of selected) {
        const mod = await import(
          pathToFileURL(path.join(srcDir, 'skills', name, 'manifest.js')).href
        );
        manifests.push(mod.default);
      }

      console.log('🚀 Instalando skills y docs compartidos...');
      const intentions = runSkills({ srcDir, targetBase, selectedSkills: selected, manifests });

      // Estado por skill: qué archivos ya existen (conflicto), cuáles faltan y cuáles ya
// están en la versión distribuida. Los que faltan no son conflicto — no hay nada que
// perder — así que se instalan siempre; los que difieren requieren una decisión, y se
// toma UNA por skill; los idénticos no son nada de eso.
const bySkill = new Map();
const uptodate = [];
for (const intention of intentions) {
  const shipped = !intention.optional || fs.existsSync(intention.src);
  if (!shipped) continue;
  const exists = fs.existsSync(intention.dest);
  if (exists && isUpToDate(intention)) {
    uptodate.push(intention);
    continue;
  }
  const entry = bySkill.get(intention.skill) ?? { exists: [], missing: [] };
  (exists ? entry.exists : entry.missing).push(intention);
  bySkill.set(intention.skill, entry);
}

if (uptodate.length > 0) {
  console.log(
    `ℹ️ ${uptodate.length} archivo(s) ya están en la versión más reciente: ${uptodate
      .map((i) => i.label)
      .join(', ')}`
  );
}

      let pendingOverwrite = false;
      let blocked = [];

      if (opts.force) {
        // Reemplazo explícito: no se pregunta nada. Aun así se declara qué se
        // descarta, porque quien pasa --force puede no saber qué hay en destino y
        // el aviso también sirve para el log de un agente.
        const replaced = [...bySkill.values()].flatMap((entry) => entry.exists);
        if (replaced.length > 0) {
          console.warn(`⚠️ --force: reemplazando ${replaced.length} archivo(s) existente(s):`);
          for (const intention of replaced) {
            console.warn(`  - ${intention.label}`);
            intention.overwrite = true;
          }
          pendingOverwrite = true;
        }
      } else if (interactive && !hasSelectionFlag) {
        // Solo se pregunta cuando hay terminal Y no vino ninguna flag: es la única
        // combinación que significa "persona al frente". Con flags —incluido un
        // agente con pseudo-TTY, que tiene isTTY pero nadie contesta— preguntar
        // sería colgarse esperando una tecla.
        for (const [name, { exists, missing }] of bySkill) {
          if (exists.length === 0) continue;

          p.note(
            [
              ...exists.map((i) => `ya existe: ${i.label}`),
              ...missing.map((i) => `falta:    ${i.label}`),
            ].join('\n'),
            `${name} (${exists.length} de ${exists.length + missing.length} archivos)`
          );

          const replace = await p.confirm({
            message: `¿Reemplazar los archivos existentes de ${name} con la versión nueva? Perderás cualquier edición local.`,
            initialValue: false,
          });

          // Cancelar se trata como "no": se conserva todo lo actual.
          if (p.isCancel(replace) || replace !== true) continue;
          for (const intention of exists) intention.overwrite = true;
          pendingOverwrite = true;
        }
      } else {
        // Con flags no se destruye nada sin permiso explícito, pero tampoco se sale
        // con 0 como si se hubiera instalado todo. El error se emite DESPUÉS de
        // ejecutar, para que los archivos que faltan (que no son conflicto) se
        // instalen igual: si se abortara antes, el repo quedaría a medias.
        blocked = [...bySkill.values()].flatMap((entry) => entry.exists);
      }

      if (pendingOverwrite) {
        console.log('ℹ️ Reemplazando los archivos confirmados.');
      }

      const { created, skipped, logs } = await executeIntentions(intentions);
      for (const log of logs) {
        console.log(log);
      }
      console.log(`\n✅ Skills y docs compartidos instalados. ${created} archivos creados, ${skipped} ya existían.`);

      // Va después de instalar a propósito: los faltantes ya se crearon, así que el
      // repo no queda a medias. El 1 dice "tu intención no se satisfizo entera", y el
      // mensaje ofrece las dos salidas: reemplazar con --force, o mantener sin él.
      if (blocked.length > 0) {
        console.error(
          [
            `❌ ${blocked.length} archivo(s) ya existen y no se sobrescriben sin --force:`,
            ...blocked.map((i) => `  - ${i.label}`),
            `Usa --force para reemplazarlos por la versión nueva.`,
            `Para mantener la versión actual, ignora este error: esos archivos no se modificaron.`,
          ].join('\n')
        );
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error al instalar skills y docs compartidos:', error.message);
      process.exit(1);
    }
  });
