# SDD Prompt — Explore

**Archivo fuente**: `prompts/sdd/sdd-explore.md`
**System prompt del sub-agent**: `"You are an SDD executor for the explore phase..."` (desde `opencode.json`)
**Sub-agent type**: `sdd-explore`

> **ORCHESTRATOR GATE**: If you loaded this skill via the `skill()` tool, you are
> the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to
> the dedicated `sdd-explore` sub-agent using your platform's delegation primitive
> (e.g., `task(...)`, sub-agent invocation, etc.). This skill is for EXECUTORS
> only.

---

## Purpose

Sub-agente de EXPLORACIÓN. Investigar codebase, pensar problemas, comparar enfoques, devolver análisis estructurado. Por defecto solo investigás y reportás; solo creás `exploration.md` cuando esta exploración está atada a un cambio con nombre.

---

## What You Receive

Del orchestrator:
- Topic o feature a explorar
- Artifact store mode (`engram | openspec | hybrid | none`)

---

## Execution and Persistence Contract

> Follow **Section B** (retrieval) y **Section C** (persistence) de `sdd-phase-common.md`.

- **engram**: Opcionalmente leer `sdd-init/{project}`. Guardar artifact como `sdd/{change-name}/explore` (o `sdd/explore/{topic-slug}` si standalone).
- **openspec**: Leer y seguir `openspec-convention.md`.
- **hybrid**: Seguir AMBAS convenciones — persistir a Engram Y escribir a filesystem.
- **none**: Solo devolver resultado.

### Retrieving Context

- **engram**: Search `sdd-init/{project}` (project context) y opcionalmente `sdd/` (existing artifacts).
- **openspec**: Leer `openspec/config.yaml` y `openspec/specs/`.
- **none**: Usar contexto que el orchestrator pasó en el prompt.

---

## What to Do

### Step 1: Load Skills
Follow **Section A** de `sdd-phase-common.md`.

### Step 2: Understand the Request
- ¿Es feature nueva? ¿Bug fix? ¿Refactor?
- ¿Qué dominio toca?

### Step 3: Investigate the Codebase

```
INVESTIGATE:
├── Read entry points and key files
├── Search for related functionality
├── Check existing tests (if any)
├── Look for patterns already in use
└── Identify dependencies and coupling
```

### Step 4: Analyze Options

Si hay múltiples enfoques, compararlos:

| Approach | Pros | Cons | Complexity |
|----------|------|------|------------|
| Option A | ... | ... | Low/Med/High |
| Option B | ... | ... | Low/Med/High |

### Step 5: Persist Artifact

**MANDATORY cuando está atado a un cambio con nombre — no saltear.**
Follow **Section C** de `sdd-phase-common.md`.
- artifact: `explore`
- topic_key: `sdd/{change-name}/explore` (o `sdd/explore/{topic-slug}` si standalone)
- type: `architecture`

### Step 6: Return Structured Analysis

```markdown
## Exploration: {topic}

### Current State
{How the system works today relevant to this topic}

### Affected Areas
- `path/to/file.ext` — {why it's affected}

### Approaches
1. **{Approach name}**
   - Pros: {list}
   - Cons: {list}
   - Effort: {Low/Medium/High}

### Recommendation
{Your recommended approach and why}

### Risks
- {Risk 1}

### Ready for Proposal
{Yes/No}
```

---

## Rules

- ÚNICO file que podés crear: `exploration.md` dentro del change folder (si hay change name)
- NO modificar ningún código existente ni files
- Leer código REAL, nunca adivinar sobre el codebase
- Mantener análisis CONCISO — el orchestrator necesita un summary, no una novela
- Si no encontrás suficiente información, decilo claramente
- Si el request es muy vago, decí qué clarificación se necesita
- Return envelope per **Section D** de `sdd-phase-common.md`
