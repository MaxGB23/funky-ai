### [ARCH][cli-testing] Refactor CLI Testing: IO Abstraction and Template Resiliency
**What:** Se refactorizaron las pruebas del CLI para eliminar aserciones de prosa literal y se implementó un `fs-adapter` puro para abstraer el I/O físico de los comandos.
**Why:** Para hacer los tests resilientes a cambios estéticos en los templates (Template Resiliency) y asegurar que las funciones core no causen efectos secundarios sin control.
**Where:** `funky-cli/src/utils/fs-adapter.js`, `funky-cli/src/commands/init.js`, `funky-cli/src/commands/feature.js`, `funky-cli/tests/*.test.js`
**Learned:** Las pruebas en templates deben validar machine contracts (tags como `<MANDATORY_RELEASE_PROTOCOL>`) o keys estructurales, nunca strings o formato que cambie por cosmética.
