# Pipeline Specification

> Domain: pipeline | Status: Living | Source of Truth: `openspec/specs/pipeline/spec.md`

This is the canonical living specification for the `pipeline` domain.
It reflects the **current state** of all requirements. Read this file — NOT the change history — for the authoritative view.

---

## Propósito

`funky pipeline` es un comando de orquestación que conecta `assess` y `estimate` en un flujo secuencial con estado compartido a través de `docs/funky-ai/pipeline/context.json` (schema v2, R-P8). Permite ejecutar pasos individuales (`pipeline assess`, `pipeline estimate`), el flujo completo (`pipeline all`), o consultar el estado actual (`pipeline status`, humano o `--json`). Elimina la necesidad de que el usuario recuerde ejecutar comandos en orden manualmente y deja trazabilidad real por fase (running/completed/failed/skipped).

---

## Requirements

### R-P1: Pipeline command registration

The system MUST register `funky pipeline` as a Commander command with subcommands: `assess`, `estimate`, `all`, `status`. The command MUST be registered in `bin/funky.js` alongside existing commands.

#### Scenario: CLI shows pipeline subcommands

- GIVEN `funky pipeline --help` is invoked
- WHEN the help text is displayed
- THEN it lists `assess`, `estimate`, `all`, and `status` as available subcommands

### R-P2: `pipeline assess` runs assess with context

The system MUST call `runAssess(targetBase, { context: true })` against the context file at `{targetBase}/docs/funky-ai/pipeline/context.json`; if missing, MUST initialize via `initContext()`. Canvas content MUST ALWAYS come from the filesystem, never from context.

#### Scenario: First run initializes context

- GIVEN `funky pipeline assess` runs in a project with no context file at `docs/funky-ai/pipeline/context.json`
- WHEN the command executes
- THEN a v2 context is created at `docs/funky-ai/pipeline/context.json`
- AND assess is called with `{ context: true }`
- AND after completion `assess.status` is `completed` and `assess.runAt` is set

#### Scenario: Subsequent runs reuse existing context

- GIVEN the context file already exists
- WHEN `funky pipeline assess` executes
- THEN existing context is read; phase state updated

### R-P3: `pipeline estimate` runs estimate with context

The system MUST call `runEstimate(targetBase, { context: true })` against the context file at `{targetBase}/docs/funky-ai/pipeline/context.json`. The system MUST verify that `context.json` exists and that `assess.runAt` is not null. If `assess.runAt` is null, the system MUST print an error and exit with code 1.

#### Scenario: assess already run — estimate proceeds

- GIVEN `context.json` has `assess.runAt` set to a past timestamp
- WHEN `funky pipeline estimate` executes
- THEN estimate runs normally with all pipeline steps
- AND `estimate.runAt` is written to context

#### Scenario: assess not run yet — estimate blocked

- GIVEN `context.json` has `assess.runAt` set to null
- WHEN `funky pipeline estimate` executes
- THEN an error is printed: "Assess aún no se ha ejecutado. Ejecuta 'funky pipeline assess' primero."
- AND exit code is 1

#### Scenario: context.json missing — estimate blocked

- GIVEN `context.json` does not exist
- WHEN `funky pipeline estimate` executes
- THEN an error is printed indicating context is missing
- AND exit code is 1

### R-P4: `pipeline all` runs assess then estimate sequentially

The system MUST run assess then estimate sequentially on the same context file, marking state per R-P10. If assess fails, the pipeline MUST stop, mark estimate `skipped`, and NOT proceed.

#### Scenario: Full pipeline succeeds

- GIVEN a project with canvases, no previous context
- WHEN `funky pipeline all` executes
- THEN both phases persist `completed`; exit 0

#### Scenario: Assess failure stops pipeline

- GIVEN assess encounters an error
- WHEN `funky pipeline all` executes
- THEN error printed; estimate NOT executed (marked `skipped`); exit 1

### R-P6: context.json initialization

The system MUST initialize the context file at `{targetBase}/docs/funky-ai/pipeline/context.json` on first `pipeline assess`/`all` if missing, via `initContext()` (v2 per R-P8).

#### Scenario: initContext() default structure

- GIVEN `initContext()` is called
- WHEN it returns the initial state
- THEN the object matches the R-P8 v2 shape

### R-P7: Exit codes

The pipeline MUST exit 0 on success (including warnings) and 1 on any thrown failure (assess/estimate error, missing context, assess not run, unknown version).

#### Scenario: Success exit

- GIVEN any subcommand completes successfully, warnings included
- WHEN the command finishes
- THEN exit code is 0

#### Scenario: Failure exit

- GIVEN any thrown error occurs
- WHEN the command finishes
- THEN exit code is 1

### R-P8: Schema v2

`initContext()` MUST return `{version:2, createdAt, currentPhase:null, assess:{status,startedAt,finishedAt,durationMs,error:null,artifacts:[],runAt:null,surfacedPatterns:[],decisionsFile:null}, estimate:{status,startedAt,finishedAt,durationMs,error:null,artifacts:[],runAt:null}}`. `status` MUST be `pending|running|completed|failed|skipped`. Artifacts MUST be `{name,path,kind:'generated'|'living'}`; `path` relative to targetBase, forward slashes. Shape is validated on read; missing/unknown fields are invalid.

#### Scenario: initContext returns v2

- GIVEN `initContext()` is called
- WHEN it returns
- THEN `version` is 2; each phase holds full state, `status: 'pending'`

### R-P9: Migration policy

`readContext` MUST auto-migrate v1 in place: preserve `createdAt`/`runAt`/`decisionsFile`; derive `surfacedPatterns` from `dynamicQuestions`; derive `completed`+`finishedAt` from runAt; rewrite as v2. Versions outside 1–2 MUST be refused: no write, error, exit 1.

#### Scenario: v1 migrates in place

- GIVEN a v1 file with `runAt` and `dynamicQuestions: ['Microservicios']`
- WHEN readContext loads it
- THEN it is rewritten as v2; `surfacedPatterns` and `runAt` preserved

#### Scenario: Unknown version refused

- GIVEN a file with `version: 99`
- WHEN readContext loads it
- THEN error printed, no write, exit 1

### R-P10: State machine and resume

`pipeline all` MUST persist `currentPhase` + phase `running`/`startedAt` before each phase, then `completed`/`failed` + `finishedAt`/`durationMs`/`error`/`artifacts` after, clearing `currentPhase`. A phase left `running` (no finishedAt) MUST be re-run next `all`; unreached phases MUST be `skipped`. No signal handlers; interruption is detected from left-`running` state.

#### Scenario: Interrupted run resumes

- GIVEN `estimate.status: 'running'`, no finishedAt
- WHEN `pipeline all` runs
- THEN estimate is re-run, not skipped

#### Scenario: Assess failure marks estimate skipped

- GIVEN assess throws during `pipeline all`
- WHEN the failure is handled
- THEN `assess.status` is `failed`; `estimate.status` is `skipped`; estimate NOT executed

### R-P11: `--json` contract

`pipeline status --json` and `pipeline all --json` MUST emit exactly one JSON object on stdout; human text to stderr or suppressed. Field order MUST be deterministic (timestamps excepted). JSON MUST be emitted before `process.exit`. Exit 0 on success incl. warnings (status quo); exit 1 on throw.

#### Scenario: JSON-only stdout

- GIVEN `pipeline status --json` runs
- WHEN the command exits
- THEN stdout parses as one JSON object, stable order, exit 0

#### Scenario: Warnings do not fail

- GIVEN a phase completes with warnings
- WHEN `pipeline all --json` finishes
- THEN exit 0; warnings present in JSON

### R-P12: Phase result objects

`runAssess`/`runEstimate` MUST return `{phase,status,artifacts,durationMs,warnings}` and persist own state via shared helper `updatePhaseState`. `pipeline all` MUST build summary/`--json` from results without re-reading the file.

#### Scenario: Results feed JSON

- GIVEN `pipeline all --json` completes
- WHEN results are collected
- THEN stdout JSON artifacts/statuses match returned results
- AND a standalone `runAssess({context:true})` persists `completed`+finishedAt+durationMs+artifacts

---

## Context Module Requirements

### R-C1: `initContext()`

`initContext()` MUST return the default context object as specified in R-P8 (v2).

### R-C2: `readContext(targetBase, contextPath)`

`readContext` MUST read the file at the resolved path (default `{targetBase}/docs/funky-ai/pipeline/context.json`) and return a TYPED result: missing file vs invalid JSON/shape vs EACCES/other error. v1 MUST auto-migrate per R-P9; versions outside 1–2 MUST be refused.

#### Scenario: File exists and valid

- GIVEN a valid v2 context file
- WHEN `readContext` is called
- THEN the parsed object is returned; file not rewritten

#### Scenario: File missing

- GIVEN the context file does not exist
- WHEN `readContext` is called
- THEN a "missing" typed result is returned

#### Scenario: Invalid JSON or shape

- GIVEN the file contains malformed JSON or an unknown v2 shape
- WHEN `readContext` is called
- THEN an "invalid" typed result is returned

#### Scenario: Permission denied is distinct

- GIVEN the file exists but is unreadable (EACCES)
- WHEN `readContext` is called
- THEN a typed error (not "missing") is returned

### R-C3: `writeContext(targetBase, ctx, contextPath)`

`writeContext` MUST stringify `ctx` and write to the resolved path (default `{targetBase}/docs/funky-ai/pipeline/context.json`), overwriting existing files.

### R-C4: `findCanvases(targetBase)`

`findCanvases(targetBase)` MUST search for `PROJECT-CANVAS.md` and `INFRA-CANVAS.md` in the canonical directory `docs/funky-ai/canvas/` (`{targetBase}/docs/funky-ai/canvas/`). MUST return `{ projectCanvas: string|null, infraCanvas: string|null, unfilledCount: number }`. Content fields contain file content or null if not found. `unfilledCount` counts `[Responde aquí]` occurrences across both canvases.

#### Scenario: Both in canonical directory

- GIVEN both canvases exist in `docs/funky-ai/canvas/`
- WHEN `findCanvases(targetBase)` is called
- THEN both content fields have file contents

#### Scenario: Canvas missing

- GIVEN only PROJECT-CANVAS.md exists
- WHEN `findCanvases(targetBase)` is called
- THEN `projectCanvas` has content, `infraCanvas` is null

### R-C5: `countUnfilledSections(markdown)`

`countUnfilledSections(markdown)` MUST return the number of occurrences of `[Responde aquí]` in the given string.

#### Scenario: Found matches

- GIVEN a string containing `[Responde aquí]` twice
- WHEN `countUnfilledSections()` is called
- THEN it returns `2`

#### Scenario: No matches

- GIVEN a string with no `[Responde aquí]` occurrences
- WHEN `countUnfilledSections()` is called
- THEN it returns `0`
