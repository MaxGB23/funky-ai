import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import * as p from '@clack/prompts';
import { run } from '../utils/runner.js';
import { mergeSeed, isPlaceholder } from '../utils/secureYaml.js';
import {
  buildBaseline,
  compareBaseline,
  readState,
  writeState,
  stateFilePath,
  HOOK_FILES,
} from '../utils/secureSnapshot.js';
import {
  ensureAgentsBlock,
  pinPackageManager,
  parseConfigList,
  isQuarantineActive,
  diagnose,
  evaluate,
  floatingRanges,
  AGENTS_MARKER,
} from '../utils/secureDomain.js';

const VALID_POSTURES = ['fail-silent', 'fail-fast'];

const isTTY = () => Boolean(process.stdin && process.stdin.isTTY);

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * R6 — `funky secure doctor`: diagnostica el estado de hardening sin escribir
 * NADA (ni en la máquina ni en el repo). Exit 0 si el diagnóstico completa.
 */
async function runDoctor() {
  const cwd = process.cwd();

  const version = run('pnpm', ['--version']);
  const cfgProbe = run('pnpm', ['config', 'list', '--json']);
  const whereProbe = run('where', ['pnpm']);
  const effectiveConfig = parseConfigList(cfgProbe.stdout);
  const quarantineActive = isQuarantineActive(effectiveConfig, process.env);

  const wherePaths =
    whereProbe.code === 0
      ? whereProbe.stdout.split('\n').map((s) => s.trim()).filter(Boolean)
      : [];

  const pkgJson = readJsonSafe(path.join(cwd, 'package.json'));
  const git = run('git', ['ls-files', '--', '.env', '.env.*']);
  const envTracked =
    git.code === 0 ? git.stdout.split('\n').map((s) => s.trim()).filter(Boolean) : [];

  const state = readState(stateFilePath(cwd));
  const agentsRaw = fs.existsSync(path.join(cwd, 'AGENTS.md'))
    ? fs.readFileSync(path.join(cwd, 'AGENTS.md'), 'utf8')
    : '';

  const findings = diagnose({
    activeVersion: version.code === 0 ? version.stdout.trim() : 'no disponible',
    duplicates: wherePaths,
    effectiveConfig,
    quarantineActive,
    repoSignals: {
      packageLock: fs.existsSync(path.join(cwd, 'package-lock.json')),
      floatingRanges: floatingRanges(pkgJson).length > 0,
      envTracked,
      hooksSeeded: Boolean(state),
      hooksDrift: state ? compareBaseline(state, cwd) : [],
      agentsMarked: agentsRaw.includes(AGENTS_MARKER),
      placeholder: Boolean(effectiveConfig) && isPlaceholder(effectiveConfig.allowBuilds),
    },
  });

  for (const f of findings) {
    if (f.severity === 'warning') console.warn(`⚠️ ${f.text}`);
    else console.log(`ℹ️ ${f.text}`);
  }
  console.log('ℹ️ Diagnóstico completo. `funky secure init` aplica la política.');
  process.exit(0);
}

/**
 * R7/R8/R9 — `funky secure init`: aplica la política pnpm (idempotente).
 * Postura: TTY → p.select sin default; no-TTY → --posture obligatorio.
 */
async function runInit(options) {
  const cwd = process.cwd();
  const interactive = isTTY();
  let posture = options.posture;

  if (!posture) {
    if (!interactive) {
      console.error('❌ Sin TTY, --posture es obligatorio: fail-silent | fail-fast.');
      process.exit(1);
      return; // los tests mockean exit: sin return el flujo seguiría a clack
    }
    const selected = await p.select({
      message: 'Postura de hardening de pnpm:',
      options: [
        { value: 'fail-silent', label: 'fail-silent — endurece en silencio (ignoreScripts: true)' },
        { value: 'fail-fast', label: 'fail-fast — builds estrictos + listas de aprobación (RFC)' },
      ],
    });
    if (p.isCancel(selected)) {
      p.cancel('Operación cancelada.');
      process.exit(1);
      return;
    }
    posture = selected;
  }

  if (!VALID_POSTURES.includes(posture)) {
    console.error(`❌ Postura inválida: "${posture}". Válidas: ${VALID_POSTURES.join(' | ')}.`);
    process.exit(1);
    return;
  }

  const applied = [];
  const skipped = [];
  const conflicted = [];
  const pending = [];

  // 1. pnpm-workspace.yaml — merge idempotente (R2/R3).
  const wsPath = path.join(cwd, 'pnpm-workspace.yaml');
  try {
    const merged = mergeSeed(wsPath, posture);
    fs.writeFileSync(wsPath, merged.content, 'utf8');
    applied.push(...merged.added.map((k) => `${k} (workspace)`));
    skipped.push(...merged.kept.map((k) => `${k} (ya ok)`));
    conflicted.push(...merged.conflicted.map((k) => `${k} (conservada)`));
    pending.push(...merged.pending.map((k) => `${k} (aprobación pendiente)`));
  } catch (err) {
    console.error(`❌ ${err.message}`);
    process.exit(1);
    return;
  }

  // 2. AGENTS.md — inyección conservadora (R8).
  const agentsPath = path.join(cwd, 'AGENTS.md');
  const agentsRaw = fs.existsSync(agentsPath) ? fs.readFileSync(agentsPath, 'utf8') : null;
  let agentsSkipped = false;
  if (agentsRaw && agentsRaw.includes(AGENTS_MARKER)) {
    skipped.push('AGENTS.md (marcador presente)');
    agentsSkipped = true;
  } else if (agentsRaw) {
    if (interactive) {
      const ok = await p.confirm({
        message: 'AGENTS.md no tiene el bloque de package manager. ¿Agregar la política pnpm?',
        initialValue: true,
      });
      if (p.isCancel(ok)) {
        p.cancel('Operación cancelada.');
        process.exit(1);
        return;
      }
      if (!ok) {
        skipped.push('AGENTS.md (rechazado)');
        agentsSkipped = true;
      }
    } else {
      console.warn('⚠️ AGENTS.md sin marcador funky-secure: se agrega el bloque (no interactivo).');
    }
  }
  if (!agentsSkipped) {
    const out = ensureAgentsBlock(agentsRaw);
    if (out.changed) {
      fs.writeFileSync(agentsPath, out.content, 'utf8');
      applied.push(agentsRaw ? 'AGENTS.md (bloque agregado)' : 'AGENTS.md (creado)');
    }
  }

  // 3. Baseline de hooks + state file (R4/R5). `posture` viaja en el state:
  // check la necesita para validar las claves correctas (extensión de diseño).
  writeState({ ...buildBaseline(HOOK_FILES, cwd), posture }, stateFilePath(cwd));
  applied.push(`baseline de hooks (${HOOK_FILES.length} archivos)`);

  // 4. .gitignore — .funky/ (R5). Append-only: nunca se reescribe el archivo.
  const giPath = path.join(cwd, '.gitignore');
  const gi = fs.existsSync(giPath) ? fs.readFileSync(giPath, 'utf8') : '';
  if (/(^|\n)\s*\.funky\/?\s*(\n|$)/.test(gi)) {
    skipped.push('.gitignore (.funky/ ya ignorado)');
  } else {
    fs.appendFileSync(giPath, `${gi && !gi.endsWith('\n') ? '\n' : ''}.funky/\n`);
    applied.push('.gitignore (.funky/ agregado)');
  }

  // 5. Pin de packageManager (R9).
  const pkgPath = path.join(cwd, 'package.json');
  const pkgJson = readJsonSafe(pkgPath);
  if (pkgJson) {
    const vProbe = run('pnpm', ['--version']);
    if (vProbe.code === 0) {
      const active = vProbe.stdout.trim();
      const pin = pinPackageManager(pkgJson, active);
      if (pin.conflicted) {
        conflicted.push(`packageManager (conservado: ${pkgJson.packageManager})`);
      } else if (pin.changed) {
        fs.writeFileSync(pkgPath, pin.content, 'utf8');
        applied.push(`packageManager (pnpm@${active})`);
      } else {
        skipped.push(`packageManager (ya pnpm@${active})`);
      }
    }
  }

  // 6. Warning RFC de fail-fast (R3).
  if (posture === 'fail-fast') {
    console.warn('⚠️ RFC: fail-fast exige mantener onlyBuiltDependencies/ignoredBuiltDependencies al día (builds aprobados) y deja un hueco para scripts de la raíz del repo.');
  }

  // 7. Resumen (R9: applied/skipped/conflicted).
  console.log(`✅ Repo endurecido (postura ${posture}).`);
  if (applied.length) console.log(`  Aplicado: ${applied.join(', ')}`);
  if (skipped.length) console.log(`  Sin cambios: ${skipped.join(', ')}`);
  if (conflicted.length) console.warn(`  Conservado (distinto): ${conflicted.join(', ')}`);
  if (pending.length) console.warn(`  Pendiente: ${pending.join(', ')} — revisa pnpm-workspace.yaml`);
  process.exit(0);
}

/**
 * R10/R11 — `funky secure check`: valida la conformidad (exit 0/1, CI-ready).
 * Fail-closed: probe pnpm no disponible → exit 1. Repos npm/yarn → WARN exit 0.
 */
async function runCheck(options) {
  const cwd = process.cwd();

  const hasPnpmWorkspace = fs.existsSync(path.join(cwd, 'pnpm-workspace.yaml'));
  const hasPnpmLockfile = fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'));
  const hasPackageLock = fs.existsSync(path.join(cwd, 'package-lock.json'));
  const hasYarnLock = fs.existsSync(path.join(cwd, 'yarn.lock'));
  const pkgJson = readJsonSafe(path.join(cwd, 'package.json'));

  const violations = [];
  const cfgProbe = run('pnpm', ['config', 'list', '--json']);
  const effectiveConfig = parseConfigList(cfgProbe.stdout);
  if (cfgProbe.code !== 0) {
    violations.push({
      code: 'pnpm-probe',
      detail: `pnpm no disponible (fail-closed): ${cfgProbe.stderr}`.trim(),
    });
  }
  const quarantineActive = isQuarantineActive(effectiveConfig, process.env);

  let trackedEnvFiles = [];
  if (hasPnpmWorkspace) {
    const git = run('git', ['ls-files', '--', '.env', '.env.*']);
    if (git.code !== 0) {
      violations.push({ code: 'git-probe', detail: `git no disponible en ${cwd}: ${git.stderr}`.trim() });
    } else {
      trackedEnvFiles = git.stdout.split('\n').map((s) => s.trim()).filter(Boolean);
    }
  }

  const envPresent = fs.existsSync(path.join(cwd, '.env'));
  const gi = fs.existsSync(path.join(cwd, '.gitignore'))
    ? fs.readFileSync(path.join(cwd, '.gitignore'), 'utf8')
    : '';
  const envUnignored = envPresent && !/(^|\n)\s*\.env(\*|\.|\s|$)/.test(gi);

  const statePath = stateFilePath(cwd);
  const state = readState(statePath);
  let hooksDrift = [];
  if (options.rebaseline) {
    // Rebaseline explícito: re-seedea (también cuando no hay state previo) y
    // revalida contra el baseline fresco (R5).
    const fresh = { ...buildBaseline(HOOK_FILES, cwd), posture: state?.posture ?? 'fail-silent' };
    writeState(fresh, statePath);
    hooksDrift = compareBaseline(fresh, cwd);
  } else if (state) {
    hooksDrift = compareBaseline(state, cwd);
  }

  const verdict = evaluate({
    hasPnpmWorkspace,
    hasPnpmLockfile,
    hasPackageLock,
    hasYarnLock,
    pkgJson,
    effectiveConfig,
    quarantineActive,
    trackedEnvFiles,
    envUnignored,
    hooksDrift,
    posture: state?.posture ?? 'fail-silent',
  });
  const all = [...violations, ...verdict.violations];

  if (verdict.warnOnly) {
    console.warn('⚠️ Repo npm/yarn (sin pnpm-workspace.yaml): solo se informa, no se bloquea (R10).');
    process.exit(0);
    return;
  }

  if (all.length === 0) {
    console.log('✅ El repo conforma la política pnpm segura.');
    process.exit(0);
    return;
  }

  console.log('❌ Violaciones:');
  for (const v of all) {
    console.log(`  - ${v.code}: ${v.detail}`);
  }
  process.exit(1);
}

export const secureCommand = new Command('secure')
  .description('Endurece el manejo de dependencias del repo (pnpm seguro): doctor, init, check')
  .addCommand(
    new Command('doctor')
      .description('Diagnostica el estado de hardening del repo (no escribe nada)')
      .action(runDoctor)
  )
  .addCommand(
    new Command('init')
      .description('Aplica la política pnpm: seed de pnpm-workspace.yaml, AGENTS.md, baseline de hooks, pin de packageManager (idempotente)')
      .option('--posture <posture>', 'Postura de hardening: fail-silent | fail-fast (obligatoria sin TTY)')
      .action(runInit)
  )
  .addCommand(
    new Command('check')
      .description('Valida que el repo conforme la política (exit 0/1, CI-ready)')
      .option('--rebaseline', 'Re-seedea el baseline de hooks y revalida')
      .action(runCheck)
  );
