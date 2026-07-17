# Proposal: CLI Feature Inquirers — Interactive Template Injection

## Intent

The current `funky feature <name>` command blindly copies 9 SDD templates with no tier awareness or conditional logic. Per `spec-cli-ide-boundaries.md`, the CLI should run 3 interactive inquirers (Tier, Docs Impact, Release Type) to decide WHICH templates to inject, keeping the change folder lean and SRP-compliant.

## Scope

### In Scope
- Modify `feature.js` to run 3 `@clack/prompts` inquirers before template injection
- Implement conditional injection matrix (T1/T2/T3 × Docs/Release) per `spec-cli-ide-boundaries.md`
- Create `src/templates/sdd/docs.md` — docs checklist template (missing)
- Create `src/templates/sdd/release.md` — SDD release checklist (NOT the existing release notes template)
- Update `tests/feature.test.js` for conditional logic and mocked inquirers

### Out of Scope
- Auto, interactive, and handoff CLI modes (spec says these don't add value for template injection)
- SemVer enforcement in CLI (that's the Orquestador's job per §2.3 of spec-routing-tiers.md)
- Modifying `init.js`, `gentle.js`, or other commands
- Updating `.agents/templates/sdd/` golden templates (sync script concern, separate change)

## Capabilities

### New Capabilities
- `cli-inquirer-injection`: Interactive prompt-driven conditional template injection in the `feature` command

### Modified Capabilities
- `sdd-workflow`: Injection rules change from unconditional copy to tier-conditional matrix. The injection matrix is defined in `spec-cli-ide-boundaries.md` §Diagrama de Inyección.

## Approach

**Modify `feature.js` in-place (Approach A from exploration).**

1. Add 3 `@clack/prompts` inquirer calls inside the Commander `.action()` — same pattern as `init.js`
2. Extract `runFeature(name, { tier, docsImpact, releaseType })` to accept injection params (keeps it pure/testable)
3. Build conditional file list via mapping object keyed by tier, with docs/release overrides
4. Keep existing Golden/Fallback template resolution (`init.js` pattern)
5. Create `docs.md` and `release.md` as checklist-style templates matching orchestrator expectations

**Inquirer answers → Injection mapping:**

| Tier | tasks.md | explore/proposal/spec | report.md | docs.md | release.md |
|------|----------|-----------------------|-----------|---------|------------|
| T1 | ✅ | ✗ | ✅ | if docsImpact=Sí | ✗ (bump in tasks) |
| T2 | ✅ | ✅ (SDD ligero) | ✅ | if docsImpact=Sí | if releaseType≠None |
| T3 | ✅ | ✗ (workflows isolados) | ✅ | if docsImpact=Sí | if releaseType≠None |

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `funky-cli/src/commands/feature.js` | Modified | Add inquirers + conditional file mapping (~72→130 lines) |
| `funky-cli/src/templates/sdd/docs.md` | New | Docs checklist template for orchestrator |
| `funky-cli/src/templates/sdd/release.md` | New | SDD release checklist (distinct from `src/templates/release.md`) |
| `funky-cli/tests/feature.test.js` | Modified | Update 4 test cases for conditional logic, mock @clack/prompts |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Missing templates break orchestrator expectations | Med | Create docs.md and release.md before modifying feature.js |
| Template format confusion (release.md vs existing release notes) | Med | New release.md is SDD checklist format; existing `src/templates/release.md` stays untouched |
| Existing tests break due to conditional file counts | High | Update all 4 test cases; mock @clack/prompts for inquirer testing |
| Golden template sync drift | Low | Defer sync script update to a separate change |

## Rollback Plan

1. `git checkout funky-cli/src/commands/feature.js` — restore original unconditional copy logic
2. Remove `funky-cli/src/templates/sdd/docs.md` and `release.md`
3. `git checkout funky-cli/tests/feature.test.js` — restore original tests
4. Run `pnpm test` to verify clean state

## Dependencies

- `@clack/prompts` 1.2.0 (already installed, used by `init.js`)
- Reference patterns: `init.js` for `@clack/prompts` usage, `gentle.js` for Golden/Fallback template resolution

## Success Criteria

- [ ] `funky feature test-name` presents 3 interactive inquirers before injecting templates
- [ ] T1 injects only tasks.md + report.md (+ conditional docs.md)
- [ ] T2 injects SDD ligero (explore/proposal/spec) + tasks.md + report.md (+ conditional docs.md, release.md)
- [ ] T3 injects tasks.md + report.md (+ conditional docs.md, release.md)
- [ ] `docs.md` and `release.md` templates exist and match orchestrator expectations
- [ ] All tests pass with updated conditional logic
