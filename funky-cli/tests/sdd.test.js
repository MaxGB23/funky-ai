import { describe, it, expect, vi, beforeEach } from 'vitest';

// El handler de install (runScaffoldCommand) delega la copia real a
// executeIntentions: mockear fs-adapter evita cualquier escritura en disco
// durante los tests de delegación (el plan puro runScaffold es read-only).
const executeIntentionsMock = vi.hoisted(() => vi.fn());

vi.mock('../src/utils/fs-adapter.js', () => ({
  executeIntentions: executeIntentionsMock,
}));

import { sddCommand, runScaffoldCommand } from '../src/commands/sdd.js';

describe('funky sdd — namespace y subcomando install', () => {
  beforeEach(() => {
    executeIntentionsMock.mockReset();
    executeIntentionsMock.mockResolvedValue({ created: 0, skipped: 0, logs: [] });
  });

  it('sddCommand existe, se llama "sdd" y registra el subcomando install', () => {
    expect(sddCommand.name()).toBe('sdd');
    const subcommandNames = sddCommand.commands.map(c => c.name());
    expect(subcommandNames.some((n) => n === 'install')).toBe(true);
    // El handler compartido se exporta por el namespace (contrato de delegación
    // de install): es una función ejecutable, no solo un nombre.
    expect(typeof runScaffoldCommand).toBe('function');
  });

  it('funky sdd install delega al handler de instalación (runScaffoldCommand)', async () => {
    const install = sddCommand.commands.find(c => c.name() === 'install');
    expect(install).toBeDefined();

    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    try {
      await sddCommand.parseAsync(['install'], { from: 'user' });

      expect(executeIntentionsMock).toHaveBeenCalledTimes(1);
      const logs = logSpy.mock.calls.map(c => String(c[0]));
      expect(logs.some((l) => /🚀 Instalando estructura Funky AI\.\.\./.test(l))).toBe(true);
      expect(logs.some((l) => /✅ Funky AI instalado\./.test(l))).toBe(true);
    } finally {
      logSpy.mockRestore();
    }
  });
});
