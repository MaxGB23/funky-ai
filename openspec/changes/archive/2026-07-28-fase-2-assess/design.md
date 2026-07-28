# Design: Fase 2 — Assess (Discusión Arquitectónica)

## Technical Approach

Replace `funky assess` from binary evaluator to discussion facilitator. The command reads PROJECT-CANVAS + INFRA-CANVAS (root → docs/ fallback), validates completeness, generates C2 dynamic questions from canvas content patterns, interpolates a 6-phase discussion guide template, creates a decisions template (if not existing), and always exits 0.

## Architecture Decisions

### Decision: C1 static in template vs. JS-generated

| Option | Tradeoff | Decision |
|--------|----------|----------|
| C1 in template as static text | Simpler, no JS logic, user-editable. Questions are generic. | **Selected** — 3 C1 questions are hardcoded in architecture-review-template.md. No JS code generates them. |
| C1 as JS-generated with placeholders | Context-aware questions but couples template + JS. | Rejected — violates spec's "static" classification (R3). |

### Decision: Canvas discovery precedence

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Root only | Simple but breaks if user stores canvases in docs/ | Rejected — too rigid. |
| Root → docs/ fallback | Slightly more code, handles both project structures. | **Selected** — spec R1 requires this. |
| Configurable path | Most flexible but adds config surface before Phase 4. | Rejected — overengineering for current scope. |

### Decision: generateGuideQuestions() return shape

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Returns both C1 + C2 | Works but C1 is already in template → duplication risk. | Rejected — C1 lives in template. |
| Returns only C2 dynamic array | Clean separation. Template owns C1, JS owns C2. `{{DYNAMIC_QUESTIONS}}` placeholder. | **Selected** — function returns `{ dynamic: [{ category, question }] }`. |

### Decision: Decisions template location

`docs/architecture-decisions.md` — same pattern as `architecture-assessment.md` and other docs/ artifacts. Template copied only if file does not exist (R5).

## Data Flow

```
User runs: funky assess
  │
  ├─ 1. Canvas Discovery
  │     ├─ stat ./PROJECT-CANVAS.md → read | fallback: ./docs/PROJECT-CANVAS.md
  │     └─ stat ./INFRA-CANVAS.md   → read | fallback: ./docs/INFRA-CANVAS.md
  │
  ├─ 2. Canvas Validation
  │     └─ .includes('[Responde aquí]') → warn with section count
  │
  ├─ 3. generateGuideQuestions({ projectCanvas, infraCanvas })
  │     └─ Scan full text for keywords: K8s, SQLite, Single Node, Junior + complex
  │     └─ Return: { dynamic: [{ category, question }] }
  │
  ├─ 4. Interpolate architecture-review-template.md
  │     ├─ {{PROJECT_CANVAS_CONTENT}}  → canvas text or "Canvas no disponible"
  │     ├─ {{INFRA_CANVAS_CONTENT}}    → canvas text or "Canvas no disponible"
  │     └─ {{DYNAMIC_QUESTIONS}}       → markdown list from C2 results
  │
  ├─ 5. Write .agents/prompts/architecture-review.md (overwrite)
  │
  ├─ 6. Decisions template
  │     └─ if !exists docs/architecture-decisions.md → copy template
  │
  └─ 7. Print summary → exit 0
```

## File Changes

| File | Action | Lines | Description |
|------|--------|-------|-------------|
| `funky-cli/src/commands/assess.js` | Modify | ~80 | New action flow: canvas discovery → validation → guide gen → template interpolation → decisions. Keep `parseFrontmatter()` exported unchanged. |
| `funky-cli/src/utils/assessRules.js` | Modify | ~55 | `evaluateAssessment()` → `generateGuideQuestions(canvasData)` returning `{ dynamic: [] }`. Pattern scanning on canvas text content. |
| `funky-cli/src/templates/sdd/architecture-review-template.md` | Modify | ~80 | Replace adversarial prompt with 6-phase discussion guide + C1 static questions + placeholders. |
| `funky-cli/src/templates/sdd/architecture-decisions-template.md` | Create | ~35 | New decisions template: decisión, rationale, alternativas, riesgos, fecha. |
| `funky-cli/tests/assess.test.js` | Modify | ~40 | Add canvas discovery, validation, and guide generation tests. Keep existing parseFrontmatter tests. |
| `funky-cli/tests/assessRules.test.js` | Modify | ~85 | Refactor from `evaluateAssessment` to `generateGuideQuestions` tests: C2 pattern matching, no-pattern case, edge cases. |

## Interfaces / Contracts

```js
// assessRules.js — new export replaces evaluateAssessment()
function generateGuideQuestions(canvasData: {
  projectCanvas: string;  // full text of PROJECT-CANVAS.md or empty string
  infraCanvas: string;    // full text of INFRA-CANVAS.md or empty string
}): {
  dynamic: Array<{ category: string; question: string }>;
}

// Pattern detection (scan text, case-insensitive):
//   category: "K8s"       → infraCanvas matches /K8s|kubernetes/i
//   category: "SQLite"    → infraCanvas matches /SQLite/i
//   category: "SingleNode" → infraCanvas matches /single\s*nodo?|single\s*node/i
//   category: "Junior"    → (projectCanvas + infraCanvas) matches /junior/i
//                          AND infraCanvas matches /K8s|kubernetes/i

// assess.js — keep exported unchanged:
function parseFrontmatter(content: string): Record<string, string>;

// Template placeholders:
//   {{PROJECT_CANVAS_CONTENT}}  — replaced with full canvas text or placeholder
//   {{INFRA_CANVAS_CONTENT}}    — replaced with full canvas text or placeholder
//   {{DYNAMIC_QUESTIONS}}       — replaced with markdown list of C2 questions or empty
```

## Template Content Design

### architecture-review-template.md (replaces existing)

```
# 🗣️ Guía de Discusión Arquitectónica

> Generado por `funky assess`. Usá este documento como estructura para tu sesión de discusión.

## Contexto del Proyecto

### PROJECT-CANVAS
{{PROJECT_CANVAS_CONTENT}}

### INFRA-CANVAS
{{INFRA_CANVAS_CONTENT}}

## Fases de la Discusión

### Fase 1: Contexto (5 min)
Confirmar stack elegido y NFRs. Leer los canvases embebidos arriba.
La IA descubre los NFRs preguntando al equipo.

### Fase 2: Preocupaciones del Equipo (10 min)
¿Qué les preocupa de la arquitectura actual? ¿Dónde ven riesgos? ¿Hay algo que no esté claro?

### Fase 3: Preguntas Guía (15 min)
- **Budget e Infraestructura**: ¿El presupuesto mensual alcanza para la infraestructura elegida? Considerá costos de hosting, servicios, y herramientas.
- **Concurrencia y Base de Datos**: ¿La base de datos soporta la concurrencia esperada? Revisá límites de conexiones y estrategias de escalado.
- **SLA y Redundancia**: ¿La arquitectura elegida puede cumplir el SLA? Un solo nodo implica downtime en deploys y fallos.

{{DYNAMIC_QUESTIONS}}

### Fase 4: Riesgos Detectados (15 min)
La IA analiza el stack completo buscando incompatibilidades conocidas, trade-offs no documentados, y riesgos operacionales.

### Fase 5: Alternativas (10 min)
Para cada riesgo identificado, proponé al menos una alternativa con pros/cons concretos.

### Fase 6: Acuerdos (5 min)
Documentar las decisiones finales en docs/architecture-decisions.md. Incluir rationale, alternativas descartadas, y riesgos aceptados.
```

### architecture-decisions-template.md (new)

```
# Decisiones Arquitectónicas

> Completar durante o después de la sesión de discusión.
> Cada decisión debe incluir qué se decidió, por qué, qué alternativas se consideraron, y qué riesgos se aceptaron.
> Fecha de generación: {{DATE}}

## Decisiones

### [Decisión 1: Título breve]
- **Decisión:** ...
- **Rationale:** ...
- **Alternativas consideradas:** ...
- **Riesgos aceptados:** ...
- **Fecha:** {{DATE}}

### [Decisión 2: Título breve]
- **Decisión:** ...
- **Rationale:** ...
- **Alternativas consideradas:** ...
- **Riesgos aceptados:** ...
- **Fecha:** {{DATE}}
```

## Error Handling Strategy

| Condition | Behavior |
|-----------|----------|
| Canvas not found (one or both) | `console.warn("⚠️ ...")` + use "Canvas no disponible" as content. Continue. |
| Canvas contains `[Responde aquí]` | `console.warn("⚠️ ...")` with count. Continue with partial content. |
| FS read/write permission error | `console.warn("⚠️ ...")` with error message. Continue. |
| Template file missing (architecture-review-template.md) | Throw — template ships with the CLI, this is a broken install. |
| Any other error | `console.warn` + exit 0. Never exit non-zero. |
| Output already exists (.agents/prompts/architecture-review.md) | Overwrite silently (R3 scenario). |
| decisions template already exists | Skip + log notice (R5 scenario). |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | `generateGuideQuestions()` | Each C2 pattern triggers correct question. No patterns = empty array. Empty canvas strings. |
| Unit | Canvas validation | Content with `[Responde aquí]` → returns warning indicators. Clean content → no warnings. |
| Unit | Canvas discovery | Mock fs.existsSync for root/docs/ combinations. Test all 4 location scenarios. |
| Unit | `parseFrontmatter()` | Keep existing backward-compat tests. No changes needed. |
| Integration | Full assess flow | Vitest with mock fs: both canvases in root, in docs/, missing scenarios. Verify output file content. |
| Integration | Exit code | All scenarios assert exit 0. Use process.exit spy. |
| Integration | Decisions template | First run creates, second run skips. Assert file content and log messages. |

## Threat Matrix

**N/A** — `funky assess` reads/writes files only (no routing, shell commands, subprocesses, VCS/PR automation, executable-file classification, or process-integration boundaries).

## Migration / Rollout

No migration required. The old `architecture-assessment.md` file in user projects is left untouched — assess simply stops reading it. The old review template is replaced in the CLI package; git history preserves the original.

## Open Questions

- [ ] None — all decisions resolved by spec and constraints.
