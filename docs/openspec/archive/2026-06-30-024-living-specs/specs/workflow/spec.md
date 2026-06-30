# Delta for Workflow Domain
> Feature: 024-living-specs | Status: Draft | Author: Spec Agent
> root-sha256: D85D14E048066B351D2913996A784EE9D6432B4FBB9C7CF6356FA96E6FFC7900

---

## ADDED Requirements

### Requirement: Archive Workflow Exists
The system MUST provide a `/funky-archive` workflow file that the LLM agent can invoke to merge a Delta Spec into its corresponding Root Spec.

#### Scenario: Happy path — valid merge
- GIVEN a Root Spec exists at `openspec/specs/{domain}/spec.md`
- AND a Delta Spec exists at `openspec/changes/{feature}/specs/{domain}/spec.md`
- AND the SHA256 in the Delta Spec matches the current Root Spec
- WHEN the `/funky-archive` workflow is triggered
- THEN the agent merges all `ADDED`, `MODIFIED`, and `REMOVED` blocks into the Root Spec without altering untouched requirements

#### Scenario: Stale checksum — blocked merge
- GIVEN a Delta Spec contains a `root-sha256` that does NOT match the current Root Spec hash
- WHEN the `/funky-archive` workflow is triggered
- THEN the agent MUST abort the merge and report a checksum mismatch error before writing any file

#### Scenario: Non-existent Root Spec
- GIVEN no Root Spec exists for the target domain
- WHEN the `/funky-spec` workflow is triggered
- THEN the agent MUST write a FULL Spec without ADDED/MODIFIED/REMOVED sections
- AND WHEN the `/funky-archive` workflow is triggered
- THEN the agent MUST copy the entire FULL spec directly to `openspec/specs/{domain}/spec.md`

---

### Requirement: Anti-Lazy Preservation Rule
The `/funky-archive` workflow MUST contain an explicit enforcement rule instructing the agent to preserve ALL existing requirements verbatim and apply ONLY the deltas declared in the Delta Spec.

#### Scenario: No summarization of untouched blocks
- GIVEN a Root Spec with 10 requirements
- AND a Delta Spec that only ADDS 1 requirement
- WHEN the agent executes the merge
- THEN the resulting Root Spec MUST contain all original 10 requirements plus the 1 new one, with zero omissions or paraphrasing

---

### Requirement: Post-Merge Archive Naming
After a successful merge, the workflow MUST move the feature directory from `openspec/changes/{feature}/` to `openspec/archive/{new-name}/` applying the correct naming convention based on the release class.

#### Scenario: Archive after merge
- GIVEN the merge completed without errors
- WHEN the workflow finalizes
- THEN `openspec/changes/{feature}/` MUST be moved and renamed based on its archive class (`vX.Y.Z-{desc}` or `YYYY-MM-DD-{desc}`)
- AND the archive directory MUST be checked against the soft limit of ~40 entries for manual cleanup
