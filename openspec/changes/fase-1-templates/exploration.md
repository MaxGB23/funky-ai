# Exploration: Fase 1 — Templates (funky init --template)

> **Change:** `fase-1-templates`
> **State:** Exploration complete
> **Date:** 2026-07-28

---

## Current State

`funky init --template` is a headless project initialization flow that injects three files into the project root:
1. **PROJECT-CANVAS.md** — 5-section app architecture form (generated at runtime via `canvas.js`)
2. **INFRA-CANVAS.md** — 4-section infra operations form (generated at runtime via `canvas.js`)
3. **canvas-planning-guide.md** — static 73-line "menu à la carte" from `src/templates/bootstrap/`

The canvases use `"No definido / Pendiente"` as the default placeholder. The guide is the most valuable piece — it provides context and trade-offs for each decision.

When both canvases exist, `funky init` (without `--template`) activates **headless mode** — skips all interactive prompts and runs `runInit()` to copy 9 bootstrap files, create 7 engram directories, and write the engram index.

### Key architecture traits

- `runInit()` in `src/commands/init.js` builds an **intentions array** (copy/create/mkdir) executed by `fs-adapter.js`
- The `--template` flag does NOT use the intentions pipeline — it writes directly via `fs.writeFileSync`/`fs.copyFileSync`
- Canvases are read-only artifacts for dev+IA conversation — never parsed or scaffolded from
- The 10 files in `src/templates/bootstrap/` are synced from monorepo sources via `scripts/sync-templates.js`

---

## Affected Areas

| File | Role | Why affected |
|---|---|---|
| `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | Static planning guide | Add Architect Notes, compatibility analysis section, pull-not-push markers |
| `funky-cli/src/utils/canvas.js` | Canvas markdown generators (38 lines) | Add rationale fields, better placeholders, progressive disclosure |
| `funky-cli/src/templates/bootstrap/` (directory) | 10 source template files | 4 orphaned files to fix (add to copy list or remove) |
| `funky-cli/scripts/sync-templates.js` | Template sync pipeline | Fix broken `worker-handoff.md` reference |
| `funky-cli/src/commands/init.js` | Init command (311 lines) | Prompt options may need syncing with guide; --template flag uses raw fs |
| `funky-cli/src/utils/fs-adapter.js` | File operation executor | Not directly changed, but context for how intentions work |

---

## Verification of Roadmap Items (6 improvements)

### 1. ✅ Architect Notes — Still valid, effort Bajo
The guide has zero pedagogical micro-lessons. No "real-world traps" or operational wisdom embedded in any section. The critique correctly identifies this as the highest-value-lowest-effort improvement.

**Code confirmation:** `canvas-planning-guide.md` is purely descriptive (e.g., "Ideal para SEO, Server Components, SSR"). No cautionary notes, no "when NOT to use this", no budget/sizing heuristics.

### 2. ✅ "Mejores preguntas" — Still valid, effort Bajo
`canvas.js` produces bare `"No definido / Pendiente"` for all fields with zero hint text. A junior developer sees an empty form and doesn't know what to put.

**Code confirmation:**
```js
const f = (val) => val || 'No definido / Pendiente';
```
Single fallback function — no variation by section, no guidance embedded.

### 3. ✅ LLM-driven compatibility analysis — Still valid, effort Bajo
No section in any template instructs the agent to analyze incompatibilities between choices (e.g., Astro + NextAuth, Junior + K8s).

**Code confirmation:** Grep for "compatibilidad", "incompatible", "trade-off" in templates — nothing found in the bootstrap templates.

### 4. ✅ Pull not push — Still valid, effort Bajo
All sections in both canvases and the guide are presented as mandatory. No "if applicable" markers, no progressive disclosure tiers.

### 5. ✅ Fix orphaned files — Still valid, effort Bajo
**4 files** in `bootstrap/` that are packaged with the CLI but never copied by `runInit()`:

| Orphaned file | Content | Potential destination |
|---|---|---|
| `agents-rules-secops-setup.md` | npm hardening config guide (12 lines) | `.agents/rules/secops-setup.md` |
| `architecture-assessment-guide.md` | Field-by-field guide for architecture-assessment.md (70 lines) | Not currently referenced — separate from the template itself |
| `engram-bugfixes.md` | Bugfix knowledge base template (7 lines) | Currently the engram index is created but these templates are not |
| `engram-discoveries.md` | Discovery knowledge base template (7 lines) | Same as above |

**Important finding:** `TEMPLATE_GUIDE.md` (which IS copied) explicitly references `docs/engram/discoveries.md` as a place to register structural decisions. But that file is never created — the orphaned `engram-discoveries.md` in bootstrap/ is the source for it. This is a real bug.

### 6. ✅ Fix sync-templates.js — Still valid, effort Bajo
Line 15 references a source path that does not exist:
```js
{ src: 'funky-cli/src/templates/sdd/worker-handoff.md', dest: 'plantilla-worker-handoff.md' },
```
- `funky-cli/src/templates/sdd/worker-handoff.md` — **DOES NOT EXIST** (verified)
- `.agents/templates/sdd/worker-handoff.md` — **DOES EXIST** (verified)

**Complication:** The integration test at `init.integration.test.js` line 41 explicitly validates that `worker-handoff.md` is **NOT** copied:
```js
it('NO debería copiar la plantilla canónica worker-handoff al nuevo workspace', () => {
    const workerHandoffPath = path.join(tmpDir, 'docs', 'funky-ai', 'workers', 'plantilla-worker-handoff.md');
    expect(fs.existsSync(workerHandoffPath)).toBe(false);
});
```
And commit `3ef773f` says: "feat: deprecate worker-handoff.md in favor of direct message passing". This suggests the correct fix may be to **remove the line** from sync-templates.js rather than fix the path.

---

## Additional Issues Discovered

### A. 🟡 Prompt vs Guide option mismatch (HIGH)
The interactive prompts in `init.js` offer a **different set of options** than the planning guide:

| Category | Guide (canvas-planning-guide.md) | Prompt (init.js) | Gap |
|---|---|---|---|
| Framework | Next.js, React+Vite, Astro, **NestJS/Express** | Next.js, React+Vite, Astro | Missing: NestJS/Express |
| Pattern | Clean Arch, Hexagonal, Modular/FSD, **Screaming Architecture** | Clean Arch, Hexagonal, Modular | Missing: Screaming Architecture |
| Testing | Methodology (TDD, Integration First, Smoke) + Runner (Vitest, Jest, Playwright) | TDD, BDD, "Decidir luego" | Completely different structure; guide is richer |

This means headless mode (which uses the guide, not prompts) offers more architectural options than interactive mode. The modes are inconsistent.

### B. 🟡 Orphaned files referenced by active templates (MEDIUM)
`TEMPLATE_GUIDE.md` line 44 says:
> "Cualquier decisión estructural... DEBE registrarse en: `docs/engram/discoveries.md`"

But `engram-discoveries.md` is orphaned — never copied during init. Users following the guide would reference a file that doesn't exist.

Similarly, `engram-bugfixes.md` provides a standard template for bugfix documentation that is never deployed.

### C. 🔵 `--template` flag bypasses intentions pipeline (LOW)
The `--template` handler (lines 116-136 of `init.js`) writes files directly via `fs`:
```js
fs.writeFileSync(projectCanvasPath, generateProjectCanvasMarkdown({}));
fs.copyFileSync(guideSrc, guideDest);
```
This means it doesn't benefit from `fs-adapter.js` features (dry-run, never-overwrite guarantee, structured logging). For a Phase 1 fix, this isn't critical but worth noting.

### D. 🔵 Language inconsistency confirmed (LOW)
- Line 59 of guide: `"Drop-in components"` (English)
- Line 67 of guide: `"Obligatorio activar"` (Spanish)

### E. 🔵 canvas.js is ultra-minimal (LOW)
38 lines, two near-identical functions. The `"No definido / Pendiente"` fallback is the same across all 9 sections. No per-section hints, no conditional logic.

---

## Approaches

### Per-item approach (recommended by roadmap)

Each of the 6 items is independent and can be implemented as separate atomic changes. Recommended order:

1. **Fix orphaned files** — Add 4 files to `init.js` `filesToCopy` (or remove from bootstrap). Quick win, unblocks TEMPLATE_GUIDE.md reference.
2. **Fix sync-templates.js** — Fix or remove the `worker-handoff.md` reference.
3. **Mejores preguntas** — Enhance `canvas.js` with per-section guidance in placeholders.
4. **Architect Notes** — Add pedagogical notes to `canvas-planning-guide.md`.
5. **Pull not push** — Mark advanced sections in both canvases and guide as conditional.
6. **LLM-driven compatibility analysis** — Add instruction section to templates.

| Approach | Pros | Cons | Effort |
|---|---|---|---|
| **Per-item incremental** | Safe, testable, reversible | Fixes #1 and #2 have dependencies on understanding orphaned file intent | Bajo |
| **All 6 in one pass** | Less context switching, coherent final state | Harder to review, riskier | Medio |

**Recommendation:** Items 1-2 first (cleanup), then 3-4 (content), then 5-6 (progressive enhancements). Items 3 and 4 could be combined into one pass since they both affect the same files.

### Additional item: Fix prompt vs guide mismatch

This is NOT in the 6 roadmap items but SHOULD be added. The mismatch between interactive mode and headless mode is confusing and reduces trust in the system.

**Effort:** Bajo — add 3 missing option entries to the prompt selectors in `init.js`, and optionally restructure the testing prompt to match the guide's methodology + runner split.

---

## Recommendation

Proceed with **all 6 roadmap items + the additional prompt/guide mismatch fix**. All effort estimates are confirmed as "Bajo" (Low). No item requires architectural change — they are all content or config fixes.

The recommended execution order:
1. Fix orphaned files (items 5, 1a) — resolves TEMPLATE_GUIDE.md broken reference
2. Fix sync-templates.js (item 6, 1b) — removes dangling reference
3. Fix prompt/guide mismatch (new item) — consistency between modes
4. Architect Notes + Mejores preguntas (items 1, 2, 3) — content improvements to guide and canvas.js
5. Pull not push + LLM-driven analysis (items 4, 5, 6) — progressive disclosure and agent instructions

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Orphaned files removal breaks external tooling | Low | Medium | Grep for references before removing; prefer adding to copy list over deleting |
| Adding Architect Notes makes guide too long | Low | Low | Keep notes brief (1-2 lines per section), link to external docs for depth |
| LLM-driven analysis section adds noise if instructions are vague | Medium | Low | Write specific, actionable instructions with examples |
| Fixing sync-templates.js: removing worker-handoff line might break expected behavior | Low | Low | The file is deprecated per commit history; removing the line is safer than fixing the path |
| Prompt/guide mismatch fix creates drift if only one is updated in future | Medium | Low | Add a comment in both files cross-referencing each other |
| Effort underestimation for testing prompt restructure | Low | Low | The testing prompt restructure is optional; can be deferred |

---

## Ready for Proposal

**Yes.** All 6 roadmap items are confirmed valid, effort estimates are accurate (Bajo), and no blockers exist. One additional item (prompt/guide mismatch) should be included. Proceed to `sdd-propose`.

---

## Files Read

| File | Path |
|---|---|
| Roadmap | `init-observaciones/roadmap/README.md` |
| Template critique | `init-observaciones/critica-templates.md` |
| Technical observations | `init-observaciones/observaciones.md` |
| Phase 1 summary (empty) | `init-observaciones/roadmap/fase-1-resumen.md` |
| Canvas generator | `funky-cli/src/utils/canvas.js` |
| Planning guide | `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` |
| Init command | `funky-cli/src/commands/init.js` |
| Template sync script | `funky-cli/scripts/sync-templates.js` |
| FS adapter | `funky-cli/src/utils/fs-adapter.js` |
| Bootstrap dir (listing) | `funky-cli/src/templates/bootstrap/` |
| Orphaned: secops-setup | `funky-cli/src/templates/bootstrap/agents-rules-secops-setup.md` |
| Orphaned: assessment guide | `funky-cli/src/templates/bootstrap/architecture-assessment-guide.md` |
| Orphaned: engram-bugfixes | `funky-cli/src/templates/bootstrap/engram-bugfixes.md` |
| Orphaned: engram-discoveries | `funky-cli/src/templates/bootstrap/engram-discoveries.md` |
| TEMPLATE_GUIDE.md | `funky-cli/src/templates/bootstrap/TEMPLATE_GUIDE.md` |
| ORCHESTRATOR-STATE.md | `funky-cli/src/templates/bootstrap/ORCHESTRATOR-STATE.md` |
| Unit tests | `funky-cli/tests/init.test.js` |
| Integration tests | `funky-cli/tests/init.integration.test.js` |
