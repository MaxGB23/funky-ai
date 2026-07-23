# Tasks: Refactor CLI Testing

## Task 1: Create I/O Adapter
- **Goal**: Create `funky-cli/src/utils/fs-adapter.js` (or `io.js`) to encapsulate file system interactions.
- **Details**:
  - Implement functions that execute an array of intentions (`{ action: 'copy|create', src, dest, content }`).
  - Provide a way to mock or avoid physical I/O during unit tests.

## Task 2: Refactor `init.js` Command
- **Goal**: Separate I/O side effects from template resolution logic in `funky-cli/src/commands/init.js`.
- **Details**:
  - Refactor command core function to return an execution plan (array of intentions) instead of writing to disk directly.
  - Integrate the new I/O adapter to execute the intentions.

## Task 3: Refactor `feature.js` Command
- **Goal**: Ensure `funky-cli/src/commands/feature.js` remains pure and is extracted from I/O.
- **Details**:
  - Review and adjust logic to return file generation instructions if not already decoupled.
  - Integrate the I/O adapter.

## Task 4: Refactor Test Suite
- **Goal**: Remove literal prose assertions and implement structural validation in `funky-cli/tests/*.test.js`.
- **Details**:
  - [x] Purge all `toContain` assertions that check for literal markdown strings.
  - Implement structural path validations using `fs.existsSync(expectedPath)` to verify file creation.
  - Validate idempotency skips (files are not overwritten if they exist).
  - Add structural tests for machine contracts (e.g., regex matching `<MANDATORY_RELEASE_PROTOCOL>`).
