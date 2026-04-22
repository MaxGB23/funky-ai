import { describe, expect, it } from 'vitest';
import { generateCanvasMarkdown } from '../src/utils/canvas.js';

describe('generateCanvasMarkdown', () => {
  it('debería generar el markdown correcto con todos los valores provistos', () => {
    const config = {
      pattern: 'Clean Architecture',
      state: 'Zustand',
      tooling: 'pnpm + husky',
      styling: 'TailwindCSS',
      testing: 'Vitest',
      secops: 'Zod'
    };

    const markdown = generateCanvasMarkdown(config);
    
    expect(markdown).toContain('# 🚀 PROJECT CANVAS');
    expect(markdown).toContain('## 1. Patrón Arquitectónico Base\nClean Architecture');
    expect(markdown).toContain('## 2. Gestión de Estado y Datos\nZustand');
    expect(markdown).toContain('## 3. Ecosistema y Tooling\npnpm + husky');
    expect(markdown).toContain('## 4. Estrategia de Estilos y UI\nTailwindCSS');
    expect(markdown).toContain('## 5. Testing y CI/CD\nVitest');
    expect(markdown).toContain('## 6. SecOps y Entornos\nZod');
  });

  it('debería usar "No definido" para propiedades faltantes', () => {
    const config = { pattern: 'MVC' };
    const markdown = generateCanvasMarkdown(config);
    
    expect(markdown).toContain('## 1. Patrón Arquitectónico Base\nMVC');
    expect(markdown).toContain('## 2. Gestión de Estado y Datos\nNo definido');
  });
});
