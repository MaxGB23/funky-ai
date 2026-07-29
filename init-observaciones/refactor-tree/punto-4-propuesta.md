# Punto 4 — Propuesta de organización de templates

## Tree propuesto

```
funky-cli/src/templates/
│
├── init/              ← funky init (sin flags)
│   ├── PROJECT-CANVAS.md
│   ├── INFRA-CANVAS.md
│   └── canvas-planning-guide.md
│
├── bootstrap/         ← funky init --bootstrap (futuro comando independiente)
│   ├── ORCHESTRATOR-STATE.md
│   ├── TEMPLATE_GUIDE.md
│   └── sdd/           ← 9 archivos (explore, proposal, spec, tasks, etc.)
│
├── assess/            ← funky assess
│   ├── architecture-review-template.md
│   └── architecture-decisions-template.md
│
└── estimate/          ← funky estimate
    ├── pricing-guide-template.md
    └── pricing-decisions-template.md
```

**Eliminado:** `funky-pipeline/` (contenido redistribuido)

| Archivo | Nuevo destino |
|---------|--------------|
| `architecture-review-template.md` | `assess/` |
| `architecture-decisions-template.md` | `assess/` |
| `pricing-guide-template.md` | `estimate/` |
| `pricing-decisions-template.md` | `estimate/` |
| `canvas-planning-guide.md` | `init/` |
| `architecture-assessment.md` | **eliminar** (no lo usa ningún comando) |

---

## Output tree propuesto (`docs/funky-ai/`)

Los archivos generados por los comandos se agrupan bajo `docs/funky-ai/` para tener todo el estado del pipeline accesible desde un mismo lugar.

```
docs/funky-ai/
├── canvas/
│   ├── PROJECT-CANVAS.md
│   ├── INFRA-CANVAS.md
│   └── canvas-planning-guide.md
├── assess/
│   ├── architecture-review.md
│   └── architecture-decisions.md
├── estimate/
│   ├── pricing-guide.md
│   └── pricing-decisions.md
└── pipeline/
    └── context.json
```

### context.json — simplificado a metadatos

**Decisión:** `docs/funky-ai/pipeline/context.json` (no en raíz del proyecto).

**Simplificación:** Se elimina el duplicado de contenido de canvases. `context.json` guarda solo metadatos — las fases leen los archivos directamente desde `docs/funky-ai/canvas/` o `docs/funky-ai/assess/`.

```json
{
  "version": 1,
  "createdAt": "<ISO>",
  "assess": {
    "runAt": "<ISO|null>",
    "dynamicQuestions": []
  },
  "estimate": {
    "runAt": "<ISO|null>"
  },
  "pipeline": {
    "lastCommand": null,
    "completed": []
  }
}
```

**Razones:**
1. **Coherencia** — todo el pipeline está bajo `docs/funky-ai/`, no tiene sentido que `context.json` quede en la raíz del proyecto
2. **Sin duplicación** — los canvases ya existen como archivos en `docs/funky-ai/canvas/`. pipeline estimate lee de ahí directamente, como hace el standalone
3. **Simplificación** — menos datos en context.json = menos riesgo de stale data, menos bytes, más fácil de debuggear

**Impacto en los diagramas:**
- `pipeline assess`: `initContext()` ya no scanea canvases, solo crea metadatos
- `pipeline estimate`: lee canvases desde `docs/funky-ai/canvas/`, decisions desde `docs/funky-ai/assess/`, no desde context.json
- `context.json` solo trackea qué fases se ejecutaron y cuándo

> 📖 Explicación detallada de context.json, el flag `--context` y escenarios de uso en [punto-4-context-json.md](./punto-4-context-json.md)

---

## Diagramas de flujo

```
┌──────────────────────────────────────────────────────────────┐
│                       funky init                              │
│                                                               │
│   findCanvases() → ¿existen PROJECT/INFRA en destino?         │
│        │                                                     │
│        ├── sí → skip (no sobreescribe)                       │
│        │                                                     │
│        └── no → runInit() → intentions:                      │
│                  ├── COPY PROJECT-CANVAS.md (init/)           │
│                  │     → docs/funky-ai/canvas/                │
│                  ├── COPY INFRA-CANVAS.md (init/)             │
│                  │     → docs/funky-ai/canvas/                │
│                  └── COPY canvas-planning-guide.md (init/)    │
│                        → docs/funky-ai/canvas/                │
│                     │                                        │
│                     ▼                                        │
│                  executeIntentions() → { created, skipped }   │
└──────────────────────────────────────────────────────────────┘
```


```
┌──────────────────────────────────────────────────────────────┐
│                     funky assess                              │
│        (standalone o vía pipeline)                            │
│                                                               │
│   LEE docs/funky-ai/canvas/PROJECT-CANVAS.md                  │
│   LEE docs/funky-ai/canvas/INFRA-CANVAS.md                    │
│   (advierte si no existen, usa placeholder)                   │
│        │                                                     │
│        ▼                                                     │
│   validate canvases (cuenta [Responde aquí])                  │
│        │                                                     │
│        ▼                                                     │
│   generateGuideQuestions()                                    │
│     → preguntas dinámicas según contenido (K8s, SQLite, etc.) │
│        │                                                     │
│        ▼                                                     │
│   LEE src/templates/assess/architecture-review-template.md    │
│   interpola: {{PROJECT_CANVAS_CONTENT}}                       │
│              {{INFRA_CANVAS_CONTENT}}                         │
│              {{DYNAMIC_QUESTIONS}}                            │
│        │                                                     │
│        ▼                                                     │
│   ESCRIBE docs/funky-ai/assess/architecture-review.md         │
│        │                                                     │
│        ▼                                                     │
│   COPIA architecture-decisions-template.md →                  │
│     docs/funky-ai/assess/architecture-decisions.md            │
│   (solo si no existe)                                        │
│        │                                                     │
│        ▼                                                     │
│   Si --context: actualiza docs/funky-ai/pipeline/context.json │
│     (assess.runAt + dynamicQuestions)                         │
└──────────────────────────────────────────────────────────────┘
```


```
┌──────────────────────────────────────────────────────────────┐
│                    funky estimate                              │
│        (standalone o vía pipeline)                            │
│                                                               │
│   LEE docs/funky-ai/canvas/PROJECT-CANVAS.md                  │
│   LEE docs/funky-ai/canvas/INFRA-CANVAS.md                    │
│   LEE docs/funky-ai/assess/architecture-decisions.md          │
│   (advierte si alguno no existe, usa placeholder)             │
│        │                                                     │
│        ▼                                                     │
│   LEE src/templates/estimate/pricing-guide-template.md        │
│   interpola: {{DECISIONS_CONTENT}}                            │
│              {{PROJECT_CANVAS_CONTENT}}                       │
│              {{INFRA_CANVAS_CONTENT}}                         │
│        │                                                     │
│        ▼                                                     │
│   ESCRIBE docs/funky-ai/estimate/pricing-guide.md             │
│        │                                                     │
│        ▼                                                     │
│   LEE src/templates/estimate/pricing-decisions-template.md    │
│   interpola: {{DATE}}                                         │
│        │                                                     │
│        ▼                                                     │
│   ESCRIBE docs/funky-ai/estimate/pricing-decisions.md         │
│        │                                                     │
│        ▼                                                     │
│   STDOUT: prompt IA (banner + cuerpo + footer)                │
│        │                                                     │
│        ▼                                                     │
│   Si --context: actualiza docs/funky-ai/pipeline/context.json │
│     (estimate.runAt)                                          │
└──────────────────────────────────────────────────────────────┘
```


```
┌──────────────────────────────────────────────────────────────┐
│                   funky pipeline                               │
│                                                               │
│   docs/funky-ai/pipeline/context.json (metadatos)             │
│   {                                                            │
│     "assess":   { runAt, dynamicQuestions }                    │
│     "estimate": { runAt }                                      │
│     "pipeline": { lastCommand, completed }                     │
│   }                                                            │
│                                                               │
│   NOTA: context.json ya NO contiene canvases duplicados.      │
│   Las fases leen directamente de docs/funky-ai/canvas/ y      │
│   docs/funky-ai/assess/.                                      │
│                                                               │
│   pipeline assess:                                             │
│     ├── readContext() ──¿existe?──► no ──► initContext()      │
│     │                                       + writeContext()   │
│     │                                      │                  │
│     │                    sí ◄───────────────                  │
│     ▼                                                         │
│     └──► runAssess(targetBase, { context })                   │
│           → context.json actualizado (assess.runAt)            │
│           → outputs en docs/funky-ai/assess/                  │
│                                                               │
│   pipeline estimate:                                           │
│     ├── readContext() ──¿existe?──► no ──► EXIT ❌            │
│     ├── ctx.assess.runAt ──¿null?──► sí ──► EXIT ❌           │
│     │                                                         │
│     └──► runEstimate(targetBase, { context })                 │
│           → context.json actualizado (estimate.runAt)          │
│           → outputs en docs/funky-ai/estimate/                │
│                                                               │
│   pipeline all:                                                │
│     └──► pipeline assess ──► pipeline estimate                 │
│           (si assess falla, no corre estimate)                 │
│                                                               │
│   pipeline status:                                             │
│     └──► readContext() → stdout (createdAt,                   │
│            assess.runAt, estimate.runAt)                       │
│                                                               │
│   NOTA: pipeline no tiene templates propios.                  │
│   Solo orquesta assess y estimate con estado compartido.      │
└──────────────────────────────────────────────────────────────┘
```
