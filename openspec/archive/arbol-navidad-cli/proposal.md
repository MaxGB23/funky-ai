# Proposal: arbol-navidad-cli

## Intent
Añadir el comando `funky tree` a la CLI de Funky AI para renderizar en consola un árbol de navidad ASCII con múltiples variantes de diseño. La feature valida el flujo SDD Tier 3, confirma la extensibilidad del árbol de comandos de `funky-cli` y establece un patrón modular y testeable para la renderización de texto con estilos ANSI nativos de Node 22.

---

## Scope

### In Scope
- Nuevo comando `funky tree` registrado en `funky-cli/bin/funky.js` vía `program.addCommand(treeCommand)`.
- Módulo de renderizado puro: `funky-cli/src/utils/treeRenderer.js` con función exportable `renderTree({ variant, height, color })`.
- Integrador de comando: `funky-cli/src/commands/tree.js` — conecta Commander con el renderizador y maneja flags.
- Soporte de flags: `--variant <name>` (classic | minimalist | ascii | ornaments), `--height <n>`, `--no-color`.
- Detección automática de entorno no-TTY / `NO_COLOR` para suprimir secuencias ANSI.
- Tests unitarios del renderizador puro en `funky-cli/tests/treeRenderer.test.js` (Strict TDD, Vitest).
- Tests de integración de comando en `funky-cli/tests/tree.test.js`.
- Enriquecimiento de ayuda con `enrichCommandHelp` (patrón existente).

### Out of Scope
- Modo interactivo con @clack/prompts / @inquirer (diferido a iteración futura).
- Animaciones o renderizado frame-a-frame.
- Añadir dependencias npm externas (chalk, figlet, etc.).
- Soporte de variantes adicionales más allá de las cuatro mencionadas.
- Persistencia o exportación del árbol a archivo.

---

## Capabilities

### New Capabilities
- **[CLI: funky tree]** -> `openspec/specs/cli/tree-command.md`
- **[Renderer: treeRenderer]** -> `openspec/specs/cli/tree-renderer.md`

### Modified Capabilities
- **[CLI: Entry Point — funky.js]** -> `openspec/specs/cli/entry-point.md`
  _(solo se agrega `program.addCommand(treeCommand)` — impacto mínimo)_

---

## Approach

**Opción A — Comando modular con renderizador puro.**

1. **`src/utils/treeRenderer.js`** — Lógica pura: genera el string del árbol dada una configuración `{ variant, height, color }`. Sin side-effects de I/O. Usa `node:util` `styleText` o secuencias ANSI estándar cuando `color: true` y `process.stdout.isTTY`.
2. **`src/commands/tree.js`** — Integrador Commander: declara flags, llama a `renderTree()` e imprime el resultado con `console.log`.
3. **`bin/funky.js`** — Un único `program.addCommand(treeCommand)` + `enrichCommandHelp`.
4. **TDD estricto:** primero se escriben los tests del renderizador (fallan), luego la implementación los hace pasar. Tests de integración del comando validan el output a través de `process.stdout` capturado.

---

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `funky-cli/bin/funky.js` | Bajo | Añade una línea `program.addCommand(treeCommand)` |
| `funky-cli/src/commands/` | Nuevo | Archivo `tree.js` — integrador de Commander |
| `funky-cli/src/utils/` | Nuevo | Archivo `treeRenderer.js` — lógica pura de renderizado |
| `funky-cli/tests/` | Nuevo | `treeRenderer.test.js` + `tree.test.js` |
| `funky-cli/package.json` | Ninguno | Sin dependencias nuevas |

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Secuencias ANSI corrompen output en CI / pipes / no-TTY | Media | Flag `--no-color` + detección automática de `process.stdout.isTTY` y variable de entorno `NO_COLOR` |
| Tests frágiles por caracteres de escape ANSI en assertions | Media | Renderizador acepta `{ color: false }` para tests unitarios; helper `stripAnsi` en tests de integración |
| Regresión en `funky.js` al añadir el nuevo addCommand | Baja | La modificación es aditiva (una línea); los tests existentes de otros comandos actúan como guardia |
| Falta de Context Preservation completo en explore.md | Baja | El explore.md cubre Reglas, Definiciones y Scope no-negociable; ningún dato crítico faltante identificado |

---

## Rollback Plan

1. Eliminar `src/commands/tree.js` y `src/utils/treeRenderer.js`.
2. Revertir la línea `program.addCommand(treeCommand)` en `bin/funky.js`.
3. Eliminar los archivos de test generados.
4. Ejecutar `pnpm test` para confirmar que la suite base sigue en verde.

> No requiere cambios en `package.json` ni migraciones de datos; el rollback es trivial.

---

## Dependencies

- **Node >= 22.13.0** — Requerimiento ya existente en `funky-cli/package.json` (necesario para `node:util` `styleText`).
- **Vitest ^4.1.10** — Ya instalado; runner de tests.
- **Commander v15** — Ya instalado; API de comandos CLI.
- **Ninguna dependencia npm nueva** requerida.

---

## Success Criteria

- [ ] `pnpm test` pasa en verde con todos los tests nuevos incluidos.
- [ ] `funky tree` imprime un árbol clásico por defecto (sin flags).
- [ ] `funky tree --variant minimalist` imprime la variante minimalista.
- [ ] `funky tree --no-color` no emite secuencias ANSI en su output.
- [ ] En entorno CI (`isTTY = false` o `NO_COLOR=1`), el output es limpio sin flags adicionales.
- [ ] Renderizado completa en < 10ms (NFR-2).
- [ ] Tests unitarios de `treeRenderer.js` verifican strings generados sin mockear I/O.
- [ ] Ningún test previo de la suite `funky-cli` se rompe.

---

## NFR Tradeoffs Formalizados

| NFR | Decisión de Diseño | Tradeoff |
|---|---|---|
| **NFR-1 — Portabilidad de Terminal** | Detección de `isTTY` + `NO_COLOR` + flag `--no-color` | Se añade lógica condicional en el renderizador; simplicidad ligeramente reducida |
| **NFR-2 — Performance < 10ms** | Renderizado síncrono; sin async/await en el generador | No aplica para árboles muy grandes, pero variantes definidas están acotadas en altura |
