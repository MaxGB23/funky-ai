# Tasks: Pipeline Integration (Fase 4)

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 650–750 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: context.js module → PR 2: assess.js + estimate.js refactors → PR 3: pipeline.js |
| Delivery strategy | single-pr |
| Chain strategy | size-exception |

```
Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High
```

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | context.js + context.test.js | PR 1 | `npx vitest tests/context.test.js` | N/A (pure module) | Remove `context.js`, revert `tests/context.test.js` |
| 2 | assess.js + estimate.js refactors + estimateDomain.js cleanup + test updates | PR 2 | `npx vitest tests/assess.test.js tests/estimate.test.js` | `node bin/funky.js assess; node bin/funky.js estimate` | Revert assess.js, estimate.js, estimateDomain.js, test files |
| 3 | pipeline.js + bin/funky.js registration + pipeline.test.js | PR 3 | `npx vitest tests/pipeline.test.js` | `node bin/funky.js pipeline --help` | Revert pipeline.js, bin/funky.js, tests/pipeline.test.js |

---

## Batch 1: context.js module (foundation)

- [x] 1.1 Create `funky-cli/src/utils/context.js` with 6 exported functions: `initContext()`, `readContext(targetBase)`, `writeContext(targetBase, ctx)`, `findCanvases(targetBase)`, `countUnfilledSections(markdown)`, `loadDecisions(targetBase, decisionsPath?)` — mirroring current implementations from `assess.js` (findCanvas, countUnfilledSections) and `estimateDomain.js` (findCanvases, loadDecisions)
- [x] 1.2 Create `funky-cli/tests/context.test.js` with unit tests for all 6 functions covering: valid/missing/invalid JSON (readContext), happy path write (writeContext), root/docs canvas discovery (findCanvases), match/no-match counting (countUnfilledSections), present/missing decisions file (loadDecisions), default structure (initContext)

## Batch 2: Refactor assess.js

- [x] 2.1 Extract all action logic from `.action()` callback into `export function runAssess(targetBase, opts = {})` in `funky-cli/src/commands/assess.js` — accept `opts.contextPath` for context file path
- [x] 2.2 Add `--context <path>` / `-c` option to `assessCommand` via `.option('-c, --context <path>', '...')`
- [x] 2.3 In `runAssess()`: when `opts.contextPath` is set, call `readContext(targetBase)` to get canvases instead of filesystem `findCanvases()`. On missing file, print error and return early (no exit). After generating guide, call `writeContext(targetBase, ctx)` to persist `assess.runAt` + `assess.dynamicQuestions`
- [x] 2.4 Move `process.exit(0)` only in Commander `.action()` callback, never inside `runAssess()`
- [x] 2.5 Update `funky-cli/tests/assess.test.js`: existing tests (parseFrontmatter + action flow) pass unchanged. Add describe block for `--context` flag: test context file missing → error, test context with valid canvases object, test context writes assess results

## Batch 3: Refactor estimate.js

- [x] 3.1 Change import in `funky-cli/src/commands/estimate.js`: import `{ loadDecisions, findCanvases }` from `../utils/context.js` instead of `../utils/estimateDomain.js`
- [x] 3.2 Extract all action logic from `.action()` callback into `export function runEstimate(targetBase, opts = {})` — synchronous (same pattern as runAssess), accepts `opts.context`. Replace try/catch wrapping with try block inside function, propagate errors via catch internally
- [x] 3.3 Add `--context <path>` / `-c` option to `estimateCommand`
- [x] 3.4 In `runEstimate()`: when `opts.context` is set, call `readContext(targetBase)`. Use `ctx.assess?.decisionsFile` if available. After generating guide, call `writeContext(targetBase, ctx)` to persist `estimate.runAt`. On missing context file, print error and return (no exit)
- [x] 3.5 Replace inline `process.exit(0)` in `.action()` callback with `runEstimate(targetBase, programOpts)` followed by `process.exit(0)`. Ensure `process.exit(0)` appears ONLY in callback, never inside `runEstimate()`
- [x] 3.6 Remove `findCanvases`, `findCanvas`, `countUnfilledSections`, `loadDecisions` from `funky-cli/src/utils/estimateDomain.js`. Keep `getTodayDate()` (used internally), `generatePricingGuide`, `generateDecisionsTemplate`, `generateIAPrompt`, `generateIAPromptBanner`, `generateIAPromptFooter`
- [x] 3.7 Update `funky-cli/tests/estimate.test.js`: remove `loadDecisions` and `findCanvases` describe blocks. Existing integration tests for `estimateCommand` pass unchanged. Add describe block for `--context` flag: test context file missing, test context with decisionsFile path, test context writes estimate timestamp

## Batch 4: pipeline.js + registration

- [x] 4.1 Create `funky-cli/src/commands/pipeline.js` with Commander command and 4 subcommands:
  - `assess`: `initContext()` if context.json missing, then `runAssess(targetBase, { contextPath })` with `./context.json`
  - `estimate`: verify context.json exists + `assess.runAt` not null (error + exit 1 if blocked), then `runEstimate(targetBase, { contextPath })`
  - `all`: run assess then estimate sequentially; if assess fails (throws), do NOT run estimate
  - `status`: read context.json, display canvas state + assess/estimate dates + pipeline progress
- [x] 4.2 Add `import { pipelineCommand } from '../src/commands/pipeline.js'` + `program.addCommand(pipelineCommand)` to `funky-cli/bin/funky.js`
- [x] 4.3 Create `funky-cli/tests/pipeline.test.js` with tests: `pipeline assess` first run initializes context, `pipeline assess` subsequent run reuses context, `pipeline estimate` blocked when assess not run, `pipeline all` completes full flow, `pipeline all` stops on assess failure, `pipeline status` shows all-complete, `pipeline status` shows not-started

---

## Implementation Order

1. **Batch 1** first — context.js is the foundation that both assess.js and estimate.js refactors depend on
2. **Batch 2** — assess.js refactor (simpler, fewer dependencies, establishes pattern)
3. **Batch 3** — estimate.js refactor (follows same pattern as assess, plus import switch + estimateDomain.js cleanup)
4. **Batch 4** — pipeline.js (depends on all previous batches for `runAssess`/`runEstimate`/context functions)

Each batch is independently testable. The 400-line budget will likely be exceeded — a single PR must carry a `size:exception` approval. If the reviewer prefers smaller slices, use the 3-PR chain instead.
