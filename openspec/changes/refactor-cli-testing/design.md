# Design: Refactor CLI Testing

## Technical Approach
Refactor the tests in `funky-cli/tests/` to use structural assertions (`fs.existsSync`, regex for mandatory tags) and extract file system interactions from commands in `funky-cli/src/commands/` (like `init.js` and `feature.js`) to allow for pure logic testing.

## Architecture Decisions
### Decision: File System Abstraction for Tests
**Choice**: Create a `utils/fs-adapter.js` to handle I/O operations, or modify the command's pure functions to return expected states instead of writing directly to disk during unit tests. 
**Alternatives**: Mock `fs` with `memfs` globally.
**Rationale**: Mocking `fs` works, but extracting I/O into an adapter or keeping the logic functionally pure simplifies testing and reduces spaghetti code in the long run. Given the Orquestador's request to fix "spaghetti code", we will use pure functional extraction where the core logic returns file generation instructions, and an outer shell performs the side effects.

## Data Flow
Command Invocation -> Parse Flags -> Pure Core Logic (returns Array of Intentions: `{ action: 'copy|create', src, dest, content }`) -> I/O Executor (actually writes to disk or mocked in tests).

## File Changes
| File | Action | Description |
|---|---|---|
| `funky-cli/tests/*.test.js` | Update | Remove all literal `toContain` prose assertions; replace with file existence checks. |
| `funky-cli/src/commands/init.js` | Refactor | Separate I/O side effects from template resolution logic. |
| `funky-cli/src/commands/feature.js` | Refactor | Ensure logic remains pure and extracted from I/O if not already fully decoupled. |
| `funky-cli/src/utils/io.js` | Create | (Optional) Utility to process array of intents if not done inline in the commander action. |

## Interfaces / Contracts
- Command core functions (e.g. `runInit`) will now return an execution plan or use a mockable dependency injection for file writing.

## Testing Strategy
| Layer | What to Test | Approach |
|---|---|---|
| Unit | Logic & Flags | Test core functions for correct outputs given specific flags, mocking/avoiding physical I/O. |
| Integration | Command Execution | Execute commands and verify paths are created via `fs.existsSync`. Verify idempotency. |
| Content Contracts | Orchestrator Tags | Use regex or specific string matches exclusively for `<TAGS>`. |

## Open Questions
- [ ] Should we use a full VFS (Virtual File System) like `memfs` for integration tests, or stick to writing to a temporary physical directory? (Recommendation: temporary physical directory for end-to-end integration, pure functions for unit).
