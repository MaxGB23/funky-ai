# Proposal: Pipeline Integration (Fase 4)

## Intent

Connect `init → assess → estimate` into a coherent pipeline. Currently commands are independent islands — no structured shared state, duplicated canvas discovery, fragile markdown handoff, `process.exit(0)` preventing programmatic chaining.

## Scope

### In
- `src/utils/context.js` — shared read/write for `context.json`, canvas discovery, unfilled-section detection
- `--context` / `-c` flag on `assess` and `estimate` commands
- `src/commands/pipeline.js` — `funky pipeline {assess|estimate|all|status}`
- Register pipeline command in `bin/funky.js`
- Extract action logic from Commander `.action()` into exported functions; move `process.exit(0)` to callers only
- Move `loadDecisions()` and `findCanvases()` from `estimateDomain.js` to `context.js`

### Out
- Full pipeline UI (progress bars, spinners)
- Notifications, analytics, CI integration
- `funky init` pipeline integration (no external dependencies)

## Capabilities

### New
- `pipeline`: orchestrate assess/estimate sequentially with shared `context.json` file

### Modified
- `assess`: accept `--context` flag → skip own canvas discovery, use context.json values when flag provided
- `estimate`: accept `--context` flag → read decisions path from context.json instead of raw markdown parse

## Approach

1. **`context.js`**: `readContext()`, `writeContext()`, `findCanvases()`, `countUnfilledSections()`, `initContext()` — extracted from assess and estimateDomain. Context file at project root `./context.json`.
2. **Refactor assess**: extract action as `export async function runAssess(targetBase, opts)`; add `--context` flag; `process.exit(0)` stays in Commander callback only.
3. **Refactor estimate**: same pattern. Move `loadDecisions()` from `estimateDomain.js` into context module.
4. **`pipeline.js`**: thin orchestrator calling refactored functions with context read/write between steps.
5. **Backward compat**: no flag → exact old behavior. Pipeline is a new command path.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/utils/context.js` | New | context.json read/write, canvas discovery, section counting |
| `src/commands/assess.js` | Modified | Add `--context` flag, extract `runAssess()`, remove exit(0) from logic |
| `src/commands/estimate.js` | Modified | Add `--context` flag, extract `runEstimate()`, remove exit(0) from logic |
| `src/utils/estimateDomain.js` | Modified | Remove duplicated `findCanvases`/`loadDecisions` (moved to context.js) |
| `src/commands/pipeline.js` | New | Orchestrator: assess → estimate with context read/write |
| `bin/funky.js` | Modified | Register `pipeline` command |
| `tests/context.test.js` | New | Unit tests for context module |
| `tests/pipeline.test.js` | New | Unit tests for pipeline orchestrator |
| `tests/assess.test.js` | Modified | Update mocks for extracted `runAssess` |
| `tests/estimate.test.js` | Modified | Update mocks for extracted `runEstimate` |
| `tests/estimateDomain.test.js` | Modified | Remove moved function tests |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Existing commands break | Low | No flag → exact old path; all existing tests must pass unchanged |
| `process.exit` extraction misses paths | Med | Keep exit(0) ONLY in Commander callback; exhaustive review of all early returns |
| Stale `context.json` between steps | Low | Each pipeline step reads fresh; `status` subcommand detects staleness by timestamp |
| Context file location confusion | Low | Project root only, documented in `--help` output |

## Rollback

- `context.js` → delete file, remove import from assess/estimate
- `--context` flag → remove Commander option from both commands (additive only)
- `pipeline.js` → delete file, remove command registration from `bin/funky.js`
- `estimateDomain.js` → restore `findCanvases`/`loadDecisions` from git
- No existing behavior changed without `--context` — zero user impact on rollback

## Dependencies

- Node.js 20+ (met), Commander.js 14 (met)
- Delta specs needed for `assess` and `estimate` (new `--context` behavior)
- Full spec needed for `pipeline` (new capability)

## Success Criteria

- [ ] `funky assess` and `funky estimate` work identically without `--context`
- [ ] `funky pipeline assess` writes `context.json` with canvas metadata + `assess.runAt`
- [ ] `funky pipeline estimate` reads `context.json` for decisions path
- [ ] `funky pipeline all` runs assess → estimate with full context flow
- [ ] `funky pipeline status` shows current pipeline state from `context.json`
- [ ] All existing tests pass unmodified; new tests cover context module + pipeline orchestrator
