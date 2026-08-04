// Test permanente de la acción interactiva `funky skills` (R-SK-6).
// Deuda SUGGESTION-1 del verify report funky-skills-v2 (#318): la evidencia de
// la capa interactiva (multiselect __all__ / p.isCancel / selección vacía) se
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
import { Command } from 'commander';
import * as p from '@clack/prompts';
import { skillsCommand } from '../src/commands/skills.js';

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
    p.multiselect.mockReset();
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

  const skillDests = [
    path.join('.agents/skills/sdd-release/SKILL.md'),
    path.join('.agents/skills/sdd-docs-sync/SKILL.md'),
    path.join('.agents/templates/sdd/docs-live-index.md'),
    path.join('.agents/templates/sdd/docs-index/_indice-seccional-template.md'),
    path.join('.agents/templates/sdd/release-notes.md'),
  ];

  it('Cancel: p.isCancel ⇒ exit(1) sin escribir ningún archivo', async () => {
    p.multiselect.mockResolvedValueOnce(Symbol.for('clack:cancel'));

    await program.parseAsync(['skills'], { from: 'user' });

    expect(p.cancel).toHaveBeenCalledWith('Operación cancelada.');
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(fs.existsSync(path.join(tmpDir, '.agents'))).toBe(false);
  });

  it('Selección vacía: mensaje informativo, sin exit y sin I/O', async () => {
    p.multiselect.mockResolvedValueOnce([]);

    await program.parseAsync(['skills'], { from: 'user' });

    expect(logSpy).toHaveBeenCalledWith(
      'ℹ️ No seleccionaste ninguna skill. No se realizó ningún cambio.'
    );
    expect(exitSpy).not.toHaveBeenCalled();
    expect(fs.existsSync(path.join(tmpDir, '.agents'))).toBe(false);
  });

  it('__all__: instala las 5 archivos (2 skills + 2 docs compartidos + release-notes)', async () => {
    p.multiselect.mockResolvedValueOnce(['__all__']);

    await program.parseAsync(['skills'], { from: 'user' });

    for (const dest of skillDests) {
      expect(fs.existsSync(path.join(tmpDir, dest))).toBe(true);
    }
    expect(logSpy).toHaveBeenCalledWith(
      '\n✅ Skills y docs compartidos instalados. 5 archivos creados, 0 ya existian.'
    );
    expect(exitSpy).not.toHaveBeenCalled();
  });
});
