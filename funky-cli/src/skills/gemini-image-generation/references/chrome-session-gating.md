# Chrome session gating

Decide whether to reuse the running Chrome before touching it. Relaunching a browser
that is already serving the page is the single most common source of friction in this
skill: Chrome shows its "no se cerró correctamente / restaurar páginas" popup, the user
loses their tabs, and `--force-renderer-accessibility` is not even applied because the
new process attaches to the existing one.

## 0. Precondition: the Orca app must be running

The Orca desktop app hosts the local computer-use server. If a command answers
`Orca is not running. Run 'orca open' first.`, run `orca open --json`, wait, and retry
once. This session does not need to live inside Orca. If it still fails, stop and report.

## 0.1 Environment assumptions — Windows, Spanish UI

Every label in these recipes is Gemini's **Spanish** interface on **Windows**: `chrome.exe`
under `Program Files`, `%TEMP%` and `USERPROFILE`, PowerShell for the encoding guard, and the
native `Cuadro de diálogo Abrir` / `Guardar como` pickers. Nothing depends on screen
resolution, window size, coordinates or `scale`: matching is by label only, so a different
monitor changes nothing.

**Preflight, before touching the composer.** Confirm one known ASCII label exists on a
readable tree — `Enviar mensaje` is a good probe. Interpret the result in this order:

| Observation | Diagnosis | Action |
| --- | --- | --- |
| Tree mangled (see `gemini-download-recipe.md` section 0) | Encoding failure | Stop and report the encoding problem |
| Tree readable, probe label absent | Another UI language, or another Gemini version | **Stop and report it. Don't retry** |
| Probe label present | Assumptions hold | Proceed |

On a locale mismatch **stop and report it. Don't retry** with other fragments, another
language, or guessed labels. Say which label was expected, what the tree actually showed,
and suggest adapting this skill to the machine's own conditions — its UI language, its
operating system, its dialog labels — instead of forcing these. Retrying a locale mismatch
burns the run and produces a wrong diagnosis.

## 1. Probe before launching

```bash
orca computer list-windows --app chrome --json
```

- `ok: false` with `app_not_found` means no Chrome window is visible to computer-use, even
  if `Get-Process chrome` shows background processes. Go to step 4.
- A window is listed: keep its `index` and `id`, then read the tree.

```bash
# bash
STATE="${TMPDIR:-/tmp}/orca-gemini-state.json"
orca computer get-app-state --app chrome --session gemini --restore-window --json > "$STATE"
```

```powershell
# pwsh
$state = Join-Path $env:TEMP 'orca-gemini-state.json'
orca computer get-app-state --app chrome --session gemini --restore-window --json > $state
```

Write the tree **outside the project**. Never redirect it into the working directory: it
becomes an untracked file in someone else's repository. Any disposable path outside the
workspace works; the two forms above are just the ones that resolve on Windows in each shell.

## 2. Classify the tree

Read `result.snapshot.treeText` from the file, never print whole trees into context.

| Observation | Meaning | Action |
| --- | --- | --- |
| `documento`, `botón`, `editar` nodes from the page present (roughly 120+ nodes) | Usable | Reuse. Never launch Chrome |
| Roughly 40 nodes, stops at the toolbar, no page content | Blind: the accessibility flag was not active at process start | Ask the user before restarting |
| Window exists but the page is on an unrelated URL | Usable browser | Navigate that window to Gemini |

## 3. Usable browser

- Do **not** run `Start-Process chrome.exe`. The flag cannot be applied after process
  start, and launching anyway only risks the crash popup.
- If the current tab is not Gemini, navigate to `http://gemini.google.com/?hl=es-MX` in it.
- Keep one `--session` name (for example `gemini`) for the whole run: element indexes are
  only valid inside the session that produced them.

## 4. Launch only when there is no usable window

```powershell
$c = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
if (-not (Test-Path $c)) { $c = 'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe' }
Start-Process $c -ArgumentList '--force-renderer-accessibility', 'http://gemini.google.com/?hl=es-MX'
Start-Sleep -Seconds 6
orca computer list-windows --app chrome --json
```

Use the Windows path, not the bash `/c/Program Files/...` form: these commands run in
pwsh and the bash path does not resolve. Re-run the step 1 probe afterwards.

## 5. The restore popup

If Chrome shows a "restaurar páginas" / "restore pages" bar or dialog:

- Do not click restore, close, or dismiss it by clicking the bar itself. A stray click
  there can reload the session and throw away the current chat.
- Work in the tab that is already open. The popup does not block the accessibility tree.
- Mention it once in the final report so the user knows why it appeared.

## Known false negatives

- **Actions return a diff, not a tree.** `set-value`, `click` and the other actions answer
  with a snapshot whose `treeText` lists only the lines that changed, prefixed `~`. Searching
  that text for the *next* control fails with "label not found" even though the control is
  present. Pass `--full-tree` to the action, or call `get-app-state` again, before looking
  for another element.
- A click on a web control can report `unverified (suspected noop)`. Do not repeat it;
  re-read the tree, because the effect may be real.
- `app_not_found` for `chrome` while `Get-Process chrome` lists processes means those
  processes have no window. It is not evidence that Chrome is usable.
