# Exploration: funky estimate redesign (`estimate-redesign`)

> **Change:** `estimate-redesign`
> **Phase:** exploration
> **Date:** 2026-08-02
> **Source:** `docs/funky-forge/release-ideas/estimate-redesign-strategy.md` (acordada), `docs/funky-forge/release-ideas/release-roadmap.md` (Movimiento 2), `smoke-test-v3.5.0/recomendaciones-agente.md` (diagnóstico descartado en forma, rescatado en ideas)

---

## Current State (short)

`funky estimate` is a headless, deterministic generator. `runEstimate(targetBase, opts)` in `funky-cli/src/commands/estimate.js` orchestrates: decisions → `findCanvases()` → `generatePricingGuide(decisions, projectCanvas, infraCanvas)` → writes `docs/funky-ai/estimate/pricing-guide.md` (overwrites) + `pricing-decisions.md` (create-if-not-exists) → optional `context.json` update (`estimate.runAt`) → prints IA prompt (banner + body + footer). Always exit(0). Never interactive. Spec: `openspec/specs/estimate/spec.md` (R1–R6, R-E1/R-E2/R-E3).

Key facts that constrain the redesign:

- `generatePricingGuide` does naive `.replace()` of 3 placeholders (`{{DECISIONS_CONTENT}}`, `{{PROJECT_CANVAS_CONTENT}}`, `{{INFRA_CANVAS_CONTENT}}`) on ONE template: `funky-cli/src/templates/estimate/pricing-guide-template.md`.
- Template currently has a fixed "Estructura de Discusión" (4 steps) and a fixed "Factores de Costo" list — no conditional content, no brief, no team costs.
- NFR: determinism (same inputs → identical guide), <500ms cold start, headless only, `process.exit(0)` only in `.action()`.
- `--context` (`-c`) exists; opts currently carry only `context`/`contextPath`.
- Tests (`funky-cli/tests/estimate.test.js`, vitest, mocked `fs`) call `generatePricingGuide(a, b, c)` with exactly 3 args and assert on placeholder behavior + exit(0) flows. Signature evolution MUST keep these green (or deliberately co-evolve them).
- Reference pattern already proven in `assess`: `surfaceRiskPatterns(targetBase, templateContent)` in `funky-cli/src/utils/assessRules.js` surfaces a living markdown doc (`risk-patterns-template.md` → copied once to project as `risk-patterns.md`) into the review guide via a `{{DYNAMIC_QUESTIONS}}` insertion point. The template itself declares "señal a buscar" per pattern; the code stays dumb and deterministic; the AI evaluates applicability.
- Data available for heuristics: PROJECT-CANVAS (5 sections) and INFRA-CANVAS (4 sections) contents, decisions text, and `unfilledCount` (`[Responde aquí]` count). Canvas sections that signal topics: INFRA Auth/DB (security, multi-tenant), PROJECT (roles, integrations), decisions text.

---

## Design Options (per strategy point)

### 1. Brief funcional — OPCIONAL, never blocking

| Option | Pros | Cons | Effort |
|---|---|---|---|
| **1A. `--brief` boolean** → embeds a "Brief funcional (preguntas de referencia)" section in the guide: product type, main user task, MVP scope, complexity, integrations, timeline questions the team answers during the session | Zero ceremony; deterministic (flag in input); keeps exit(0); headless | Questions are static unless the team edits a template; one more flag | Low |
| **1B. `--brief <path>`** → reads an existing product brief file and embeds its content; missing file → warn + fallback to questions-only, exit(0) | Reuses briefs the team already writes; no duplication | Path flag adds I/O + validation surface | Low-Med |
| **1C. Data-driven auto-brief**: include brief questions whenever canvases are mostly unfilled (`unfilledCount > threshold`) | Helps the common "stack-only" case automatically | Magic behavior; conflicts with "CLI facilita, no dictamina" (auto-decides for user); harder determinism story for users | Med |

**Recommendation: 1A + 1B combined** — `--brief [path]` (optional-value flag): no value → embed the question checklist; value → embed that file's content (warn + fallback on read failure, always exit(0)). Never blocks. Questions live in a small editable template `brief-questions-template.md` (living-docs principle), read by a new `generateBriefSection(briefPath)` helper.

### 2. Conditional templates on-demand (roles, multi-tenant, transactions, security, concurrency, integrations)

| Option | Pros | Cons | Effort |
|---|---|---|---|
| **2A. Per-topic flags**: `--roles`, `--multi-tenant`, `--transactions`, `--security`, `--concurrency`, `--integrations`; each embeds its fragment at a `{{OPTIONAL_SECTIONS}}` insertion point in the guide | Explicit; discoverable via `--help`; fully deterministic; user stays in control (CLI facilita) | 6 new flags (8 total with brief/team); flag surface grows | Low-Med |
| **2B. Single `--topics roles,multi-tenant` list flag** | One flag, compact | Less discoverable; parse/validate list; combos harder to reason about in `--help` | Med |
| **2C. Data-driven auto-inclusion** (heuristics silently include sections) | Zero-friction, matches "cuando los datos lo justifican" | **Against philosophy**: CLI decides for the user; user can't see why a section appeared; risk of wrong inclusion; weakens determinism narrative | Med |
| **2D. Hybrid**: flags (2A) for inclusion + data signals printed as **suggestions only** ("Se detectó multi-tenant en INFRA-CANVAS. Considerá `--multi-tenant`.") | Data just hints; user decides; no magic; deterministic | Suggestion messaging adds a small surface | Low-Med |

**Recommendation: 2D.** Implement topics as **fragment template files** (`templates/estimate/topics/{roles,multi-tenant,transactions,security,concurrency,integrations}.md`), each joined into the guide at `{{OPTIONAL_SECTIONS}}`. Signal detection reuses the same heuristics as the "No aplica" ficha (point 3) so there is ONE source of topic data. Empty topic list → insertion point replaced with nothing (legacy output shape preserved).

### 3. Ficha "No aplica en esta fase" (tema → aplica/no aplica)

| Option | Pros | Cons | Effort |
|---|---|---|---|
| **3A. Code heuristics** (`estimateTopics.js`, mirrors `assessRules.js`): scan canvas + decisions text with small keyword signals; emit a table `| Tema | Estado |` where Estado ∈ {Aplica, No aplica en esta fase, Indeterminado (revisar)} | Deterministic, testable, short table, directly "generated by heuristics" per strategy §4.3 | Heuristic rules live in JS (less editable by team); keyword matching can miss/overshoot | Low-Med |
| **3B. Living markdown pattern (risk-patterns style)**: a `scope-exclusion-template.md` declaring "señal a buscar" per topic, surfaced wholesale; the AI decides | Same proven pattern as assess; team-editable; zero heuristics in code | Table is a *reference*, not a verdict — weaker "limita la imaginación de la IA" than actual verdicts; content grows with each topic | Low |
| **3C. Hybrid**: living template defines signals per topic + code matches signals against canvas text → verdicts | Team-editable rules AND short verdict table | Two moving parts; matching logic between doc and code must stay in sync | Med |

**Recommendation: 3A** (code heuristics, conservative), with an "Indeterminado (revisar)" state whenever the relevant canvas section is unfilled (`[Responde aquí]`). Wording stays declarative: "No aplica **según lo documentado**" — the ficha filters imagination, the AI still validates in-session. Keep the table SHORT (6 topics ≈ 6 rows). Heuristic keyword sets are a design-phase detail; tests lock them. (3B stays available as a fallback if the team later wants editable rules.)

### 4. Team costs & phased pricing — reference options only

| Option | Pros | Cons | Effort |
|---|---|---|---|
| **4A. `--pricing-team`** flag embeds a "Costos de equipo (referencia)" section: rol × seniority × dedicación × duración formula, 1-dev model, multi-dev model, phasing table (Discovery/MVP/QA/Despliegue) | Explicit reference on demand; never in default output; matches strategy example | One more flag; section content is substantial | Low-Med |
| **4B. Two flags** (`--pricing-team`, `--pricing-phases`) | Finer control | More surface; phasing rarely wanted without team costs | Med |
| **4C. Always include team costs in guide** | — | **Rejected**: violates "opciones, no secciones obligatorias" (§4.4) and philosophy | — |

**Recommendation: 4A.** Content lives in `templates/estimate/team-cost-reference-template.md` (living doc, editable); embedded at `{{OPTIONAL_SECTIONS}}` only when the flag is set. No calculation engine — the section is a reference table/formula for the session, not a price calculator (spec purpose stays: facilitate discussion, not compute).

### 5. Mapping to current structure (`generatePricingGuide` / `estimateDomain.js` / tests)

| Option | Pros | Cons | Effort |
|---|---|---|---|
| **5A. Extend signature with optional opts**: `generatePricingGuide(decisions, projectCanvas, infraCanvas, opts = {})` where `opts = { brief?, topics?, pricingTeam? }`; base 3 placeholders unchanged; optional sections built by new helpers and joined at `{{OPTIONAL_SECTIONS}}`; new `estimateTopics.js` for heuristics | Existing 3-arg calls and tests stay green; minimal churn; pure & testable | `generatePricingGuide` grows responsibility (orchestrates base + optional) | Low-Med |
| **5B. New orchestrator `generatePricingGuideV2(inputs)` + keep old as deprecated wrapper** | Cleaner separation | Two functions; tests split; more churn for no user-visible gain | Med |
| **5C. Template engine / conditional blocks in one file** (`{{#if roles}}...`) | One template file | The codebase uses naive replace; adding a mini-engine is overkill for 6 static fragments; harder to read | Med-High |

**Recommendation: 5A.**
- `generatePricingGuide(decisions, projectCanvas, infraCanvas, opts = {})` keeps name + first 3 args (backward compatible; `opts` default preserves legacy output exactly).
- New pure helpers in `estimateDomain.js`: `generateBriefSection(briefPath)`, `generateTopicFragments(topics)`, `generateTeamCostReference()`, `generateScopeExclusionTable(canvases, decisions)`.
- New `funky-cli/src/utils/estimateTopics.js` exporting `surfaceEstimateTopics(canvases, decisions)` → `{ signals: [{topic, status, evidence}] }` (mirrors `assessRules.js`), consumed by BOTH the ficha (point 3) and the suggestion messages (point 2D).
- `pricing-guide-template.md` gains ONE insertion marker `{{OPTIONAL_SECTIONS}}` after the canvas blocks; all optional sections (brief, topics, team, ficha) flow through it. Ficha by default? → **design decision** (see below).
- `estimate.js`: add Commander options `--brief [path]`, the 6 topic flags, `--pricing-team`; pass `opts` through to `runEstimate` (already forwards `opts`); summary lists included sections.
- `estimateDomain` test contract: existing tests untouched; add describe blocks per flag (brief embed + fallback, each topic fragment, team section, ficha table states, suggestion messages, empty-opt legacy equality).
- IA prompt (R5) unchanged — it references the guide file, which now contains the optional sections. Spec churn: R3 wording (guide may include optional sections), NFR determinism (flags are part of input), new requirement blocks for the flags; `context.json` shape NOT changed here (see Risks).

---

## Affected Areas

| File | Why affected |
|---|---|
| `funky-cli/src/commands/estimate.js` | New Commander options (`--brief`, 6 topics, `--pricing-team`), forwarded via `opts`; summary lists included sections |
| `funky-cli/src/utils/estimateDomain.js` | `generatePricingGuide` 4th optional `opts` arg; new helpers: brief section, topic fragments, team reference, scope-exclusion table |
| `funky-cli/src/utils/estimateTopics.js` (new) | Heuristics + signals, mirrors `assessRules.js` |
| `funky-cli/src/templates/estimate/pricing-guide-template.md` | `{{OPTIONAL_SECTIONS}}` insertion point |
| `funky-cli/src/templates/estimate/brief-questions-template.md` (new) | Brief question checklist (living) |
| `funky-cli/src/templates/estimate/topics/{roles,multi-tenant,transactions,security,concurrency,integrations}.md` (new) | Conditional topic fragments (living) |
| `funky-cli/src/templates/estimate/team-cost-reference-template.md` (new) | Team cost + phasing reference (living) |
| `funky-cli/tests/estimate.test.js` | New describe blocks per flag; existing tests must stay green |
| `openspec/specs/estimate/spec.md` | Spec phase: R3 wording, NFR determinism, new flag requirements |
| `docs/funky-forge/estimate.md` | Flags table + outputs doc update |
| `funky-cli/src/utils/assessRules.js` | Reference only (pattern source, not modified) |
| `funky-cli/src/utils/context.js` | NOT changed — `context.json` shape stays `{ estimate: { runAt } }` (pipeline contract change belongs to the pipeline track) |

---

## Recommendations (summary)

1. **Brief**: `--brief [path]` optional-value flag; embeds questions checklist or a provided brief file; warn + fallback, exit(0).
2. **Conditional templates**: 6 per-topic flags + fragment files at `{{OPTIONAL_SECTIONS}}`; data signals printed as suggestions only (never auto-include).
3. **Ficha**: short code-heuristic table `tema → aplica/no aplica/indeterminado`, conservative "según lo documentado" wording.
4. **Team costs**: `--pricing-team` reference section, never default.
5. **Structure**: extend `generatePricingGuide(..., opts = {})`, keep legacy behavior with empty opts, new `estimateTopics.js`, one template insertion point, tests extended not rewritten.

---

## What needs PRODUCT decision vs. DESIGN decision

**Product (user decides):**
- Ship all 6 topic flags in v1 of the redesign, or a subset (e.g., roles, multi-tenant, transactions first)?
- Should the "No aplica" ficha be **always-on by default** in every guide (recommended: yes — it replaces empty sections and is short) or opt-in via flag?
- Does the team want the brief questions and topic fragments editable in-repo (living templates — recommended yes per philosophy) or hardcoded in JS?
- Flag naming preferences (`--brief`, `--pricing-team` vs alternatives).

**Design (decidable in sdd-design):**
- Exact keyword signal sets and status rules for the ficha (with tests).
- `{{OPTIONAL_SECTIONS}}` section ordering in the guide.
- Suggestion message format (console only vs also in guide).
- Whether topic fragments copied to project as living docs (risk-patterns style) or read from repo templates only — recommendation: read from repo templates (simpler; avoids 9-file ceremony), reconsider in design.
- Summary messaging listing included sections.

---

## Risks

- **Heuristic false positives/negatives** in the ficha → "no aplica" could wrongly exclude a real concern. Mitigation: "según lo documentado" wording, "Indeterminado" when canvases unfilled, AI validates in-session; ficha is a filter, not a verdict.
- **Flag explosion** (8+ new flags) → discoverability cost. Mitigation: explicit booleans with clear help text; `--help` lists all; consider `--topics` grouping only if user prefers.
- **Template fragmentation drift** (base + 6 topics + brief + team = 9 templates) → more files to maintain. Mitigation: each fragment minimal; all living docs owned by team; consistent with philosophy.
- **Determinism NFR**: flags must be part of the deterministic input; no clock/randomness in guide content (dates only in the decisions template, as today).
- **Backward compatibility**: existing `generatePricingGuide(a,b,c)` calls and tests must stay green; opts default preserves legacy output byte-for-byte.
- **Scope boundary**: do NOT change `context.json` contract in this change (`estimate.runAt` only) — real pipeline state is Movimiento 2 pipeline work; coordinate later.
- **Ceremony creep**: redesign must not resurrect the "9 files per project" anti-pattern — all optional content lives INSIDE the single guide via `{{OPTIONAL_SECTIONS}}`, never as separate per-project files (per-product decision above can revisit).

---

## Ready for Proposal

**Yes.** The exploration produced concrete, decision-ready options per strategy point with a clear recommended path (5A structure, flags + fragments + code-heuristics ficha). Product decisions needed before/at proposal: topic set for v1, ficha default-on, living-templates choice. Spec phase must keep R-E1/R-E2/R-E3 and exit(0)/headless NFRs intact.
