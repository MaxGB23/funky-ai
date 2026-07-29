# Design: Pipeline Integration (Fase 4)

## Technical Approach

Extract action logic from Commander `.action()` callbacks into exported functions (`runAssess`, `runEstimate`). Create `src/utils/context.js` for shared context state via `context.json`. Add `--context` flag to both commands. Create `src/commands/pipeline.js` as a thin orchestrator. All decisions preserve backward compatibility — no flag → unchanged behavior.

## Architecture Decisions

### Decision: context.json over filesystem handoff
**Choice**: JSON file at project root for shared pipeline state
**Alternatives**: YAML, embedded in package.json, in-memory state
**Rationale**: JSON is Node-native (zero dependency), matches the data-oriented shape (timestamps, arrays, nested objects), and is human-readable for debugging. File is small and writes are infrequent.

### Decision: Direct function calls for pipeline orchestration
**Choice**: `pipeline all` calls `runAssess()` and `runEstimate()` directly
**Alternatives**: Spawn child processes per step
**Rationale**: Zero overhead, simpler error propagation, matches existing pattern where Commander actions call synchronous helpers. No subprocess boundaries needed.

### Decision: Module pattern for context.js
**Choice**: Exported pure functions (not a class)
**Alternatives**: Class-based ContextStore singleton
**Rationale**: Codebase uses module-level exported functions everywhere (assessRules.js, estimateDomain.js). No in-memory state — all state is in the JSON file. Pure functions are simpler to test.

### Decision: findCanvases/loadDecisions move to context.js
**Choice**: Relocate from estimateDomain.js to context.js, remove from estimateDomain.js
**Alternatives**: Import and re-export from estimateDomain.js
**Rationale**: These are infrastructure-level operations (filesystem reads), not domain logic (pricing/decisions template). context.js is their natural home. estimateDomain.js keeps only pricing-domain functions.

## Data Flow

### Before
```
assess ──findCanvas()──► PROJECT-CANVAS.md ──► .agents/prompts/architecture-review.md
       ──findCanvas()──► INFRA-CANVAS.md    ──► docs/architecture-decisions.md

estimate ──findCanvas()──► PROJECT-CANVAS.md ──► .agents/prompts/pricing-guide.md
         ──findCanvas()──► INFRA-CANVAS.md
         ──loadDecisions()──► docs/architecture-decisions.md
```

### After (without --context): unchanged

### After (with --context)
```
pipeline assess:
  initContext() → writeContext()
  runAssess(targetBase, { contextPath })
    ├── readContext() → canvases from context.json
    ├── generateGuideQuestions (same)
    ├── write templates (same)
    └── writeContext({ assess.runAt, assess.dynamicQuestions })

pipeline estimate:
  runEstimate(targetBase, { contextPath })
    ├── readContext() → decisions path from context.json
    ├── loadDecisions(targetBase / decisions path)
    ├── generatePricingGuide (same)
    ├── write templates (same)
    └── writeContext({ estimate.runAt })

pipeline all: pipeline assess → if failed exit 1 → pipeline estimate
pipeline status: readContext() → display state
```

## context.json Schema

```json
{
  "version": 1,
  "createdAt": "<ISO>",
  "canvases": {
    "projectCanvas": "<content|null>",
    "projectSource": "root|docs|null",
    "infraCanvas": "<content|null>",
    "infraSource": "root|docs|null",
    "unfilledCount": 0
  },
  "assess": {
    "runAt": "<ISO|null>",
    "dynamicQuestions": []
  },
  "estimate": {
    "runAt": "<ISO|null>"
  },
  "pipeline": {
    "lastCommand": null,
    "completed": []
  }
}
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `funky-cli/src/utils/context.js` | Create | initContext, readContext, writeContext, findCanvases, countUnfilledSections, loadDecisions |
| `funky-cli/src/commands/assess.js` | Modify | Extract runAssess(), add --context flag, move exit(0) to callback |
| `funky-cli/src/commands/estimate.js` | Modify | Extract runEstimate(), add --context flag, move exit(0) to callback, import loadDecisions/findCanvases from context.js |
| `funky-cli/src/utils/estimateDomain.js` | Modify | Remove findCanvases, findCanvas, countUnfilledSections, loadDecisions; keep pricing/D/T template + IA prompt functions |
| `funky-cli/src/commands/pipeline.js` | Create | Commander command with assess/estimate/all/status subcommands |
| `funky-cli/bin/funky.js` | Modify | Import + register pipelineCommand |
| `funky-cli/tests/context.test.js` | Create | Unit tests for all 6 context.js functions |
| `funky-cli/tests/pipeline.test.js` | Create | Tests for all 4 pipeline subcommands |
| `funky-cli/tests/assess.test.js` | Modify | Update imports, add --context tests |
| `funky-cli/tests/estimate.test.js` | Modify | Update imports, add --context tests |

## Interfaces / Contracts

```js
// context.js
export function initContext() → ContextObject
export function readContext(targetBase) → ContextObject | null
export function writeContext(targetBase, ctx) → void
export function findCanvases(targetBase) → { projectCanvas, projectSource, infraCanvas, infraSource, unfilledCount }
export function countUnfilledSections(markdown) → number
export function loadDecisions(targetBase, decisionsPath?) → string | null

// assess.js — ADDED
export async function runAssess(targetBase, opts = { contextPath?: string })

// estimate.js — ADDED
export async function runEstimate(targetBase, opts = { contextPath?: string })
```

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | context.js: all 6 functions | Mock fs, test returns for valid/missing/invalid files |
| Unit | runAssess() without --context | Same mocks as existing tests, verify no context.json access |
| Unit | runAssess() with --context | Mock context.json read, verify canvases from context, verify writeContext called |
| Unit | runEstimate() without --context | Same mocks as existing, verify loadDecisions from context.js, no context.json |
| Unit | runEstimate() with --context | Mock context.json read, verify decisions path lookup, verify writeContext |
| Integration | pipeline.js: 4 subcommands | Mock runAssess/runEstimate, test init/write/validation flows |
| Legacy | Existing assess/estimate tests | Must pass UNCHANGED — no --context flag → old behavior |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Pipeline uses direct function calls.

## Migration / Rollout

No migration required. `--context` flag is additive — existing workflows untouched. Pipeline command is new.

## Open Questions

None.
