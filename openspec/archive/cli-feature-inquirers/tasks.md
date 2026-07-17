# Tasks: CLI Feature Inquirers

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 180–220 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Template Creation

- [x] 1.1 Create `funky-cli/src/templates/sdd/docs.md` — docs impact checklist template (ADRs, architecture docs, API docs, user-facing changes). ~20 lines.
- [x] 1.2 Create `funky-cli/src/templates/sdd/release.md` — SDD release checklist (version bump steps, changelog, tag). Distinct from `src/templates/release.md`. ~20 lines.

## Phase 2: Core Implementation — feature.js

- [x] 2.1 Add `import * as p from '@clack/prompts'` at top of `feature.js`.
- [x] 2.2 Define constants: `BASE_FILES` (5 files), `TIER_FILES`, and `INJECTION_MATRIX` above `runFeature()`.
- [x] 2.3 Extract `resolveFiles(injectionParams)` pure function — backward-compat when `injectionParams` omitted (returns old 9-file list), otherwise builds conditional list from matrix.
- [x] 2.4 Restructure `runFeature()` signature: add optional `opts.injectionParams`, replace hardcoded `filesToCopy` with `resolveFiles(injectionParams)`, add `copiedFiles` to return value.
- [x] 2.5 Add `p.group()` inquirer block inside `.action()` with 3 prompts (tier, docsImpact, releaseType) + `onCancel` handler. Pass answers as `injectionParams` to `runFeature()`.

## Phase 3: Testing

- [x] 3.1 Add `vi.mock('@clack/prompts')` to `feature.test.js`. Mock `p.group` to return controlled answers.
- [x] 3.2 Update existing "golden templates" test: pass no `injectionParams`, assert 9 files copied (backward-compat).
- [x] 3.3 Update "fallback templates" test: same backward-compat path.
- [x] 3.4 Add unit test for `resolveFiles()` — T1/No/None → 5 files (base only).
- [x] 3.5 Add unit test for `resolveFiles()` — T1/Sí/Patch → 6 files (base + docs).
- [x] 3.6 Add unit test for `resolveFiles()` — T2/No/None → 8 files (base + explore/proposal/spec).
- [x] 3.7 Add unit test for `resolveFiles()` — T2/Sí/Patch → 10 files (base + explore/proposal/spec + docs + release).
- [x] 3.8 Add unit test for `resolveFiles()` — T3/No/None → 5 files (base only, no report).
- [x] 3.9 Add unit test for `resolveFiles()` — T3/Sí/Minor → 7 files (base + docs + release).
- [x] 3.10 Verify all tests pass: `cd funky-cli && npx vitest run`.

## Phase 4: Documentation

- [x] 4.1 Update `funky-cli/README.md` feature command row: document inquirer prompts, conditional injection behavior, and new tier/release matrix.
