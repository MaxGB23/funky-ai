# Archive Report: Fase 2 — Assess (Discusión Arquitectónica)

> **Change:** `fase-2-assess`
> **Archived:** 2026-07-28
> **Branch:** `feat/fase-2-assess` (desde `feat/fase-1-templates`)
> **Store Mode:** Hybrid (Engram + OpenSpec)

---

## Executive Summary

`funky assess` fue transformado de evaluador binario estático a facilitador de discusión arquitectónica. El CLI ahora descubre canvases (PROJECT-CANVAS + INFRA-CANVAS) con fallback root→docs/, valida placeholders pendientes, genera preguntas C2 dinámicas basadas en patrones de contenido, interpola una guía de discusión de 6 fases, crea un template de decisiones estructurado (si no existe), y siempre termina con exit code 0.

Se reemplazó el template adversarial "Devil's Advocate" por una guía colaborativa de 6 fases (Contexto, Preocupaciones, Preguntas Guía, Riesgos, Alternativas, Acuerdos). La función `evaluateAssessment()` fue deprecada en favor de `generateGuideQuestions()` con un contrato más limpio. Se agregaron 25 tests nuevos (15 unit + 10 integración).

---

## Artifact Inventory

| Artifact | Engram Obs ID | OpenSpec Path | Status |
|----------|--------------|---------------|--------|
| Explore | #150 | — | Done |
| Proposal | #151 | `openspec/changes/fase-2-assess/proposal.md` | Done |
| Spec | #152 | `openspec/changes/fase-2-assess/specs/assess/spec.md` | Done |
| Design | #153 | `openspec/changes/fase-2-assess/design.md` | Done |
| Tasks | #154 | `openspec/changes/fase-2-assess/tasks.md` | Done |
| Apply Progress | — | — | Not created (no separate progress artifact) |
| Verify Report | — | — | Not created (verification inline in apply PR) |
| Archive Report | *(this)* | `openspec/changes/archive/2026-07-28-fase-2-assess/archive-report.md` | Done |

---

## Implementation Stats

### Files Changed

| File | Action | Lines (actual) | Status |
|------|--------|---------------|--------|
| `funky-cli/src/commands/assess.js` | Rewrite | ~80 | ✅ |
| `funky-cli/src/utils/assessRules.js` | Refactor | ~55 | ✅ |
| `funky-cli/src/templates/sdd/architecture-review-template.md` | Rewrite | ~80 | ✅ |
| `funky-cli/src/templates/sdd/architecture-decisions-template.md` | Create | ~35 | ✅ |
| `funky-cli/tests/assess.test.js` | Add tests | ~40 (10 integration tests) | ✅ |
| `funky-cli/tests/assessRules.test.js` | Rewrite | ~85 (15 unit tests) | ✅ |

### Spec Compliance

| Requirement | Coverage | Status |
|-------------|----------|--------|
| R1 — Canvas Discovery | 4 scenarios (root, docs/, one missing, both missing) | ✅ |
| R2 — Canvas Validation | Placeholder detection with warning count | ✅ |
| R3 — Discussion Guide Generation | 6-phase guide with embedded canvases, C1 questions, overwrite | ✅ |
| R4 — C2 Dynamic Questions | 4 patterns (K8s, SQLite, SingleNode, Junior+K8s), case-insensitive | ✅ |
| R5 — Decisions Template | Create if missing, skip if exists | ✅ |
| R6 — Exit Codes | Always exit 0 in all scenarios | ✅ |

### Test Results

- **assessRules.test.js**: 15 unit tests for `generateGuideQuestions()` — all patterns, edge cases, empty strings
- **assess.test.js**: 10 integration tests — canvas discovery (4), validation (2), guide generation (2), decisions template (2)
- **parseFrontmatter()**: Existing tests preserved unchanged

---

## Known Limitations

1. **C2 Junior pattern is keyword-based text scan**: The Junior+K8s detection uses `/junior/i` regex on combined canvas text + `/K8s|kubernetes/i` on infra. This may have false negatives if the team writes "Jr.", "trainee", "entry-level", or other synonyms. A future improvement could use LLM-based classification or a configurable skill-level field.

2. **Canvas content is embedded verbatim**: Templates embed full canvas text. If canvases are very large (>50KB), the discussion guide file may become unwieldy. Future iterations could add a summary option.

3. **No structured output (context.json)**: The output is pure markdown. Structured pipeline integration (JSON output consumed by other commands) is deferred to Fase 4.

4. **No assess↔estimate integration**: `funky assess` and `funky estimate` remain independent commands. Pipeline orchestration between them is Fase 4.

5. **Template text is fixed in English (C1 questions)**: The 3 C1 questions embedded in the template are English-influenced Spanish. If i18n is needed, the template content would need to be externalized.

---

## Remaining for Future Phases

| Item | Target Phase |
|------|-------------|
| context.json pipeline output | Fase 4 |
| assess↔estimate integration | Fase 4 |
| Configurable canvas paths | Fase 4 (or later) |
| Advanced C2 (LLM-based pattern detection) | Post-MVP |
| Canvas summary mode for large files | Post-MVP |

---

## Spec Sync

| Domain | Action | Details |
|--------|--------|---------|
| `assess` | Created | New domain — FULL spec copied to `openspec/specs/assess/spec.md` |

No other domains were affected. The `assess` domain did not previously have a root spec.

---

## Task Completion

| Task | Status | Verification |
|------|--------|-------------|
| T1 — Template: Replace architecture-review-template.md | ✅ Complete | 6-phase guide with 3 placeholders, no adversarial language |
| T2 — Template: Create architecture-decisions-template.md | ✅ Complete | New file with {{DATE}} placeholder, 2 example decision blocks |
| T3 — Refactor: generateGuideQuestions() in assessRules.js | ✅ Complete | Replace evaluateAssessment, 4 pattern categories, case-insensitive |
| T4 — Rewrite: assess.js action() flow | ✅ Complete | Canvas discovery → validation → guide gen → template → decisions |
| T5 — Unit tests: generateGuideQuestions() | ✅ Complete | 15 tests covering all patterns and edge cases |
| T6 — Integration tests: assess end-to-end | ✅ Complete | 10 tests with fs mocking and process.exit spy |

All 6/6 tasks complete.

---

## SDD Cycle Summary

| Phase | Status | Artifact Location |
|-------|--------|-------------------|
| Explore | ✅ | Engram #150 |
| Proposal | ✅ | Engram #151 + proposal.md |
| Spec | ✅ | Engram #152 + specs/assess/spec.md |
| Design | ✅ | Engram #153 + design.md |
| Tasks | ✅ | Engram #154 + tasks.md |
| Apply | ✅ | (implemented in PR on feat/fase-2-assess) |
| Verify | ✅ | (tests pass, code matches spec) |
| Archive | ✅ | *(this report)* |

---

*Archived 2026-07-28. This change transformed `funky assess` from a binary rule evaluator into an architecture discussion facilitator, laying the groundwork for the collaborative funky CLI workflow.*
