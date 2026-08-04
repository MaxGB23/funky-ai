import fs from 'fs';
import path from 'path';

/**
 * Resuelve las rutas candidatas del doc del comando, en orden de prioridad:
 * 1. <targetBase>/docs/funky-ai/<name>.md
 * 2. <targetBase>/docs/funky-forge/<name>.md
 *
 * Convención pura (D4): cubre los dos árboles de docs reales del ecosistema
 * (funky-ai: scaffold/feature/engram; funky-forge: init/assess/estimate/pipeline).
 *
 * @param {string} name - Nombre del comando top-level (p.ej. 'scaffold').
 * @param {object} [opts]
 * @param {string} [opts.targetBase] - Raíz del proyecto (default: process.cwd()).
 * @returns {string[]}
 */
export function resolveDocCandidates(name, { targetBase = process.cwd() } = {}) {
  return [
    path.join(targetBase, 'docs', 'funky-ai', `${name}.md`),
    path.join(targetBase, 'docs', 'funky-forge', `${name}.md`),
  ];
}

/**
 * Carga el doc del comando desde el primer candidato existente.
 * Un contenido vacío o con el placeholder `<ruta-del-doc>` (proyecto fresco,
 * R-HL-2) NO se considera un doc válido para inyectar.
 *
 * @param {string} name
 * @param {object} [opts]
 * @returns {{ ok: true, content: string, path: string } | { ok: false, reason: 'missing' | 'placeholder' }}
 */
export function loadCommandDoc(name, opts) {
  for (const candidate of resolveDocCandidates(name, opts)) {
    try {
      if (fs.existsSync(candidate)) {
        const content = fs.readFileSync(candidate, 'utf8');
        if (!content.trim()) {
          return { ok: false, reason: 'missing' };
        }
        if (content.includes('<ruta-del-doc>')) {
          return { ok: false, reason: 'placeholder' };
        }
        return { ok: true, content, path: candidate };
      }
    } catch {
      // Candidato ilegible: probar el siguiente
    }
  }
  return { ok: false, reason: 'missing' };
}

/**
 * Inyecta el contenido del doc del comando en su `--help` vía addHelpText('after').
 * Degradación graciosa: sin doc, vacío o con placeholder `<ruta-del-doc>` →
 * no-op (devuelve false y NO llama addHelpText). Nunca crashea (R-HL-2).
 *
 * @param {import('commander').Command} command
 * @param {string} name
 * @param {object} [opts]
 * @returns {boolean} true si se inyectó el doc.
 */
export function enrichCommandHelp(command, name, opts) {
  const doc = loadCommandDoc(name, opts);
  if (!doc.ok) {
    return false;
  }
  command.addHelpText('after', `\n${doc.content}`);
  return true;
}
