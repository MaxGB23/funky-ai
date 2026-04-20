import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

vi.mock('fs');

import fs from 'fs';
import { runPhase } from '../src/commands/phase.js';

describe('runPhase()', () => {
  // Usar path.join para que los separadores sean correctos en cualquier OS
  const fakeTemplatesDir = path.join('C:', 'fake', 'templates', 'sdd');
  const fakeCwd = path.join('C:', 'fake', 'project');

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Default seguro: readdirSync siempre retorna array vacío salvo override explícito
    fs.readdirSync.mockReturnValue([]);
  });

  it('inyecta el template correctamente cuando el archivo no existe', () => {
    const templateContent = '# Explore Template\n...';
    const expectedTemplatePath = path.join(fakeTemplatesDir, 'explore.md');
    const expectedTargetPath = path.join(fakeCwd, 'sdd-explore.md');

    fs.existsSync.mockImplementation((p) => {
      if (p === expectedTemplatePath) return true;
      if (p === expectedTargetPath) return false;
      return false;
    });
    fs.readFileSync.mockReturnValue(templateContent);
    fs.writeFileSync.mockImplementation(() => {});

    const result = runPhase({ nombreFase: 'explore', templatesDir: fakeTemplatesDir, cwd: fakeCwd });

    expect(result.success).toBe(true);
    expect(fs.readFileSync).toHaveBeenCalledWith(expectedTemplatePath, 'utf8');
    expect(fs.writeFileSync).toHaveBeenCalledWith(expectedTargetPath, templateContent, 'utf8');
  });

  it('normaliza el nombre de fase a lowercase', () => {
    const expectedTemplatePath = path.join(fakeTemplatesDir, 'design.md');
    const expectedTargetPath = path.join(fakeCwd, 'sdd-design.md');

    fs.existsSync.mockImplementation((p) => {
      if (p === expectedTemplatePath) return true;
      if (p === expectedTargetPath) return false;
      return false;
    });
    fs.readFileSync.mockReturnValue('# Design');
    fs.writeFileSync.mockImplementation(() => {});

    const result = runPhase({ nombreFase: 'DESIGN', templatesDir: fakeTemplatesDir, cwd: fakeCwd });

    expect(result.success).toBe(true);
    expect(fs.existsSync).toHaveBeenCalledWith(expectedTemplatePath);
  });

  it('falla si el template de la fase no existe', () => {
    fs.existsSync.mockReturnValue(false);
    fs.readdirSync.mockReturnValue(['explore.md', 'proposal.md']);

    const result = runPhase({ nombreFase: 'unknown', templatesDir: fakeTemplatesDir, cwd: fakeCwd });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/no existe/i);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('falla si el archivo destino ya existe (protección de datos)', () => {
    // Template SDD existe Y destino ya existe
    fs.existsSync.mockReturnValue(true);

    const result = runPhase({ nombreFase: 'explore', templatesDir: fakeTemplatesDir, cwd: fakeCwd });

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/ya existe/i);
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('propaga el error si fs.writeFileSync falla', () => {
    const expectedTemplatePath = path.join(fakeTemplatesDir, 'explore.md');
    const expectedTargetPath = path.join(fakeCwd, 'sdd-explore.md');

    fs.existsSync.mockImplementation((p) => {
      if (p === expectedTemplatePath) return true;
      if (p === expectedTargetPath) return false;
      return false;
    });
    fs.readFileSync.mockReturnValue('# content');
    fs.writeFileSync.mockImplementation(() => {
      throw new Error('Disk full');
    });

    expect(() => runPhase({ nombreFase: 'explore', templatesDir: fakeTemplatesDir, cwd: fakeCwd }))
      .toThrow('Disk full');
  });
});
