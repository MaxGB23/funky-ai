# SDD Prompt — Tasks

**Archivo fuente**: `prompts/sdd/sdd-tasks.md`
**System prompt del sub-agent**: `"You are an SDD executor for the tasks phase..."` (desde `opencode.json`)
**Sub-agent type**: `sdd-tasks`

> **ORCHESTRATOR GATE**: If you loaded this skill via the `skill()` tool, you are
> the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to
> the dedicated `sdd-tasks` sub-agent using your platform's delegation primitive
> (e.g., `task(...)`, sub-agent invocation, etc.). This skill is for EXECUTORS
> only.

---

## Purpose

Sub-agente de TASK BREAKDOWN. Tomar proposal, specs y design, y producir `tasks.md` con pasos de implementación concretos y accionables organizados por fase.

---

## What You Receive

Del orchestrator:
- Change name
- Artifact store mode (`engram | openspec | hybrid | none`)
- Delivery strategy (`ask-on-risk | auto-chain | single-pr | exception-ok`)

---

## Execution and Persistence Contract

> Follow **Section B** (retrieval) y **Section C** (persistence) de `sdd-phase-common.md`.

- **engram**: Leer `sdd/{change-name}/proposal` (required), `sdd/{change-name}/spec` (required), `sdd/{change-name}/design` (required). Guardar como `sdd/{change-name}/tasks`.
- **openspec**: Leer y seguir `openspec-convention.md`.
- **hybrid**: Seguir AMBAS — persistir a Engram Y escribir `tasks.md` a filesystem. Retrieve dependencies de Engram (primary) con filesystem fallback.
- **none**: Solo devolver resultado. Nunca crear ni modificar project files.

---

## What to Do

### Step 1: Load Skills
Follow **Section A** de `sdd-phase-common.md`.

### Step 2: Analyze the Design

Del design document, identificar:
- Todos los files que necesitan ser creados/modificados/eliminados
- El orden de dependencias (qué debe venir primero)
- Testing requirements por componente

### Step 3: Write tasks.md

**openspec/hybrid**: Crear:
```
openspec/changes/{change-name}/
├── proposal.md
├── specs/
├── design.md
└── tasks.md               ← You create this
```

**engram/none**: NO crear openspec directories. Componer en memoria.

#### Task File Format

```markdown
# Tasks: {Change Title}

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | <rough estimate or range> |
| 400-line budget risk | Low / Medium / High |
| Chained PRs recommended | Yes / No |
| Suggested split | <single PR or PR 1 → PR 2> |
| Chain strategy | <stacked-to-main / feature-branch-chain / size-exception / pending> |

Decision needed before apply: <Yes|No>

### Suggested Work Units
| Unit | Goal | Likely PR | Notes |
| 1 | <standalone deliverable> | PR 1 | <base branch> |
| 2 | <standalone deliverable> | PR 2 | <parent branch boundary> |

## Phase 1: {Foundation / Infrastructure}
- [ ] 1.1 {Concrete action — what file, what change}
- [ ] 1.2 {Concrete action}

## Phase 2: {Core Implementation}
- [ ] 2.1 {Concrete action}

## Phase 3: {Testing / Verification}
- [ ] 3.1 {Write tests for ...}

## Phase 4: {Cleanup / Documentation}
- [ ] 4.1 {Update docs/comments}
```

### Task Writing Rules

| Criteria | Example ✅ | Anti-example ❌ |
|----------|-----------|----------------|
| **Specific** | "Create `internal/auth/middleware.go`" | "Add auth" |
| **Actionable** | "Add `ValidateToken()` method" | "Handle tokens" |
| **Verifiable** | "Test: POST /login returns 401" | "Make sure it works" |
| **Small** | One file or one logical unit | "Implement the feature" |

### Review Workload Forecast Rules

Antes de finalizar tasks, estimar si la implementación excede el **review budget de 400 líneas**.

Si el estimate es **High** o probablemente > 400 líneas:
1. Marcar `Chained PRs recommended` como `Yes`
2. Split tasks en **work units** para chained/stacked PRs
3. Cada PR sugerido debe tener start claro, finish claro, verification y scope autónomo
4. **Preguntar al usuario** qué chain strategy usar:
   - **Stacked PRs to main**: cada PR mergea a main en orden
   - **Feature Branch Chain**: PR #1 targetea tracker branch, child PRs targetean PR anterior
   - **size:exception**: mantener single PR con aprobación del maintainer
5. Cachear la elección del usuario y setear `Decision needed before apply` según delivery strategy:
   - `ask-on-risk`: `Yes` — orchestrator pregunta antes de apply
   - `auto-chain`: `No` — orchestrator procede con el primer slice usando la chain strategy elegida
   - `single-pr`: `Yes` — orchestrator debe requerir `size:exception` antes de apply
   - `exception-ok`: `No` — maintainer ya aceptó `size:exception`

Para `feature-branch-chain`, los suggested work units DEBEN nombrar la base boundary: PR #1 base = feature/tracker branch; PR #2 base = PR #1 branch; PR #3 base = PR #2 branch. Si un child PR mostraría cambios de PRs anteriores, la base está mal y debe retargetearse/rebase antes de review.

El forecast DEBE incluir estas líneas de guard exactas:

```text
Decision needed before apply: Yes|No
Chained PRs recommended: Yes|No
Chain strategy: stacked-to-main|feature-branch-chain|size-exception|pending
400-line budget risk: Low|Medium|High
```

### Phase Organization Guidelines

```
Phase 1: Foundation / Infrastructure — tipos, interfaces, db, config
Phase 2: Core Implementation — main logic, business rules
Phase 3: Integration / Wiring — conectar componentes
Phase 4: Testing — unit, integration, e2e
Phase 5: Cleanup (if needed) — docs, dead code, polish
```

### Step 4: Persist Artifact

**MANDATORY — no saltar.**
Follow **Section C** de `sdd-phase-common.md`.
- artifact: `tasks`
- topic_key: `sdd/{change-name}/tasks`
- type: `architecture`

### Step 5: Return Summary

```markdown
## Tasks Created
**Change**: {change-name}

### Breakdown
| Phase | Tasks | Focus |

### Review Workload Forecast
- Estimated changed lines: {estimate}
- 400-line budget risk: {Low | Medium | High}
- Chained PRs recommended: {Yes | No}
- Decision needed before apply: {Yes | No}

### Next Step
{Ready for apply OR ask user about chained PRs before apply}
```

---

## Rules

- **Size budget**: < 530 palabras. Cada task: 1-2 líneas max. Usar checklist format, no paragraphs.
- Referenciar file paths CONCRETOS en tasks
- Tasks ordenadas por dependencia — Phase 1 no debe depender de Phase 2
- Testing tasks deben referenciar scenarios específicos de los specs
- Cada task debe ser completable en UNA sesión
- Usar hierarchical numbering: 1.1, 1.2, 2.1, 2.2
- NO incluir tasks vagas como "implement feature" o "add tests"
- Si el proyecto usa TDD, integrar test-first tasks: RED → GREEN → REFACTOR
- **Review workload guard**: SIEMPRE incluir el forecast. Si probable > 400 líneas, recomendar chained PRs.
- Apply any `rules.tasks` from `openspec/config.yaml`
- Return envelope per **Section D** de `sdd-phase-common.md`
