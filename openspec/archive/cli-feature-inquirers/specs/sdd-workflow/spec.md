# Spec: SDD Workflow — CLI Injection Rules

## Purpose

Defines the CLI-side injection contract between `funky feature` and SDD workflows. No root spec exists yet — this is the originating spec.

---

## Requirement: CLI Does Only Template Injection

The CLI `funky feature <name>` command SHALL ONLY handle inquirer prompts and conditional template injection. It MUST NOT implement Auto, Interactive, or Handoff execution modes — those are Orquestador responsibilities per `spec-cli-ide-boundaries.md`.

### Scenario: CLI injects and exits

- GIVEN the user has answered all 3 inquirers
- WHEN template injection completes
- THEN the command prints a summary of injected files and exits
- AND does NOT start any workflow execution or delegation

### Scenario: CLI does not enforce SemVer-Tier floor

- GIVEN the user answers Tier=T1 and ReleaseType=Major
- WHEN inquirers are answered
- THEN the CLI injects templates according to the matrix without blocking or warning
- AND SemVer-Tier floor enforcement is the Orquestador's responsibility (§2.3 spec-routing-tiers.md)

---

## Requirement: New Template Existence

The system SHALL provide two new checklist templates at `src/templates/sdd/`:

- `docs.md` — documentation checklist for the orchestrator (ADRs, architecture docs, API docs, user-facing changes)
- `release.md` — SDD release checklist (distinct from `src/templates/release.md` which is release notes format)

### Scenario: Templates resolve via Golden/Fallback

- GIVEN a project has Golden templates at `.agents/templates/sdd/`
- WHEN the injection matrix includes docs.md or release.md
- THEN the CLI resolves them through the Golden/Fallback path (same as tasks.md, report.md, etc.)

### Scenario: Fallback templates exist in package

- GIVEN a project has NO Golden templates directory
- WHEN the CLI resolves docs.md or release.md
- THEN it falls back to `src/templates/sdd/docs.md` and `src/templates/sdd/release.md`

---

## Requirement: T1 Release Omission Rule

For Tier 1 changes, the system SHALL NOT inject `release.md` regardless of the Release Type inquirer answer. The version bump task MUST go inside `tasks.md` instead.

### Scenario: T1 with non-None release type

- GIVEN inquirers return: Tier=T1, ReleaseType=Minor
- WHEN templates are injected
- THEN release.md is NOT injected
- AND tasks.md is injected (the orchestrator places the bump task there)

---

## Requirement: T3 report.md Omission

For Tier 3 changes, the system SHALL NOT inject `report.md`. T3 uses isolated per-phase workflows that produce their own reports.

### Scenario: T3 does not receive report.md

- GIVEN inquirers return: Tier=T3, DocsCore=No, ReleaseType=None
- WHEN templates are injected
- THEN the change folder contains: tasks.md
- AND does NOT contain: report.md, explore.md, proposal.md, spec.md
