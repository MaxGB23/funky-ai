# Resumen: Fase 4 — Integración (Pipeline unificado)

> Estado: **Completada**
> Inicio: 2026-07-28
> Compleción: 2026-07-28

---

## Objetivo

Unir `init → assess → estimate` en un pipeline coherente con estado compartido. Los comandos existían como islas independientes sin comunicación entre sí, lógica duplicada de discovery de canvases, y un contrato frágil basado en parseo de markdown.

## Filosofía

El CLI nunca resuelve nada solo — solo inyecta materiales y facilita discusiones. El pipeline no cambia esa filosofía: conecta las fases con datos estructurados (`context.json`) para que el humano+IA tenga continuidad, no para automatizar decisiones.

## Qué se hizo

### SDD completo (explore → archive)

| Fase | Resultado |
|------|-----------|
| **Explore** | Investigación de init, assess, estimate como islas. 6 problemas clave encontrados: sin estado compartido, lógica duplicada (`findCanvases` x2), contrato frágil (markdown), `process.exit(0)` en ambos, sin feedback cross-phase |
| **Propose** | Propuesta: shared `context.js` module + `--context` flag + `funky pipeline` orchestrator. Aprobado con `size:exception` (650-750 líneas estimadas) |
| **Spec** | 3 specs: 2 deltas (assess + estimate) y 1 full (pipeline + context module). 17 requirements, 36 escenarios GIVEN/WHEN/THEN |
| **Design** | 4 decisiones arquitectónicas: context.json, llamadas directas, módulo de funciones puras, migración de funciones infra a context.js |
| **Apply** | 15 tasks en 4 batches. Batch 1: context.js → Batch 2: assess refactor → Batch 3: estimate refactor → Batch 4: pipeline.js |
| **Verify** | PASS — 17/17 requirements, 36/36 escenarios, 140 tests |

### Implementación

1. **context.js** — Nuevo módulo compartido con 6 funciones:
   - `initContext()` — estructura default del context.json
   - `readContext(targetBase)` — lectura + parseo de context.json
   - `writeContext(targetBase, ctx)` — escritura de context.json
   - `findCanvases(targetBase)` — discovery de canvases (root → docs/ fallback)
   - `countUnfilledSections(markdown)` — conteo de `[Responde aquí]`
   - `loadDecisions(targetBase, decisionsPath?)` — lectura de archivo de decisiones

2. **assess.js** — Refactor:
   - `runAssess(targetBase, opts)` extraída del callback de Commander
   - `--context` / `-c` flag opcional (sin flag = comportamiento exacto de hoy)
   - Con `--context`: lee canvases desde context.json, escribe `assess.runAt` + `dynamicQuestions`
   - `process.exit(0)` movido al callback de Commander únicamente

3. **estimate.js** — Refactor:
   - `runEstimate(targetBase, opts)` extraída del callback de Commander
   - `--context` / `-c` flag opcional
   - Con `--context`: lee decisions path desde context.json, escribe `estimate.runAt`
   - `loadDecisions()` y `findCanvases()` migrados a context.js
   - `process.exit(0)` movido al callback de Commander únicamente

4. **estimateDomain.js** — Limpieza:
   - Removidas 4 funciones infra (`findCanvases`, `findCanvas`, `countUnfilledSections`, `loadDecisions`)
   - Solo quedan funciones de dominio de pricing

5. **pipeline.js** — Nuevo comando con 4 subcomandos:
   - `funky pipeline assess` — init context si falta, corre assess con `--context`
   - `funky pipeline estimate` — valida que assess ya se haya ejecutado, corre estimate
   - `funky pipeline all` — assess → estimate secuencial; si assess falla, no corre estimate
   - `funky pipeline status` — muestra estado del pipeline desde context.json

6. **context.json schema:**
   ```json
   {
     "version": 1,
     "createdAt": "<ISO>",
     "canvases": {
       "projectCanvas": "<content|null>",
       "projectSource": "root|docs|null",
       "infraCanvas": "<content|null>",
       "infraSource": "root|docs|null",
       "unfilledCount": 0
     },
     "assess": { "runAt": "<ISO|null>", "dynamicQuestions": [] },
     "estimate": { "runAt": null },
     "pipeline": { "lastCommand": null, "completed": [] }
   }
   ```

## Archivos modificados/creados

| Archivo | Cambio |
|---------|--------|
| `funky-cli/src/utils/context.js` | **Nuevo:** ~80 líneas. 6 funciones compartidas |
| `funky-cli/src/commands/pipeline.js` | **Nuevo:** ~120 líneas. 4 subcomandos |
| `funky-cli/tests/context.test.js` | **Nuevo:** 15 tests unitarios |
| `funky-cli/tests/pipeline.test.js` | **Nuevo:** 9 tests de integración |
| `funky-cli/src/commands/assess.js` | Modificar: +`runAssess()`, +`--context` flag, exit(0) en callback |
| `funky-cli/src/commands/estimate.js` | Modificar: +`runEstimate()`, +`--context` flag, imports desde context.js |
| `funky-cli/src/utils/estimateDomain.js` | Modificar: -4 funciones infra, solo dominio pricing |
| `funky-cli/bin/funky.js` | Modificar: +registro de `pipeline` command |
| `funky-cli/tests/assess.test.js` | Modificar: +3 tests `--context` |
| `funky-cli/tests/estimate.test.js` | Modificar: +3 tests `--context`, tests movidos eliminados |
| `openspec/specs/pipeline/spec.md` | **Nuevo:** spec canónico del dominio pipeline |
| `openspec/specs/assess/spec.md` | Actualizado: merge delta con R-A1, R-A2 |
| `openspec/specs/estimate/spec.md` | Actualizado: merge delta con R-E1, R-E2, R-E3 |

## Descubrimientos

- **El patrón de funciones puras + command wrapper es sólido** — `runAssess()` y `runEstimate()` como funciones síncronas (no async) porque Commander v14 llama `.action()` de forma síncrona y los tests existentes usan `parse()` sin `await`. Hacerlas async rompía tests existentes.
- **Commander v14 + `{ from: 'user' }`** — los tests de pipeline.js necesitan `pipelineCommand.parse(['subcommand'], { from: 'user' })` porque Commander con `from: 'user'` trata todos los argv como-is (sin slice(2)).
- **`return` después de `process.exit()` en tests** — necesario porque los spies de `process.exit` no detienen la ejecución, y el código seguiría ejecutándose después del mock.
- **JSON como formato de contexto** — Node-native, zero-dependency, human-readable. Funciona perfecto para el caso de uso (archivo chico, escrituras poco frecuentes).
- **`opts.context` vs `opts.contextPath`** — En la implementación se unificó a `opts.context` (booleano trigger + path desde process.cwd()), que es más simple que pasar rutas absolutas. Queda una inconsistencia menor vs el spec que menciona `contextPath`.

## Problemas encontrados y resueltos

- **Mock de `fs` + `node:fs` en tests** — El proyecto tiene algunos usando `vi.mock('fs')` y otros con mock manual. Para los tests de `--context` hubo que alinear ambos mocks para que `readContext`/`writeContext` (que usan `node:fs`) funcionaran junto con los mocks existentes de `fs`.
- **`runAssess` síncrono vs async** — El design especificaba `async function` pero los 10 tests existentes de assess llaman `assessCommand.parse()` sin await. Se implementó como síncrono para mantener backward compatibility. Si se necesita async en el futuro, es un cambio trivial.
- **Deduplicación en estimateDomain.js** — Las funciones `findCanvases`, `findCanvas`, `countUnfilledSections`, `loadDecisions` se movieron a context.js sin cambiar firma ni comportamiento. estimateDomain.js quedó solo con funciones de dominio de pricing.

## Lo que quedó pendiente

- **Commit y PR** — La fase se implementó completa pero sin commit. Hacer commit en `feat/fase-4-integracion` (desde `feat/fase-3-estimate`) y abrir PR contra `main`.
- **Tests de integración real (no mockeados)** — Los tests de pipeline.js usan mocks de `runAssess`/`runEstimate`. Una mejora futura sería tener un test de integración real que cree archivos temporales y corra el pipeline completo.
- **Unificar `opts.context` vs `opts.contextPath`** — En el spec de assess se menciona `contextPath` pero la implementación usa `context`. No afecta funcionalidad pero puede confundir a futuros mantenedores.

## Stats finales

| Métrica | Valor |
|---------|-------|
| SDD phases | explore → propose → spec → design → tasks → apply → verify → archive |
| Requirements | 17 (2 assess + 3 estimate + 7 pipeline + 5 context) |
| Escenarios | 36/36 compliant |
| Tests nuevos | 27 (15 context + 9 pipeline + 3 assess + 3 estimate - 3 movidos) |
| Tests totales | 140 pasan (17 archivos) |
| Archivos cambiados (fase completa) | 13 (5 nuevos, 8 modificados) |
| Líneas agregadas | ~450 |
| Líneas eliminadas | ~200 |
| Size exception | Aprobado (~650-750 líneas sobre budget de 400) |
