import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDecisions, findCanvases, readContext, writeContext, updatePhaseState } from '../utils/context.js';
import { generatePricingGuide, generateDecisionsTemplate, generateIAPrompt, generateIAPromptBanner, generateIAPromptFooter, TOPICS, DISPLAY_NAMES } from '../utils/estimateDomain.js';
import { executeIntentionsSync, existingGuides } from '../utils/fs-adapter.js';

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
  const startedAt = Date.now();
  const warnings = [];
  const json = opts.json === true;
  const warn = (msg) => {
    warnings.push(msg);
    console.warn(msg);
  };
  const log = (msg) => {
    if (!json) console.log(msg);
  };

  try {
    // ── Context (if applicable) ──
    let ctx = null;

    const contextArg = typeof opts.context === 'string' ? opts.context : (typeof opts.contextPath === 'string' ? opts.contextPath : null);
    if (opts.context || opts.contextPath) {
      const readResult = readContext(targetBase, contextArg || undefined);
      if (!readResult.ok) {
        console.error('❌ No se pudo leer context.json. Asegurate de haber ejecutado "funky pipeline assess" primero.');
        return { phase: 'estimate', status: 'failed', artifacts: [], durationMs: Date.now() - startedAt, warnings };
      }
      ctx = readResult.ctx;
    }

    // ── 1. Load Decisions ──
    const decisionsPath = ctx?.assess?.decisionsFile || null;
    const decisions = loadDecisions(targetBase, decisionsPath);
    if (!decisions) {
      warn('⚠️  No se encontró docs/funky-ai/assess/architecture-decisions.md. Generando guía con contenido parcial.');
    }

    // ── 2. Canvas Discovery ──
    const canvases = findCanvases(targetBase);
    if (!canvases.projectCanvas) {
      warn('⚠️  No se encontró PROJECT-CANVAS.md en docs/funky-ai/canvas/. Usando placeholder.');
    }
    if (!canvases.infraCanvas) {
      warn('⚠️  No se encontró INFRA-CANVAS.md en docs/funky-ai/canvas/. Usando placeholder.');
    }
    if (canvases.unfilledCount > 0) {
      warn(`⚠️  Se detectaron ${canvases.unfilledCount} secciones sin completar ("[Responde aquí]") en los canvases. La discusión se basará en datos parciales.`);
    }

    // ── 2b. Sugerencias de consola (R11) — ELIMINADAS (2.2) ──
    // TODO(Fase 2, 2.2): la terminal queda limpia para checks y warnings; ya NO
    // se imprimen sugerencias automáticas de flags ("💡 Se detectó ... Considerá")
    // ni el prompt gigante. surfaceEstimateTopics/estimateTopics.js fueron
    // eliminados (Pendiente 1); la guía corta de flags del template decide.

    // ── 3. Generate Pricing Guide ──
    const estimateDir = path.join(targetBase, 'docs', 'funky-ai', 'estimate');
    try {
      fs.mkdirSync(estimateDir, { recursive: true });
    } catch (err) {
      const msg = err.code === 'EACCES' ? `Error de permisos al crear el directorio "${estimateDir}". Verifica que tengas permisos de escritura.` : err.message;
      warn('⚠️  No se pudo crear el directorio docs/funky-ai/estimate/:', msg);
    }

    // Mapeo Commander → opts del dominio (Interfaces/Contracts del design).
    // TODO(Fase 2, 1.5/2.4): la ficha de alcance (scopeFicha) se eliminó junto con
    // estimateTopics.js; la guía corta de flags vive en el template base.
    const guideOpts = {
      brief: opts.brief,                                       // true | string | undefined
      topics: TOPICS.filter((t) => flagValue(opts, t) === true), // orden canónico → R13
      pricingTeam: opts.pricingTeam === true,
    };

    // Warn si --brief <path> no existe (R7): el dominio vuelve al checklist
    // (usedFallback); acá se avisa al usuario con la misma condición de base
    // (ruta resuelta contra targetBase == cwd del CLI).
    if (typeof guideOpts.brief === 'string') {
      const briefResolved = path.resolve(targetBase, guideOpts.brief);
      if (!fs.existsSync(briefResolved)) {
        warn(`⚠️  No se encontró el archivo de brief "${guideOpts.brief}". Se usó el checklist de preguntas en su lugar.`);
      }
    }

    // Auto-detección del brief de init (issue #33): si NO se pasó --brief y existe
    // docs/funky-ai/canvas/brief-funcional.md (generado por funky init), usarlo
    // automáticamente como sección Brief Funcional. --brief <path> sigue siendo
    // override explícito; --brief sin valor (true) fuerza el checklist (R7).
    if (guideOpts.brief === undefined) {
      const initBriefPath = path.join(targetBase, 'docs', 'funky-ai', 'canvas', 'brief-funcional.md');
      if (fs.existsSync(initBriefPath)) {
        guideOpts.brief = initBriefPath;
        log('💡 Brief funcional auto-detectado desde funky init: docs/funky-ai/canvas/brief-funcional.md');
      }
    }

    let pricingGuide;
    try {
      pricingGuide = generatePricingGuide(decisions, canvases.projectCanvas, canvases.infraCanvas, guideOpts);
    } catch (err) {
      warn('⚠️  Error al generar la guía de pricing:', err.message);
      pricingGuide = 'Error al generar la guía de pricing.';
    }

    // pricing-guide.md es un artefacto DERIVADO de los inputs actuales (decisiones +
    // canvases): se regenera (sobrescribe) en cada ejecución.
    const pricingGuidePath = path.join(estimateDir, 'pricing-guide.md');
    try {
      fs.writeFileSync(pricingGuidePath, pricingGuide, 'utf8');
    } catch (err) {
      const msg = err.code === 'EACCES' ? `Error de permisos al escribir "${pricingGuidePath}". Verifica que tengas permisos de escritura.` : err.message;
      warn('⚠️  No se pudo escribir pricing-guide.md:', msg);
    }

    // ── 4. Generate Decisions Template ──
    let decisionsTemplate;
    try {
      decisionsTemplate = generateDecisionsTemplate();
    } catch (err) {
      warn('⚠️  Error al generar el template de decisiones:', err.message);
      decisionsTemplate = 'Error al generar el template de decisiones.';
    }

    // pricing-decisions.md es un doc VIVO del equipo: intención kind 'decision'
    // (create-if-not-exists) delegada al motor común — nunca se sobrescribe y,
    // si existe, el motor loguea la recomendación de backup completa (Fase 0, 0.2).
    const decisionsTemplatePath = path.join(estimateDir, 'pricing-decisions.md');
    const intentions = [
      { action: 'create', kind: 'decision', content: decisionsTemplate, dest: decisionsTemplatePath },
    ];

    // Aviso no-TTY genérico, mismo patrón que init/assess (Fase 0, 0.3):
    // condicionado a que exista ≥1 guía del plan. En Fase 0 estimate no tiene
    // guías (pricing-guide.md es derivado regenerable; Fase 2 lo convierte en
    // guía con Y/N), así que el aviso no se dispara todavía.
    const interactive = Boolean(process.stdin && process.stdin.isTTY);
    if (!interactive && existingGuides(intentions).length > 0) {
      log('⚠️ Entorno no interactivo: no se actualizan las guías existentes.');
    }

    // Ejecución síncrona: runEstimate es un comando síncrono (pipeline lo
    // invoca sin await), por lo que las intenciones sin confirmación corren por
    // executeIntentionsSync (kind decision nunca pregunta).
    const { logs } = executeIntentionsSync(intentions);
    for (const line of logs) {
      log(line);
    }

    // ── 5. Update Context ──
    const artifacts = [
      {
        name: 'pricing-guide.md',
        path: path.relative(targetBase, pricingGuidePath).split(path.sep).join('/'),
        kind: 'generated'
      }
    ];
    if (ctx) {
      const finishedAt = new Date().toISOString();
      updatePhaseState(ctx, 'estimate', {
        status: 'completed',
        startedAt: ctx.estimate.startedAt ?? new Date(startedAt).toISOString(),
        finishedAt,
        durationMs: Date.now() - startedAt,
        artifacts,
        runAt: finishedAt
      });
      writeContext(targetBase, ctx, contextArg || undefined);
    }

    // ── 6. Generate IA Prompt ──
    const iaPrompt = generateIAPrompt(path.relative(targetBase, pricingGuidePath), path.relative(targetBase, decisionsTemplatePath));
    const iaBanner = generateIAPromptBanner();
    const iaFooter = generateIAPromptFooter();

    // ── 7. Summary ──
    // TODO(Fase 2, 2.4): el resumen debe listar las secciones REALMENTE incrustadas
    // por buildPricingGuide/embedTopicSections. La ficha de alcance ya no existe
    // (2.1/1.5): se lista lo solicitado, sin ficha.
    if (!json) {
      const includedSections = [];
      if (guideOpts.brief !== undefined && guideOpts.brief !== false) {
        includedSections.push('brief funcional');
      }
      for (const topic of guideOpts.topics) {
        includedSections.push(DISPLAY_NAMES[topic].toLowerCase());
      }
      if (guideOpts.pricingTeam === true) {
        includedSections.push('referencia de costos de equipo');
      }
      const sectionsLabel = includedSections.length > 0 ? includedSections.join(', ') : 'ninguna (guía base declarativa)';
      console.log('\n✅ Material de pricing generado exitosamente.');
      console.log(`   📝 Guía de pricing: ${path.relative(targetBase, pricingGuidePath)}`);
      console.log(`   📝 Template de decisiones: ${path.relative(targetBase, decisionsTemplatePath)}`);
      console.log(`   📋 Secciones solicitadas en la guía: ${sectionsLabel}.`);
      console.log('\n📋 Próximos pasos:');
      // TODO(Fase 2, 2.8): reemplazar la impresión del prompt gigante por la
      // referencia a docs/funky-ai/estimate/estimate-prompt.md (guía kind guide).
      console.log('   1. Copie el prompt de abajo y péguelo en la sesión de IA del proyecto.');
      console.log('   2. La IA leerá los archivos referenciados (pricing-guide.md y pricing-decisions.md) para guiar la discusión.');
      console.log('   3. Documente los acuerdos en docs/funky-ai/estimate/pricing-decisions.md durante la discusión.\n');

      console.log(iaBanner);
      console.log('');
      console.log(iaPrompt);
      console.log('');
      console.log(iaFooter);
    }

    return {
      phase: 'estimate',
      status: 'completed',
      artifacts,
      durationMs: Date.now() - startedAt,
      warnings
    };
  } catch (err) {
    const msg = `⚠️  Error inesperado: ${err.message}`;
    warnings.push(msg);
    console.warn(msg);
    return { phase: 'estimate', status: 'failed', artifacts: [], durationMs: Date.now() - startedAt, warnings };
  }
}

export const estimateCommand = new Command('estimate')
  .description('Genera guía de discusión de pricing a partir de decisiones arquitectónicas y canvases del proyecto')
  .option('-c, --context <path>', 'Path to context.json for pipeline integration')
  .option('--brief [path]', 'Auto-detect docs/funky-ai/canvas/brief-funcional.md from funky init; pass a path to override, or no value for the questions checklist')
  .option('--roles', 'Include roles section')
  .option('--multi-tenant', 'Include multi-tenant section')
  .option('--transactions', 'Include transactions section')
  .option('--security', 'Include security section')
  .option('--concurrency', 'Include concurrency section')
  .option('--integrations', 'Include integrations section')
  .option('--pricing-team', 'Include team-cost reference (no calculator)')
  .action((opts) => {
    const result = runEstimate(process.cwd(), opts);
    process.exit(result.status === 'failed' ? 1 : 0);
  });
