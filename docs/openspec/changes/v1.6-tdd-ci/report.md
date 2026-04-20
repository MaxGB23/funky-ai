# Reporte de Ejecución - v1.6 TDD y CI

## Fase 0: Control de Versiones (Git)
- ✅ Se creó y cambió a la rama `feat/v1.6-tdd-ci`.

## Fase 1: Setup Core TDD
- ✅ Se instaló `vitest` como dependencia de desarrollo en `funky-cli`.
- ✅ Se actualizó `package.json` para que el script `test` ejecute `vitest run`.
- ✅ Se creó el archivo `tests/sanity.test.js` con un test dummy y se verificó que `npm test` pasa exitosamente.

## Fase 2: Aplicando TDD a los Comandos
- ✅ Se extrajeron las funciones puras `runInit()` y `runPhase()` de sus respectivos comandos Commander (refactor de inyección de dependencias liviana).
- ✅ Se creó `tests/init.test.js` con 4 tests unitarios para `runInit()` (happy path, skip, estado mixto, propagación de error).
- ✅ Se creó `tests/phase.test.js` con 5 tests unitarios para `runPhase()` (inyección, lowercase normalization, template inexistente, protección de sobreescritura, propagación de error).
- ✅ Todos los mocks de `fs` son puros (sin I/O real). Tests cross-platform usando `path.join()` para separadores correctos en Windows.
- ✅ Suite completa: **10/10 tests pasan** (3 archivos de test, 220ms de duración).
- 📐 **Decisión Arquitectónica:** Se optó por extraer la lógica de los comandos en funciones puras en lugar de mockear el módulo `commander`. Esto preserva la CLI surface intacta y permite tests unitarios verdaderos sin efectos de `process.exit()`.
