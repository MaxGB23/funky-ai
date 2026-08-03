# Proposal: Estimate Redesign — brief, optional topics, scope-exclusion ficha

## Intent

`funky estimate` prices from stack only → "same stack ≠ same price". Fixed structure ignores simple projects; no brief, team-cost reference, or scope filter; the AI hallucinates scenarios. Goal: profiled guide — optional sections on demand, always-on "No aplica en esta fase" ficha filtering imagination, zero ceremony. CLI facilitates, doesn't dictate.

## Scope

### In Scope
- `--brief [path]` optional-value flag: embeds brief-questions living template, or given file content (warn + fallback, exit(0)). Never blocking.
- 6 topic flags `--roles --multi-tenant --transactions --security --concurrency --integrations`; each embeds its fragment at `{{OPTIONAL_SECTIONS}}`.
- Ficha "No aplica en esta fase" **always-on**: heuristic table (Aplica / No aplica según lo documentado / Indeterminado) via new `estimateTopics.js`.
- `--pricing-team`: team-cost + phasing reference section (no calculator).
- `generatePricingGuide(a, b, c, opts = {})` backward-compatible; data signals as console suggestions only (never auto-include).
- Living templates: `brief-questions-template.md`, `topics/*.md`, `team-cost-reference-template.md` + `{{OPTIONAL_SECTIONS}}` marker.
- Tests extended (3-arg calls stay green); `docs/funky-forge/estimate.md` updated.

### Out of Scope
- `context.json` contract change (`estimate: { runAt }` stays — pipeline track).
- IA prompt (R5); decisions/canvas structure.
- Data-driven auto-inclusion of topics.
- 9-file per-project ceremony; interactive mode; price calculator.

## Capabilities

### New Capabilities
None — all behavior lands in the existing `estimate` domain.

### Modified Capabilities
- `estimate`: R3 wording (guide MAY include optional sections); determinism NFR (flags are part of input); new requirement blocks (brief, 6 topic flags, ficha, team-cost, suggestions).

## Approach

Extend structure (option 5A): 4th optional `opts` param; empty `opts` = legacy output byte-for-byte. New pure helpers build optional sections, joined at the single `{{OPTIONAL_SECTIONS}}` insertion point. `estimateTopics.js` mirrors `assessRules.js` (`surfaceEstimateTopics(canvases, decisions) → {signals}`), feeding both ficha and suggestions. Commander forwards flags via `opts` to `runEstimate`.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `funky-cli/src/commands/estimate.js` | Modified | New flags; summary lists included sections |
| `funky-cli/src/utils/estimateDomain.js` | Modified | 4th `opts` arg + helpers (brief, topics, team, ficha) |
| `funky-cli/src/utils/estimateTopics.js` | New | Heuristics + signals, mirrors `assessRules.js` |
| `funky-cli/src/templates/estimate/pricing-guide-template.md` | Modified | `{{OPTIONAL_SECTIONS}}` marker |
| `funky-cli/src/templates/estimate/{brief-questions,team-cost-reference}-template.md`, `topics/*.md` | New | Living fragment templates |
| `funky-cli/tests/estimate.test.js` | Modified | New describe blocks; existing green |
| `docs/funky-forge/estimate.md` | Modified | Flags table + outputs |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Heuristic false +/− in ficha | Med | "según lo documentado" wording; Indeterminado on unfilled canvases; AI validates in-session |
| Flag explosion (8 new) | Med | Clear help text; `--help` lists all |
| Template fragmentation (9 files) | Med | Minimal living fragments, team-owned |
| Determinism drift | Low | Flags are deterministic input; no clock/randomness in guide |
| Backward compat break | Low | Empty `opts` ⇒ byte-identical legacy output; 3-arg tests green |

## Rollback Plan

Revert `generatePricingGuide` to 3 args, remove new flags from `estimate.js`, delete `estimateTopics.js` + fragment templates; guide returns to legacy shape. No `context.json` or prompt changes to unwind. In-flight runs: re-run without flags.

## Dependencies

- None external. In-repo: `assessRules.js` (pattern reference, unmodified); current `estimate` spec (R1–R6, R-E1–R-E3) preserved.

## Success Criteria

- [ ] `generatePricingGuide(a, b, c)` and empty-`opts` calls produce byte-identical legacy guide
- [ ] Each flag embeds its section; no flags ⇒ no optional sections (except always-on ficha)
- [ ] Ficha shows 6 topics with valid estado + "según lo documentado" wording
- [ ] `--brief missing.md` warns and falls back; `--context`/exit(0)/headless NFRs unchanged
- [ ] Docs updated; full test suite green
