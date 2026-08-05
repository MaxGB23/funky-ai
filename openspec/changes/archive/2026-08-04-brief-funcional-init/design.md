# Design: Brief funcional obligatorio en `funky init`

## Technical Approach
Refactor `funky-cli/src/commands/init.js` al patrón de función pura del repo (scaffold/feature/skills/assess/estimate exponen `runXxx`): extraer `runInit({ templatesDir, targetBase })` que retorna intentions ordenadas SIN I/O ni process.exit. Nuevo template estático `brief-funcional.md` (12 ítems §13, placeholder `[Completar]`). El action conserva el guard EXACTO y delega skip-if-exists a `executeIntentions` (fs-adapter.js:54-58 ya salta copies cuyo dest existe). Docs `init.md` 3→4 outputs; `--help` se actualiza solo vía `enrichCommandHelp` (bin/funky.js:35 inyecta docs/funky-forge/<name>.md). Cubre R1, R6-R9.

## Architecture Decisions

### D1 — runInit: firma y retorno
| Option | Tradeoff | Decision |
|---|---|---|
| a) Pura, retorna intentions | Tests unitarios triviales; cero I/O (R8) | ✅ |
| b) existsSync interno | Rompe "sin efectos de I/O" | ✗ |

```js
export function runInit({ templatesDir, targetBase }) {
  const canvasDir = path.join(targetBase, 'docs', 'funky-ai', 'canvas');
  return [
    { action: 'mkdir', dest: canvasDir },
    { action: 'copy', src: path.join(templatesDir, 'brief-funcional.md'), dest: path.join(canvasDir, 'brief-funcional.md') },
    { action: 'copy', src: path.join(templatesDir, 'PROJECT-CANVAS.md'), dest: path.join(canvasDir, 'PROJECT-CANVAS.md') },
    { action: 'copy', src: path.join(templatesDir, 'INFRA-CANVAS.md'), dest: path.join(canvasDir, 'INFRA-CANVAS.md') },
    { action: 'copy', src: path.join(templatesDir, 'canvas-planning-guide.md'), dest: path.join(canvasDir, 'canvas-planning-guide.md') },
  ];
}
```
brief ANTES que PROJECT/INFRA (R7, secuencia §13 "primero qué, luego cómo"). Sin `create`, sin `optional`.

### D2 — Skip-if-exists: delegar a executeIntentions
| Option | Tradeoff | Decision |
|---|---|---|
| a) brief+guide SIEMPRE en el array; skip en executeIntentions | Cero I/O en runInit; la guía pasa a loguear skip | ✅ |
| b) Precondición existsSync en action (código hoy, init.js:33) | Duplica lógica y mete I/O | ✗ |

`executeIntentions` (fs-adapter.js:37-58) procesa en orden estable (for-of) y salta copy cuyo dest existe con log `⚡ Salteando (ya existe)` + skippedCount. Cubre R7 (brief no se sobrescribe, "sin error") y R2 (guide reutilizada) sin precondiciones. **Desviación justificada**: hoy la guía no entra al array si existe → sin log; tras el refactor emite el skip log. docs/funky-forge/init.md:82 YA documenta ese log → el código se alinea con la doc.

### D3 — Guard preservado EXACTO en el action
| Option | Tradeoff | Decision |
|---|---|---|
| a) Inline existsSync en action (byte-idéntico) | R3 "guard y mensajes sin cambios"; cero regresión | ✅ |
| b) Helper findCanvases | Mueve lógica → diff y riesgo innecesarios | ✗ |

Se mantiene: paths PROJECT/INFRA, mensaje `❌ Error: Ya existe PROJECT-CANVAS.md o INFRA-CANVAS.md en docs/funky-ai/canvas/.`, exit(1). Brief NO participa del guard (R7). Catch genérico → error + exit(1) intacto (R4).

### D4 — Template: H2 numeradas, coherente con los canvases
| Option | Tradeoff | Decision |
|---|---|---|
| a) `## N. Título` + comentario + `[Completar]` | Mismo formato que PROJECT-CANVAS.md | ✅ |
| b) Bold + bullets (estilo estimate) | Formato de otra familia de templates | ✗ |

`brief-funcional.md`: `# 📋 BRIEF FUNCIONAL`, intro (definir "qué" y "para quién" antes del stack), 12 secciones `## N. <ítem §13>` (recomendaciones-agente.md:415-426) cada una con comentario guía `<!-- ... -->` + línea `[Completar]`. NUNCA `[Responde aquí]` (R6 — evita inflar `countUnfilledSections` de context.js).

### D5 — Layout de tests: rename + 2 archivos nuevos
| Option | Tradeoff | Decision |
|---|---|---|
| a) `git mv init.test.js→scaffold.test.js`; nuevo init.test.js + init.integration.test.js | Convención 1 archivo/comando; git detecta rename (misma similitud) | ✅ |
| b) runInit dentro de init.test.js actual | Perpetúa el misnomer (explore #3) | ✗ |

Hoy NO existe scaffold.test.js; init.test.js (170 líneas) solo testea runScaffold. Rename preserva contenido (test de runScaffold sin tocar); nuevo init.test.js cubre runInit + guard + template; init.integration.test.js el flujo real (patrón scaffold.integration.test.js: tmp bajo process.cwd()).

### D6 — Contrato docs
- `docs/funky-forge/init.md`: árbol inputs +`brief-funcional.md`; outputs 4 con brief PRIMERO; diagrama ya nombra runInit (hoy inexistente) → queda real; "¿Qué problema resuelve?" pasa de "dos archivos base" a cuatro; salida esperada añade línea del brief. Nada más: `--help` se alimenta del doc (help.js:63-70 loadCommandDoc → bin/funky.js:35 enrichCommandHelp).

## Data Flow
```
funky init (action)
  ├─ guard: existsSync(PROJECT||INFRA)? → ❌ mensaje + exit(1)  [EXACTO]
  ├─ runInit({ templatesDir: ../templates/init, targetBase: cwd })
  │     → [mkdir canvas, copy brief, copy PROJECT, copy INFRA, copy guide]
  ├─ executeIntentions(intentions)   [skip silencioso si dest existe]
  │     ├─ mkdir docs/funky-ai/canvas/
  │     ├─ copy brief-funcional.md → docs/funky-ai/canvas/
  │     ├─ copy PROJECT-CANVAS.md / INFRA-CANVAS.md
  │     └─ copy canvas-planning-guide.md (skip si ya existe)
  └─ logs por operación + "✅ Canvases creados. Ejecuta `funky scaffold`..." (R5)
```

## File Changes
| File | Action | Description |
|------|--------|-------------|
| `funky-cli/src/templates/init/brief-funcional.md` | Create | 12 ítems §13, `[Completar]` |
| `funky-cli/src/commands/init.js` | Modify | `export function runInit`; action = guard + runInit + executeIntentions |
| `funky-cli/tests/init.test.js` | Rename→`scaffold.test.js` | `git mv`, contenido intacto |
| `funky-cli/tests/init.test.js` | Create | runInit (orden/rutas/no-I/O) + guard + template R6 |
| `funky-cli/tests/init.integration.test.js` | Create | flujo real en tmp: 4 archivos, brief primero, no-overwrite |
| `docs/funky-forge/init.md` | Modify | árbol 3→4, diagrama, descripción, salida esperada |

## Interfaces / Contracts
```js
/** @returns {Array<{action:'mkdir'|'copy', src?:string, dest:string}>} */
runInit({ templatesDir, targetBase }); // pura: sin fs, sin console, sin process.exit
```
Retorno consumido por `executeIntentions` (fs-adapter.js:27, 32). Orden estable garantizado por for-of.

## Testing Strategy (Strict TDD — pnpm test, vitest)
| Layer | What | Approach |
|-------|------|----------|
| Unit | runInit: intentions[0]=mkdir canvasDir; índice copy brief < copy PROJECT < copy INFRA; 5 intenciones, 0 create | puro, sin mocks |
| Unit | runInit no hace I/O: spies sobre fs.existsSync/readFileSync NO llamados | vi.spyOn |
| Unit | Guard R8: existsSync(PROJECT)=true → `initCommand.parse(['node','init'])` → exit(1) + mensaje exacto; copyFileSync NO llamado | harness assess.test.js:189 (exitSpy mockImplementation + applyMocks) |
| Unit | Template R6: leer archivo real; 12 headers `## N.`; `[Completar]` presente; `[Responde aquí]` ausente | real-file (patrón templates.test.js) |
| Integration | tmp: 4 archivos creados; brief pre-existente → no sobrescritura + canvases OK + exit(0); guide pre-existente → skip | real fs, tmp bajo cwd |

## Threat Matrix
N/A — el cambio no toca routing, shell, subprocess, VCS/PR automation ni clasificación de ejecutables. El template es Markdown documental copiado exactamente como los canvases existentes (sin ejecución); el único proceso-exit (guard) es pre-existente e inalterado (D3). No se introduce frontera de proceso nueva.

## Migration / Rollout
No migration. Cambio aditivo: findCanvases/countUnfilledSections solo leen PROJECT/INFRA; estimate consume el brief vía `--brief` (R7 ya acepta paths). Rollback: revert del commit → árbol vuelve a 3 outputs.

## Open Questions
- [ ] ¿Actualizar `.description()` de initCommand (hoy solo menciona los canvases)? Fuera de spec (R5 protege mensajes); opcional.
