# Spec: CLI Inquirer Injection

## Purpose

Interactive prompt-driven conditional template injection in the `funky feature <name>` command using @clack/prompts.

---

## Requirement: Inquirer Sequence Before Injection

The `funky feature <name>` command SHALL execute 3 sequential inquirer prompts before injecting any templates. The inquirers MUST use `@clack/prompts` — NOT `@inquirer/prompts`.

**Inquirer 1 — Tier**: select with options T1 (Tweaks/Bugs), T2 (Standard Features), T3 (Deep Features).
**Inquirer 2 — Docs Core Impact**: confirm — "¿Impacta documentación core?" (Sí/No).
**Inquirer 3 — Release Type**: select with options Major, Minor, Patch, None.

### Scenario: All inquirers answered — happy path

- GIVEN a user runs `funky feature <name>`
- WHEN Inquirer 1 returns T2, Inquirer 2 returns Sí, Inquirer 3 returns Minor
- THEN the command injects: explore.md, proposal.md, spec.md, tasks.md, docs.md, release.md, report.md
- AND each template is resolved via Golden/Fallback path

### Scenario: User cancels any inquirer

- GIVEN a user runs `funky feature <name>`
- WHEN the user cancels any inquirer prompt (Ctrl+C)
- THEN the command SHALL abort without injecting any templates
- AND exit cleanly with no error stack trace

---

## Requirement: Conditional Injection Matrix

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

### Scenario: T1 — docs impact, patch release

- GIVEN inquirers return: Tier=T1, DocsCore=Sí, ReleaseType=Patch
- WHEN templates are injected
- THEN the change folder contains exactly: tasks.md, docs.md, report.md
- AND does NOT contain: explore.md, proposal.md, spec.md, release.md

### Scenario: T3 — docs and major release

- GIVEN inquirers return: Tier=T3, DocsCore=Sí, ReleaseType=Major
- WHEN templates are injected
- THEN the change folder contains exactly: tasks.md, docs.md, release.md
- AND does NOT contain: explore.md, proposal.md, spec.md, report.md

### Scenario: T2 — no docs, no release

- GIVEN inquirers return: Tier=T2, DocsCore=No, ReleaseType=None
- WHEN templates are injected
- THEN the change folder contains exactly: explore.md, proposal.md, spec.md, tasks.md, report.md
- AND does NOT contain: docs.md, release.md

### Scenario: T1 — no docs, none release

- GIVEN inquirers return: Tier=T1, DocsCore=No, ReleaseType=None
- WHEN templates are injected
- THEN the change folder contains exactly: tasks.md, report.md

---

## Requirement: runFeature Pure Function

The `runFeature(name, { tier, docsImpact, releaseType })` function SHALL be a pure function that accepts injection parameters and returns the list of files to inject without performing I/O or prompting.

### Scenario: Returns correct file list for T1

- GIVEN runFeature is called with name="test", tier="T1", docsImpact=true, releaseType="patch"
- WHEN the function executes
- THEN it returns an array containing: "tasks.md", "docs.md", "report.md"
- AND does NOT contain: "explore.md", "release.md"

### Scenario: Returns correct file list for T2 SDD ligero

- GIVEN runFeature is called with name="test", tier="T2", docsImpact=false, releaseType="none"
- WHEN the function executes
- THEN it returns an array containing: "explore.md", "proposal.md", "spec.md", "tasks.md", "report.md"
