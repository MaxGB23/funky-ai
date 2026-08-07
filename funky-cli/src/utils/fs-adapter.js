import fs from 'fs';
import path from 'path';

/**
 * Wraps a sync FS operation to catch EACCES and re-throw with a friendly message.
 * @param {() => void} fn - Sync FS operation to execute
 * @param {string} path - The file/directory path being operated on
 * @param {string} description - What was being attempted (e.g. "crear directorio", "escribir archivo")
 */
function wrapFSOp(fn, fsPath, description) {
  try {
    fn();
  } catch (err) {
    if (err.code === 'EACCES') {
      throw new Error(
        `Error de permisos al ${description} en "${fsPath}". ` +
        `Verifica que tengas permisos de escritura en ese directorio.`
      );
    }
    throw err;
  }
}

/**
 * Procesa UNA intención sin confirmación interactiva (núcleo síncrono compartido
 * por executeIntentions y executeIntentionsSync). Para kind: 'guide' con destino
 * existente aplica el default "n" (skip logueado, nunca sobrescribe).
 *
 * @param {{ action: 'copy'|'create'|'mkdir', dest: string, src?: string, content?: string, optional?: boolean, kind?: 'guide'|'decision' }} intention
 * @param {object} options
 * @param {boolean} [options.dryRun=false] - Si es true, no ejecuta operaciones físicas de I/O, sólo simula.
 * @returns {{ created: number, skipped: number, logs: string[] }}
 */
function applyIntention(intention, { dryRun }) {
  const { action, dest, src, content, kind } = intention;
  const logs = [];

  if (action === 'mkdir') {
    if (!fs.existsSync(dest)) {
      if (!dryRun) {
        wrapFSOp(
          () => fs.mkdirSync(dest, { recursive: true }),
          dest,
          'crear directorio'
        );
      }
      logs.push(`✅ Creado directorio: ${dest}`);
    }
    return { created: 0, skipped: 0, logs };
  }

  if (fs.existsSync(dest)) {
    const basename = path.basename(dest);

    if (kind === 'decision') {
      logs.push(
        `⚡ Omitiendo (ya existe): ${basename}. Contiene decisiones del proyecto: no se sobrescriben automáticamente. Si quieres la versión más reciente, elimínalo o muévelo de ubicación para conservar un backup.`
      );
      return { created: 0, skipped: 1, logs };
    }

    logs.push(`⚡ Omitiendo (ya existe): ${basename}`);
    return { created: 0, skipped: 1, logs };
  }

  // R-SK-3: src opcional ausente se salta con log, nunca crashea.
  if (action === 'copy' && intention.optional && !fs.existsSync(src)) {
    logs.push(`⚡ Omitiendo (src opcional no existe): ${src}`);
    return { created: 0, skipped: 1, logs };
  }

  if (!dryRun) {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) {
      wrapFSOp(
        () => fs.mkdirSync(dir, { recursive: true }),
        dir,
        'crear directorio'
      );
    }
  }

  if (action === 'copy') {
    if (!dryRun) {
      wrapFSOp(
        () => fs.copyFileSync(src, dest),
        dest,
        'copiar archivo'
      );
    }
    logs.push(`✅ Creado: ${dest}`);
    return { created: 1, skipped: 0, logs };
  }

  if (action === 'create') {
    if (!dryRun) {
      wrapFSOp(
        () => fs.writeFileSync(dest, content, 'utf8'),
        dest,
        'escribir archivo'
      );
    }
    logs.push(`✅ Creado: ${dest}`);
    return { created: 1, skipped: 0, logs };
  }

  return { created: 0, skipped: 0, logs };
}

/**
 * Nombres de las guías (kind: 'guide') de un plan de intenciones que ya existen
 * en el destino. Patrón compartido del aviso de entorno no interactivo: solo
 * aporta si hay al menos una guía que podría actualizarse (Fase 0, 0.3).
 *
 * @param {Array<{kind?: 'guide'|'decision', dest: string}>} intentions
 * @returns {string[]} Dests de guías existentes, en el orden del plan.
 */
export function existingGuides(intentions) {
  return intentions
    .filter((i) => i.kind === 'guide')
    .map((i) => i.dest)
    .filter((dest) => fs.existsSync(dest));
}

/**
 * Ejecuta un plan de intenciones de I/O sobre el file system.
 * 
 * @param {Array<{ action: 'copy'|'create'|'mkdir', dest: string, src?: string, content?: string, optional?: boolean, kind?: 'guide'|'decision' }>} intentions 
 * @param {object} options
 * @param {boolean} [options.dryRun=false] - Si es true, no ejecuta operaciones físicas de I/O, sólo simula.
 * @param {(dest: string, basename: string) => boolean | Promise<boolean>} [options.askConfirm] - Callback de confirmación para guías existentes (kind: 'guide'). Devuelve true para sobrescribir, false para omitir.
 * @returns {Promise<{ created: number, skipped: number, logs: string[] }>}
 */
export async function executeIntentions(intentions, { dryRun = false, askConfirm } = {}) {
  let createdCount = 0;
  let skippedCount = 0;
  const logs = [];

  for (const intention of intentions) {
    const { dest, kind, src } = intention;

    // La confirmación Y/N (kind: 'guide') es la ÚNICA parte asíncrona del motor:
    // vive en el wrapper; el resto delega al núcleo síncrono applyIntention.
    if (kind === 'guide' && fs.existsSync(dest)) {
      const basename = path.basename(dest);
      const shouldUpdate = askConfirm ? await askConfirm(dest, basename) : false;
      if (shouldUpdate) {
        if (!dryRun) {
          const dir = path.dirname(dest);
          if (!fs.existsSync(dir)) {
            wrapFSOp(
              () => fs.mkdirSync(dir, { recursive: true }),
              dir,
              'crear directorio'
            );
          }
          wrapFSOp(
            () => fs.copyFileSync(src, dest),
            dest,
            'copiar archivo'
          );
        }
        logs.push(`✅ Actualizada: ${basename}`);
        createdCount++;
      } else {
        logs.push(`⚡ Omitiendo (ya existe): ${basename}`);
        skippedCount++;
      }
      continue;
    }

    const result = applyIntention(intention, { dryRun });
    createdCount += result.created;
    skippedCount += result.skipped;
    logs.push(...result.logs);
  }

  return { created: createdCount, skipped: skippedCount, logs };
}

/**
 * Ejecuta un plan de intenciones de forma SÍNCRONA (sin confirmación Y/N):
 * las guías existentes se omiten con default "n" logueado. Es el path de
 * comandos síncronos (Fase 0: estimate) que delegan sus decisiones al motor
 * común sin poder esperar un callback interactivo.
 *
 * @param {Array<{ action: 'copy'|'create'|'mkdir', dest: string, src?: string, content?: string, optional?: boolean, kind?: 'guide'|'decision' }>} intentions
 * @param {object} options
 * @param {boolean} [options.dryRun=false] - Si es true, no ejecuta operaciones físicas de I/O, sólo simula.
 * @returns {{ created: number, skipped: number, logs: string[] }}
 */
export function executeIntentionsSync(intentions, { dryRun = false } = {}) {
  let createdCount = 0;
  let skippedCount = 0;
  const logs = [];

  for (const intention of intentions) {
    const result = applyIntention(intention, { dryRun });
    createdCount += result.created;
    skippedCount += result.skipped;
    logs.push(...result.logs);
  }

  return { created: createdCount, skipped: skippedCount, logs };
}
