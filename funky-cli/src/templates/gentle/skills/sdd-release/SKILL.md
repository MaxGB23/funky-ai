---
name: sdd-release
description: "Trigger: Release en opencode + gentle-ai, tag, version bump, publicar release. Post-archive release workflow: version bump, release notes, git tag, publicar release en GitHub con gh."
license: Apache-2.0
metadata:
  author: "MaxGB23"
  version: "1.0"
---

# SDD Release

Post-archive release workflow. Handles version bump, release notes, git tag, and GitHub release publication.

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

Create release notes following the project's format. Use the template if it exists:

`.agents\templates\sdd\release-notes.md`

If the template is missing, derive the notes from the conventional commits since the last release:

```bash
git log --oneline <ultimo-tag-anterior>..HEAD
```

Group commits by conventional type (feat, fix, docs, refactor, chore) and summarize the user-visible changes.

Save to `<ruta-docs-del-proyecto>/releases/vX.Y.Z-release.md`

### 3. Update version and root README

- Bump version in `package.json`
- Update version references in the root `README.md`
- Update any other version references in docs if applicable

### 4. Update ORCHESTRATOR-STATE.md

- view_file and Update the content of `ORCHESTRATOR-STATE.md`
- Mark the release as completed with the new version and date

### 5. Git operations

```bash
git status                          # Confirm clean
git add -A
git commit -m "chore: release vX.Y.Z"
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin main --tags
```

### 6. Publish GitHub release

The generated release notes (step 2) are the release body. Publish them with the SAME tag used in step 5:

```bash
gh auth status                      # Verify authenticated before creating
gh release create vX.Y.Z \
  --title "vX.Y.Z" \
  --notes-file <ruta-docs-del-proyecto>/releases/vX.Y.Z-release.md
```

- The release is named after the TAG (`vX.Y.Z`); the commit message is never used as the release name.
- The release title is the bare version (`vX.Y.Z`), without the project name.
- `--notes-file` publishes the exact markdown file generated in step 2. Do NOT use `--generate-notes` here — the curated notes are the source of truth.
- If the release already exists (e.g. tag pushed earlier), update it instead: `gh release edit vX.Y.Z --title "vX.Y.Z" --notes-file <ruta-docs-del-proyecto>/releases/vX.Y.Z-release.md`
- If `gh` is not installed or not authenticated, STOP and surface that to the user — do not skip the GitHub release.

### 7. Verify

- [ ] Version bumped in package.json
- [ ] Root README.md updated with new version
- [ ] ORCHESTRATOR-STATE.md updated
- [ ] Release notes created
- [ ] Git tag created and pushed
- [ ] GitHub release created with the exact notes file
- [ ] No uncommitted changes

## Rules

- ALWAYS confirm version bump type with user before proceeding
- ALWAYS create release notes BEFORE git tag
- ALWAYS publish the GitHub release with the exact notes file generated in step 2
- NEVER force-push tags
- NEVER skip the git status check
- NEVER create a GitHub release without checking `gh auth status`
- If user says "skip" or "no release", stop immediately
