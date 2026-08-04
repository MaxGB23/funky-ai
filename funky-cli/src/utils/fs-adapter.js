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
 * Ejecuta un plan de intenciones de I/O sobre el file system.
 * 
 * @param {Array<{ action: 'copy'|'create'|'mkdir', dest: string, src?: string, content?: string, optional?: boolean }>} intentions 
 * @param {object} options
 * @param {boolean} [options.dryRun=false] - Si es true, no ejecuta operaciones físicas de I/O, sólo simula.
 * @returns {{ created: number, skipped: number, logs: string[] }}
 */
export function executeIntentions(intentions, { dryRun = false } = {}) {
  let createdCount = 0;
  let skippedCount = 0;
  const logs = [];

  for (const intention of intentions) {
    const { action, dest, src, content } = intention;

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
      continue;
    }

    if (fs.existsSync(dest)) {
      logs.push(`⚡ Salteando (ya existe): ${dest}`);
      skippedCount++;
      continue;
    }

    // R-SK-3: src opcional ausente se salta con log, nunca crashea.
    if (action === 'copy' && intention.optional && !fs.existsSync(src)) {
      logs.push(`⚡ Salteando (src opcional no existe): ${src}`);
      skippedCount++;
      continue;
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
      createdCount++;
    } else if (action === 'create') {
      if (!dryRun) {
        wrapFSOp(
          () => fs.writeFileSync(dest, content, 'utf8'),
          dest,
          'escribir archivo'
        );
      }
      logs.push(`✅ Creado: ${dest}`);
      createdCount++;
    }
  }

  return { created: createdCount, skipped: skippedCount, logs };
}
