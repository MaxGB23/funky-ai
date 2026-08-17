import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as p from '@clack/prompts';
import { executeIntentions } from '../utils/fs-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Injection Matrix (Design: single source of truth for conditional file mapping) ---

/**
 * Resolves which template files to inject per tier.
 * Source of truth: spec-cli-ide-boundaries.md §Diagrama de Inyección.
 *
 * T1: tasks.md + report.md. No docs, no release.
 * T2: tasks.md + report.md + explore.md + proposal.md + spec.template.md + [docs.md] + release-checklist.md.
 * T3: tasks.md + [docs.md] + release-checklist.md. No report.md.
 */
const INJECTION_MATRIX = {
  T1: {
    base: ['tasks.md', 'report.md'],
    tier: [],
    docsConditional: false, // T1 never asks about docs
    release: false,         // T1 never injects release-checklist.md
  },
  T2: {
    base: ['tasks.md', 'report.md'],
    tier: ['explore.md', 'proposal.md', 'spec.template.md'],
    docsConditional: true,
    release: true,          // T2 always injects release-checklist.md
  },
  T3: {
    base: ['tasks.md'],
    tier: [],
    docsConditional: true,
    release: true,          // T3 always injects release-checklist.md
  },
};

/**
 * Pure function — resolves which template files to inject.
 * No I/O, no prompts. Testable in isolation.
 *
 * @param {{ tier: string, docsImpact: boolean } | undefined} injectionParams
 *   When omitted, returns the legacy 9-file list (backward compat).
 * @returns {string[]} List of template filenames to copy.
 */
export function resolveFiles(injectionParams) {
  if (!injectionParams) {
    // Backward compat: exact original 9-file list
    return [
      'explore.md', 'proposal.md', 'design.md', 'spec.template.md', 'tasks.md',
      'planning-handoff.md', 'report.md', 'apply.md', 'verify.md',
    ];
  }

  const { tier, docsImpact } = injectionParams;
  const config = INJECTION_MATRIX[tier];

  const files = [...config.base, ...config.tier];

  if (config.docsConditional && docsImpact) {
    files.push('docs.md');
  }

  if (config.release) {
    files.push('release-checklist.md');
  }

  return files;
}

/**
 * Lógica pura del comando `funky feature`.
 * @param {object} opts
 * @param {string} opts.featureName    - Nombre de la feature (ej: 'auth-login').
 * @param {string} opts.cliTemplatesDir- Directorio absoluto de templates genéricos del CLI.
 * @param {string} opts.cwd            - Directorio de trabajo destino.
 * @param {object} [opts.injectionParams] - Optional. When omitted, copies all 9 legacy files (backward compat).
 * @param {string} opts.injectionParams.tier - 'T1' | 'T2' | 'T3'
 * @param {boolean} opts.injectionParams.docsImpact - true if user wants docs.md (T2/T3 only)
 * @returns {{ success: boolean, error?: string, path?: string, copiedFiles?: string[] }}
 */
export function runFeature({ featureName, cliTemplatesDir, cwd, injectionParams, hasGoldenTemplates = false, featureExists = false }) {
  // 1. Sanitizar featureName
  const sanitizedFeatureName = featureName.trim().replace(/\s+/g, '-').toLowerCase();

  // 2. Determinar rutas (Golden vs Fallback)
  const goldenTemplatesDir = path.join(cwd, '.agents', 'templates', 'sdd');
  const templatesToUse = hasGoldenTemplates ? goldenTemplatesDir : cliTemplatesDir;

  // 3. Crear openspec/changes/<featureName>
  const featurePath = path.join(cwd, 'openspec', 'changes', sanitizedFeatureName);

  if (featureExists) {
    return { success: false, error: `El directorio de la feature ya existe: ${featurePath}` };
  }

  const intentions = [];
  intentions.push({ action: 'mkdir', dest: featurePath });

  // 4. Copiar archivos del ciclo SDD a la carpeta de la feature
  const filesToCopy = resolveFiles(injectionParams);

  for (const file of filesToCopy) {
    const srcFile = path.join(templatesToUse, file);
    const destFile = path.join(featurePath, file);
    intentions.push({ action: 'copy', src: srcFile, dest: destFile });
  }

  // 5. Retornar success y el plan
  return { success: true, path: featurePath, copiedFiles: filesToCopy, intentions, usedFallback: !hasGoldenTemplates };
}

export const featureCommand = new Command('feature')
  .description('Inicializa el scaffolding para una nueva feature SDD (openspec/changes/<nombre>)')
  .argument('<featureName>', 'Nombre de la feature (ej: auth-login)')
  .action(async (featureName) => {
    const cliTemplatesDir = path.join(__dirname, '..', 'templates', 'bootstrap', 'sdd');
    const cwd = process.cwd();

    // Inquirer 1: Tier (always asked)
    const tier = await p.select({
      message: '¿Qué tier de cambio es?',
      options: [
        { value: 'T1', label: 'T1 — Fix / Hotfix / Cambio trivial' },
        { value: 'T2', label: 'T2 — Feature / SDD ligero' },
        { value: 'T3', label: 'T3 — Feature compleja / Archivo viviente' },
      ],
    });

    if (p.isCancel(tier)) {
      p.cancel('Operación cancelada.');
      process.exit(1);
    }

    // Inquirer 2: Docs Core (only for T2/T3 — T1 never asks)
    let docsImpact = false;
    if (tier === 'T2' || tier === 'T3') {
      docsImpact = await p.confirm({
        message: '¿Este cambio afecta documentación pública?',
        initialValue: false,
      });

      if (p.isCancel(docsImpact)) {
        p.cancel('Operación cancelada.');
        process.exit(1);
      }
    }

    // Release: mandatory in T2/T3, never in T1 — no inquirer needed

    const injectionParams = { tier, docsImpact };
    
    const goldenTemplatesDir = path.join(cwd, '.agents', 'templates', 'sdd');
    const hasGoldenTemplates = fs.existsSync(goldenTemplatesDir);
    
    const sanitizedFeatureName = featureName.trim().replace(/\s+/g, '-').toLowerCase();
    const featurePath = path.join(cwd, 'openspec', 'changes', sanitizedFeatureName);
    const featureExists = fs.existsSync(featurePath);

    const result = runFeature({ featureName, cliTemplatesDir, cwd, injectionParams, hasGoldenTemplates, featureExists });

    if (!result.success) {
      console.error(`❌ Error: ${result.error}`);
      process.exit(1);
    } else {
      if (result.usedFallback) {
        console.warn(`⚠️ Warning: No se encontraron templates locales en ${goldenTemplatesDir}. Usando fallback de CLI.`);
      }
      
      const { logs } = await executeIntentions(result.intentions);
      // logs can be printed here if needed or we just print the summary
      console.log(`🚀 Scaffolding de feature creado exitosamente en: ${result.path}`);
      console.log(`📄 Archivos inyectados: ${result.copiedFiles.length} — ${result.copiedFiles.join(', ')}`);
    }
  });
