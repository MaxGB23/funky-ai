# Post-process — reach a past result, prove it, share it

Read-only by design. This flow never attaches, writes or sends anything.

## 1. Locate the chat

The sidebar exposes `botón Activar o desactivar Todas`, then a `navegación Chats recientes`
container holding one `vínculo <title>` per chat. Each carries its URL in `Value:` as
`https://gemini.google.com/app/<id>?hl=...`.

- Strip every `?` suffix before comparing ids.
- `botón Buscar chats` is the fallback when the target is not in the rendered list.
- If the chat is still absent after one `--full-tree` re-read, ask. Never guess from a
  similar-looking title.

## 2. Never trust the title

Titles are auto-generated from the instruction, not from the image, and near-identical for
the same kind of request (`Edición de Foto para Documento` beside `Edición de Foto para
Certificado`). Two different people's photos can sit under indistinguishable titles.

## 3. The identity gate is the chat id

After clicking a sidebar link, a success result does not prove the app routed. Read once and
require the id in `documento` or the address bar to equal the id from the sidebar `Value`.
On mismatch: re-read once, then stop and ask.

Id equality is the only deterministic identity the tree offers. Record it in the report.

## 4. The screenshot is corroboration, not proof

`get-app-state` returns `result.screenshot.path`, a window-sized PNG in `%TEMP%` that
expires in about a day. It is **null** when `--no-screenshot` was passed.

Use it to corroborate, never as the gate:

- The capture is the desktop region under the window bounds. An occluded window, or one on
  another virtual desktop, returns foreign pixels. If it looks wrong, bring the window
  forward once and re-read; never conclude identity from an occluded capture.
- In that capture a generated image is a thumbnail, and portraits of two different people
  look alike at that size.
- Before sharing a link to someone's photo, ask the human to confirm the face. This is not
  optional: publishing the wrong person's photo is not recoverable by deleting a file.

## 5. Then act

- **Share**: `§6` of `gemini-download-recipe.md`.
- **Download**: the same recipe, including its save-dialog branch.

There is no third action. This flow does not generate, retry or continue an old chat: an
instruction sent here inherits the chat's earlier turns and corrupts the result.

## 6. Leaving

Navigate to `Nuevo chat`, verify the editor is empty and that the tree holds zero
`grupo user-query-content-<n>`, then start the generation loop. Do not reuse the visited
chat for a new image.
