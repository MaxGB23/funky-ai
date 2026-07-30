# Propuesta — Consolidación de documentación: funky-forge vs funky-ai

> Estado: propuesta
> Fecha: 2026-07-30

---

## Contexto

Actualmente toda la documentación operativa convive bajo `docs/funky-ai/`, pero responde a dos dominios distintos:

- **funky-ai** — el framework agéntico (reglas, templates SDD, conceptos del ecosistema)
- **funky-forge** — las tools de planeación de proyecto asistida con IA

Además, comandos como `feature` y `engram add` pertenecen al framework, no a la planeación.

## Árbol objetivo

```
docs/
├── funky-ai/                          ← Framework agéntico
│   ├── conceptos/                     ← (se queda)
│   ├── drafts/                        ← (se queda)
│   ├── guias/                         ← (se queda: funky-ai.md, team-guide, sdd-survival-guide, testing)
│   ├── historico/                     ← (se queda)
│   ├── journey/                       ← (se queda)
│   ├── releases/                      ← (se queda)
│   ├── operaciones/qa-governance.md   ← (se queda — único de operaciones que es framework)
│   │
│   ├── scaffold.md                    ← NUEVO — qué inyecta, árbol completo, diagrama
│   ├── feature.md                     ← NUEVO — tiers, inyección por tier, golden vs fallback
│   └── engram.md                      ← NUEVO — knowledge base, categorías, CLI flags
│
├── funky-forge/                       ← Project planning
│   ├── README.md                      ← NUEVO — mapa de navegación de forge
│   ├── command-flow.md                ← NUEVO — resumen ejecutivo: tabla de comandos, cuándo usar cada uno
│   ├── init.md                        ← NUEVO — canvases, flujo, preguntas guía, outputs
│   ├── assess.md                      ← NUEVO — architecture review, preguntas dinámicas
│   ├── estimate.md                    ← NUEVO — pricing guide, decisiones de costos
│   └── pipeline.md                    ← NUEVO — cuándo pipeline vs comandos solos, context.json
│
│   └── [Archivos movidos desde funky-ai/]
│       ├── escenarios-de-uso.md       ← MOVER
│       ├── funky-init-flow.md         ← MOVER
│       ├── guia-flujo-completo.md     ← MOVER
│       ├── cli-simulations.md         ← MOVER
│       └── comando-vs-archivos.md     ← MOVER
│
└── references/                        ← (vacío, no se usa por ahora)
```

## Dominios por comando

| Comando | Dominio | Docs |
|---------|---------|------|
| `funky scaffold` | **funky-ai** | `docs/funky-ai/scaffold.md` |
| `funky feature` | **funky-ai** | `docs/funky-ai/feature.md` |
| `funky engram add` | **funky-ai** | `docs/funky-ai/engram.md` |
| `funky init` | **forge** | `docs/funky-forge/init.md` |
| `funky assess` | **forge** | `docs/funky-forge/assess.md` |
| `funky estimate` | **forge** | `docs/funky-forge/estimate.md` |
| `funky pipeline` | **forge** | `docs/funky-forge/pipeline.md` |

## Contenido de cada doc nuevo

### Documentos de forge (`docs/funky-forge/`)

#### `README.md`
- Mapa de navegación: qué archivos hay en este directorio y para qué sirve cada uno
- Relación con `docs/funky-ai/` — forge es tools de planeación, funky-ai es el framework

#### `command-flow.md`
- Resumen ejecutivo: tabla de un vistazo con todos los comandos forge
- ¿Cuándo usar cada comando? — criterios de decisión
- ¿Cuándo NO usar cada comando? — anti-patrones
- Sin árboles extensos ni diagramas — eso va en cada archivo individual

#### `init.md`
- ¿Qué problema resuelve? — pasar de idea difusa a proyecto esbociado
- ¿Cuándo usarlo? — siempre es el paso 1
- Árbol: templates/init/ → docs/funky-ai/canvas/
- Diagrama de flujo: findCanvases → runInit → executeIntentions
- `canvas-planning-guide.md`: qué es y por qué se copia solo si no existe

#### `assess.md`
- ¿Qué problema resuelve? — evaluar stack, identificar riesgos, documentar decisiones
- ¿Cuándo usarlo standalone? — proyecto chico, sin pipeline
- ¿Cuándo usarlo con pipeline? — proyecto multi-fase
- Inputs: canvases desde `docs/funky-ai/canvas/`, templates desde `src/templates/assess/`
- Outputs: `architecture-review.md`, `architecture-decisions.md`
- Preguntas dinámicas: cómo funciona `generateGuideQuestions()`
- Diagrama de flujo con condiciones

#### `estimate.md`
- ¿Qué problema resuelve? — estimar costos de infra y servicios
- ¿Cuándo usarlo standalone? — proyecto chico
- ¿Cuándo usarlo con pipeline? — requiere assess previo
- Inputs: canvases + architecture-decisions.md + templates
- Outputs: `pricing-guide.md`, `pricing-decisions.md`, stdout prompt IA
- Diagrama de flujo

#### `pipeline.md`
- ¿Qué problema resuelve? — orquestar assess + estimate con estado compartido
- **¿Cuándo usar pipeline vs comandos individuales?**
  - Pipeline: proyectos multi-fase con seguimiento de estado
  - Comandos individuales: proyectos chicos, exploración rápida, una sola fase
- **context.json**:
  - Estructura y campos
  - Cómo se crea (initContext)
  - Cómo se actualiza (con --context flag)
  - Cómo se lee (readContext)
  - **Anti-patrones:** NO duplica canvases, NO se edita a mano, NO es un reemplazo de los archivos en disco
  - Diagrama: pipeline assess → context.json → pipeline estimate

### Documentos de funky-ai (`docs/funky-ai/`)

#### `scaffold.md`
- ¿Qué problema resuelve? — instalar el ecosistema agéntico en un proyecto
- Árbol completo de lo que inyecta:
  - Root files: ORCHESTRATOR-STATE.md, README.md, TEMPLATE_GUIDE.md
  - `.agents/rules/` — 24 archivos (8 reglas + 6 t2-delegation + 8 t3-interactive + risk-decision)
  - `.agents/templates/sdd/` — 8 templates + docs-live-index.md + docs-index/
  - `openspec/rfcs/000-rfc-template.md` — excepción
  - `docs/engram/` — 7 directorios sharded
- Diagrama de flujo de `runScaffold()`

#### `feature.md`
- ¿Qué problema resuelve? — scaffolding de cambios SDD bajo `openspec/changes/`
- Tiers (T1/T2/T3): qué inyecta cada uno
  - T1: tasks.md + report.md
  - T2: base + tier + docs? + release.md
  - T3: tasks.md + docs? + release.md
- Golden templates (`.agents/templates/sdd/`) vs fallback (CLI)
- Diagrama de flujo: selectTier → resolveFiles → executeIntentions

#### `engram.md`
- ¿Qué problema resuelve? — capturar conocimientos, decisiones y bugs
- Categorías: architecture, pattern, discovery, decision, bugfix, session, release
- Flags: --tag, --category, --desc
- Qué genera: `docs/engram/{category}/{tag}.md` + actualiza `docs/engram/index.md`
- Buenas prácticas: cuándo capturar un engrama, qué poner en cada campo

## Archivos a mover

| Origen | Destino |
|--------|---------|
| `docs/funky-ai/operaciones/cli-simulations.md` | `docs/funky-forge/cli-simulations.md` |
| `docs/funky-ai/operaciones/escenarios-de-uso.md` | `docs/funky-forge/escenarios-de-uso.md` |
| `docs/funky-ai/operaciones/funky-init-flow.md` | `docs/funky-forge/funky-init-flow.md` |
| `docs/funky-ai/operaciones/guia-flujo-completo.md` | `docs/funky-forge/guia-flujo-completo.md` |
| `docs/funky-ai/guias/comando-vs-archivos.md` | `docs/funky-forge/comando-vs-archivos.md` |

Estos archivos se mueven, no se copian. Si tenían referencias cruzadas entre sí, se actualizan los paths relativos.

## Archivos que NO se mueven

- `docs/funky-ai/conceptos/` (todo) — framework
- `docs/funky-ai/guias/funky-ai.md` — framework
- `docs/funky-ai/guias/funky-ai-team-guide.md` — framework
- `docs/funky-ai/guias/sdd-survival-guide.md` — framework
- `docs/funky-ai/guias/testing-local-vs-ci.md` — framework
- `docs/funky-ai/operaciones/qa-governance.md` — framework
- `docs/funky-ai/historico/` — framework
- `docs/funky-ai/drafts/` — framework
- `docs/funky-ai/journey/` — framework
- `docs/funky-ai/releases/` — framework

## Lo que NO cambia

- El CLI y los comandos: `funky init` sigue siendo `funky init`, no pasa a `funky forge init`.
- `init-observaciones/` se queda como está — es el registro histórico de la refactor.
- El código no se toca.

## Plan de ejecución

```
Fase 1: Estructura
  1. Crear docs/funky-forge/
  2. Escribir docs/funky-forge/README.md
  3. Mover los 5 archivos de funky-ai → funky-forge
  4. Actualizar referencias cruzadas

Fase 2: Documentos de forge
  5. command-flow.md
  6. init.md
  7. assess.md
  8. estimate.md
  9. pipeline.md

Fase 3: Documentos de funky-ai
  10. scaffold.md
  11. feature.md
  12. engram.md

Fase 4: Cierre
  13. Actualizar init-observaciones/roadmap/diagrama-comandos.md con banner deprecated
  14. Commit
```

## Notas

- `docs/references/` existe pero está vacío. No se usa en esta propuesta.
- No se crean diagramas visuales (imágenes) en esta etapa — los diagramas son ASCII flow dentro de cada archivo.
- El `command-flow.md` es resumen ejecutivo, no reemplaza a los archivos individuales.
