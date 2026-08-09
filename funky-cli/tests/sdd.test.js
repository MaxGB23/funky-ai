import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// El handler compartido (runScaffoldCommand) delega la copia real a
// executeIntentions: mockear fs-adapter evita cualquier escritura en disco
// durante los tests de delegación (el plan puro runScaffold es read-only).
const executeIntentionsMock = vi.hoisted(() => vi.fn());

vi.mock('../src/utils/fs-adapter.js', () => ({
  executeIntentions: executeIntentionsMock,
}));

import { sddCommand, runScaffoldCommand, scaffoldCommand } from '../src/commands/sdd.js';

describe('funky sdd — namespace y subcomando install', () => {
  beforeEach(() => {
    executeIntentionsMock.mockReset();
    executeIntentionsMock.mockResolvedValue({ created: 0, skipped: 0, logs: [] });
  });

  it('sddCommand existe, se llama "sdd" y registra el subcomando install', () => {
    expect(sddCommand.name()).toBe('sdd');
    const subcommandNames = sddCommand.commands.map(c => c.name());
    expect(subcommandNames).toContain('install');
    // El handler compartido se exporta por el namespace (contrato de delegación
    // de install y del alias): es una función ejecutable, no solo un nombre.
    expect(typeof runScaffoldCommand).toBe('function');
  });

  it('funky sdd install delega al handler compartido de instalación (runScaffoldCommand)', async () => {
    const install = sddCommand.commands.find(c => c.name() === 'install');
    expect(install).toBeDefined();

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await sddCommand.parseAsync(['install'], { from: 'user' });

      expect(executeIntentionsMock).toHaveBeenCalledTimes(1);
      const logs = logSpy.mock.calls.map(c => String(c[0]));
      expect(logs.some(l => l.includes('🚀 Instalando estructura Funky AI...'))).toBe(true);
      expect(logs.some(l => l.includes('✅ Funky AI instalado.'))).toBe(true);
    } finally {
      logSpy.mockRestore();
    }
  });
});

describe('funky scaffold — alias deprecado', () => {
  beforeEach(() => {
    executeIntentionsMock.mockReset();
    executeIntentionsMock.mockResolvedValue({ created: 0, skipped: 0, logs: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('al ejecutar su action imprime el warning de deprecación SIEMPRE (sin gate TTY) y delega al mismo handler', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await scaffoldCommand.parseAsync([], { from: 'user' });

      expect(warnSpy).toHaveBeenCalledTimes(1);
      const warning = String(warnSpy.mock.calls[0][0]);
      expect(warning).toContain("'funky scaffold' está deprecado");
      expect(warning).toContain("'funky sdd install'");

      // Delegación al mismo handler: ejecuta el flujo de instalación completo
      // (mismo log y mismo executor que funky sdd install), sin copies reales.
      expect(executeIntentionsMock).toHaveBeenCalledTimes(1);
      const logs = logSpy.mock.calls.map(c => String(c[0]));
      expect(logs.some(l => l.includes('🚀 Instalando estructura Funky AI...'))).toBe(true);
      expect(errorSpy).not.toHaveBeenCalled();
    } finally {
      warnSpy.mockRestore();
      logSpy.mockRestore();
      errorSpy.mockRestore();
    }
  });
});
