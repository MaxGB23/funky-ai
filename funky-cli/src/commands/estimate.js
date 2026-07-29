import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDecisions, findCanvases, readContext, writeContext } from '../utils/context.js';
import { generatePricingGuide, generateDecisionsTemplate, generateIAPrompt, generateIAPromptBanner, generateIAPromptFooter } from '../utils/estimateDomain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runEstimate(targetBase, opts = {}) {
  try {
    // ── Context (if applicable) ──
    let ctx = null;

    if (opts.context) {
      ctx = readContext(targetBase);
      if (!ctx) {
        console.error('❌ No se pudo leer context.json. Asegurate de haber ejecutado "funky pipeline assess" primero.');
        return;
      }
    }

    // ── 1. Load Decisions ──
    const decisionsPath = ctx?.assess?.decisionsFile || null;
    const decisions = loadDecisions(targetBase, decisionsPath);
    if (!decisions) {
      console.warn('⚠️  No se encontró docs/funky-ai/assess/architecture-decisions.md. Generando guía con contenido parcial.');
    }

    // ── 2. Canvas Discovery ──
    const canvases = findCanvases(targetBase);
    if (!canvases.projectCanvas) {
      console.warn('⚠️  No se encontró PROJECT-CANVAS.md en docs/funky-ai/canvas/. Usando placeholder.');
    }
    if (!canvases.infraCanvas) {
      console.warn('⚠️  No se encontró INFRA-CANVAS.md en docs/funky-ai/canvas/. Usando placeholder.');
    }
    if (canvases.unfilledCount > 0) {
      console.warn(`⚠️  Se detectaron ${canvases.unfilledCount} secciones sin completar ("[Responde aquí]") en los canvases. La discusión se basará en datos parciales.`);
    }

    // ── 3. Generate Pricing Guide ──
    const estimateDir = path.join(targetBase, 'docs', 'funky-ai', 'estimate');
    try {
      fs.mkdirSync(estimateDir, { recursive: true });
    } catch (err) {
      console.warn('⚠️  No se pudo crear el directorio docs/funky-ai/estimate/:', err.message);
    }

    let pricingGuide;
    try {
      pricingGuide = generatePricingGuide(decisions, canvases.projectCanvas, canvases.infraCanvas);
    } catch (err) {
      console.warn('⚠️  Error al generar la guía de pricing:', err.message);
      pricingGuide = 'Error al generar la guía de pricing.';
    }

    const pricingGuidePath = path.join(estimateDir, 'pricing-guide.md');
    try {
      fs.writeFileSync(pricingGuidePath, pricingGuide, 'utf8');
    } catch (err) {
      console.warn('⚠️  No se pudo escribir pricing-guide.md:', err.message);
    }

    // ── 4. Generate Decisions Template ──
    let decisionsTemplate;
    try {
      decisionsTemplate = generateDecisionsTemplate();
    } catch (err) {
      console.warn('⚠️  Error al generar el template de decisiones:', err.message);
      decisionsTemplate = 'Error al generar el template de decisiones.';
    }

    const decisionsTemplatePath = path.join(estimateDir, 'pricing-decisions.md');
    try {
      fs.writeFileSync(decisionsTemplatePath, decisionsTemplate, 'utf8');
    } catch (err) {
      console.warn('⚠️  No se pudo escribir pricing-decisions.md:', err.message);
    }

    // ── 5. Update Context ──
    if (ctx) {
      ctx.estimate.runAt = new Date().toISOString();
      writeContext(targetBase, ctx);
    }

    // ── 6. Generate IA Prompt ──
    const iaPrompt = generateIAPrompt(decisions, canvases.projectCanvas, canvases.infraCanvas);
    const iaBanner = generateIAPromptBanner();
    const iaFooter = generateIAPromptFooter();

    // ── 7. Summary ──
    console.log('\n✅ Material de pricing generado exitosamente.');
    console.log(`   📝 Guía de pricing: ${path.relative(targetBase, pricingGuidePath)}`);
    console.log(`   📝 Template de decisiones: ${path.relative(targetBase, decisionsTemplatePath)}`);
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Copie el prompt de abajo y péguelo en una sesión de chat con la IA.');
    console.log('   2. La IA guiará la discusión de pricing basada en los materiales generados.');
    console.log('   3. Documente los acuerdos en el template de decisiones durante la discusión.\n');

    console.log(iaBanner);
    console.log('');
    console.log(iaPrompt);
    console.log('');
    console.log(iaFooter);
  } catch (err) {
    console.warn('⚠️  Error inesperado:', err.message);
  }
}

export const estimateCommand = new Command('estimate')
  .description('Genera guía de discusión de pricing a partir de decisiones arquitectónicas y canvases del proyecto')
  .option('-c, --context <path>', 'Path to context.json for pipeline integration')
  .action((opts) => {
    runEstimate(process.cwd(), opts);
    process.exit(0);
  });
