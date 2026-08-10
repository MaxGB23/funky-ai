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
  appendFileSync: vi.fn(),
}));

export { fsMock };

const __testDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const CWD = process.cwd();
export const ESTIMATE_TPL_DIR = path.resolve(__testDir, '../src/templates/estimate');
export const PRICING_GUIDE_TPL_PATH = path.join(ESTIMATE_TPL_DIR, 'pricing-guide-template.md');
export const PRICING_DECISIONS_TPL_PATH = path.join(ESTIMATE_TPL_DIR, 'pricing-decisions-template.md');
export const ESTIMATE_PROMPT_TPL_PATH = path.join(ESTIMATE_TPL_DIR, 'estimate-prompt-template.md');

// Canvas location: docs/funky-ai/canvas/
export const CANVAS_DIR = path.join(CWD, 'docs', 'funky-ai', 'canvas');
// Decisions location: docs/funky-ai/assess/
export const DECISIONS_DIR = path.join(CWD, 'docs', 'funky-ai', 'assess');
// Context location: docs/funky-ai/pipeline/
export const CONTEXT_DIR = path.join(CWD, 'docs', 'funky-ai', 'pipeline');
// Estimate outputs: docs/funky-ai/estimate/
export const ESTIMATE_DIR = path.join(CWD, 'docs', 'funky-ai', 'estimate');
export const PRICING_GUIDE_DEST = path.join(ESTIMATE_DIR, 'pricing-guide.md');
export const ESTIMATE_PROMPT_DEST = path.join(ESTIMATE_DIR, 'estimate-prompt.md');

// Réplica del template REAL commiteado (pricing-guide-template.md, Fase B M4):
// guía declarativa SIN placeholders que REFERENCIA los archivos, zona de
// incrustación <!-- topics --> SIN pares de marcadores vacíos (solo se incrustan
// topics con contenido) y header ## Estructura de Discusión. Espeja 1.1/1.2 + M4
// para que los tests de 2.1/2.3 ejerciten la misma estructura que produce el CLI real.
export const DEFAULT_GUIDE_TEMPLATE = `# Guía de Discusión de Pricing

> Generado por \`funky estimate\`. Guía declarativa de la sesión de pricing colaborativa.

## Contexto del Proyecto

Lee los archivos del proyecto, en este orden:

1. \`docs/funky-ai/canvas/brief-funcional.md\` — contexto de negocio.
2. \`docs/funky-ai/canvas/PROJECT-CANVAS.md\` — decisiones de la aplicación.
3. \`docs/funky-ai/canvas/INFRA-CANVAS.md\` — decisiones operativas.
4. \`docs/funky-ai/assess/architecture-decisions.md\` — decisiones arquitectónicas.
5. \`docs/funky-ai/estimate/pricing-decisions.md\` — decisiones de pricing aprobadas.

<!-- topics -->
## Paso Inicial: Recomienda las Flags y sus Buffers

Tras analizar el contexto, la IA recomienda las flags aplicables y sus buffers, y DETENTE: pide al humano inyectarlas con \`funky estimate --flag\` antes del debate.

| Flag | Cuándo conviene |
|------|-----------------|
| \`--security\` | Si hay autenticación o datos sensibles. |

<!-- /topics -->
## Estructura de Discusión

La discusión se hace punto por punto.

### 3. Factores de Costo del MVP

- **Equipo**: seniority, tamaño, dedicación. Para el Costo Base usa las tarifas base por rol de la tabla de abajo; si se incluyó \`--pricing-team\`, usa los rangos reales del equipo de esa sección (reemplazan a las tarifas base).

#### Tarifas base por rol (USD/hora, edición profesional)

| Rol | Tarifa base (USD/h) |
|-----|---------------------|
| Junior | 20–35 |
| Semi Senior / Mid | 35–55 |
| Senior | 55–85 |
| Lead / Arquitecto | 85–120 |

> Referencia por defecto: usa estas tarifas base cuando NO se incluyó \`--pricing-team\`; con la sección se usan los rangos reales del equipo.`;

export const DEFAULT_ESTIMATE_PROMPT_TEMPLATE = `# 🗣️ Prompt de Discusión de Pricing — \`funky estimate\`

Actúas como facilitador de la sesión de pricing del proyecto.

## Contexto de entrada

Lee \`docs/funky-ai/estimate/pricing-guide.md\` primero, luego \`docs/funky-ai/estimate/pricing-decisions.md\`.

## Fases

1. **Fase 1 — Preparación**: lee y analiza el contexto en silencio.
2. **Fase 2 — Recomendación**: propone las flags aplicables y sus buffers; DETENTE y pide al humano que las inyecte con \`funky estimate --flag\`.
3. **Fase 3 — Debate**: inicia la discusión solo tras la luz verde del humano.`;

export const DEFAULT_DECISIONS_TEMPLATE = `# Decisiones de Pricing

> Fecha: {{DATE}}

## Decisiones

### [Decisión 1: Título breve]
- **Decisión:** ...
- **Justificación:** ...
- **Impacto en presupuesto:** ...
- **Alternativas consideradas:** ...
- **Fecha:** {{DATE}}

## Tabla de Cotización del MVP

| Componente | Monto |
|---|---|
| Costo Base (desarrollo del MVP) | $ |
| Buffer de Riesgo (flags + contingencia) | $ |
| Margen de Ganancia | $ |
| **Precio de Venta del MVP** (Costo Base + Buffer + Margen) | **$** |

### Costo Operativo Mensual (Infraestructura)

| Componente | Monto Mensual |
|---|---|
| Hosting Frontend y API | ~$ |
| Base de Datos | ~$ |
| Background Jobs / Workers | ~$ |
| Herramientas y dependencias | ~$ |
| **Total Mensual Estimado** | **~$ / mes** |

> El cliente puede pagar la infraestructura directamente a los proveedores. Este costo operativo (OpEx) no se incluye en la factura de desarrollo.`;

export const CANVAS_PROJECT_CONTENT = 'React 18 + Next.js 14\nPatrón: Clean Architecture';
export const CANVAS_INFRA_CONTENT = 'AWS EC2 + PostgreSQL\nDeploy: Docker Compose';
export const DECISIONS_CONTENT = '# Decisiones\n- Stack: Next.js\n- DB: PostgreSQL';

export function estimateMockFiles() {
  return {
    [PRICING_GUIDE_TPL_PATH]: DEFAULT_GUIDE_TEMPLATE,
    [PRICING_DECISIONS_TPL_PATH]: DEFAULT_DECISIONS_TEMPLATE,
    [ESTIMATE_PROMPT_TPL_PATH]: DEFAULT_ESTIMATE_PROMPT_TEMPLATE,
  };
}

// Incrusta un topic con contenido justo antes del cierre de la zona
// `<!-- /topics -->`. Es el equivalente funcional de lo que produce el CLI real
// (Fase B M4: la zona solo contiene topics con contenido), para sembrar guías
// con topics "ya incrustados" en los tests sin depender de pares vacíos.
export function embedTopicIntoGuide(guide, topicKey, fragment) {
  return guide.replace(
    '<!-- /topics -->',
    `<!-- topic:${topicKey} -->\n${fragment}\n<!-- /topic:${topicKey} -->\n<!-- /topics -->`
  );
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
  // appendFileSync actualiza el mapa para que re-lecturas vean el append
  // (espeja el comportamiento real; init appenda .funky/ al .gitignore sin
  // reescribir el contenido leído — AGENTS.md).
  vi.mocked(fsMock.appendFileSync).mockImplementation((p, data) => {
    const key = String(p);
    mockFiles[key] = (mockFiles[key] ?? '') + String(data);
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

export const TOPIC_FRAGMENT_MULTI_TENANT = `## Multi-tenant

Impacto en costos:
- Aislamiento por tenant agrega complejidad de datos y permisos.`;

export const TOPIC_FRAGMENT_TRANSACTIONS = `## Transacciones

Impacto en costos:
- Pagos y saldos exigen consistencia (ACID) y conciliación.`;

export const TOPIC_FRAGMENT_CONCURRENCY = `## Concurrencia

Impacto en costos:
- Colas y workers agregan complejidad de infraestructura.`;

export const TOPIC_FRAGMENT_INTEGRATIONS = `## Integraciones

Impacto en costos:
- La integración con sistemas externos agrega acoplamiento y mantenimiento.`;

export const TEAM_COST_TEMPLATE = `## Referencia de Costos de Equipo

> Sección de referencia (\`--pricing-team\`): ENRIQUECE la guía. Los rangos reales del equipo definidos acá reemplazan a las tarifas base por rol de la guía al calcular el Costo Base. Sin esta sección se usan las tarifas base de la guía.

### Fórmula de referencia
Costo por rol = rol × seniority × dedicación × duración`;

export function addOptionalTemplates(mf) {
  mf[path.join(ESTIMATE_TPL_DIR, 'brief-questions-template.md')] = CHECKLIST_TEMPLATE;
  mf[path.join(ESTIMATE_TPL_DIR, 'topics', 'roles.md')] = TOPIC_FRAGMENT_ROLES;
  mf[path.join(ESTIMATE_TPL_DIR, 'topics', 'security.md')] = TOPIC_FRAGMENT_SECURITY;
  mf[path.join(ESTIMATE_TPL_DIR, 'topics', 'multi-tenant.md')] = TOPIC_FRAGMENT_MULTI_TENANT;
  mf[path.join(ESTIMATE_TPL_DIR, 'topics', 'transactions.md')] = TOPIC_FRAGMENT_TRANSACTIONS;
  mf[path.join(ESTIMATE_TPL_DIR, 'topics', 'concurrency.md')] = TOPIC_FRAGMENT_CONCURRENCY;
  mf[path.join(ESTIMATE_TPL_DIR, 'topics', 'integrations.md')] = TOPIC_FRAGMENT_INTEGRATIONS;
  mf[path.join(ESTIMATE_TPL_DIR, 'team-cost-reference-template.md')] = TEAM_COST_TEMPLATE;
}
