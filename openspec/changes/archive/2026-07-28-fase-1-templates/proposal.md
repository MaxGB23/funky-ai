# Propuesta: Fase 1 — Templates (funky init --template)

> **Change:** `fase-1-templates`
> **Estado:** Propuesta
> **Fecha:** 2026-07-28
> **Precedido por:** [Exploración](./exploration.md)

---

## Intención

Los canvases que genera `funky init --template` capturan decisiones superficiales — nombres de stack sin contexto, sin alternativas descartadas, sin el "por qué" detrás de cada elección. La guía de planeación (`canvas-planning-guide.md`) describe opciones pero no advierte cuándo *no* usarlas, ni prepara al agente LLM para analizar incompatibilidades entre las decisiones del equipo.

El sistema funciona, pero el output que produce es pobre para las fases siguientes (assess y estimate). Un canvas con solo nombres de herramientas no le da suficiente contexto a un agente de IA para tener una discusión arquitectónica significativa.

**Esta fase transforma los templates de formularios vacíos a artefactos de conversación** — con mejor contexto pedagógico, placeholders que guían, y secciones que instruyen al agente LLM para analizar y detectar riesgos sin hardcodear reglas en el CLI.

---

## Alcance

### Incluido (7 ítems)

1. **Architect Notes** — micro-lecciones pedagógicas en `canvas-planning-guide.md` (ej: "muchos SMB tienen límite psicológico de gasto mensual", "Next.js es overkill para un dashboard interno").
2. **Mejores preguntas** — reemplazar placeholders genéricos "No definido / Pendiente" por preguntas guía por sección (ej: "¿Cuál es el peor pico realista de tráfico? ¿Qué evento de negocio lo causaría?").
3. **Análisis LLM-driven de compatibilidades** — agregar una sección de instrucciones en `canvas-planning-guide.md` que indique al agente LLM analizar los canvases completados y redactar incompatibilidades, riesgos y trade-offs detectados.
4. **Pull not push** — marcar secciones avanzadas de ambos canvases y la guía como condicionales ("si aplica") en vez de obligatorias.
5. **Fix orphaned files** — resolver los 4 archivos en `bootstrap/` que se empaquetan pero nunca se copian: `agents-rules-secops-setup.md`, `architecture-assessment-guide.md`, `engram-bugfixes.md`, `engram-discoveries.md`.
6. **Fix sync-templates.js** — eliminar la línea que referencia `worker-handoff.md` (archivo deprecado por commit `3ef773f`).
7. **Deprecar el modo setup inicial** — eliminar los prompts interactivos, la lógica asociada y la documentación del modo "setup inicial" (antes llamado "interactivo"). El CLI solo ofrecerá `--template` (headless) como flujo de inicialización.

### Excluido explícitamente

| Elemento | Razón |
|---|---|
| **Capa de constraints separada (ARCHITECTURE-CONSTRAINTS.md)** | Propuesto por RFC `1.13.1` pero es un cambio estratégico mayor. Se pospone para cuando el workflow lo requiera explícitamente. |
| **Scaffolding automático por stack** | El sistema está diseñado para que el desarrollador + IA construyan el scaffold, no el CLI. |
| **Interpolación de variables (`{{project_name}}`)** | No es necesario para la calidad del contenido de los canvases ni la guía. |
| **Tests para el path `--template`** | Identificado como mejora pendiente (#7 en observaciones.md) pero no bloquea el contenido. Puede hacerse en paralelo. |
| **Nuevos templates de bootstrap** | El set actual de 9 archivos cubre el caso base. Nuevos templates se agregan cuando el workflow lo requiera. |
| **Modo Migration** | No se modifica — sigue siendo un path automático para casos edge. |

---

## Enfoque

### Orden de implementación

El orden sigue la recomendación de la exploración: limpieza primero, contenido después, deprecación al final.

```
1. Fix orphaned files        ──►  Limpieza (desbloquea referencia rota en TEMPLATE_GUIDE.md)
2. Fix sync-templates.js     ──►  Limpieza (elimina referencia a archivo inexistente)
3. Mejores preguntas         ──►  Contenido canvas.js (placeholders guía)
4. Architect Notes           ──►  Contenido guía (micro-lecciones pedagógicas)
5. Pull not push             ──►  Marcadores progresivos (canvases + guía)
6. LLM-driven compatibility  ──►  Instrucciones para agente (guía)
7. Deprecar setup inicial    ──►  Último paso: eliminar prompts, lógica y docs
```

Los ítems 3 y 4 pueden combinarse en un solo commit porque afectan archivos distintos pero conceptualmente relacionados (calidad del contenido).

### Detalle por ítem

---

#### 1. Fix orphaned files

**Problema:** 4 archivos en `src/templates/bootstrap/` se empaquetan con el CLI pero nunca se copian durante `runInit()`. Peor aún, `TEMPLATE_GUIDE.md` referencia explícitamente `docs/engram/discoveries.md` que nunca se crea.

| Orphaned | Decisión |
|---|---|
| `engram-discoveries.md` | **Agregar a init.js** — `TEMPLATE_GUIDE.md` lo referencia como destino obligatorio para decisiones estructurales. Es un bug real. |
| `engram-bugfixes.md` | **Agregar a init.js** — proporciona una plantilla estándar para documentación de bugfixes que complementa el directorio `docs/engram/bugfix/`. |
| `architecture-assessment-guide.md` | **Agregar a init.js** — sirve como guía de referencia para llenar `docs/architecture-assessment.md`, que sí se copia. |
| `agents-rules-secops-setup.md` | **Agregar a init.js** como `.agents/rules/secops-setup.md` — complementa las reglas de secops existentes con guía de configuración npm hardening. |

**Archivos a modificar:**
- `funky-cli/src/commands/init.js` — agregar 4 entradas a `filesToCopy` en `runInit()`
- `funky-cli/src/utils/fs-adapter.js` — no requiere cambios (usa `executeIntentions` que ya soporta más entradas)

**Riesgo:** Bajo. Los archivos existen y son válidos. `fs-adapter.js` nunca sobreescribe destinos existentes.

---

#### 2. Fix sync-templates.js

**Problema:** Línea 15 de `sync-templates.js` referencia `funky-cli/src/templates/sdd/worker-handoff.md` que no existe. El archivo fue deprecado en `3ef773f` ("feat: deprecate worker-handoff.md in favor of direct message passing").

**Decisión:** Eliminar la línea completa del array de sync. No reemplazar la ruta.

**Archivos a modificar:**
- `funky-cli/scripts/sync-templates.js` — eliminar el objeto `{ src: 'funky-cli/src/templates/sdd/worker-handoff.md', dest: 'plantilla-worker-handoff.md' }`

**Riesgo:** Bajo. El test de integración `init.integration.test.js` ya valida explícitamente que este archivo NO se copie. La eliminación es consistente con el comportamiento esperado.

---

#### 3. Mejores preguntas (canvas.js)

**Problema:** `canvas.js` usa una función `f(val) => val || 'No definido / Pendiente'` idéntica para las 9 secciones en ambos canvases. No hay variación por sección, no hay hint text, no hay guía para el desarrollador.

**Enfoque:** Reemplazar la función `f()` genérica por un mapa de placeholders por sección. Cada sección recibe un placeholder específico que guíe al desarrollador sobre qué información ingresar.

**Estructura propuesta para PROJECT-CANVAS.md:**

```markdown
## 1. Framework Base
<!-- ¿Qué framework elegiste y por qué? ¿Qué necesidades resuelve (SSR, SPA, SSG)?
     Ej: Next.js (App Router) — Necesitamos SSR para SEO + performance en dashboard -->
[Responde aquí]

## 2. Patrón Arquitectónico
<!-- ¿Qué patrón organiza tu código? ¿Por qué este y no otro?
     Ej: Clean Architecture — El dominio es complejo y necesitamos separar capas -->
[Responde aquí]
```

**Estructura propuesta para INFRA-CANVAS.md:**

```markdown
## 1. Base de Datos / ORM
<!-- ¿Qué base de datos y ORM elegiste? ¿Cómo impacta en latencia, escalabilidad y costo?
     Ej: PostgreSQL + Prisma — Necesitamos transacciones ACID y migrations con type safety -->
[Responde aquí]
```

**Archivos a modificar:**
- `funky-cli/src/utils/canvas.js` — reemplazar función `f()` por placeholders específicos por sección

**Consideraciones:**
- Los placeholders deben estar en español (consistencia con el idioma del resto de los templates)
- Deben ser preguntas, no afirmaciones — invitan a pensar, no a copiar
- Deben incluir un ejemplo breve para mostrar el formato esperado

---

#### 4. Architect Notes (canvas-planning-guide.md)

**Problema:** La guía describe opciones pero no dice cuándo NO usarlas. Un junior no sabe que Next.js es overkill para un dashboard interno, o que PostgreSQL + SQLite juntos duplican complejidad operacional innecesariamente.

**Enfoque:** Agregar una línea de "🏛️ Nota del arquitecto" al final de cada categoría en la guía. Estas notas son micro-lecciones operacionales de 1-2 líneas que advierten sobre trampas comunes.

**Ejemplos por categoría:**

| Categoría | Architect Note propuesta |
|---|---|
| Framework Base | "🏛️ Next.js es ideal para proyectos con SEO y SSR, pero es overkill para dashboards internos o apps sin contenido público. Astro rinde mejor para sitios estáticos o con poco dinamismo." |
| Patrón Arquitectónico | "🏛️ Clean Architecture brilla en dominios complejos, pero añade ceremonia. Para CRUDs simples o MVPs, Modular/FSD da mejor velocidad inicial sin deuda técnica significativa." |
| Base de Datos / ORM | "🏛️ SQLite es sorprendentemente capaz para equipos pequeños (<5 devs) y apps monousuario. No lo descartes por 'no ser enterprise' — muchas apps SaaS viven felices con SQLite + backups." |
| Testing | "🏛️ TDD no es obligatorio. Muchos equipos exitosos usan Integration First:写了 integraciones primero, unitarias después. La cobertura del 80% es una guía, no una regla." |

**Archivos a modificar:**
- `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` — agregar notas por categoría

**Riesgo:** Bajo. Las notas son contenido nuevo que no rompe nada existente. Si una categoría queda muy larga, se puede truncar a 1 línea.

---

#### 5. Pull not push (canvases + guía)

**Problema:** Todas las secciones en ambos canvases y la guía se presentan como obligatorias. No hay marcadores de "si aplica" para secciones avanzadas.

**Enfoque:** Agregar un marcador `> 💡 *Si aplica*` a las secciones que son avanzadas o contextuales. El desarrollador puede saltarlas sin sentirse culpable.

**Secciones candidatas para marcador condicional:**

- PROJECT-CANVAS: Estrategia UI (solo si hay UI component library)
- INFRA-CANVAS: Deployment & CI/CD (solo si hay deployment activo)
- Guía: Testing runner (solo si se definió metodología de testing)

**Mecanismo:** No es lógica condicional en el CLI — es un marcador visual en el markdown. El desarrollador decide si aplica.

**Archivos a modificar:**
- `funky-cli/src/utils/canvas.js` — agregar marcador condicional a secciones avanzadas
- `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` — agregar marcador condicional a opciones avanzadas

---

#### 6. LLM-driven compatibility analysis (canvas-planning-guide.md)

**Problema:** No hay ninguna instrucción en los templates que le pida al agente LLM analizar incompatibilidades entre las decisiones capturadas en los canvases. Actualmente, el agente no tiene contexto sobre qué verificar.

**Enfoque:** Agregar una sección al final de `canvas-planning-guide.md` titulada "🔍 Análisis de Compatibilidad (para el agente IA)" que contenga instrucciones explícitas para que el agente LLM:

1. Lea ambos canvases completados
2. Identifique combinaciones incompatibles o riesgosas (ej: Astro + NextAuth, Junior + K8s, SQLite + 10k RPS)
3. Señale trade-offs no documentados
4. Sugiera alternativas viables
5. Documente hallazgos en una sección de "Riesgos Detectados"

**Principio:** No hardcodear reglas de compatibilidad en el CLI. El agente LLM ya tiene el conocimiento; solo necesita la instrucción para aplicarlo al contexto específico del proyecto.

**Formato propuesto:**

```markdown
## 🔍 Análisis de Compatibilidad (para el agente IA)

*Esta sección contiene instrucciones para que el agente de IA analice los canvases
completados. No es para el desarrollador.*

Cuando el equipo haya completado PROJECT-CANVAS.md e INFRA-CANVAS.md, el agente IA debe:

1. Leer ambas secciones de "Decisión y Rationale" y extraer el stack elegido.
2. Identificar combinaciones problemáticas conocidas:
   - Framework + Auth (ej: sitio estático + NextAuth)
   - Base de datos + Escala (ej: SQLite + alto throughput)
   - Patrón + Stack (ej: Clean Architecture + bundle mínimo)
   - Senioridad del equipo + Complejidad operacional
3. Evaluar cada par de decisiones y documentar:
   - Si son compatibles sin observaciones
   - Si tienen trade-offs conocidos (con sugerencia de mitigación)
   - Si son incompatibles (con sugerencia de alternativa)
4. Generar una sección "Riesgos Detectados" con los hallazgos.

> **Nota:** Este análisis es el punto de partida. A medida que el equipo
> use el sistema, surgirán nuevos patrones de incompatibilidad que
> documentar. No intentes cubrir todos los casos ahora.
```

**Archivos a modificar:**
- `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` — agregar sección de análisis LLM

---

#### 7. Deprecar el modo setup inicial (último paso)

**Problema:** El CLI tiene dos modos de inicialización: `--template` (headless) y el modo "setup inicial" basado en prompts interactivos. Estos prompts ofrecen un subconjunto diferente de opciones que la guía headless, creando inconsistencia. Además, el modo interactivo duplica lógica que no aporta valor diferencial.

**Enfoque:** Eliminar completamente el modo setup inicial. Esto incluye:

1. **Prompts interactivos** en `init.js` — eliminar toda la lógica de `@inquirer/prompts`
2. **Dependencia** `@inquirer/prompts` — eliminar de `package.json`
3. **Documentación** — actualizar README y cualquier doc que referencie el modo interactivo
4. **Modo headless como único flujo** — `funky init` sin `--template` y sin canvases existentes debe mostrar un mensaje claro indicando que ejecute `funky init --template` primero

**Archivos a modificar:**
- `funky-cli/src/commands/init.js` — eliminar lógica de prompts interactivos
- `funky-cli/package.json` — eliminar dependencia `@inquirer/prompts`
- `funky-cli/README.md` — actualizar documentación
- `funky-cli/src/templates/bootstrap/TEMPLATE_GUIDE.md` — revisar referencias al modo interactivo

**Riesgo:** Alto (relativo al resto de la fase). Es el cambio más invasivo porque modifica el flujo principal del comando `init`. Se hace AL FINAL para minimizar el riesgo de regression durante el desarrollo de los ítems 1-6.

**Mitigación:**
- Los tests existentes para headless mode deben seguir pasando
- El mensaje de error debe ser claro: "No se encontraron canvases. Ejecuta `funky init --template` para generarlos."
- Verificar que no haya referencias externas al modo interactivo (docs, scripts, CI)

---

## Impacto

### Archivos afectados

| Archivo | Cambio | Riesgo |
|---|---|---|
| `funky-cli/src/utils/canvas.js` | Reemplazar placeholders genéricos por específicos por sección. Agregar campo de rationale + alternativas. | Bajo |
| `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | Agregar Architect Notes, sección LLM compatibility, marcadores pull-not-push. | Bajo |
| `funky-cli/src/commands/init.js` | Agregar 4 orphaned files a `filesToCopy`. **Ítem 7:** eliminar prompts interactivos y lógica asociada. | Medio (ítem 7) |
| `funky-cli/scripts/sync-templates.js` | Eliminar línea de `worker-handoff.md`. | Bajo |
| `funky-cli/package.json` | **Ítem 7:** eliminar dependencia `@inquirer/prompts` si ya no se usa. | Medio |
| `funky-cli/tests/init.test.js` | **Ítem 7:** actualizar tests si referencian modo interactivo. | Bajo |
| `funky-cli/tests/init.integration.test.js` | **Ítem 7:** actualizar tests de integración. | Bajo |
| `funky-cli/README.md` | **Ítem 7:** actualizar documentación. | Bajo |

### Áreas de riesgo

1. **Ítem 7 (deprecación setup inicial):** Es el cambio más invasivo. Si hay scripts o docs externos que usen el modo interactivo, se romperán. La mitigación es hacerlo al final y verificar exhaustivamente.
2. **Orphaned files:** Si algún archivo se agrega a `filesToCopy` pero ya existe en proyectos existentes, `fs-adapter.js` lo saltará silenciosamente. Es comportamiento correcto.
3. **LLM compatibility section:** Si las instrucciones son demasiado genéricas, el agente producirá análisis superficial. Se recomienda incluir ejemplos concretos en la sección.

---

## Criterios de éxito

La fase está completa cuando:

- [ ] **Orphaned files resueltos** — los 4 archivos en `bootstrap/` se copian durante `runInit()` o se eliminan del directorio si no son necesarios
- [ ] **sync-templates.js limpio** — no referencia `worker-handoff.md` ni ningún otro archivo inexistente
- [ ] **Placeholders mejorados** — cada sección de ambos canvases tiene un placeholder específico que guía al desarrollador con preguntas y ejemplos
- [ ] **Architect Notes agregadas** — cada categoría en `canvas-planning-guide.md` tiene al menos una nota pedagógica sobre cuándo (no) usar cada opción
- [ ] **Secciones avanzadas marcadas como condicionales** — pull-not-push implementado en canvases y guía
- [ ] **Instrucción LLM-driven agregada** — `canvas-planning-guide.md` incluye una sección que instruye al agente a analizar compatibilidades
- [ ] **Modo setup inicial eliminado** — no hay prompts interactivos, lógica asociada, ni documentación del modo. `funky init` sin canvases muestra mensaje claro para usar `--template`
- [ ] **Tests existentes pasan** — headless mode y demás funcionalidad no se ve afectada

---

## Resumen ejecutivo

Esta propuesta transforma los templates de `funky init --template` de formularios vacíos a artefactos de conversación que capturan decisiones reales con contexto. Son 7 cambios incrementales de esfuerzo bajo a medio, ejecutables en orden independiente: limpieza de archivos huérfanos y referencias rotas (ítems 1-2), mejora de contenido pedagógico en canvases y guía (ítems 3-6), y deprecación final del modo setup inicial (ítem 7). No se requieren cambios arquitectónicos ni nuevas dependencias. El mayor riesgo es la deprecación del modo interactivo, que se mitiga ejecutándolo al último y verificando tests y documentación. La fase desbloquea las fases siguientes (assess y estimate) al producir canvases con suficiente contexto para discusiones arquitectónicas significativas.
