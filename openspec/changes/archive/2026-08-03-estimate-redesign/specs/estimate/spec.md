# Delta for estimate

Delta of `openspec/specs/estimate/spec.md`. R1, R2, R4, R5, R6, R-E1–R-E3 and exit(0)/headless NFRs unchanged.

## ADDED Requirements

### Requirement: R7 — Optional brief

`--brief [path]` is optional: no value embeds the brief-questions checklist; a value embeds that file; missing file MUST warn, fall back to the checklist, exit(0).

- GIVEN `--brief` without a value
- WHEN the guide is generated
- THEN the checklist is embedded

- GIVEN `--brief missing.md` does not exist
- WHEN the command runs
- THEN warning, checklist fallback, exit(0)

### Requirement: R8 — Optional topic flags

The system MUST accept `--roles`, `--multi-tenant`, `--transactions`, `--security`, `--concurrency`, `--integrations`; each embeds its fragment at `{{OPTIONAL_SECTIONS}}`. No flags → no topic sections.

- GIVEN `funky estimate --security --roles`
- WHEN the guide is generated
- THEN both fragments are embedded

- GIVEN no topic flags
- WHEN the guide is generated
- THEN no topic sections appear

### Requirement: R9 — Always-on scope ficha

The system MUST always include a ficha of 6 topics: estado ∈ {`Aplica`, `No aplica según lo documentado`, `Indeterminado (revisar)`}; unfilled canvas sections (`[Responde aquí]`) MUST map to `Indeterminado (revisar)`.

- GIVEN the canvas documents the topic not applicable
- WHEN the guide is generated
- THEN the ficha row reads `No aplica según lo documentado`

- GIVEN a canvas section holds `[Responde aquí]`
- WHEN the guide is generated
- THEN the ficha row reads `Indeterminado (revisar)`

### Requirement: R10 — `--pricing-team` reference

`--pricing-team` MUST embed a reference section (rol×seniority×dedicación×duración formula, 1-dev and team models, phases table); reference only, not a calculator.

- GIVEN `--pricing-team` is invoked
- WHEN the guide is generated
- THEN the team-cost reference is embedded

- GIVEN no `--pricing-team`
- WHEN the guide is generated
- THEN no team-cost section appears

### Requirement: R11 — Console suggestions only

Topic signals MUST print console suggestions ("Se detectó X. Considerá --flag") and MUST NOT auto-include topics.

- GIVEN a multi-tenant signal, no flag
- WHEN the command runs
- THEN suggestion printed, no section added

### Requirement: R12 — Backward compatibility

`generatePricingGuide(decisions, projectCanvas, infraCanvas, opts = {})` MUST keep name and first three args; empty `opts` MUST produce byte-identical legacy output; three-arg tests stay green.

- GIVEN `generatePricingGuide(a, b, c)`
- WHEN it runs
- THEN output is byte-identical to legacy

- GIVEN `generatePricingGuide(a, b, c, {})`
- WHEN it runs
- THEN output equals the three-arg call

### Requirement: R13 — Deterministic input

Flags MUST be deterministic input: same inputs plus flags yield an identical guide; no clock or random content.

- GIVEN identical inputs and flags twice
- WHEN the guide is generated
- THEN both outputs are byte-identical

- GIVEN same inputs, different flags
- WHEN the guide is generated
- THEN outputs MAY differ deterministically

### Requirement: R14 — Living templates

Optional sections MUST be driven by editable repo templates: `brief-questions-template.md`, `topics/*.md`, `team-cost-reference-template.md`. Edits MUST change guide content; no per-project copies.

- GIVEN a fragment template is edited
- WHEN the matching flag is used
- THEN the guide reflects the edit

## MODIFIED Requirements

### Requirement: R3 — Pricing guide generation

The system MUST generate `docs/funky-ai/estimate/pricing-guide.md` with architectural decisions (or "Sin decisiones documentadas"), both canvases, and the discussion structure (pricing context, cost factors, infra reference, agreements). It is a DERIVED artifact: MUST be regenerated each run. The guide MAY include optional sections (brief, topic fragments, team-cost reference, scope ficha) at `{{OPTIONAL_SECTIONS}}` when their flags are set. (Previously: fixed structure, no optional sections.)

- GIVEN complete canvases and decisions exist
- WHEN `funky estimate` runs
- THEN `pricing-guide.md` contains decisions, canvases, and structure

- GIVEN `pricing-guide.md` already exists
- WHEN `funky estimate` runs
- THEN it is overwritten with regenerated content
- AND no warning for the existing file

## Out of Scope

Not in scope: `context.json` shape, IA prompt R5, canvas structure, auto-inclusion, ceremony files, interactive mode, calculator.
