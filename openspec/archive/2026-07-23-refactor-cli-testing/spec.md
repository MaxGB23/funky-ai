---
root-sha256: null
---

# Delta for CLI Testing
> Feature: refactor-cli-testing | Status: Draft | Author: Spec Agent

## ADDED Requirements

### Requirement: Test Structural Path Validation
The test suite MUST validate the creation and existence of generated files without asserting literal content.

#### Scenario: File generated at correct path
- GIVEN a CLI command that generates a file
- WHEN the command executes successfully
- THEN the test validates `fs.existsSync(expectedPath)` returns true.

#### Scenario: Idempotency skip
- GIVEN a file that already exists at the target path
- WHEN the CLI command runs without overwrite flags
- THEN the file MUST NOT be overwritten or destroyed.

### Requirement: Test Machine Contracts
The test suite MUST validate the presence of structural tags and machine contracts in generated files if applicable.

#### Scenario: Mandatory release protocol tag
- GIVEN a generated template that requires orchestration tags
- WHEN the Orquestador relies on `<MANDATORY_RELEASE_PROTOCOL>`
- THEN the test validates the file content contains that exact string/regex.

## MODIFIED Requirements

### Requirement: Template Resiliency
All tests validating template output MUST NOT rely on aesthetic formatting or human prose.
(Previously: Tests validated strings like `expect(markdown).toContain('# 🚀 PROJECT CANVAS')`).

#### Scenario: Aesthetic change in template
- GIVEN a change in a template's human prose or markdown title
- WHEN the test suite runs
- THEN it MUST pass successfully without needing test updates.

## REMOVED Requirements

### Requirement: Literal Markdown Assertion
(Reason: Causes extreme test fragility and Developer Experience degradation as outlined in RFC template-testing-strategy).
