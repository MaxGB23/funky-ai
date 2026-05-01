import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

vi.mock('fs');

import fs from 'fs';
import { runRelease } from '../src/commands/release.js';

describe('runRelease()', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`process.exit: ${code}`);
    });
  });

  it('versión válida -> archivo generado con interpolación', () => {
    fs.existsSync.mockImplementation((p) => {
      if (p.includes('templates')) return true;
      return false;
    });
    fs.readFileSync.mockReturnValue('Release v{{version}} on {{date}}');
    fs.writeFileSync.mockImplementation(() => {});
    fs.mkdirSync.mockImplementation(() => {});

    runRelease('1.10.0');

    expect(fs.writeFileSync).toHaveBeenCalled();
    const callArgs = fs.writeFileSync.mock.calls[0];
    expect(callArgs[0]).toMatch(/v1\.10\.0-release\.md$/);
    expect(callArgs[1]).toContain('Release v1.10.0');
    expect(callArgs[1]).not.toContain('{{version}}');
  });

  it('versión inválida -> termina con exit code 1', () => {
    expect(() => runRelease('abc')).toThrow('process.exit: 1');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('formato de versión es inválido'));
  });

  it('release ya existente -> aborta, no sobreescribe', () => {
    fs.existsSync.mockImplementation((p) => {
      if (p.includes('templates')) return true;
      if (p.includes('v1.10.0-release.md')) return true; // already exists
      return false;
    });

    expect(() => runRelease('1.10.0')).toThrow('process.exit: 1');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('ya existe'));
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });
});
