# Spec: Fase 1 — Templates (funky init --template)

> **Change:** `fase-1-templates`
> **Estado:** Spec
> **Fecha:** 2026-07-28
> **Precedido por:** [Propuesta](./proposal.md)

---

## Resumen de la especificación

Este documento detalla las especificaciones técnicas para los 7 ítems de la fase 1. Cada ítem incluye escenarios Given/When/Then, criterios de aceptación, archivos afectados, casos borde y escenarios de prueba.

**Corrección respecto a la propuesta:** El ítem 7 de la propuesta menciona eliminar la dependencia `@inquirer/prompts`, pero el código de `init.js` en realidad usa `@clack/prompts` (no `@inquirer/prompts`). Además, `@clack/prompts` es usado también por `feature.js`, por lo que la dependencia no puede eliminarse completamente de `package.json`. La especificación corrige este punto.

---

## Ítem 1: Fix orphaned files

### Descripción

Cuatro archivos en `src/templates/bootstrap/` se empaquetan con el CLI pero nunca se copian durante `runInit()`. Esto es un bug confirmado: `TEMPLATE_GUIDE.md` referencia `docs/engram/discoveries.md` como destino obligatorio, pero ese archivo nunca se crea.

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `funky-cli/src/commands/init.js` | Agregar 4 entradas al array `filesToCopy` en `runInit()` |

### Mapeo de archivos orphaned

| Orphaned | Destino en `filesToCopy` |
|---|---|
| `engram-discoveries.md` | `path.join('docs', 'engram', 'discoveries.md')` |
| `engram-bugfixes.md` | `path.join('docs', 'engram', 'bugfix', 'bugfixes.md')` |
| `architecture-assessment-guide.md` | `path.join('docs', 'architecture-assessment-guide.md')` |
| `agents-rules-secops-setup.md` | `path.join('.agents', 'rules', 'secops-setup.md')` |

### Escenarios

#### Escenario 1.1: Los 4 archivos orphaned se copian durante runInit()

- **Given** un directorio destino vacío
- **When** se ejecuta `runInit()` con `templatesDir` apuntando a `bootstrap/`
- **Then** el array de intenciones debe contener 4 nuevas entradas `{ action: 'copy' }` para los archivos orphaned
- **And** cada entrada debe tener la ruta `src` correcta dentro de `templatesDir`
- **And** cada entrada debe tener la ruta `dest` correcta según el mapeo definido

**Criterio de aceptación:** `runInit()` produce 4 intenciones `copy` adicionales (total de intenciones `copy` = 13 en lugar de 9).

#### Escenario 1.2: El archivo discoveries.md resuelve la referencia rota en TEMPLATE_GUIDE.md

- **Given** que `TEMPLATE_GUIDE.md` línea 44 referencia `docs/engram/discoveries.md`
- **When** se ejecuta `runInit()` con la nueva entrada para `engram-discoveries.md`
- **Then** el destino debe ser `docs/engram/discoveries.md` (dentro del directorio `docs/engram/` que ya se crea)
- **And** este destino coincide con la referencia en `TEMPLATE_GUIDE.md`

**Criterio de aceptación:** `engram-discoveries.md` se copia a `docs/engram/discoveries.md`, resolviendo la referencia en `TEMPLATE_GUIDE.md`.

#### Escenario 1.3: No se sobreescriben archivos existentes

- **Given** que el destino ya tiene un archivo en la ruta del orphaned file
- **When** `executeIntentions()` procesa la intención
- **Then** el archivo existente no se modifica (el adapter salta silenciosamente)

**Criterio de aceptación:** `fs-adapter.js` ya implementa la protección contra sobreescritura. No se requieren cambios en el adapter.

### Casos borde

1. **El directorio `docs/engram/` no existe todavía cuando se copia `discoveries.md`:** La intención de copia ocurre después de las intenciones `mkdir` de los directorios engram, por lo que `docs/engram/` ya existe. El orden actual del pipeline lo garantiza.
2. **`agents-rules-secops-setup.md` sobrescribe a `agents-rules-secops.md`:** Son archivos distintos con nombres diferentes. El destino es `.agents/rules/secops-setup.md`, que no colisiona con `secops.md`.
3. **Usuario ejecuta `funky init` por segunda vez:** `fs-adapter.js` saltea todos los destinos existentes, incluyendo los nuevos archivos.

### Tests

1. Test unitario en `init.test.js`: verificar que `runInit()` retorna 4 nuevas intenciones `copy` con las rutas correctas.
2. Test de integración en `init.integration.test.js`: verificar que los 4 archivos se persisten en el filesystem.

---

## Ítem 2: Fix sync-templates.js

### Descripción

La línea 15 de `sync-templates.js` referencia `funky-cli/src/templates/sdd/worker-handoff.md`, que no existe (fue deprecado en el commit `3ef773f`). El test de integración ya valida explícitamente que este archivo NO se copie.

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `funky-cli/scripts/sync-templates.js` | Eliminar el objeto `{ src: 'funky-cli/src/templates/sdd/worker-handoff.md', dest: 'plantilla-worker-handoff.md' }` del array `filesToSync` |

### Escenarios

#### Escenario 2.1: sync-templates.js ya no referencia worker-handoff.md

- **Given** el archivo `sync-templates.js`
- **When** se ejecuta el script
- **Then** no debe mostrar el warning `⚠️ Warning: Source file not found: ...worker-handoff.md`
- **And** el array `filesToSync` debe tener 4 elementos en lugar de 5

**Criterio de aceptación:** El script se ejecuta sin warnings ni errores. No se modifica ningún otro comportamiento.

#### Escenario 2.2: El resto de las rutas de sync no se ven afectadas

- **Given** que se elimina la línea de worker-handoff
- **When** se ejecuta `sync-templates.js`
- **Then** los otros 4 archivos (`engram-protocol.md`, `secops.md`, `sdd-orchestrator.md`, `canvas-planning-guide.md`) se sincronizan correctamente

**Criterio de aceptación:** Los 4 archivos restantes se copian sin errores.

### Casos borde

1. **El archivo `plantilla-worker-handoff.md` existe en el destino de proyectos previos:** No se elimina — el script solo copia archivos, no los borra. Esto es aceptable porque el archivo no causa daño; solo queda huérfano.

### Tests

1. Test unitario: verificar que el array `filesToSync` tiene 4 elementos (contra un snapshot o valor conocido).
2. El test de integración existente `init.integration.test.js` línea 41 ya valida que `worker-handoff.md` NO se copie — debe seguir pasando.

---

## Ítem 3: Mejores preguntas (canvas.js)

### Descripción

Actualmente `canvas.js` usa una función `f(val) => val || 'No definido / Pendiente'` idéntica para las 9 secciones. Esto no guía al desarrollador sobre qué información ingresar. Se reemplaza por placeholders específicos por sección que incluyen preguntas guía y ejemplos.

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `funky-cli/src/utils/canvas.js` | Reemplazar la función `f()` por placeholders específicos por sección en ambos generadores |

### Placeholders propuestos

#### PROJECT-CANVAS (5 secciones)

Cada placeholder debe incluir: (1) una pregunta guía, (2) un ejemplo breve del formato esperado.

```markdown
## 1. Framework Base
<!-- ¿Qué framework elegiste y por qué? ¿Qué necesidades resuelve (SSR, SPA, SSG)?
     Ej: Next.js (App Router) — Necesitamos SSR para SEO + performance en dashboard -->
[Responde aquí]

## 2. Patrón Arquitectónico
<!-- ¿Qué patrón organiza tu código? ¿Por qué este y no otro?
     Ej: Clean Architecture — El dominio es complejo y necesitamos separar capas -->
[Responde aquí]

## 3. Gestión de Estado
<!-- ¿Cómo fluyen los datos en tu app? ¿Estado remoto, global, o local?
     Ej: React Query + Zustand — Datos de servidor con React Query, UI global con Zustand -->
[Responde aquí]

## 4. Estrategia UI
<!-- ¿Qué herramienta de estilos usas? ¿Por qué esta y no otra?
     Ej: Tailwind + shadcn/ui — Componentes headless con utility-first para desarrollo rápido -->
[Responde aquí]

## 5. Estrategia de Testing
<!-- ¿Qué metodología y runner elegiste? ¿Qué nivel de cobertura esperas?
     Ej: Integration First con Vitest — Priorizamos flujos completos, cobertura >80% en crítico -->
[Responde aquí]
```

#### INFRA-CANVAS (4 secciones)

```markdown
## 1. Base de Datos / ORM
<!-- ¿Qué base de datos y ORM elegiste? ¿Cómo impacta en latencia, escalabilidad y costo?
     Ej: PostgreSQL + Prisma — Necesitamos transacciones ACID y migrations con type safety -->
[Responde aquí]

## 2. Autenticación
<!-- ¿Qué solución de auth elegiste? ¿Por qué esta y no otra?
     Ej: NextAuth.js — Necesitamos OAuth con Google y GitHub, sin gestión de contraseñas -->
[Responde aquí]

## 3. Linter / Formatter
<!-- ¿Qué herramientas de calidad de código usas? ¿Configuración estricta o flexible?
     Ej: Biome — Todo en una herramienta, config estricta para consistencia -->
[Responde aquí]

## 4. Deployment & CI/CD
<!-- ¿Dónde y cómo deployas? ¿Qué pipeline de CI usas?
     Ej: Vercel + GitHub Actions — Frontend en Vercel, CI con tests y lint en cada PR -->
[Responde aquí]
```

### Escenarios

#### Escenario 3.1: PROJECT-CANVAS genera placeholders específicos por sección

- **Given** que se ejecuta `generateProjectCanvasMarkdown({})` sin datos de configuración
- **When** se genera el markdown
- **Then** cada sección debe contener un placeholder con pregunta guía + ejemplo breve
- **And** ninguna sección debe contener el texto "No definido / Pendiente"

**Criterio de aceptación:** El output de `generateProjectCanvasMarkdown({})` tiene placeholders diferentes para cada una de las 5 secciones, con contenido en español neutro.

#### Escenario 3.2: INFRA-CANVAS genera placeholders específicos por sección

- **Given** que se ejecuta `generateInfraCanvasMarkdown({})` sin datos de configuración
- **When** se genera el markdown
- **Then** cada sección debe contener un placeholder con pregunta guía + ejemplo breve
- **And** ninguna sección debe contener el texto "No definido / Pendiente"

**Criterio de aceptación:** El output de `generateInfraCanvasMarkdown({})` tiene placeholders diferentes para cada una de las 4 secciones, con contenido en español neutro.

#### Escenario 3.3: Los valores configurados aún se renderizan correctamente

- **Given** que se ejecuta `generateProjectCanvasMarkdown({ framework: 'Next.js' })`
- **When** se genera el markdown
- **Then** la sección "Framework Base" debe contener "Next.js" en lugar del placeholder

**Criterio de aceptación:** Cuando se proveen valores de configuración, se renderizan en lugar de los placeholders. El cambio es solo en el valor por defecto, no en la lógica de renderizado condicional.

### Casos borde

1. **Español neutro en todos los placeholders:** Los placeholders deben usar "tú" o formas impersonales (ej: "¿Qué framework elegiste?"), nunca voseo rioplatense ni jerga regional.
2. **Formato markdown válido:** Los placeholders usan comentarios HTML `<!-- -->` y `[Responde aquí]` — esto mantiene compatibilidad con editores markdown y resalta visualmente las preguntas.

### Tests

1. Test unitario en `init.test.js`: verificar que `generateProjectCanvasMarkdown({})` no contiene "No definido / Pendiente".
2. Test unitario: verificar que cada sección de PROJECT-CANVAS tiene un placeholder diferente.
3. Test unitario: verificar que `generateProjectCanvasMarkdown({ framework: 'Next.js' })` renderiza el valor en lugar del placeholder.

---

## Ítem 4: Architect Notes (canvas-planning-guide.md)

### Descripción

Agregar notas pedagógicas ("🏛️ Nota del arquitecto") al final de cada categoría en `canvas-planning-guide.md`. Estas notas son micro-lecciones operacionales de 1-2 líneas que advierten sobre cuándo NO usar cada opción.

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | Agregar notas del arquitecto en cada categoría |

### Notas propuestas por categoría

| Categoría | Nota del arquitecto |
|---|---|
| Framework Base | `🏛️ *Nota del arquitecto:* Next.js es ideal para proyectos con SEO y SSR, pero es overkill para dashboards internos o apps sin contenido público. Astro rinde mejor para sitios estáticos o con poco dinamismo. NestJS/Express tiene sentido solo si el backend es sustancialmente más complejo que el frontend.` |
| Patrón Arquitectónico | `🏛️ *Nota del arquitecto:* Clean Architecture brilla en dominios complejos, pero añade ceremonia. Para CRUDs simples o MVPs, Modular/FSD da mejor velocidad inicial sin deuda técnica significativa. Screaming Architecture es excelente para dominios ricos en lógica de negocio, pero confunde si el proyecto es pequeño.` |
| Gestión de Estado | `🏛️ *Nota del arquitecto:* No agregues una librería de estado global hasta que tengas dos componentes no-hermanos que necesiten el mismo dato. Muchas apps viven felices con props + Server Components. Redux Toolkit solo si el flujo de estado es hiper-complejo o legacy.` |
| Estrategia UI | `🏛️ *Nota del arquitecto:* Design System propio tiene sentido si mantienes múltiples productos con la misma marca. Para proyectos únicos, Tailwind + shadcn/ui da 80% del valor con 10% del esfuerzo. CSS Modules es ideal si el equipo ya viene de esa cultura.` |
| Estrategia de Testing | `🏛️ *Nota del arquitecto:* TDD no es obligatorio. Muchos equipos exitosos usan Integration First: escriben integraciones primero, unitarias después. La cobertura del 80% es una guía, no una regla. Playwright para E2E solo si hay flujos críticos multi-paso.` |
| Base de Datos / ORM | `🏛️ *Nota del arquitecto:* SQLite es sorprendentemente capaz para equipos pequeños (<5 devs) y apps monousuario. No lo descartes por "no ser enterprise" — muchas apps SaaS viven felices con SQLite + backups. MongoDB es tentador pero piensa dos veces si necesitas transacciones.` |
| Autenticación | `🏛️ *Nota del arquitecto:* Auth.js (NextAuth) es la mejor opción open-source para React/Next, pero si tu app es solo backend, JWT Custom con refresh tokens da más control. Clerk es excelente si el presupuesto lo permite y no quieres gestionar auth.` |
| Linter / Formatter | `🏛️ *Nota del arquitecto:* Biome reemplaza ESLint + Prettier con una sola herramienta y es órdenes de magnitud más rápido. Migrar de ESLint a Biome es de bajo riesgo si el equipo está abierto al cambio. TypeScript strict debería ser no-negociable.` |
| Deployment & CI/CD | `🏛️ *Nota del arquitecto:* Un Junior + K8s es una receta para el desastre operativo. Si el equipo no tiene DevOps dedicado, usa PaaS (Vercel, Railway, Render). GitHub Actions es suficiente para CI/CD el 90% de los casos — no necesitas GitLab CI a menos que ya estés en GitLab.` |

### Escenarios

#### Escenario 4.1: Cada categoría principal tiene una nota del arquitecto

- **Given** el archivo `canvas-planning-guide.md`
- **When** se inspecciona cada categoría (Framework, Patrón, Estado, UI, Testing, DB, Auth, Linter, Deployment)
- **Then** cada categoría debe tener una línea que comience con `🏛️ *Nota del arquitecto:*`
- **And** la nota debe estar al final de la categoría, después de las opciones existentes

**Criterio de aceptación:** Existen 9 notas del arquitecto, una por categoría, en el formato especificado.

#### Escenario 4.2: Las notas no modifican el contenido existente

- **Given** el archivo `canvas-planning-guide.md`
- **When** se agregan las notas del arquitecto
- **Then** las opciones existentes en cada categoría no se modifican, solo se añade la nota al final

**Criterio de aceptación:** El contenido previo de cada categoría permanece intacto.

### Casos borde

1. **Longitud del archivo:** Las notas agregan ~30 líneas a un archivo de 73 líneas. Esto es aceptable pero se debe mantener cada nota en 1-2 líneas para evitar inflar la guía.
2. **Contenido obsoleto:** Las notas deben revisarse periódicamente. No se requiere un mecanismo de expiración en esta fase.

### Tests

No se requieren tests automatizados para este ítem (es contenido markdown estático). La verificación es manual o mediante snapshot test del archivo completo.

---

## Ítem 5: Pull not push (canvases + guía)

### Descripción

Agregar marcadores condicionales `> 💡 *Si aplica*` a secciones avanzadas en ambos canvases y la guía. Esto implementa progressive disclosure: el desarrollador puede saltar secciones sin sentirse culpable.

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `funky-cli/src/utils/canvas.js` | Agregar marcador `> 💡 *Si aplica*` a la sección "Estrategia UI" en PROJECT-CANVAS y "Deployment & CI/CD" en INFRA-CANVAS |
| `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | Agregar marcador `> 💡 *Si aplica*` a las secciones "Testing Runner" y opciones avanzadas |

### Mapeo de secciones condicionales

| Documento | Sección | Marcador |
|---|---|---|
| PROJECT-CANVAS | 4. Estrategia UI | `> 💡 *Si aplica* — Solo si tu proyecto tiene una librería de UI o design system definido.` |
| INFRA-CANVAS | 4. Deployment & CI/CD | `> 💡 *Si aplica* — Completa esta sección solo si tienes un deployment activo o pipeline de CI configurado.` |
| canvas-planning-guide | Runner (Testing) | `> 💡 *Si aplica* — El runner depende de la metodología de testing que definiste arriba. Si aún no lo sabes, puedes saltar esta sección.` |

### Escenarios

#### Escenario 5.1: PROJECT-CANVAS marca Estrategia UI como condicional

- **Given** que se ejecuta `generateProjectCanvasMarkdown({})`
- **When** se genera el markdown
- **Then** la sección "Estrategia UI" debe contener el texto `> 💡 *Si aplica*` antes del placeholder
- **And** las secciones 1, 2, 3 y 5 no deben tener este marcador

**Criterio de aceptación:** Solo la sección 4 de PROJECT-CANVAS tiene el marcador condicional.

#### Escenario 5.2: INFRA-CANVAS marca Deployment & CI/CD como condicional

- **Given** que se ejecuta `generateInfraCanvasMarkdown({})`
- **When** se genera el markdown
- **Then** la sección "Deployment & CI/CD" debe contener el texto `> 💡 *Si aplica*` antes del placeholder
- **And** las secciones 1, 2 y 3 no deben tener este marcador

**Criterio de aceptación:** Solo la sección 4 de INFRA-CANVAS tiene el marcador condicional.

#### Escenario 5.3: Los marcadores no afectan el renderizado con datos

- **Given** que se ejecuta `generateProjectCanvasMarkdown({ styling: 'Tailwind' })`
- **When** se genera el markdown
- **Then** el marcador condicional aparece antes del valor "Tailwind" (el marcador es parte del template, no del placeholder)

**Criterio de aceptación:** El marcador es parte fija del template, no depende de si hay valor o no.

### Casos borde

1. **No es lógica condicional en el CLI:** El marcador es un elemento visual en markdown. El desarrollador decide si aplica. No hay código que evalúe condiciones.
2. **Formato markdown válido:** El marcador usa blockquote `>`, que es markdown estándar y se renderiza correctamente en todos los editores.

### Tests

1. Test unitario en `init.test.js`: verificar que `generateProjectCanvasMarkdown({})` contiene `> 💡 *Si aplica*` en la sección de Estrategia UI.
2. Test unitario: verificar que `generateInfraCanvasMarkdown({})` contiene `> 💡 *Si aplica*` en la sección de Deployment.

---

## Ítem 6: LLM-driven compatibility analysis (canvas-planning-guide.md)

### Descripción

Agregar una sección al final de `canvas-planning-guide.md` que instruya al agente LLM a analizar las decisiones capturadas en los canvases, identificar incompatibilidades, trade-offs y riesgos. No se hardcodean reglas en el CLI — el agente LLM ya tiene el conocimiento, solo necesita la instrucción.

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | Agregar sección "🔍 Análisis de Compatibilidad (para el agente IA)" al final del archivo |

### Contenido de la sección

```markdown
---

## 🔍 Análisis de Compatibilidad (para el agente IA)

*Esta sección contiene instrucciones para que el agente de IA analice los canvases
completados. No es para el desarrollador.*

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

> **Nota:** Este análisis es el punto de partida. A medida que el equipo
> use el sistema, surgirán nuevos patrones de incompatibilidad que
> documentar. No intentes cubrir todos los casos ahora.
```

### Escenarios

#### Escenario 6.1: La sección de análisis LLM existe al final de la guía

- **Given** el archivo `canvas-planning-guide.md`
- **When** se lee el archivo
- **Then** debe contener una sección "🔍 Análisis de Compatibilidad (para el agente IA)"
- **And** esta sección debe estar al final del archivo, después de todas las categorías
- **And** debe incluir instrucciones específicas para el agente LLM

**Criterio de aceptación:** La guía tiene una sección final con instrucciones para el agente IA.

#### Escenario 6.2: Las instrucciones son accionables y específicas

- **Given** la sección de análisis LLM
- **When** un agente LLM la lee
- **Then** debe poder ejecutar los 4 pasos (leer, identificar, evaluar, generar riesgos)
- **And** debe incluir ejemplos concretos de combinaciones problemáticas

**Criterio de aceptación:** Las instrucciones son lo suficientemente específicas para que un agente LLM pueda seguirlas sin ambigüedad.

### Casos borde

1. **Instrucciones demasiado genéricas:** Se incluyen ejemplos concretos (Framework + Auth, DB + Escala, etc.) para evitar análisis superficial.
2. **Idioma:** Las instrucciones están en español neutro, consistentes con el resto de la guía.
3. **Nota de advertencia:** El blockquote final indica que la lista no es exhaustiva, evitando que el agente ignore patrones no listados.

### Tests

No se requieren tests automatizados (es contenido markdown estático). Verificación manual o snapshot test.

---

## Ítem 7: Deprecar el modo setup inicial (último paso)

### Descripción

Eliminar completamente el modo "setup inicial" (prompts interactivos) del comando `funky init`. El CLI solo ofrecerá `--template` (headless) como flujo de inicialización.

**Corrección importante respecto a la propuesta:**
- La propuesta menciona `@inquirer/prompts`, pero `init.js` importa `@clack/prompts` (línea 5).
- La dependencia `@clack/prompts` NO puede eliminarse de `package.json` porque `feature.js` también la usa.
- La dependencia `@inquirer/prompts` NO debe eliminarse porque la usan `estimate.js` y `engram.js`.

### Archivos afectados

| Archivo | Cambio |
|---|---|
| `funky-cli/src/commands/init.js` | Eliminar import de `@clack/prompts`, eliminar todo el bloque `else` (interactive wizard, líneas 151-297), eliminar función `getProtocolOptions()`, cambiar flujo cuando no existen canvases para mostrar mensaje instructivo |
| `funky-cli/README.md` | Actualizar descripción del comando `funky init` para reflejar que solo usa `--template` para inicialización |
| `funky-cli/src/templates/bootstrap/TEMPLATE_GUIDE.md` | Revisar y eliminar cualquier referencia al modo interactivo o setup wizard |
| `funky-cli/tests/init.test.js` | Actualizar si hay tests que dependen del modo interactivo (no debería haberlos, pero verificar) |

### Comportamiento esperado después del cambio

1. **`funky init --template`** — Genera canvases vacíos (sin cambios en este flujo).
2. **`funky init` sin `--template` con ambos canvases existentes** — Modo headless: ejecuta `runInit()` (sin cambios).
3. **`funky init` sin `--template` sin canvases** — Muestra mensaje de error claro y termina:

```
❌ No se encontraron PROJECT-CANVAS.md ni INFRA-CANVAS.md.
Ejecuta `funky init --template` para generarlos.
```

### Escenarios

#### Escenario 7.1: funky init sin --template y sin canvases muestra mensaje claro

- **Given** un directorio sin PROJECT-CANVAS.md ni INFRA-CANVAS.md
- **When** se ejecuta `funky init` (sin flags)
- **Then** no debe ejecutar prompts interactivos
- **And** debe mostrar un mensaje de error claro indicando que use `--template`
- **And** debe terminar con `process.exit(1)` o similar

**Criterio de aceptación:** El usuario recibe instrucción clara de cómo generar los canvases.

#### Escenario 7.2: funky init --template sigue funcionando correctamente

- **Given** un directorio sin canvases
- **When** se ejecuta `funky init --template`
- **Then** se generan PROJECT-CANVAS.md e INFRA-CANVAS.md con los nuevos placeholders
- **And** se copia `canvas-planning-guide.md`

**Criterio de aceptación:** El flujo `--template` no se ve afectado por la eliminación del modo interactivo.

#### Escenario 7.3: funky init con canvases existentes (headless) sigue funcionando

- **Given** un directorio con PROJECT-CANVAS.md e INFRA-CANVAS.md existentes
- **When** se ejecuta `funky init`
- **Then** se ejecuta el modo headless: `runInit()` con `canvasConfig` en skip mode
- **And** se copian los archivos bootstrap + orphaned files

**Criterio de aceptación:** El modo headless (flujo principal) no se ve afectado.

#### Escenario 7.4: El import de @clack/prompts se elimina de init.js

- **Given** el archivo `init.js` modificado
- **When** se inspecciona el archivo
- **Then** no debe contener `import * as p from '@clack/prompts'`
- **And** no debe contener llamadas a `p.group()`, `p.select()`, `p.multiselect()`, `p.intro()`, `p.outro()`

**Criterio de aceptación:** init.js no depende de `@clack/prompts`.

#### Escenario 7.5: La función getProtocolOptions() se elimina

- **Given** el archivo `init.js` modificado
- **When** se inspecciona
- **Then** no debe contener la función `getProtocolOptions()`
- **And** no debe haber lógica de selección de protocolos (esa lógica era parte del modo interactivo)

**Criterio de aceptación:** `getProtocolOptions()` se elimina de init.js.

### Casos borde

1. **Protoco** **loss on-demand:** La selección de protocolos on-demand (`selectedProtocols`) solo se ofrecía en el modo interactivo. En headless mode (cuando existen canvases), `selectedProtocols` se inicializa como `[]`. Después del cambio, si no hay canvases, `selectedProtocols` debe seguir siendo `[]`. No se requiere migración.

2. **Dependencia @clack/prompts:** NO se elimina de `package.json` porque `feature.js` todavía la usa. Solo se elimina el import en `init.js`.

3. **Escenario de migración parcial** (tiene PROJECT-CANVAS pero no INFRA-CANVAS): La propuesta no menciona cambios en este flujo. Se mantiene el comportamiento actual de migration warning.

4. **Tests existentes:** Los tests en `init.test.js` NO prueban el modo interactivo — prueban `runInit()` que es independiente. Deben seguir pasando sin cambios.

### Tests

1. Todos los tests existentes en `init.test.js` e `init.integration.test.js` deben pasar sin modificaciones.
2. Verificar manualmente que `funky init` sin `--template` en un directorio vacío muestra el mensaje de error y termina.

---

## Resumen de cambios por archivo

| Archivo | Ítems | Tipo de cambio |
|---|---|---|
| `funky-cli/src/commands/init.js` | 1, 7 | Agregar 4 archivos a `filesToCopy` + eliminar modo interactivo completo |
| `funky-cli/scripts/sync-templates.js` | 2 | Eliminar línea 15 (worker-handoff) |
| `funky-cli/src/utils/canvas.js` | 3, 5 | Reemplazar placeholders genéricos + agregar marcadores condicionales |
| `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | 4, 5, 6 | Agregar Architect Notes + marcadores condicionales + sección LLM |
| `funky-cli/README.md` | 7 | Actualizar descripción del comando `funky init` |
| `funky-cli/src/templates/bootstrap/TEMPLATE_GUIDE.md` | 7 | Revisar y eliminar referencias al modo interactivo |
| `funky-cli/package.json` | 7 (ninguno) | NO se eliminan dependencias (`@clack/prompts` sigue siendo usado por `feature.js`) |
| `funky-cli/tests/init.test.js` | 1 | Agregar tests para los 4 nuevos archivos orphaned |

---

## Orden de implementación

```
1. Fix orphaned files        ──►  init.js (solo agregar entradas, bajo riesgo)
2. Fix sync-templates.js     ──►  sync-templates.js (eliminar línea, bajo riesgo)
3. Mejores preguntas         ──►  canvas.js (placeholders, bajo riesgo)
4. Architect Notes           ──►  canvas-planning-guide.md (contenido, bajo riesgo)
5. Pull not push             ──►  canvas.js + canvas-planning-guide.md (bajo riesgo)
6. LLM-driven compatibility  ──►  canvas-planning-guide.md (contenido, bajo riesgo)
7. Deprecar setup inicial    ──►  init.js + README.md + TEMPLATE_GUIDE.md (riesgo medio)
```

Los ítems 3 y 5 pueden combinarse en un solo commit porque afectan a `canvas.js`. Los ítems 4, 5 y 6 pueden combinarse en un solo commit porque afectan a `canvas-planning-guide.md`.

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| **Item 7:** Eliminar modo interactivo rompe flujo si hay scripts que dependen de él | Baja | Alto | Verificar que no hay scripts externos. Hacerlo al último. El mensaje de error es claro. |
| **Item 1:** Orphaned files ya existen en proyectos previos | Alta | Bajo | `fs-adapter.js` saltea destinos existentes silenciosamente. Sin impacto. |
| **Item 3:** Placeholders muy largos hacen el canvas confuso | Baja | Medio | Mantener cada placeholder en 2-3 líneas máximo. El formato comentario HTML + `[Responde aquí]` es compacto. |
| **Item 6:** Instrucciones LLM demasiado genéricas | Media | Bajo | Incluir ejemplos concretos de combinaciones problemáticas en la sección. |
| **Item 7:** Error en la propuesta sobre `@inquirer/prompts` vs `@clack/prompts` | Ya identificado | Bajo | Corregido en esta spec: se elimina `@clack/prompts` de init.js pero no de package.json. |

---

## Historial

| Fecha | Versión | Cambio |
|---|---|---|
| 2026-07-28 | 1.0 | Versión inicial del spec |
