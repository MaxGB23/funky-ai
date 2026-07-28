import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDecisions, findCanvases, generatePricingGuide, generateDecisionsTemplate, generateIAPrompt } from '../utils/estimateDomain.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const estimateCommand = new Command('estimate')
  .description('Genera guía de discusión de pricing a partir de decisiones arquitectónicas y canvases del proyecto')
  .action(() => {
    try {
      const targetBase = process.cwd();

      // ── 1. Load Decisions ──
      const decisions = loadDecisions(targetBase);
      if (!decisions) {
        console.warn('⚠️  No se encontró docs/architecture-decisions.md. Generando guía con contenido parcial.');
      }

      // ── 2. Canvas Discovery ──
      const canvases = findCanvases(targetBase);
      if (!canvases.projectCanvas) {
        console.warn('⚠️  No se encontró PROJECT-CANVAS.md (ni en raíz ni en docs/). Usando placeholder.');
      }
      if (!canvases.infraCanvas) {
        console.warn('⚠️  No se encontró INFRA-CANVAS.md (ni en raíz ni en docs/). Usando placeholder.');
      }
      if (canvases.unfilledCount > 0) {
        console.warn(`⚠️  Se detectaron ${canvases.unfilledCount} secciones sin completar ("[Responde aquí]") en los canvases. La discusión se basará en datos parciales.`);
      }

      // ── 3. Generate Pricing Guide ──
      const promptsDir = path.join(targetBase, '.agents', 'prompts');
      try {
        fs.mkdirSync(promptsDir, { recursive: true });
      } catch (err) {
        console.warn('⚠️  No se pudo crear el directorio .agents/prompts/:', err.message);
      }

      let pricingGuide;
      try {
        pricingGuide = generatePricingGuide(decisions, canvases.projectCanvas, canvases.infraCanvas);
      } catch (err) {
        console.warn('⚠️  Error al generar la guía de pricing:', err.message);
        pricingGuide = 'Error al generar la guía de pricing.';
      }

      const pricingGuidePath = path.join(promptsDir, 'pricing-guide.md');
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

      const decisionsTemplatePath = path.join(promptsDir, 'pricing-decisions-template.md');
      try {
        fs.writeFileSync(decisionsTemplatePath, decisionsTemplate, 'utf8');
      } catch (err) {
        console.warn('⚠️  No se pudo escribir pricing-decisions-template.md:', err.message);
      }

      // ── 5. Generate IA Prompt ──
      const iaPrompt = generateIAPrompt(decisions, canvases.projectCanvas, canvases.infraCanvas);

      // ── 6. Summary ──
      console.log('\n✅ Material de pricing generado exitosamente.');
      console.log(`   📝 Guía de pricing: ${path.relative(targetBase, pricingGuidePath)}`);
      console.log(`   📝 Template de decisiones: ${path.relative(targetBase, decisionsTemplatePath)}`);
      console.log('\n📋 Próximos pasos:');
      console.log('   1. Copie el prompt de abajo y péguelo en una sesión de chat con la IA.');
      console.log('   2. La IA guiará la discusión de pricing basada en los materiales generados.');
      console.log('   3. Documente los acuerdos en el template de decisiones durante la discusión.\n');

      console.log(iaPrompt);

      process.exit(0);
    } catch (err) {
      console.warn('⚠️  Error inesperado:', err.message);
      process.exit(0);
    }
  });
