# Delta for Assess

> Domain: assess | Change: fase-4-integracion | Type: Delta | Source: `openspec/specs/assess/spec.md`
>
> This delta describes ADDED requirements only. No existing requirement is modified or removed.
> Without `--context`, all existing requirements apply unchanged.

---

## ADDED Requirements

### Requirement: R-A1 — `--context` flag for context file integration

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

### Requirement: R-A2 — Extracted `runAssess(targetBase, opts)` function

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

---

## Non-Functional Delta

| Área | Adición |
|------|---------|
| Backward compatibility | `runAssess()` MUST be importable without breaking existing test mocks that import from `assess.js` |
| Boundary | `process.exit(0)` MUST appear ONLY in the `.action()` callback, exactly once |
