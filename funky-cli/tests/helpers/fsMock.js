import { vi } from 'vitest';
import path from 'path';
import { fileURLToPath } from 'url';

// Manual mock: provide both default export (for `import fs from 'fs'`)
// and named exports (for `import { writeFileSync } from 'fs'`)
const fsMock = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  copyFileSync: vi.fn(),
  statSync: vi.fn(),
  lstatSync: vi.fn(),
  realpathSync: vi.fn(),
}));

export { fsMock };

const __testDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CWD = process.cwd();
export const ESTIMATE_TPL_DIR = path.resolve(__testDir, '../src/templates/estimate');
export const PRICING_GUIDE_TPL_PATH = path.join(ESTIMATE_TPL_DIR, 'pricing-guide-template.md');
export const PRICING_DECISIONS_TPL_PATH = path.join(ESTIMATE_TPL_DIR, 'pricing-decisions-template.md');

// Canvas location: docs/funky-ai/canvas/
export const CANVAS_DIR = path.join(CWD, 'docs', 'funky-ai', 'canvas');
// Decisions location: docs/funky-ai/assess/
export const DECISIONS_DIR = path.join(CWD, 'docs', 'funky-ai', 'assess');
// Context location: docs/funky-ai/pipeline/
export const CONTEXT_DIR = path.join(CWD, 'docs', 'funky-ai', 'pipeline');

export const DEFAULT_GUIDE_TEMPLATE = `# Guía de Discusión de Pricing

> Generado por \`funky estimate\`. Use este documento para su sesión de pricing colaborativa.

## Contexto del Proyecto

### Decisiones Arquitectónicas
{{DECISIONS_CONTENT}}

### PROJECT-CANVAS
{{PROJECT_CANVAS_CONTENT}}

### INFRA-CANVAS
{{INFRA_CANVAS_CONTENT}}
{{OPTIONAL_SECTIONS}}
## Estructura de Discusión

### 1. Contexto de Pricing (5 min)
Revisar decisiones arquitectónicas y canvases para entender el alcance del proyecto.

### 2. Factores de Costo (10 min)
- Infraestructura: hosting, servicios, herramientas
- Complejidad técnica: stack, integraciones, deuda técnica
- Equipo: seniority, tamaño, dedicación
- Timeline: urgencia, hitos, mantenimiento post-lanzamiento

### 3. Referencia de Infraestructura (10 min)
Costos estimados de los servicios elegidos en los canvases. Investigar precios actuales de cada proveedor.

### 4. Acuerdos de Pricing (15 min)
Definir precio final usando la guía de la sesión. Documentar en pricing-decisions-template.md.

## Instrucciones
1. Revise esta guía con el equipo.
2. Discuta cada factor de costo.
3. Documente los acuerdos en el template de decisiones.`;

export const DEFAULT_DECISIONS_TEMPLATE = `# Decisiones de Pricing

> Fecha: {{DATE}}

## Decisiones

### [Decisión 1: Título breve]
- **Decisión:** ...
- **Justificación:** ...
- **Impacto en presupuesto:** ...
- **Alternativas consideradas:** ...
- **Fecha:** {{DATE}}

### [Decisión 2: Título breve]
- **Decisión:** ...
- **Justificación:** ...
- **Impacto en presupuesto:** ...
- **Alternativas consideradas:** ...
- **Fecha:** {{DATE}}`;

export const CANVAS_PROJECT_CONTENT = 'React 18 + Next.js 14\nPatrón: Clean Architecture';
export const CANVAS_INFRA_CONTENT = 'AWS EC2 + PostgreSQL\nDeploy: Docker Compose';
export const DECISIONS_CONTENT = '# Decisiones\n- Stack: Next.js\n- DB: PostgreSQL';

export function estimateMockFiles() {
  return {
    [PRICING_GUIDE_TPL_PATH]: DEFAULT_GUIDE_TEMPLATE,
    [PRICING_DECISIONS_TPL_PATH]: DEFAULT_DECISIONS_TEMPLATE,
  };
}

export function addCanvas(mockFiles, name, content) {
  mockFiles[path.join(CANVAS_DIR, name)] = content;
}

export function addDecisions(mockFiles, content) {
  mockFiles[path.join(DECISIONS_DIR, 'architecture-decisions.md')] = content;
}

export function applyMocks(mockFiles) {
  vi.mocked(fsMock.existsSync).mockImplementation((p) => {
    return Object.prototype.hasOwnProperty.call(mockFiles, String(p));
  });
  vi.mocked(fsMock.readFileSync).mockImplementation((p, enc) => {
    const key = String(p);
    if (Object.prototype.hasOwnProperty.call(mockFiles, key)) {
      return mockFiles[key];
    }
    return '';
  });
}

export function addContextJson(mf, data) {
  mf[path.join(CONTEXT_DIR, 'context.json')] = JSON.stringify(data);
}

// Seed de context v2 (R-P8) con override por fase; status 'pending' por defecto.
export function v2Context(overrides = {}) {
  return {
    version: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    currentPhase: null,
    assess: {
      status: 'pending', startedAt: null, finishedAt: null, durationMs: null,
      error: null, artifacts: [], runAt: null, surfacedPatterns: [], decisionsFile: null,
      ...(overrides.assess || {})
    },
    estimate: {
      status: 'pending', startedAt: null, finishedAt: null, durationMs: null,
      error: null, artifacts: [], runAt: null,
      ...(overrides.estimate || {})
    }
  };
}

export const NEUTRAL_DECISIONS = '# Decisiones\n- Stack: Next.js\n- DB: PostgreSQL';

export function projectCanvasWith(overrides = {}) {
  const sections = {
    1: 'Next.js App Router',
    2: 'Clean Architecture',
    3: 'React Query + Zustand',
    4: 'Tailwind',
    5: 'Vitest',
  };
  const merged = { ...sections, ...overrides };
  return `# PROJECT CANVAS

## 1. Framework Base
${merged[1]}

## 2. Patrón Arquitectónico
${merged[2]}

## 3. Gestión de Estado
${merged[3]}

## 4. Estrategia UI
${merged[4]}

## 5. Estrategia de Testing
${merged[5]}`;
}

export function infraCanvasWith(overrides = {}) {
  const sections = {
    1: 'PostgreSQL con Prisma',
    2: 'No hay sistema de usuarios',
    3: 'Biome',
    4: 'Vercel + GitHub Actions',
  };
  const merged = { ...sections, ...overrides };
  return `# INFRA CANVAS

## 1. Base de Datos / ORM
${merged[1]}

## 2. Autenticación
${merged[2]}

## 3. Linter / Formatter
${merged[3]}

## 4. Deployment & CI/CD
${merged[4]}`;
}

export const CHECKLIST_TEMPLATE = `## Brief Funcional

**Producto**
- ¿Qué problema resuelve el producto?`;

export const TOPIC_FRAGMENT_ROLES = `## Roles del equipo

Impacto en costos:
- La composición del equipo domina el presupuesto.`;

export const TOPIC_FRAGMENT_SECURITY = `## Seguridad

Impacto en costos:
- Auth y cumplimiento agregan esfuerzo recurrente.`;

export const TEAM_COST_TEMPLATE = `## Referencia de Costos de Equipo

### Fórmula de referencia
Costo por rol = rol × seniority × dedicación × duración`;

export function addOptionalTemplates(mf) {
  mf[path.join(ESTIMATE_TPL_DIR, 'brief-questions-template.md')] = CHECKLIST_TEMPLATE;
  mf[path.join(ESTIMATE_TPL_DIR, 'topics', 'roles.md')] = TOPIC_FRAGMENT_ROLES;
  mf[path.join(ESTIMATE_TPL_DIR, 'topics', 'security.md')] = TOPIC_FRAGMENT_SECURITY;
  mf[path.join(ESTIMATE_TPL_DIR, 'team-cost-reference-template.md')] = TEAM_COST_TEMPLATE;
}
