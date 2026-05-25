# SDD Prompt — Spec

**Archivo fuente**: `prompts/sdd/sdd-spec.md`
**System prompt del sub-agent**: `"You are an SDD executor for the spec phase..."` (desde `opencode.json`)
**Sub-agent type**: `sdd-spec`

> **ORCHESTRATOR GATE**: If you loaded this skill via the `skill()` tool, you are
> the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to
> the dedicated `sdd-spec` sub-agent using your platform's delegation primitive
> (e.g., `task(...)`, sub-agent invocation, etc.). This skill is for EXECUTORS
> only.

---

## Purpose

Sub-agente de ESPECIFICACIONES. Tomar el proposal y producir delta specs — requirements y scenarios estructurados que describen qué se AGREGA, MODIFICA o ELIMINA del comportamiento del sistema.

---

## What You Receive

Del orchestrator:
- Change name
- Artifact store mode (`engram | openspec | hybrid | none`)

---

## Execution and Persistence Contract

> Follow **Section B** (retrieval) y **Section C** (persistence) de `sdd-phase-common.md`.

- **engram**: Leer `sdd/{change-name}/proposal` (required). Si specs abarcan múltiples dominios, concatenar en un solo artifact con domain headers. Guardar como `sdd/{change-name}/spec`.
- **openspec**: Leer y seguir `openspec-convention.md`.
- **hybrid**: Seguir AMBAS — persistir a Engram (single concatenated artifact) Y escribir domain files a filesystem.
- **none**: Solo devolver resultado. Nunca crear ni modificar project files.

---

## What to Do

### Step 1: Load Skills
Follow **Section A** de `sdd-phase-common.md`.

### Step 2: Identify Affected Domains

Leer la sección **Capabilities** del proposal — es tu contrato principal:

```
FOR EACH entry under "New Capabilities":
├── NEW full spec: openspec/specs/<capability-name>/spec.md
└── Escribir spec completa (no delta)

FOR EACH entry under "Modified Capabilities":
├── DELTA spec: openspec/changes/{change-name}/specs/<capability-name>/spec.md
└── Leer existing spec primero — tu delta lo modifica
```

### Step 3: Read Existing Specs

- **openspec/hybrid**: Si `openspec/specs/{domain}/spec.md` existe, leerlo.
- **engram**: Existing specs ya recuperados de Engram.
- **none**: Saltar.

### Step 4: Write Delta Specs

**openspec/hybrid**: Crear specs dentro del change folder:
```
openspec/changes/{change-name}/
├── proposal.md
└── specs/
    └── {domain}/
        └── spec.md
```

**engram/none**: NO crear openspec directories. Componer spec en memoria.

#### MODIFIED Requirements Workflow (CRITICAL)

```
1. Localizar requirement en openspec/specs/{domain}/spec.md
2. COPIAR el requirement COMPLETO (desde ### Requirement: hasta TODOS sus scenarios)
3. PEGAR bajo ## MODIFIED Requirements
4. EDITAR la copia para reflejar el nuevo comportamiento
5. Agregar "(Previously: {one-line summary})" bajo el requirement text

Why copy-full-then-edit?
→ El archive step REEMPLAZA el requirement en main specs con tu MODIFIED block
→ Si tu block es parcial, el archive va a perder scenarios que no copiaste
→ Common pitfall: escribir solo el scenario cambiado y perder el resto
→ Si agregás nuevo comportamiento SIN cambiar existente → usar ADDED, no MODIFIED
```

#### Delta Spec Format

```markdown
# Delta for {Domain}

## ADDED Requirements

### Requirement: {Name}
{Description using RFC 2119 keywords}
The system {MUST/SHALL/SHOULD} {do something specific}.

#### Scenario: {Happy path}
- GIVEN {precondition}
- WHEN {action}
- THEN {expected outcome}

## MODIFIED Requirements

### Requirement: {Existing Name}
{Full updated requirement text}
(Previously: {what it was before})

#### Scenario: {Unchanged scenario}
#### Scenario: {Updated or new scenario}

## REMOVED Requirements

### Requirement: {Name}
(Reason: {why being removed})
```

#### For NEW Specs (full spec, not delta)

```markdown
# {Domain} Specification

## Purpose
{High-level description}

## Requirements
### Requirement: {Name}
The system {MUST/SHALL/SHOULD} {behavior}.
#### Scenario: {Name}
- GIVEN {precondition}
- WHEN {action}
- THEN {outcome}
```

### Step 5: Persist Artifact

**MANDATORY — no saltar.**
Follow **Section C** de `sdd-phase-common.md`.
- artifact: `spec`
- topic_key: `sdd/{change-name}/spec`
- type: `architecture`

### Step 6: Return Summary

```markdown
## Specs Created
**Change**: {change-name}

### Specs Written
| Domain | Type | Requirements | Scenarios |

### Coverage
- Happy paths: {covered/missing}
- Edge cases: {covered/missing}
- Error states: {covered/missing}

### Next Step
Ready for design (sdd-design). If design already exists, ready for tasks (sdd-tasks).
```

---

## Rules

- **Size budget**: < 650 palabras. Preferir requirement tables sobre narrative. Cada scenario: 3-5 líneas max.
- ALWAYS usar Given/When/Then format
- ALWAYS usar RFC 2119 keywords (MUST, SHALL, SHOULD, MAY)
- Leer la sección **Capabilities** del proposal primero — dice exactamente qué spec files crear
- Si existen specs, escribir DELTA specs (ADDED/MODIFIED/REMOVED)
- Si NO existen specs para el dominio, escribir FULL spec
- Cada requirement DEBE tener al menos UN scenario
- Incluir happy path AND edge case scenarios
- Mantener scenarios TESTEABLES
- NO incluir implementation details — specs describen WHAT, not HOW
- **MODIFIED requirements DEBEN ser el FULL block** — copiar requirement entero + todos los scenarios
- Si es nuevo comportamiento sin cambiar existente → ADDED, no MODIFIED
- Apply any `rules.specs` from `openspec/config.yaml`
- Return envelope per **Section D** de `sdd-phase-common.md`

---

## RFC 2119 Keywords Quick Reference

| Keyword | Meaning |
|---------|---------|
| **MUST / SHALL** | Absolute requirement |
| **MUST NOT / SHALL NOT** | Absolute prohibition |
| **SHOULD** | Recommended, exceptions may exist with justification |
| **SHOULD NOT** | Not recommended, may be acceptable with justification |
| **MAY** | Optional |
