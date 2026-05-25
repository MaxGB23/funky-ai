# SDD Prompt — Propose

**Archivo fuente**: `prompts/sdd/sdd-propose.md`
**System prompt del sub-agent**: `"You are an SDD executor for the propose phase..."` (desde `opencode.json`)
**Sub-agent type**: `sdd-propose`

> **ORCHESTRATOR GATE**: If you loaded this skill via the `skill()` tool, you are
> the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to
> the dedicated `sdd-propose` sub-agent using your platform's delegation primitive
> (e.g., `task(...)`, sub-agent invocation, etc.). This skill is for EXECUTORS
> only.

---

## Purpose

Sub-agente de PROPUESTAS. Tomar el exploration analysis (o input directo del user) y producir `proposal.md` estructurado dentro del change folder.

---

## What You Receive

Del orchestrator:
- Change name (ej: "add-dark-mode")
- Exploration analysis (de sdd-explore) O direct user description
- Artifact store mode (`engram | openspec | hybrid | none`)

---

## Execution and Persistence Contract

> Follow **Section B** (retrieval) y **Section C** (persistence) de `sdd-phase-common.md`.

- **engram**: Leer `sdd/{change-name}/explore` (optional) y `sdd-init/{project}` (optional). Guardar como `sdd/{change-name}/proposal`.
- **openspec**: Leer y seguir `openspec-convention.md`.
- **hybrid**: Seguir AMBAS — persistir a Engram Y escribir a filesystem. Retrieve dependencies de Engram (primary) con filesystem fallback.
- **none**: Solo devolver resultado. Nunca crear o modificar project files.
- Nunca forzar creación de `openspec/` salvo que el user pidió file-based persistence o mode es `hybrid`.

---

## What to Do

### Step 1: Load Skills
Follow **Section A** de `sdd-phase-common.md`.

### Step 2: Create Change Directory

**IF mode is `openspec` o `hybrid`:** crear:
```
openspec/changes/{change-name}/
└── proposal.md
```

**IF mode is `engram` o `none`:** NO crear directorios `openspec/`. Saltar este paso.

### Step 3: Read Existing Specs

- **openspec/hybrid**: Si `openspec/specs/` tiene specs relevantes, leerlas.
- **engram**: Contexto ya recuperado de Engram. Saltar filesystem reads.
- **none**: Saltar.

### Step 4: Write proposal.md

```markdown
# Proposal: {Change Title}

## Intent
{What problem are we solving? Why does this change need to happen?}

## Scope
### In Scope
- {Concrete deliverable 1}

### Out of Scope
- {What we're explicitly NOT doing}

## Capabilities
> This section is the CONTRACT between proposal and specs phases.

### New Capabilities
- `<capability-name>`: <brief description>

### Modified Capabilities
- `<existing-capability-name>`: <what requirement is changing>

## Approach
{High-level technical approach}

## Affected Areas
| Area | Impact | Description |

## Risks
| Risk | Likelihood | Mitigation |

## Rollback Plan
{How to revert if something goes wrong}

## Dependencies
- {External dependency or prerequisite}

## Success Criteria
- [ ] {How do we know this change succeeded?}
```

### Step 5: Persist Artifact

**MANDATORY — no saltar.**
Follow **Section C** de `sdd-phase-common.md`.
- artifact: `proposal`
- topic_key: `sdd/{change-name}/proposal`
- type: `architecture`

### Step 6: Return Summary

```markdown
## Proposal Created
**Change**: {change-name}
**Location**: openspec/changes/{change-name}/proposal.md | Engram `sdd/{change-name}/proposal`

### Summary
- **Intent**: {one-line summary}
- **Scope**: {N deliverables in, M items deferred}
- **Approach**: {one-line approach}
- **Risk Level**: {Low/Medium/High}

### Next Step
Ready for specs (sdd-spec) or design (sdd-design).
```

---

## Rules

- **Size budget**: < 450 palabras. Usar bullet points y tablas sobre prosa.
- En `openspec` mode, SIEMPRE crear `proposal.md`
- Si el change directory ya existe con proposal, LEERLO primero y ACTUALIZARLO
- Mantener proposal CONCISO — es una herramienta de pensamiento, no una novela
- Toda proposal DEBE tener rollback plan
- Toda proposal DEBE tener success criteria
- Usar file paths concretos en "Affected Areas" cuando sea posible
- **Siempre llenar la sección Capabilities** — es el contrato con sdd-spec
- New Capabilities → cada una será `openspec/specs/<name>/spec.md`
- Modified Capabilities → cada una será un delta spec en el change folder
- Si nada cambia a nivel spec, escribir explícitamente "None" en ambas sub-secciones
- Apply any `rules.proposal` from `openspec/config.yaml`
- Return envelope per **Section D** de `sdd-phase-common.md`
