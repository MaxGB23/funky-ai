# Tasks: Estimate Redesign — brief, optional topics, scope-exclusion ficha

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~600 (additions + deletions) |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | `estimateTopics.js` + tests | PR 1 | `npx vitest run tests/estimate.test.js` (cwd `funky-cli`) | N/A — pure fn, no CLI/fs yet | delete `estimateTopics.js` + its describe block |
| 2 | 8 templates + `estimateDomain.js` helpers + marker + tests | PR 2 | `npx vitest run tests/estimate.test.js` | `node bin/funky.js estimate --security --roles --brief --pricing-team` in smoke project → sections present, no `{{OPTIONAL_SECTIONS}}` leak | revert `estimateDomain.js`, delete 8 templates |
| 3 | `estimate.js` flags + suggestions + summary + docs + integration tests | PR 3 | `pnpm test` (full suite) | `node bin/funky.js estimate --security` → fragment + suggestion printed | revert `estimate.js` + docs |

Commit units: `feat(funky-cli)` per unit (code + tests + templates together); `docs(funky-ai)` for docs. If feature-branch-chain: PR #2 base = PR #1 branch; PR #3 base = PR #2 branch.

## Phase 1: Foundation — topic heuristics

- [x] 1.1 RED: In `tests/estimate.test.js`, add `surfaceEstimateTopics` describe: per topic 6 states — Aplica (signal in region), No aplica (no signals), Indeterminado (`[Responde aquí]`), Indeterminado (null canvas); case-insensitivity; decisions-text signals.
- [x] 1.2 GREEN: Create `src/utils/estimateTopics.js`: TOPICS/DISPLAY_NAMES/STATUS + `surfaceEstimateTopics(canvases, decisions)` per status rules, canonical order, topic key == flag name.

## Phase 2: Templates (living, repo-owned)

- [x] 2.1 Create `src/templates/estimate/brief-questions-template.md`: `## Brief Funcional` + product/user/MVP/complexity/integrations/timeline questions.
- [x] 2.2 Create `src/templates/estimate/team-cost-reference-template.md`: rol×seniority×dedicación×duración, 1-dev/team models, phases table; reference only.
- [x] 2.3 Create `src/templates/estimate/topics/{roles,multi-tenant,transactions,security,concurrency,integrations}.md` (6): `## {Display Name}` + cost-impact bullets.

## Phase 3: estimateDomain.js — opts + helpers

- [x] 3.1 RED: Update `DEFAULT_GUIDE_TEMPLATE` in tests with `{{OPTIONAL_SECTIONS}}`; add tests: legacy byte-identity (3-arg vs 4-arg `{}`), brief (no-value/value/missing→usedFallback), fragments (empty/subset/canonical/missing→throw), team-cost, ficha 6 rows.
- [x] 3.2 GREEN: `estimateDomain.js`: 4th `opts` param; `generateBriefSection`, `generateTopicFragments`, `generateTeamCostReference`, `generateScopeExclusionTable`; marker strip regex; empty opts → byte-identical legacy.
- [x] 3.3 Add `{{OPTIONAL_SECTIONS}}` marker line to `pricing-guide-template.md` after INFRA-CANVAS.

## Phase 4: estimate.js — CLI wiring

- [x] 4.1 RED: Integration tests: `--security --roles` → both fragments; no flags → no topics + ficha present; `--pricing-team` → section; `--brief missing.md` → warn + checklist + exit(0); suggestion printed when flag unset (R11); determinism byte-identical (R13); edited fragment reflected (R14).
- [x] 4.2 GREEN: `estimate.js`: 8 options; guideOpts (canonical `TOPICS.filter`, `scopeFicha: true`); suggestions via `surfaceEstimateTopics`; warn on `usedFallback`; summary lists included sections.

## Phase 5: Documentation

- [x] 5.1 Update `docs/funky-forge/estimate.md`: flags table (9 rows), outputs, always-on ficha, suggestions behavior.
