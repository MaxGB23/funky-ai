import fs from 'fs';
import path from 'path';

/**
 * Ejecuta un plan de intenciones de I/O sobre el file system.
 * 
 * @param {Array<{ action: 'copy'|'create'|'mkdir', dest: string, src?: string, content?: string }>} intentions 
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
          fs.mkdirSync(dest, { recursive: true });
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

    if (!dryRun) {
      const dir = path.dirname(dest);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }

    if (action === 'copy') {
      if (!dryRun) {
        fs.copyFileSync(src, dest);
      }
      logs.push(`✅ Creado: ${dest}`);
      createdCount++;
    } else if (action === 'create') {
      if (!dryRun) {
        fs.writeFileSync(dest, content, 'utf8');
      }
      logs.push(`✅ Creado: ${dest}`);
      createdCount++;
    }
  }

  return { created: createdCount, skipped: skippedCount, logs };
}
