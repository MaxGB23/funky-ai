# funky assess — Architecture Review

## ¿Qué problema resuelve?

Evalúa el stack tecnológico del proyecto, detecta riesgos arquitectónicos y genera una guía de discusión para documentar decisiones. Parte del contenido de los canvases (`PROJECT-CANVAS.md`, `INFRA-CANVAS.md`) y aplica reglas dinámicas que detectan patrones de riesgo conocidos (K8s en proyectos chicos, SQLite sin plan de escalado, equipos junior con infraestructura compleja, single node sin tolerancia a fallos).

## ¿Cuándo usarlo standalone?

- Proyecto chico o exploración rápida donde se necesita una revisión arquitectónica sin encadenar con otros comandos.
- Basta con ejecutar `funky assess` y seguir la guía generada en `docs/funky-ai/assess/architecture-review.md`.

## ¿Cuándo usarlo con pipeline?

- Como paso intermedio del pipeline (`funky pipeline assess`), cuando se necesita compartir estado con el comando `estimate`.
- El flag `--context` (o la ejecución vía pipeline) actualiza `docs/funky-ai/pipeline/context.json` con la fecha de ejecución y las preguntas dinámicas generadas, permitiendo que `estimate` consuma ese estado.

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

### Validación de canvases

`findCanvases()` lee ambos archivos y cuenta cuántas secciones contienen el texto `[Responde aquí]`. Si hay secciones sin completar, se muestra una advertencia con la cantidad detectada.

## Outputs

| Output | Condición | Descripción |
|---|---|---|
| `docs/funky-ai/assess/architecture-review.md` | Siempre (no sobrescribe si existe) | Guía de discusión con canvases embebidos y preguntas dinámicas |
| `docs/funky-ai/assess/architecture-decisions.md` | Solo si no existe | Template para documentar decisiones durante la sesión |
| `docs/funky-ai/pipeline/context.json` | Solo con `--context` | Actualiza `assess.runAt` y `assess.dynamicQuestions` |

### architecture-review.md

Contiene los canvases completos embebidos y una guía estructurada en 6 fases:

1. **Contexto** (5 min): Confirmar stack y NFRs.
2. **Preocupaciones del equipo** (10 min): Riesgos percibidos por el equipo.
3. **Preguntas guía** (15 min): Preguntas estándar + preguntas dinámicas generadas por `generateGuideQuestions()`.
4. **Riesgos detectados** (15 min): Análisis de incompatibilidades y trade-offs.
5. **Alternativas** (10 min): Propuestas con pros/cons para cada riesgo.
6. **Acuerdos** (5 min): Documentar decisiones finales.

### architecture-decisions.md

Template con estructura por decisión: título, decisión, rationale, alternativas consideradas, riesgos aceptados y fecha. Se genera con `{{DATE}}` reemplazado por la fecha actual. No se sobrescribe si ya existe.

## Preguntas dinámicas

`generateGuideQuestions()` recibe el contenido de ambos canvases y aplica reglas basadas en expresiones regulares:

| Disparador | Pregunta generada |
|---|---|
| `k8s` o `kubernetes` en INFRA-CANVAS | ¿Evaluaron costos operativos de un clúster? En proyectos pequeños puede ser más caro que un PaaS. |
| `sqlite` en INFRA-CANVAS | SQLite tiene límites de concurrencia. ¿Plan de migración a PostgreSQL u otro motor? |
| `single node` o `single nodo` en INFRA-CANVAS | Un solo nodo causa downtime en deploys o fallos. ¿Ventanas de mantenimiento o tolerancia a downtime? |
| `junior` en combined + `k8s`/`kubernetes` en INFRA-CANVAS | Equipo junior con infraestructura compleja. ¿DevOps dedicado o PaaS que abstraiga complejidad? |

Las preguntas se insertan en la Fase 3 de la guía dentro de `{{DYNAMIC_QUESTIONS}}`. Si no se dispara ninguna regla, la sección queda vacía.

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
│  4. Generate Guide Questions                                │
│     └── generateGuideQuestions({projectCanvas, infraCanvas})│
│         ├── /k8s|kubernetes/                                │
│         ├── /sqlite/                                        │
│         ├── /single\s*nodo?|single\s*node/                  │
│         └── /junior/ + /k8s|kubernetes/                     │
│                                                             │
│  5. Interpolate Template                                    │
│     └── templateContent                                     │
│         .replace('{{PROJECT_CANVAS_CONTENT}}', ...)         │
│         .replace('{{INFRA_CANVAS_CONTENT}}', ...)           │
│         .replace('{{DYNAMIC_QUESTIONS}}', ...)              │
│                                                             │
│  6. Write Output                                            │
│     ├── docs/funky-ai/assess/architecture-review.md         │
│     │   └── No sobrescribe si existe                        │
│     └── docs/funky-ai/assess/architecture-decisions.md      │
│         └── Solo si no existe (reemplaza {{DATE}})          │
│                                                             │
│  7. Write Context (si --context)                            │
│     └── ctx.assess.runAt = new Date().toISOString()         │
│     └── ctx.assess.dynamicQuestions = dynamicQuestions[]    │
│     └── writeContext(targetBase, ctx)                       │
│                                                             │
│  8. Summary + Próximos pasos                                │
└─────────────────────────────────────────────────────────────┘
```

## Flags

| Flag | Descripción |
|---|---|
| `--context, -c <path>` | Ruta al `context.json` para integración con pipeline. Habilita la escritura de `assess.runAt` y `assess.dynamicQuestions` en el archivo de contexto. |

Sin `--context`, el comando ejecuta toda la lógica de canvas discovery, generación de preguntas y escritura de archivos, pero omite la actualización del pipeline context.
