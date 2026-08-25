# Tasks: arbol-navidad-cli — `funky tree`

**Estado:** 🟡 PENDIENTE  
**Rama:** `feature/arbol-navidad-cli`

> **ORCHESTRATOR GATE**: Si eres el Orquestador — STOP. Do NOT execute these instructions inline. Delega al worker o sub-agente.

---

> **[SISTEMA — PARA funky-tasks]** Si detectas que una fase tiene lógica de negocio compleja o decisiones de diseño críticas, limítate a etiquetar su título con `[⚠️ RIESGO ALTO]`.

> **GUARDRAIL DE TAREAS (Budget: ≤ 530 palabras):**
> Cada tarea DEBE cumplir estos criterios:
> | Criteria | ✅ Bien | ❌ Mal |
> |----------|---------|--------|
> | Specific | "Create internal/auth/middleware.go con validación JWT" | "Add auth" |
> | Actionable | "Add ValidateToken() a AuthService" | "Handle tokens" |
> | Verifiable | "Test: POST /login retorna 401 sin token" | "Make sure it works" |
> | Small | Un archivo o una unidad lógica | "Implement the feature" |
> | NFR Tagging | "`[nfr:latency]` Add cache to GET /users" | "Make it fast" |

---

## BATCH A — Renderer puro (RED → GREEN)

### FASE 0 — Branch Setup
**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.
- [ ] 0.1 Verificar git disponible: `git --version` (si falla → documentar y PARAR)
- [ ] 0.2 Verificar que el branch NO existe: `git branch --list feature/arbol-navidad-cli`
- [ ] 0.3 Crear y cambiar al branch: `git checkout -b feature/arbol-navidad-cli`
- [ ] 0.4 Confirmar branch activo: `git status`

---

### FASE 1 — RED: Tests del renderizador [⚠️ RIESGO ALTO]
**🚫 Restricciones:** Crear SOLO el archivo de tests. `treeRenderer.js` NO debe existir aún. Verificar que `pnpm test` falla antes de avanzar.
> Objetivo: Establecer contrato de `renderTree()` via tests que fallen (TDD RED). NFR-4 exige este orden.

- [ ] 1.1 Crear `funky-cli/tests/treeRenderer.test.js` con los siguientes bloques de tests (todos deben fallar al correr `pnpm test`):
  - `renderTree({ variant: 'classic', height: 10, color: false })` retorna string no-vacío
  - `renderTree({ variant: 'minimalist', height: 8, color: false })` retorna string no-vacío
  - `renderTree({ variant: 'ascii', height: 6, color: false })` retorna string no-vacío
  - `renderTree({ variant: 'ornaments', height: 8, color: false })` retorna string no-vacío; body contiene `o`, `@`, o `#`
  - `[nfr:terminal-portability]` `color: false` → output no contiene `\x1b[`
  - `[nfr:terminal-portability]` `color: true` → output contiene `\x1b[`
  - `[nfr:performance]` `height: N` → `nonEmptyLines.length >= N` para variante `classic`
  - `[nfr:performance]` variante `ascii` → output solo contiene caracteres ASCII printable (`/[^\x20-\x7e\n]/` ausente)
  - `[nfr:performance]` rendimiento < 10 ms via `performance.now()` (cualquier variante, height=20)
  - variante desconocida → `renderTree({ variant: 'bad', height: 5, color: false })` lanza `RangeError`
- [ ] 1.2 Ejecutar `pnpm test` y confirmar que los tests de `treeRenderer.test.js` **fallan** (RED) y que los tests previos siguen en verde.

---

### FASE 2 — GREEN: Implementar `treeRenderer.js` [⚠️ RIESGO ALTO]
**🚫 Restricciones:** No crear `tree.js` ni modificar `funky.js` todavía. Verificar que `pnpm test` pasa en verde antes de avanzar al Batch B.
> Objetivo: Código mínimo que haga pasar todos los tests de Fase 1. `[nfr:performance]` `[nfr:terminal-portability]`

- [ ] 2.1 Crear `funky-cli/src/utils/treeRenderer.js`:
  - Exportar `VALID_VARIANTS = ['classic', 'minimalist', 'ascii', 'ornaments']`
  - Exportar función pura `renderTree({ variant, height, color })` — síncrona, sin I/O, sin globals
  - Lanzar `RangeError` si `variant` no está en `VALID_VARIANTS` (mensaje lista variantes válidas)
  - Builder `classic`: triángulo con `*` copa ASCII, `/\` flancos, `|` tronco; usa `styleText('green', …)` de `node:util` si `color: true`, con fallback ANSI raw `\x1b[32m…\x1b[0m`
  - Builder `minimalist`: copa con `^`, tronco `|`; aplicar color verde si `color: true`
  - Builder `ascii`: usa solo chars ASCII printable 32-126 (`*`, `-`, `+`, `|`, espacio); si `color: true` aplicar verde con ANSI raw
  - Builder `ornaments`: copa con `*`; ornamentos `o`, `@`, `#` deterministas por `rowIndex % 3`; aplica color si `color: true`
  - `[nfr:performance]` Ningún builder usa async, require dinámico ni I/O — garantiza < 10 ms
- [ ] 2.2 Ejecutar `pnpm test` y confirmar que **todos** los tests de `treeRenderer.test.js` pasan (GREEN) y que la suite previa sigue sin regresiones.

---

## BATCH B — Comando + Wiring (RED → GREEN → Regresión)

### FASE 3 — RED: Tests de integración del comando
**🚫 Restricciones:** Crear SOLO el archivo de tests. `tree.js` NO debe existir. Verificar que `pnpm test` falla en los nuevos tests antes de avanzar.
> Objetivo: Definir contrato del action handler de `funky tree` via tests que fallen (TDD RED). NFR-4.

- [ ] 3.1 Crear `funky-cli/tests/tree.test.js` con los siguientes escenarios (todos deben fallar):
  - Invocación con defaults → spy `console.log`; output es string no-vacío matching variante `classic` height 10
  - `noColor: true` → output no contiene `\x1b[`
  - `[nfr:terminal-portability]` `variant: 'ascii'` → output no contiene chars fuera de ASCII printable
  - `variant: 'invalid'` → `vi.spyOn(process, 'exit')` llamado con `1`; `console.error` imprime lista de variantes válidas
  - `height: 0` → `vi.spyOn(process, 'exit')` llamado con `1`
- [ ] 3.2 Ejecutar `pnpm test` y confirmar que los tests de `tree.test.js` **fallan** (RED) y los existentes siguen en verde.

---

### FASE 4 — GREEN: Implementar `tree.js` + Wiring en `funky.js`
**🚫 Restricciones:** No crear nuevas dependencias en `package.json` (NFR-3). Verificar suite completa en verde.
> Objetivo: Implementación mínima que satisfaga Fase 3. `[nfr:terminal-portability]` `[nfr:performance]`

- [ ] 4.1 Crear `funky-cli/src/commands/tree.js`:
  - Importar `{ Command }` de `commander` y `{ renderTree, VALID_VARIANTS }` de `../utils/treeRenderer.js`
  - Declarar `treeCommand = new Command('tree')` con `.description`, `.option('--variant <name>', …, 'classic')`, `.option('--height <n>', …, '10')`, `.option('--no-color')`
  - En action handler: resolver `color = Boolean(process.stdout.isTTY && !process.env.NO_COLOR && !opts.noColor)`
  - Validar `variant` contra `VALID_VARIANTS`; si inválido: `console.error(…lista…)` + `process.exit(1)`
  - Validar `height = parseInt(opts.height, 10)`; si `< 1` o `NaN`: `console.error('Error: --height debe ser un entero positivo >= 1')` + `process.exit(1)`
  - Llamar `renderTree({ variant, height, color })` y hacer `console.log(result)`
  - Exportar `treeCommand`
- [ ] 4.2 Modificar `funky-cli/bin/funky.js`:
  - Añadir `import { treeCommand } from '../src/commands/tree.js';` junto a los imports existentes
  - Añadir `program.addCommand(treeCommand);` antes del bucle `for (const cmd of program.commands)`
  - **Esta línea de wiring está exenta de TDD per política activa (config trivial)**
- [ ] 4.3 Ejecutar `pnpm test` y confirmar que **toda** la suite pasa en verde (GREEN) — incluyendo tests preexistentes (regresión guard).

---

### FASE 5 — Verificación final NFR
**🚫 Restricciones:** No modificar código de implementación. Solo validación.
> Objetivo: Confirmar cumplimiento de todos los NFRs antes de hacer commit.

- [ ] 5.1 `[nfr:performance]` Confirmar que el test de `performance.now()` en `treeRenderer.test.js` pasa con margen (< 10 ms)
- [ ] 5.2 `[nfr:terminal-portability]` Smoke manual: `funky tree --no-color` no emite `\x1b[` en terminal
- [ ] 5.3 `[nfr:zero-deps]` Confirmar que `funky-cli/package.json` no tiene entradas nuevas en `dependencies` ni `devDependencies`
- [ ] 5.4 Ejecutar `pnpm test` una vez más — suite 100% verde

---

## Forecast

| File | Action | Est. Lines | Batch |
|---|---|---|---|
| `funky-cli/tests/treeRenderer.test.js` | Create | ~80 | A |
| `funky-cli/src/utils/treeRenderer.js` | Create | ~130 | A |
| `funky-cli/tests/tree.test.js` | Create | ~70 | B |
| `funky-cli/src/commands/tree.js` | Create | ~50 | B |
| `funky-cli/bin/funky.js` | Modify (+2 lines) | ~2 | B |
| **Total** | | **~332 líneas** | **2 batches** |
