import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Template del brief funcional (R6) ──

describe('brief-funcional.md template (R6)', () => {
  const templatePath = path.join(__dirname, '../src/templates/init/brief-funcional.md');
  const content = fs.readFileSync(templatePath, 'utf8');

  // Los 12 ítems de §13 (recomendaciones-agente.md:415-426), en orden.
  const expectedHeaders = [
    '1. Nombre del Producto o Idea',
    '2. Objetivo del Sistema',
    '3. Tipo de Usuario',
    '4. Caso de Uso Principal',
    '5. Funcionalidades Principales',
    '6. Funcionalidades Secundarias / Futuras',
    '7. Roles y Permisos',
    '8. Requisitos de Seguridad',
    '9. Integraciones Esperadas',
    '10. Entregables por Fase',
    '11. MVP vs Fase 2',
    '12. KPI o Éxito del Producto',
  ];

  it('contiene los 12 ítems de §13 como headers `## N.` en orden (R6)', () => {
    const headers = (content.match(/^## (\d+\. .+)$/gm) ?? []).map(h => h.replace(/^## /, ''));
    expect(headers).toEqual(expectedHeaders);
  });

  it('cada campo usa el placeholder [Completar] (R6)', () => {
    const completarCount = (content.match(/\[Completar\]/g) ?? []).length;
    expect(completarCount).toBeGreaterThanOrEqual(expectedHeaders.length);
  });

  it('NO contiene [Responde aquí] (R6 — no infla countUnfilledSections)', () => {
    expect(content).not.toContain('[Responde aquí]');
  });

  it('abre con el título `# 📋 BRIEF FUNCIONAL` y una intro que define "qué" y "para quién" (D4)', () => {
    expect(content.startsWith('# 📋 BRIEF FUNCIONAL')).toBe(true);
    expect(content).toMatch(/QUÉ|qué/);
    expect(content).toMatch(/PARA QUIÉN|para quién/);
  });
});
