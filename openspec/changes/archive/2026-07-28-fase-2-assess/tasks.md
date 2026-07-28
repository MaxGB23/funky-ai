# Tasks: Fase 2 — Assess (Discusión Arquitectónica)

> **Change:** `fase-2-assess`
> **Delivery Strategy:** single-pr
> **Review Budget:** 400 lines
> **Commit Strategy:** work-unit commits (3 commits: templates → utility+tests → command+tests)

---

## T1 — Template: Replace architecture-review-template.md

### Description
Replace the content of `funky-cli/src/templates/sdd/architecture-review-template.md` with the new 6-phase discussion guide. The template must contain:
- Opening header: "# 🗣️ Guía de Discusión Arquitectónica"
- Context section embedding 3 placeholders: `{{PROJECT_CANVAS_CONTENT}}`, `{{INFRA_CANVAS_CONTENT}}`, `{{DYNAMIC_QUESTIONS}}`
- 6 discussion phases (Contexto, Preocupaciones, Preguntas Guía, Riesgos, Alternativas, Acuerdos) with time estimates
- 3 hardcoded C1 questions in Fase 3 (budget+infra, concurrencia+DB, SLA+redundancia)
- Fase 6 referencing the decisions template at `docs/architecture-decisions.md`
- NO JS-generated questions in the template — C2 comes via `{{DYNAMIC_QUESTIONS}}`

### Files to change
| File | Action | Details |
|------|--------|---------|
| `funky-cli/src/templates/sdd/architecture-review-template.md` | Rewrite | Full replacement of 22-line adversarial template with ~80-line discussion guide |

### Acceptance criteria
- [x] Template contains all 3 placeholders exactly as `{{PROJECT_CANVAS_CONTENT}}`, `{{INFRA_CANVAS_CONTENT}}`, `{{DYNAMIC_QUESTIONS}}`
- [x] Template has exactly 6 phases with the correct names and time estimates
- [x] Fase 3 contains 3 static C1 questions (budget+infra, concurrencia+DB, SLA+redundancia) hardcoded in the template
- [x] Fase 6 references `docs/architecture-decisions.md`
- [x] No adversarial language remains ("Devil's Advocate", "challenge", "destrozá")
- [x] Template matches the design specification exactly (see `design.md` lines 106-143)

### Estimated lines
~80 (replaces 22 existing)

### Dependencies
None

### Risk
**Low** — pure content change, no JS logic

---

## T2 — Template: Create architecture-decisions-template.md

### Description
Create new file `funky-cli/src/templates/sdd/architecture-decisions-template.md` with a structured decisions template. Content:
- Header: "# Decisiones Arquitectónicas" with instruction paragraph
- `{{DATE}}` placeholder for generation date
- Two example decision blocks: each with fields for Decisión, Rationale, Alternativas consideradas, Riesgos aceptados, Fecha
- Consistent markdown structure with `- **field:** value` format

### Files to change
| File | Action | Details |
|------|--------|---------|
| `funky-cli/src/templates/sdd/architecture-decisions-template.md` | Create | New ~35-line file |

### Acceptance criteria
- [x] File exists at `funky-cli/src/templates/sdd/architecture-decisions-template.md`
- [x] Contains `{{DATE}}` placeholder
- [x] Has 2 example decision blocks with all 5 fields (Decisión, Rationale, Alternativas consideradas, Riesgos aceptados, Fecha)
- [x] Matches the design specification exactly (see `design.md` lines 148-169)

### Estimated lines
~35 (new file)

### Dependencies
None

### Risk
**Low** — new file, no dependencies

---

## T3 — Refactor: generateGuideQuestions() in assessRules.js

### Description
Replace `evaluateAssessment(metadata)` with `generateGuideQuestions(canvasData)` in `funky-cli/src/utils/assessRules.js`.

**New contract:**
```js
function generateGuideQuestions(canvasData: {
  projectCanvas: string;  // full text of PROJECT-CANVAS.md or empty string
  infraCanvas: string;    // full text of INFRA-CANVAS.md or empty string
}): {
  dynamic: Array<{ category: string; question: string }>;
}
```

**Pattern detection** (all case-insensitive, scan on text content):

| Category | Trigger | Question |
|----------|---------|----------|
| `K8s` | `infraCanvas` matches `/K8s\|kubernetes/i` | "Elegiste Kubernetes. ¿Ya evaluaron los costos operativos de un clúster? En proyectos pequeños puede ser más caro que usar un PaaS." |
| `SQLite` | `infraCanvas` matches `/SQLite/i` | "SQLite es liviano pero tiene límites de concurrencia. Si el proyecto escala, ¿tienen pensado migrar a algo como PostgreSQL?" |
| `SingleNode` | `infraCanvas` matches `/single\s*nodo?\|single\s*node/i` | "Con un solo nodo, cualquier deploy o fallo causa downtime. ¿Tienen ventanas de mantenimiento o toleran downtime?" |
| `Junior` | `(projectCanvas + infraCanvas)` matches `/junior/i` AND `infraCanvas` matches `/K8s\|kubernetes/i` | "El equipo es principalmente Junior y eligieron K8s. ¿Tienen DevOps dedicado o planean usar un PaaS que abstraiga la orquestación?" |

- All matching patterns produce their question in the returned array
- `Junior` requires BOTH junior mention AND K8s presence (AND condition)
- No matches → returns `{ dynamic: [] }`
- Empty strings → returns `{ dynamic: [] }`

### Files to change
| File | Action | Details |
|------|--------|---------|
| `funky-cli/src/utils/assessRules.js` | Rewrite | Full replacement of 35-line `evaluateAssessment` with ~55-line `generateGuideQuestions` |

### Acceptance criteria
- [x] Exports `generateGuideQuestions` (NOT `evaluateAssessment`)
- [x] Returns `{ dynamic: [{ category, question }] }` shape
- [x] K8s pattern: infra with "K8s" or "kubernetes" → adds K8s question
- [x] SQLite pattern: infra with "SQLite" → adds SQLite question
- [x] SingleNode pattern: infra with "single node" or "single nodo" → adds SingleNode question
- [x] Junior pattern: project+infra contain "junior" AND infra has K8s → adds Junior question
- [x] Junior NOT triggered when junior mentioned without K8s
- [x] No patterns match → returns `{ dynamic: [] }`
- [x] Empty strings → returns `{ dynamic: [] }`
- [x] All pattern matching is case-insensitive
- [x] Multiple matching patterns produce multiple questions

### Estimated lines
~55 (replaces 35 existing)

### Dependencies
None

### Risk
**Medium** — contract change (removes old export `evaluateAssessment`). Downstream consumers (assess.js and tests) must update.

---

## T4 — Rewrite: assess.js action() flow

### Description
Rewrite `funky-cli/src/commands/assess.js` `action()` with the new orchestration flow. Keep `parseFrontmatter()` exported **unchanged**.

**Flow:**

```
1. Canvas Discovery
   ├─ stat ./PROJECT-CANVAS.md → read it | fallback: ./docs/PROJECT-CANVAS.md
   └─ stat ./INFRA-CANVAS.md   → read it | fallback: ./docs/INFRA-CANVAS.md
   └─ Both missing? → warn + use "Canvas no disponible" per canvas

2. Canvas Validation
   └─ .includes('[Responde aquí]') → warn with section count
   └─ Continue regardless

3. generateGuideQuestions({ projectCanvas, infraCanvas })
   └─ Import from ../utils/assessRules.js
   └─ Get { dynamic: [...] }

4. Interpolate architecture-review-template.md
   └─ Read template from templates/sdd/
   └─ Replace {{PROJECT_CANVAS_CONTENT}} → canvas text or "Canvas no disponible"
   └─ Replace {{INFRA_CANVAS_CONTENT}} → canvas text or "Canvas no disponible"
   └─ Replace {{DYNAMIC_QUESTIONS}} → markdown list from C2 results or empty string

5. Write .agents/prompts/architecture-review.md (mkdir -p, overwrite)

6. Decisions template
   └─ if !exists docs/architecture-decisions.md → copy template from templates/sdd/
   └─ if exists → console.log notice, skip

7. Print summary → exit 0
```

**Error handling:**
- Canvas not found → warn + "Canvas no disponible" + continue
- `[Responde aquí]` → warn with count + continue
- FS permission error → warn + continue
- Template file missing → throw (broken install)
- Any other error → warn + exit 0
- Never exit non-zero

**Imports:**
- `import { generateGuideQuestions } from '../utils/assessRules.js'`
- Remove unused imports (no more `evaluateAssessment`)

### Files to change
| File | Action | Details |
|------|--------|---------|
| `funky-cli/src/commands/assess.js` | Rewrite | Full rewrite of `action()`, keep `parseFrontmatter()` unchanged |

### Acceptance criteria
- [x] `parseFrontmatter()` still exported with same signature
- [x] Canvases discovered in root first, fallback to docs/
- [x] Missing canvas → warn + "Canvas no disponible" as content
- [x] `[Responde aquí]` → warn with section count
- [x] Template interpolated with all 3 placeholders replaced
- [x] Output written to `.agents/prompts/architecture-review.md`
- [x] Existing `.agents/prompts/architecture-review.md` overwritten silently
- [x] `docs/architecture-decisions.md` created from template if not exists
- [x] `docs/architecture-decisions.md` NOT modified if already exists
- [x] Summary printed with paths of generated files
- [x] Exit code 0 in ALL scenarios
- [x] No import of `evaluateAssessment`

### Estimated lines
~80 (replaces 76 existing)

### Dependencies
T1 (template), T2 (decisions template), T3 (generateGuideQuestions)

### Risk
**Medium** — new orchestration logic, multiple FS operations

---

## T5 — Unit tests: generateGuideQuestions()

### Description
Rewrite `funky-cli/tests/assessRules.test.js` to test the new `generateGuideQuestions()` function. Remove all `evaluateAssessment` tests. Tests must cover:

1. **K8s pattern** — infra mentions "K8s" → one dynamic question with category "K8s"
2. **K8s pattern** — infra mentions "kubernetes" (lowercase) → same question
3. **SQLite pattern** — infra mentions "SQLite" → question with category "SQLite"
4. **SingleNode pattern** — infra mentions "single node" → question with category "SingleNode"
5. **SingleNode pattern** — infra mentions "single nodo" (Spanish) → same category
6. **Junior+K8s pattern** — project+infra mention "junior" AND infra has K8s → question with category "Junior"
7. **Junior without K8s** — junior mentioned but infra has no K8s → NO Junior question
8. **Multiple patterns** — infra has both K8s and SQLite → 2 questions
9. **No patterns** — clean content with no triggers → empty dynamic array
10. **Empty strings** — both canvas strings empty → empty dynamic array
11. **Edge: case sensitivity** — "K8S", "Sqlite" → still matches
12. **Edge: partial words** — "sqlite" in "sqlite3" → still matches (the regex is /SQLite/i)

### Files to change
| File | Action | Details |
|------|--------|---------|
| `funky-cli/tests/assessRules.test.js` | Rewrite | Full replacement of 85-line evaluateAssessment tests with ~85-line generateGuideQuestions tests |

### Acceptance criteria
- [x] All `evaluateAssessment` references removed
- [x] All 12 test cases pass
- [x] Tests import `generateGuideQuestions` from `../src/utils/assessRules.js`
- [x] Import assertion: `generateGuideQuestions` is a function

### Estimated lines
~85 (replaces 85 existing)

### Dependencies
T3 (generateGuideQuestions must exist)

### Risk
**Low** — pure test updates, well-defined contract

---

## T6 — Integration tests: assess end-to-end

### Description
Add tests to `funky-cli/tests/assess.test.js` for the new assess flow. Keep existing `parseFrontmatter` tests unchanged.

**New test groups:**

**Canvas Discovery (4 scenarios):**
1. Both canvases in root — files read, no fallback warning
2. Both canvases in docs/ — files read from fallback, fallback notice
3. One canvas missing — warn but continue with "Canvas no disponible"
4. Both missing — warn but continue, exit 0

**Canvas Validation:**
5. Content with `[Responde aquí]` → warning printed with count
6. Clean content → no validation warning

**Guide Generation:**
7. Happy path — verify output file contains: 6-phase structure, C1 questions, canvas content embedded
8. Overwrite existing — verify old file replaced

**Decisions Template:**
9. First run → file created with template content
10. Second run → file NOT modified, notice printed

**Exit Code:**
11. All scenarios → exit 0 (use process.exit spy)

**Approach:** Use Vitest with mocked `fs` (via `vi.mock('fs')`) to control filesystem state. Mock `process.exit` to prevent test termination.

### Files to change
| File | Action | Details |
|------|--------|---------|
| `funky-cli/tests/assess.test.js` | Modify | Add ~40 lines of new tests to existing 39-line file |

### Acceptance criteria
- [x] Existing `parseFrontmatter` tests pass unchanged
- [x] All 4 canvas discovery location scenarios covered
- [x] Canvas validation with `[Responde aquí]` covered
- [x] Guide generation output verified for correct phases and content
- [x] Overwrite behavior tested
- [x] Decisions template create/skip tested
- [x] Exit 0 asserted in all scenarios
- [x] Tests use mocked `fs` and `process.exit`

### Estimated lines
~40 (adds to 39 existing = ~79 total)

### Dependencies
T4 (assess.js rewrite)

### Risk
**Medium** — requires fs mocking, process.exit spy, careful Vitest configuration

---

## Review Workload Forecast

| Task | File | Lines Changed | Type |
|------|------|--------------|------|
| T1 | `funky-cli/src/templates/sdd/architecture-review-template.md` | ~80 | Rewrite (22→80) |
| T2 | `funky-cli/src/templates/sdd/architecture-decisions-template.md` | ~35 | New |
| T3 | `funky-cli/src/utils/assessRules.js` | ~55 | Rewrite (35→55) |
| T4 | `funky-cli/src/commands/assess.js` | ~80 | Rewrite (76→80) |
| T5 | `funky-cli/tests/assessRules.test.js` | ~85 | Rewrite (85→85) |
| T6 | `funky-cli/tests/assess.test.js` | ~40 | Add to existing (39→79) |
| **Total** | | **~375** | |

### Budget Status

| Metric | Value |
|--------|-------|
| Total estimated lines to review | ~375 |
| Review budget | 400 lines |
| Within budget? | ✅ **Yes** (~25 lines under budget) |
| Chained PRs recommended? | **No** — well within single PR budget |
| Decision needed before apply? | **No** — all architecture decisions resolved in design and proposal |

### Work-Unit Commit Plan

| Commit | Tasks | Files | Theme |
|--------|-------|-------|-------|
| 1 | T1 + T2 | `architecture-review-template.md`, `architecture-decisions-template.md` | Templates |
| 2 | T3 + T5 | `assessRules.js`, `assessRules.test.js` | Utility (code + tests) |
| 3 | T4 + T6 | `assess.js`, `assess.test.js` | Command (code + tests) |

Each commit keeps tests with the code they verify, following the work-unit-commits skill rules.

---

## Dependency Graph

```
T1 (template) ──────┐
                     ├── T4 (assess.js) ──┐
T2 (decisions) ──────┤                    ├── T6 (integration tests)
                     │                    │
T3 (assessRules) ────┘                    │
        │                                  │
        └── T5 (unit tests) ──────────────┘
```

- T1, T2, T3: parallel — no dependencies between them
- T4: depends on T1, T2, T3 (needs templates + utility)
- T5: depends on T3 (tests what T3 exports)
- T6: depends on T4 (tests what T4 orchestrates)
- T5 and T6: parallel once T3 and T4 are done

## Risk Assessment

| Area | Risk | Mitigation |
|------|------|------------|
| `evaluateAssessment` removal breaks exports | Medium | T3 removes it; T5 updates tests; T4 updates imports. All 3 change together. |
| Canvas discovery logic (root/docs/ fallback) | Low | Pure FS ops, deterministic, easy to test with mocks |
| Template placeholders mismatch | Low | Design specifies exact placeholder names and content |
| `process.exit(0)` vs `process.exit(1)` | Low | All paths must exit 0; test with spy |
| FS mock complexity in T6 | Medium | Use `vi.mock('fs')` with selective implementation overrides |
| Review budget overflow | Low | ~375 of 400 = 93.75% utilization. Buffer of ~25 lines |
