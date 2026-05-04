import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { evaluateAssessment } from '../utils/assessRules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function parseFrontmatter(content) {
  const metadata = {};
  const regex = /^---\r?\n([\s\S]*?)\r?\n---/;
  const match = content.match(regex);
  if (match && match[1]) {
    const lines = match[1].split(/\r?\n/);
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join(':').trim().replace(/^["']|["']$/g, '');
        metadata[key] = value;
      }
    }
  }
  return metadata;
}

export const assessCommand = new Command('assess')
  .description('Evalúa la arquitectura propuesta basada en el assessment')
  .action(() => {
    const targetBase = process.cwd();
    const assessmentPath = path.join(targetBase, 'docs', 'architecture-assessment.md');

    if (!fs.existsSync(assessmentPath)) {
      const templatesDir = path.join(__dirname, '../templates/sdd');
      const templatePath = path.join(templatesDir, 'architecture-assessment.md');
      
      fs.mkdirSync(path.dirname(assessmentPath), { recursive: true });
      fs.copyFileSync(templatePath, assessmentPath);
      
      console.log('📄 Se ha creado docs/architecture-assessment.md');
      console.log('✍️ Por favor, complétalo y vuelve a ejecutar `funky assess`.');
      process.exit(0);
    }

    const content = fs.readFileSync(assessmentPath, 'utf8');
    const metadata = parseFrontmatter(content);
    
    const challenges = evaluateAssessment(metadata);

    const templatesDir = path.join(__dirname, '../templates/sdd');
    const reviewTemplatePath = path.join(templatesDir, 'architecture-review-template.md');
    let reviewContent = fs.readFileSync(reviewTemplatePath, 'utf8');
    
    const challengesText = challenges.length > 0 
      ? challenges.map(c => `- ${c}`).join('\n')
      : 'Ninguno. (Aún así, revisá los NFRs y cruzá los datos para encontrar fallas invisibles)';

    reviewContent = reviewContent
      .replace('{{CHALLENGES}}', challengesText)
      .replace('{{NFR_COMPLIANCE}}', metadata.compliance || 'No especificado')
      .replace('{{NFR_CONCURRENCY}}', metadata.rps || 'No especificado')
      .replace('{{NFR_SENIORITY}}', metadata.team_seniority || 'No especificado')
      .replace('{{NFR_BUDGET}}', metadata.budget || 'No especificado')
      .replace('{{NFR_SLA}}', metadata.sla || 'No especificado');
    
    const promptsDir = path.join(targetBase, '.agents', 'prompts');
    fs.mkdirSync(promptsDir, { recursive: true });
    const outputPath = path.join(promptsDir, 'architecture-review.md');
    
    fs.writeFileSync(outputPath, reviewContent);
    
    console.log('✅ Evaluación local completa. ⚠️ Generado prompt de revisión arquitectónica obligatoria.');
    console.log('Levantá un agente y apuntalo a `.agents/prompts/architecture-review.md`');
    process.exit(challenges.length > 0 ? 1 : 0);
  });
