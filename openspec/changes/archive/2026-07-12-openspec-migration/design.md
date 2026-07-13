# Design: openspec-migration

## Technical Approach

Two-phase migration to unify path references from `docs/openspec/` to `openspec/` at project root. Phase 1 modifies the 4 CLI files that create paths plus CLI templates. Phase 2 performs the directory move via `git mv` and updates all documentation/prompt references.

## Architecture Decisions

### Decision: Two separate commits

**Choice**: Phase 1 (CLI code) and Phase 2 (directory move + docs) as separate commits
**Alternatives considered**: Single atomic commit
**Rationale**: Surgical rollback; each phase is independently revertable. Phase 1 can be tested with `npm test` before the directory move.

### Decision: Remove 'docs' from path.join, not path.resolve

**Choice**: Keep path.join(cwd, 'openspec', ...) structure
**Alternatives considered**: path.resolve with hardcoded paths
**Rationale**: Maintains existing pattern; cwd-relative paths are correct for the CLI's runtime context.

### Decision: Exclude archived change artifacts from find-replace

**Choice**: Skip self-references inside `openspec/archive/*/` files
**Alternatives considered**: Replace all references including archived files
**Rationale**: Historical artifacts; breakage is acceptable and would be inconsistent to partially update.

## Data Flow

```
funky feature <name>  ──→  openspec/changes/<name>/    (was docs/openspec/changes/)
funky gentle <name>   ──→  openspec/gentle/<name>/     (was docs/openspec/gentle/)
funky init            ──→  openspec/rfcs/000-TEMPLATE.md (was docs/openspec/rfcs/)
```

## File Changes

### Phase 1 — CLI Code + Templates

| File | Line | Before | After |
|------|------|--------|-------|
| `funky-cli/src/commands/feature.js` | 30 | `// 3. Crear docs/openspec/changes/<featureName>` | `// 3. Crear openspec/changes/<featureName>` |
| `funky-cli/src/commands/feature.js` | 31 | `path.join(cwd, 'docs', 'openspec', 'changes', sanitizedFeatureName)` | `path.join(cwd, 'openspec', 'changes', sanitizedFeatureName)` |
| `funky-cli/src/commands/feature.js` | 58 | `(docs/openspec/changes/<nombre>)` | `(openspec/changes/<nombre>)` |
| `funky-cli/src/commands/gentle.js` | 30 | `// 3. Crear docs/openspec/gentle/<featureName>` | `// 3. Crear openspec/gentle/<featureName>` |
| `funky-cli/src/commands/gentle.js` | 31 | `path.join(cwd, 'docs', 'openspec', 'gentle', sanitizedFeatureName)` | `path.join(cwd, 'openspec', 'gentle', sanitizedFeatureName)` |
| `funky-cli/src/commands/gentle.js` | 55 | `(docs/openspec/gentle/<nombre>)` | `(openspec/gentle/<nombre>)` |
| `funky-cli/src/commands/init.js` | 30 | `dest: path.join('docs', 'openspec', 'rfcs', '000-TEMPLATE.md')` | `dest: path.join('openspec', 'rfcs', '000-TEMPLATE.md')` |
| `funky-cli/tests/init.test.js` | 21 | `dest: 'docs/openspec/rfcs/000-TEMPLATE.md'` | `dest: 'openspec/rfcs/000-TEMPLATE.md'` |
| `funky-cli/src/templates/sdd/tasks.md` | 79,127,129 | `docs/openspec/changes/` | `openspec/changes/` |
| `funky-cli/src/templates/README.md` | 20 | `docs/openspec/changes/` | `openspec/changes/` |

### Phase 2 — Directory Move + Docs/Prompts

| Step | Action | Target |
|------|--------|--------|
| 1 | `git mv docs/openspec/ openspec/` | Directory |
| 2 | Find-replace `docs/openspec/` → `openspec/` | 9 SDD prompts (~50 refs) |
| 3 | Find-replace `docs/openspec/` → `openspec/` | `.agents/templates/sdd/` (5 refs) |
| 4 | Find-replace `docs/openspec/` → `openspec/` | `docs/` misc docs (~20 files) |
| 5 | Find-replace `docs/openspec` → `openspec` | `scratch/run_benchmark.js` (1 ref) |

**Exclusions for Phase 2 find-replace:**
- `openspec/archive/*/` — historical artifacts, acceptable breakage
- `openspec/` itself (avoid self-references in newly moved files)

## Interfaces / Contracts

No interface changes. This is a pure path migration — all function signatures remain identical.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `runInit`, `runFeature`, `runGentle` create correct paths | `npm test` after Phase 1 |
| Manual | `git mv` succeeds cleanly | Run `git mv docs/openspec/ openspec/` |
| Verification | Zero remaining `docs/openspec` references | `rg "docs/openspec" --type md --type js` |

## Migration / Rollout

1. Phase 1 commit: CLI code + templates + test update → validate with `npm test`
2. Phase 2 commit: directory move + all doc/prompt updates
3. Rollback: `git revert` Phase 2, then Phase 1

## Open Questions

- None. All paths and line numbers verified against current codebase.