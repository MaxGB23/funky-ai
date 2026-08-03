# Design: Estimate Redesign — brief, optional topics, scope-exclusion ficha

## Technical Approach

Extend `generatePricingGuide` with a 4th optional `opts` param (exploration option 5A). Empty/absent `opts` = byte-identical legacy output (R12). Optional sections (brief, topic fragments, team-cost reference, always-on scope ficha) are built by 4 new helpers in `estimateDomain.js` and joined at a single `{{OPTIONAL_SECTIONS}}` marker in `pricing-guide-template.md`. New pure `estimateTopics.js` mirrors `assessRules.js`, feeding both the ficha (R9) and console-only suggestions (R11). Commander maps 8 new flags to `opts`; `runEstimate` always sets `scopeFicha: true` so the ficha is always-on at CLI level while the function keeps the legacy default. IA prompt (R5) and `context.json` untouched.

## Architecture Decisions

| # | Ambiguity | Options | Tradeoff | Decision |
|---|-----------|---------|----------|----------|
| 1 | R3 "optional when flags set" vs R9 always-on ficha | (a) ficha in function default (b) `opts.scopeFicha`, CLI always true | (a) breaks R12 byte-identity (b) ficha = CLI-level behavior, function stays legacy | (b): ficha flows through `{{OPTIONAL_SECTIONS}}` with **no CLI flag**; `runEstimate` always passes `scopeFicha: true` |
| 2 | Keyword signals | fixed 6 sets + status rules in JS, tests lock them | deterministic, testable; misses mitigated by "según lo documentado" wording | per-topic `REGIONS`+`SIGNALS` table below; precedence **Indeterminado > Aplica > No aplica** |
| 3 | Section order in `{{OPTIONAL_SECTIONS}}` | ficha-first vs brief-first | ficha filters imagination early; team costs are commercial, last | **ficha → brief → topics (canonical order) → team-cost** |
| 4 | Suggestion format | console-only vs also in guide | guide pollution vs discoverability | **console-only**, one line per Aplica signal without its flag: `💡 Se detectó {name} ({evidence}). Considerá --{topic} para incluir su sección en la guía.` |
| 5 | Marker structure | own marker vs shared single point | one join point vs more surface | single `{{OPTIONAL_SECTIONS}}` line; regex strips the marker line so empty opts leave zero trace (R12) |
| 6 | Helper signatures | 4 helpers, exact returns | — | see Interfaces |
| 7 | `estimateTopics.js` API | `surfaceEstimateTopics(canvases, decisions)` | mirrors assessRules | `{ signals: [{topic, status, evidence}] }`, 6 rows in canonical order, no fs access |
| 8 | Commander→opts | `opts.brief` = `true`\|string\|undefined; booleans for topics/team; canonical filter | flag order never changes output (R13) | see mapping below |
| 9 | Test plan | extend, never rewrite | — | see Testing Strategy |
| 10 | New templates | minimal living fragments in repo | editable per R14, no per-project copies | see Templates |

## Data Flow

```
funky estimate (Commander)
   │ opts: {brief, roles..integrations, pricingTeam, context}
   ▼
runEstimate(targetBase, opts)
   │ loadDecisions() ─┐  (context.js, unchanged)
   │ findCanvases() ──┘  → {projectCanvas, infraCanvas, unfilledCount}
   ▼
surfaceEstimateTopics(canvases, decisions)   ← estimateTopics.js (pure)
   │ { signals: 6 × {topic, status, evidence} }
   ├──► suggestions: console.log, Aplica & flag unset (R11)
   └──► generateScopeExclusionTable()  → ficha, ALWAYS in guide (R9)
   ▼
generatePricingGuide(a, b, c, guideOpts)     ← estimateDomain.js
   │ 3 legacy replaces, then strip/expand {{OPTIONAL_SECTIONS}}
   ▼
docs/funky-ai/estimate/pricing-guide.md (overwrite) + summary + IA prompt (R5 unchanged)
```

## Interfaces / Contracts

```js
// ── funky-cli/src/utils/estimateTopics.js (new) ──
export const TOPICS = ['roles','multi-tenant','transactions','security','concurrency','integrations'];
export const DISPLAY_NAMES = { roles:'Roles del equipo', 'multi-tenant':'Multi-tenant',
  transactions:'Transacciones', security:'Seguridad', concurrency:'Concurrencia',
  integrations:'Integraciones' };
export const STATUS = { APPLIES:'Aplica', NOT_APPLICABLE:'No aplica según lo documentado',
  INDETERMINATE:'Indeterminado (revisar)' };
// topic key == flag name for all 6 → opts[topic] works directly
export function surfaceEstimateTopics(canvases, decisions)
  // canvases: {projectCanvas?:string, infraCanvas?:string}
  // → { signals: [{topic, status, evidence}] }  — pure, no fs

// ── funky-cli/src/utils/estimateDomain.js (modified) ──
export function generatePricingGuide(decisions, projectCanvas, infraCanvas, opts = {})
  // opts: { brief?: true|string, topics?: string[], pricingTeam?: boolean, scopeFicha?: boolean }
export function generateBriefSection(briefPath, baseDir)
  // briefPath true|undefined → embed brief-questions-template.md; string → read file
  // resolved against baseDir; read failure → { content: checklist, usedFallback: true } (caller warns)
  // → { content: string, usedFallback: boolean }
export function generateTopicFragments(topics)      // string[] → joined fragments, CANONICAL order; throws if a fragment file missing
export function generateTeamCostReference()          // → team-cost-reference-template.md content; throws if missing
export function generateScopeExclusionTable(canvases, decisions)  // → markdown ficha table, 6 rows
```

```js
// ── estimate.js: flags (topic key == flag name) ──
.option('--brief [path]', 'Embed brief questions checklist (no value) or brief file content (value)')
.option('--roles', 'Include roles section').option('--multi-tenant', '...')
.option('--transactions', '...').option('--security', '...')
.option('--concurrency', '...').option('--integrations', '...')
.option('--pricing-team', 'Include team-cost reference (no calculator)')

// ── runEstimate guide opts ──
const guideOpts = {
  brief: opts.brief,                                  // true | string | undefined
  topics: TOPICS.filter(t => opts[t] === true),       // canonical order → R13
  pricingTeam: opts.pricingTeam === true,
  scopeFicha: true,                                   // R9 always-on, internal only
};
```

```js
// ── Marker handling (only deviation from naive replace, justified by R12) ──
// template line: {{OPTIONAL_SECTIONS}} (alone) between INFRA-CANVAS and ## Estructura de Discusión
template.replace(/^\s*\{\{OPTIONAL_SECTIONS\}\}\s*$/gm, sections);
// sections === '' → marker line vanishes → byte-identical legacy
```

Ficha shape: `## Alcance: ¿Aplica en esta fase?` + `| Tema | Estado |` table, 6 rows, `evidence` as one-line note.

## Status Rules (topic → status)

1. canvas null (missing) → `Indeterminado (revisar)` ("canvas ausente").
2. topic's relevant region holds `[Responde aquí]` → `Indeterminado (revisar)` ("sección sin completar").
3. any signal keyword matches (case-insensitive, in region or decisions) → `Aplica` (evidence = matched keyword).
4. else → `No aplica según lo documentado` ("sin señales en lo documentado").

| Topic | Regions | Signals (case-insensitive) |
|-------|---------|----------------------------|
| roles | PROJECT + decisions | equipo, junior, senior, roles, dedicación, full.?time, part.?time |
| multi-tenant | INFRA §1/§2 + decisions | tenant, multi.?tenant, organización, workspace, aislamiento, RLS |
| transactions | INFRA §1 + decisions | transaccion, ACID, pagos, payment, wallet, saldo, ledger, checkout, stripe |
| security | INFRA §2/§4 + decisions | auth, oauth, jwt, sso, mfa, 2fa, rbac, gdpr, encript, secret, api.?key, rate.?limit |
| concurrency | INFRA §1/§4 + decisions | concurrenc, race, lock, queue, cola, worker, redis, shard, eventu, retry, backpressure |
| integrations | PROJECT + decisions | integraci, webhook, api.?externa, third.?party, stripe, slack, salesforce, crm, erp |

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `funky-cli/src/utils/estimateTopics.js` | Create | TOPICS/DISPLAY_NAMES/STATUS + `surfaceEstimateTopics` |
| `funky-cli/src/templates/estimate/brief-questions-template.md` | Create | `## Brief Funcional` + product/user/MVP/complexity/integrations/timeline questions |
| `funky-cli/src/templates/estimate/team-cost-reference-template.md` | Create | rol×seniority×dedicación×duración, 1-dev & team models, phases table; reference only |
| `funky-cli/src/templates/estimate/topics/{roles,multi-tenant,transactions,security,concurrency,integrations}.md` | Create (6) | `## {Display Name}` + cost-impact bullets |
| `funky-cli/src/templates/estimate/pricing-guide-template.md` | Modify | add `{{OPTIONAL_SECTIONS}}` line after INFRA-CANVAS |
| `funky-cli/src/utils/estimateDomain.js` | Modify | 4th `opts` + 4 helpers |
| `funky-cli/src/commands/estimate.js` | Modify | 8 options, guideOpts build, suggestions, summary lists sections |
| `funky-cli/tests/estimate.test.js` | Modify | new describe blocks; existing stay green |
| `docs/funky-forge/estimate.md` | Modify | flags table + outputs |

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | legacy compat | 3-arg and `{}` both byte-equal expected legacy (marker-stripped template); 3-arg === 4-arg `{}` |
| Unit | `surfaceEstimateTopics` | 6 states per topic: Aplica / No aplica / Indeterminado (unfilled region) / Indeterminado (missing canvas); case-insensitivity; decisions-text signals |
| Unit | helpers | brief no-value/value/missing-file (usedFallback), fragments empty/subset/canonical order/missing→throw, team-cost, ficha renders 6 rows |
| Integration | CLI per flag | `--security --roles` → both fragments; no flags → no topics but ficha present; `--pricing-team` → section; `--brief missing.md` → warn + checklist + exit(0) |
| Integration | suggestions (R11) | signal + no flag → `Considerá --flag` on stdout; flag set → no suggestion |
| Integration | determinism (R13) | same inputs+flags twice → byte-identical |
| Integration | living templates (R14) | edit mocked fragment → guide reflects edit |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. `--brief <path>` is plain user-input file read, same class as existing `--context <path>` (no execution).

## Migration / Rollout

No data migration. Rollback per proposal: revert `generatePricingGuide` to 3 args, drop the 8 options, delete `estimateTopics.js` + 8 new templates. Marker addition is the only legacy-shape change and is masked by the line-strip regex.

## Open Questions

- Keyword sets are v1 defaults; team may tune them later — tests lock current sets.
- Final Spanish copy of the 6 topic fragments and ficha intro is apply-phase work (structure fixed here).

## Notes

`openspec/config.yaml` does not exist in this repo — no `rules.design` constraints to apply.
