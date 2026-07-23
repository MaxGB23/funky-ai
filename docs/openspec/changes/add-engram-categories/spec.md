# Specification: Add Engram Categories

## Domain: CLI & Documentation

## Requirements
1. The `funky-cli` inquirer prompt in `engram.js` MUST include `session` and `release` as valid category options.
2. The CLI flags in `engram.js` MUST accept `session` and `release`.
3. The `init.js` scaffolding generator MUST create routing/paths for `session` and `release` categories if needed.
4. The `engram.test.js` test suite MUST cover the new categories to ensure they are handled properly.
5. The `engram-protocol.md` and `index.md` files MUST document the new categories, defining their purpose and file paths.

## Scenarios
1. **Happy Path: Creating a session engram**
   - Given a user running `funky engram add --category session ...`
   - Then the engram is created successfully in the proper path.
2. **Happy Path: Creating a release engram**
   - Given a user running `funky engram add --category release ...`
   - Then the engram is created successfully in the proper path.
3. **Error State: Invalid category**
   - Given a user running `funky engram add --category random`
   - Then the CLI returns an validation error.
4. **Happy Path: Scaffolding a new project**
   - Given a user runs `funky init`
   - Then directories for `docs/engram/session/` and `docs/engram/release/` are generated.
