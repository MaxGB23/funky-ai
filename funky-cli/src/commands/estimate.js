import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDecisions, findCanvases, readContext, writeContext } from '../utils/context.js';
import { generatePricingGuide, generateDecisionsTemplate, generateIAPrompt, generateIAPromptBanner, generateIAPromptFooter } from '../utils/estimateDomain.js';
import { TOPICS, DISPLAY_NAMES, STATUS, surfaceEstimateTopics } from '../utils/estimateTopics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Commander guarda los flags largos en camelCase (--multi-tenant → opts.multiTenant),
// mientras el dominio usa el topic key kebab (== nombre del flag, R8). Este lookup
// cubre ambos y deja que TOPICS.filter(t => flagValue(opts, t) === true) respete el
// orden canónico (R13) aunque el usuario escriba el flag con guiones.
function flagValue(opts, topic) {
  const camel = topic.replace(/-([a-z])/g, (_, ch) => ch.toUpperCase());
  return opts[topic] ?? opts[camel];
}

export function runEstimate(targetBase, opts = {}) {
  try {
    // ── Context (if applicable) ──
    let ctx = null;

    const contextArg = typeof opts.context === 'string' ? opts.context : (typeof opts.contextPath === 'string' ? opts.contextPath : null);
    if (opts.context || opts.contextPath) {
      ctx = readContext(targetBase, contextArg || undefined);
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

    // ── 2b. Sugerencias de consola (R11) ──
    // Solo consola, nunca en la guía: por cada tópico con señal Aplica cuyo flag
    // NO está seteado se sugiere incluir su sección. La ficha usa estas mismas
    // señales dentro del dominio; acá no se toca la guía.
    const { signals } = surfaceEstimateTopics(
      { projectCanvas: canvases.projectCanvas, infraCanvas: canvases.infraCanvas },
      decisions
    );
    for (const signal of signals) {
      if (signal.status === STATUS.APPLIES && flagValue(opts, signal.topic) !== true) {
        console.log(`💡 Se detectó ${DISPLAY_NAMES[signal.topic]} (${signal.evidence}). Considerá --${signal.topic} para incluir su sección en la guía.`);
      }
    }

    // ── 3. Generate Pricing Guide ──
    const estimateDir = path.join(targetBase, 'docs', 'funky-ai', 'estimate');
    try {
      fs.mkdirSync(estimateDir, { recursive: true });
    } catch (err) {
      const msg = err.code === 'EACCES' ? `Error de permisos al crear el directorio "${estimateDir}". Verifica que tengas permisos de escritura.` : err.message;
      console.warn('⚠️  No se pudo crear el directorio docs/funky-ai/estimate/:', msg);
    }

    // Mapeo Commander → opts del dominio (Interfaces/Contracts del design).
    // scopeFicha: true es interno y constante: la ficha de alcance (R9) es
    // always-on a nivel CLI; la función conserva el default legacy.
    const guideOpts = {
      brief: opts.brief,                                       // true | string | undefined
      topics: TOPICS.filter((t) => flagValue(opts, t) === true), // orden canónico → R13
      pricingTeam: opts.pricingTeam === true,
      scopeFicha: true,                                        // R9 always-on, interno
    };

    // Warn si --brief <path> no existe (R7): el dominio vuelve al checklist
    // (usedFallback); acá se avisa al usuario con la misma condición de base
    // (ruta resuelta contra targetBase == cwd del CLI).
    if (typeof guideOpts.brief === 'string') {
      const briefResolved = path.resolve(targetBase, guideOpts.brief);
      if (!fs.existsSync(briefResolved)) {
        console.warn(`⚠️  No se encontró el archivo de brief "${guideOpts.brief}". Se usó el checklist de preguntas en su lugar.`);
      }
    }

    let pricingGuide;
    try {
      pricingGuide = generatePricingGuide(decisions, canvases.projectCanvas, canvases.infraCanvas, guideOpts);
    } catch (err) {
      console.warn('⚠️  Error al generar la guía de pricing:', err.message);
      pricingGuide = 'Error al generar la guía de pricing.';
    }

    // pricing-guide.md es un artefacto DERIVADO de los inputs actuales (decisiones +
    // canvases): se regenera (sobrescribe) en cada ejecución.
    const pricingGuidePath = path.join(estimateDir, 'pricing-guide.md');
    try {
      fs.writeFileSync(pricingGuidePath, pricingGuide, 'utf8');
    } catch (err) {
      const msg = err.code === 'EACCES' ? `Error de permisos al escribir "${pricingGuidePath}". Verifica que tengas permisos de escritura.` : err.message;
      console.warn('⚠️  No se pudo escribir pricing-guide.md:', msg);
    }

    // ── 4. Generate Decisions Template ──
    let decisionsTemplate;
    try {
      decisionsTemplate = generateDecisionsTemplate();
    } catch (err) {
      console.warn('⚠️  Error al generar el template de decisiones:', err.message);
      decisionsTemplate = 'Error al generar el template de decisiones.';
    }

    // pricing-decisions.md es un doc VIVO del equipo: se crea solo si no existe
    // (create-if-not-exists), nunca se sobrescribe.
    const decisionsTemplatePath = path.join(estimateDir, 'pricing-decisions.md');
    if (fs.existsSync(decisionsTemplatePath)) {
      console.warn(`⚠️  "${decisionsTemplatePath}" ya existe. No se sobrescribió.`);
    } else {
      try {
        fs.writeFileSync(decisionsTemplatePath, decisionsTemplate, 'utf8');
      } catch (err) {
        const msg = err.code === 'EACCES' ? `Error de permisos al escribir "${decisionsTemplatePath}". Verifica que tengas permisos de escritura.` : err.message;
        console.warn('⚠️  No se pudo escribir pricing-decisions.md:', msg);
      }
    }

    // ── 5. Update Context ──
    if (ctx) {
      ctx.estimate.runAt = new Date().toISOString();
      writeContext(targetBase, ctx, contextArg || undefined);
    }

    // ── 6. Generate IA Prompt ──
    const iaPrompt = generateIAPrompt(path.relative(targetBase, pricingGuidePath), path.relative(targetBase, decisionsTemplatePath));
    const iaBanner = generateIAPromptBanner();
    const iaFooter = generateIAPromptFooter();

    // ── 7. Summary ──
    // Secciones incluidas en la guía: la ficha de alcance siempre está (R9);
    // brief, tópicos (orden canónico) y referencia de costos solo con sus flags.
    const includedSections = ['ficha de alcance'];
    if (guideOpts.brief !== undefined && guideOpts.brief !== false) {
      includedSections.push('brief funcional');
    }
    for (const topic of guideOpts.topics) {
      includedSections.push(DISPLAY_NAMES[topic].toLowerCase());
    }
    if (guideOpts.pricingTeam === true) {
      includedSections.push('referencia de costos de equipo');
    }
    console.log('\n✅ Material de pricing generado exitosamente.');
    console.log(`   📝 Guía de pricing: ${path.relative(targetBase, pricingGuidePath)}`);
    console.log(`   📝 Template de decisiones: ${path.relative(targetBase, decisionsTemplatePath)}`);
    console.log(`   📋 Secciones incluidas en la guía: ${includedSections.join(', ')}.`);
    console.log('\n📋 Próximos pasos:');
    console.log('   1. Copie el prompt de abajo y péguelo en la sesión de IA del proyecto.');
    console.log('   2. La IA leerá los archivos referenciados (pricing-guide.md y pricing-decisions.md) para guiar la discusión.');
    console.log('   3. Documente los acuerdos en docs/funky-ai/estimate/pricing-decisions.md durante la discusión.\n');

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
  .option('--brief [path]', 'Embed brief questions checklist (no value) or brief file content (value)')
  .option('--roles', 'Include roles section')
  .option('--multi-tenant', 'Include multi-tenant section')
  .option('--transactions', 'Include transactions section')
  .option('--security', 'Include security section')
  .option('--concurrency', 'Include concurrency section')
  .option('--integrations', 'Include integrations section')
  .option('--pricing-team', 'Include team-cost reference (no calculator)')
  .action((opts) => {
    runEstimate(process.cwd(), opts);
    process.exit(0);
  });
