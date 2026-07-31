# Add Engram Categories - Explore

## Context Preservation
Las categorías actuales del sistema de Engram están hardcodeadas en los siguientes puntos:
1. `funky-cli/src/commands/engram.js`: En el prompt de inquirer y en las command flags.
2. `funky-cli/src/commands/init.js`: En los paths de scaffolding.
3. `funky-cli/tests/engram.test.js`: En los tests que validan las categorías.
4. Reglas del sistema y `index.md`.

Para añadir exitosamente `session` y `release`, se deben actualizar todos estos archivos para preservar la coherencia del contexto sin romper los flujos existentes.

## Scope
- Añadir `session` y `release` al array/enum de categorías en `engram.js`.
- Modificar el generador de rutas en `init.js` para soportar las nuevas categorías.
- Actualizar `engram.test.js` para incluir aserciones para las nuevas categorías.
- Actualizar las reglas (e.g. `engram-protocol.md`) y el `index.md` correspondiente.

## Architecture
- Modificación de constantes/arreglos y validaciones existentes, sin cambios estructurales en la arquitectura.
