# Chrome and Gemini upload recipe

Verified on Windows with Orca 1.4.255 and provider `orca-computer-use-windows` 1.0.0.
`orca` below is the Orca CLI. Keep one `--session` name for the whole run: element
indexes are only valid inside the session that produced them, and a fresh invocation
without `--session` opens a new snapshot namespace.

Read `chrome-session-gating.md` first. Do not launch Chrome when a usable window exists.

In **PowerShell**, start every inspection shell with the UTF-8 guard from
`gemini-download-recipe.md` section 0. Without it, labels containing `ó` or `ñ`
(`instrucción`, `tamaño`) arrive as box-drawing garbage and every lookup misses. In a shell
that already decodes UTF-8 (bash on this host) the guard is unnecessary. Where a control can
be found by an ASCII fragment (`Enviar`, `Guardar`, `Abrir`, `Cancelar`, `Subir archivos`),
prefer the fragment.

## 1. Start a new conversation

Every image gets its own chat. Two images in one chat means the second generation carries
the first instruction and its output as context, which corrupts the result.

1. Read state:

   ```bash
   STATE="${TMPDIR:-/tmp}/orca-gemini-state.json"   # bash; pwsh: $state = Join-Path $env:TEMP "orca-gemini-state.json"
   orca computer get-app-state --app chrome --session gemini --restore-window --json > "$STATE"
   ```

2. Find the new-conversation control in the tree and click it by label, not by index.
   Spanish UI candidates, in order: `Nueva conversación`, `Nuevo chat`, `Nueva consulta`.
   This file owns the new-chat label; the SKILL.md pointer is not authoritative for it:

   > **Verified new-chat label:** `vínculo Nuevo chat`, Value `https://gemini.google.com/`
   > (verified on this environment, twice, in the same run). A second identical node with
   > Value `https://gemini.google.com/app` also exists; either works. Both clicks returned
   > `ok: true` and the following chat held exactly one `user-query-content-0` group.

   Do not rewrite this block mid-run. If the observed label differs, continue with the
   documented path and report the difference; correcting this text is a separate change.

3. If no such control is reachable, fall back to navigating the window to
   `https://gemini.google.com/app` and re-reading state.

4. **Verify the reset structurally, not just by the empty composer.** An empty editor is a
   weak signal: it also reads empty in an old conversation whose composer was never filled.
   Confirm the newness instead:

   - the tree contains **zero** `grupo user-query-content-<n>` nodes, and
   - the tree contains **no** `título Tú dijiste`.

   A fresh Gemini chat has none of either; any prior turn leaves them. If one survives, the
   reset failed: retry the new-chat step once, then report the failure instead of
   overwriting silently. Record which control you clicked: `Nuevo chat` is a sidebar link,
   and a click can report success while the SPA never routes.

   `user-query-content-<n>` is a DOM class, so a Gemini redesign can rename it. If it
   disappears entirely while existing chats clearly still contain turns, fall back to the
   empty-composer check alone and say in the report that the structural check was
   unavailable.

The stale-text failure is real and was observed: a previous run left
`Adapta esta imagen a un tema claro (light theme).` sitting in the composer.

## 2. Attach one image

The labels below are Gemini's Spanish UI. Match by label text, not by index, because
indexes shift as nodes are added or removed.

1. Click `botón Cargas y herramientas` (the `+` next to the composer).
2. A `menú Opciones del menú` opens. Click `elemento de menú Subir archivos. ...`.
3. Gemini shows its own `diálogo Creación de contenido a partir de imágenes y archivos`
   with `botón Cancelar` and `botón Aceptar`. Click `botón Aceptar`.
4. The Windows file picker opens and merges into the Chrome window tree, which grows
   from about 130 to about 340 nodes. It exposes `Cuadro de diálogo Abrir`,
   `editar Nombre de archivo:`, `cuadro combinado Tipo de archivo:` and `botón Abrir`.

   **The picker renders asynchronously.** A snapshot taken immediately after the click on
   `elemento de menú Subir archivos` does not contain the dialog yet, and reading it too
   early fails with "label not found". Poll on a wall-clock bound of about 20 s until the
   dialog appears, then look for the name field. Apply the mojibake check from the download
   recipe before concluding the dialog is absent, and allow one `--full-tree` re-read first.

   `Cuadro de diálogo Abrir` has **no unique ASCII fragment**: `Abrir` also matches
   `botón Abrir`. This presence check therefore depends on the UTF-8 guard being active.
5. Write the absolute path into the filename field, without focusing anything:

   ```bash
   orca computer set-value --app chrome --session gemini \
     --element-index <editar Nombre de archivo:> --value '<absolute-image-path>' --no-screenshot --json
   ```

6. Click `botón Abrir`. The dialog closes and the tree drops back to the page.

The picker opens in the user profile directory, so the absolute path is what avoids
navigating folders. If `set-value` on the filename field is refused, the fallbacks are a
`drag` from an `explorer` window, or a clipboard paste, in that order.

### Fragile sources

A path under `%TEMP%` (for example an Orca paste artifact `orca-paste-*.jpg`) can vanish
between runs, and the file picker has no recovery from a dead path. Copy it to a stable
directory first and attach the copy.

## 3. Verify the attachment

```bash
STATE="${TMPDIR:-/tmp}/orca-gemini-state.json"   # bash; pwsh: $state = Join-Path $env:TEMP "orca-gemini-state.json"
orca computer get-app-state --app chrome --session gemini --restore-window --json > "$STATE"
```

A successful attach adds one `botón cerrar archivo adjunto` per image, plus a thumbnail in
the composer. Count them and compare against the number of images you intended to attach.
One image per chat means the expected count is exactly one.

## 4. Write the instruction

```bash
orca computer set-value --app chrome --session gemini \
  --element-index <editar Ingresa una instrucción para Gemini> \
  --value "$INPUT_USUARIO" --no-screenshot --json
```

The returned diff must show the editor holding the new value. The send button
`botón Enviar mensaje` becomes enabled.

**Long instructions produce a false `verification_failed`.** The tree truncates the node's
`Value` at roughly 539 characters while the verifier compares against the whole string. The
certificate prompt is 1107 characters, so that flow reports failure on every correct write.

Judge the write by, in this order:

1. `result.action.verification.expected` and `actualPreview` in the returned JSON.
2. The `Value` of the **last** `editar Ingresa una instrucción para Gemini` node, read with
   `--full-tree`, stripped of any truncation marker, compared as a prefix against the first
   ~500 characters of the instruction.

Never accept the write because the node exists: it exists with the placeholder too. Never
search `treeText` for the instruction as a substring: an earlier turn re-renders as
`título Tú dijiste` plus `texto` and would match a chat that already sent it.

## 5. Send

Click `botón Enviar mensaje`. Do not ask for confirmation: the user accepted that each run
spends a real generation, and this flow no longer stops before sending.

Then continue with `gemini-download-recipe.md`.

## Known false negatives

- `set-value ""` reports `verification_failed` even when the field cleared, because the
  verifier compares against the empty string while the field shows its placeholder.
  Read the returned `treeText` instead of trusting the status.
- A click on a web control can report `unverified (suspected noop)`. Do not repeat it;
  re-read the tree, because the effect may be real.
