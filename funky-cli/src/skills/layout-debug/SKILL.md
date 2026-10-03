---
name: layout-debug
description: "Trigger: setup layout debug, add layout debug overlay, enable container outlines, implementar overlay de layout, borders de maquetacion, mostrar contenedores. Install the per-channel data-debug-* overlay in any project. Next.js first; adapt for other framework."
license: Apache-2.0
metadata:
  author: "MaxGB23"
  version: "2.1"
---

# Skill: Layout Debug Overlay

> [!NOTE]
> Written for **Next.js** (App Router): the channel flags live in the root
> layout (`app/layout.tsx`) and the rules are plain CSS in `globals.css`.
> On another framework, adapt those two seams — the `data-*` attribute
> contract, the class names, and the CSS layer are framework-agnostic; only
> where the root element is rendered changes.

> [!NOTE]
> **This skill owns the RULES.** A companion skill, `layout-debug-canon`,
> installed at `.agents/skills/layout-debug-canon/`, owns the repo's facts: its
> channel table, its toggle, and where its files live. It points here for the
> rules, so nothing is defined twice. Install both.

## Activation Contract

Apply when INSTALLING the overlay: adding or wiring it into a project that does not have it yet — the root flags, the CSS layer, and the first depth markers. Scope is setup, not day-to-day use: once installed, choosing channels and disposable probes is out of scope here. Use when the user asks to "set up layout debug", "add container outlines", "add a debug overlay", or "install border debugging".

## Hard Rules

- **Per-channel activation**: one `data-debug-<channel>` attribute per entry in a typed array on the root element. Empty array = off. Never a plain boolean, never a space-separated list. This is the state you ship in: turn channels on only to look, and clear the array before you commit.
- **One rule per channel** inside `@layer utilities`, keyed on `[data-debug-<channel>]`.
- **No layout shift**: `outline` + `outline-offset: -1px`, never `border` — zero layout shift, never clipped.
- **Depth, not role**: `debug-lN` = N levels deep from the OUTERMOST marked container. Assign by depth, never by role (section/wrapper/leaf): role-based assignment is what makes level numbers disagree with real depth.
- **Sibling roots each start at l1**: unmarked wrappers between two marked nodes do not count, so two marked siblings with no marked ancestor are BOTH l1. Pin/section wrappers that carry no layout of their own are the usual case.
- **Leave markers in the markup permanently**: removing a class means re-adding it to debug again later.
- **`debug-test` is a disposable probe** for ONE box (icon, image, inline span). Orthogonal to depth and never counts as a level. Dashed + neutral on purpose, so it can never be mistaken for one.
- **Zero-cost in production**: with an empty array, no `data-debug-*` attribute reaches the served HTML.

## Decision Gates

| Goal | Action |
|---|---|
| Install the overlay | run the execution steps |
| See the whole hierarchy | list every level in the array |
| Debug padding on one container | list only that level — avoids noise from nested markers |
| Look at a single box (icon, span) | add `debug-test` to it, list only `test` |
| Turn it off / ship | empty array |
| Add a depth level | the four places in Execution Steps 4, all or none |
| Operate it day to day | the `layout-debug-canon` companion |

## Execution Steps

1. Add the `@layer utilities` block, one rule per channel. The level count below is
   an EXAMPLE, not a ceiling or a standard — ship as many levels as your components
   actually nest. Only two things must agree: the class names and the union in step 2.

```css
@layer utilities {
  [data-debug-l1] .debug-l1 { outline: 1px solid #f87171; outline-offset: -1px; }
  [data-debug-l2] .debug-l2 { outline: 1px solid #22c55e; outline-offset: -1px; }
  [data-debug-l3] .debug-l3 { outline: 1px solid #eab308; outline-offset: -1px; }
  [data-debug-l4] .debug-l4 { outline: 1px solid #60a5fa; outline-offset: -1px; }
  [data-debug-l5] .debug-l5 { outline: 1px solid #a78bfa; outline-offset: -1px; }
  /* Disposable probe: dashed + neutral, never a depth level. */
  [data-debug-test] .debug-test { outline: 1px dashed #f5f5f5; outline-offset: -1px; }
}
```

2. Put the flags on the root element from a typed array; empty array means off:

```tsx
type DebugChannel = 'l1' | 'l2' | 'l3' | 'l4' | 'l5' | 'test';

const LAYOUT_DEBUG: DebugChannel[] = [];

const debugAttrs = Object.fromEntries(
  LAYOUT_DEBUG.map((channel) => [`data-debug-${channel}`, true]),
);

// <html {...debugAttrs}>
```

3. Add `debug-lN` to layout containers, counting depth from the outermost marked container. Use `debug-test` for anything that is NOT a depth level.

4. To add a level, four places, all or none — the last one is the one that rots in
   silence when forgotten:
   1. The `DebugChannel` union in the root layout.
   2. A `[data-debug-<channel>] .debug-<channel>` rule in the CSS layer.
   3. A row in the channel table of `layout-debug-canon`.
   4. A line in the project's design canon, if it keeps one.

   Nothing caps the level count: the ceiling is how deep the components actually
   nest, not the palette.

5. Verify: with an empty array the served HTML contains no `data-debug-*` attribute at all. Then activate one channel at a time and confirm only that channel outlines.

## Output Contract

Return: the files created or modified, the channel mapping used, the palette, and confirmation that the empty array emits no attribute.

Once the overlay works, hand day-to-day use to `layout-debug-canon`. Do not
duplicate this skill's rules there: it points back here for them.