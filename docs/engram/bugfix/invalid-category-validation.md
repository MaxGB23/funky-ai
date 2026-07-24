### [BUG][invalid-category-validation] Falta validación de categorías desconocidas en CLI
**What:** Se añadió validación para atrapar inputs de categorías inválidas/desconocidas en `funky-cli/src/commands/engram.js` y se añadieron sus pruebas en `engram.test.js`.
**Why:** Al inyectar `session` y `release`, QA detectó que el CLI no validaba correctamente escenarios de categorías inexistentes, lo que podía romper el indexing.
**Where:** `funky-cli/src/commands/engram.js`, `funky-cli/tests/engram.test.js`
**Learned:** Siempre agregar un "Error State" a nivel Specs para comandos interactivos y validarlo en el suite de pruebas (coverage de happy paths no es suficiente).
