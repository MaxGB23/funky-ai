import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateGuideQuestions } from '../utils/assessRules.js';

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

function findCanvas(name, targetBase) {
  const rootPath = path.join(targetBase, name);
  if (fs.existsSync(rootPath)) {
    return { content: fs.readFileSync(rootPath, 'utf8'), source: 'root' };
  }

  const docsPath = path.join(targetBase, 'docs', name);
  if (fs.existsSync(docsPath)) {
    return { content: fs.readFileSync(docsPath, 'utf8'), source: 'docs' };
  }

  return null;
}

function countUnfilledSections(content) {
  const regex = /\[Responde aquí\]/g;
  const matches = content.match(regex);
  return matches ? matches.length : 0;
}

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const assessCommand = new Command('assess')
  .description('Genera guía de discusión arquitectónica a partir de los canvases del proyecto')
  .action(() => {
    const targetBase = process.cwd();

    // ── 1. Canvas Discovery ──
    const projectCanvasResult = findCanvas('PROJECT-CANVAS.md', targetBase);
    const infraCanvasResult = findCanvas('INFRA-CANVAS.md', targetBase);

    let projectCanvas;
    let infraCanvas;

    if (projectCanvasResult) {
      projectCanvas = projectCanvasResult.content;
    } else {
      console.warn('⚠️  No se encontró PROJECT-CANVAS.md (ni en raíz ni en docs/). Usando placeholder.');
      projectCanvas = 'Canvas no disponible';
    }

    if (infraCanvasResult) {
      infraCanvas = infraCanvasResult.content;
    } else {
      console.warn('⚠️  No se encontró INFRA-CANVAS.md (ni en raíz ni en docs/). Usando placeholder.');
      infraCanvas = 'Canvas no disponible';
    }

    // ── 2. Canvas Validation ──
    let unfilledCount = 0;
    if (projectCanvasResult) {
      unfilledCount += countUnfilledSections(projectCanvas);
    }
    if (infraCanvasResult) {
      unfilledCount += countUnfilledSections(infraCanvas);
    }
    if (unfilledCount > 0) {
      console.warn(`⚠️  Se detectaron ${unfilledCount} secciones sin completar ("[Responde aquí]") en los canvases. La discusión se basará en datos parciales.`);
    }

    // ── 3. Generate Guide Questions ──
    let dynamicQuestions;
    try {
      dynamicQuestions = generateGuideQuestions({
        projectCanvas,
        infraCanvas
      });
    } catch (err) {
      console.warn('⚠️  Error al generar preguntas dinámicas:', err.message);
      dynamicQuestions = { dynamic: [] };
    }

    // ── 4. Interpolate Template ──
    const templatesDir = path.join(__dirname, '../templates/sdd');
    const reviewTemplatePath = path.join(templatesDir, 'architecture-review-template.md');

    let templateContent;
    try {
      templateContent = fs.readFileSync(reviewTemplatePath, 'utf8');
    } catch (err) {
      throw new Error(`Template architecture-review-template.md no encontrado en ${reviewTemplatePath}. La instalación está corrupta.`);
    }

    const dynamicQuestionsText = dynamicQuestions.dynamic.length > 0
      ? dynamicQuestions.dynamic.map(q => `- **${q.category}**: ${q.question}`).join('\n')
      : '';

    let outputContent = templateContent
      .replace('{{PROJECT_CANVAS_CONTENT}}', projectCanvas)
      .replace('{{INFRA_CANVAS_CONTENT}}', infraCanvas)
      .replace('{{DYNAMIC_QUESTIONS}}', dynamicQuestionsText);

    // ── 5. Write Output ──
    const promptsDir = path.join(targetBase, '.agents', 'prompts');
    try {
      fs.mkdirSync(promptsDir, { recursive: true });
    } catch (err) {
      console.warn('⚠️  No se pudo crear el directorio .agents/prompts/:', err.message);
    }

    const outputPath = path.join(promptsDir, 'architecture-review.md');
    try {
      fs.writeFileSync(outputPath, outputContent, 'utf8');
    } catch (err) {
      console.warn('⚠️  No se pudo escribir el archivo de guía:', err.message);
    }

    // ── 6. Decisions Template ──
    const decisionsDestPath = path.join(targetBase, 'docs', 'architecture-decisions.md');
    if (!fs.existsSync(decisionsDestPath)) {
      const decisionsTemplatePath = path.join(templatesDir, 'architecture-decisions-template.md');
      try {
        let decisionsContent = fs.readFileSync(decisionsTemplatePath, 'utf8');
        decisionsContent = decisionsContent.replace(/{{DATE}}/g, getTodayDate());
        fs.mkdirSync(path.dirname(decisionsDestPath), { recursive: true });
        fs.writeFileSync(decisionsDestPath, decisionsContent, 'utf8');
        console.log('📄 Template de decisiones creado en docs/architecture-decisions.md');
      } catch (err) {
        console.warn('⚠️  No se pudo crear docs/architecture-decisions.md:', err.message);
      }
    } else {
      console.log('ℹ️  docs/architecture-decisions.md ya existe — no se modificó.');
    }

    // ── 7. Summary ──
    console.log('\n✅ Guía de discusión generada exitosamente.');
    console.log(`   📝 Guía: ${path.relative(targetBase, outputPath)}`);
    console.log(`   📝 Decisiones: docs/architecture-decisions.md`);
    console.log('\n📋 Próximos pasos:');
    console.log(`   1. Abrí una sesión de chat con la IA.`);
    console.log(`   2. Arrastrá el archivo ${path.relative(targetBase, outputPath)} a la conversación.`);
    console.log('   3. Seguí las 6 fases de la guía para discutir la arquitectura.');
    console.log('   4. Documentá los acuerdos en docs/architecture-decisions.md durante la discusión.\n');

    process.exit(0);
  });
