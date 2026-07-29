# Delta for Estimate

> Domain: estimate | Change: fase-4-integracion | Type: Delta | Source: `openspec/specs/estimate/spec.md`
>
> This delta describes ADDED requirements only. No existing requirement is modified or removed.
> Without `--context`, all existing requirements apply unchanged.

---

## ADDED Requirements

### Requirement: R-E1 — `--context` flag for context file integration

The system MUST accept an optional `--context <path>` / `-c` flag on `funky estimate`. When the flag is provided, the system MUST read the decisions path from `context.json` at the given path instead of defaulting to `docs/architecture-decisions.md`. The decisions content is still read from the filesystem at that path. After generating the pricing guide, the system MUST write `estimate.runAt` (ISO 8601 timestamp) to `context.json`. When the flag is NOT provided, the system MUST behave exactly as specified in the main estimate spec (backward compatible).

#### Scenario: --context provides decisions path
- GIVEN `funky estimate --context ./context.json` is invoked
- AND `context.json` contains `{ "assess": { "decisionsFile": "docs/architecture-decisions.md" } }`
- WHEN the command executes
- THEN decisions are read from `docs/architecture-decisions.md` (resolved relative to targetBase)

#### Scenario: --context writes estimate timestamp
- GIVEN `funky estimate --context ./context.json` completes
- WHEN the pricing guide is generated
- THEN `context.json` is updated with `estimate.runAt` set to the current ISO timestamp

#### Scenario: No --context — full backward compatibility
- GIVEN `funky estimate` is invoked without `--context`
- WHEN the command executes
- THEN all main-spec requirements R1-R6 apply unchanged
- AND decisions are read from `docs/architecture-decisions.md` (hardcoded default)
- AND no `context.json` is read or written

#### Scenario: --context file does not exist
- GIVEN `funky estimate --context ./missing.json` is invoked
- AND `missing.json` does not exist
- WHEN the command executes
- THEN an error message is printed indicating the context file is missing
- AND the process exits with code 1

### Requirement: R-E2 — `loadDecisions()` and `findCanvases()` relocated to `context.js`

The system MUST export `loadDecisions(targetBase)` and `findCanvases(targetBase)` from `src/utils/context.js`. These functions MUST be removed from `src/utils/estimateDomain.js`. All existing consumers (estimate.js, tests) MUST import these functions from `context.js` instead of `estimateDomain.js`. The function signatures and return values MUST remain identical to their current form.

#### Scenario: Imports resolve from context.js
- GIVEN `estimate.js` imports `{ loadDecisions, findCanvases }` from `context.js`
- WHEN the estimate command runs
- THEN both functions execute identically to their previous implementation in `estimateDomain.js`

#### Scenario: estimateDomain.js no longer exports moved functions
- GIVEN a test imports `{ loadDecisions }` from `estimateDomain.js`
- WHEN the module is loaded
- THEN the import is `undefined`
- AND the test fails predictably (guiding the developer to update the import path)

### Requirement: R-E3 — Extracted `runEstimate(targetBase, opts)` function

The system MUST export `async function runEstimate(targetBase, opts)` containing all action logic currently in the Commander `.action()` callback. The Commander `.action()` callback MUST call `await runEstimate(...)` then `process.exit(0)`. The `process.exit(0)` call MUST NOT appear anywhere inside `runEstimate()`. The `opts` object MUST accept `{ contextPath?: string }` for the `--context` flag value.

#### Scenario: Programmatic call returns normally
- GIVEN `runEstimate(targetBase, {})` is called from Node.js code
- WHEN execution completes
- THEN the function returns without calling `process.exit`
- AND all output files (pricing guide, decisions template) are generated

#### Scenario: Commander callback orchestrates exit
- GIVEN the Commander `.action()` fires for estimate
- WHEN `await runEstimate(targetBase, opts)` completes
- THEN `process.exit(0)` is called by the callback, not by `runEstimate`

---

## Non-Functional Delta

| Área | Adición |
|------|---------|
| Dependency | `loadDecisions()` and `findCanvases()` MUST be importable from `context.js` with zero behavioral change |
| Boundary | `process.exit(0)` MUST appear ONLY in the `.action()` callback, exactly once |
