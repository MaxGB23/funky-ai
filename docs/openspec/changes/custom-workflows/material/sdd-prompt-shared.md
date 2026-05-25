# SDD Prompts — Shared References

> Archivos compartidos cargados por las fases SDD. No son prompts independientes sino referencias que los sub-agentes leen.

---

## Índice

1. [`_shared/sdd-phase-common.md`](#1-sdd-phase-commonmd)
2. [`_shared/skill-resolver.md`](#2-skill-resolvermd)
3. [`_shared/openspec-convention.md`](#3-openspec-conventionmd)
4. [`_shared/engram-convention.md`](#4-engram-conventionmd)
5. [`_shared/persistence-contract.md`](#5-persistence-contractmd)

---

## 1. `sdd-phase-common.md`

**Ruta**: `skills/_shared/sdd-phase-common.md`
**Propósito**: Boilerplate idéntico para todas las fases SDD.

### Section A — Skill Loading

1. Si orchestrator inyectó `## Skills to load before work`, leer esos paths exactos antes del trabajo.
2. Si no hubo skills block, checkear por `SKILL: Load` instructions.
3. Si tampoco, buscar skill registry como fallback:
   a. `mem_search(query: "skill-registry", project: "{project}")`
   b. Fallback: leer `.atl/skill-registry.md` del project root
   c. Del registry, matchear triggers a tu task y leer los SKILL.md paths listados.
4. Si no existe registry, proceder con solo tu phase skill.

**NOTA**: Path preferido es (1) — paths exactos del orchestrator. (2) y (3) son fallbacks.

---

### Section B — Artifact Retrieval (Engram Mode)

**CRITICAL**: `mem_search` devuelve PREVIEWS de 300 chars, no contenido completo. Debés llamar `mem_get_observation(id)` para CADA artifact. **Saltarse esto produce output incorrecto.**

**Correr todas las searches en paralelo** — no secuencialmente.

```
mem_search(query: "sdd/{change-name}/{artifact-type}", project: "{project}") → save ID
```

Luego **correr todas las retrievals en paralelo**:

```
mem_get_observation(id: {saved_id}) → full content (REQUIRED)
```

No usar search previews como material fuente.

---

### Section C — Artifact Persistence

Cada fase que produce un artifact DEBE persistirlo. Saltarse esto ROMPE el pipeline — las fases aguas abajo no van a encontrar tu output.

#### Engram mode
```
mem_save(
  title: "sdd/{change-name}/{artifact-type}",
  topic_key: "sdd/{change-name}/{artifact-type}",
  type: "architecture",
  project: "{project}",
  capture_prompt: false,
  content: "{your full artifact markdown}"
)
```

`topic_key` permite upserts — guardar de nuevo actualiza, no duplica.
`capture_prompt: false` es mandatory para SDD artifacts. Setearlo cuando el schema de Engram lo soporte; si schema viejo no lo expone, omitir.

#### OpenSpec mode
File ya fue escrito durante el main step de la fase. No se necesita acción adicional.

#### Hybrid mode
Hacer AMBOS: escribir file a filesystem Y llamar `mem_save` como arriba.

#### None mode
Return inline only. No escribir files ni llamar `mem_save`.

---

### Section D — Return Envelope

Cada fase DEBE retornar un envelope estructurado al orchestrator:

- `status`: `success`, `partial`, o `blocked`
- `executive_summary`: 1-3 sentences de lo que se hizo
- `detailed_report`: (optional) full phase output
- `artifacts`: lista de artifact keys/paths escritos
- `next_recommended`: la siguiente fase SDD, o "none"
- `risks`: risks descubiertos, o "None"
- `skill_resolution`: cómo se cargaron skills — `paths-injected`, `fallback-registry`, `fallback-path`, o `none`

Example:

```markdown
**Status**: success
**Summary**: Proposal created for `{change-name}`.
**Artifacts**: Engram `sdd/{change-name}/proposal`
**Next**: sdd-spec or sdd-design
**Risks**: None
**Skill Resolution**: paths-injected — 3 skills (react-19, typescript, tailwind-4)
```

---

### Section E — Review Workload Guard

SDD debe proteger la carga cognitiva del reviewer, no solo generar tasks.

- Default PR review budget: **400 changed lines** (additions + deletions)
- Orchestrator DEBE cachear delivery strategy al inicio: `ask-on-risk` (default), `auto-chain`, `single-pr`, o `exception-ok`
- Orchestrator DEBE pasar `delivery_strategy` a `sdd-tasks` y la decisión resuelta a `sdd-apply`
- `sdd-tasks` DEBE forecastear si el trabajo planeado puede exceder el budget
- El forecast DEBE incluir guard lines exactas: `Decision needed before apply: Yes|No`, `Chained PRs recommended: Yes|No`, `400-line budget risk: Low|Medium|High`
- Si forecast es High, `sdd-tasks` DEBE recomendar chained o stacked PRs
- `sdd-apply` NO DEBE empezar oversized work salvo que delivery strategy resuelva a slices o `size:exception`
- Cada chained PR slice debe tener start claro, finish claro, scope autónomo, verification, rollback razonable
- En Feature Branch Chain, PR #1 targetea feature/tracker branch; child PRs targetean PR branch anterior

---

## 2. `skill-resolver.md`

**Ruta**: `skills/_shared/skill-resolver.md`
**Propósito**: Protocolo universal para resolver skills y pasarlos a sub-agentes.

### Why This Exists
Sub-agentes arrancan sin contexto de project skills. El registry le da al delegador un índice barato de skills disponibles sin reescribirlos o resumirlos.

### When to Apply
Antes de cada lanzamiento de sub-agente que involucre leer, escribir, revisar, testear, documentar o crear project artifacts. Saltar solo para comandos puramente mecánicos.

### The Protocol

#### Step 1: Obtain the Skill Registry
El registry es un **índice** de skill names, triggers, scopes y paths exactos de `SKILL.md`.

Resolution order:
1. Usar session cache si existe
2. `mem_search(query: "skill-registry", project: "{project}")` → `mem_get_observation(id)`
3. Fallback: leer `.atl/skill-registry.md` del project root
4. No registry found → proceder sin project skills y warn al usuario

#### Step 2: Match Relevant Skills
Matchear en dos dimensiones:

| Context | Match against |
| --- | --- |
| Code/files | Registry trigger/description menciona language, framework, tool o path context |
| Task/action | Registry trigger/description menciona acciones: PR, review, docs, tests, comments, release |

Preferir el set más pequeño útil. Si más de 5 skills matchean, quedarse con los 5 más relevantes, priorizando code context sobre task context.

#### Step 3: Pass Skill Paths
Inyectar paths, no summaries:

```markdown
## Skills to load before work
Read these exact files before reading, writing, reviewing, testing, or creating artifacts:
- /absolute/path/to/skills/go-testing/SKILL.md
- /absolute/path/to/skills/typescript/SKILL.md
```

#### Step 4: Report Resolution
Sub-agentes DEBEN reportar `skill_resolution`:
- `paths-injected` — recibió paths exactos del delegador y los cargó
- `fallback-registry` — no recibió paths, se cargó paths del registry
- `fallback-path` — cargó fallback path explícito fuera del registry
- `none` — no se cargaron skills

Si un sub-agente reporta algo que no sea `paths-injected`, el orchestrator DEBE re-leer el registry antes de la siguiente delegación.

### Compaction Safety
- Registry persiste en Engram y `.atl/skill-registry.md`
- Delegadores pueden recuperar paths seleccionados post-compaction re-leyendo el registry
- Sub-agentes reciben files exactos a leer, así el significado del skill no se degrada por resúmenes generados

---

## 3. `openspec-convention.md`

**Ruta**: `skills/_shared/openspec-convention.md`
**Propósito**: Define la estructura de directorios OpenSpec y las reglas de lectura/escritura.

### Directory Structure

```
openspec/
├── config.yaml              <- Project-specific SDD config
├── specs/                   <- Source of truth (main specs)
│   └── {domain}/
│       └── spec.md
└── changes/                 <- Active changes
    ├── archive/             <- Completed changes (YYYY-MM-DD-{change-name}/)
    └── {change-name}/       <- Active change folder
        ├── state.yaml       <- DAG state (survives compaction)
        ├── exploration.md   <- (optional) from sdd-explore
        ├── proposal.md      <- from sdd-propose
        ├── specs/           <- from sdd-spec
        │   └── {domain}/
        │       └── spec.md  <- Delta spec
        ├── design.md        <- from sdd-design
        ├── tasks.md         <- from sdd-tasks (updated by sdd-apply)
        └── verify-report.md <- from sdd-verify
```

### Artifact File Paths

| Skill | Creates / Reads | Path |
|-------|----------------|------|
| orchestrator | Creates/Updates | `openspec/changes/{change-name}/state.yaml` |
| sdd-init | Creates | `openspec/config.yaml`, `specs/`, `changes/`, `archive/` |
| sdd-explore | Creates (optional) | `openspec/changes/{change-name}/exploration.md` |
| sdd-propose | Creates | `openspec/changes/{change-name}/proposal.md` |
| sdd-spec | Creates | `openspec/changes/{change-name}/specs/{domain}/spec.md` |
| sdd-design | Creates | `openspec/changes/{change-name}/design.md` |
| sdd-tasks | Creates | `openspec/changes/{change-name}/tasks.md` |
| sdd-apply | Updates | `openspec/changes/{change-name}/tasks.md` (marks `[x]`) |
| sdd-verify | Creates | `openspec/changes/{change-name}/verify-report.md` |
| sdd-archive | Moves | → `openspec/changes/archive/YYYY-MM-DD-{change-name}/` |
| sdd-archive | Updates | `openspec/specs/{domain}/spec.md` (merges deltas) |

### Reading Artifacts
```
Proposal:   openspec/changes/{change-name}/proposal.md
Specs:      openspec/changes/{change-name}/specs/  (all domain subdirectories)
Design:     openspec/changes/{change-name}/design.md
Tasks:      openspec/changes/{change-name}/tasks.md
Verify:     openspec/changes/{change-name}/verify-report.md
Config:     openspec/config.yaml
Main specs: openspec/specs/{domain}/spec.md
```

### Writing Rules
- Siempre crear el change directory antes de escribir artifacts
- Si un file ya existe, LEERLO primero y ACTUALIZARLO (no sobrescribir ciegamente)
- Si el change directory ya existe con artifacts, el cambio está siendo CONTINUADO
- Usar `openspec/config.yaml` `rules` section para project-specific constraints por fase

### Config File Reference

```yaml
# openspec/config.yaml
schema: spec-driven

context: |
  Tech stack: {detected}
  Architecture: {detected}
  Testing: {detected}

rules:
  proposal:
    - Include rollback plan for risky changes
  specs:
    - Use Given/When/Then for scenarios
    - Use RFC 2119 keywords
  design:
    - Document architecture decisions with rationale
  tasks:
    - Group by phase, use hierarchical numbering
  apply:
    - Follow existing code patterns
    tdd: false
    test_command: ""
  verify:
    test_command: ""
    build_command: ""
    coverage_threshold: 0
  archive:
    - Warn before merging destructive deltas
```

### Archive Structure
```
openspec/changes/archive/YYYY-MM-DD-{change-name}/
```
Usar fecha de hoy en ISO format. El archive es AUDIT TRAIL — nunca borrar ni modificar archived changes.

---

## 4. `engram-convention.md`

**Ruta**: `skills/_shared/engram-convention.md`
**Propósito**: Convenciones de naming y persistencia para Engram.

### Naming Rules

Todos los SDD artifacts persistidos en Engram DEBEN seguir:

```
title:     sdd/{change-name}/{artifact-type}
topic_key: sdd/{change-name}/{artifact-type}
type:      architecture
project:   {detected or current project name}
scope:     project
capture_prompt: false
```

Setear `capture_prompt: false` cuando el schema de Engram lo soporte; si schema viejo no expone el field, omitir.

### Artifact Types

| Type | Produced By | Description |
|------|-------------|-------------|
| `explore` | sdd-explore | Exploration analysis |
| `proposal` | sdd-propose | Change proposal |
| `spec` | sdd-spec | Delta specifications |
| `design` | sdd-design | Technical design |
| `tasks` | sdd-tasks | Task breakdown |
| `apply-progress` | sdd-apply | Implementation progress |
| `verify-report` | sdd-verify | Verification report |
| `archive-report` | sdd-archive | Archive closure with lineage |
| `state` | orchestrator | DAG state for recovery after compaction |

### State Artifact

```
mem_save(
  title: "sdd/{change-name}/state",
  topic_key: "sdd/{change-name}/state",
  type: "architecture",
  project: "{project}",
  capture_prompt: false,
  content: "change: {change-name}\nphase: {last-phase}\n..."
)
```

Recovery: `mem_search("sdd/{change-name}/state")` → `mem_get_observation(id)` → parse → restore state.

### Recovery Protocol (2 steps)

```
Step 1: mem_search(query: "sdd/{change-name}/{artifact-type}", project: "{project}") → ID
Step 2: mem_get_observation(id: {observation-id}) → complete content
```

Cuando retrieving múltiples artifacts, agrupar todas las searches first, luego todas las retrievals:

```
STEP A — SEARCH (get IDs only):
  mem_search(query: "sdd/{change-name}/proposal", ...) → save ID
  mem_search(query: "sdd/{change-name}/spec", ...) → save ID

STEP B — RETRIEVE FULL CONTENT (mandatory):
  mem_get_observation(id: {proposal_id})
  mem_get_observation(id: {spec_id})
```

### Upsert Behavior

Mismo `topic_key` + `project` + `scope` → UPDATE (overwrite), no INSERT. Previous content se pierde — `revision_count` incrementa pero old content NO se guarda. Es working memory, no audit trail. Para iteration history o team collaboration, usar `openspec` o `hybrid`.

---

## 5. `persistence-contract.md`

**Ruta**: `skills/_shared/persistence-contract.md`
**Propósito**: Define cómo los sub-agentes leen y escriben artifacts según el modo de persistencia.

### Mode Resolution

Orchestrator pasa `artifact_store.mode` con uno de: `engram | openspec | hybrid | none`.
Default (si user no especifica): si Engram disponible → `engram`. Sino → `none`.

### Mode Roles

| Mode | Read from | Write to | Project files |
|------|-----------|----------|---------------|
| `engram` | Engram | Engram | Never |
| `openspec` | Filesystem | Filesystem | Yes |
| `hybrid` | Engram (primary) + FS (fallback) | Both | Yes |
| `none` | Orchestrator prompt context | Nowhere | Never |

### Mode Comparison

| Capability | `engram` | `openspec` | `hybrid` | `none` |
|------------|----------|------------|----------|--------|
| Cross-session recovery | ✅ | ❌ (needs git) | ✅ | ❌ |
| Compaction survival | ✅ | ❌ | ✅ | ❌ |
| Shareable with team | ❌ (local DB) | ✅ (committed files) | ✅ (files) | ❌ |
| Full iteration history | ❌ (upsert) | ✅ (git) | ✅ (files+git) | ❌ |
| Audit trail | Partial (report) | ✅ (full folder) | ✅ (both) | ❌ |
| Project files created | Never | Yes | Yes | Never |

### Hybrid Mode
Persiste cada artifact en AMBOS lados simultáneamente:
- Write to Engram (per `engram-convention.md`) AND to filesystem (per `openspec-convention.md`)
- Read priority: Engram first; fallback a filesystem si Engram no tiene resultados
- Token cost warning: hybrid consume MÁS tokens por operación

### State Persistence (Orchestrator)

| Mode | Persist State | Recover State |
|------|--------------|---------------|
| `engram` | `mem_save(topic_key: "sdd/{change-name}/state")` | `mem_search("sdd/*/state")` |
| `openspec` | Write `state.yaml` | Read `state.yaml` |
| `hybrid` | Both | Engram first; filesystem fallback |
| `none` | Not possible | Not possible |

### Sub-Agent Context Rules

Sub-agents lanzan con contexto fresco y SIN acceso a las instrucciones del orchestrator ni al memory protocol.

**Who reads, who writes**:
- Non-SDD (general task): orchestrator busca engram, pasa resumen en prompt; sub-agent guarda discoveries via `mem_save`
- SDD (phase with dependencies): sub-agent lee artifacts directo del backend; sub-agent guarda su artifact
- SDD (phase without dependencies, e.g. explore): nobody reads; sub-agent guarda su artifact

**Why this split**:
- Orchestrator lee para non-SDD: sabe qué contexto es relevante
- Sub-agents leen para SDD: SDD artifacts son grandes; ponerlos en el prompt del orchestrator consumiría todo el context window
- Sub-agents siempre escriben: tienen el detalle completo de lo que pasó

### Orchestrator Prompt Instructions for Sub-Agents

**Non-SDD:**
```
PERSISTENCE (MANDATORY):
Save important discoveries/decisions/bug fixes to engram before returning.
```

**SDD (with dependencies):**
```
Artifact store mode: {engram|openspec|hybrid|none}
Read these artifacts before starting: mem_search → mem_get_observation
PERSISTENCE (MANDATORY): mem_save with topic_key "sdd/{change-name}/{type}"
```

**SDD (no dependencies):**
```
Artifact store mode: {engram|openspec|hybrid|none}
PERSISTENCE (MANDATORY): mem_save with topic_key "sdd/{change-name}/{type}"
```

### Detail Level
Orchestrator puede pasar `detail_level`: `concise | standard | deep`. Controla verbosidad del output pero NO afecta qué se persiste — siempre persistir el artifact completo.
