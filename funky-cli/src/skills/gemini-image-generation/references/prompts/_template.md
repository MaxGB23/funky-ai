# Prompt template

Shape of a new `references/prompts/<type>.md`. Four blocks, in this order, nothing else.

## 1. When to use

One sentence naming the user request this type answers. Say what input it requires; if the
input cannot satisfy the prompt (wrong framing, no face, group photo), say so and require
another image.

## 2. The prompt, verbatim

A fenced `text` block holding exactly the words to send. The run sends this block as
`{{INPUT_USUARIO}}` with nothing added or reworded. Keep it self-contained: it must survive
being pasted into a blank chat with no other context.

A good prompt for image transformation, in this order:

1. The task, in one sentence.
2. What must be **preserved** (identity, facial features, proportions, expression).
3. What must **change**, one item per sentence.
4. Framing and lighting.
5. The final look, in one sentence.
6. Explicit prohibitions: no new face, no altered age or features, no beauty filters.

## 3. Naming

Default result name: `<source-stem>-<type-slug>`. Append `-2`, `-3` rather than overwrite.

## 4. What to verify before delivering

Only claims a file inspection can support: it exists, its size is stable, its extension is
an image. Anything visual in the prompt (identity preserved, background clean) is reported
as "to confirm by the human", never asserted.

## Registering it

Add one row to the dispatch table in `SKILL.md`, and add its trigger words to the
`description` without exceeding 250 characters. A type nobody can trigger is dead weight.
