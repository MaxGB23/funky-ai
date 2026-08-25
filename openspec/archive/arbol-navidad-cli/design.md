# Design: arbol-navidad-cli — `funky tree`

## Technical Approach

Módulo puro `treeRenderer.js` + integrador Commander `tree.js` + un único `program.addCommand` en `funky.js`. La lógica de renderizado es una función síncrona pura sin I/O; el comando resuelve color y valida flags antes de llamarla. Cero dependencias nuevas; estilos mediante `node:util` `styleText` o ANSI raw (Node ≥ 22.13.0).

---

## Architecture Decisions

### Decision: Renderizador puro separado del comando
**Choice:** `src/utils/treeRenderer.js` exporta `renderTree({ variant, height, color })` como función pura sin side-effects.  
**Alternatives:** Lógica inline en el action handler de Commander; integración con librería externa (chalk/figlet).  
**Rationale:** Alinea con el patrón establecido (`estimateDomain.js`, `canvasDiscovery.js`). Permite tests unitarios sobre el string generado sin mockear `console.log` ni `process.stdout`. NFR-4 (Strict TDD) exige que `treeRenderer.js` sea el primer módulo cubierto por tests rojos.

### Decision: Detección de color en la capa de comando, no en el renderizador
**Choice:** `tree.js` resuelve `color = Boolean(process.stdout.isTTY && !process.env.NO_COLOR && !opts.noColor)` y lo pasa explícitamente a `renderTree()`.  
**Alternatives:** Detectar `isTTY`/`NO_COLOR` dentro de `treeRenderer.js`.  
**Rationale:** Mantiene el renderizador agnóstico de globals de proceso (NFR-1). Los tests unitarios de `treeRenderer.test.js` no necesitan mockear `process.stdout` ni `process.env`; simplemente pasan `color: false`.

### Decision: `node:util` styleText con fallback a ANSI raw
**Choice:** Usar `styleText` de `node:util` (Node ≥ 22.13.0) para verde (`green`) en la copa y amarillo (`yellow`) en el tronco; si el entorno no soporta styleText, usar secuencias ANSI hardcodeadas como fallback.  
**Alternatives:** Chalk, Picocolors, u otras librerías de colores.  
**Rationale:** NFR-3 prohíbe dependencias externas. El runtime ya es Node ≥ 22.13.0 per `funky-cli/package.json`.

### Decision: Validación de flags en el action handler
**Choice:** Validar `variant` y `height` dentro del action handler de `tree.js`; imprimir error descriptivo y llamar `process.exit(1)`.  
**Alternatives:** Usar `.choices()` de Commander para `--variant`; usar `.argParser` nativo.  
**Rationale:** El patrón de `estimate.js` hace validación programática en el action. Commander `.choices()` no emite el mensaje de error con la lista de variantes que la spec exige. Para `height`, `parseInt` permite detectar valores <= 0 con mensaje personalizado.

### Decision: `program.addCommand` antes del bucle de `enrichCommandHelp`
**Choice:** Insertar `program.addCommand(treeCommand)` en `bin/funky.js` antes del bucle `for (const cmd of program.commands)`, de modo que `enrichCommandHelp` lo procese automáticamente.  
**Alternatives:** Llamar `enrichCommandHelp(treeCommand, 'tree')` explícitamente.  
**Rationale:** El bucle existente itera `program.commands` post-`addCommand`; no requiere lógica adicional.

---

## Data Flow

```
Usuario: funky tree [--variant <name>] [--height <n>] [--no-color]
           |
           v
bin/funky.js  --program.parse(process.argv)-->  Commander router
                                                        |
                                                        v
                                          src/commands/tree.js  (action handler)
                                          +--------------------------------------------+
                                          | 1. Parse opts: variant, height, noColor    |
                                          | 2. Validate variant in VALID_VARIANTS      |
                                          | 3. Validate height >= 1                    |
                                          | 4. Resolve color:                          |
                                          |    isTTY && !NO_COLOR && !noColor          |
                                          | 5. Call renderTree({variant,height,color}) |
                                          | 6. console.log(result)                     |
                                          +-------------------+------------------------+
                                                              |
                                                              v
                                          src/utils/treeRenderer.js
                                          +--------------------------------------------+
                                          | renderTree({ variant, height, color })     |
                                          |  - Selecciona builder por variante         |
                                          |  - Construye lineas del arbol              |
                                          |  - Aplica ANSI/styleText si color=true     |
                                          |  - Returns: string (non-empty)             |
                                          +--------------------------------------------+
                                                              |
                                                              v
                                                   stdout (console.log)
```

Flujo de error:
```
action handler detecta variante invalida / height <= 0
  --> console.error(mensaje con lista de validos)
  --> process.exit(1)
```

---

## File Changes

| File | Action | Description |
|---|---|---|
| `funky-cli/bin/funky.js` | **Modify** | Añadir import de `treeCommand` y `program.addCommand(treeCommand)` antes del bucle `for` |
| `funky-cli/src/commands/tree.js` | **Create** | Integrador Commander: declara flags, valida, resuelve color, llama `renderTree()`, imprime |
| `funky-cli/src/utils/treeRenderer.js` | **Create** | Función pura `renderTree({ variant, height, color })` — generadores de las 4 variantes + logica ANSI |
| `funky-cli/tests/treeRenderer.test.js` | **Create** | Tests unitarios TDD del renderizador (Vitest, sin mocks de I/O) |
| `funky-cli/tests/tree.test.js` | **Create** | Tests de integración del comando (captura de console.log, exit codes) |

> `funky-cli/package.json` — sin cambios (NFR-3).

---

## Interfaces / Contracts

### `renderTree(options)` — `src/utils/treeRenderer.js`

```js
/**
 * @param {{ variant: 'classic'|'minimalist'|'ascii'|'ornaments', height: number, color: boolean }} options
 * @returns {string} String multi-linea con el arbol renderizado.
 * @throws {RangeError} Si variant no esta en VALID_VARIANTS.
 */
export function renderTree({ variant, height, color }) { ... }

export const VALID_VARIANTS = ['classic', 'minimalist', 'ascii', 'ornaments'];
```

Invariantes:
- Sincrona pura: sin async/await, sin I/O, sin mutacion de globals.
- Completa en < 10ms para cualquier `height` y variante (NFR-2).
- Con `color: false` → output libre de `\x1b[` (testeable de forma estable).
- Con `color: true` → output contiene al menos una secuencia ANSI.
- `height` afecta numero de lineas: `nonEmptyLines.length >= height`.

### `treeCommand` — `src/commands/tree.js`

```js
// Flags:
//   --variant <name>   'classic' | 'minimalist' | 'ascii' | 'ornaments'  [default: 'classic']
//   --height <n>       integer >= 1                                        [default: 10]
//   --no-color         Suppress ANSI sequences
export const treeCommand = new Command('tree')
  .description('Renderiza un arbol de navidad ASCII en consola')
  .option('--variant <name>', 'Variante de diseno: classic | minimalist | ascii | ornaments', 'classic')
  .option('--height <n>', 'Altura del arbol (entero >= 1)', '10')
  .option('--no-color', 'Desactiva colores ANSI')
  .action(handler);
```

Resolucion de color (en handler):
```js
const color = Boolean(process.stdout.isTTY && !process.env.NO_COLOR && !opts.noColor);
```

Validaciones (en handler):
```js
const VALID_VARIANTS = ['classic', 'minimalist', 'ascii', 'ornaments'];
if (!VALID_VARIANTS.includes(opts.variant)) {
  console.error(`Error: variante invalida "${opts.variant}". Validas: ${VALID_VARIANTS.join(' | ')}`);
  process.exit(1);
}
const height = parseInt(opts.height, 10);
if (!Number.isInteger(height) || height < 1) {
  console.error('Error: --height debe ser un entero positivo >= 1');
  process.exit(1);
}
```

### Constantes de variante internas en `treeRenderer.js`

| Variante | Caracteres usados | Unicode/Emoji | Adornos |
|---|---|---|---|
| `classic` | `*`, `/`, `\`, `|`, espacio | No (estrella por defecto ASCII) | No |
| `minimalist` | `^`, `|`, espacio | No | No |
| `ascii` | `*`, `|`, `-`, `+`, espacio | **No** (ASCII printable 32-126) | No |
| `ornaments` | `*`, `o`, `@`, `#`, espacio | No | Si (deterministas por indice de fila) |

---

## Testing Strategy

| Layer | What to Test | Approach |
|---|---|---|
| **Unit — treeRenderer** | 4 variantes retornan string no-vacio | `renderTree({ ..., color: false })` — assert no-empty |
| **Unit — treeRenderer** | `color: false` sin `\x1b[` | `expect(output).not.toMatch(/\x1b\[/)` |
| **Unit — treeRenderer** | `color: true` contiene `\x1b[` | `expect(output).toMatch(/\x1b\[/)` |
| **Unit — treeRenderer** | `height: N` → `nonEmptyLines >= N` | Contar lineas en output |
| **Unit — treeRenderer** | `ascii` variant → solo ASCII printable | `expect(output).not.toMatch(/[^\x20-\x7e\n]/)` |
| **Unit — treeRenderer** | `ornaments` variant → contiene ornamentos | Buscar `o`, `@`, o `#` en el cuerpo |
| **Unit — treeRenderer** | `unknown variant` → `RangeError` | `expect(() => renderTree({variant: 'bad', ...})).toThrow(RangeError)` |
| **Unit — treeRenderer** | Performance < 10ms | `performance.now()` antes/despues; `expect(elapsed).toBeLessThan(10)` |
| **Integration — tree command** | Default invocation → classic@10 | Spy `console.log`; invoke action handler con defaults |
| **Integration — tree command** | `noColor: true` → sin ANSI | Capturar output; `not.toMatch(/\x1b\[/)` |
| **Integration — tree command** | `variant: 'ascii'` → output ASCII-only | Capturar; no unicode |
| **Integration — tree command** | `variant: 'invalid'` → `process.exit(1)` | `vi.spyOn(process, 'exit')`; assert llamado con `1` |

Convencion de tests de integracion: `tree.test.js` importa y ejecuta directamente el action handler (patrón de `estimateCommand.integration.test.js`). No lanza procesos hijo.

**Orden TDD obligatorio (NFR-4):**
1. Crear `treeRenderer.test.js` → `pnpm test` FALLA (RED)
2. Crear `treeRenderer.js` → `pnpm test` PASA (GREEN)
3. Crear `tree.test.js` → `pnpm test` FALLA en nuevos tests (RED)
4. Crear `tree.js` + modificar `funky.js` → `pnpm test` PASA (GREEN)

---

## NFR Compliance

| NFR | Como se cumple |
|---|---|
| **NFR-1 Terminal Portability** | Deteccion dual `isTTY + NO_COLOR` en `tree.js`; flag `--no-color` como override; `treeRenderer.js` nunca toca globals de proceso |
| **NFR-2 Sync < 10ms** | `renderTree` es sincrona pura; sin I/O, sin lazy requires; test de performance con `performance.now()` en `treeRenderer.test.js` |
| **NFR-3 Zero external deps** | `node:util` `styleText` (built-in) o ANSI raw; sin entradas nuevas en `package.json` |
| **NFR-4 Strict TDD** | Tests escritos antes de cada modulo; `program.addCommand` wiring y constantes ANSI hardcodeadas exentas per politica activa |

---

## Open Questions

- [ ] **Algoritmo de ornamentos:** ¿Posicion determinista por indice de fila (recomendado para evitar tests fragiles) o pseudoaleatoria con mock de `Math.random`? **Recomendacion:** determinista por `rowIndex % 3` o similar.
- [ ] **Estrella en la copa (`classic`):** ¿Caracter Unicode (star emoji) o ASCII `*`? Unicode romperia el test de variante `ascii` si se comparte logica, pero `classic` y `ascii` son builders separados — confirmar que el builder `classic` puede usar caracteres no-ASCII sin problema.
- [ ] **Height maximo:** La spec no define limite superior. ¿Validar `height <= 100` defensivamente para NFR-2 en alturas extremas?
