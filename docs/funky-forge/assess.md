# funky assess — Architecture Review

## ¿Qué problema resuelve?

Evalúa el stack tecnológico del proyecto, facilita la discusión arquitectónica y genera un prompt y un template para documentar decisiones. El prompt (`assess-prompt.md`) sirve como primer mensaje en la sesión de IA e instruye al agente a leer y analizar pasivamente los documentos fundacionales (`brief-funcional.md`, `PROJECT-CANVAS.md`, `INFRA-CANVAS.md`, `risk-patterns.md`). El análisis real de riesgos y la arquitectura final la evalúa la IA durante la discusión asumiendo su rol de juez arquitectónico, no el CLI.

## ¿Cuándo usarlo standalone?

- Proyecto chico o exploración rápida donde se necesita una revisión arquitectónica sin encadenar con otros comandos.
- Basta con ejecutar `funky assess` y seguir los próximos pasos: pegar `docs/funky-ai/assess/assess-prompt.md` como primer mensaje de la sesión con la IA.

## ¿Cuándo usarlo con pipeline?

- Como paso intermedio del pipeline (`funky pipeline assess`), cuando se necesita compartir estado con el comando `estimate`.
- El flag `--context` (o la ejecución vía pipeline) actualiza `docs/funky-ai/pipeline/context.json` con el estado por fase (v2): `status: 'completed'`, fechas, duración, `artifacts`, `runAt`, `surfacedPatterns` (nombres de los patrones de riesgo superfíciados) y `decisionsFile`, permitiendo que `estimate` consuma ese estado.

## Requisitos previos

- `docs/funky-ai/canvas/PROJECT-CANVAS.md` debe existir.
- `docs/funky-ai/canvas/INFRA-CANVAS.md` debe existir.
- Si no se encuentran, se advierte al usuario (la guía los referencia; se pueden crear con `funky init`).
- Instalarlos usando `funky init`.

## Inputs

| Input | Fuente | Propósito |
|---|---|---|
| PROJECT-CANVAS.md | `docs/funky-ai/canvas/` | Contexto del proyecto, stack, equipo (referenciado, no incrustado) |
| INFRA-CANVAS.md | `docs/funky-ai/canvas/` | Infraestructura elegida, costos, SLA (referenciado, no incrustado) |
| assess-prompt-template.md | `templates/assess/` | Prompt para pegar como primer mensaje en la sesión de IA |
| architecture-decisions-template.md | `templates/assess/` | Template para documentar decisiones |
| risk-patterns-template.md | `templates/assess/` | Template inicial de patrones de riesgo de referencia |

### Validación de canvases

`findCanvases()` lee ambos archivos y cuenta cuántas secciones contienen el texto `[Responde aquí]`. Si hay secciones sin completar, se muestra una advertencia con la cantidad detectada.

## Outputs

| Output | Condición | Descripción |
|---|---|---|
| `docs/funky-ai/assess/assess-prompt.md` | Se crea si no existe; si existe, Y/N interactivo | Prompt para pegar como primer mensaje de la sesión con la IA |
| `docs/funky-ai/assess/architecture-decisions.md` | Solo si no existe | Template para documentar decisiones durante la sesión (con `{{DATE}}` reemplazado) |
| `docs/funky-ai/assess/risk-patterns.md` | Solo si no existe | Patrones de riesgo de referencia, editables por el equipo |
| `docs/funky-ai/pipeline/context.json` | Solo con `--context` | Actualiza estado de fase v2: `assess.status`/`runAt`/`surfacedPatterns`/`decisionsFile`/`artifacts` |

### Comportamiento por archivo (contrato de feedback)

| Caso | Comportamiento | Exit |
|---|---|---|
| Archivo nuevo | Se crea sin preguntar | 0 |
| Guía existente (`assess-prompt.md`) | Y/N: `y` → actualiza; `n` → no actualiza (decisión válida) | 0 |
| Decisión existente (`risk-patterns.md`, `architecture-decisions.md`) | No pregunta, no sobrescribe; recomienda eliminar o mover con backup | 0 |
| Error real (lectura/escritura, conflicto inesperado) | Mensaje de error | 1 |

Sin terminal (CI): default `n` logueado — no se sobrescriben guías sin input humano. "El usuario decidió no actualizar" nunca es un error.

### assess-prompt.md

Prompt para pegar como primer mensaje de la sesión con la IA. Instruye leer los archivos en orden (brief primero, luego canvases, y `risk-patterns.md`), discutir un punto a la vez y anotar cada decisión aprobada en `architecture-decisions.md`. Si alguno de los archivos referenciados falta, el prompt indica señalar y preguntar al humano, jamás inventarlo.

### architecture-decisions.md

Template con estructura por decisión: título, decisión, rationale, alternativas consideradas, riesgos aceptados y fecha. Se genera con `{{DATE}}` reemplazado por la fecha actual. No se sobrescribe si ya existe: se recomienda eliminar o mover de ubicación con backup para regenerarlo.

## Patrones de riesgo

`risk-patterns.md` es un **documento vivo del equipo**: se crea la primera vez copiando `risk-patterns-template.md` y, si ya existe, no se sobrescribe (recomendación de eliminar/mover con backup).

La guía **referencia** `risk-patterns.md` como fuente de patrones de referencia; no incrusta su contenido. `surfaceRiskPatterns()` lee el archivo del proyecto y solo sus **nombres** (`patterns`) viajan a `context.json` como `assess.surfacedPatterns` (metadata para el pipeline). El contenido del documento nunca se inyecta en el review.

Los patrones son **candidatos a evaluar, no riesgos confirmados**: la IA los evalúa en la Fase 4 leyendo los canvases, decidiendo junto con el equipo cuáles aplican. El CLI no detecta ni filtra patrones por regex: el análisis real vive en la discusión.

## Diagrama de flujo

```
┌─────────────────────────────────────────────────────────────┐
│ runAssess(targetBase, opts)                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Context (opcional)                                      │
│     └── readContext(targetBase)                             │
│         └── docs/funky-ai/pipeline/context.json             │
│                                                             │
│  2. Canvas Discovery                                        │
│     └── findCanvases(targetBase)                            │
│         ├── readCanvas('PROJECT-CANVAS.md')                 │
│         ├── readCanvas('INFRA-CANVAS.md')                   │
│         └── countUnfilledSections()                         │
│             └── regex /\[Responde aquí\]/g                  │
│                                                             │
│  3. Canvas Validation                                       │
│     └── unfilledCount > 0 → warning                         │
│                                                             │
│  4. Plan de intenciones (executeIntentions)                 │
│     ├── mkdir docs/funky-ai/assess/                         │
│     ├── risk-patterns.md (kind 'decision')                  │
│     │   └── solo si no existe; si existe → recomendación    │
│     │       eliminar/mover con backup                       │
│     ├── architecture-decisions.md (kind 'decision')         │
│     │   └── solo si no existe (reemplaza {{DATE}});         │
│     │       si existe → recomendación eliminar/mover        │
│     └── assess-prompt.md (kind 'guide')                     │
│         └── si existe → Y/N (TTY); sin TTY default 'n'      │
│                                                             │
│  5. Surface Risk Patterns (solo metadata)                   │
│     └── surfaceRiskPatterns(targetBase, templateContent)    │
│         └── lee risk-patterns.md del proyecto               │
│             └── {content, patterns} → solo patterns al ctx  │
│                                                             │
│  6. Write Context (si --context)                            │
│     └── updatePhaseState(ctx, 'assess', {                   │
│     │       status: 'completed',                            │
│     │       finishedAt, durationMs, artifacts,              │
│     │       runAt, surfacedPatterns: surfaceResult.patterns,│
│     │       decisionsFile })                                │
│     └── writeContext(targetBase, ctx)                       │
│                                                             │
│  7. Summary + Próximos pasos                                │
│     └── "Material de assess listo: N creados, M conservados"│
│         + estado por archivo (generado/creado/conservado)   │
│         + pegar assess-prompt.md como primer mensaje        │
└─────────────────────────────────────────────────────────────┘
```

## Flags

| Flag | Descripción |
|---|---|
| `--context, -c <path>` | Ruta al `context.json` para integración con pipeline. Habilita la escritura del estado de fase v2: `assess.status` (`completed`), `runAt`, `surfacedPatterns` (nombres de patrones superfíciados), `decisionsFile` y `artifacts`. Si el archivo no existe, error y exit 1. |

Sin `--context`, el comando ejecuta toda la lógica de canvas discovery, superficie de patrones y escritura de archivos, pero omite la actualización del pipeline context.
