# funky assess — Architecture Review

## ¿Qué problema resuelve?

Evalúa el stack tecnológico del proyecto, facilita la discusión arquitectónica y genera una guía para documentar decisiones. Parte del contenido de los canvases (`PROJECT-CANVAS.md`, `INFRA-CANVAS.md`) y superficia patrones de riesgo de referencia (`docs/funky-ai/assess/risk-patterns.md`) como candidatos a considerar. El análisis real de riesgos lo hace la IA durante la Fase 4 de la discusión, no el CLI.

## ¿Cuándo usarlo standalone?

- Proyecto chico o exploración rápida donde se necesita una revisión arquitectónica sin encadenar con otros comandos.
- Basta con ejecutar `funky assess` y seguir la guía generada en `docs/funky-ai/assess/architecture-review.md`.

## ¿Cuándo usarlo con pipeline?

- Como paso intermedio del pipeline (`funky pipeline assess`), cuando se necesita compartir estado con el comando `estimate`.
- El flag `--context` (o la ejecución vía pipeline) actualiza `docs/funky-ai/pipeline/context.json` con la fecha de ejecución y los nombres de los patrones de riesgo superfíciados, permitiendo que `estimate` consuma ese estado.

## Requisitos previos

- `docs/funky-ai/canvas/PROJECT-CANVAS.md` debe existir.
- `docs/funky-ai/canvas/INFRA-CANVAS.md` debe existir.
- Si no se encuentran, se usan placeholders y se advierte al usuario.
- Instalarlos usando `funky init`.

## Inputs

| Input | Fuente | Propósito |
|---|---|---|
| PROJECT-CANVAS.md | `docs/funky-ai/canvas/` | Contexto del proyecto, stack, equipo |
| INFRA-CANVAS.md | `docs/funky-ai/canvas/` | Infraestructura elegida, costos, SLA |
| architecture-review-template.md | `templates/assess/` | Esqueleto de la guía con 6 fases |
| architecture-decisions-template.md | `templates/assess/` | Template para documentar decisiones |
| risk-patterns-template.md | `templates/assess/` | Template inicial de patrones de riesgo de referencia |

### Validación de canvases

`findCanvases()` lee ambos archivos y cuenta cuántas secciones contienen el texto `[Responde aquí]`. Si hay secciones sin completar, se muestra una advertencia con la cantidad detectada.

## Outputs

| Output | Condición | Descripción |
|---|---|---|
| `docs/funky-ai/assess/architecture-review.md` | Siempre (sobrescribe si existe) | Guía de discusión con canvases embebidos y patrones de riesgo a considerar |
| `docs/funky-ai/assess/architecture-decisions.md` | Solo si no existe | Template para documentar decisiones durante la sesión |
| `docs/funky-ai/assess/risk-patterns.md` | Solo si no existe | Patrones de riesgo de referencia, editables por el equipo |
| `docs/funky-ai/pipeline/context.json` | Solo con `--context` | Actualiza `assess.runAt` y `assess.dynamicQuestions` |

### architecture-review.md

Contiene los canvases completos embebidos y una guía estructurada en 6 fases:

1. **Contexto** (5 min): Confirmar stack y NFRs.
2. **Preocupaciones del equipo** (10 min): Riesgos percibidos por el equipo.
3. **Preguntas guía** (15 min): Preguntas estándar + patrones de riesgo a considerar (candidatos del `risk-patterns.md`).
4. **Riesgos detectados** (15 min): La IA analiza el stack completo y evalúa cuáles patrones aplican al proyecto concreto.
5. **Alternativas** (10 min): Propuestas con pros/cons para cada riesgo.
6. **Acuerdos** (5 min): Documentar decisiones finales.

### architecture-decisions.md

Template con estructura por decisión: título, decisión, rationale, alternativas consideradas, riesgos aceptados y fecha. Se genera con `{{DATE}}` reemplazado por la fecha actual. No se sobrescribe si ya existe.

## Patrones de riesgo

`surfaceRiskPatterns()` lee `docs/funky-ai/assess/risk-patterns.md` del proyecto y lo superficia como sección "patrones a considerar" en la guía. Si el archivo no existe, se crea una primera vez copiando el template `risk-patterns-template.md`; si ya existe, no se sobrescribe (es un documento vivo del equipo).

El template incluye 4 patrones como ejemplos editables:

| Patrón | Señal a buscar en los canvases | Riesgo a considerar |
|---|---|---|
| K8s / Kubernetes | INFRA-CANVAS menciona K8s/Kubernetes | Costos operativos del clúster vs. PaaS |
| SQLite | INFRA-CANVAS elige SQLite | Límites de concurrencia; plan de migración |
| Single Node | INFRA-CANVAS describe un solo nodo | Downtime en deploys o fallos de hardware |
| Junior + Infraestructura Compleja | PROJECT-CANVAS junior + infra compleja | ¿DevOps dedicado o PaaS que abstraiga la complejidad? |

Los patrones son **candidatos a evaluar, no riesgos confirmados**: se insertan en la Fase 3 de la guía dentro de `{{DYNAMIC_QUESTIONS}}` y la IA los evalúa en la Fase 4 leyendo los canvases, decidiendo junto con el equipo cuáles aplican. El CLI no detecta ni filtra patrones por regex: el análisis real vive en la Fase 4.

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
│  4. Surface Risk Patterns                                   │
│     ├── si docs/funky-ai/assess/risk-patterns.md no existe  │
│     │   → copiar risk-patterns-template.md (no sobrescribe  │
│     │     si existe)                                        │
│     └── surfaceRiskPatterns(targetBase, templateContent)    │
│         └── lee risk-patterns.md del proyecto               │
│             └── sin regex, sin filtrado → {content,patterns}│
│                                                             │
│  5. Interpolate Template                                    │
│     └── templateContent                                     │
│         .replace('{{PROJECT_CANVAS_CONTENT}}', ...)         │
│         .replace('{{INFRA_CANVAS_CONTENT}}', ...)           │
│         .replace('{{DYNAMIC_QUESTIONS}}',                  │
│                  patrones a considerar)                     │
│                                                             │
│  6. Write Output                                            │
│     ├── docs/funky-ai/assess/architecture-review.md         │
│     │   └── Sobrescribe si existe                           │
│     ├── docs/funky-ai/assess/risk-patterns.md               │
│     │   └── Solo si no existe (documento vivo del equipo)   │
│     └── docs/funky-ai/assess/architecture-decisions.md      │
│         └── Solo si no existe (reemplaza {{DATE}})          │
│                                                             │
│  7. Write Context (si --context)                            │
│     └── ctx.assess.runAt = new Date().toISOString()         │
│     └── ctx.assess.dynamicQuestions = surfaceResult.patterns│
│     └── writeContext(targetBase, ctx)                       │
│                                                             │
│  8. Summary + Próximos pasos                                │
└─────────────────────────────────────────────────────────────┘
```

## Flags

| Flag | Descripción |
|---|---|
| `--context, -c <path>` | Ruta al `context.json` para integración con pipeline. Habilita la escritura de `assess.runAt` y `assess.dynamicQuestions` (nombres de patrones superfíciados) en el archivo de contexto. |

Sin `--context`, el comando ejecuta toda la lógica de canvas discovery, superficie de patrones y escritura de archivos, pero omite la actualización del pipeline context.
