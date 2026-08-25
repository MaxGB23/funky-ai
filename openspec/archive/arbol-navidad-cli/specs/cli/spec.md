---
root-sha256: null
---

# Delta for cli
> Feature: arbol-navidad-cli | Status: Draft | Author: Spec Agent

<!-- root-sha256: null → Domain `cli` is new. FULL Spec — no ADDED/MODIFIED/REMOVED partitions. -->

## Requirements

---

### Requirement: Tree Command Registration
The system MUST register a `funky tree` subcommand in `funky-cli/bin/funky.js` via `program.addCommand(treeCommand)` and MUST apply `enrichCommandHelp(treeCommand, 'tree')` following the existing registration pattern.

#### Scenario: Command registered and callable
- GIVEN `funky-cli/bin/funky.js` imports `treeCommand` from `src/commands/tree.js`
- WHEN the user executes `funky tree`
- THEN the tree is rendered to `stdout` with default options (`variant: classic`, `height: 10`, `color`: auto-detected)

#### Scenario: Help text exposed
- GIVEN the `tree` subcommand is registered with `enrichCommandHelp`
- WHEN the user executes `funky tree --help`
- THEN `stdout` contains the command description, all flags (`--variant`, `--height`, `--no-color`), and their defaults

#### Scenario: Existing commands unaffected (regression guard)
- GIVEN `program.addCommand(treeCommand)` is added as an additive line
- WHEN the full test suite runs (`pnpm test`)
- THEN all pre-existing command tests MUST continue to pass

---

### Requirement: Tree Command Flags
The `funky tree` command MUST expose three flags: `--variant <name>`, `--height <n>`, and `--no-color`. It MUST pass resolved option values to `renderTree()` and print the returned string via `console.log`. Valid variants are: `classic | minimalist | ascii | ornaments`. Default height is `10`.

#### Scenario: Default flags
- GIVEN the user runs `funky tree` without any flags
- WHEN the action handler executes
- THEN `renderTree` is called with `{ variant: 'classic', height: 10, color: <auto-detected> }`

#### Scenario: Custom variant flag
- GIVEN the user runs `funky tree --variant minimalist`
- WHEN the action handler executes
- THEN `renderTree` is called with `{ variant: 'minimalist', height: 10, color: <auto-detected> }`

#### Scenario: Custom height flag
- GIVEN the user runs `funky tree --height 5`
- WHEN the action handler executes
- THEN `renderTree` is called with `{ variant: 'classic', height: 5, color: <auto-detected> }`

#### Scenario: Invalid variant value
- GIVEN the user runs `funky tree --variant invalid`
- WHEN the action handler executes
- THEN the command MUST print an error message listing the four valid variants and MUST exit with a non-zero code

#### Scenario: Invalid height value
- GIVEN the user runs `funky tree --height 0` or `funky tree --height -3`
- WHEN the action handler executes
- THEN the command MUST print an error message indicating height MUST be a positive integer ≥ 1 and MUST exit with a non-zero code

---

### Requirement: Tree Renderer Pure Function
The system MUST provide a pure, synchronous exported function `renderTree({ variant, height, color })` in `funky-cli/src/utils/treeRenderer.js`. The function MUST return a non-empty string, MUST NOT perform any I/O or side effects, and MUST complete execution in **< 10 ms** for any supported variant and height (see NFR-2). The four supported variants are: `classic`, `minimalist`, `ascii`, `ornaments`.

#### Scenario: Classic variant — triangle tree with trunk
- GIVEN `renderTree({ variant: 'classic', height: 10, color: false })` is called
- WHEN the function executes
- THEN it returns a non-empty string representing a triangle-shaped ASCII tree with a trunk

#### Scenario: Minimalist variant
- GIVEN `renderTree({ variant: 'minimalist', height: 8, color: false })` is called
- WHEN the function executes
- THEN it returns a non-empty string with a simplified, space-efficient tree representation

#### Scenario: ASCII-only variant
- GIVEN `renderTree({ variant: 'ascii', height: 6, color: false })` is called
- WHEN the function executes
- THEN it returns a non-empty string using only printable ASCII characters (no Unicode, no emoji)

#### Scenario: Ornaments variant
- GIVEN `renderTree({ variant: 'ornaments', height: 8, color: false })` is called
- WHEN the function executes
- THEN it returns a non-empty string with ornament characters (e.g. `*`, `o`, `@`) embedded in the tree body

#### Scenario: Color mode enabled
- GIVEN `renderTree({ variant: 'classic', height: 5, color: true })` is called
- WHEN the function executes
- THEN the returned string MUST contain at least one ANSI escape sequence (e.g., `\x1b[`)

#### Scenario: Color mode disabled
- GIVEN `renderTree({ variant: 'classic', height: 5, color: false })` is called
- WHEN the function executes
- THEN the returned string MUST NOT contain any ANSI escape sequences (`\x1b[` absent)

#### Scenario: Height parameter affects output size
- GIVEN `renderTree({ variant: 'classic', height: N, color: false })` is called with positive integer `N`
- WHEN the function executes
- THEN the number of non-empty lines in the returned string MUST be ≥ N

#### Scenario: Performance — renders in < 10 ms
- GIVEN any valid `{ variant, height, color }` combination
- WHEN `renderTree()` is called and timed via `performance.now()`
- THEN the call MUST complete in less than **10 ms**

#### Scenario: Unknown variant — RangeError
- GIVEN `renderTree({ variant: 'unknown', height: 5, color: false })` is called
- WHEN the function executes
- THEN it MUST throw a `RangeError` whose message lists valid variants: `classic | minimalist | ascii | ornaments`

---

### Requirement: No-Color / Non-TTY Auto-Detection
The system MUST automatically suppress ANSI escape sequences when `process.stdout.isTTY` is falsy OR when the environment variable `NO_COLOR` is set (any non-empty string, per no-color.org). The `--no-color` Commander flag MUST also force suppression independently of TTY state. Auto-detection logic SHOULD reside in `src/commands/tree.js` (command layer), keeping `treeRenderer.js` agnostic of process globals.

#### Scenario: Auto-suppress in CI / pipe (no-TTY)
- GIVEN `process.stdout.isTTY` is `undefined` or `false`
- WHEN `funky tree` is executed without `--no-color`
- THEN `stdout` output MUST contain no ANSI escape sequences

#### Scenario: Auto-suppress via NO_COLOR env var
- GIVEN `NO_COLOR=1` is set in the process environment
- WHEN `funky tree` is executed without `--no-color`
- THEN `stdout` output MUST contain no ANSI escape sequences

#### Scenario: Explicit --no-color overrides TTY
- GIVEN `process.stdout.isTTY` is `true` and `NO_COLOR` is not set
- WHEN the user runs `funky tree --no-color`
- THEN `stdout` output MUST contain no ANSI escape sequences

#### Scenario: Color enabled when conditions clear
- GIVEN `process.stdout.isTTY` is `true` and `NO_COLOR` is not set
- WHEN the user runs `funky tree` without `--no-color`
- THEN `stdout` output MAY contain ANSI escape sequences (color rendering permitted)

---

### Requirement: Test Coverage — Unit (treeRenderer)
The project MUST include `funky-cli/tests/treeRenderer.test.js` with Vitest unit tests covering `renderTree()`. Tests MUST cover all four variants, color on/off paths, the height parameter, unknown variant error, and performance. Tests MUST NOT mock I/O, `process.stdout`, or any Node globals; they call `renderTree()` directly with explicit `color` values.

#### Scenario: TDD Red phase — tests precede implementation
- GIVEN `treeRenderer.test.js` exists but `treeRenderer.js` does not
- WHEN `pnpm test` runs
- THEN the new test suite MUST fail (red)

#### Scenario: TDD Green phase — implementation satisfies tests
- GIVEN `treeRenderer.js` is implemented
- WHEN `pnpm test` runs
- THEN all `treeRenderer.test.js` assertions MUST pass (green)

#### Scenario: Stable ANSI assertions via color: false
- GIVEN a unit test asserts tree body structure
- WHEN the test calls `renderTree({ ..., color: false })`
- THEN assertions compare plain strings without ANSI sequences, making tests stable across style changes

---

### Requirement: Test Coverage — Integration (tree command)
The project MUST include `funky-cli/tests/tree.test.js` with Vitest integration tests. Tests MUST capture `console.log` / `process.stdout` output and verify rendered strings for key scenarios.

#### Scenario: Default invocation output captured
- GIVEN the integration test invokes the tree action handler with default options
- WHEN execution completes
- THEN captured output is a non-empty string matching the `classic` variant at height 10

#### Scenario: --no-color output is ANSI-clean
- GIVEN the integration test invokes the command action with `noColor: true`
- WHEN the output is captured
- THEN captured output MUST contain no ANSI escape sequences

#### Scenario: Variant switching verified
- GIVEN the integration test invokes the command with `variant: 'ascii'`
- WHEN the output is captured
- THEN captured output matches the `ascii` variant output (no Unicode/emoji characters)

#### Scenario: Invalid variant exits non-zero
- GIVEN the integration test calls the action with `variant: 'foobar'`
- WHEN the command exits
- THEN the process MUST exit with a non-zero code AND the error output MUST list valid variants

---

## Non-Functional Requirements

### NFR-1 — Terminal Portability
`renderTree()` and `tree.js` MUST operate correctly in non-TTY environments (CI pipelines, shell pipes, file redirections) without emitting unintended ANSI sequences. Detection MUST check BOTH `process.stdout.isTTY` and `process.env.NO_COLOR` (any non-empty value per [no-color.org](https://no-color.org)).

### NFR-2 — Synchronous Render < 10 ms
`renderTree()` MUST be synchronous (no `async`/`await`, no Promises, no I/O calls). Execution MUST complete in **< 10 ms** for any valid variant and height value. Measurable via `performance.now()` in unit tests.

### NFR-3 — Zero External Dependencies
No new entries in `funky-cli/package.json` `dependencies` or `devDependencies` SHALL be introduced. Styling MUST use `node:util` `styleText` (Node ≥ 22.13.0 built-in) or raw ANSI escape sequences exclusively.

### NFR-4 — Strict TDD Compliance
Every new source module (`treeRenderer.js`, `tree.js`) MUST be preceded by a failing test. No implementation code SHALL exist before its corresponding test has been written and confirmed red. Static string templates, trivial ANSI constant definitions, and the single `program.addCommand` wiring line are exempt from this rule per the active TDD policy.
