---
name: gemini-image-generation
description: "Trigger: fotos certificado, foto certificado, certificar foto, foto para tramite, imagen para documento, adaptar imagen, generar imagen, editar foto. Chrome + Gemini end to end: fresh chat per image, upload, send, wait, download."
license: Apache-2.0
metadata:
  author: "MaxGB23"
  version: "2.3"
---

## Activation Contract

Use for any request to produce, transform or retrieve an image with Gemini through Chrome:
certificate and document photos, style conversions, edits, or any generate/adapt request.

| Placeholder | Default | Meaning |
| --- | --- | --- |
| `{{INPUT_USUARIO}}` | required | Instruction Gemini receives |
| `{{IMAGENES_ADJUNTAS}}` | none | Absolute image paths |
| `{{DESTINO}}` | `<project-root>/images` | Where results land |
| `{{ESPERA_MAX}}` | `300` | Seconds from the send click to the last useful read |
| `{{COMPARTIR}}` | `no` | Publish and copy a share link |

A type named below uses its prompt file verbatim as `{{INPUT_USUARIO}}`:

| Type | Prompt |
| --- | --- |
| `fotos-certificado` | `references/prompts/fotos-certificado.md` |

## Hard Rules

- **The Orca desktop app must be running.** Precondition and recovery: `references/chrome-session-gating.md` §0-§0.1.
- Never invent `{{INPUT_USUARIO}}`; if missing or ambiguous, ask once and stop.
- **One image per conversation, always a fresh chat.** `N` images means `N` sequential chats.
- Never attach an unconfirmed image; confirm one chip per image.
- Never claim a result before the file is on disk with a stable, non-zero size.
- `set-value` for text fields, `--restore-window` on the first read only, one `--session` throughout.
- **Image or quota limit reached: stop.** Report the message and how many images succeeded; ask the human. No retry, no resend, no account or model switch, no deleting chats to free quota.
- **Never edit this skill while a run is in flight.** If a label differs from the documented one, continue on the documented path with ASCII fragments, and report the label, the tree excerpt and the expectation. Recording a verified label, or adding a prompt type, is a separate change made after the final report and only when the human asked for it.
- **A mangled tree is not a slow generation.** Stop when a suspicious codepoint appears (U+2500-U+257F box drawing, U+FFFD, U+00C3, U+00C2) **and** a documented fragment fails to match in the same read. Report an encoding failure instead of polling.
- **A click index comes only from a full read taken immediately before it.** Never reuse an index from a `~` diff line, and re-read when the target label is absent or renamed, not when the node count differs.
- **Post-processing is read-only.** Reaching an old chat never attaches, writes or sends; leave with `Nuevo chat` and re-check the empty editor before any new generation.

## Decision Gates

| Situation | Action |
| --- | --- |
| Text names a limit (`límite`, `alcanzaste`, `excedido`, `cuota`) | Stop the run; ask the human |
| Bare error banner, no limit wording | This image failed; continue only if more were requested |
| Chrome state, any variant | `chrome-session-gating.md`: reuse, ask when blind, launch only when absent, ignore the restore popup |
| Readable tree, ~40 nodes, no page content | Blind surface: stop, never burn the bound |
| Image path is in `%TEMP%` | Copy to a stable path first |
| Referenced image has no path | `references/locate-image.md`; never guess |
| A dialog or control is expected | Poll per the recipe; one `--full-tree` re-read before concluding absence |
| `{{COMPARTIR}}` is `yes` | §6 of `gemini-download-recipe.md` |

## Execution Steps

1. Resolve the placeholders and create `{{DESTINO}}`. State the paths in one line.
2. Reach Chrome and Gemini per `references/chrome-session-gating.md`.
3. For each image, in order: new conversation with an empty editor; attach and confirm one
   chip; write `{{INPUT_USUARIO}}` and read it back; send; wait, download and place per
   `references/gemini-download-recipe.md`; verify size and extension.
4. Report per image, then the aggregate.

## Output Contract

Per image: source and how it was found, the chat and proof it was new, chip count, exact
text sent, whether completion was observed, the bound expired, or the generation never
started, the final path and size, the share link when requested, and every failed or skipped
check. Then one aggregate line.

## References

`gemini-upload-recipe.md` (new chat, attach, send), `gemini-download-recipe.md` (wait,
download, share), `gemini-postprocess.md` (reach and share a past result),
`chrome-session-gating.md` (Chrome and Orca preconditions), `locate-image.md` (image
lookup), `prompts/` (one prompt per type).
