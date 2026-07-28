# Root Spec — Assess Domain
> Domain: assess | Status: Living | Source of Truth: `openspec/specs/assess/spec.md`

This is the canonical living specification for the `assess` domain.
It reflects the **current state** of all requirements. Read this file — NOT the change history — for the authoritative view.

---

## Propósito

El comando `funky assess` facilita una sesión de discusión arquitectónica entre el equipo humano y la IA. No evalúa, no produce scores, no falla. Inyecta una guía de discusión basada en los canvases del proyecto (PROJECT-CANVAS + INFRA-CANVAS) y un template de documentación de decisiones.

## Requirements

### R1: Canvas Discovery

The system MUST locate PROJECT-CANVAS.md and INFRA-CANVAS.md searching the project root (`./`) first, then falling back to `docs/` (`./docs/`). If a canvas is not found in either location, the system SHOULD warn the user but MUST continue generating the discussion guide with placeholder content.

#### Scenario: Both canvases exist in root

- GIVEN `./PROJECT-CANVAS.md` and `./INFRA-CANVAS.md` exist
- WHEN `funky assess` executes
- THEN both files are read without fallback
- AND no missing-canvas warning is printed

#### Scenario: Canvases in docs/ fallback

- GIVEN only `./docs/PROJECT-CANVAS.md` and `./docs/INFRA-CANVAS.md` exist (not in root)
- WHEN `funky assess` executes
- THEN both files are read from `docs/`
- AND a notice about fallback location MAY be printed

#### Scenario: One canvas missing

- GIVEN only PROJECT-CANVAS.md exists (INFRA-CANVAS.md missing in root and docs/)
- WHEN `funky assess` executes
- THEN a warning is printed indicating INFRA-CANVAS is missing
- BUT the guide is still generated with "Canvas no disponible" for the missing canvas

#### Scenario: Both canvases missing

- GIVEN neither PROJECT-CANVAS.md nor INFRA-CANVAS.md exist in root or docs/
- WHEN `funky assess` executes
- THEN a warning is printed indicating both canvases are missing
- BUT exit code is 0 and the guide is still generated

### R2: Canvas Validation

The system MUST detect unfilled placeholders (`[Responde aquí]`) in canvas content. If found, the system SHOULD warn the user that the discussion will be based on incomplete data, but MUST continue generating.

#### Scenario: Unfilled placeholders detected

- GIVEN PROJECT-CANVAS.md contains `[Responde aquí]` in at least one section
- WHEN `funky assess` executes
- THEN a warning is printed listing sections with unfilled placeholders
- AND the guide is generated with the available (partial) content

### R3: Discussion Guide Generation

The system MUST generate a discussion guide at `.agents/prompts/architecture-review.md` containing: embedded canvas content, 3 static C1 questions (budget+infra, RPS+DB, SLA+redundancy), optionally 1-2 dynamic C2 questions, and a 6-phase discussion structure (Contexto, Preocupaciones, Preguntas Guía, Riesgos, Alternativas, Acuerdos). The file MUST be overwritten if it already exists.

#### Scenario: Happy path — full generation

- GIVEN both canvases exist and have no unfilled placeholders
- WHEN `funky assess` executes
- THEN `.agents/prompts/architecture-review.md` is created
- AND it contains the 6-phase structure with all 3 C1 questions embedded
- AND it contains the full content of both canvases

#### Scenario: Overwrite existing file

- GIVEN `.agents/prompts/architecture-review.md` already exists from a previous run
- WHEN `funky assess` executes
- THEN the existing file is overwritten with new content
- AND no backup of the old file is created

### R4: C2 Dynamic Questions

The system SHOULD generate 1-2 additional dynamic questions (C2) when canvas content matches known patterns: K8s/Kubernetes in infra, SQLite as DB, Single Node redundancy, or Junior team + complex infra. If no patterns match, the system MUST generate the guide with only C1 static questions.

#### Scenario: Pattern match triggers C2

- GIVEN INFRA-CANVAS mentions "Kubernetes" as deployment infrastructure
- WHEN C2 detection runs
- THEN a dynamic question about K8s operational costs is included in the guide

#### Scenario: No pattern match — C1 only

- GIVEN canvas content does not match any C2 pattern (no K8s, no SQLite, no Single Node, Senior team)
- WHEN C2 detection runs
- THEN no dynamic questions are added
- AND the guide contains only the 3 C1 static questions

### R5: Decisions Template

The system MUST create `docs/architecture-decisions.md` with a structured template (sections for decisión, rationale, alternativas, riesgos, fecha) IF the file does not already exist. The system MUST NOT overwrite an existing decisions file.

#### Scenario: Create decisions template

- GIVEN `docs/architecture-decisions.md` does not exist
- WHEN `funky assess` executes
- THEN the file is created with the standard decision template structure

#### Scenario: Decisions template already exists

- GIVEN `docs/architecture-decisions.md` already exists with previous decisions
- WHEN `funky assess` executes
- THEN the file is NOT modified
- AND a notice is printed indicating the file already exists

### R6: Exit Codes and Output

The system MUST exit with code 0 in all scenarios. No other exit codes are permitted. The system MUST print a summary of what was generated and instructions for starting the discussion session.

#### Scenario: Successful generation

- GIVEN the assess command completes
- WHEN any execution path is followed
- THEN exit code is 0
- AND a summary is printed with paths of generated files
- AND instructions for starting the discussion session are shown

## Non-Functional Requirements

| Área | Especificación |
|------|---------------|
| Performance | Canvas reading and guide generation MUST complete in <500ms on a cold start |
| Error handling | All errors (fs read failures, permission denied) MUST print a warning and continue with exit 0 |
| Backward compatibility | `parseFrontmatter()` MUST remain exported and unchanged for existing consumers |
| Security | The system MUST NOT read files outside the project root (process.cwd()) |
| Determinism | Given identical canvas files, the system MUST produce identical `.agents/prompts/architecture-review.md` content |
