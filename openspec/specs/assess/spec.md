# Root Spec — Assess Domain
> Domain: assess | Status: Living | Source of Truth: `openspec/specs/assess/spec.md`

This is the canonical living specification for the `assess` domain.
It reflects the **current state** of all requirements. Read this file — NOT the change history — for the authoritative view.

---

## Propósito

El comando `funky assess` facilita una sesión de discusión arquitectónica entre el equipo humano y la IA. No evalúa, no produce scores, no falla. Inyecta una guía de discusión basada en los canvases del proyecto (PROJECT-CANVAS + INFRA-CANVAS), los patrones de riesgo de referencia (`risk-patterns.md`) como candidatos a considerar, y un template de documentación de decisiones.

## Requirements

### R1: Canvas Discovery

The system MUST locate PROJECT-CANVAS.md and INFRA-CANVAS.md in the canonical directory `docs/funky-ai/canvas/` (`{targetBase}/docs/funky-ai/canvas/`). If a canvas is not found there, the system SHOULD warn the user but MUST continue generating the discussion guide with placeholder content.

#### Scenario: Both canvases exist in the canonical directory

- GIVEN `./docs/funky-ai/canvas/PROJECT-CANVAS.md` and `./docs/funky-ai/canvas/INFRA-CANVAS.md` exist
- WHEN `funky assess` executes
- THEN both files are read from `docs/funky-ai/canvas/`
- AND no missing-canvas warning is printed

#### Scenario: One canvas missing

- GIVEN only PROJECT-CANVAS.md exists (INFRA-CANVAS.md missing in `docs/funky-ai/canvas/`)
- WHEN `funky assess` executes
- THEN a warning is printed indicating INFRA-CANVAS is missing
- BUT the guide is still generated with "Canvas no disponible" for the missing canvas

#### Scenario: Both canvases missing

- GIVEN neither PROJECT-CANVAS.md nor INFRA-CANVAS.md exist in `docs/funky-ai/canvas/`
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

The system MUST generate a discussion guide at `docs/funky-ai/assess/architecture-review.md` containing: embedded canvas content, 3 static C1 questions (budget+infra, RPS+DB, SLA+redundancy), a risk-patterns section listing the surfaced candidate patterns, and a 6-phase discussion structure (Contexto, Preocupaciones, Preguntas Guía, Riesgos, Alternativas, Acuerdos). The file MUST be overwritten if it already exists.

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

### R4: Risk Patterns Surfacing

The system MUST surface reference risk patterns from `docs/funky-ai/assess/risk-patterns.md` as candidates to consider in the discussion guide, instead of detecting risks by matching regular expressions against canvas content. The system MUST create `docs/funky-ai/assess/risk-patterns.md` from the built-in template IF the file does not exist, and MUST NOT overwrite it when it already exists (it is a team-owned living document). The guide MUST list all surfaced patterns as candidates and MUST instruct the AI to evaluate, in Phase 4, which patterns apply to the concrete project by reading the canvases. The system MUST NOT filter or match patterns based on canvas content.

#### Scenario: risk-patterns.md does not exist — created from template

- GIVEN `docs/funky-ai/assess/risk-patterns.md` does not exist
- WHEN `funky assess` executes
- THEN the file is created with the content of the built-in template
- AND the guide includes the template patterns as candidates to consider

#### Scenario: risk-patterns.md already exists — team content preserved

- GIVEN `docs/funky-ai/assess/risk-patterns.md` already exists with team-specific patterns
- WHEN `funky assess` executes
- THEN the file is NOT modified
- AND a notice is printed indicating the file already exists
- AND the guide includes the team-specific patterns as candidates

#### Scenario: Guide lists patterns as candidates, not confirmed risks

- GIVEN the discussion guide is generated
- THEN the guide lists the surfaced patterns as candidates to evaluate
- AND the guide instructs the AI to evaluate in Phase 4 which patterns apply by reading the canvases
- AND no pattern is asserted in the guide as a confirmed risk

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

The system MUST accept an optional `--context <path>` / `-c` flag on `funky assess`. When the flag is provided, the system MUST use `context.json` at the given path only for execution and persistence metadata (such as `assess.runAt` and `assess.dynamicQuestions`). Canvas content MUST ALWAYS be discovered from the filesystem via `findCanvas()`, regardless of whether `--context` is provided. After generating the discussion guide, the system MUST write `assess.runAt` (ISO 8601 timestamp) and `assess.dynamicQuestions` (array of surfaced risk pattern names) to the same `context.json` file. When the flag is NOT provided, the system MUST behave exactly as specified in the main assess spec (backward compatible).

#### Scenario: --context keeps canvas discovery on the filesystem

- GIVEN `funky assess --context /path/to/context.json` is invoked
- AND `context.json` contains only execution metadata (no canvas content)
- WHEN the command executes
- THEN canvas content is read via `findCanvas()` from the filesystem
- AND `context.json` is used only for execution metadata such as run timestamps and dynamic questions
- AND no canvas data is read from the context object

#### Scenario: --context writes assess results

- GIVEN `funky assess --context ./context.json` completes successfully
- WHEN the guide is generated
- THEN `context.json` is updated with `assess.runAt` set to the current ISO timestamp
- AND `assess.dynamicQuestions` contains the surfaced risk pattern names (or empty array)

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
