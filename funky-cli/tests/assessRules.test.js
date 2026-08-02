import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

const fsMock = vi.hoisted(() => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));

import { surfaceRiskPatterns } from '../src/utils/assessRules.js';

const PROJECT_FILE = path.join('project', 'docs', 'funky-ai', 'assess', 'risk-patterns.md');

const TEMPLATE_CONTENT = `# Patrones de Riesgo de Referencia

> Documento VIVO y editable por el equipo.

## K8s / Kubernetes
- **Señal a buscar en los canvases:** el INFRA-CANVAS menciona K8s.
- **Riesgo a considerar:** costos operativos del clúster.

## SQLite
- **Señal a buscar en los canvases:** el INFRA-CANVAS elige SQLite.
- **Riesgo a considerar:** límites de concurrencia.`;

const TEAM_CONTENT = `# Patrones del Equipo

## Microservicios
- **Señal a buscar en los canvases:** el proyecto usa microservicios.
- **Riesgo a considerar:** complejidad de deploys.`;

function mockProjectFile(projectContent) {
  vi.mocked(fsMock.readFileSync).mockImplementation((p) => {
    if (String(p) === PROJECT_FILE) {
      if (projectContent === null) throw new Error('ENOENT: no such file');
      return projectContent;
    }
    return '';
  });
}

describe('surfaceRiskPatterns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a function', () => {
    expect(typeof surfaceRiskPatterns).toBe('function');
  });

  it('uses the template when the project risk-patterns.md does not exist', () => {
    mockProjectFile(null);
    const result = surfaceRiskPatterns('project', TEMPLATE_CONTENT);
    expect(result.content).toBe(TEMPLATE_CONTENT);
  });

  it('reads team content from the project risk-patterns.md when it exists', () => {
    mockProjectFile(TEAM_CONTENT);
    const result = surfaceRiskPatterns('project', TEMPLATE_CONTENT);
    expect(result.content).toBe(TEAM_CONTENT);
  });

  it('falls back to the template on read errors', () => {
    vi.mocked(fsMock.readFileSync).mockImplementation(() => { throw new Error('EACCES: permission denied'); });
    const result = surfaceRiskPatterns('project', TEMPLATE_CONTENT);
    expect(result.content).toBe(TEMPLATE_CONTENT);
  });

  it('returns empty content when neither the file nor the template are available', () => {
    mockProjectFile(null);
    const result = surfaceRiskPatterns('project', '');
    expect(result.content).toBe('');
    expect(result.patterns).toEqual([]);
  });

  it('extracts every `## ` section from the template as candidate categories', () => {
    mockProjectFile(null);
    const result = surfaceRiskPatterns('project', TEMPLATE_CONTENT);
    expect(result.patterns).toEqual(['K8s / Kubernetes', 'SQLite']);
  });

  it('surfaces team patterns without filtering or matching', () => {
    mockProjectFile(TEAM_CONTENT);
    const result = surfaceRiskPatterns('project', TEMPLATE_CONTENT);
    expect(result.patterns).toEqual(['Microservicios']);
  });

  it('returns an empty patterns array when the content has no `## ` sections', () => {
    mockProjectFile('# Solo un título');
    const result = surfaceRiskPatterns('project', TEMPLATE_CONTENT);
    expect(result.patterns).toEqual([]);
  });
});
