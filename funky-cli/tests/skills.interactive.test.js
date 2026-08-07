// Test permanente de la acción interactiva `funky skills` (R-SK-6).
// Deuda SUGGESTION-1 del verify report funky-skills-v2 (#318): la evidencia de
// la capa interactiva (select __all__ / p.isCancel / skill específica) se
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
  let cwd;
  let tmpDir;
  let exitSpy;
  let logSpy;

  beforeEach(() => {
    p.select.mockReset();
    p.cancel.mockReset();

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
  });

  it('Cancel: p.isCancel ⇒ exit(1) sin escribir ningún archivo', async () => {
    p.select.mockResolvedValueOnce(Symbol.for('clack:cancel'));

    await program.parseAsync(['skills'], { from: 'user' });

    expect(p.cancel).toHaveBeenCalledWith('Operación cancelada.');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(fs.existsSync(path.join(tmpDir, '.agents'))).toBe(false);
  });

  it('Skill específica: instala solo esa skill + sus docs compartidos', async () => {
    p.select.mockResolvedValueOnce('sdd-release');

    await program.parseAsync(['skills'], { from: 'user' });

    expect(fs.existsSync(path.join(tmpDir, '.agents/skills/sdd-release/SKILL.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.agents/templates/sdd/release-notes.md'))).toBe(true);
    expect(fs.existsSync(path.join(tmpDir, '.agents/skills/sdd-docs-sync/SKILL.md'))).toBe(false);
    expect(logSpy).toHaveBeenCalledWith(
      '\n✅ Skills y docs compartidos instalados. 2 archivos creados, 0 ya existian.'
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('__all__: instala todas las skills detectadas y sus recursos (R-SK-8 dinámico)', async () => {
    p.select.mockResolvedValueOnce('__all__');

    await program.parseAsync(['skills'], { from: 'user' });

    // Deriva las expectativas de la detección real + manifests: el test no debe
    // hardcodear las skills bundled (una skill nueva con SKILL.md + manifest.js
    // debe quedar cubierta sin tocar este archivo).
    const srcDir = path.join(__dirname, '..', 'src');
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
      `\n✅ Skills y docs compartidos instalados. ${expectedCreated} archivos creados, 0 ya existian.`
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
