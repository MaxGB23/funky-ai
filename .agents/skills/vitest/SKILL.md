---
name: vitest
description: Use when writing unit/integration tests for Vite projects - configure vitest.config.ts, write test suites with describe/it, create mock implementations with vi.fn and vi.mock, set up code coverage thresholds, and run tests in parallel
license: MIT
---

# Vitest

Vite-native testing framework with Jest-compatible API.

## When to Use

- Writing unit/integration tests for Vite projects
- Testing Vue/React/Svelte components
- Mocking modules, timers, or dates
- Running concurrent/parallel tests
- Type testing with TypeScript

## Quick Start

```bash
npm i -D vitest
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',  // or 'jsdom' for DOM tests
  },
})
```

```ts
// example.test.ts
import { describe, expect, it, vi } from 'vitest'

describe('math', () => {
  it('adds numbers', () => {
    expect(1 + 1).toBe(2)
  })
})
```

## Reference Files

| Task                                     | File                                    |
| ---------------------------------------- | --------------------------------------- |
| Configuration, CLI, projects             | [config.md](references/config.md)       |
| test/describe, hooks, fixtures           | [test-api.md](references/test-api.md)   |
| vi.fn, vi.mock, timers, spies            | [mocking.md](references/mocking.md)     |
| expect, snapshots, coverage, filtering   | [utilities.md](references/utilities.md) |
| Environments, type testing, browser mode | [advanced.md](references/advanced.md)   |

## Loading Files

**Consider loading these reference files based on your task:**

- [ ] [references/config.md](references/config.md) - if setting up vitest.config.ts, CLI, or workspace projects
- [ ] [references/test-api.md](references/test-api.md) - if writing test/describe blocks, using hooks, or test fixtures
- [ ] [references/mocking.md](references/mocking.md) - if mocking modules, timers, dates, or using spies
- [ ] [references/utilities.md](references/utilities.md) - if writing assertions, snapshots, or configuring coverage
- [ ] [references/advanced.md](references/advanced.md) - if configuring test environments, type testing, or browser mode

**DO NOT load all files at once.** Load only what's relevant to your current task.

## Cross-Skill References

- **Vue component testing** → Use `vue` skill for component patterns
- **Library testing** → Use `ts-library` skill for library patterns
- **Vite configuration** → Use `vite` skill for shared config

## Repo conventions (funky-ai)

- One unit under test per file, named `{unit}.test.js` (e.g. `estimateDomain.test.js`).
- Command/integration tests go in `{cmd}.integration.test.js` (e.g. `estimateCommand.integration.test.js`).
- Interactive command harnesses (real prompt I/O) go in `{cmd}.interactive.test.js` (e.g. `skills.interactive.test.js`) — a third, accepted category, exempt from the single-command-import rule like integration files.
- Unit test files import from at most ONE `src/commands/` module; two or more command modules means an integration or mixed-unit file — rename it to `.integration.test.js` or split it.
- Line caps: unit files ≤ 500 lines, integration/interactive files ≤ 800 lines.
- Shared fs mocks and test helpers live in `tests/helpers/` (e.g. `tests/helpers/fsMock.js`), never duplicated across test files.
- Test names describe the behavior the system must have (`creates the required files`), never the implementation (`should call copyFile`). When a test fails, its name must say which contract broke, not which function is invoked. Semantic rule — followed by convention, cannot be enforced mechanically by `tests/organization.test.js`.
- **Assertion Strategy (Anti-Brittle Tests):** NEVER hardcode copy, exact wording or presentation strings (e.g. `expect(output).toContain('Exact Title')`) when testing templates, console outputs or UI. Use **Snapshot Testing** (`toMatchSnapshot()`) for full outputs, or validate **Structure/Behavior** using semantic markers, tokens, and logic branches. Tests MUST survive non-functional copywriting changes.
- Enforcement: `tests/organization.test.js` (meta-test, runs with `pnpm test`) fails on rule violations; legacy debt is tracked in its `LEGACY_EXCEPTIONS` map (may be empty once debt is migrated) and must be removed when a file is migrated.

