import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { Command } from 'commander';
import { runSkills, skillsCommand, discoverSkills } from '../src/commands/skills.js';
import { executeIntentions } from '../src/utils/fs-adapter.js';
import releaseManifest from '../src/skills/release/manifest.js';
import docsSyncManifest from '../src/skills/docs-sync/manifest.js';

const MANIFESTS = [docsSyncManifest, releaseManifest];

describe('runSkills() Integration', () => {
  const srcDir = path.join(process.cwd(), 'src');
  const harnessRoot = path.resolve(process.cwd(), '..', '.tmp');
  const tmpDir = path.join(harnessRoot, 'skills-integration');

  beforeAll(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  const skillDests = [
    path.join(tmpDir, '.agents/skills/release/SKILL.md'),
    path.join(tmpDir, '.agents/skills/docs-sync/SKILL.md'),
    path.join(tmpDir, '.agents/templates/sdd/docs-live-index.md'),
    path.join(tmpDir, '.agents/templates/sdd/docs-index/_indice-seccional-template.md'),
    path.join(tmpDir, '.agents/templates/sdd/release-notes.md'),
  ];

  it('1ª ejecución: crea los 5 archivos (2 skills + 2 docs compartidos + release-notes)', async () => {
    const intentions = runSkills({ srcDir, targetBase: tmpDir, manifests: MANIFESTS });
    const result = await executeIntentions(intentions);

    expect(result.created).toBe(5);
    expect(result.skipped).toBe(0);

    for (const dest of skillDests) {
      expect(fs.existsSync(dest)).toBe(true);
    }
  });

  it('2ª ejecución: salteados y no sobrescribe custom rules (R-SK-3)', async () => {
    const customPath = path.join(tmpDir, '.agents/skills/release/SKILL.md');
    const custom = '# Custom rules del proyecto\n';
    fs.writeFileSync(customPath, custom, 'utf8');

    const intentions = runSkills({ srcDir, targetBase: tmpDir, manifests: MANIFESTS });
    const result = await executeIntentions(intentions);

    expect(result.created).toBe(0);
    expect(result.skipped).toBe(5);
    expect(fs.readFileSync(customPath, 'utf8')).toBe(custom);
  });

  it('estado parcial: skill faltante se crea, el resto se salta (R-SK-3 edge)', async () => {
    const missingPath = path.join(tmpDir, '.agents/skills/docs-sync/SKILL.md');
    fs.rmSync(missingPath, { recursive: true, force: true });

    const intentions = runSkills({ srcDir, targetBase: tmpDir, manifests: MANIFESTS });
    const result = await executeIntentions(intentions);

    expect(result.created).toBe(1);
    expect(result.skipped).toBe(4);
    expect(fs.existsSync(missingPath)).toBe(true);
  });

  it('docs fresh: docs-live-index.md bytes == template distribuido (R-SK-4)', () => {
    const livePath = path.join(tmpDir, '.agents/templates/sdd/docs-live-index.md');
    const templatePath = path.join(srcDir, 'templates/bootstrap/sdd/docs-live-index.md');

    const actual = fs.readFileSync(livePath, 'utf8');
    const template = fs.readFileSync(templatePath, 'utf8');

    expect(actual).toBe(template);
    expect(actual).toContain('<ruta-del-doc>');
  });

  it('docs fresh: índice seccional bytes == template distribuido por scaffold (R-SK-5)', () => {
    const livePath = path.join(tmpDir, '.agents/templates/sdd/docs-index/_indice-seccional-template.md');
    const templatePath = path.join(srcDir, 'templates/bootstrap/sdd/docs-index/_indice-seccional-template.md');

    const actual = fs.readFileSync(livePath, 'utf8');
    const template = fs.readFileSync(templatePath, 'utf8');

    expect(actual).toBe(template);
    expect(actual).toMatch(/Índice de Secciones/);
  });

  it('R-SK-9: 0 referencias al nombre viejo del índice seccional en src/ y tests/', () => {
    const roots = [path.join(process.cwd(), 'src'), path.join(process.cwd(), 'tests')];
    const hits = [];
    const oldIndexName = 'docs-index/' + 'template.md';
    const walk = (dir) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.isFile() && /\.(js|md)$/.test(entry.name)) {
          const content = fs.readFileSync(full, 'utf8');
          if (content.includes(oldIndexName)) hits.push(full);
        }
      }
    };
    for (const root of roots) walk(root);
    expect(hits).toEqual([]);
  });
});

describe('funky skills — modo no interactivo (flags)', () => {
  const srcDir = path.join(process.cwd(), 'src');
  const program = new Command('funky');
  program.addCommand(skillsCommand);

  // Mismo patrón de TTY que skills.interactive.test.js / init.test.js: vitest no
  // tiene terminal, así que hay que fijarla explícitamente y restaurarla después.
  const ttyDescriptor = Object.getOwnPropertyDescriptor(process, 'stdin');
  const setTTY = (value) => {
    Object.defineProperty(process, 'stdin', { value: { isTTY: value }, configurable: true });
  };

  let repoCwd;
  let tmpDir;
  let exitSpy;
  let errorSpy;
  let warnSpy;
  let logSpy;

  beforeEach(() => {
    repoCwd = process.cwd();
    const harnessRoot = path.resolve(repoCwd, '..', '.tmp');
    fs.mkdirSync(harnessRoot, { recursive: true });
    tmpDir = fs.mkdtempSync(path.join(harnessRoot, 'skills-flags-'));
    process.chdir(tmpDir);

    // exitSpy lanza para replicar la terminación real (patrón init.test.js:229).
    exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('exit');
    });
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    process.chdir(repoCwd);
    fs.rmSync(tmpDir, { recursive: true, force: true });
    exitSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    vi.restoreAllMocks();
    if (ttyDescriptor) {
      Object.defineProperty(process, 'stdin', ttyDescriptor);
    } else {
      delete process.stdin;
    }
  });

  const available = () => discoverSkills(srcDir);
  const errors = () => errorSpy.mock.calls.map((c) => String(c[0]));
  const warnings = () => warnSpy.mock.calls.map((c) => String(c[0])).join('\n');
  const skillDir = (name) => path.join(tmpDir, '.agents', 'skills', name, 'SKILL.md');
  const seedConflict = (name, content = 'version local') => {
    const file = skillDir(name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, 'utf8');
    return file;
  };
  // Copia el contenido REAL de la skill: mismo bytes = no hay nada que sobrescribir.
  const seedUpToDate = (name) => {
    const file = skillDir(name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.copyFileSync(path.join(srcDir, 'skills', name, 'SKILL.md'), file);
    return file;
  };

  it('--all instala todas las skills detectadas sin preguntar', async () => {
    setTTY(false);

    await program.parseAsync(['skills', '--all'], { from: 'user' });

    for (const name of available()) {
      expect(fs.existsSync(skillDir(name))).toBe(true);
    }
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('--skill instala solo la indicada; repetible para varias', async () => {
    setTTY(false);
    const [first, second] = available();
    const third = available()[2];
    expect(third).toBeDefined();

    await program.parseAsync(['skills', '-s', first, '-s', second], { from: 'user' });

    expect(fs.existsSync(skillDir(first))).toBe(true);
    expect(fs.existsSync(skillDir(second))).toBe(true);
    expect(fs.existsSync(skillDir(third))).toBe(false);
  });

  it('--skill desconocida falla con código 1 y lista las disponibles', async () => {
    setTTY(false);

    await expect(
      program.parseAsync(['skills', '-s', 'no-existe-esta'], { from: 'user' })
    ).rejects.toThrow('exit');

    // El mensaje debe permitir reintentar sin preguntar nada: lista el catálogo.
    const message = errors().join('\n');
    for (const name of available()) {
      expect(message).toContain(name);
    }
    expect(exitSpy).toHaveBeenCalledWith(1);
    // Nada instalado: el fallo no es un éxito parcial.
    expect(fs.existsSync(path.join(tmpDir, '.agents'))).toBe(false);
  });

  it('--all y --skill juntos se rechazan, sin elegir uno en silencio', async () => {
    setTTY(false);

    await expect(
      program.parseAsync(['skills', '--all', '-s', available()[0]], { from: 'user' })
    ).rejects.toThrow('exit');

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(fs.existsSync(path.join(tmpDir, '.agents'))).toBe(false);
  });

  it('sin TTY y sin flags falla con código 1 en vez de no-op silencioso', async () => {
    setTTY(false);

    await expect(program.parseAsync(['skills'], { from: 'user' })).rejects.toThrow('exit');

    // El mensaje dice cómo resolverlo, no solo que falta algo.
    const message = errors().join('\n');
    expect(message).toMatch(/--all/);
    expect(message).toMatch(/--skill/);
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(fs.existsSync(path.join(tmpDir, '.agents'))).toBe(false);
  });

  it('--force sin TTY reemplaza lo existente sin preguntar', async () => {
    setTTY(false);
    const [first] = available();
    const file = seedConflict(first);

    await program.parseAsync(['skills', '--all', '--force'], { from: 'user' });

    expect(fs.readFileSync(file, 'utf8')).not.toBe('version local');
    expect(exitSpy).not.toHaveBeenCalled();
  });

  it('--force declara qué reemplaza: lo destructivo tiene que ser visible', async () => {
    setTTY(false);
    const [first] = available();
    seedConflict(first);

    await program.parseAsync(['skills', '--all', '--force'], { from: 'user' });

    // Quien pasa --force puede no saber qué hay en destino; el aviso lo dice.
    expect(warnings()).toContain(`skills/${first}/SKILL.md`);
  });

  it('sin --force y con conflicto: error con código 1, no un aviso silencioso', async () => {
    setTTY(false);
    const [first] = available();
    const file = seedConflict(first);

    await expect(
      program.parseAsync(['skills', '--all'], { from: 'user' })
    ).rejects.toThrow('exit');

    // Exit 0 sin instalar nada era el bug: el agente leía éxito.
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(fs.readFileSync(file, 'utf8')).toBe('version local');
  });

  it('el error de conflicto dice qué archivo es y ofrece las dos salidas', async () => {
    setTTY(false);
    const [first] = available();
    seedConflict(first);

    await expect(
      program.parseAsync(['skills', '--all'], { from: 'user' })
    ).rejects.toThrow('exit');

    const message = errors().join('\n');
    expect(message).toContain(`skills/${first}/SKILL.md`);
    // Ambas salidas tienen que estar en el mensaje: reemplazar o mantener.
    expect(message).toContain('--force');
    expect(message).toMatch(/mantener|conservar/i);
  });

  it('con TTY pero con flags tampoco pregunta: error, no prompt colgado', async () => {
    // Es el caso "un agente con pseudo-TTY": hay terminal, pero nadie va a contestar.
    setTTY(true);
    const [first] = available();
    const file = seedConflict(first);

    await expect(
      program.parseAsync(['skills', '-s', first], { from: 'user' })
    ).rejects.toThrow('exit');

    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(fs.readFileSync(file, 'utf8')).toBe('version local');
  });

  it('conflicto + archivos faltantes: instala los faltantes igual y después falla', async () => {
    setTTY(false);
    const release = available().find((n) => n === 'release') ?? available()[0];
    const [first] = available();
    seedConflict(first);
    const companion = path.join(tmpDir, '.agents', 'templates', 'sdd', 'release-notes.md');
    if (release !== first) {
      await program.parseAsync(['skills', '-s', release], { from: 'user' }).catch(() => {});
      fs.rmSync(companion, { force: true });
    }

    await expect(
      program.parseAsync(['skills', '--all'], { from: 'user' })
    ).rejects.toThrow('exit');

    // El faltante no es conflicto: se instala igual aunque el comando termine en 1.
    // Si se abortara antes, el repo quedaría a medias para siempre.
    expect(fs.existsSync(companion)).toBe(true);
  });

  it('archivo idéntico al distribuido no es conflicto: sale con 0', async () => {
    setTTY(false);
    const [first] = available();
    const file = seedUpToDate(first);

    // No hay nada que sobrescribir ni que perder: un exit 1 acá sería un falso
    // positivo, y haría fallar un CI que ya está al día.
    await program.parseAsync(['skills', '--all'], { from: 'user' });

    expect(exitSpy).not.toHaveBeenCalled();
    expect(errors().join('\n')).not.toMatch(/ya existen/);
    expect(fs.readFileSync(file, 'utf8')).toBe(
      fs.readFileSync(path.join(srcDir, 'skills', first, 'SKILL.md'), 'utf8')
    );
  });

  it('el archivo idéntico se declara como actualizado, no como omitido', async () => {
    setTTY(false);
    seedUpToDate(available()[0]);

    await program.parseAsync(['skills', '--all'], { from: 'user' });

    const logged = logSpy.mock.calls.map((c) => String(c[0])).join('\n');
    expect(logged).toMatch(/versión más reciente/);
  });

  it('mixto: el idéntico no falla, el editado sí', async () => {
    setTTY(false);
    const [first, second] = available();
    seedUpToDate(first);
    seedConflict(second);

    await expect(
      program.parseAsync(['skills', '--all'], { from: 'user' })
    ).rejects.toThrow('exit');

    // Solo se reporta el que realmente difiere.
    const message = errors().join('\n');
    expect(message).toContain(`skills/${second}/SKILL.md`);
    expect(message).not.toContain(`skills/${first}/SKILL.md`);
  });

  it('--force sin conflictos no inventa trabajo: no avisa de reemplazos', async () => {
    setTTY(false);

    await program.parseAsync(['skills', '--all', '--force'], { from: 'user' });

    for (const name of available()) {
      expect(fs.existsSync(skillDir(name))).toBe(true);
    }
    expect(warnings()).not.toMatch(/reemplazando/);
  });

  it('--help documenta ambos flags con ejemplos para agentes', async () => {
    // addHelpText no aparece en helpInformation(): se emite al imprimir. Lo que
    // importa es lo que un agente lee de verdad al ejecutar `--help`, así que se
    // captura stdout en vez de inspeccionar la API interna.
    const chunks = [];
    const stdoutSpy = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation((chunk) => {
        chunks.push(String(chunk));
        return true;
      });

    await expect(
      program.parseAsync(['skills', '--help'], { from: 'user' })
    ).rejects.toThrow('exit');

    const help = chunks.join('');
    expect(help).toContain('--all');
    expect(help).toContain('--skill');
    expect(help).toContain('--force');
    // Sin ejemplos el agente no sabe cómo combinarlos ni qué pasa sin TTY.
    expect(help).toMatch(/Ejemplos/);
    stdoutSpy.mockRestore();
  });
});

