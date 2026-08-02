import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { surfaceRiskPatterns } from '../utils/assessRules.js';
import { readContext, writeContext, findCanvases, countUnfilledSections } from '../utils/context.js';

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

function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function runAssess(targetBase, opts = {}) {
  // ── 1. Canvas Discovery ──
  let ctx = null;

  const contextArg = typeof opts.context === 'string' ? opts.context : (typeof opts.contextPath === 'string' ? opts.contextPath : null);
  if (opts.context || opts.contextPath) {
    ctx = readContext(targetBase, contextArg || undefined);
    if (!ctx) {
      console.error('❌ No se pudo leer context.json. Asegurate de haber ejecutado "funky pipeline assess" primero.');
      return;
    }
  }

  const canvases = findCanvases(targetBase);
  let projectCanvas = canvases.projectCanvas;
  let infraCanvas = canvases.infraCanvas;
  let unfilledCount = canvases.unfilledCount;

  if (!projectCanvas) {
    console.warn('⚠️  No se encontró PROJECT-CANVAS.md en docs/funky-ai/canvas/. Usando placeholder.');
    projectCanvas = 'Canvas no disponible';
  }

  if (!infraCanvas) {
    console.warn('⚠️  No se encontró INFRA-CANVAS.md en docs/funky-ai/canvas/. Usando placeholder.');
    infraCanvas = 'Canvas no disponible';
  }

  // ── 2. Canvas Validation ──
  if (unfilledCount > 0) {
    console.warn(`⚠️  Se detectaron ${unfilledCount} secciones sin completar ("[Responde aquí]") en los canvases. La discusión se basará en datos parciales.`);
  }

  // ── 3. Surface Risk Patterns ──
  const templatesDir = path.join(__dirname, '../templates/assess');
  const patternsTemplatePath = path.join(templatesDir, 'risk-patterns-template.md');
  const patternsDestPath = path.join(targetBase, 'docs', 'funky-ai', 'assess', 'risk-patterns.md');

  // Crea risk-patterns.md solo si no existe (documento vivo del equipo, no se sobrescribe).
  if (!fs.existsSync(patternsDestPath)) {
    try {
      const patternsContent = fs.readFileSync(patternsTemplatePath, 'utf8');
      fs.mkdirSync(path.dirname(patternsDestPath), { recursive: true });
      fs.writeFileSync(patternsDestPath, patternsContent, 'utf8');
      console.log('📄 Patrones de riesgo de referencia creados en docs/funky-ai/assess/risk-patterns.md (edítalos según tu contexto).');
    } catch (err) {
      const msg = err.code === 'EACCES' ? `Error de permisos al crear "${patternsDestPath}". Verifica que tengas permisos de escritura.` : err.message;
      console.warn('⚠️  No se pudo crear docs/funky-ai/assess/risk-patterns.md:', msg);
    }
  } else {
    console.log('ℹ️  docs/funky-ai/assess/risk-patterns.md ya existe — no se modificó.');
  }

  let surfaceResult;
  try {
    const patternsTemplateContent = fs.readFileSync(patternsTemplatePath, 'utf8');
    surfaceResult = surfaceRiskPatterns(targetBase, patternsTemplateContent);
  } catch (err) {
    console.warn('⚠️  Error al superficiar patrones de riesgo:', err.message);
    surfaceResult = { content: '', patterns: [] };
  }

  // ── 4. Interpolate Template ──
  const reviewTemplatePath = path.join(templatesDir, 'architecture-review-template.md');

  let templateContent;
  try {
    templateContent = fs.readFileSync(reviewTemplatePath, 'utf8');
  } catch (err) {
    throw new Error(`Template architecture-review-template.md no encontrado en ${reviewTemplatePath}. La instalación está corrupta.`);
  }

  const riskPatternsText = surfaceResult.content.trim();

  let outputContent = templateContent
    .replace('{{PROJECT_CANVAS_CONTENT}}', projectCanvas)
    .replace('{{INFRA_CANVAS_CONTENT}}', infraCanvas)
    .replace('{{DYNAMIC_QUESTIONS}}', riskPatternsText);

  // ── 5. Write Output ──
  const assessDir = path.join(targetBase, 'docs', 'funky-ai', 'assess');
  try {
    fs.mkdirSync(assessDir, { recursive: true });
  } catch (err) {
    const msg = err.code === 'EACCES' ? `Error de permisos al crear el directorio "${assessDir}". Verifica que tengas permisos de escritura.` : err.message;
    console.warn('⚠️  No se pudo crear el directorio docs/funky-ai/assess/:', msg);
  }

  const outputPath = path.join(assessDir, 'architecture-review.md');
  try {
    fs.writeFileSync(outputPath, outputContent, 'utf8');
  } catch (err) {
    const msg = err.code === 'EACCES' ? `Error de permisos al escribir "${outputPath}". Verifica que tengas permisos de escritura.` : err.message;
    console.warn('⚠️  No se pudo escribir el archivo de guía:', msg);
  }

  // ── 6. Decisions Template ──
  const decisionsDir = path.join(targetBase, 'docs', 'funky-ai', 'assess');
  const decisionsDestPath = path.join(decisionsDir, 'architecture-decisions.md');
  if (!fs.existsSync(decisionsDestPath)) {
    const decisionsTemplatePath = path.join(templatesDir, 'architecture-decisions-template.md');
    try {
      let decisionsContent = fs.readFileSync(decisionsTemplatePath, 'utf8');
      decisionsContent = decisionsContent.replace(/{{DATE}}/g, getTodayDate());
      fs.mkdirSync(path.dirname(decisionsDestPath), { recursive: true });
      fs.writeFileSync(decisionsDestPath, decisionsContent, 'utf8');
      console.log('📄 Template de decisiones creado en docs/funky-ai/assess/architecture-decisions.md');
    } catch (err) {
      const msg = err.code === 'EACCES' ? `Error de permisos al crear "${decisionsDestPath}". Verifica que tengas permisos de escritura.` : err.message;
      console.warn('⚠️  No se pudo crear docs/funky-ai/assess/architecture-decisions.md:', msg);
    }
  } else {
    console.log('ℹ️  docs/funky-ai/assess/architecture-decisions.md ya existe — no se modificó.');
  }

  // ── 7. Write Context (if applicable) ──
  if (ctx) {
    ctx.assess.runAt = new Date().toISOString();
    ctx.assess.dynamicQuestions = surfaceResult.patterns || [];
    writeContext(targetBase, ctx, contextArg || undefined);
  }

  // ── 8. Summary ──
  console.log('\n✅ Guía de discusión generada exitosamente.');
  console.log(`   📝 Guía: ${path.relative(targetBase, outputPath)}`);
  console.log('   📝 Patrones de riesgo: docs/funky-ai/assess/risk-patterns.md');
  console.log(`   📝 Decisiones: docs/funky-ai/assess/architecture-decisions.md`);
  console.log('\n📋 Próximos pasos:');
  console.log(`   1. Abre una sesión de chat con la IA.`);
  console.log(`   2. Arrastra el archivo ${path.relative(targetBase, outputPath)} a la conversación.`);
  console.log('   3. Sigue las 6 fases de la guía para discutir la arquitectura.');
  console.log('   4. Documenta los acuerdos en docs/funky-ai/assess/architecture-decisions.md durante la discusión.\n');
}

export const assessCommand = new Command('assess')
  .description('Genera guía de discusión arquitectónica a partir de los canvases del proyecto')
  .option('-c, --context <path>', 'Path to context.json for pipeline integration')
  .action((opts) => {
    runAssess(process.cwd(), opts);
    process.exit(0);
  });
