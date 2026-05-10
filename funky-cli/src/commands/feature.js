import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lógica pura del comando `funky feature`.
 * @param {object} opts
 * @param {string} opts.featureName    - Nombre de la feature (ej: 'auth-login').
 * @param {string} opts.cliTemplatesDir- Directorio absoluto de templates genéricos del CLI.
 * @param {string} opts.cwd            - Directorio de trabajo destino.
 * @returns {{ success: boolean, error?: string, path?: string }}
 */
export function runFeature({ featureName, cliTemplatesDir, cwd }) {
  // 1. Sanitizar featureName
  const sanitizedFeatureName = featureName.trim().replace(/\s+/g, '-').toLowerCase();

  // 2. Determinar rutas (Golden vs Fallback)
  const goldenTemplatesDir = path.join(cwd, '.agents', 'templates', 'sdd');
  let templatesToUse = goldenTemplatesDir;

  if (!fs.existsSync(goldenTemplatesDir)) {
    console.warn(`⚠️ Warning: No se encontraron templates locales en ${goldenTemplatesDir}. Usando fallback de CLI.`);
    templatesToUse = cliTemplatesDir;
  }

  // 3. Crear docs/openspec/changes/<featureName>
  const featurePath = path.join(cwd, 'docs', 'openspec', 'changes', sanitizedFeatureName);
  
  if (fs.existsSync(featurePath)) {
    return { success: false, error: `El directorio de la feature ya existe: ${featurePath}` };
  }

  fs.mkdirSync(featurePath, { recursive: true });

  // 4. Copiar archivos (explore.md, proposal.md, spec.md, tasks.md)
  const filesToCopy = ['explore.md', 'proposal.md', 'spec.md', 'tasks.md', 'worker-handoff.md'];
  
  for (const file of filesToCopy) {
    const srcFile = path.join(templatesToUse, file);
    if (fs.existsSync(srcFile)) {
      const destFile = path.join(featurePath, file);
      fs.copyFileSync(srcFile, destFile);
    }
  }

  // 5. Retornar success
  return { success: true, path: featurePath };
}

export const featureCommand = new Command('feature')
  .description('Inicializa el scaffolding para una nueva feature SDD (docs/openspec/changes/<nombre>)')
  .argument('<featureName>', 'Nombre de la feature (ej: auth-login)')
  .action((featureName) => {
    const cliTemplatesDir = path.join(__dirname, '..', 'templates', 'sdd');
    const cwd = process.cwd();

    const result = runFeature({ featureName, cliTemplatesDir, cwd });

    if (!result.success) {
      console.error(`❌ Error: ${result.error}`);
      process.exit(1);
    } else {
      console.log(`🚀 Scaffolding de feature creado exitosamente en: ${result.path}`);
    }
  });
