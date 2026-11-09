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

## Destructive actions
Before deleting, overwriting, force-pushing, or rewriting remote state, resolve the scope explicitly: specify the project, path, or branch and list affected targets. If any target was not named in the request, stop and ask.

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
