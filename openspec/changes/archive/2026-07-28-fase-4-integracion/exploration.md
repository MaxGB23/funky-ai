## Exploration: Pipeline Integration (Fase 4 — Integración)

### Current State

The three commands (`init`, `assess`, `estimate`) exist as **independent islands** with no shared pipeline state:

**`funky init`** (`src/commands/init.js`):
- Pure function `runInit()` returns an intentions array (files to copy/create)
- Reads internal templates only, no project-level input
- Does NOT produce any structured output consumed by other commands
- Does NOT write to `.agents/prompts/` or any shared state
- No pipeline awareness whatsoever

**`funky assess`** (`src/commands/assess.js`):
- Reads PROJECT-CANVAS.md and INFRA-CANVAS.md (root → docs/ fallback) — inline `findCanvas()` function
- Generates dynamic questions via `assessRules.js` → `generateGuideQuestions()`
- Writes `.agents/prompts/architecture-review.md` (AI discussion guide)
- Writes `docs/architecture-decisions.md` (decisions template, only on first run)
- Ends with `process.exit(0)` — no return value, no structured output
- Has NO awareness that estimate will consume its decisions later

**`funky estimate`** (`src/commands/estimate.js`):
- Reads decisions via `loadDecisions()` from `docs/architecture-decisions.md` — raw markdown string, no structured parsing
- Duplicates `findCanvas()` logic from assess (identical implementation in `estimateDomain.js`)
- Duplicates `countUnfilledSections()` logic
- Writes `.agents/prompts/pricing-guide.md` and `.agents/prompts/pricing-decisions-template.md`
- Ends with `process.exit(0)` — no return value, no structured output

**Cross-command data flow (today):**
```
init ──> PROJECT-CANVAS.md, INFRA-CANVAS.md ──> assess ──> docs/architecture-decisions.md ──> estimate
```
The ONLY link is `docs/architecture-decisions.md` — raw markdown read as string. No JSON, no schema, no validation.

**Key issues:**
1. No structured shared state (`context.json`)
2. `findCanvas()` and `countUnfilledSections()` duplicated across assess and estimate
3. Decisions format is fragile markdown — lapses in template filling break estimate
4. User must remember and execute each command manually
5. No cross-phase feedback (assess doesn't tell estimate what decisions were made; estimate doesn't surface what's missing from assess)
6. Both commands use `process.exit(0)` — impossible to call programmatically from another command

### Affected Areas

- `funky-cli/src/commands/init.js` — no pipeline awareness; needs optional context integration
- `funky-cli/src/commands/assess.js` — duplicated findCanvas; needs structured output + --context flag
- `funky-cli/src/commands/estimate.js` — duplicated findCanvas; needs to read context.json instead of raw markdown
- `funky-cli/src/utils/estimateDomain.js` — `loadDecisions()` and `findCanvases()` move to shared context module
- `funky-cli/src/utils/assessRules.js` — `generateGuideQuestions()` already pure; can be reused as-is
- `funky-cli/src/utils/context.js` — **NEW**: shared context.json read/write, canvas discovery
- `funky-cli/src/commands/pipeline.js` — **NEW**: pipeline orchestrator command
- `funky-cli/bin/funky.js` — register new `pipeline` command
- `funky-cli/tests/assess.test.js` — update mocks for context awareness
- `funky-cli/tests/estimate.test.js` — update mocks for context awareness
- `funky-cli/tests/estimateDomain.test.js` — `loadDecisions`/`findCanvases` move to context.test.js
- `funky-cli/tests/context.test.js` — **NEW**: tests for context module
- `funky-cli/tests/pipeline.test.js` — **NEW**: tests for pipeline orchestrator

### Approaches

#### 1. **Shared Context Module + --context Flag (Recommended)**
Extract duplicated logic into `context.js`, add `--context` / `-c` flag to each command, create lightweight orchestrator.

- **What**: Create `src/utils/context.js` with `readContext()`, `writeContext()`, `findCanvases()`, `countUnfilledSections()`. Refactor assess and estimate to accept `--context` flag. Create `src/commands/pipeline.js` that chains them sequentially.
- **Pros**: DRY extraction; backward compatible (no flags = works as before); structured data flow; pipeline can be run as `funky pipeline all` or step-by-step `funky pipeline assess`
- **Cons**: Moderate refactoring across 3 files + 2 new files; tests need updating
- **Effort**: Medium

#### 2. **Full Orchestrator Command (Option A from task)**
New `funky pipeline` command runs all three from scratch, bypassing individual commands entirely.

- **What**: Create `src/commands/pipeline.js` that duplicates the IO logic of all three commands but shares an in-memory context. Individual commands stay as they are.
- **Pros**: Minimal changes to existing commands; centralized pipeline logic
- **Cons**: Code duplication with existing commands; two code paths for same operations; higher maintenance burden; individual commands remain offline-unaware
- **Effort**: Medium-High

#### 3. **Thin Shell Wrapper (Option C from task)**
A bash/bat wrapper or Node.js script that calls `funky init`, `funky assess`, `funky estimate` sequentially, parsing stdout to build context.

- **What**: `node scripts/pipeline.js` that shells out to the CLI, captures output
- **Pros**: Zero changes to existing code; fastest to implement
- **Cons**: Fragile (relies on console.log parsing); no structured data; no error recovery mid-pipeline; doesn't fix the underlying duplication or fragile markdown contract
- **Effort**: Low (but low quality)

### Recommendation

**Approach 1 — Shared Context Module + --context Flag**.

Why:
- Solves the core problem (duplicated findCanvas logic) at the root — DRY extraction benefits all future commands too
- Structured context.json is the foundation for any future pipeline features (notifications, analytics, resumability)
- Backward compatible: existing `funky assess` / `funky estimate` work unchanged
- The pipeline command is thin glue over the individual commands — no duplicated IO logic
- `process.exit(0)` refactoring is forced by the pipeline needing programmatic calls — this improves testability

**Proposed architecture:**

```
context.js (shared module)
├── readContext(targetBase)       → object | null
├── writeContext(targetBase, ctx) → void
├── findCanvases(targetBase)      → { projectCanvas, infraCanvas, unfilledCount }
├── initContext()                 → { version, createdAt }

pipeline.js (command)
├── 'pipeline assess'   → runs assess with context.json read/write
├── 'pipeline estimate' → runs estimate with context.json read/write
├── 'pipeline all'      → assess → estimate sequentially (init already done)
├── 'pipeline status'   → shows current pipeline state
```

**context.json schema:**
```json
{
  "version": 1,
  "createdAt": "ISO-date",
  "canvases": {
    "projectFound": true,
    "projectSource": "root",
    "infraFound": true,
    "infraSource": "root",
    "unfilledSections": 0
  },
  "assess": {
    "runAt": "ISO-date | null",
    "decisionsFile": "docs/architecture-decisions.md",
    "dynamicQuestions": []
  },
  "estimate": {
    "runAt": "ISO-date | null",
    "pricingGuideFile": ".agents/prompts/pricing-guide.md",
    "decisionsFile": ".agents/prompts/pricing-decisions-template.md"
  },
  "pipeline": {
    "lastCommand": "assess | estimate | all",
    "completed": []
  }
}
```

### Risks

- **Backward compatibility**: Existing standalone commands must work without `--context`. All changes additive.
- **process.exit(0) usage**: Both assess and estimate call `process.exit(0)` at end. Pipeline command would need to call them as functions, not subprocesses. Requires extracting the action logic from the Commander `.action()` callback into an exported function.
- **Test impact**: Moderate — existing mock-based tests largely work, but need updates for the shared module. New tests needed for context.js and pipeline.js.
- **context.json location**: Must decide — project root, `.agents/`, or `.funky/`. Project root is simplest and most visible.
- **Concurrent usage**: If user runs commands in parallel, context.json could be in inconsistent state. Low risk for CLI usage pattern.

### Ready for Proposal

**Yes** — the exploration is complete. The approach is clear, the module boundaries are well-defined, and the risk profile is manageable.

**What the orchestrator should tell the user:**
> "The exploration found that the three commands share no structured state and have duplicated canvas-discovery logic. The recommended approach is to create a shared `context.js` module, add `--context` flags to assess and estimate, build a `funky pipeline` orchestrator, and remove `process.exit(0)` from the action handlers to allow programmatic chaining. This solves both the data-flow problem AND the duplication problem."
