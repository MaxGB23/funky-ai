import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadDecisions, findCanvases, readContext, writeContext, updatePhaseState } from '../utils/context.js';
import { generateDecisionsTemplate, buildPricingGuide, embedTopicSections, refreshPricingGuideBase, validatePricingGuideTemplate, TOPICS, DISPLAY_NAMES, TEAM_COST_KEY } from '../utils/estimateDomain.js';
import * as p from '@clack/prompts';
import { executeIntentions, existingGuides } from '../utils/fs-adapter.js';

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

// Drift check de la guía (2.3c/2.3e): compara la guía actual contra la que
// producirían los templates HOY, normalizando la respiración de newline alrededor
// de los pares de marcadores (la guía sembrada a mano y la que produce el embeder
// normalizan igual). Solo un cambio REAL de template/fragmento (o un reordenamiento)
// dispara la confirmación Y/N.
const TOPIC_BLOCK_NORM_RE = /\n<!-- topic:([a-z0-9-]+) -->\r?\n([\s\S]*?)\n?<!-- \/topic:\1 -->/g;
function normalizeEmbeddedGuide(content) {
  return String(content)
    .replace(TOPIC_BLOCK_NORM_RE, (m, key, body) => `\n<!-- topic:${key} -->\n${body}<!-- /topic:${key} -->`)
    .trim();
}

export async function runEstimate(targetBase, opts = {}) {
  const startedAt = Date.now();
  const warnings = [];
  const json = opts.json === true;
  // Entorno interactivo (TTY): sin terminal (pipes, CI, tests) NUNCA se pregunta
  // Y/N — las confirmaciones caen a default "n" logueado (R1, Fase 0 0.3). El
  // valor se lee por llamada (no al import), así que los tests pueden simularlo.
  const interactive = Boolean(process.stdin && process.stdin.isTTY);
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

    // ── 1. Existencia de archivos referenciados (M6/M11) ──
    // La guía REFERENCIA los archivos (no incrusta contenido): un archivo
    // ausente no degrada la guía, pero el aviso dice cómo generarlo.
    const decisionsPath = ctx?.assess?.decisionsFile || null;
    if (!loadDecisions(targetBase, decisionsPath)) {
      warn('⚠️  No se encontró docs/funky-ai/assess/architecture-decisions.md. La guía lo referencia; ejecuta "funky assess" para generarlo, o la IA preguntará el contexto.');
    }

    // ── 2. Canvas Discovery ──
    const canvases = findCanvases(targetBase);
    if (!canvases.projectCanvas) {
      warn('⚠️  No se encontró PROJECT-CANVAS.md en docs/funky-ai/canvas/. La guía lo referencia; ejecuta "funky init" si aún no existe.');
    }
    if (!canvases.infraCanvas) {
      warn('⚠️  No se encontró INFRA-CANVAS.md en docs/funky-ai/canvas/. La guía lo referencia; ejecuta "funky init" si aún no existe.');
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

    // Secciones a incrustar en la zona `<!-- topics -->`: topics canónicos +
    // referencia de costos de equipo al final (R10). La zona y el embeder del
    // dominio ya saben resolver TEAM_COST_KEY contra team-cost-reference-template.md.
    const embedKeys = [
      ...guideOpts.topics,
      ...(guideOpts.pricingTeam ? [TEAM_COST_KEY] : []),
    ];

    if (guideOpts.pricingTeam) {
      warn('⚠️  ALERTA: Detecté la flag --pricing-team. Abre docs/funky-ai/estimate/pricing-guide.md, busca la sección "Rangos Reales del Equipo" y llena la tabla con tus costos reales ANTES de darle luz verde a la IA.');
    }

    // Warn si --brief <path> no existe (R7): el dominio vuelve al checklist
    // (usedFallback); acá se avisa al usuario con la misma condición de base
    // (ruta resuelta contra targetBase == cwd del CLI).
    if (typeof guideOpts.brief === 'string') {
      const briefResolved = path.resolve(targetBase, guideOpts.brief);
      if (!fs.existsSync(briefResolved)) {
        warn(`⚠️  No se encontró el archivo de brief "${guideOpts.brief}". Se usó el checklist de preguntas en su lugar; verifica la ruta o crea el brief con "funky init".`);
      }
    }

    // Auto-detección del brief de init (issue #33): si NO se pasó --brief y existe
    // docs/funky-ai/canvas/brief-funcional.md (generado por funky init), usarlo
    // automáticamente como sección Brief Funcional. --brief <path> sigue siendo
    // override explícito; --brief sin valor (true) fuerza el checklist (R7).
    // M8: sin brief y sin --brief el usuario NO lo sabía (no había aviso); ahora
    // se avisa que la IA preguntará el contexto de negocio, armonizado con M11
    // (mismo comando correctivo que los canvases: funky init).
    if (guideOpts.brief === undefined) {
      const initBriefPath = path.join(targetBase, 'docs', 'funky-ai', 'canvas', 'brief-funcional.md');
      if (fs.existsSync(initBriefPath)) {
        guideOpts.brief = initBriefPath;
        log('💡 Brief funcional auto-detectado desde funky init: docs/funky-ai/canvas/brief-funcional.md');
      } else {
        warn('⚠️  No se encontró docs/funky-ai/canvas/brief-funcional.md. La IA preguntará el contexto de negocio; créalo con "funky init".');
      }
    }

    // ── 3b. Pricing Guide (marcadores, Fase 2 2.3) ──
    // pricing-guide.md es una GUÍA (no un derivado regenerable): la zona
    // `<!-- topics --> ... <!-- /topics -->` conserva los flags incrustados de
    // forma ADITIVA. Flag nuevo solicitado → se incrusta SIN preguntar. Si el
    // template base o un fragmento de topic cambió (drift), se confirma Y/N:
    // "y" refresca la base y reincrusta TODOS los topics detectados; "n"
    // conserva la guía actual. Guía legacy sin marcadores → se regenera.
    const pricingGuidePath = path.join(estimateDir, 'pricing-guide.md');
    let guideContent;
    try {
      if (!fs.existsSync(pricingGuidePath)) {
        guideContent = buildPricingGuide(embedKeys);
      } else {
        const currentGuide = fs.readFileSync(pricingGuidePath, 'utf8');
        let isMarkerGuide = true;
        try {
          validatePricingGuideTemplate(currentGuide);
        } catch (err) {
          isMarkerGuide = false;
        }
        if (!isMarkerGuide) {
          guideContent = buildPricingGuide(embedKeys);
        } else {
          guideContent = embedTopicSections(currentGuide, embedKeys);
          const refreshed = refreshPricingGuideBase(buildPricingGuide([]), guideContent);
          if (normalizeEmbeddedGuide(refreshed) !== normalizeEmbeddedGuide(guideContent)) {
            if (json) {
              warn('⚠️  Template de pricing-guide actualizado: se conserva la guía actual (default n, --json).');
            } else if (!interactive) {
              log('⚡ Template de pricing-guide actualizado: se conserva la guía actual (default n, sin terminal).');
            } else {
              const updated = await p.confirm({
                message: 'El template de la guía de pricing cambió (base o fragmento de topic). ¿Reconstruir la base y reincrustar todas las secciones detectadas? (y: refrescar / n: conservar la guía actual)',
              });
              if (updated === true) {
                guideContent = refreshed;
              } else if (updated === false || p.isCancel(updated)) {
                log('⚡ Template de pricing-guide actualizado: se conserva la guía actual.');
              }
            }
          }
        }
      }
      fs.writeFileSync(pricingGuidePath, guideContent, 'utf8');
    } catch (err) {
      const msg = err.code === 'EACCES' ? `Error de permisos al escribir "${pricingGuidePath}". Verifica que tengas permisos de escritura.` : err.message;
      warn('⚠️  No se pudo generar/escribir pricing-guide.md:', msg);
    }

    // ── 3c. estimate-prompt.md (guía kind guide, Fase 2 2.8) ──
    // Archivo NUEVO → se crea sin preguntar. Existente → confirmación Y/N con
    // advertencia explícita de pérdida; --json (pipeline/CI) → default "n".
    const estimatePromptPath = path.join(estimateDir, 'estimate-prompt.md');
    let promptWritten = false;
    try {
      const promptTemplate = fs.readFileSync(path.join(__dirname, '..', 'templates', 'estimate', 'estimate-prompt-template.md'), 'utf8');
      const promptExists = fs.existsSync(estimatePromptPath);
      if (promptExists) {
        if (json) {
          warn('⚠️  estimate-prompt.md ya existe: se conserva la versión actual (default n, --json).');
        } else if (!interactive) {
          log('⚡ estimate-prompt.md ya existe: se conserva la versión actual (default n, sin terminal).');
        } else {
          const overwrite = await p.confirm({
            message: 'docs/funky-ai/estimate/estimate-prompt.md ya existe. ¿Reemplazarlo por la versión más reciente? Se pierde el progreso previo si no hay respaldo. (y: reemplazar / n: conservar la versión actual)',
          });
          if (overwrite === true) {
            fs.writeFileSync(estimatePromptPath, promptTemplate, 'utf8');
            promptWritten = true;
          } else if (overwrite === false || p.isCancel(overwrite)) {
            log('⚡ Omitiendo (ya existe): estimate-prompt.md');
          }
        }
      } else {
        fs.writeFileSync(estimatePromptPath, promptTemplate, 'utf8');
        promptWritten = true;
      }
    } catch (err) {
      warn('⚠️  No se pudo generar estimate-prompt.md:', err.message);
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
    if (!interactive && existingGuides(intentions).length > 0) {
      log('⚠️ Entorno no interactivo: no se actualizan las guías existentes.');
    }

    // El plan de estimate es puro kind 'decision' (nunca pregunta): el motor
    // async delega en el núcleo síncrono applyIntention. runEstimate es async
    // porque la acción Commander y el pipeline (pipeline.js) lo await-ean.
    const { logs } = await executeIntentions(intentions);
    for (const line of logs) {
      log(line);
    }

    // ── 5. Update Context ──
    const artifacts = [
      {
        name: 'pricing-guide.md',
        path: path.relative(targetBase, pricingGuidePath).split(path.sep).join('/'),
        kind: 'generated'
      },
      ...(promptWritten
        ? [{ name: 'estimate-prompt.md', path: path.relative(targetBase, estimatePromptPath).split(path.sep).join('/'), kind: 'guide' }]
        : [])
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

    // ── 6. Summary (terminal limpia, 2.2/2.8; M7: estado por archivo) ──
    // El material de la sesión vive en archivos (pricing-guide.md y
    // estimate-prompt.md): la terminal referencia la guía de prompt en vez de
    // imprimir el prompt gigante (2.8). La ficha de alcance ya no existe
    // (2.1/1.5): se lista lo solicitado, sin ficha. Cada archivo muestra su
    // estado (generado / creado / conservado) para no afirmar "generado
    // exitosamente" cuando hubo omisiones (M7).
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
      const rel = (p) => path.relative(targetBase, p).split(path.sep).join('/');
      const decisionsLine = logs.find((l) => l.includes('pricing-decisions.md'));
      const decisionsStatus = decisionsLine && decisionsLine.includes('✅') ? 'creado' : 'conservado';
      const promptStatus = promptWritten ? 'creado' : (fs.existsSync(estimatePromptPath) ? 'conservado' : null);
      const rows = [
        { label: 'Guía de pricing', path: rel(pricingGuidePath), status: 'generado' },
        { label: 'Template de decisiones', path: rel(decisionsTemplatePath), status: decisionsStatus },
        ...(promptStatus ? [{ label: 'Prompt de la sesión', path: rel(estimatePromptPath), status: promptStatus }] : []),
      ];
      const createdCount = rows.filter((r) => r.status === 'creado').length;
      const conservedCount = rows.filter((r) => r.status === 'conservado').length;

      console.log(`\n✅ Material de pricing listo: ${createdCount} creados, ${conservedCount} conservados.`);
      for (const row of rows) {
        console.log(`   📝 ${row.label}: ${row.path} — ${row.status}`);
      }
      console.log(`   📋 Secciones solicitadas en la guía: ${sectionsLabel}.`);
      console.log('\n📋 Próximos pasos:');
      console.log('   1. Abra la guía de prompt en docs/funky-ai/estimate/estimate-prompt.md y úsela para iniciar la sesión de IA del proyecto.');
      console.log('   2. La IA leerá los archivos referenciados (pricing-guide.md y pricing-decisions.md) para guiar la discusión.');
      console.log('   3. Documente los acuerdos en docs/funky-ai/estimate/pricing-decisions.md durante la discusión.\n');
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
  .action(async (opts) => {
    const result = await runEstimate(process.cwd(), opts);
    process.exit(result.status === 'failed' ? 1 : 0);
  });
