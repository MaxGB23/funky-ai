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
    
    expect(markdown).toContain('# 🚀 PROJECT CANVAS');
    expect(markdown).toContain('## 1. Framework Base\nReact + Vite');
    expect(markdown).toContain('## 2. Patrón Arquitectónico\nClean Architecture');
  });

  it('debería usar "No definido / Pendiente" para propiedades faltantes', () => {
    const config = { pattern: 'MVC' };
    const markdown = generateProjectCanvasMarkdown(config);
    
    expect(markdown).toContain('## 2. Patrón Arquitectónico\nMVC');
    expect(markdown).toContain('## 3. Gestión de Estado\nNo definido / Pendiente');
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
    expect(markdown).toContain('# 🏗️ INFRA CANVAS');
    expect(markdown).toContain('## 1. Base de Datos / ORM\nPrisma');
  });
});
