# SDD Phase Return Contracts

> Referencia extraída del orchestrator Gentle AI (skill `_shared/sdd-phase-common.md` + cada phase skill individual).

---

## Envelope Común (TODAS las fases)

Definido en `_shared/sdd-phase-common.md` — Section D.

```
status           → success | partial | blocked
executive_summary → 1-3 frases de lo que se hizo
detailed_report  → opcional — output completo si no está inline
artifacts        → lista de topic_keys / paths escritos
next_recommended → próxima fase SDD a ejecutar, o "none"
risks            → riesgos descubiertos, o "None"
skill_resolution → paths-injected | fallback-registry | fallback-path | none
```

Ejemplo:

```markdown
**Status**: success
**Summary**: Proposal created for `add-dark-mode`. Defined scope, approach, and rollback plan.
**Artifacts**: Engram `sdd/add-dark-mode/proposal` | `openspec/changes/add-dark-mode/proposal.md`
**Next**: sdd-spec or sdd-design
**Risks**: None
**Skill Resolution**: paths-injected — 3 skills (react-19, typescript, tailwind-4)
```

**Toda fase devuelve el envelope + su contenido específico abajo.**

---

## 1. sdd-explore

```markdown
## Exploration: {topic}

### Current State
{How the system works today relevant to this topic}

### Affected Areas
- `path/to/file.ext` — {why it's affected}
- `path/to/other.ext` — {why it's affected}

### Approaches
1. **{Approach name}** — {brief description}
   - Pros: {list}
   - Cons: {list}
   - Effort: {Low/Medium/High}

2. **{Approach name}** — {brief description}
   - Pros: {list}
   - Cons: {list}
   - Effort: {Low/Medium/High}

### Recommendation
{Your recommended approach and why}

### Risks
- {Risk 1}
- {Risk 2}

### Ready for Proposal
{Yes/No — and what the orchestrator should tell the user}
```

---

## 2. sdd-propose

```markdown
## Proposal Created

**Change**: {change-name}
**Location**: `openspec/changes/{change-name}/proposal.md` | Engram `sdd/{change-name}/proposal` | inline

### Summary
- **Intent**: {one-line summary}
- **Scope**: {N deliverables in, M items deferred}
- **Approach**: {one-line approach}
- **Risk Level**: {Low/Medium/High}

### Next Step
Ready for specs (sdd-spec) or design (sdd-design).
```

---

## 3. sdd-spec

```markdown
## Specs Created

**Change**: {change-name}

### Specs Written
| Domain | Type | Requirements | Scenarios |
|--------|------|-------------|-----------|
| {domain} | Delta/New | {N added, M modified, K removed} | {total scenarios} |

### Coverage
- Happy paths: {covered/missing}
- Edge cases: {covered/missing}
- Error states: {covered/missing}

### Next Step
Ready for design (sdd-design). If design already exists, ready for tasks (sdd-tasks).
```

---

## 4. sdd-design

```markdown
## Design Created

**Change**: {change-name}
**Location**: `openspec/changes/{change-name}/design.md` | Engram `sdd/{change-name}/design` | inline

### Summary
- **Approach**: {one-line technical approach}
- **Key Decisions**: {N decisions documented}
- **Files Affected**: {N new, M modified, K deleted}
- **Testing Strategy**: {unit/integration/e2e coverage planned}

### Open Questions
{List any unresolved questions, or "None"}

### Next Step
Ready for tasks (sdd-tasks).
```

---

## 5. sdd-tasks

```markdown
## Tasks Created

**Change**: {change-name}
**Location**: `openspec/changes/{change-name}/tasks.md` | Engram `sdd/{change-name}/tasks` | inline

### Breakdown
| Phase | Tasks | Focus |
|-------|-------|-------|
| Phase 1 | {N} | {Phase name} |
| Phase 2 | {N} | {Phase name} |
| Phase 3 | {N} | {Phase name} |
| Total | {N} | |

### Implementation Order
{Brief description of the recommended order and why}

### Review Workload Forecast
- Estimated changed lines: {estimate or range}
- 400-line budget risk: {Low | Medium | High}
- Chained PRs recommended: {Yes | No}
- Delivery strategy: {ask-on-risk | auto-chain | single-pr | exception-ok}
- Decision needed before apply: {Yes | No}
- Suggested work-unit PR split: {brief list or "Not needed"}

### Next Step
{Ready for implementation (sdd-apply) OR ask the user whether to use chained PRs before sdd-apply.}
```

El forecast **siempre** incluye estas líneas literales para que guards downstream las matcheen:

```text
Decision needed before apply: Yes|No
Chained PRs recommended: Yes|No
Chain strategy: stacked-to-main|feature-branch-chain|size-exception|pending
400-line budget risk: Low|Medium|High
```

---

## 6. sdd-apply

```markdown
## Implementation Progress

**Change**: {change-name}
**Mode**: {Strict TDD | Standard}

### Completed Tasks
- [x] {task 1.1 description}
- [x] {task 1.2 description}

### Files Changed
| File | Action | What Was Done |
|------|--------|---------------|
| `path/to/file.ext` | Created | {brief description} |
| `path/to/other.ext` | Modified | {brief description} |

{IF Strict TDD Mode → incluir TDD Cycle Evidence table}

### Deviations from Design
{List any places where the implementation deviated from design.md and why.
If none, say "None — implementation matches design."}

### Issues Found
{List any problems discovered during implementation.
If none, say "None."}

### Remaining Tasks
- [ ] {next task}
- [ ] {next task}

### Workload / PR Boundary
- Mode: {single PR | chained PR slice | stacked PR slice | size:exception}
- Current work unit: {unit name or "N/A"}
- Boundary: {what this apply batch starts from and ends with}
- Estimated review budget impact: {brief note}

### Status
{N}/{total} tasks complete. {Ready for next batch / Ready for verify / Blocked by X}
```

---

## 7. sdd-verify

El return de verify es más pesado porque es el quality gate. Incluye:

```markdown
## Verification Report

**Change**: {change-name}
**Mode**: {Strict TDD | Standard}
**Verdict**: PASS | PASS WITH WARNINGS | FAIL

### Completeness
- Total tasks: {N} ({N} complete, {N} incomplete)
- Build: {PASS / FAIL / SKIPPED}
- Tests: {PASS / FAIL / SKIPPED}
- Coverage: {N%}

### Spec Compliance Matrix
| Spec Scenario | Status | Evidence |
|--------------|--------|----------|
| {scenario} | ✅ PASS | {test name, file} |
| {scenario} | ❌ FAIL | {reason} |
| {scenario} | ⚠️ UNTESTED | {no test found} |

### Design Coherence
| Decision | Status | Notes |
|----------|--------|-------|
| {decision} | ✅ | {followed} |
| {decision} | ⚠️ | {deviation noted} |

### Issues
#### CRITICAL
- {issue} — {evidence}

#### WARNING
- {issue} — {evidence}

#### SUGGESTION
- {issue} — {evidence}

### Verdict
{PASS | PASS WITH WARNINGS | FAIL}
```

---

## 8. sdd-archive

```markdown
## Change Archived

**Change**: {change-name}
**Archived to**: `openspec/changes/archive/{YYYY-MM-DD}-{change-name}/` | Engram archive report | inline

### Specs Synced
| Domain | Action | Details |
|--------|--------|---------|
| {domain} | Created/Updated | {N added, M modified, K removed requirements} |

### Archive Contents
- proposal.md ✅
- specs/ ✅
- design.md ✅
- tasks.md ✅ ({N}/{N} tasks complete)

### Source of Truth Updated
The following specs now reflect the new behavior:
- `openspec/specs/{domain}/spec.md`

### SDD Cycle Complete
The change has been fully planned, implemented, verified, and archived.
Ready for the next change.
```

---

## Resumen visual

```
                    ┌──────────────────────────────┐
                    │     ENVELOPE COMÚN            │
                    │  (Section D)                  │
                    │  status, summary, artifacts,  │
                    │  next, risks, skill_resolution│
                    └──────┬───────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
    explore:          propose:          spec:
    Approaches        Intent, Scope     Domain table
    Recommendation    Risk Level        Coverage
          │                │                │
    design:            tasks:           apply:
    Key Decisions     Phase breakdown  Completed tasks
    File Changes      Workload forecast Files Changed
    Open Questions                      Deviations
          │                │                │
    verify:                          archive:
    Compliance Matrix                Specs Synced
    CRITICAL/WARNING/SUGGESTION      Archive Contents
    Verdict PASS/FAIL
```

Cada fase persiste el **artefacto completo** al store (engram / openspec) y devuelve solo el **envelope + resumen específico** al orquestador. El orquestador NUNCA recibe el contenido completo en su contexto — solo refs (topic_keys / paths).
