# Delta: CLI Feature Inquirers — Specs

> Change: `cli-feature-inquirers` | Mode: openspec | Artifact store: Engram + filesystem

---

## Domain: cli-inquirer-injection (New)

### Purpose

Interactive prompt-driven conditional template injection in the `funky feature <name>` command using @clack/prompts.

---

### Requirement: Inquirer Sequence Before Injection

The `funky feature <name>` command SHALL execute 3 sequential inquirer prompts before injecting any templates. The inquirers MUST use `@clack/prompts` — NOT `@inquirer/prompts`.

**Inquirer 1 — Tier**: select with options T1 (Tweaks/Bugs), T2 (Standard Features), T3 (Deep Features).
**Inquirer 2 — Docs Core Impact**: confirm — "¿Impacta documentación core?" (Sí/No).
**Inquirer 3 — Release Type**: select with options Major, Minor, Patch, None.

#### Scenario: All inquirers answered — happy path

- GIVEN a user runs `funky feature <name>`
- WHEN Inquirer 1 returns T2, Inquirer 2 returns Sí, Inquirer 3 returns Minor
- THEN the command injects: explore.md, proposal.md, spec.md, tasks.md, docs.md, release.md, report.md
- AND each template is resolved via Golden/Fallback path

#### Scenario: User cancels any inquirer

- GIVEN a user runs `funky feature <name>`
- WHEN the user cancels any inquirer prompt (Ctrl+C)
- THEN the command SHALL abort without injecting any templates
- AND exit cleanly with no error stack trace

---

### Requirement: Conditional Injection Matrix

The system SHALL inject templates based on the following matrix:

| Template | T1 | T2 | T3 | Condition |
|----------|----|----|-----|-----------|
| tasks.md | ✓ | ✓ | ✓ | Always |
| docs.md | ✓ | ✓ | ✓ | Only if Inquirer 2 = Sí |
| release.md | ✗ | ✓ | ✓ | Only if Inquirer 3 ≠ None. T1 OMITTED — bump goes in tasks.md |
| report.md | ✓ | ✓ | ✗ | T1 and T2 only |
| explore.md | ✗ | ✓ | ✗ | T2 only |
| proposal.md | ✗ | ✓ | ✗ | T2 only |
| spec.md | ✗ | ✓ | ✗ | T2 only |

#### Scenario: T1 — docs impact, patch release

- GIVEN inquirers return: Tier=T1, DocsCore=Sí, ReleaseType=Patch
- WHEN templates are injected
- THEN the change folder contains exactly: tasks.md, docs.md, report.md
- AND does NOT contain: explore.md, proposal.md, spec.md, release.md

#### Scenario: T3 — docs and major release

- GIVEN inquirers return: Tier=T3, DocsCore=Sí, ReleaseType=Major
- WHEN templates are injected
- THEN the change folder contains exactly: tasks.md, docs.md, release.md
- AND does NOT contain: explore.md, proposal.md, spec.md, report.md

#### Scenario: T2 — no docs, no release

- GIVEN inquirers return: Tier=T2, DocsCore=No, ReleaseType=None
- WHEN templates are injected
- THEN the change folder contains exactly: explore.md, proposal.md, spec.md, tasks.md, report.md
- AND does NOT contain: docs.md, release.md

#### Scenario: T1 — no docs, none release

- GIVEN inquirers return: Tier=T1, DocsCore=No, ReleaseType=None
- WHEN templates are injected
- THEN the change folder contains exactly: tasks.md, report.md

---

### Requirement: runFeature Pure Function

The `runFeature(name, { tier, docsImpact, releaseType })` function SHALL be a pure function that accepts injection parameters and returns the list of files to inject without performing I/O or prompting.

#### Scenario: Returns correct file list for T1

- GIVEN runFeature is called with name="test", tier="T1", docsImpact=true, releaseType="patch"
- WHEN the function executes
- THEN it returns an array containing: "tasks.md", "docs.md", "report.md"
- AND does NOT contain: "explore.md", "release.md"

#### Scenario: Returns correct file list for T2 SDD ligero

- GIVEN runFeature is called with name="test", tier="T2", docsImpact=false, releaseType="none"
- WHEN the function executes
- THEN it returns an array containing: "explore.md", "proposal.md", "spec.md", "tasks.md", "report.md"

---

## Domain: sdd-workflow (New — no root spec exists)

### Purpose

Defines the CLI-side injection contract between `funky feature` and SDD workflows. This is the originating spec (no root spec exists).

---

### Requirement: CLI Does Only Template Injection

The CLI `funky feature <name>` command SHALL ONLY handle inquirer prompts and conditional template injection. It MUST NOT implement Auto, Interactive, or Handoff execution modes — those are Orquestador responsibilities per `spec-cli-ide-boundaries.md`.

#### Scenario: CLI injects and exits

- GIVEN the user has answered all 3 inquirers
- WHEN template injection completes
- THEN the command prints a summary of injected files and exits
- AND does NOT start any workflow execution or delegation

#### Scenario: CLI does not enforce SemVer-Tier floor

- GIVEN the user answers Tier=T1 and ReleaseType=Major
- WHEN inquirers are answered
- THEN the CLI injects templates according to the matrix without blocking or warning
- AND SemVer-Tier floor enforcement is the Orquestador's responsibility (§2.3 spec-routing-tiers.md)

---

### Requirement: New Template Existence

The system SHALL provide two new checklist templates at `src/templates/sdd/`:

- `docs.md` — documentation checklist for the orchestrator (ADRs, architecture docs, API docs, user-facing changes)
- `release.md` — SDD release checklist (distinct from `src/templates/release.md` which is release notes format)

#### Scenario: Templates resolve via Golden/Fallback

- GIVEN a project has Golden templates at `.agents/templates/sdd/`
- WHEN the injection matrix includes docs.md or release.md
- THEN the CLI resolves them through the Golden/Fallback path (same as tasks.md, report.md, etc.)

#### Scenario: Fallback templates exist in package

- GIVEN a project has NO Golden templates directory
- WHEN the CLI resolves docs.md or release.md
- THEN it falls back to `src/templates/sdd/docs.md` and `src/templates/sdd/release.md`

---

### Requirement: T1 Release Omission Rule

For Tier 1 changes, the system SHALL NOT inject `release.md` regardless of the Release Type inquirer answer. The version bump task MUST go inside `tasks.md` instead.

#### Scenario: T1 with non-None release type

- GIVEN inquirers return: Tier=T1, ReleaseType=Minor
- WHEN templates are injected
- THEN release.md is NOT injected
- AND tasks.md is injected (the orchestrator places the bump task there)

---

### Requirement: T3 report.md Omission

For Tier 3 changes, the system SHALL NOT inject `report.md`. T3 uses isolated per-phase workflows that produce their own reports.

#### Scenario: T3 does not receive report.md

- GIVEN inquirers return: Tier=T3, DocsCore=No, ReleaseType=None
- WHEN templates are injected
- THEN the change folder contains: tasks.md
- AND does NOT contain: report.md, explore.md, proposal.md, spec.md

---

## Affected Files

| File | Action | Purpose |
|------|--------|---------|
| `funky-cli/src/commands/feature.js` | MODIFY | Add inquirers + conditional file mapping |
| `funky-cli/src/templates/sdd/docs.md` | CREATE | Docs checklist template for orchestrator |
| `funky-cli/src/templates/sdd/release.md` | CREATE | SDD release checklist (not release notes) |
| `funky-cli/tests/feature.test.js` | MODIFY | Update for conditional logic + mocked @clack/prompts |
