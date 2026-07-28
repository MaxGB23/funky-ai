# Design: Fase 1 — Templates (funky init --template)

> **Change:** `fase-1-templates`
> **Estado:** Design
> **Fecha:** 2026-07-28
> **Precedido por:** [Spec](./spec.md)

---

## Resumen ejecutivo del diseño

Este documento detalla el diseño técnico para los 7 ítems de la fase 1. Cada ítem incluye cambios exactos por archivo, estructura de contenido nuevo, flujo de datos, casos borde y estrategia de tests. El diseño prioriza cambios mínimos e incrementales: limpieza de archivos huérfanos y referencias rotas (ítems 1-2), mejora de contenido pedagógico en canvases y guía (ítems 3-6), y deprecación final del modo setup inicial (ítem 7). No se requieren cambios arquitectónicos ni nuevas dependencias.

---

## Índice

1. [Ítem 1: Fix orphaned files](#ítem-1-fix-orphaned-files)
2. [Ítem 2: Fix sync-templates.js](#ítem-2-fix-sync-templatesjs)
3. [Ítem 3: Mejores preguntas (canvas.js)](#ítem-3-mejores-preguntas-canvasjs)
4. [Ítem 4: Architect Notes (canvas-planning-guide.md)](#ítem-4-architect-notes-canvas-planning-guidemd)
5. [Ítem 5: Pull not push](#ítem-5-pull-not-push)
6. [Ítem 6: LLM-driven compatibility analysis](#ítem-6-llm-driven-compatibility-analysis)
7. [Ítem 7: Deprecar setup inicial](#ítem-7-deprecar-setup-inicial)
8. [Resumen de cambios por archivo](#resumen-de-cambios-por-archivo)
9. [Riesgos](#riesgos)

---

## Ítem 1: Fix orphaned files

### Archivo: `funky-cli/src/commands/init.js`

#### Cambios exactos

**Insertar 4 nuevas entradas** en el array `filesToCopy` dentro de `runInit()`, después de la línea 35 (la entrada de `'TEMPLATE_GUIDE.md'`) y antes del cierre del array (línea 36: `];`):

```js
    { src: 'engram-discoveries.md', dest: path.join('docs', 'engram', 'discoveries.md') },
    { src: 'engram-bugfixes.md', dest: path.join('docs', 'engram', 'bugfix', 'bugfixes.md') },
    { src: 'architecture-assessment-guide.md', dest: path.join('docs', 'architecture-assessment-guide.md') },
    { src: 'agents-rules-secops-setup.md', dest: path.join('.agents', 'rules', 'secops-setup.md') },
```

**Nota sobre la ruta de `architecture-assessment-guide.md`:** El destino es `docs/architecture-assessment-guide.md` (directamente en `docs/`), no dentro de `docs/funky-ai/cli/`. Esto es consistente con el destino de `architecture-assessment.md` (línea 32) que va a `docs/architecture-assessment.md`. Ambos archivos de assessment viven en el mismo directorio.

**Nota sobre la ruta de `engram-bugfixes.md`:** El destino es `docs/engram/bugfix/bugfixes.md` — dentro del subdirectorio `bugfix/` que ya se crea en `engramDirs` (línea 45). Esto replica la estructura de sharding del engram y mantiene consistencia con la arquitectura existente.

#### Estado después del cambio

El array `filesToCopy` pasa de 9 a 13 elementos. El array completo después del cambio:

```js
  const filesToCopy = [
    { src: 'ORCHESTRATOR-STATE.md', dest: 'ORCHESTRATOR-STATE.md' },
    { src: 'agents-rules-engram-protocol.md', dest: path.join('.agents', 'rules', 'engram-protocol.md') },
    { src: 'agents-rules-secops.md', dest: path.join('.agents', 'rules', 'secops.md') },
    { src: 'agents-rules-sdd-orchestrator.md', dest: path.join('.agents', 'rules', 'sdd-orchestrator.md') },
    { src: 'canvas-planning-guide.md', dest: path.join('docs', 'funky-ai', 'cli', 'canvas-planning-guide.md') },
    { src: path.join('..', 'sdd', 'architecture-assessment.md'), dest: path.join('docs', 'architecture-assessment.md') },
    { src: path.join('..', 'sdd', 'rfc-template.md'), dest: path.join('openspec', 'rfcs', '000-TEMPLATE.md') },
    { src: 'TEMPLATE_GUIDE.md', dest: 'TEMPLATE_GUIDE.md' },
    { src: path.join('..', 'README.md'), dest: 'README.md' },
    { src: 'engram-discoveries.md', dest: path.join('docs', 'engram', 'discoveries.md') },
    { src: 'engram-bugfixes.md', dest: path.join('docs', 'engram', 'bugfix', 'bugfixes.md') },
    { src: 'architecture-assessment-guide.md', dest: path.join('docs', 'architecture-assessment-guide.md') },
    { src: 'agents-rules-secops-setup.md', dest: path.join('.agents', 'rules', 'secops-setup.md') }
  ];
```

#### Flujo de datos

1. `runInit()` recibe `templatesDir` → `path.join(__dirname, '../templates/bootstrap')`
2. Itera `filesToCopy` y genera intenciones `{ action: 'copy', src: path.join(templatesDir, file.src), dest: path.join(targetBase, file.dest) }`
3. Las nuevas intenciones se agregan al array `intentions`
4. `executeIntentions()` procesa las intenciones en orden. Los directorios engram (`docs/engram/bugfix/`) ya fueron creados por las intenciones `mkdir` previas.
5. Si el destino ya existe, `fs-adapter.js` salta la copia silenciosamente (incrementa `skippedCount`).

#### Casos borde

| Caso | Comportamiento |
|------|---------------|
| `docs/engram/` no existe al copiar `discoveries.md` | No ocurre: las intenciones `mkdir` de engramDirs se ejecutan antes que las de copia |
| `docs/architecture-assessment-guide.md` ya existe | `fs-adapter.js` salta silenciosamente |
| Ejecutar `funky init` por segunda vez | Todos los orphaned files existen → se saltean |
| `agents-rules-secops-setup.md` vs `agents-rules-secops.md` | Nombres diferentes, destinos diferentes, sin colisión |

#### Estrategia de tests

**Archivo: `funky-cli/tests/init.test.js`**

1. **Actualizar test existente** (línea 26): Cambiar `expect(copyIntentions).toHaveLength(9)` a `expect(copyIntentions).toHaveLength(13)`
2. **Actualizar/eliminar variable muerta** (línea 10): `const baseIntentionsCount = 9;` — esta variable no se usa en ningún test. Se debe actualizar a `13` o eliminar.
3. **Agregar nuevo test** "incluye los 4 archivos orphaned en las intenciones de copia":

```js
it('incluye los 4 archivos orphaned en las intenciones de copia', () => {
    const intentions = runInit({ templatesDir: fakeTemplatesDir, targetBase: fakeTargetDir });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'engram-discoveries.md'),
      dest: path.join(fakeTargetDir, 'docs', 'engram', 'discoveries.md')
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'engram-bugfixes.md'),
      dest: path.join(fakeTargetDir, 'docs', 'engram', 'bugfix', 'bugfixes.md')
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'architecture-assessment-guide.md'),
      dest: path.join(fakeTargetDir, 'docs', 'architecture-assessment-guide.md')
    });

    expect(intentions).toContainEqual({
      action: 'copy',
      src: path.join(fakeTemplatesDir, 'agents-rules-secops-setup.md'),
      dest: path.join(fakeTargetDir, '.agents', 'rules', 'secops-setup.md')
    });
  });
```

4. **Test de integración existente** (`init.integration.test.js`) — debe seguir pasando sin cambios. Verifica que los archivos se persistan correctamente.

---

## Ítem 2: Fix sync-templates.js

### Archivo: `funky-cli/scripts/sync-templates.js`

#### Cambios exactos

**Eliminar la línea 15 completa** del array `filesToSync`:

```js
// Línea a eliminar:
  { src: 'funky-cli/src/templates/sdd/worker-handoff.md', dest: 'plantilla-worker-handoff.md' },
```

#### Estado después del cambio

```js
const filesToSync = [
  { src: '.agents/rules/engram-protocol.md', dest: 'agents-rules-engram-protocol.md' },
  { src: '.agents/rules/secops.md', dest: 'agents-rules-secops.md' },
  { src: '.agents/rules/sdd-orchestrator.md', dest: 'agents-rules-sdd-orchestrator.md' },
  { src: 'docs/funky-ai/cli/canvas-planning-guide.md', dest: 'canvas-planning-guide.md' }
];
```

El array pasa de 5 a 4 elementos. No se requieren cambios de sintaxis (el elemento restante al final del array no lleva trailing comma y es válido en JS).

#### Flujo de datos

1. `sync-templates.js` se ejecuta manualmente o mediante script de build
2. Itera `filesToSync` con 4 entradas en lugar de 5
3. Ya no intenta copiar `worker-handoff.md` → no genera warning `⚠️ Warning: Source file not found: ...worker-handoff.md`
4. Los otros 4 archivos se copian sin cambios

#### Casos borde

| Caso | Comportamiento |
|------|---------------|
| `plantilla-worker-handoff.md` existe en destinos de proyectos previos | No se elimina — el script solo copia, no borra. Es aceptable (archivo huérfano inofensivo). |
| Nueva ejecución de sync en un proyecto limpio | Los 4 archivos restantes se copian correctamente. |

#### Estrategia de tests

No se requieren nuevos tests. El test de integración existente en `init.integration.test.js` (línea 41) ya valida que `worker-handoff.md` NO se copie — debe seguir pasando.

---

## Ítem 3: Mejores preguntas (canvas.js)

### Archivo: `funky-cli/src/utils/canvas.js`

#### Cambios exactos

Reemplazar TODO el contenido del archivo. El archivo actual (38 líneas) se reemplaza por una versión que:

1. Define un mapa de placeholders por sección para PROJECT-CANVAS (5 secciones)
2. Define un mapa de placeholders por sección para INFRA-CANVAS (4 secciones)
3. Conserva la misma firma de funciones: `generateProjectCanvasMarkdown(config = {})` y `generateInfraCanvasMarkdown(config = {})`
4. Conserva la misma lógica: si `config` tiene un valor, lo renderiza; si no, usa el placeholder específico
5. Incluye los marcadores `> 💡 *Si aplica*` del ítem 5

#### Contenido nuevo exacto

```js
const projectCanvasPlaceholders = {
  framework: `<!-- ¿Qué framework elegiste y por qué? ¿Qué necesidades resuelve (SSR, SPA, SSG)?
     Ej: Next.js (App Router) — Necesitamos SSR para SEO + performance en dashboard -->
[Responde aquí]`,
  pattern: `<!-- ¿Qué patrón organiza tu código? ¿Por qué este y no otro?
     Ej: Clean Architecture — El dominio es complejo y necesitamos separar capas -->
[Responde aquí]`,
  state: `<!-- ¿Cómo fluyen los datos en tu app? ¿Estado remoto, global, o local?
     Ej: React Query + Zustand — Datos de servidor con React Query, UI global con Zustand -->
[Responde aquí]`,
  styling: `> 💡 *Si aplica* — Solo si tu proyecto tiene una librería de UI o design system definido.
<!-- ¿Qué herramienta de estilos usas? ¿Por qué esta y no otra?
     Ej: Tailwind + shadcn/ui — Componentes headless con utility-first para desarrollo rápido -->
[Responde aquí]`,
  testing: `<!-- ¿Qué metodología y runner elegiste? ¿Qué nivel de cobertura esperas?
     Ej: Integration First con Vitest — Priorizamos flujos completos, cobertura >80% en crítico -->
[Responde aquí]`
};

const infraCanvasPlaceholders = {
  database: `<!-- ¿Qué base de datos y ORM elegiste? ¿Cómo impacta en latencia, escalabilidad y costo?
     Ej: PostgreSQL + Prisma — Necesitamos transacciones ACID y migrations con type safety -->
[Responde aquí]`,
  auth: `<!-- ¿Qué solución de auth elegiste? ¿Por qué esta y no otra?
     Ej: NextAuth.js — Necesitamos OAuth con Google y GitHub, sin gestión de contraseñas -->
[Responde aquí]`,
  linter: `<!-- ¿Qué herramientas de calidad de código usas? ¿Configuración estricta o flexible?
     Ej: Biome — Todo en una herramienta, config estricta para consistencia -->
[Responde aquí]`,
  deployment: `> 💡 *Si aplica* — Completa esta sección solo si tienes un deployment activo o pipeline de CI configurado.
<!-- ¿Dónde y cómo deployas? ¿Qué pipeline de CI usas?
     Ej: Vercel + GitHub Actions — Frontend en Vercel, CI con tests y lint en cada PR -->
[Responde aquí]`
};

export function generateProjectCanvasMarkdown(config = {}) {
  const f = (val, placeholder) => val || placeholder;
  return `# 🚀 PROJECT CANVAS

## 1. Framework Base
${f(config.framework, projectCanvasPlaceholders.framework)}

## 2. Patrón Arquitectónico
${f(config.pattern, projectCanvasPlaceholders.pattern)}

## 3. Gestión de Estado
${f(config.state, projectCanvasPlaceholders.state)}

## 4. Estrategia UI
${f(config.styling, projectCanvasPlaceholders.styling)}

## 5. Estrategia de Testing
${f(config.testing, projectCanvasPlaceholders.testing)}
`;
}

export function generateInfraCanvasMarkdown(config = {}) {
  const f = (val, placeholder) => val || placeholder;
  return `# 🏗️ INFRA CANVAS

## 1. Base de Datos / ORM
${f(config.database, infraCanvasPlaceholders.database)}

## 2. Autenticación
${f(config.auth, infraCanvasPlaceholders.auth)}

## 3. Linter / Formatter
${f(config.linter, infraCanvasPlaceholders.linter)}

## 4. Deployment & CI/CD
${f(config.deployment, infraCanvasPlaceholders.deployment)}
`;
}
```

#### Flujo de datos

1. `init.js` llama a `generateProjectCanvasMarkdown(projectData)` o `generateInfraCanvasMarkdown(infraData)`
2. Para cada sección, la función helper `f(val, placeholder)` evalúa: si `config[key]` tiene un valor truthy, lo usa; si no, usa el placeholder específico de esa sección
3. El placeholder incluye: comentario HTML con pregunta guía + ejemplo, y línea `[Responde aquí]`
4. Las secciones 4 de ambos canvases incluyen además el marcador `> 💡 *Si aplica*` antes del comentario HTML

#### Casos borde

| Caso | Comportamiento |
|------|---------------|
| Config vacía `{}` | Cada sección renderiza su placeholder específico (con pregunta guía, ejemplo y `[Responde aquí]`) |
| Config parcial `{ framework: 'Next.js' }` | Framework renderiza "Next.js", las otras secciones renderizan su placeholder |
| Config completa | Todas las secciones muestran los valores configurados |
| Valor vacío explícito `{ framework: '' }` | Se trata como falsy → se usa placeholder (mismo comportamiento que con `||`) |
| Español neutro | Todos los placeholders usan "tú" o formas impersonales, sin voseo ni rioplatense |
| Compatibilidad markdown | Los placeholders usan `<!-- comentarios HTML -->` y `[Responde aquí]` que son válidos en markdown |

#### Estrategia de tests

**Archivo: `funky-cli/tests/canvas.test.js`**

El test existente debe ACTUALIZARSE porque la línea 27 verifica `toContain('No definido / Pendiente')` — esto ya no será cierto.

1. **Actualizar test "debería usar placeholder específico para propiedades faltantes"** (líneas 22-28):

```js
it('debería usar placeholder específico para propiedades faltantes', () => {
    const config = { pattern: 'MVC' };
    const markdown = generateProjectCanvasMarkdown(config);

    expect(markdown).toContain('MVC');
    expect(markdown).not.toContain('No definido / Pendiente');
    expect(markdown).toContain('¿Qué framework elegiste');
    expect(markdown).toContain('[Responde aquí]');
  });
```

2. **Agregar test "cada sección de PROJECT-CANVAS tiene un placeholder diferente":**

```js
it('cada sección de PROJECT-CANVAS tiene un placeholder diferente', () => {
    const markdown = generateProjectCanvasMarkdown({});

    expect(markdown).toContain('¿Qué framework elegiste');
    expect(markdown).toContain('¿Qué patrón organiza');
    expect(markdown).toContain('¿Cómo fluyen los datos');
    expect(markdown).toContain('¿Qué herramienta de estilos');
    expect(markdown).toContain('¿Qué metodología y runner');
  });
```

3. **Agregar test "generateInfraCanvasMarkdown({}) no contiene No definido":**

```js
it('generateInfraCanvasMarkdown({}) no contiene "No definido"', () => {
    const markdown = generateInfraCanvasMarkdown({});
    expect(markdown).not.toContain('No definido');
  });
```

4. **Agregar test para markers condicionales (ítem 5 aplicado aquí):**

```js
it('PROJECT-CANVAS incluye marcador condicional en Estrategia UI', () => {
    const markdown = generateProjectCanvasMarkdown({});
    expect(markdown).toContain('> 💡 *Si aplica*');
    expect(markdown.indexOf('> 💡 *Si aplica*')).toBeGreaterThan(markdown.indexOf('Estrategia UI'));
  });

  it('INFRA-CANVAS incluye marcador condicional en Deployment', () => {
    const markdown = generateInfraCanvasMarkdown({});
    expect(markdown).toContain('> 💡 *Si aplica*');
    expect(markdown.indexOf('> 💡 *Si aplica*')).toBeGreaterThan(markdown.indexOf('Deployment'));
  });
```

---

## Ítem 4: Architect Notes (canvas-planning-guide.md)

### Archivo: `funky-cli/src/templates/bootstrap/canvas-planning-guide.md`

#### Cambios exactos

Agregar una línea `🏛️ *Nota del arquitecto:*` al final de cada una de las 9 categorías. Las notas se insertan después del último `- **` item de cada categoría, precedidas por un salto de línea.

**Detalle de inserciones:**

| Categoría | Insertar después de... | Texto a agregar |
|-----------|----------------------|-----------------|
| **Framework Base** (línea 14) | `- **NestJS / Express:** Si estás inicializando un canvas estrictamente para Backend.` | `\n\n🏛️ *Nota del arquitecto:* Next.js es ideal para proyectos con SEO y SSR, pero es overkill para dashboards internos o apps sin contenido público. Astro rinde mejor para sitios estáticos o con poco dinamismo. NestJS/Express tiene sentido solo si el backend es sustancialmente más complejo que el frontend.` |
| **Patrón Arquitectónico** (línea 21) | `- **Screaming Architecture:** La estructura grita la intención del negocio, no las herramientas tecnológicas.` | `\n\n🏛️ *Nota del arquitecto:* Clean Architecture brilla en dominios complejos, pero añade ceremonia. Para CRUDs simples o MVPs, Modular/FSD da mejor velocidad inicial sin deuda técnica significativa. Screaming Architecture es excelente para dominios ricos en lógica de negocio, pero confunde si el proyecto es pequeño.` |
| **Gestión de Estado** (línea 29) | `- **Ninguno:** Todo viaja por props, Context nativo o Server Components.` | `\n\n🏛️ *Nota del arquitecto:* No agregues una librería de estado global hasta que tengas dos componentes no-hermanos que necesiten el mismo dato. Muchas apps viven felices con props + Server Components. Redux Toolkit solo si el flujo de estado es hiper-complejo o legacy.` |
| **Estrategia UI** (línea 35) | `- **Design System Propio:** Librería de componentes interna preexistente.` | `\n\n🏛️ *Nota del arquitecto:* Design System propio tiene sentido si mantienes múltiples productos con la misma marca. Para proyectos únicos, Tailwind + shadcn/ui da 80% del valor con 10% del esfuerzo. CSS Modules es ideal si el equipo ya viene de esa cultura.` |
| **Estrategia de Testing** (línea 46) | `- **Playwright / Cypress:** Pruebas End-to-End (E2E) simulando usuario real.` | `\n\n🏛️ *Nota del arquitecto:* TDD no es obligatorio. Muchos equipos exitosos usan Integration First: escriben integraciones primero, unitarias después. La cobertura del 80% es una guía, no una regla. Playwright para E2E solo si hay flujos críticos multi-paso.` |
| **Base de Datos / ORM** (línea 56) | `- **Supabase / Firebase:** Backend-as-a-Service, base de datos con APIs autogeneradas.` | `\n\n🏛️ *Nota del arquitecto:* SQLite es sorprendentemente capaz para equipos pequeños (<5 devs) y apps monousuario. No lo descartes por "no ser enterprise" — muchas apps SaaS viven felices con SQLite + backups. MongoDB es tentador pero piensa dos veces si necesitas transacciones.` |
| **Autenticación** (línea 62) | `- **JWT Custom:** Manejo de tokens y cookies a mano contra un backend propio.` | `\n\n🏛️ *Nota del arquitecto:* Auth.js (NextAuth) es la mejor opción open-source para React/Next, pero si tu app es solo backend, JWT Custom con refresh tokens da más control. Clerk es excelente si el presupuesto lo permite y no quieres gestionar auth.` |
| **Linter / Formatter** (línea 67) | `- **TypeScript Strict:** Obligatorio activar \`"strict": true\` en el \`tsconfig.json\`.` | `\n\n🏛️ *Nota del arquitecto:* Biome reemplaza ESLint + Prettier con una sola herramienta y es órdenes de magnitud más rápido. Migrar de ESLint a Biome es de bajo riesgo si el equipo está abierto al cambio. TypeScript strict debería ser no-negociable.` |
| **Deployment & CI/CD** (línea 73) | `- **Contenedores:** Dockerfile obligatorio para ambientes reproducibles.` | `\n\n🏛️ *Nota del arquitecto:* Un Junior + K8s es una receta para el desastre operativo. Si el equipo no tiene DevOps dedicado, usa PaaS (Vercel, Railway, Render). GitHub Actions es suficiente para CI/CD el 90% de los casos — no necesitas GitLab CI a menos que ya estés en GitLab.` |

#### Nota sobre implementación

Cada inserción agrega ~2 líneas a la categoría correspondiente. El archivo pasa de 73 líneas a ~105 líneas. Las notas se insertan AL FINAL de cada categoría, después de los items existentes. No se modifica ni se reordena el contenido existente.

#### Estrategia de tests

No se requieren tests automatizados. Verificación manual del contenido generado.

---

## Ítem 5: Pull not push

### Archivo 1: `funky-cli/src/utils/canvas.js`

Los marcadores `> 💡 *Si aplica*` ya están incluidos en los placeholders de canvas.js (ver ítem 3). Específicamente:

- **PROJECT-CANVAS, sección 4 (Estrategia UI):** El placeholder `styling` incluye `> 💡 *Si aplica* — Solo si tu proyecto tiene una librería de UI o design system definido.`
- **INFRA-CANVAS, sección 4 (Deployment & CI/CD):** El placeholder `deployment` incluye `> 💡 *Si aplica* — Completa esta sección solo si tienes un deployment activo o pipeline de CI configurado.`

Estos marcadores son parte fija del template, no dependen de si hay valor configurado o no. El desarrollador decide si aplica.

### Archivo 2: `funky-cli/src/templates/bootstrap/canvas-planning-guide.md`

#### Cambios exactos

**Insertar marcador condicional en la sub-sección "Runner" de Testing.**

Después de la línea 42 (`- **Smoke Testing / Happy Path:** Solo cobertura de caminos críticos.`), ANTES de la línea 43 (`- **Runner:**`), insertar:

```markdown
> 💡 *Si aplica* — El runner depende de la metodología de testing que definiste arriba. Si aún no lo sabes, puedes saltar esta sección.
```

#### Estado después del cambio (sección Testing, líneas 38-47):

```markdown
### 5. Estrategia de Testing
*Define la confianza del código.*
- **Metodología:**
  - **TDD Estricto:** Test primero, código después.
  - **Integration First:** Priorizar tests de flujos completos por sobre unitarios puros.
  - **Smoke Testing / Happy Path:** Solo cobertura de caminos críticos.
> 💡 *Si aplica* — El runner depende de la metodología de testing que definiste arriba. Si aún no lo sabes, puedes saltar esta sección.
- **Runner:**
  - **Vitest:** El estándar actual (rápido, nativo ESM).
  - **Jest:** Para bases de código legacy.
  - **Playwright / Cypress:** Pruebas End-to-End (E2E) simulando usuario real.
```

#### Estrategia de tests

Para canvas.js: incluido en los tests del ítem 3 (ver tests 4 y 5 en esa sección).

Para la guía: verificación manual.

---

## Ítem 6: LLM-driven compatibility analysis

### Archivo: `funky-cli/src/templates/bootstrap/canvas-planning-guide.md`

#### Cambios exactos

**Agregar sección completa al final del archivo** (después de la línea 73, que es la última línea actual).

#### Contenido nuevo exacto

```markdown

---

## 🔍 Análisis de Compatibilidad (para el agente IA)

*Esta sección contiene instrucciones para que el agente de IA analice los canvases completados. No es para el desarrollador.*

Cuando el equipo haya completado PROJECT-CANVAS.md e INFRA-CANVAS.md, el agente IA debe:

1. Leer ambas secciones de "Decisión y Rationale" y extraer el stack elegido.
2. Identificar combinaciones problemáticas conocidas:
   - Framework + Auth (ej: sitio estático + NextAuth requiere API route)
   - Base de datos + Escala (ej: SQLite + alto throughput)
   - Patrón + Stack (ej: Clean Architecture + bundle mínimo)
   - Senioridad del equipo + Complejidad operacional (ej: Junior + K8s)
   - Base de datos + Tipo de app (ej: MongoDB + transacciones financieras)
3. Evaluar cada par de decisiones y documentar:
   - Si son compatibles sin observaciones
   - Si tienen trade-offs conocidos (con sugerencia de mitigación)
   - Si son incompatibles (con sugerencia de alternativa viable)
4. Generar una sección "Riesgos Detectados" con los hallazgos, priorizados por impacto.

> **Nota:** Este análisis es el punto de partida. A medida que el equipo use el sistema, surgirán nuevos patrones de incompatibilidad que documentar. No intentes cubrir todos los casos ahora.
```

#### Flujo de datos

1. El archivo `canvas-planning-guide.md` se copia al proyecto destino durante `runInit()` o `--template`
2. El equipo completa PROJECT-CANVAS.md e INFRA-CANVAS.md
3. El agente LLM (orquestador) lee la sección "🔍 Análisis de Compatibilidad"
4. Sigue los 4 pasos: leer canvases → identificar patrones → evaluar cada par → generar riesgos
5. Produce un análisis en la conversación o en un documento aparte

No hay código en el CLI que ejecute este análisis. Es una instrucción para el agente LLM.

#### Estrategia de tests

No se requieren tests automatizados. Verificación manual del contenido markdown.

---

## Ítem 7: Deprecar setup inicial

### Archivo 1: `funky-cli/src/commands/init.js`

Este es el cambio más invasivo. Se modifican 4 áreas del archivo:

#### Cambio A: Eliminar import de `@clack/prompts`

**Eliminar línea 5:**
```js
import * as p from '@clack/prompts';
```

#### Cambio B: Eliminar función `getProtocolOptions()`

**Eliminar líneas 90-101 completas:**
```js
/**
 * Lee los templates de protocolos disponibles en el CLI y genera opciones para el prompt.
 * @returns {{ value: string, label: string }[]}
 */
function getProtocolOptions() {
  const protocolsDir = path.join(__dirname, '../templates/protocols');
  if (!fs.existsSync(protocolsDir)) return [];
  return fs
    .readdirSync(protocolsDir)
    .filter(f => f.endsWith('.md') && f !== 'index.md')
    .map(f => ({ value: f, label: f.replace('.md', '') }));
}
```

#### Cambio C: Reemplazar el bloque `else` interactivo

**Reemplazar las líneas 151-297** (el bloque `else` que contiene los prompts interactivos) por:

```js
      } else {
        console.error('❌ No se encontraron PROJECT-CANVAS.md ni INFRA-CANVAS.md.');
        console.error('Ejecuta `funky init --template` para generarlos.');
        process.exit(1);
      }
```

#### Cambio D: Conservar lo demás sin cambios

Las siguientes líneas NO se modifican:
- Líneas 1-4: imports de `commander`, `fs`, `path`, `fileURLToPath` (se mantienen)
- Líneas 6-7: imports de `canvas.js` y `fs-adapter.js` (se mantienen)
- Líneas 9-88: función `runInit()` CON las nuevas entradas orphaned (se mantiene con cambios del ítem 1)
- Líneas 103-106: declaración del comando `init` y option `--template` (se mantienen)
- Líneas 107-136: bloque `if (options.template)` (se mantiene sin cambios)
- Líneas 138-141: declaraciones `let canvasConfig = null; let selectedProtocols = []; let environment = 'ide';` (se mantienen)
- Líneas 142-150: bloques `if (hasProjectCanvas && hasInfraCanvas)` y `else if (hasProjectCanvas && !hasInfraCanvas)` (se mantienen sin cambios)
- Líneas 299-310: ejecución de intenciones y catch (se mantienen)

#### Estado después del cambio (archivo init.js completo)

```js
import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateProjectCanvasMarkdown, generateInfraCanvasMarkdown } from '../utils/canvas.js';
import { executeIntentions } from '../utils/fs-adapter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function runInit({ templatesDir, targetBase, canvasConfig, selectedProtocols = [] }) {
  const intentions = [];

  const filesToCopy = [
    { src: 'ORCHESTRATOR-STATE.md', dest: 'ORCHESTRATOR-STATE.md' },
    { src: 'agents-rules-engram-protocol.md', dest: path.join('.agents', 'rules', 'engram-protocol.md') },
    { src: 'agents-rules-secops.md', dest: path.join('.agents', 'rules', 'secops.md') },
    { src: 'agents-rules-sdd-orchestrator.md', dest: path.join('.agents', 'rules', 'sdd-orchestrator.md') },
    { src: 'canvas-planning-guide.md', dest: path.join('docs', 'funky-ai', 'cli', 'canvas-planning-guide.md') },
    { src: path.join('..', 'sdd', 'architecture-assessment.md'), dest: path.join('docs', 'architecture-assessment.md') },
    { src: path.join('..', 'sdd', 'rfc-template.md'), dest: path.join('openspec', 'rfcs', '000-TEMPLATE.md') },
    { src: 'TEMPLATE_GUIDE.md', dest: 'TEMPLATE_GUIDE.md' },
    { src: path.join('..', 'README.md'), dest: 'README.md' },
    { src: 'engram-discoveries.md', dest: path.join('docs', 'engram', 'discoveries.md') },
    { src: 'engram-bugfixes.md', dest: path.join('docs', 'engram', 'bugfix', 'bugfixes.md') },
    { src: 'architecture-assessment-guide.md', dest: path.join('docs', 'architecture-assessment-guide.md') },
    { src: 'agents-rules-secops-setup.md', dest: path.join('.agents', 'rules', 'secops-setup.md') }
  ];

  for (const file of filesToCopy) {
    const sourcePath = path.join(templatesDir, file.src);
    const destPath = path.join(targetBase, file.dest);
    intentions.push({ action: 'copy', src: sourcePath, dest: destPath });
  }

  const engramDirs = ['architecture', 'pattern', 'discovery', 'decision', 'bugfix', 'session', 'release'];
  for (const dir of engramDirs) {
    const dirPath = path.join(targetBase, 'docs', 'engram', dir);
    intentions.push({ action: 'mkdir', dest: dirPath });
  }

  const engramIndexDest = path.join(targetBase, 'docs', 'engram', 'index.md');
  const engramIndexContent = '# Engram Index\n\nDirectorio unificado de conocimientos, decisiones y patrones.\n\n## Architecture\n\n## Pattern\n\n## Discovery\n\n## Decision\n\n## Bugfix\n\n## Session\n\n## Release\n';
  intentions.push({ action: 'create', dest: engramIndexDest, content: engramIndexContent });

  if (canvasConfig) {
    if (!canvasConfig.skipProjectCanvas) {
      const markdown = generateProjectCanvasMarkdown(canvasConfig.projectData || {});
      const canvasPath = path.join(targetBase, 'PROJECT-CANVAS.md');
      intentions.push({ action: 'create', dest: canvasPath, content: markdown });
    }

    if (!canvasConfig.skipInfraCanvas) {
      const markdown = generateInfraCanvasMarkdown(canvasConfig.infraData || {});
      const canvasPath = path.join(targetBase, 'INFRA-CANVAS.md');
      intentions.push({ action: 'create', dest: canvasPath, content: markdown });
    }
  }

  if (selectedProtocols && selectedProtocols.length > 0) {
    const protocolsSrcDir = path.join(templatesDir, '..', 'protocols');
    const protocolsDestDir = path.join(targetBase, '.agents', 'protocols');

    for (const protocolFile of selectedProtocols) {
      const srcPath = path.join(protocolsSrcDir, protocolFile);
      const destPath = path.join(protocolsDestDir, protocolFile);
      intentions.push({ action: 'copy', src: srcPath, dest: destPath });
    }

    const indexDestPath = path.join(protocolsDestDir, 'index.md');
    const indexSrcPath = path.join(protocolsSrcDir, 'index.md');
    intentions.push({ action: 'copy', src: indexSrcPath, dest: indexDestPath });
  }

  return intentions;
}

export const initCommand = new Command('init')
  .description('Inicializa el repositorio creando la estructura base del ecosistema Funky AI')
  .option('-t, --template', 'Genera templates vacíos de PROJECT-CANVAS.md e INFRA-CANVAS.md para inicialización Headless')
  .action(async (options) => {
    const templatesDir = path.join(__dirname, '../templates/bootstrap');
    const targetBase = process.cwd();

    const projectCanvasPath = path.join(targetBase, 'PROJECT-CANVAS.md');
    const infraCanvasPath = path.join(targetBase, 'INFRA-CANVAS.md');

    const hasProjectCanvas = fs.existsSync(projectCanvasPath);
    const hasInfraCanvas = fs.existsSync(infraCanvasPath);

    if (options.template) {
      try {
        if (hasProjectCanvas || hasInfraCanvas) {
          console.error('❌ Error: Ya existe PROJECT-CANVAS.md o INFRA-CANVAS.md en el directorio.');
          process.exit(1);
        }
        fs.writeFileSync(projectCanvasPath, generateProjectCanvasMarkdown({}));
        fs.writeFileSync(infraCanvasPath, generateInfraCanvasMarkdown({}));
        const guideSrc = path.join(templatesDir, 'canvas-planning-guide.md');
        const guideDest = path.join(targetBase, 'canvas-planning-guide.md');
        if (!fs.existsSync(guideDest)) {
          fs.copyFileSync(guideSrc, guideDest);
          console.log('✅ canvas-planning-guide.md copiado. Úsala como referencia para llenar los Canvas.');
        }
        console.log('✅ Templates generados. Llénalos y vuelve a ejecutar `funky init`.');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error al generar los templates:', error.message);
        process.exit(1);
      }
    }

    let canvasConfig = null;
    let selectedProtocols = [];
    let environment = 'ide';

    try {
      if (hasProjectCanvas && hasInfraCanvas) {
        console.log('📄 Ambos Canvas detectados, inicializando en modo Headless...');
        canvasConfig = { skipProjectCanvas: true, skipInfraCanvas: true, projectData: {}, infraData: {} };
      } else if (hasProjectCanvas && !hasInfraCanvas) {
        console.log('📄 PROJECT-CANVAS.md detectado, pero falta INFRA-CANVAS.md.');
        console.log('⚠️ MIGRACIÓN PENDIENTE: Generando INFRA-CANVAS.md con warning para v1.7.0 Legacy.');
        fs.writeFileSync(infraCanvasPath, `> ⚠️ **MIGRACIÓN PENDIENTE**\n\n${generateInfraCanvasMarkdown({})}`);
        canvasConfig = { skipProjectCanvas: true, skipInfraCanvas: true, projectData: {}, infraData: {}, migratingLegacy: true };
      } else {
        console.error('❌ No se encontraron PROJECT-CANVAS.md ni INFRA-CANVAS.md.');
        console.error('Ejecuta `funky init --template` para generarlos.');
        process.exit(1);
      }

      const intentions = runInit({ templatesDir, targetBase, canvasConfig, selectedProtocols });

      console.log('🚀 Inicializando Funky AI...');
      const { created, skipped, logs } = executeIntentions(intentions);
      for (const log of logs) {
        console.log(log);
      }
      console.log(`\n✅ Funky AI inicializado. ${created} archivos creados, ${skipped} ya existían.`);
    } catch (error) {
      console.error('❌ Error al inicializar Funky AI:', error.message);
      process.exit(1);
    }
  });
```

#### Nota sobre `environment` y `selectedProtocols`

La variable `environment` (línea 140) se declara como `let environment = 'ide';` pero no se usa en ningún lugar después de la eliminación del modo interactivo. Es código muerto. Se conserva para minimizar cambios, pero puede eliminarse en una limpieza futura.

La variable `selectedProtocols` se inicializa como `[]` y nunca se modifica (el selector de protocolos estaba en el modo interactivo eliminado). El bloque `if (selectedProtocols && selectedProtocols.length > 0)` en `runInit()` no se ejecutará nunca. Esto es correcto y no requiere cambios.

### Archivo 2: `funky-cli/README.md`

#### Cambios exactos

**Actualizar línea 25** (fila de `funky init` en la tabla de comandos):

De:
```
| `funky init` | Inicia el ecosistema Funky AI en el directorio actual. Si no existen Canvas, ejecuta un wizard de setup inicial con `@clack/prompts` para definir el stack. Si ya existen Canvas, activa modo Headless y copia la estructura completa. | `funky init` -> "🚀 Funky Ecosystem inicializado!" |
```

A:
```
| `funky init` | Inicializa el ecosistema Funky AI en el directorio actual. Si no existen Canvas, muestra un mensaje indicando usar `funky init --template`. Si ya existen Canvas, activa modo Headless y copia la estructura completa. | `funky init --template` -> genera canvases vacíos |
```

### Archivo 3: `funky-cli/src/templates/bootstrap/TEMPLATE_GUIDE.md`

#### Cambios exactos

**Sin cambios requeridos.** Después de revisar el contenido completo de `TEMPLATE_GUIDE.md`, no contiene ninguna referencia al modo interactivo, setup wizard, o prompts. El documento describe el flujo de customización post-inicialización y progressive disclosure, que sigue siendo válido.

### Archivo 4: `funky-cli/tests/init.test.js`

#### Cambios exactos

**Sin cambios en la lógica de tests existentes.** Ninguno de los tests actuales en `init.test.js` depende del modo interactivo — todos prueban `runInit()` que es independiente. Los tests deben seguir pasando sin modificaciones.

Sin embargo, se deben agregar los tests del ítem 1 (orphaned files) y actualizar la cuenta de `copyIntentions` de 9 a 13.

### Archivo 5: `funky-cli/package.json`

**Sin cambios.** La dependencia `@clack/prompts` NO se elimina porque `feature.js` la usa. La dependencia `@inquirer/prompts` (si existe) NO se elimina porque `estimate.js` y `engram.js` la usan.

### Flujo de datos después del cambio

```
funky init (sin flags)
  │
  ├── ¿Existen PROJECT-CANVAS.md e INFRA-CANVAS.md?
  │   ├── SÍ → modo Headless → runInit() → executeIntentions()
  │   └── NO → mensaje de error → process.exit(1)
  │
funky init --template
  │
  ├── ¿Ya existen canvases?
  │   ├── SÍ → error: ya existen
  │   └── NO → genera canvases vacíos + copia canvas-planning-guide.md
```

### Casos borde

| Caso | Comportamiento |
|------|---------------|
| `funky init` en directorio vacío | Muestra mensaje: "Ejecuta `funky init --template` para generarlos." y termina con exit code 1 |
| `funky init` con ambos canvases existentes | Modo Headless: `runInit()` ejecuta intenciones normalmente |
| `funky init` con solo PROJECT-CANVAS (migración) | Modo migración: genera INFRA-CANVAS con warning y ejecuta headless |
| `funky init --template` en directorio vacío | Genera canvases + guía (sin cambios en este flujo) |
| `funky init --template` con canvases existentes | Error: ya existen, termina con exit code 1 (sin cambios) |
| Scripts externos que usaban modo interactivo | Dejarán de funcionar. El mensaje de error es claro para que el usuario use `--template` |

### Estrategia de tests

1. **Tests existentes en `init.test.js`:** Deben pasar sin cambios (con la actualización de count de 9→13). Verificar que `runInit()` sigue generando las intenciones correctas.
2. **Tests existentes en `init.integration.test.js`:** Deben pasar sin cambios.
3. **No se requieren nuevos tests** para el mensaje de error (es comportamiento de salida estándar).

---

## Resumen de cambios por archivo

| Archivo | Ítems | Cambio específico |
|---------|-------|-------------------|
| `funky-cli/src/commands/init.js` | 1, 7 | **Item 1:** Agregar 4 entradas a `filesToCopy` (líneas 36-39 nuevas). **Item 7:** Eliminar `import * as p from '@clack/prompts'` (línea 5), eliminar `getProtocolOptions()` (líneas 90-101), reemplazar bloque `else` interactivo (líneas 151-297) por mensaje de error + `process.exit(1)` |
| `funky-cli/scripts/sync-templates.js` | 2 | Eliminar línea 15 completa del array `filesToSync` |
| `funky-cli/src/utils/canvas.js` | 3, 5 | Reemplazar archivo completo (38 líneas → ~85 líneas). Nuevos placeholders por sección con preguntas guía, ejemplos, `[Responde aquí]`, y marcadores `> 💡 *Si aplica*` en secciones 4 |
| `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | 4, 5, 6 | **Item 4:** Agregar 9 notas del arquitecto (1 por categoría). **Item 5:** Agregar marcador condicional en Runner de Testing. **Item 6:** Agregar sección "🔍 Análisis de Compatibilidad (para el agente IA)" al final |
| `funky-cli/README.md` | 7 | Actualizar descripción de `funky init` en tabla de comandos (línea 25) |
| `funky-cli/src/templates/bootstrap/TEMPLATE_GUIDE.md` | 7 | Sin cambios (no contiene referencias al modo interactivo) |
| `funky-cli/tests/init.test.js` | 1, 7 | **Item 1:** Cambiar `copyIntentions` de 9 a 13. Agregar test para 4 orphaned files. **Item 7:** Sin cambios en tests existentes |
| `funky-cli/tests/canvas.test.js` | 3, 5 | Actualizar test de placeholder (ya no contiene "No definido / Pendiente"). Agregar tests para placeholders específicos, markers condicionales, y valores configurados |
| `funky-cli/package.json` | 7 (ninguno) | Sin cambios. `@clack/prompts` sigue siendo usado por `feature.js` |

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| **Item 7:** Eliminar modo interactivo rompe flujo si hay scripts que dependen de él | Baja | Alto | Verificar que no hay scripts externos. Hacerlo al último. El mensaje de error es claro. |
| **Item 1:** Orphaned files ya existen en proyectos previos | Alta | Bajo | `fs-adapter.js` saltea destinos existentes. Sin impacto. |
| **Item 3/5:** Tests existentes en `canvas.test.js` fallan porque verificaban "No definido / Pendiente" | Alta | Medio | Actualizar tests explícitamente en el diseño. El test existente debe modificarse para verificar placeholders específicos en lugar del texto genérico. |
| **Item 4:** Archivo canvas-planning-guide.md se alarga ~30 líneas | Baja | Bajo | Cada nota es de 1-2 líneas. El archivo final (~105 líneas) sigue siendo manejable. |
| **Item 6:** Instrucciones LLM demasiado genéricas | Media | Bajo | Se incluyen ejemplos concretos de combinaciones problemáticas. |
| **Item 7:** Variable `environment` queda como código muerto en init.js | Baja | Bajo | No causa error. Puede eliminarse en limpieza futura. |
| **Item 7:** `selectedProtocols` siempre vacío después del cambio | Baja | Bajo | El bloque de copia de protocolos en `runInit()` verifica `length > 0` y no ejecuta nada si está vacío. Comportamiento correcto. |

---

## Orden de implementación

```
1. Fix orphaned files      ──► init.js (agregar 4 entradas a filesToCopy)
2. Fix sync-templates.js   ──► sync-templates.js (eliminar línea 15)
3. Mejores preguntas       ──► canvas.js (nuevos placeholders + markers)
4. Architect Notes         ──► canvas-planning-guide.md (notas por categoría)
5. Pull not push           ──► canvas.js + canvas-planning-guide.md (markers faltantes)
6. LLM-driven analysis     ──► canvas-planning-guide.md (sección final)
7. Deprecar setup inicial  ──► init.js + README.md (último paso)
```

**Nota:** Los ítems 3 y 5 pueden combinarse en un solo commit porque ambos modifican `canvas.js`. Los ítems 4, 5 y 6 pueden combinarse en un solo commit porque modifican `canvas-planning-guide.md`.

**Nota sobre tests:** Los tests se actualizan junto con cada ítem:
- Ítem 1 → actualizar `init.test.js` (copy count + nuevo test)
- Ítems 3+5 → actualizar `canvas.test.js` (placeholder + markers)
- Ítem 7 → verificar que tests existentes pasan sin cambios

---

## Historial

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 2026-07-28 | 1.0 | Versión inicial del diseño |
