import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Templates Validation', () => {
  it('release-checklist.md should satisfy the machine contract <MANDATORY_RELEASE_PROTOCOL>', () => {
    const releasePath = path.join(__dirname, '../src/templates/bootstrap/sdd/release-checklist.md');
    const content = fs.readFileSync(releasePath, 'utf8');
    expect(content).toMatch(/<MANDATORY_RELEASE_PROTOCOL>/);
  });

  it('release-notes.md should exist in the base bootstrap/sdd templates', () => {
    const releaseNotesPath = path.join(__dirname, '../src/templates/bootstrap/sdd/release-notes.md');
    const content = fs.readFileSync(releaseNotesPath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
  });
});

describe('Bases de skills (src/skills/, no dead gentle)', () => {
  it('sdd-release base: sin capa CLI del monorepo, rutas neutralizadas (D3)', () => {
    const releasePath = path.join(__dirname, '../src/skills/sdd-release/SKILL.md');
    const content = fs.readFileSync(releasePath, 'utf8');

    expect(content).not.toContain('No aplica en antigravity');
    expect(content).not.toContain('funky-cli/bin');
    expect(content).toContain('<ruta-docs-del-proyecto>');
    expect(content).toContain('release-notes.md');
  });

  it('sdd-release base: paso 2 inyecta release-notes.md desde el template si falta, rutas con / (D5, R-SK-10)', () => {
    const releasePath = path.join(__dirname, '../src/skills/sdd-release/SKILL.md');
    const content = fs.readFileSync(releasePath, 'utf8');

    expect(content).toContain('.agents/templates/sdd/release-notes.md');
    expect(content).not.toMatch(/\.agents\\templates\\sdd/);
    expect(content).toMatch(/does not exist, inject it from the base template/i);
  });

  it('sdd-docs-sync base: sin verificación CLI del monorepo, SSOT condicional (D2)', () => {
    const syncPath = path.join(__dirname, '../src/skills/sdd-docs-sync/SKILL.md');
    const content = fs.readFileSync(syncPath, 'utf8');

    expect(content).not.toContain('funky-cli/bin');
    expect(content).not.toMatch(/paso 4a|paso 4b|node funky-cli/);
    expect(content).toContain('docs-live-index.md');
    expect(content).toContain('docs-index');
  });
});

describe('Templates de docs compartidos (bootstrap/sdd)', () => {
  it('docs-live-index.md: fila placeholder <ruta-del-doc> (SSOT compartido)', () => {
    const livePath = path.join(__dirname, '../src/templates/bootstrap/sdd/docs-live-index.md');
    const content = fs.readFileSync(livePath, 'utf8');

    expect(content).toContain('Índice de Docs Vivos (SSOT)');
    expect(content).toContain('<ruta-del-doc>');
  });

  it('docs-index/_indice-seccional-template.md: formato canónico del índice seccional, 3 niveles (R-SK-4)', () => {
    const templatePath = path.join(__dirname, '../src/templates/bootstrap/sdd/docs-index/_indice-seccional-template.md');
    const content = fs.readFileSync(templatePath, 'utf8');

    expect(content).toMatch(/# Índice de Secciones: /);
    expect(content).toMatch(/- \*\*1\. /);
    expect(content).toMatch(/- \*\*2\.1 /);
    expect(content).toMatch(/^### /m);
  });
});
