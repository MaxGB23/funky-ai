# Root Spec — Openspec Domain
> Domain: openspec | Status: Living | Source of Truth: openspec/specs/openspec/spec.md

---

## Requirement: Root Spec Location
The system MUST establish `openspec/specs/{domain}/spec.md` as the canonical living specification for each domain. This file is the single source of truth for the current state of all requirements in that domain.

### Scenario: Root Spec serves as truth
- GIVEN a domain `workflow` exists with an archived history
- WHEN any agent or human queries the current state of workflow requirements
- THEN they MUST read `openspec/specs/workflow/spec.md`, NOT the archived change history

---

## Requirement: Delta Spec Format
During the Spec phase (`/funky-spec`), the agent MUST produce Delta Specs using a strict three-section format with no deviations.

The Delta Spec file MUST contain only the following top-level sections, in order:
1. `## ADDED Requirements`
2. `## MODIFIED Requirements`
3. `## REMOVED Requirements`

Sections with no entries MAY be omitted.

### Scenario: Spec agent produces valid delta
- GIVEN a proposal with one new capability and one modified capability
- WHEN `/funky-spec` runs
- THEN the output spec.md MUST have an `## ADDED Requirements` section for the new capability
- AND a `## MODIFIED Requirements` section for the modified one, containing the full original block with a `(Previously: ...)` annotation

### Scenario: Partial delta with only additions
- GIVEN a proposal with only new capabilities
- WHEN `/funky-spec` runs
- THEN the delta MAY omit `## MODIFIED Requirements` and `## REMOVED Requirements` sections entirely

---

## Requirement: Full-Block Integrity for MODIFIED
When a requirement is modified, the Delta Spec MUST copy the **entire** original requirement block — including all its scenarios — and apply the modification inline. A `(Previously: ...)` annotation MUST be appended immediately after the changed field.

### Scenario: Modified requirement preserves all scenarios
- GIVEN an existing requirement with 3 scenarios
- WHEN the Spec agent modifies 1 field (e.g., MUST → SHOULD)
- THEN the Delta Spec MUST contain all 3 scenarios plus the `(Previously: MUST)` annotation
- AND MUST NOT omit scenarios or reference them by name only

---

## Requirement: Delta Spec Checksum
Every Delta Spec file MUST include a `root-sha256` metadata field at the top of the file, containing the SHA256 hash of the Root Spec file at the time the Delta was authored.

If no Root Spec yet exists for the domain, the field MUST be set to `null`.

### Scenario: Delta authored against existing Root Spec
- GIVEN `openspec/specs/workflow/spec.md` has SHA256 `abc123`
- WHEN the Spec agent writes a delta for the `workflow` domain
- THEN the delta file MUST contain `root-sha256: abc123` in its frontmatter or header block

### Scenario: Delta authored for new domain
- GIVEN no Root Spec exists for the target domain
- WHEN the Spec agent writes the first delta for that domain
- THEN the delta file MUST contain `root-sha256: null`
