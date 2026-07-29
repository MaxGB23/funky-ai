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

The system MUST generate a discussion guide at `docs/funky-ai/assess/architecture-review.md` containing: embedded canvas content, 3 static C1 questions (budget+infra, RPS+DB, SLA+redundancy), optionally 1-2 dynamic C2 questions, and a 6-phase discussion structure (Contexto, Preocupaciones, Preguntas Guía, Riesgos, Alternativas, Acuerdos). The file MUST be overwritten if it already exists.

#### Scenario: Happy path — full generation

- GIVEN both canvases exist and have no unfilled placeholders
- WHEN `funky assess` executes
- THEN `docs/funky-ai/assess/architecture-review.md` is created
- AND it contains the 6-phase structure with all 3 C1 questions embedded
- AND it contains the full content of both canvases

#### Scenario: Overwrite existing file

- GIVEN `docs/funky-ai/assess/architecture-review.md` already exists from a previous run
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

The system MUST create `docs/funky-ai/assess/architecture-decisions.md` with a structured template (sections for decisión, rationale, alternativas, riesgos, fecha) IF the file does not already exist. The system MUST NOT overwrite an existing decisions file.

#### Scenario: Create decisions template

- GIVEN `docs/funky-ai/assess/architecture-decisions.md` does not exist
- WHEN `funky assess` executes
- THEN the file is created with the standard decision template structure

#### Scenario: Decisions template already exists

- GIVEN `docs/funky-ai/assess/architecture-decisions.md` already exists with previous decisions
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

### R-A1: `--context` flag for context file integration

The system MUST accept an optional `--context <path>` / `-c` flag on `funky assess`. When the flag is provided, the system MUST read canvas content from paths defined in `context.json` at the given path instead of running its own `findCanvas()` discovery. After generating the discussion guide, the system MUST write `assess.runAt` (ISO 8601 timestamp) and `assess.dynamicQuestions` (array of C2 question objects) to the same `context.json` file. When the flag is NOT provided, the system MUST behave exactly as specified in the main assess spec (backward compatible).

#### Scenario: --context provides canvas paths

- GIVEN `funky assess --context /path/to/context.json` is invoked
- AND `context.json` contains `{ "canvases": { "projectCanvas": "<content>", "projectSource": "context", "infraCanvas": "<content>", "infraSource": "context" } }`
- WHEN the command executes
- THEN canvas content is read from the context object
- AND `findCanvas()` is NOT called in filesystem

#### Scenario: --context writes assess results

- GIVEN `funky assess --context ./context.json` completes successfully
- WHEN the guide is generated
- THEN `context.json` is updated with `assess.runAt` set to the current ISO timestamp
- AND `assess.dynamicQuestions` contains the generated C2 questions (or empty array)

#### Scenario: No --context flag — full backward compatibility

- GIVEN `funky assess` is invoked without `--context`
- WHEN the command executes
- THEN all main-spec requirements R1-R6 apply unchanged
- AND canvases are discovered via filesystem `findCanvas()`
- AND no `context.json` is read or written

#### Scenario: --context file does not exist

- GIVEN `funky assess --context ./missing.json` is invoked
- AND `missing.json` does not exist
- WHEN the command executes
- THEN an error message is printed indicating the context file is missing
- AND the process exits with code 1

### R-A2: Extracted `runAssess(targetBase, opts)` function

The system MUST export `async function runAssess(targetBase, opts)` containing all action logic currently in the Commander `.action()` callback. The Commander `.action()` callback MUST call `await runAssess(...)` then `process.exit(0)`. The `process.exit(0)` call MUST NOT appear anywhere inside `runAssess()`. The `opts` object MUST accept `{ contextPath?: string }` for the `--context` flag value.

#### Scenario: Programmatic call returns normally

- GIVEN `runAssess(targetBase, {})` is called from Node.js code
- WHEN execution completes
- THEN the function returns without calling `process.exit`
- AND all output files (guide, decisions template) are generated

#### Scenario: Commander callback orchestrates exit

- GIVEN the Commander `.action()` fires
- WHEN `await runAssess(targetBase, opts)` completes
- THEN `process.exit(0)` is called by the callback, not by `runAssess`

## Non-Functional Requirements

| Área | Especificación |
|------|---------------|
| Performance | Canvas reading and guide generation MUST complete in <500ms on a cold start |
| Error handling | All errors (fs read failures, permission denied) MUST print a warning and continue with exit 0 |
| Backward compatibility | `parseFrontmatter()` MUST remain exported and unchanged for existing consumers |
| Backward compatibility | `runAssess()` MUST be importable without breaking existing test mocks that import from `assess.js` |
| Boundary | `process.exit(0)` MUST appear ONLY in the `.action()` callback, exactly once |
| Security | The system MUST NOT read files outside the project root (process.cwd()) |
| Determinism | Given identical canvas files, the system MUST produce identical `docs/funky-ai/assess/architecture-review.md` content |
