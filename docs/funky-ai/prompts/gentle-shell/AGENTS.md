# Global instructions

## Working rules
Require explicit authorization before implementing (including through workers) or committing.
Recommendations, reviews, comparisons, and questions are not authorization; answer first and wait.
Only an explicit session instruction overrides this.

## Repository policy
When creating issues or pull requests, follow the target repository's rules — `CONTRIBUTING.md`, templates, policy scripts, and CI gates — over your defaults. Use the relevant issue / PR skills.

## Commits
Use English Conventional Commits.
One commit = one work unit (behavior, fix, or docs), never split by file type. Consult the work-unit-commits skill when planning commits.
Avoid squash merging: preserve history whenever possible, and squash only when the user approves it or the repository requires it.

## Destructive actions
Before deleting, force-pushing, rewriting remote state, or overwriting files outside the authorized scope, resolve the scope explicitly: specify the project, path, or branch and list affected targets. If any target was not named in the request, stop and ask.

## Review authority (RDD)
- `assess` (explicit `baseRef` + `committedOnly`) per candidate, before saying "done" or delivering; `reviewDue: false` does not absolve an open lineage.
- A lineage not `approved` and burned is the human's open work: record it in the feature document with its lineage and the continuation the provider named. Never retry, reset, recover, or abandon it, and never answer its consent.
- On "Native preflight is unavailable" or "cancelled or timed out": seat the slice base with `assess {"baseRef":"<full commit>","committedOnly":true}` — that call also seats the range hint the gate needs, and a short sha or a branch name does not — then issue the delivery as **one bare command**: no `cd`, no redirection, no pipe.
- Any other refusal: quote the text verbatim and stop. Never disable the switch, prune the store, raise the cap, or retry variants.

## Windows shell facts (Git Bash + this harness)
Probed on this machine. Verify before assuming; these failures are silent: exit 0 does not
mean the file went where bash looks.
- **Native CLI paths.** Use native-resolvable paths for native programs. Verify file locations when crossing shell boundaries.
- **Multi-line text.** Use files, heredocs, or the tool's write operation instead of fragile shell quoting.
- **No Python.** `python`, `python3` and `py` are all the Microsoft Store stub: exit 49 with a
  "Microsoft Store" message. Do not retry variants or assume an interpreter exists. Use `node`
  or Git Bash coreutils, or ask before installing.
- **POSIX paths are bash-only.** Inside native programs (node, go, php, .NET) `/tmp` resolves to
  `<drive-of-cwd>:\tmp` and `/c/...` to `<drive>:\c\...`. Use `os.tmpdir()` / `%TEMP%`, or
  `C:/...` with forward slashes, then prove the location with the same tool family that wrote it.
- **Native programs emit the console codepage** (`chcp` = 850 here), while this tool decodes
  UTF-8: non-ASCII output arrives mojibake, and Python's piped stdout raises
  `UnicodeEncodeError`. Emit UTF-8 explicitly (`python -X utf8`, `PYTHONIOENCODING=utf-8`) and
  prefer ASCII markers in output (`OK`, `FAIL`, `->`). Accents are not safe either.
- **Bash arguments** use forward slashes; cmd builtins need `cmd //c` (double slash).
- **When output looks wrong**, probe instead of guessing: `chcp; command -v python; echo "$TEMP"`.
