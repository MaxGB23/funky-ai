import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import { surfaceRiskPatterns } from '../utils/assessRules.js';
import { findCanvases } from '../utils/canvasDiscovery.js';
import { readContext, writeContext, updatePhaseState, getTodayDate } from '../utils/context.js';
import { executeIntentions, existingGuides } from '../utils/fs-adapter.js';

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

export async function runAssess(targetBase, opts = {}) {
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
    // ── 1. Context (opcional) ──
    let ctx = null;

    const contextArg = typeof opts.context === 'string' ? opts.context : (typeof opts.contextPath === 'string' ? opts.contextPath : null);
    if (opts.context || opts.contextPath) {
      const readResult = readContext(targetBase, contextArg || undefined);
      if (!readResult.ok) {
        console.error('❌ No se pudo leer context.json. Asegúrate de haber ejecutado "funky pipeline assess" primero.');
        return { phase: 'assess', status: 'failed', artifacts: [], durationMs: Date.now() - startedAt, warnings };
      }
      ctx = readResult.ctx;
    }

    // ── 2. Canvas Discovery ──
    const canvases = findCanvases(targetBase);

    if (!canvases.projectCanvas) {
      warn('⚠️  No se encontró PROJECT-CANVAS.md en docs/funky-ai/canvas/. La guía lo referencia; créalo con "funky init" si aún no existe.');
    }

    if (!canvases.infraCanvas) {
      warn('⚠️  No se encontró INFRA-CANVAS.md en docs/funky-ai/canvas/. La guía lo referencia; créalo con "funky init" si aún no existe.');
    }

    // ── 3. Canvas Validation ──
    if (canvases.unfilledCount > 0) {
      warn(`⚠️  Se detectaron ${canvases.unfilledCount} secciones sin completar ("[Responde aquí]") en los canvases. La discusión se basará en datos parciales.`);
    }

    const templatesDir = path.join(__dirname, '../templates/assess');
    const assessDir = path.join(targetBase, 'docs', 'funky-ai', 'assess');

    // ── 4. Template de patrones de riesgo ──
    const patternsTemplatePath = path.join(templatesDir, 'risk-patterns-template.md');
    let patternsTemplateContent = '';
    try {
      patternsTemplateContent = fs.readFileSync(patternsTemplatePath, 'utf8');
    } catch (err) {
      warn('⚠️  Error al leer el template de patrones de riesgo:', err.message);
    }

    // ── 5. Template de decisiones (conserva el reemplazo {{DATE}}) ──
    const decisionsTemplatePath = path.join(templatesDir, 'architecture-decisions-template.md');
    let decisionsContent = '';
    try {
      decisionsContent = fs.readFileSync(decisionsTemplatePath, 'utf8').replace(/{{DATE}}/g, getTodayDate());
    } catch (err) {
      warn('⚠️  Error al leer el template de decisiones:', err.message);
    }

    // ── 6. Plan de intenciones (feedback por archivo, Fase 2) ──
    // risk-patterns.md y architecture-decisions.md son documentos VIVOS del
    // equipo (kind 'decision'): solo se crean la primera vez; si ya existen no
    // se sobrescriben y se recomienda eliminar o mover con backup.
    // assess-prompt.md es una guía (kind 'guide'): si ya existe se pregunta Y/N.
    const intentions = [
      { action: 'mkdir', dest: assessDir },
      { action: 'create', kind: 'decision', content: patternsTemplateContent, dest: path.join(assessDir, 'risk-patterns.md') },
      { action: 'create', kind: 'decision', content: decisionsContent, dest: path.join(assessDir, 'architecture-decisions.md') },
      { action: 'copy', kind: 'guide', src: path.join(templatesDir, 'assess-prompt-template.md'), dest: path.join(assessDir, 'assess-prompt.md') },
    ];

    // Confirmación Y/N solo en entorno interactivo; sin TTY el default es "n"
    // (executeIntentions lo loguea) — nunca se sobrescriben guías sin input humano.
    // El aviso no-TTY es genérico y condicionado a que exista ≥1 guía del plan
    // (Fase 0, 0.3 — mismo patrón que init), no hardcodeado a assess-prompt.md.
    const interactive = Boolean(process.stdin && process.stdin.isTTY);
    let askConfirm;
    if (interactive) {
      askConfirm = async (dest, basename) => {
        const answer = await p.confirm({
          message: `Ya existe ${basename}. Actualizarla trae la versión más reciente, pero REEMPLAZA la actual: perderás el progreso previo (anotaciones, ajustes) si no tienes un respaldo. ¿Quieres actualizarla?`,
          initialValue: false,
        });
        return !p.isCancel(answer) && answer === true;
      };
    } else if (existingGuides(intentions).length > 0) {
      log('⚠️ Entorno no interactivo: no se actualizan las guías existentes.');
    }

    const { logs } = await executeIntentions(intentions, { askConfirm });
    for (const line of logs) {
      log(line);
    }

    // ── 7. Surface Risk Patterns (solo metadata para context) ──
    let surfaceResult;
    try {
      surfaceResult = surfaceRiskPatterns(targetBase, patternsTemplateContent);
    } catch (err) {
      warn('⚠️  Error al superficiar patrones de riesgo:', err.message);
      surfaceResult = { content: '', patterns: [] };
    }

    // ── 8. Write Context (si aplica) ──
    const promptDestPath = path.join(assessDir, 'assess-prompt.md');
    const artifacts = [
      {
        name: 'assess-prompt.md',
        path: path.relative(targetBase, promptDestPath).split(path.sep).join('/'),
        kind: 'living'
      }
    ];
    if (ctx) {
      const finishedAt = new Date().toISOString();
      // Ruta real (relativa al targetBase, con separadores "/") del archivo de
      // decisiones que assess usó; estimate con --context la lee para no caer al
      // default. Se normalizan los separadores para portabilidad Windows/POSIX.
      const decisionsDestPath = path.join(assessDir, 'architecture-decisions.md');
      updatePhaseState(ctx, 'assess', {
        status: 'completed',
        startedAt: ctx.assess.startedAt ?? new Date(startedAt).toISOString(),
        finishedAt,
        durationMs: Date.now() - startedAt,
        artifacts,
        runAt: finishedAt,
        surfacedPatterns: surfaceResult.patterns || [],
        decisionsFile: path.relative(targetBase, decisionsDestPath).split(path.sep).join('/')
      });
      writeContext(targetBase, ctx, contextArg || undefined);
    }

    // ── 9. Summary (M10: estado por archivo; no afirmar "generado
    // exitosamente" cuando hubo omisiones o conservados) ──
    if (!json) {
      const rel = (p) => path.relative(targetBase, p).split(path.sep).join('/');
      const riskPatternsDestPath = path.join(assessDir, 'risk-patterns.md');
      const decisionsDestPath = path.join(assessDir, 'architecture-decisions.md');
      const statusOf = (basename) => {
        const line = logs.find((l) => l.includes(basename));
        if (line && line.includes('✅ Creado')) return 'creado';
        if (line && line.includes('✅ Actualizada')) return 'actualizado';
        return 'conservado';
      };
      const rows = [
        { label: 'Prompt de discusión', path: rel(promptDestPath), status: statusOf('assess-prompt.md') },
        { label: 'Patrones de riesgo', path: rel(riskPatternsDestPath), status: statusOf('risk-patterns.md') },
        { label: 'Decisiones', path: rel(decisionsDestPath), status: statusOf('architecture-decisions.md') },
      ];
      const createdCount = rows.filter((r) => r.status !== 'conservado').length;
      const conservedCount = rows.filter((r) => r.status === 'conservado').length;
      console.log(`\n✅ Material de assess listo: ${createdCount} creados, ${conservedCount} conservados.`);
      for (const row of rows) {
        console.log(`   📝 ${row.label}: ${row.path} — ${row.status}`);
      }
      console.log('\n📋 Próximos pasos:');
      console.log('   1. Abre una sesión de chat con la IA.');
      console.log('   2. Copia el contenido de docs/funky-ai/assess/assess-prompt.md y pégalo como primer mensaje.');
      console.log('   3. El agente lee los archivos referenciados (brief, canvases y risk-patterns.md) en el orden que marca el prompt.');
      console.log('   4. Discute un punto a la vez y anota cada decisión aprobada en docs/funky-ai/assess/architecture-decisions.md.\n');
    }

    return {
      phase: 'assess',
      status: 'completed',
      artifacts,
      durationMs: Date.now() - startedAt,
      warnings
    };
  } catch (err) {
    console.error(`❌ Error al generar los archivos de assess: ${err.message}`);
    return { phase: 'assess', status: 'failed', artifacts: [], durationMs: Date.now() - startedAt, warnings };
  }
}

export const assessCommand = new Command('assess')
  .description('Genera guía de discusión arquitectónica a partir de los canvases del proyecto')
  .option('-c, --context <path>', 'Path to context.json for pipeline integration')
  .action(async (opts) => {
    const result = await runAssess(process.cwd(), opts);
    process.exit(result.status === 'failed' ? 1 : 0);
  });
