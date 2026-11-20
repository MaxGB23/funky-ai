# Wait, download, and place the result

This is the step that turns a generation into a file on disk. It never assumes success.

## 0. UTF-8, mojibake, and how to match controls

This section applies to **PowerShell**. In a fresh pwsh process `orca computer ... --json`
inherits the console codepage and accented text arrives mangled (`ó` -> `├─`, `ñ` -> `▒`, or
the CP1252 form `Ã±`). A label such as `Descargar imagen en tamaño completo` then never
matches even though the control is on screen. Observed on this machine: 44 clean `botón`
nodes with the rule below, zero without it. In a shell that already decodes UTF-8 (bash on
this host), accented labels match and no guard is needed.

Every pwsh inspection shell starts with:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8
```

Then two layers, because either alone has failed:

1. The guard above, applied per shell process (it does not persist between calls).
2. Prefer an **ASCII fragment** for any control you must find: `Descargar` + `completo`,
   `Guardar`, `Abrir`, `Enviar`, `Cancelar`, `Subir archivos`. Accented labels are allowed
   only while the guard is active.

**Mojibake is a stop, not a slow generation.** Stop and report an encoding failure when a
suspicious codepoint appears (U+2500-U+257F box drawing, U+FFFD, U+00C3, U+00C2) **and** a
documented fragment fails to match in the same read. Either alone is not enough: a readable
tree can legitimately contain such a glyph, and partial corruption is the normal case.

**Uniqueness applies to clicking, not to presence.** A presence test passes with at least
one match. Before clicking, the fragments must identify one node; if several match,
disambiguate inside the newest response block using a `--full-tree` read. Stop only when
zero candidates survive one re-read.

## 1. Wait for the generation, with a bounded poll

**`{{ESPERA_MAX}}` is the only bound**, measured from the send click:
`deadline = send click + {{ESPERA_MAX}}`. The final read is diagnostic and never extends it.
SKILL.md points here; this file owns the arithmetic.

Cadence: 3 s for the first 20 s, then 5 s to 60 s, then 10 s. `--restore-window` on the
first read only; repeating it steals focus and looks like a hang. Each attempt reports its
number and what it saw.

Completion needs **two consecutive reads** agreeing: the `Detener` fragment absent **and**
`Descargar` + `completo` present. Never trust an absence on its own: run the mojibake check
from section 0 first, because a mangled tree makes every absence test pass.

Four outcomes, never collapsed into one:

| State | Meaning | Action |
| --- | --- | --- |
| Tree readable, signals absent | Still generating | Keep polling |
| Unreadable JSON or no snapshot | Caller error or broken surface | Re-read once with `--full-tree`, then stop and report |
| Suspicious codepoint **and** a fragment fails | Encoding failure | Stop now and report it; never burn the bound |
| Bound expired | Not confirmed | Report `generación no confirmada` and the last signals seen |
| Bound expired with the `Detener` fragment still present | Still generating | Report "still generating at the bound", never "failed"; ask whether to extend |

Two states must stop early, because more polling cannot fix them:

- **A blind surface**: a readable tree of about 40 nodes with no page content.
- **A limit message** (`límite`, `alcanzaste`, `excedido`, `cuota`): stop and ask the human.

Never click send again after a timeout, and never download a placeholder.

**Verified labels (first real run):** confirm them once with `get-app-state` on a new
environment before trusting them.

> **Verified stop label:** `botón Detener respuesta`. Absent once the generation ended.
> **Verified response image node:** the generated image block exposes `botón Compartir imagen`,
> `botón Copiar imagen` and `botón Descargar imagen en tamaño completo`. The uploaded source
> exposes `botón Mostrar la imagen subida en un lightbox` and `gráfico Vista previa de la imagen subida`.

`texto Creando tu imagen` is **not** a reliable signal: it was still present after the answer
and its download control had appeared, and disappeared later. Never decide completion from
it, in either direction.

## 2. Trigger the download

> **Verified download label:** `botón Descargar imagen en tamaño completo`. Spanish
> fallback candidates: `botón Descargar`, `Descargar imagen`, `Descargar`. Match by label,
> never by index. If the control sits inside a context menu, open the menu first.
>
> Match `Descargar` and `completo` as two independent ASCII fragments. The full phrase
> contains `ñ` and failed for 25 consecutive polls in a real run while the control was
> present — see section 0. The same applies to `botón Detener respuesta` only if the UI
> ever localizes it with an accent; `Detener` alone is already safe.

The control must come from the **newest response block**: by definition, the **last**
`botón Descargar imagen en tamaño completo` in tree order. The tree carries no turn ordinal
(`grupo model-response-message-content<random>` repeats per turn), so document order is the
only ranking available. If more than one candidate survives inside that block, stop and ask.
Confirm the click by a new file appearing, never by the click's own status.

**Editor overlay.** Clicking the image itself opens an editor and the tree changes shape.
Trigger the escape on **labels**, never on `elementCount`: the count tracks view state, and a
healthy page with a dialog open can sit near 67 nodes. When a dialog node or the editor's
own controls appear, press `Escape` only. Never use a bare `Cerrar` fragment: it also matches
the Chrome window close button and the sidebar collapse. After escaping, assert the document
URL is unchanged before retrying the download control once.

The click has two possible outcomes. Handle both, and poll for the dialog rather than
timing it: it renders asynchronously, the same way the file picker does in the upload
recipe.

### 2a. Chrome asks for a location (preferred)

With Chrome's "ask where to save each file" option enabled, the click opens
`Cuadro de diálogo Guardar como`. Observed controls:

| Control | Observed label |
| --- | --- |
| dialog | `Cuadro de diálogo Guardar como` |
| name field | `editar Nombre de archivo:` (prefilled, e.g. `Gemini_Generated_Image_<slug> (1).jpg`) |
| type selector | `cuadro combinado Tipo:` |
| confirm | `botón Guardar` |
| cancel | `botón Cancelar` |

1. Poll `get-app-state` on a wall-clock bound of about 20 s until the dialog appears. It
   renders late, so a single early read proves nothing. Run the section 0 mojibake check
   first, and allow one `--full-tree` re-read, before concluding the dialog is absent.
2. `set-value` the **absolute target path** into `editar Nombre de archivo:`. Windows accepts
   a full path here, so no folder navigation is needed.
3. Click `botón Guardar`.
4. Verify the dialog closed and the file exists at that exact path.

This path skips sections 3 and 4 of this recipe entirely: the destination is known before
the file exists. A same-named file already in the download directory makes Chrome suggest
`... (1).jpg`, which is harmless because the name field is overwritten.

### 2b. No dialog

The file lands in Chrome's download directory and section 3 detects it by diffing.

## 3. Fallback: find the file in the download directory

Only for outcome 2b. If step 2 opened a save dialog, the path is already known.

Diff the directory before and after the click. Never scan the disk, never guess a name.

```bash
ls -1 "$USERPROFILE/Downloads" > /tmp/before.txt      # before the click
# ... click the download control ...
sleep 3
ls -1 "$USERPROFILE/Downloads" > /tmp/after.txt
comm -13 <(sort /tmp/before.txt) <(sort /tmp/after.txt)
```

- Filter out `*.crdownload`, then require an identical size across two reads 2 s apart. A
  size that still grows is a truncated file, not a result.
- Exactly one candidate: that is the result. None: wait once more, then report the failure.
- The download directory is not guaranteed to be the default. If it is custom, ask once
  instead of scanning the filesystem.

## 4. Place it at the destination

Target: `{{DESTINO}}/<imagen-nombre>.<ext>`, created if missing.

```powershell
New-Item -ItemType Directory -Force -Path $destino | Out-Null
$target = Join-Path $destino $nombre
$i = 2
while (Test-Path $target) {
  $target = Join-Path $destino ("{0}-{1}{2}" -f $base, $i, $ext)
  $i++
}
Move-Item -LiteralPath $source -Destination $target
```

`<imagen-nombre>` resolution order:

1. The name the user gave.
2. `<source-stem>-<intent-slug>`, where the intent slug is derived from `{{INPUT_USUARIO}}`
   (for example `foto-anime`).
3. `<source-stem>` alone.

A paste artifact stem such as `orca-paste-1795123572646-d6f5c93d-...` carries no meaning.
Prefer a readable slug for those instead of propagating the temporary name.

Never overwrite an existing result silently. Never delete the source image.

## 5. Verify the file on disk

Report, with observed values:

- the final absolute path
- the byte size is greater than zero
- the extension is one of `png`, `jpg`, `jpeg`, `webp`
- the modification time is from this run

A file that fails any of these is a failure to report, not a result to present. Delete
nothing; leave the artifact in place and name its path.

## 6. Share link

Only when `{{COMPARTIR}}` is `yes`. **Opening this panel publishes a public link**, so it
never opens by default and never as a side effect of downloading.

1. Click `botón Compartir imagen`.
2. Poll on a wall-clock bound of about 20 s for
   `diálogo Vínculo público a la imagen para compartir`.
3. Read the URL from the `vínculo` node's `Value:` — `https://share.gemini.google/<id>`.
   **No click is needed to obtain it**, and the clipboard is not involved.
4. Optional, only when the URL must be on this machine's clipboard: click
   `botón Copiar vínculo`, then verify with
   `powershell -NoProfile -Command Get-Clipboard`. `orca clipboard read` does not work
   here: it reads Orca's embedded browser only and answers `browser_no_tab`.
5. Close with the `Cerrar` node **inside** the share dialog block. A bare `Cerrar` fragment
also matches the Chrome window close button and the sidebar collapse, so scope it to the
dialog.

Rules:

- Never click `Compartir en LinkedIn`, `Compartir en Facebook`, `Compartir en X`,
  `Share to Threads` or `Compartir en Reddit`.
- Always report the URL in the output, so it is usable from another device even when the
  clipboard was never touched.
- Publish only on request: the link can be deleted at `gemini.google.com/sharing`.
