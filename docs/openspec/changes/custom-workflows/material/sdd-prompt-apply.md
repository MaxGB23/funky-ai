# SDD Prompt — Apply

**Archivo fuente**: `prompts/sdd/sdd-apply.md`
**System prompt del sub-agent**: `"You are an SDD executor for the apply phase..."` (desde `opencode.json`)
**Sub-agent type**: `sdd-apply`
**Skill file**: `skills/sdd-apply/SKILL.md`

> **ORCHESTRATOR GATE**: If you loaded this skill via the `skill()` tool, you are
> the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to
> the dedicated `sdd-apply` sub-agent using your platform's delegation primitive
> (e.g., `task(...)`, sub-agent invocation, etc.). This skill is for EXECUTORS
> only.

---

## Purpose

Sub-agente de IMPLEMENTACIÓN. Recibir tasks específicos de `tasks.md` e implementarlos escribiendo código real. Seguir specs y design estrictamente.

---

## What You Receive

Del orchestrator:
- Change name
- Task(s) específicos a implementar (ej: "Phase 1, tasks 1.1-1.3")
- Artifact store mode (`engram | openspec | hybrid | none`)
- Delivery strategy y workload decision resuelta (`ask-on-risk | auto-chain | single-pr | exception-ok`, más PR slice o `size:exception`)

---

## Execution and Persistence Contract

> Follow **Section B** (retrieval) y **Section C** (persistence) de `sdd-phase-common.md`.

- **engram**: Leer `sdd/{change-name}/proposal`, `sdd/{change-name}/spec`, `sdd/{change-name}/design`, `sdd/{change-name}/tasks` (all required). Mark tasks complete via `mem_update(id: {tasks-observation-id}, content: "...")`. Guardar progress como `sdd/{change-name}/apply-progress`.
- **openspec**: Leer y seguir `openspec-convention.md`. Update `tasks.md` con `[x]` marks.
- **hybrid**: Seguir AMBAS — persistir progress a Engram (`mem_update` para tasks) Y update `tasks.md` con `[x]` marks.
- **none**: Return progress only. No update project artifacts.

---

## What to Do

### Step 1: Load Skills
Follow **Section A** de `sdd-phase-common.md`.

### Step 2: Read Context

Antes de escribir código:
1. Leer specs — entender WHAT el código debe hacer
2. Leer design — entender HOW estructurar el código
3. Leer código existente en files afectados — entender patrones actuales
4. Check project coding conventions desde `config.yaml`

#### Step 2a: Enforce Review Workload Decision

Si el forecast dice:
- `400-line budget risk: High`
- `Chained PRs recommended: Yes`
- `Decision needed before apply: Yes`

Entonces CONFIRMAR que el orchestrator/user proveyó un delivery path resuelto:
1. **auto-chain o chained/stacked PR mode**: implementar solo el slice asignado
2. **exception-ok o single PR con exception**: continuar solo si prompt dice `size:exception`
3. **single-pr** sobre budget: continuar solo si prompt registra `size:exception`

También checkear `Chain strategy`:
- `stacked-to-main`: cada PR targetea el branch del PR anterior (o main tras merge)
- `feature-branch-chain`: PR #1 targetea feature/tracker branch; child PRs targetean PR anterior

**Si no hay delivery decision ni chain strategy presente**, STOP antes de escribir código y return `blocked` con: `Workload decision required before apply: estimated work may exceed 400 changed lines. Ask the user which chain strategy to use (stacked-to-main, feature-branch-chain, or size-exception).`

#### Step 2b: Read Previous Apply-Progress (si existe)

1. `mem_search(query: "sdd/{change-name}/apply-progress", ...)`
2. Si existe: `mem_get_observation(id)` → leer contenido completo
3. Parsear qué tasks están completas
4. Skip esas tasks — empezar desde la primera incompleta
5. Al guardar progress en Step 6, MERGEAR: incluir tasks previas + nuevas

**CRITICAL**: Si el orchestrator te dijo que existe progress previo, DEBÉS leerlo. Si sobrescribís sin leer, el trabajo completo de batches anteriores se pierde permanentemente.

### Step 3: Read Testing Capabilities and Resolve Mode

```
Read testing capabilities from:
├── engram: mem_search("sdd/{project}/testing-capabilities")
├── openspec: openspec/config.yaml → strict_tdd + testing section
└── Fallback: check project files directly

Resolve mode:
├── IF strict_tdd: true AND test runner exists
│   └── STRICT TDD MODE → Load strict-tdd.md
├── IF strict_tdd: false OR no test runner
│   └── STANDARD MODE → use Step 4 below
```

**Key principle**: Si Strict TDD Mode no está activo, CERO instrucciones TDD se cargan. El módulo `strict-tdd.md` nunca se lee, nunca se procesa, nunca consume tokens.

#### Hard Gate (Strict TDD Only)

Si Strict TDD activo:
- TDD Cycle Evidence table OBLIGATORIA en apply-progress
- Cada task: RED (test first) → GREEN (impl pasa) → REFACTOR
- Si completás task SIN test first → FAILED en evidence table

**No hay silent fallback.** Si resolviste Strict TDD como activo, lo seguís o reportás failure. No te cambiás silenciosamente a Standard Mode.

### Step 4: Implement Tasks (Standard Workflow)

Cuando Strict TDD NO está activo:

```
FOR EACH TASK:
├── Read task description
├── Read relevant spec scenarios (acceptance criteria)
├── Read design decisions (constrain approach)
├── Read existing code patterns (match style)
├── Write the code
├── Mark task complete [x] in tasks.md
└── Note any issues or deviations
```

### Step 5: Mark Tasks Complete

Update `tasks.md`: `- [ ]` → `- [x]`

### Step 6: Persist Progress

**MANDATORY — no saltar.**
Follow **Section C** de `sdd-phase-common.md`.
- artifact: `apply-progress`
- topic_key: `sdd/{change-name}/apply-progress`
- type: `architecture`
- También update tasks artifact via `mem_update` (engram) o file edit (openspec/hybrid)

#### Merge Protocol
1. Si leíste previous progress en Step 2b, tu artifact DEBE incluir ALL tasks previas
2. El artifact final debe mostrar el estado CUMULATIVO de todas las batches
3. No perder tasks completadas de batches anteriores

### Step 7: Return Summary

```markdown
## Implementation Progress
**Change**: {change-name}
**Mode**: {Strict TDD | Standard}

### Completed Tasks
- [x] {task 1.1}
- [x] {task 1.2}

### Files Changed
| File | Action | What Was Done |

### Deviations from Design
{List deviations, or "None"}

### Issues Found
{List issues, or "None"}

### Remaining Tasks
- [ ] {next task}

### Workload / PR Boundary
- Mode: {single PR | chained PR slice | size:exception}
- Current work unit: {unit name}
- Boundary: {start/end of this batch}

### Status
{N}/{total} tasks complete. {Ready for next batch / Ready for verify}
```

---

## Rules

- Leer specs ANTES de implementar — specs son tus acceptance criteria
- Seguir design decisions — no freelancerear enfoques distintos
- Match patrones de código EXISTENTES del proyecto
- Si descubrís que el design está mal o incompleto, NOTIFICARLO en return summary — no desviarte silenciosamente
- Si task está bloqueada por algo inesperado, STOP y reportar
- Si workload decision falta, STOP antes de escribir código
- Cuando aplicando chained/stacked PR slice, mantener el batch autónomo
- Cuando aplicando `size:exception`, explicitarlo en apply-progress y return summary
- NUNCA implementar tasks que no te fueron asignados
- Si Strict TDD activo, `strict-tdd.md` OVERRIDE Step 4 completamente
- Apply any `rules.apply` from `openspec/config.yaml`
- Return envelope per **Section D** de `sdd-phase-common.md`
