# Proposal: Add Engram Categories

## Summary
Add `session` and `release` categories to the Engram system to improve categorization of sessions and release processes.

## Context Preservation
Las categorías actuales del sistema de Engram están hardcodeadas en varios puntos que deben actualizarse en conjunto para preservar la coherencia del contexto sin romper los flujos existentes:
1. `funky-cli/src/commands/engram.js`: Modificar el prompt de inquirer y las command flags para incluir `session` y `release`.
2. `funky-cli/src/commands/init.js`: Modificar el generador de rutas/scaffolding para soportar las nuevas categorías.
3. `funky-cli/tests/engram.test.js`: Actualizar para incluir aserciones para las nuevas categorías.
4. Reglas del sistema (`engram-protocol.md`) e `index.md`: Actualizar la taxonomía de categorías documentada.

## Proposed Changes
1. Update `funky-cli/src/commands/engram.js` to allow `session` and `release`.
2. Update `funky-cli/src/commands/init.js` to handle scaffolding paths for the new categories.
3. Update `funky-cli/tests/engram.test.js` to test the newly added categories.
4. Update `engram-protocol.md` and `index.md` with descriptions and paths for the new categories.

## Risk Assessment
- **Risk Level**: Low
- **Reasoning**: This is an additive change to constants/arrays and existing validations, without structural changes to the architecture. Existing tests will be updated, ensuring backwards compatibility with current categories.
