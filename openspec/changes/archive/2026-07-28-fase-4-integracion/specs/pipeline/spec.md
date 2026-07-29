# Pipeline Specification

> Domain: pipeline | Status: New | Change: fase-4-integracion | Type: Full

---

## Propósito

`funky pipeline` es un comando de orquestación que conecta `assess` y `estimate` en un flujo secuencial con estado compartido a través de `context.json`. Permite ejecutar pasos individuales (`pipeline assess`, `pipeline estimate`), el flujo completo (`pipeline all`), o consultar el estado actual (`pipeline status`). Elimina la necesidad de que el usuario recuerde ejecutar comandos en orden manualmente.

---

## Requirements

### R-P1: Pipeline command registration

The system MUST register `funky pipeline` as a Commander command with subcommands: `assess`, `estimate`, `all`, `status`. The command MUST be registered in `bin/funky.js` alongside existing commands.

#### Scenario: CLI shows pipeline subcommands
- GIVEN `funky pipeline --help` is invoked
- WHEN the help text is displayed
- THEN it lists `assess`, `estimate`, `all`, and `status` as available subcommands

### R-P2: `pipeline assess` runs assess with context

The system MUST call `runAssess(targetBase, { contextPath })` where `contextPath` points to `./context.json` in the project root. If `context.json` does not exist, the system MUST initialize it via `initContext()` before running assess. The `canvases` object from context MUST be populated if `findCanvases()` finds canvas files.

#### Scenario: First run initializes context
- GIVEN `funky pipeline assess` runs in a project with no `context.json`
- WHEN the command executes
- THEN `context.json` is created with `initContext()` shape
- AND assess is called with `--context ./context.json`
- AND after completion `context.json` contains `assess.runAt` with a timestamp

#### Scenario: Subsequent runs reuse existing context
- GIVEN `context.json` already exists from a previous run
- WHEN `funky pipeline assess` executes
- THEN existing context is read (not re-initialized)
- AND `assess.runAt` is updated with the new timestamp

### R-P3: `pipeline estimate` runs estimate with context

The system MUST call `runEstimate(targetBase, { contextPath })` where `contextPath` points to `./context.json`. The system MUST verify that `context.json` exists and that `assess.runAt` is not null. If `assess.runAt` is null, the system MUST print an error and exit with code 1.

#### Scenario: assess already run — estimate proceeds
- GIVEN `context.json` has `assess.runAt` set to a past timestamp
- WHEN `funky pipeline estimate` executes
- THEN estimate runs normally with all pipeline steps
- AND `estimate.runAt` is written to context

#### Scenario: assess not run yet — estimate blocked
- GIVEN `context.json` has `assess.runAt` set to null
- WHEN `funky pipeline estimate` executes
- THEN an error is printed: "Assess has not been run yet. Run 'funky pipeline assess' first."
- AND exit code is 1

#### Scenario: context.json missing — estimate blocked
- GIVEN `context.json` does not exist
- WHEN `funky pipeline estimate` executes
- THEN an error is printed indicating context is missing
- AND exit code is 1

### R-P4: `pipeline all` runs assess then estimate sequentially

The system MUST execute `pipeline assess` followed by `pipeline estimate` sequentially using the same `context.json`. If assess fails (non-zero exit), the pipeline MUST stop and NOT proceed to estimate.

#### Scenario: Full pipeline succeeds
- GIVEN a project with canvases and no previous context
- WHEN `funky pipeline all` executes
- THEN assess runs first, writing `assess.runAt`
- AND estimate runs second, reading the updated context
- AND `estimate.runAt` is written after completion
- AND exit code is 0

#### Scenario: Assess failure stops pipeline
- GIVEN assess encounters an error (e.g., template missing)
- WHEN `funky pipeline all` executes
- THEN the pipeline prints the assess error
- AND estimate is NOT executed
- AND exit code is non-zero

### R-P5: `pipeline status` shows pipeline state

The system MUST read `./context.json` and display: canvas state (found sources + unfilled count), assess state (date or "not run"), estimate state (date or "not run"), pipeline progress summary (completed steps list).

#### Scenario: All steps completed
- GIVEN `context.json` has both `assess.runAt` and `estimate.runAt` set
- WHEN `funky pipeline status` executes
- THEN output shows assess date, estimate date, and pipeline progress as complete

#### Scenario: No context file
- GIVEN `context.json` does not exist
- WHEN `funky pipeline status` executes
- THEN output shows "Pipeline not started" message
- AND exit code is 0

### R-P6: context.json initialization

The system MUST initialize `context.json` at `./context.json` (project root) on first `pipeline assess` or `pipeline all` if it does not exist. Initialization uses `initContext()`.

#### Scenario: initContext() default structure
- GIVEN `initContext()` is called
- WHEN it returns the initial state
- THEN the object MUST have `{ version: 1, createdAt: "<ISO>", canvases: { projectCanvas: null, projectSource: null, infraCanvas: null, infraSource: null, unfilledCount: 0 }, assess: { runAt: null, dynamicQuestions: [] }, estimate: { runAt: null }, pipeline: { lastCommand: null, completed: [] } }`

### R-P7: Exit codes

The pipeline MUST exit with code 0 on success and code 1 on any failure (assess error, estimate error, missing context, assess not run before estimate).

#### Scenario: Success exit
- GIVEN any pipeline subcommand completes successfully
- WHEN the command finishes
- THEN exit code is 0

#### Scenario: Failure exit
- GIVEN any error occurs (missing context, blocked step, runtime error)
- WHEN the command finishes
- THEN exit code is 1

---

## Context Module Requirements

### R-C1: `initContext()`

`initContext()` MUST return the default context object as specified in R-P6.

### R-C2: `readContext(targetBase)`

`readContext(targetBase)` MUST read and parse `{targetBase}/context.json`. MUST return the parsed object if the file exists and is valid JSON. MUST return `null` if the file does not exist or contains invalid JSON.

#### Scenario: File exists and valid
- GIVEN `{targetBase}/context.json` contains valid JSON
- WHEN `readContext(targetBase)` is called
- THEN the parsed object is returned

#### Scenario: File missing
- GIVEN `{targetBase}/context.json` does not exist
- WHEN `readContext(targetBase)` is called
- THEN `null` is returned

#### Scenario: Invalid JSON
- GIVEN `{targetBase}/context.json` contains malformed JSON
- WHEN `readContext(targetBase)` is called
- THEN `null` is returned

### R-C3: `writeContext(targetBase, ctx)`

`writeContext(targetBase, ctx)` MUST stringify the `ctx` object as JSON and write it to `{targetBase}/context.json`. MUST overwrite any existing file.

### R-C4: `findCanvases(targetBase)`

`findCanvases(targetBase)` MUST search for `PROJECT-CANVAS.md` and `INFRA-CANVAS.md` in the project root first, then `docs/` fallback. MUST return `{ projectCanvas: string|null, projectSource: string|null, infraCanvas: string|null, infraSource: string|null, unfilledCount: number }`. Content fields contain file content or null if not found. Source fields contain `"root"`, `"docs"`, or null. `unfilledCount` counts `[Responde aquí]` occurrences across both canvases.

#### Scenario: Both in root
- GIVEN both canvases exist at project root
- WHEN `findCanvases(targetBase)` is called
- THEN both content fields have file contents
- AND sources are `"root"`

#### Scenario: Canvas missing
- GIVEN only PROJECT-CANVAS.md exists
- WHEN `findCanvases(targetBase)` is called
- THEN `projectCanvas` has content, `infraCanvas` is null
- AND `infraSource` is null

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
