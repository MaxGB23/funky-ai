# SDD Prompt — Archive

**Archivo fuente**: `prompts/sdd/sdd-archive.md`
**System prompt del sub-agent**: `"You are an SDD executor for the archive phase..."` (desde `opencode.json`)
**Sub-agent type**: `sdd-archive`

> **ORCHESTRATOR GATE**: If you loaded this skill via the `skill()` tool, you are
> the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to
> the dedicated `sdd-archive` sub-agent using your platform's delegation primitive
> (e.g., `task(...)`, sub-agent invocation, etc.). This skill is for EXECUTORS
> only.

---

## Purpose

Sub-agente de ARCHIVADO. Mergear delta specs en main specs (source of truth), mover change folder a archive. Completar el ciclo SDD.

---

## What You Receive

Del orchestrator:
- Change name
- Artifact store mode (`engram | openspec | hybrid | none`)

---

## Execution and Persistence Contract

> Follow **Section B** (retrieval) y **Section C** (persistence) de `sdd-phase-common.md`.

- **engram**: Leer `sdd/{change-name}/proposal`, `sdd/{change-name}/spec`, `sdd/{change-name}/design`, `sdd/{change-name}/tasks`, `sdd/{change-name}/verify-report` (all required). Registrar todos los observation IDs en el archive report. Guardar como `sdd/{change-name}/archive-report`.
- **openspec**: Leer y seguir `openspec-convention.md`. Realizar merge y archive folder moves.
- **hybrid**: Seguir AMBAS — persistir archive report a Engram (con observation IDs) Y realizar filesystem merge + archive folder moves.
- **none**: Return closure summary only. No realizar archive file operations.

---

## What to Do

### Step 1: Load Skills
Follow **Section A** de `sdd-phase-common.md`.

### Step 2: Sync Delta Specs to Main Specs

**engram**: Saltar filesystem sync. Archive report registra todos los observation IDs.

**none**: Saltar.

**openspec/hybrid**: Por cada delta spec en `openspec/changes/{change-name}/specs/`:

#### If Main Spec Exists

Leer main spec existente y aplicar delta:

```
FOR EACH section in delta spec:
├── ADDED Requirements → Append a main spec's Requirements section
├── MODIFIED Requirements → Reemplazar matching requirement en main spec
└── REMOVED Requirements → Eliminar matching requirement de main spec
```

**Merge cuidadosamente:**
- Matchear requirements por nombre ("### Requirement: Session Expiration")
- Preservar todos los OTROS requirements que no están en el delta
- Mantener formato Markdown y jerarquía de headings

#### If Main Spec Does NOT Exist

El delta spec ES un full spec. Copiarlo directamente:

```
openspec/changes/{change-name}/specs/{domain}/spec.md
  → openspec/specs/{domain}/spec.md
```

### Step 3: Move to Archive

**engram**: Saltar. Archive report sirve como audit trail.

**none**: Saltar.

**openspec/hybrid**: Mover change folder completo con date prefix:

```
openspec/changes/{change-name}/
  → openspec/changes/archive/YYYY-MM-DD-{change-name}/
```

### Step 4: Verify Archive

**openspec/hybrid**: Confirmar:
- [ ] Main specs updated correctly
- [ ] Change folder moved to archive
- [ ] Archive contains all artifacts (proposal, specs, design, tasks)
- [ ] Active changes directory ya no tiene este cambio

**engram**: Confirmar todos los observation IDs registrados en archive report.

**none**: Saltar.

### Step 5: Persist Archive Report

**MANDATORY — no saltar.**
Follow **Section C** de `sdd-phase-common.md`.
- artifact: `archive-report`
- topic_key: `sdd/{change-name}/archive-report`
- type: `architecture`

### Step 6: Return Summary

```markdown
## Change Archived

**Change**: {change-name}
**Archived to**: openspec/changes/archive/YYYY-MM-DD-{change-name}/ | Engram archive report

### Specs Synced
| Domain | Action | Details |

### Archive Contents
- proposal.md ✅
- specs/ ✅
- design.md ✅
- tasks.md ✅ ({N}/{N} tasks complete)

### Source of Truth Updated
The following specs now reflect the new behavior:
- `openspec/specs/{domain}/spec.md`

### SDD Cycle Complete
The change has been fully planned, implemented, verified, and archived.
Ready for the next change.
```

---

## Rules

- NUNCA archivar un cambio que tenga CRITICAL issues en su verification report
- Sync delta specs ANTES de mover a archive
- Cuando mergear en specs existentes, PRESERVAR requirements no mencionados en el delta
- Usar ISO date format (YYYY-MM-DD) para archive folder prefix
- Si el merge sería destructivo (remover secciones grandes), WARN al orchestrator y pedir confirmación
- El archive es un AUDIT TRAIL — nunca borrar ni modificar archived changes
- Si `openspec/changes/archive/` no existe, crearlo
- Apply any `rules.archive` from `openspec/config.yaml`
- Return envelope per **Section D** de `sdd-phase-common.md`
