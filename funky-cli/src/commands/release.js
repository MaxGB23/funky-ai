import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runRelease(version) {
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!versionRegex.test(version)) {
    console.error('❌ Error: El formato de versión es inválido. Debe ser x.y.z');
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), 'docs', 'funky-ai', 'releases');
  const releaseFilePath = path.join(targetDir, `v${version}-release.md`);

  if (fs.existsSync(releaseFilePath)) {
    console.error(`❌ Error: El release v${version}-release.md ya existe.`);
    process.exit(1);
  }

  const templatePath = path.join(__dirname, '../templates/release.md');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ Error: No se encontró el template release.md en ' + templatePath);
    process.exit(1);
  }

  let content = fs.readFileSync(templatePath, 'utf8');
  content = content.replace(/\{\{version\}\}/g, version);
  
  const date = new Date().toISOString().split('T')[0];
  content = content.replace(/\{\{date\}\}/g, date);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(releaseFilePath, content, 'utf8');

  console.log(`✅ Release notes generados en docs/funky-ai/releases/v${version}-release.md`);
}

export const releaseCommand = new Command('release')
  .argument('<version>', 'Versión del release en formato x.y.z')
  .description('Genera release notes desde el template canónico')
  .action((version) => {
    runRelease(version);
  });
