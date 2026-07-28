import { describe, it, expect } from 'vitest';
import { generateProjectCanvasMarkdown, generateInfraCanvasMarkdown } from '../src/utils/canvas.js';

describe('generateProjectCanvasMarkdown', () => {
  it('usa placeholder específico para propiedades faltantes', () => {
    const config = { pattern: 'MVC' };
    const markdown = generateProjectCanvasMarkdown(config);

    expect(markdown).toContain('MVC');
    expect(markdown).not.toContain('No definido / Pendiente');
    expect(markdown).toContain('¿Qué framework elegiste');
    expect(markdown).toContain('[Responde aquí]');
  });

  it('cada sección de PROJECT-CANVAS tiene un placeholder diferente', () => {
    const markdown = generateProjectCanvasMarkdown({});

    expect(markdown).toContain('¿Qué framework elegiste');
    expect(markdown).toContain('¿Qué patrón organiza');
    expect(markdown).toContain('¿Cómo fluyen los datos');
    expect(markdown).toContain('¿Qué herramienta de estilos');
    expect(markdown).toContain('¿Qué metodología y runner');
  });

  it('procesa configuración completa correctamente', () => {
    const config = {
      framework: 'Next.js',
      pattern: 'Clean Architecture',
      state: 'Zustand',
      styling: 'Tailwind',
      testing: 'Vitest'
    };
    const markdown = generateProjectCanvasMarkdown(config);
    expect(markdown).toContain('Next.js');
    expect(markdown).toContain('Clean Architecture');
    expect(markdown).toContain('Zustand');
    expect(markdown).toContain('Tailwind');
    expect(markdown).toContain('Vitest');
  });

  it('incluye marcador condicional en Estrategia UI', () => {
    const markdown = generateProjectCanvasMarkdown({});
    expect(markdown).toContain('> 💡 *Si aplica*');
    expect(markdown.indexOf('> 💡 *Si aplica*')).toBeGreaterThan(markdown.indexOf('Estrategia UI'));
  });
});

describe('generateInfraCanvasMarkdown', () => {
  it('no contiene "No definido" cuando se invoca sin datos', () => {
    const markdown = generateInfraCanvasMarkdown({});
    expect(markdown).not.toContain('No definido');
  });

  it('cada sección de INFRA-CANVAS tiene placeholder específico', () => {
    const markdown = generateInfraCanvasMarkdown({});
    expect(markdown).toContain('¿Qué base de datos');
    expect(markdown).toContain('¿Qué solución de auth');
    expect(markdown).toContain('¿Qué herramientas de calidad');
    expect(markdown).toContain('¿Dónde y cómo deployas');
  });

  it('incluye marcador condicional en Deployment', () => {
    const markdown = generateInfraCanvasMarkdown({});
    expect(markdown).toContain('> 💡 *Si aplica*');
    expect(markdown.indexOf('> 💡 *Si aplica*')).toBeGreaterThan(markdown.indexOf('Deployment'));
  });

  it('procesa configuración completa correctamente', () => {
    const config = {
      database: 'PostgreSQL + Prisma',
      auth: 'NextAuth.js',
      linter: 'Biome',
      deployment: 'Vercel'
    };
    const markdown = generateInfraCanvasMarkdown(config);
    expect(markdown).toContain('PostgreSQL + Prisma');
    expect(markdown).toContain('NextAuth.js');
    expect(markdown).toContain('Biome');
    expect(markdown).toContain('Vercel');
  });
});
