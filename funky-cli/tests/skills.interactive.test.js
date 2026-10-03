// Test permanente de la acción interactiva `funky skills` (R-SK-6).
// Deuda SUGGESTION-1 del verify report funky-skills-v2 (#318): la evidencia de
// la capa interactiva (multiselect / p.isCancel / selección parcial) se
// produjo con un harness transitorio vi.mock('@clack/prompts') que fue borrado
// tras la verificación. Aquí queda commiteado: la única pieza con I/O real de
// prompts del CLI queda protegida contra regresiones silenciosas.
//
// Nota de invocación: se dispatchea vía un programa padre (`addCommand`) como
// hace el CLI real (bin/funky.js). Parsear el subcomando directamente con
// operands (p. ej. parse(['node','skills'], {from:'user'})) dispara en
// commander 15 el error `excess arguments` (desde v15 `from:'user'` ya no
// recorta argv y `_allowExcessArguments` por defecto es false) — artefacto que
// el repo tolera en otros tests pero que no aporta nada aquí.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import { Command } from 'commander';
import * as p from '@clack/prompts';
import { skillsCommand, discoverSkills } from '../src/commands/skills.js';

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  cancel: vi.fn(),
  note: vi.fn(),
  log: {
    message: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  },
  multiselect: vi.fn(),
  select: vi.fn(),
  text: vi.fn(),
  confirm: vi.fn(),
  group: vi.fn(),
  password: vi.fn(),
  spinner: vi.fn(() => ({ start: vi.fn(), stop: vi.fn(), message: vi.fn() })),
  // Contrato real de clack: cancel devuelve el símbolo global `clack:cancel`.
  isCancel: (value) => value === Symbol.for('clack:cancel'),
}));

const program = new Command('funky');
program.addCommand(skillsCommand);

describe('skillsCommand — acción interactiva (R-SK-6)', () => {
  // El prompt exige terminal: `funky skills` sin TTY y sin flags falla con código 1.
  // Estos tests ejercitan el camino interactivo, así que declaran TTY explícitamente.
  const ttyDescriptor = Object.getOwnPropertyDescriptor(process, 'stdin');
  let cwd;
  let tmpDir;
  let exitSpy;
  let logSpy;

  beforeEach(() => {
    p.multiselect.mockReset();
    p.note.mockReset();
    p.confirm.mockReset();
    p.cancel.mockReset();

    Object.defineProperty(process, 'stdin', { value: { isTTY: true }, configurable: true });
    cwd = process.cwd();
    const harnessRoot = path.resolve(cwd, '..', '.tmp');
    fs.mkdirSync(harnessRoot, { recursive: true });
    tmpDir = fs.mkdtempSync(path.join(harnessRoot, 'skills-interactive-'));
    process.chdir(tmpDir);

    // process.exit(1) real mataría el runner de vitest; se captura para asertar.
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    exitSpy.mockRestore();
    logSpy.mockRestore();
    if (ttyDescriptor) {
      Object.defineProperty(process, 'stdin', ttyDescriptor);
    } else {
      delete process.stdin;
    }
  });

  it('Cancel: p.isCancel ⇒ exit(1) sin escribir ningún archivo', async () => {
    p.multiselect.mockResolvedValueOnce(Symbol.for('clack:cancel'));

    await program.parseAsync(['skills'], { from: 'user' });

    // Camino de cancelación: se muestra el aviso (outcome), exit 1, cero escrituras.
    expect(p.cancel).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(fs.existsSync(path.join(tmpDir, '.agents'))).toBe(false);
  });

  it('Skill específica: instala solo esa skill + sus docs compartidos', async () => {
    p.multiselect.mockResolvedValueOnce(['sdd-release']);

    await program.parseAsync(['skills'], { from: 'user' });

    expect(fs.existsSync(path.join(tmpDir, '.agents/skills/sdd-release/SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.agents/templates/sdd/release-notes.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.agents/skills/sdd-docs-sync/SKILL.md'))).toBe(false);
    // La instalación se prueba por outcomes de archivos (arriba) y por el aviso
    // de éxito emitido (el mensaje exacto con conteo se cubre dinámicamente en
    // el test de todas; el literal no se copia aquí).
    expect(logSpy).toHaveBeenCalled();
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('Todas: marcar «Todas» instala todas las skills detectadas (R-SK-8 dinámico)', async () => {
    const srcDir = path.join(__dirname, '..', 'src');
    // «Todas» como única elección significa "todo".
    p.multiselect.mockResolvedValueOnce(['__all__']);

    await program.parseAsync(['skills'], { from: 'user' });

    // Deriva las expectativas de la detección real + manifests: el test no debe
    // hardcodear las skills bundled (una skill nueva con SKILL.md + manifest.js
    // debe quedar cubierta sin tocar este archivo).
    const available = discoverSkills(srcDir);
    expect(available.length).toBeGreaterThanOrEqual(2);

    let expectedCreated = 0;
    for (const name of available) {
      const mod = await import(pathToFileURL(path.join(srcDir, 'skills', name, 'manifest.js')).href);
      for (const item of mod.default) {
        expectedCreated++;
        expect(fs.existsSync(path.join(tmpDir, item.dest))).toBe(true);
      }
    }
    expect(logSpy).toHaveBeenCalledWith(
      `\n✅ Skills y docs compartidos instalados. ${expectedCreated} archivos creados, 0 ya existían.`
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('Subconjunto: instala exactamente las skills elegidas y ninguna más', async () => {
    const srcDir = path.join(__dirname, '..', 'src');
    const available = discoverSkills(srcDir);
    // Sin al menos una skill sin elegir, "ninguna más" no sería observable.
    expect(available.length).toBeGreaterThanOrEqual(3);

    const chosen = available.slice(0, 2);
    const rejected = available.slice(2);
    p.multiselect.mockResolvedValueOnce(chosen);

    await program.parseAsync(['skills'], { from: 'user' });

    for (const name of chosen) {
      expect(fs.existsSync(path.join(tmpDir, '.agents/skills', name, 'SKILL.md'))).toBe(true);
    }
    for (const name of rejected) {
      expect(fs.existsSync(path.join(tmpDir, '.agents/skills', name, 'SKILL.md'))).toBe(false);
    }
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('El prompt no preselecciona nada: el default es no instalar', async () => {
    const srcDir = path.join(__dirname, '..', 'src');
    const available = discoverSkills(srcDir);
    p.multiselect.mockResolvedValueOnce(['__all__']);

    await program.parseAsync(['skills'], { from: 'user' });

    const opts = p.multiselect.mock.calls[0][0];
    // Abrir con todo marcado convertía un Enter a ciegas en "instala las 4 skills":
    // el fallo iba hacia instalar de más. Sin initialValues, no hay nada preseleccionado.
    expect(opts.initialValues).toBeUndefined();
    // «Todas» es una opción más, y va primero para que sea el atajo a "todo".
    expect(opts.options[0].value).toBe('__all__');
    expect(opts.options.slice(1).map((o) => o.value)).toEqual(available);
  });

  it('Cada skip dice qué skill es, no solo el nombre del archivo', async () => {
    const srcDir = path.join(__dirname, '..', 'src');
    const available = discoverSkills(srcDir);
    expect(available.length).toBeGreaterThanOrEqual(2);

    // Pre-crea el SKILL.md de cada skill: todo se omite y los logs no pueden repetirse
    // como "SKILL.md" sin contexto. El manifest dest usa siempre "/", también en win32.
    for (const name of available) {
      const file = path.join(tmpDir, '.agents', 'skills', name, 'SKILL.md');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, 'pre-existente', 'utf8');
    }

    p.multiselect.mockResolvedValueOnce(['__all__']);

    await program.parseAsync(['skills'], { from: 'user' });

    const lines = logSpy.mock.calls.map((args) => String(args[0]));
    const skips = lines.filter((line) => /Omitiendo/.test(line));
    expect(skips).toHaveLength(available.length);
    for (const name of available) {
      const expected = `.agents/skills/${name}/SKILL.md`;
      expect(skips.some((line) => line.includes(expected))).toBe(true);
    }
  });

  it('Precedencia: si marcas skills concretas, «Todas» no las sobrescribe', async () => {
    const srcDir = path.join(__dirname, '..', 'src');
    const available = discoverSkills(srcDir);
    expect(available.length).toBeGreaterThanOrEqual(3);

    const chosen = available.slice(0, 2);
    // «Todas» marcada junto a 2 skills concretas y el resto sin marcar: las
    // explícitas ganan. Sin esta regla, desmarcar una skill no excluiría nada.
    p.multiselect.mockResolvedValueOnce(['__all__', ...chosen]);

    await program.parseAsync(['skills'], { from: 'user' });

    for (const name of chosen) {
      expect(fs.existsSync(path.join(tmpDir, '.agents/skills', name, 'SKILL.md'))).toBe(true);
    }
    for (const name of available.slice(2)) {
      expect(fs.existsSync(path.join(tmpDir, '.agents/skills', name, 'SKILL.md'))).toBe(false);
    }
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('Confirmación vacía: aborta sin instalar nada en vez de colarse en silencio', async () => {
    // El prompt bloquea esto (required en default); el comando lo defiende igual,
    // porque runSkills con [] instalaría cero archivos sin avisar.
    p.multiselect.mockResolvedValueOnce([]);

    await program.parseAsync(['skills'], { from: 'user' });

    expect(p.cancel).toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(fs.existsSync(path.join(tmpDir, '.agents'))).toBe(false);
  });

  it('La confirmación vacía no puede ocurrir: el prompt no desactiva required', async () => {
    const srcDir = path.join(__dirname, '..', 'src');
    p.multiselect.mockResolvedValueOnce(discoverSkills(srcDir));

    await program.parseAsync(['skills'], { from: 'user' });

    // `required` en su default (true) hace que el prompt bloquee la submisión
    // vacía en vez de devolver [] en silencio — la causa raíz del revert
    // v4.2.0 -> v4.3.2. Pasarlo en false reintroduce ese bug; esta aserción lo
    // fija para que no vuelva por descuido.
    expect(p.multiselect.mock.calls[0][0].required).toBeUndefined();
  });
});

describe('skillsCommand — conflictos por skill (reemplazo y faltantes)', () => {
  // Patrón de TTY taken de init.test.js:211 / assess.integration.test.js:73 — vitest
  // no tiene TTY, así que el prompt de reemplazo hay que habilitarlo explícitamente y
  // restaurar process.stdin después para no filtrar el cambio a otros archivos.
  const ttyDescriptor = Object.getOwnPropertyDescriptor(process, 'stdin');
  const setTTY = (value) => {
    Object.defineProperty(process, 'stdin', { value: { isTTY: value }, configurable: true });
  };

  let cwd;
  let tmpDir;
  let exitSpy;
  let logSpy;
  let warnSpy;

  beforeEach(() => {
    p.multiselect.mockReset();
    p.note.mockReset();
    p.confirm.mockReset();
    p.cancel.mockReset();

    cwd = process.cwd();
    const harnessRoot = path.resolve(cwd, '..', '.tmp');
    fs.mkdirSync(harnessRoot, { recursive: true });
    tmpDir = fs.mkdtempSync(path.join(harnessRoot, 'skills-conflict-'));
    process.chdir(tmpDir);
    setTTY(true);

    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(cwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    exitSpy.mockRestore();
    logSpy.mockRestore();
    warnSpy.mockRestore();
    if (ttyDescriptor) {
      Object.defineProperty(process, 'stdin', ttyDescriptor);
    } else {
      delete process.stdin;
    }
  });

  it('Skill existente: pregunta UNA vez por skill y por defecto conserva lo actual', async () => {
    const local = 'version local que no se debe perder';
    const file = path.join(tmpDir, '.agents', 'skills', 'layout-debug', 'SKILL.md');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, local, 'utf8');

    p.multiselect.mockResolvedValueOnce(['layout-debug']);
    p.confirm.mockResolvedValueOnce(false);

    await program.parseAsync(['skills'], { from: 'user' });

    // Un prompt por SKILL, no uno por archivo: es la unidad de decisión.
    expect(p.confirm).toHaveBeenCalledTimes(1);
    // El aviso nombra el archivo afectado, no solo "SKILL.md".
    const detail = String(p.note.mock.calls[0][0]);
    expect(detail).toContain(`.agents/skills/layout-debug/SKILL.md`);
    expect(fs.readFileSync(file, 'utf8')).toBe(local);
  });

  it('Skill existente: confirmar "Sí" reemplaza con la versión nueva', async () => {
    const file = path.join(tmpDir, '.agents', 'skills', 'layout-debug', 'SKILL.md');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'version local', 'utf8');

    p.multiselect.mockResolvedValueOnce(['layout-debug']);
    p.confirm.mockResolvedValueOnce(true);

    await program.parseAsync(['skills'], { from: 'user' });

    expect(p.confirm).toHaveBeenCalledTimes(1);
    const installed = fs.readFileSync(file, 'utf8');
    expect(installed).not.toBe('version local');
    const src = await fs.promises.readFile(
      path.join(__dirname, '..', 'src', 'skills', 'layout-debug', 'SKILL.md'),
      'utf8'
    );
    expect(installed).toBe(src);
  });

  it('Skill a medias: avisa qué archivos faltan y los instala de todas formas', async () => {
    // El caso que pediste: la skill está pero le falta su doc compartido. El prompt
    // debe listar el faltante, y aun conservando el SKILL.md actual el faltante se crea
    // (no es conflicto: no hay nada que sobrescribir).
    const existing = path.join(tmpDir, '.agents', 'skills', 'sdd-release', 'SKILL.md');
    fs.mkdirSync(path.dirname(existing), { recursive: true });
    fs.writeFileSync(existing, 'version local', 'utf8');
    const missing = path.join(tmpDir, '.agents', 'templates', 'sdd', 'release-notes.md');

    p.multiselect.mockResolvedValueOnce(['sdd-release']);
    p.confirm.mockResolvedValueOnce(false);

    await program.parseAsync(['skills'], { from: 'user' });

    const detail = String(p.note.mock.calls[0][0]);
    expect(detail).toContain(`.agents/skills/sdd-release/SKILL.md`);
    expect(detail).toContain(`.agents/templates/sdd/release-notes.md`);
    expect(fs.existsSync(missing)).toBe(true);
    expect(fs.readFileSync(existing, 'utf8')).toBe('version local');
  });

  it('Skill existente: preguntar cancelado conserva todo lo actual', async () => {
    const file = path.join(tmpDir, '.agents', 'skills', 'layout-debug', 'SKILL.md');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'version local', 'utf8');

    p.multiselect.mockResolvedValueOnce(['layout-debug']);
    p.confirm.mockResolvedValueOnce(Symbol.for('clack:cancel'));

    await program.parseAsync(['skills'], { from: 'user' });

    // Cancelar en el prompt de reemplazo NO cancela la instalación: equivale a "no",
    // igual que hace init.js con su confirmación. Conservar es siempre la salida segura.
    expect(fs.readFileSync(file, 'utf8')).toBe('version local');
  });

  it('Sin TTY pero con --all: instala lo que falta y falla por el conflicto', async () => {
    // Con flags no se pregunta nunca: se instala lo seguro y se reporta el conflicto
    // como error. Un agente no puede contestar un prompt, así que preguntar sería
    // colgarse.
    const file = path.join(tmpDir, '.agents', 'skills', 'layout-debug', 'SKILL.md');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'version local', 'utf8');
    setTTY(false);

    p.multiselect.mockResolvedValueOnce(['__all__']);

    // El exitSpy de este describe no lanza (a diferencia del de integration), así que
    // se awaita normal y se verifica la llamada.
    await program.parseAsync(['skills', '--all'], { from: 'user' });

    expect(p.confirm).not.toHaveBeenCalled();
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(fs.readFileSync(file, 'utf8')).toBe('version local');
    // Y lo que no estaba en conflicto sí se instaló: el error no bloquea la instalación.
    expect(fs.existsSync(path.join(tmpDir, '.agents/skills/layout-debug-canon/SKILL.md'))).toBe(true);
  });

  it('--force con TTY reemplaza sin preguntar, para el reinstall limpio', async () => {
    const file = path.join(tmpDir, '.agents', 'skills', 'layout-debug', 'SKILL.md');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, 'version local', 'utf8');

    p.multiselect.mockResolvedValueOnce(['layout-debug']);

    await program.parseAsync(['skills', '--force'], { from: 'user' });

    // Se pregunta qué instalar, pero no si reemplazar: --force autoriza eso.
    expect(p.confirm).not.toHaveBeenCalled();
    expect(fs.readFileSync(file, 'utf8')).not.toBe('version local');
  });

  it('Una skill recién detectada no genera aviso ni pregunta: no hay conflicto', async () => {
    p.multiselect.mockResolvedValueOnce(['layout-debug-canon']);

    await program.parseAsync(['skills'], { from: 'user' });

    expect(p.confirm).not.toHaveBeenCalled();
    expect(p.note).not.toHaveBeenCalled();
    expect(fs.existsSync(path.join(tmpDir, '.agents/skills/layout-debug-canon/SKILL.md'))).toBe(true);
  });
});
