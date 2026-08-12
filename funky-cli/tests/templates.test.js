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

  it('sdd-docs-sync base: regla doc-nuevo en Decision Gates y pasos (D6, R-SK-11)', () => {
    const syncPath = path.join(__dirname, '../src/skills/sdd-docs-sync/SKILL.md');
    const content = fs.readFileSync(syncPath, 'utf8');

    expect(content).toMatch(/Comando nuevo/);
    expect(content).toMatch(/docs\/<dominio>\/<comando>\.md/);
    expect(content).toMatch(/Capability nueva/);
    expect(content).toMatch(/Fraccionamiento/);
    expect(content).toMatch(/_indice-seccional-template\.md/);
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

describe('Templates de estimate — Fase A (checklist M1/M2/M3)', () => {
  const promptPath = path.join(__dirname, '../src/templates/estimate/estimate-prompt-template.md');
  const guidePath = path.join(__dirname, '../src/templates/estimate/pricing-guide-template.md');

  it('M1: estimate-prompt-template define el flujo estricto en 3 fases (Preparación → Recomendación → Debate)', () => {
    const content = fs.readFileSync(promptPath, 'utf8');

    expect(content).toContain('Fase 1 — Preparación');
    expect(content).toContain('Fase 2 — Recomendación');
    expect(content).toContain('Fase 3 — Debate');
  });

  it('M1: la Fase 2 ordena DETENERSE y pedir al humano que inyecte las flags con `funky estimate --flag`', () => {
    const content = fs.readFileSync(promptPath, 'utf8');

    expect(content).toContain('funky estimate --flag');
    expect(content).toMatch(/DETENTE por completo/i);
    expect(content).toMatch(/luz verde/i);
  });

  it('M1: la sección ## Inicio ya no ordena presentar el primer punto de discusión sin pasar por las flags', () => {
    const content = fs.readFileSync(promptPath, 'utf8');

    expect(content).not.toContain('presenta el PRIMER punto de discusión');
    expect(content).toMatch(/Fase 1/);
  });

  it('M2: el Contexto de entrada del prompt solo instruye leer pricing-guide.md y pricing-decisions.md (sin lista duplicada)', () => {
    const content = fs.readFileSync(promptPath, 'utf8');
    const ctx = content.split('## Contexto de entrada')[1].split('## Fases')[0] || '';

    expect(ctx).toContain('pricing-guide.md');
    expect(ctx).toContain('pricing-decisions.md');
    expect(ctx).not.toContain('PROJECT-CANVAS.md');
    expect(ctx).not.toContain('INFRA-CANVAS.md');
    expect(ctx).not.toContain('brief-funcional.md');
    expect(ctx).not.toContain('architecture-decisions.md');
  });

  it('M2: pricing-guide-template lista pricing-decisions.md como lectura en su Contexto del Proyecto', () => {
    const content = fs.readFileSync(guidePath, 'utf8');
    const ctx = content.split('## Contexto del Proyecto')[1].split('<!-- topics -->')[0] || '';

    expect(ctx).toContain('pricing-decisions.md');
  });

  it('M1: el Paso Inicial de la guía ordena detenerse y esperar la inyección de flags antes del debate', () => {
    const content = fs.readFileSync(guidePath, 'utf8');

    expect(content).toContain('funky estimate --flag');
    expect(content).toMatch(/DETENTE|Detente/i);
    expect(content).toMatch(/luz verde/i);
  });

  it('M3: la tabla de flags de la guía NO recomienda --brief (el flag CLI sigue vivo, fuera de la tabla)', () => {
    const content = fs.readFileSync(guidePath, 'utf8');

    expect(content).not.toMatch(/^\|\s*`--brief`/m);
  });

  it('M4: el template base NO trae pares de marcadores vacíos en la zona de topics', () => {
    const content = fs.readFileSync(guidePath, 'utf8');

    expect(content).not.toMatch(/<!-- topic:[a-z0-9-]+ -->\s*<!-- \/topic:[a-z0-9-]+ -->/);
    expect(content).toContain('<!-- topics -->');
    expect(content).toContain('<!-- /topics -->');
  });

  it('M5: la guía incluye SIEMPRE la tabla base de tarifas por rol (USD/hora, edición profesional)', () => {
    const content = fs.readFileSync(guidePath, 'utf8');
    const costos = content.split('### 3. Factores de Costo del MVP')[1]?.split('### 4.')[0] || '';

    expect(costos).toContain('TARIFAS BASE DE FALLBACK');
    expect(costos).toContain('| Junior | 20–35 |');
    expect(costos).toContain('| Semi Senior / Mid | 35–55 |');
    expect(costos).toContain('| Senior | 55–85 |');
    expect(costos).toContain('| Lead / Arquitecto | 85–120 |');
  });

  it('M5: sin la sección de --pricing-team se usan las tarifas base; con la sección se usan los rangos reales del equipo', () => {
    const content = fs.readFileSync(guidePath, 'utf8');
    const costos = content.split('### 3. Factores de Costo del MVP')[1]?.split('### 4.')[0] || '';

    expect(costos).toMatch(/tarifas base/i);
    expect(costos).toMatch(/rangos reales del equipo/i);
    expect(costos).toMatch(/--pricing-team/);
  });

  it('M5: team-cost-reference enriquece la guía y NO duplica la tabla base de tarifas', () => {
    const teamCost = fs.readFileSync(path.join(__dirname, '../src/templates/estimate/team-cost-reference-template.md'), 'utf8');

    expect(teamCost).toMatch(/tarifas base/i);
    expect(teamCost).toMatch(/rangos reales del equipo/i);
    expect(teamCost).not.toContain('| Junior | 20–35 |');
    expect(teamCost).not.toContain('Tarifas base por rol');
  });
});

describe('Templates de estimate — M12 (tabla de Costo Operativo Mensual)', () => {
  const decisionsPath = path.join(__dirname, '../src/templates/estimate/pricing-decisions-template.md');

  it('M12: pricing-decisions-template incluye la tabla de Costo Operativo Mensual con Total Mensual Estimado', () => {
    const content = fs.readFileSync(decisionsPath, 'utf8');

    expect(content).toContain('### Costo Operativo Mensual (Infraestructura)');
    expect(content).toContain('| Componente | Monto Mensual |');
    expect(content).toContain('**Total Mensual Estimado**');
  });

  it('M12: la sección deja claro que el OpEx mensual NO suma al Precio de Venta del MVP', () => {
    const content = fs.readFileSync(decisionsPath, 'utf8');

    expect(content).toMatch(/OpEx/i);
    expect(content).toMatch(/no se incluye en la factura de desarrollo/i);
  });
});
