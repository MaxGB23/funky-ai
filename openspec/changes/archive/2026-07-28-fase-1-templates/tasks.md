# Tasks: Fase 1 — Templates (funky init --template)

> **Change:** `fase-1-templates`
> **Estado:** Tasks
> **Fecha:** 2026-07-28
> **Precedido por:** [Design](./design.md), [Spec](./spec.md)

---

## Resumen ejecutivo

El cambio se divide en **5 tareas implementables de forma independiente**, ordenadas por dependencias. Las tareas 1-2 son limpieza de bajo riesgo. Las tareas 3-4 son contenido pedagógico en canvas.js y canvas-planning-guide.md (pueden ejecutarse en paralelo). La tarea 5 (deprecación del modo setup inicial) se ejecuta al último y tiene el riesgo más alto.

**Total estimado de líneas cambiadas:** ~425 (adiciones + eliminaciones), ligeramente por encima del límite de 400. Ver [Review Workload Forecast](#review-workload-forecast) para recomendación.

---

## Tarea 1: Archivos huérfanos (Item 1)

### Dependencias
- Ninguna. Es independiente.

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `funky-cli/src/commands/init.js` | Agregar 4 entradas al array `filesToCopy` en `runInit()` |
| `funky-cli/tests/init.test.js` | Actualizar conteo de 9→13 + agregar test para los 4 archivos |

### Cambios exactos

#### init.js — 4 entradas nuevas en `filesToCopy`

Después de la línea 35 (`{ src: path.join('..', 'README.md'), dest: 'README.md' }`), antes del cierre `];` (línea 36), insertar:

```js
    { src: 'engram-discoveries.md', dest: path.join('docs', 'engram', 'discoveries.md') },
    { src: 'engram-bugfixes.md', dest: path.join('docs', 'engram', 'bugfix', 'bugfixes.md') },
    { src: 'architecture-assessment-guide.md', dest: path.join('docs', 'architecture-assessment-guide.md') },
    { src: 'agents-rules-secops-setup.md', dest: path.join('.agents', 'rules', 'secops-setup.md') },
```

#### init.test.js — 3 cambios

1. **Línea 10**: Actualizar `const baseIntentionsCount = 9;` a `const baseIntentionsCount = 13;` (o eliminar la variable si no se usa en ningún test — verificar primero).
2. **Línea 26**: Cambiar `expect(copyIntentions).toHaveLength(9)` a `expect(copyIntentions).toHaveLength(13)`.
3. **Agregar nuevo test** al final del bloque `describe('runInit()', ...)`:

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

### Estado final esperado
- `filesToCopy` pasa de 9 a 13 elementos.
- `copyIntentions` retorna 13 en lugar de 9.
- Los 4 archivos orphaned aparecen en las intenciones con rutas correctas.
- El test `init.integration.test.js` (existente) sigue pasando sin cambios.

### Comandos de test
```bash
npx vitest run tests/init.test.js
npx vitest run tests/init.integration.test.js
```

### Rollback boundary
Revertir las 4 líneas en `filesToCopy` y los 3 cambios en `init.test.js`. No afecta a ningún otro archivo.

### Líneas estimadas
- init.js: +4 líneas
- init.test.js: +25 líneas, +1 línea modificada
- **Total: ~30 líneas (adiciones)**

---

## Tarea 2: Limpiar sync-templates.js (Item 2)

### Dependencias
- Ninguna. Es independiente.

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `funky-cli/scripts/sync-templates.js` | Eliminar línea 15 del array `filesToSync` |

### Cambios exactos

**Eliminar la línea 15 completa** del array `filesToSync`:

```js
  // Línea a eliminar:
  { src: 'funky-cli/src/templates/sdd/worker-handoff.md', dest: 'plantilla-worker-handoff.md' },
```

Después de la eliminación, el array queda:

```js
const filesToSync = [
  { src: '.agents/rules/engram-protocol.md', dest: 'agents-rules-engram-protocol.md' },
  { src: '.agents/rules/secops.md', dest: 'agents-rules-secops.md' },
  { src: '.agents/rules/sdd-orchestrator.md', dest: 'agents-rules-sdd-orchestrator.md' },
  { src: 'docs/funky-ai/cli/canvas-planning-guide.md', dest: 'canvas-planning-guide.md' }
];
```

### Estado final esperado
- `filesToSync` pasa de 5 a 4 elementos.
- El script se ejecuta sin warnings.
- El test de integración `init.integration.test.js` (línea 41) ya valida que `worker-handoff.md` NO se copie — debe seguir pasando.

### Comandos de test
```bash
node scripts/sync-templates.js
npx vitest run tests/init.integration.test.js
```

### Rollback boundary
Revertir la eliminación de la línea 15 en `sync-templates.js`. Solo afecta ese archivo.

### Líneas estimadas
- sync-templates.js: -1 línea
- **Total: ~1 línea (eliminación)**

---

## Tarea 3: Mejores preguntas en canvas.js (Items 3 + 5 para canvas.js)

### Dependencias
- Ninguna. Puede ejecutarse en paralelo con las tareas 2, 4.

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `funky-cli/src/utils/canvas.js` | Reemplazar contenido completo de 38 líneas por ~85 líneas con placeholders específicos |
| `funky-cli/tests/canvas.test.js` | Actualizar test existente + agregar 4 nuevos tests |

### Cambios exactos

#### canvas.js — Reemplazar TODO el contenido

El archivo completo se reemplaza por:

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

#### canvas.test.js — 4 cambios

1. **Actualizar test existente** (líneas 22-28: "debería usar 'No definido / Pendiente'..."):

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

3. **Agregar test "generateInfraCanvasMarkdown({}) no contiene 'No definido'":**

```js
it('generateInfraCanvasMarkdown({}) no contiene "No definido"', () => {
    const markdown = generateInfraCanvasMarkdown({});
    expect(markdown).not.toContain('No definido');
  });
```

4. **Agregar tests para marcadores condicionales (Item 5 aplicado aquí):**

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

### Estado final esperado
- `generateProjectCanvasMarkdown({})` genera placeholders específicos por sección con preguntas guía, ejemplos y `[Responde aquí]`.
- `generateInfraCanvasMarkdown({})` genera placeholders específicos por sección.
- Las secciones 4 de ambos canvases (Estrategia UI, Deployment) incluyen `> 💡 *Si aplica*`.
- Ningún output contiene "No definido / Pendiente".
- Valores configurados se renderizan correctamente.
- Los 5 tests nuevos + 2 tests existentes actualizados pasan.

### Comandos de test
```bash
npx vitest run tests/canvas.test.js
npx vitest run tests/init.test.js
```

### Rollback boundary
Revertir `canvas.js` al contenido original (38 líneas) y `canvas.test.js` a su versión anterior. No afecta a otros archivos (init.js no cambia).

### Líneas estimadas
- canvas.js: +85 líneas, -38 líneas = 123 líneas cambiadas
- canvas.test.js: +55 líneas, -5 líneas = 60 líneas cambiadas
- **Total: ~183 líneas (adiciones + eliminaciones)**

---

## Tarea 4: Contenido pedagógico en canvas-planning-guide.md (Items 4 + 5 + 6 para la guía)

### Dependencias
- Ninguna. Puede ejecutarse en paralelo con las tareas 1, 2, 3.

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | Agregar 9 notas del arquitecto + marcador condicional + sección LLM |

### Cambios exactos

La guía (73 líneas actuales) se modifica en 3 áreas:

#### A. Notas del arquitecto (Item 4) — 9 inserciones

Agregar una línea `\n\n🏛️ *Nota del arquitecto:*` al final de cada categoría, después del último `- **` item.

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

#### B. Marcador condicional en Runner (Item 5 para la guía)

Después de la línea 42 (`- **Smoke Testing / Happy Path:** Solo cobertura de caminos críticos.`), antes de la línea 43 (`- **Runner:**`), insertar:

```markdown
> 💡 *Si aplica* — El runner depende de la metodología de testing que definiste arriba. Si aún no lo sabes, puedes saltar esta sección.
```

#### C. Sección LLM-driven compatibility analysis (Item 6)

Al final del archivo (después de la línea 73, que es la última línea actual `- **Contenedores:** Dockerfile obligatorio para ambientes reproducibles.`), agregar:

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

### Estado final esperado
- 9 notas del arquitecto (una por categoría) al final de cada sección.
- Marcador `> 💡 *Si aplica*` antes de "Runner:" en Testing.
- Sección "🔍 Análisis de Compatibilidad (para el agente IA)" al final del archivo.
- El archivo pasa de 73 a ~117 líneas.

### Comandos de test
```bash
# Verificación manual: inspeccionar el archivo generado
# No hay tests automatizados para contenido markdown estático
# El comando existente debe seguir funcionando:
npx vitest run tests/init.test.js
```

### Rollback boundary
Revertir `canvas-planning-guide.md` al contenido original (73 líneas). No afecta a otros archivos.

### Líneas estimadas
- 9 notas del arquitecto: ~18 líneas
- Marcador condicional: ~3 líneas
- Sección LLM: ~23 líneas
- **Total: ~44 líneas (adiciones)**

---

## Tarea 5: Deprecar modo setup inicial (Item 7) — ÚLTIMA

### Dependencias
- **Requiere Tarea 1** (los orphaned files deben estar en `filesToCopy` antes de este cambio, de lo contrario el estado final del archivo init.js no coincidiría con el diseño).
- **Requiere Tareas 3 y 4** (los nuevos placeholders en canvas.js y la guía se usan en `--template`, que debe funcionar correctamente después de este cambio).
- Ejecutar AL FINAL, después de validar que las tareas 1-4 están completas y pasan sus tests.

### Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `funky-cli/src/commands/init.js` | Eliminar import de `@clack/prompts`, eliminar `getProtocolOptions()`, reemplazar bloque `else` interactivo por mensaje de error |
| `funky-cli/README.md` | Actualizar descripción del comando `funky init` (línea 25) |
| `funky-cli/src/templates/bootstrap/TEMPLATE_GUIDE.md` | Sin cambios — verificado: no contiene referencias al modo interactivo |

### Cambios exactos

#### init.js — 3 cambios específicos

**Cambio A — Eliminar import de `@clack/prompts` (línea 5):**

Eliminar:
```js
import * as p from '@clack/prompts';
```

**Cambio B — Eliminar función `getProtocolOptions()` (líneas 90-101):**

Eliminar completamente:
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

**Cambio C — Reemplazar bloque `else` (líneas 151-297):**

Reemplazar TODO el bloque `else` actual (desde `console.clear(); p.intro(...)` hasta el cierre de la última `}` del else, línea 297) por:

```js
      } else {
        console.error('❌ No se encontraron PROJECT-CANVAS.md ni INFRA-CANVAS.md.');
        console.error('Ejecuta `funky init --template` para generarlos.');
        process.exit(1);
      }
```

**Nota:** Las líneas 138-141 (`let canvasConfig = null; let selectedProtocols = []; let environment = 'ide';`) se conservan sin cambios. La variable `environment` queda como código muerto, pero no causa errores.

#### README.md — 1 cambio

**Línea 25** (fila de `funky init` en la tabla de comandos):

De:
```
| `funky init` | Inicia el ecosistema Funky AI en el directorio actual. Si no existen Canvas, ejecuta un wizard de setup inicial con `@clack/prompts` para definir el stack. Si ya existen Canvas, activa modo Headless y copia la estructura completa. | `funky init` -> "🚀 Funky Ecosystem inicializado!" |
```

A:
```
| `funky init` | Inicializa el ecosistema Funky AI en el directorio actual. Si no existen Canvas, muestra un mensaje indicando usar `funky init --template`. Si ya existen Canvas, activa modo Headless y copia la estructura completa. | `funky init --template` -> genera canvases vacíos |
```

### Estado final esperado
- `init.js` no importa `@clack/prompts`.
- No existe la función `getProtocolOptions()` en `init.js`.
- `funky init` sin `--template` y sin canvases muestra:
  ```
  ❌ No se encontraron PROJECT-CANVAS.md ni INFRA-CANVAS.md.
  Ejecuta `funky init --template` para generarlos.
  ```
  y termina con `process.exit(1)`.
- `funky init --template` sigue funcionando exactamente igual.
- `funky init` con ambos canvases presentes ejecuta modo Headless sin cambios.
- Tests existentes en `init.test.js` e `init.integration.test.js` pasan sin modificaciones.
- `README.md` refleja el nuevo comportamiento.

### Comandos de test
```bash
# Tests unitarios existentes (deben pasar sin cambios)
npx vitest run tests/init.test.js
npx vitest run tests/init.integration.test.js

# Tests de canvas (deben seguir pasando)
npx vitest run tests/canvas.test.js

# Verificación manual del comando
# En un directorio vacío:
#   node scripts/run-funky.mjs init      # Esperado: mensaje de error
#   node scripts/run-funky.mjs init --template  # Esperado: canvases generados
```

### Rollback boundary
Revertir los 3 cambios en `init.js` (restaurar import, restaurar `getProtocolOptions()`, restaurar bloque else) y revertir la línea en `README.md`. Si también se modificó en la Tarea 1, revertir solo los cambios del Item 7, conservando los 4 orphaned files.

### Líneas estimadas
- init.js: +5 líneas (nuevo bloque else), -160 líneas (import + getProtocolOptions + bloque interactivo)
- README.md: +1 línea, -1 línea
- **Total: ~167 líneas (adiciones + eliminaciones)**

---

## Review Workload Forecast

### Estimación de líneas cambiadas por tarea

| Tarea | Archivos | Adiciones | Eliminaciones | Total (ad + el) |
|-------|----------|-----------|---------------|-----------------|
| 1 — Orphaned files | init.js, init.test.js | ~29 | ~1 | ~30 |
| 2 — sync-templates.js | sync-templates.js | 0 | 1 | ~1 |
| 3 — canvas.js + tests | canvas.js, canvas.test.js | ~140 | ~43 | ~183 |
| 4 — canvas-planning-guide.md | canvas-planning-guide.md | ~44 | 0 | ~44 |
| 5 — Deprecar setup inicial | init.js, README.md | ~6 | ~161 | ~167 |
| **Total** | **7 archivos** | **~219** | **~206** | **~425** |

### Evaluación

| Factor | Valor |
|--------|-------|
| **Total líneas cambiadas** | ~425 (adiciones + eliminaciones) |
| **Límite de review** | 400 líneas |
| **¿Excede el límite?** | Sí, por ~25 líneas |
| **Riesgo general** | Medio |
| **Tarea de mayor riesgo** | Tarea 5 (deprecación — elimina ~160 líneas del flujo principal de init.js) |

### Recomendación

**No se recomienda dividir en chained PRs** por las siguientes razones:

1. El exceso sobre 400 líneas es marginal (~25 líneas, ~6%).
2. La Tarea 5 es principalmente **eliminaciones** (~160 de ~167 líneas), lo que hace el diff más fácil de revisar que uno con muchas adiciones.
3. Las tareas 1-4 son independientes entre sí y se pueden implementar y revisar de forma incremental dentro del mismo PR.
4. El mayor riesgo (Tarea 5) se mitiga ejecutándolo al último y verificando que los tests existentes pasan.

**Estrategia recomendada:**
- **Commits por work unit** (1 commit por tarea), siguiendo el patrón del skill work-unit-commits.
- **Un solo PR** con ~425 líneas totales.
- El revisor debe enfocarse en la Tarea 5 (init.js) y confirmar que el flujo headless no se rompe.

**Slice boundary si se decidiera dividir:**
- **PR 1**: Tareas 1-4 (contenido y limpieza, ~258 líneas)
- **PR 2**: Tarea 5 (deprecación, ~167 líneas)

---

## Resumen de dependencias entre tareas

```
Tarea 1 (orphaned) ──►  Tarea 5 (deprecación)
                            ▲
Tarea 2 (sync-templates) ──┘
                            │
Tarea 3 (canvas.js) ───────┤
                            │
Tarea 4 (guía) ────────────┘
```

- **Tareas 1-4**: Sin dependencias entre sí. Pueden ejecutarse en cualquier orden o en paralelo.
- **Tarea 5**: Depende de la Tarea 1 (para que `filesToCopy` tenga las 13 entradas en el estado final) y de las Tareas 3-4 (para que `--template` funcione con los nuevos placeholders y guía).

---

## Historial

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 2026-07-28 | 1.0 | Versión inicial de tasks |
