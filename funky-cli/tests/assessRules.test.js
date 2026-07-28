import { describe, it, expect } from 'vitest';
import { generateGuideQuestions } from '../src/utils/assessRules.js';

describe('generateGuideQuestions', () => {
  it('is a function', () => {
    expect(typeof generateGuideQuestions).toBe('function');
  });

  it('returns { dynamic: [] } for empty canvas strings', () => {
    const result = generateGuideQuestions({ projectCanvas: '', infraCanvas: '' });
    expect(result).toEqual({ dynamic: [] });
  });

  it('returns { dynamic: [] } when no canvasData is provided', () => {
    const result = generateGuideQuestions();
    expect(result).toEqual({ dynamic: [] });
  });

  it('returns { dynamic: [] } for clean content with no patterns', () => {
    const result = generateGuideQuestions({
      projectCanvas: 'Equipo Senior usando React y Node.js',
      infraCanvas: 'AWS EC2 con PostgreSQL y Redis'
    });
    expect(result).toEqual({ dynamic: [] });
  });

  it('triggers K8s question when infra mentions "K8s"', () => {
    const result = generateGuideQuestions({
      projectCanvas: 'React frontend',
      infraCanvas: 'Deploy en K8s cluster'
    });
    expect(result.dynamic).toHaveLength(1);
    expect(result.dynamic[0].category).toBe('K8s');
    expect(result.dynamic[0].question).toContain('Kubernetes');
  });

  it('triggers K8s question when infra mentions "kubernetes" (lowercase)', () => {
    const result = generateGuideQuestions({
      projectCanvas: 'React frontend',
      infraCanvas: 'Deploy en kubernetes cluster'
    });
    expect(result.dynamic).toHaveLength(1);
    expect(result.dynamic[0].category).toBe('K8s');
  });

  it('triggers SQLite question when infra mentions "SQLite"', () => {
    const result = generateGuideQuestions({
      projectCanvas: 'React frontend',
      infraCanvas: 'SQLite como base de datos'
    });
    expect(result.dynamic).toHaveLength(1);
    expect(result.dynamic[0].category).toBe('SQLite');
    expect(result.dynamic[0].question).toContain('PostgreSQL');
  });

  it('triggers SingleNode question when infra mentions "single node"', () => {
    const result = generateGuideQuestions({
      projectCanvas: 'React frontend',
      infraCanvas: 'single node deployment'
    });
    expect(result.dynamic).toHaveLength(1);
    expect(result.dynamic[0].category).toBe('SingleNode');
    expect(result.dynamic[0].question).toContain('downtime');
  });

  it('triggers SingleNode question when infra mentions "single nodo" (Spanish)', () => {
    const result = generateGuideQuestions({
      projectCanvas: 'React frontend',
      infraCanvas: 'single nodo en VPS'
    });
    expect(result.dynamic).toHaveLength(1);
    expect(result.dynamic[0].category).toBe('SingleNode');
  });

  it('triggers Junior question when project mentions "junior" AND infra has K8s', () => {
    const result = generateGuideQuestions({
      projectCanvas: 'Equipo junior con React',
      infraCanvas: 'K8s en producción'
    });
    expect(result.dynamic.map(q => q.category)).toContain('Junior');
  });

  it('does NOT trigger Junior when junior mentioned without K8s', () => {
    const result = generateGuideQuestions({
      projectCanvas: 'Equipo junior con React',
      infraCanvas: 'VPS con MongoDB y Docker'
    });
    const categories = result.dynamic.map(q => q.category);
    expect(categories).not.toContain('Junior');
  });

  it('triggers multiple patterns when infra matches several conditions', () => {
    const result = generateGuideQuestions({
      projectCanvas: 'React frontend',
      infraCanvas: 'K8s cluster con SQLite en single node'
    });
    const categories = result.dynamic.map(q => q.category);
    expect(categories).toContain('K8s');
    expect(categories).toContain('SQLite');
    expect(categories).toContain('SingleNode');
  });

  it('matches case-insensitively: "K8S" and "Sqlite"', () => {
    const result = generateGuideQuestions({
      projectCanvas: 'React frontend',
      infraCanvas: 'K8S cluster con Sqlite'
    });
    const categories = result.dynamic.map(q => q.category);
    expect(categories).toContain('K8s');
    expect(categories).toContain('SQLite');
  });

  it('matches partial words: "sqlite" in "sqlite3"', () => {
    const result = generateGuideQuestions({
      projectCanvas: 'React frontend',
      infraCanvas: 'sqlite3 como motor local'
    });
    expect(result.dynamic[0].category).toBe('SQLite');
  });
});
