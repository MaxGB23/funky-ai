import { describe, expect, it } from 'vitest';
import { generateProjectCanvasMarkdown, generateInfraCanvasMarkdown } from '../src/utils/canvas.js';

describe('generateProjectCanvasMarkdown', () => {
  it('debería generar el markdown correcto con todos los valores provistos', () => {
    const config = {
      framework: 'React + Vite',
      pattern: 'Clean Architecture',
      state: 'Zustand',
      styling: 'TailwindCSS',
      testing: 'Vitest'
    };

    const markdown = generateProjectCanvasMarkdown(config);
    
    expect(typeof markdown).toBe('string');
    expect(markdown.length).toBeGreaterThan(0);
    expect(markdown).toContain('React + Vite');
    expect(markdown).toContain('Clean Architecture');
  });

  it('debería usar "No definido / Pendiente" para propiedades faltantes', () => {
    const config = { pattern: 'MVC' };
    const markdown = generateProjectCanvasMarkdown(config);
    
    expect(markdown).toContain('MVC');
    expect(markdown).toContain('No definido / Pendiente');
  });
});

describe('generateInfraCanvasMarkdown', () => {
  it('debería generar el markdown correcto de infra', () => {
    const config = {
      database: 'Prisma',
      auth: 'NextAuth',
      linter: 'ESLint',
      deployment: 'Vercel'
    };
    const markdown = generateInfraCanvasMarkdown(config);
    
    expect(typeof markdown).toBe('string');
    expect(markdown.length).toBeGreaterThan(0);
    expect(markdown).toContain('Prisma');
    expect(markdown).toContain('NextAuth');
    expect(markdown).toContain('ESLint');
    expect(markdown).toContain('Vercel');
  });
});
