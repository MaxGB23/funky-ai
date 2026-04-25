import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.resolve(__dirname, '../../');
const templatesDest = path.resolve(__dirname, '../src/templates/bootstrap');

const filesToSync = [
  { src: '.agents/rules/engram-protocol.md', dest: 'agents-rules-engram-protocol.md' },
  { src: '.agents/rules/secops.md', dest: 'agents-rules-secops.md' },
  { src: '.agents/rules/sdd-orchestrator.md', dest: 'agents-rules-sdd-orchestrator.md' },
  { src: 'funky-cli/src/templates/sdd/worker-handoff.md', dest: 'plantilla-worker-handoff.md' },
  { src: 'docs/funky-ai/cli/canvas-planning-guide.md', dest: 'canvas-planning-guide.md' }
];

try {
  if (!fs.existsSync(templatesDest)) {
    fs.mkdirSync(templatesDest, { recursive: true });
  }

  filesToSync.forEach(file => {
    const srcPath = path.join(workspaceRoot, file.src);
    const destPath = path.join(templatesDest, file.dest);
    
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath);
      console.log(`✅ Synced: ${file.dest}`);
    } else {
      console.warn(`⚠️ Warning: Source file not found: ${srcPath}`);
    }
  });
  
  console.log('✅ Template sync complete.');
} catch (error) {
  console.error('❌ Error syncing templates:', error);
  process.exit(1);
}
