# Root Spec — cli-testing Domain
> Domain: cli-testing | Status: Living | Source of Truth: openspec/specs/cli-testing/spec.md

## Requirement: Test Structural Path Validation
The test suite MUST validate the creation and existence of generated files without asserting literal content.

### Scenario: File generated at correct path
- GIVEN a CLI command that generates a file
- WHEN the command executes successfully
- THEN the test validates `fs.existsSync(expectedPath)` returns true.

### Scenario: Idempotency skip
- GIVEN a file that already exists at the target path
- WHEN the CLI command runs without overwrite flags
- THEN the file MUST NOT be overwritten or destroyed.

## Requirement: Test Machine Contracts
The test suite MUST validate the presence of structural tags and machine contracts in generated files if applicable.

### Scenario: Mandatory release protocol tag
- GIVEN a generated template that requires orchestration tags
- WHEN the Orquestador relies on `<MANDATORY_RELEASE_PROTOCOL>`
- THEN the test validates the file content contains that exact string/regex.

## Requirement: Template Resiliency
All tests validating template output MUST NOT rely on aesthetic formatting or human prose.
(Previously: Tests validated strings like `expect(markdown).toContain('# 🚀 PROJECT CANVAS')`).

### Scenario: Aesthetic change in template
- GIVEN a change in a template's human prose or markdown title
- WHEN the test suite runs
- THEN it MUST pass successfully without needing test updates.

## Requirement: Fragile assertion migration
Category (b) full-copy assertions MUST migrate to `toMatchSnapshot()`; (c) console/log-copy assertions MUST migrate to semantic tokens or branch/outcome validation — clack harnesses validate exit-code + write/not-write, not confirm copy. Category (a) structural assertions (markers, paths, tokens, regex) MUST stay untouched, not counted fragile.

### Scenario: Full-copy to snapshot
- GIVEN a test asserts full guide copy (e.g. `Fase 1 — Preparación`)
- WHEN migrated
- THEN the assertion becomes `toMatchSnapshot()`

### Scenario: Console copy to outcome
- GIVEN a harness asserts clack confirm copy (`REEMPLAZA la actual`)
- WHEN migrated
- THEN it validates exit-code and write/not-write outcomes

### Scenario: Structural stays
- GIVEN a test asserts markers/tokens (`<!-- topic:x -->`)
- WHEN the change completes
- THEN the assertion is unchanged, not counted fragile

## Requirement: Snapshot discipline
Snapshots MUST be generated locally and committed; CI=true fails on missing snapshots instead of writing them. Date-bearing output MUST prefer deterministic input (injected date) over post-processing; normalize `{{DATE}}` only if injection is infeasible. Updates MUST review the diff; blind `-u` prohibited.

### Scenario: Deterministic date
- GIVEN `generateDecisionsTemplate` interpolates `{{DATE}}`
- WHEN injection is feasible
- THEN inject a fixed date, no post-processing
- AND when infeasible, normalize token, snapshot guide only

## Requirement: Enforcement gate
`tests/organization.test.js` MUST include a fragile-assertion counter plus a LEGACY_EXCEPTIONS-style debt map (`FRAGILE_DEBT`) tracking each file's remaining fragile count; entries removed as files migrate. Total MUST reach ZERO at change end; stale entries MUST fail the meta-test.

### Scenario: Zero at end
- GIVEN all 25 files migrate
- WHEN the change completes
- THEN `FRAGILE_DEBT` total is 0 and the gate is green

## Requirement: Coverage preserved
No new tests except the enforcement additions; existing coverage MUST be preserved — assertions rewritten, never dropped.

### Scenario: No test growth
- GIVEN the 25 test files
- WHEN the change completes
- THEN no new test files; prior behaviors stay covered

## Requirement: Policy placement
The 'compactar vs extraer módulo' and snapshot rules MUST be documented in the vitest skill only; AGENTS.md MUST NOT be edited.

### Scenario: Skill-only policy
- GIVEN the change completes
- WHEN docs checked
- THEN rules live in the vitest skill; AGENTS.md untouched

## Requirement: Literal Markdown Assertion
(Reason: Causes extreme test fragility and Developer Experience degradation as outlined in RFC template-testing-strategy).
