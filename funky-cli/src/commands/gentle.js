import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Lógica pura del comando `funky gentle`.
 * @param {object} opts
 * @param {string} opts.featureName    - Nombre de la feature (ej: 'auth-login').
 * @param {string} opts.cliTemplatesDir- Directorio absoluto de templates genéricos del CLI.
 * @param {string} opts.cwd            - Directorio de trabajo destino.
 * @returns {{ success: boolean, error?: string, path?: string }}
 */
export function runGentle({ featureName, cliTemplatesDir, cwd }) {
  // 1. Sanitizar featureName
  const sanitizedFeatureName = featureName.trim().replace(/\s+/g, '-').toLowerCase();

  // 2. Determinar rutas (Golden vs Fallback)
  const goldenTemplatesDir = path.join(cwd, '.agents', 'templates', 'gentle');
  let templatesToUse = goldenTemplatesDir;

  if (!fs.existsSync(goldenTemplatesDir)) {
    console.warn(`⚠️ Warning: No se encontraron templates locales en ${goldenTemplatesDir}. Usando fallback de CLI.`);
    templatesToUse = cliTemplatesDir;
  }

  // 3. Crear openspec/gentle/<featureName>
  const featurePath = path.join(cwd, 'openspec', 'gentle', sanitizedFeatureName);
  
  if (fs.existsSync(featurePath)) {
    return { success: false, error: `El directorio de la feature ya existe: ${featurePath}` };
  }

  fs.mkdirSync(featurePath, { recursive: true });

  // 4. Copiar archivos
  const filesToCopy = ['01-explore.md', '02-proposal.md', '03-spec.md', '04-design.md', '05-tasks.md', '06-implement.md', '07-verify.md'];
  
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

export const gentleCommand = new Command('gentle')
  .description('Inicializa el scaffolding para Tier 4 Deep SDD (openspec/gentle/<nombre>)')
  .argument('<featureName>', 'Nombre de la feature (ej: auth-login)')
  .action((featureName) => {
    const cliTemplatesDir = path.join(__dirname, '..', 'templates', 'gentle');
    const cwd = process.cwd();

    const result = runGentle({ featureName, cliTemplatesDir, cwd });

    if (!result.success) {
      console.error(`❌ Error: ${result.error}`);
      process.exit(1);
    } else {
      console.log(`🚀 Scaffolding de Tier 4 Deep SDD creado exitosamente en: ${result.path}`);
    }
  });
