---
name: sdd-release
description: "Trigger: No aplica en antigravity. Release en opencode + gentle-ai, tag, version bump, publicar release. Post-archive release workflow: version bump, release notes, git tag."
---

# SDD Release

Post-archive release workflow. Handles version bump, release notes, and git tag.

## When to use

After `sdd-archive` completes, the orchestrator suggests running this skill if the change warrants a release. The user decides.

**Suggest release when:**
- Change includes new features (MINOR bump)
- Change includes breaking changes (MAJOR bump)
- Change includes significant fixes (PATCH bump)
- User explicitly asks for a release

**Skip release when:**
- Change is docs-only or internal refactoring
- User says "no release" or "skip"
- Change was already released

## Steps

### 1. Determine version bump

Read `package.json` (or equivalent version file) and determine bump type:

| Change type | Bump | Example |
|-------------|------|---------|
| New feature | MINOR | 2.5.1 → 2.6.0 |
| Breaking change | MAJOR | 2.5.1 → 3.0.0 |
| Bug fix | PATCH | 2.5.1 → 2.5.2 |

Ask the user to confirm if ambiguous.

### 2. Generate release notes

Create release notes following the project's format. Use this template:

```markdown
# vX.Y.Z Release Notes

## Summary

[1-2 sentences describing what changed and why]

## What Changed

- **[Category]:** [Description of change]
- **[Category]:** [Description of change]

## Files Modified

- `path/to/file` — [what changed]
- `path/to/file` — [what changed]

## Guardrails

- [Any preserved behavior or safety measures]

## Learnings

- [Key discoveries from this change, if any]
```

Save to `docs/releases/vX.Y.Z-release.md` (or project's release notes location).

### 3. Update version and root README

- Bump version in `package.json`
- Update version references in the root `README.md`
- Update any other version references in docs if applicable

### 4. Update ORCHESTRATOR-STATE.md

- Update the version entry and release status in `ORCHESTRATOR-STATE.md`
- Mark the release as completed with the new version and date

### 5. Git operations

```bash
git status                          # Confirm clean
git add -A
git commit -m "chore: release vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin main --tags
```

### 6. Verify

- [ ] Version bumped in package.json
- [ ] Root README.md updated with new version
- [ ] ORCHESTRATOR-STATE.md updated
- [ ] Release notes created
- [ ] Git tag created and pushed
- [ ] No uncommitted changes

## Rules

- ALWAYS confirm version bump type with user before proceeding
- ALWAYS create release notes BEFORE git tag
- NEVER force-push tags
- NEVER skip the git status check
- If user says "skip" or "no release", stop immediately
