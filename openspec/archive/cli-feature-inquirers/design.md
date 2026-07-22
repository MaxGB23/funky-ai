# Design: CLI Feature Inquirers — Interactive Template Injection

## Technical Approach

Modify `feature.js` to run 3 `@clack/prompts` inquirers in the Commander `.action()`, then pass the results into a restructured `runFeature()` that uses a tier-conditional injection matrix to determine which templates to copy. Create 2 new checklist templates (`docs.md`, `release.md`).

## Architecture Decisions

### Decision: Inquirer placement (CLI action vs pure function)

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Inquirers inside `.action()`, results passed to `runFeature()` | Follows `init.js` pattern; `runFeature()` stays pure/testable | **Chosen** |
| Inquirers inside `runFeature()` | Couples I/O to logic; breaks test pattern | Rejected |

### Decision: Injection matrix data structure

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Nested object `{ tier: { files[], conditional: [] } }` | Readable; easy to add new tiers | **Chosen** |
| 2D lookup table | Compact but harder to extend | Rejected |
| If/else branches per tier | Fragile, no single source of truth | Rejected |

### Decision: `runFeature()` signature change

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Add optional `injectionParams` to existing opts | Backward compatible; tests without params still work | **Chosen** |
| Separate `runFeatureWithInquirers()` function | Duplicates logic | Rejected |
| Replace opts entirely | Breaks all existing tests | Rejected |

### Decision: New files always injected vs conditional

`docs.md` and `release.md` are NOT in the unconditional list. They are always conditionally gated. The unconditional base list becomes:

```
tasks.md, report.md, apply.md, verify.md, planning-handoff.md
```

All other files are tier-conditional.

## Data Flow

```
User runs `funky feature auth-login`
  │
  ▼
Commander .action() invoked
  │
  ├─ p.group() ──→ 3 inquirers: tier, docsImpact, releaseType
  │     │              │ onCancel → p.cancel() + process.exit(1)
  │     ▼
  │  { tier, docsImpact, releaseType }
  │
  ▼
runFeature({ featureName, cliTemplatesDir, cwd, injectionParams })
  │
  ├─ sanitize name
  ├─ resolve templates (Golden vs Fallback)
  ├─ create feature dir
  ├─ build conditional file list via INJECTION_MATRIX
  │     └─ Base files (always) + tier files + docs/release conditionals
  ├─ copy files that exist in template source
  └─ return { success, path }
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `funky-cli/src/commands/feature.js` | Modify | Add `@clack/prompts` import, inquirer group in `.action()`, `INJECTION_MATRIX` const, restructure `runFeature()` to accept `injectionParams` |
| `funky-cli/src/templates/sdd/docs.md` | Create | Docs checklist template for orchestrator |
| `funky-cli/src/templates/sdd/release.md` | Create | SDD release checklist (distinct from `src/templates/release.md`) |
| `funky-cli/tests/feature.test.js` | Modify | Update tests for conditional file counts, add tests for each tier, mock `@clack/prompts` |

## Interfaces / Contracts

### `runFeature()` new signature

```js
/**
 * @param {object} opts
 * @param {string} opts.featureName
 * @param {string} opts.cliTemplatesDir
 * @param {string} opts.cwd
 * @param {object} [opts.injectionParams] - Optional. When omitted, copies all 9 base files (backward compat).
 * @param {string} opts.injectionParams.tier - 'T1' | 'T2' | 'T3'
 * @param {boolean} opts.injectionParams.docsImpact - true if user wants docs.md
 * @param {string} opts.injectionParams.releaseType - 'None' | 'Patch' | 'Minor' | 'Major'
 * @returns {{ success: boolean, error?: string, path?: string, copiedFiles?: string[] }}
 */
```

### INJECTION_MATRIX constant

```js
const BASE_FILES = ['tasks.md', 'report.md', 'apply.md', 'verify.md', 'planning-handoff.md'];

const TIER_FILES = {
  T1: [],                                           // No explore/proposal/spec
  T2: ['explore.md', 'proposal.md', 'spec.md'],    // SDD ligero
  T3: [],                                           // Workflows aislados
};

const INJECTION_MATRIX = {
  T1: { extra: [],                                  docs: true,  release: false },
  T2: { extra: ['explore.md', 'proposal.md', 'spec.md'], docs: true, release: true },
  T3: { extra: [],                                  docs: true,  release: true  },
};
```

### Injected files resolution logic

```js
function resolveFiles(injectionParams) {
  if (!injectionParams) {
    // Backward compat: return old hardcoded list
    return [...BASE_FILES, 'explore.md', 'proposal.md', 'design.md',
            'spec.md', 'planning-handoff.md', 'report.md', 'apply.md', 'verify.md'];
  }
  const { tier, docsImpact, releaseType } = injectionParams;
  const tierConfig = INJECTION_MATRIX[tier];
  const files = [...BASE_FILES, ...tierConfig.extra];
  if (docsImpact) files.push('docs.md');
  if (tierConfig.release && releaseType !== 'None') files.push('release.md');
  // design.md is always excluded (created by sdd-design phase, not CLI)
  return files;
}
```

### Inquirer group (inside `.action()`)

```js
const answers = await p.group(
  {
    tier: () => p.select({
      message: '¿Qué tier de cambio es?',
      options: [
        { value: 'T1', label: 'T1 — Fix / Hotfix / Cambio trivial' },
        { value: 'T2', label: 'T2 — Feature / SDD ligero' },
        { value: 'T3', label: 'T3 — Feature compleja / Archivo viviente' },
      ],
    }),
    docsImpact: () => p.confirm({
      message: '¿Este cambio afecta documentación pública?',
      initialValue: false,
    }),
    releaseType: () => p.select({
      message: 'Tipo de release:',
      options: [
        { value: 'None',  label: 'None — Solo interno' },
        { value: 'Patch', label: 'Patch — Fix compatible' },
        { value: 'Minor', label: 'Minor — Feature nueva' },
        { value: 'Major', label: 'Major — Breaking change' },
      ],
    }),
  },
  {
    onCancel: () => {
      p.cancel('Operación cancelada.');
      process.exit(1);
    },
  }
);
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `resolveFiles()` with each tier × docs × release combo | Extract to testable function; pure logic, no fs mock needed |
| Unit | `runFeature()` backward compat (no injectionParams) | Mock fs, verify 9 files copied (existing test, minimal change) |
| Unit | `runFeature()` with injectionParams per tier | Mock fs, verify correct file counts per tier matrix |
| Unit | `runFeature()` existing-already-exists guard | Existing test, unchanged |
| Unit | `runFeature()` sanitization | Existing test, unchanged |
| Integration | Inquirer flow mocked | Mock `@clack/prompts`, verify `runFeature()` receives correct params |

### Test matrix for injection

| Tier | docsImpact | releaseType | Expected files |
|------|-----------|-------------|----------------|
| T1 | false | None | 5 (base only) |
| T1 | true | None | 6 (+docs.md) |
| T2 | false | None | 8 (base + explore, proposal, spec) |
| T2 | true | Patch | 10 (base + explore, proposal, spec, docs, release) |
| T3 | false | None | 5 (base only) |
| T3 | true | Minor | 7 (base + docs, release) |

## Migration / Rollout

No migration required. The `injectionParams` parameter is optional — existing callers and tests that don't pass it get the old 9-file behavior. The `design.md` file is deliberately excluded from the unconditional list since it's created by the `sdd-design` phase.

## Open Questions

- [ ] Should `design.md` ever be in the CLI injection list? (Proposal says no — created by sdd-design. Confirmed: exclude.)
