## Fase 1, 2 y 3 — Scaffolding Fixes
- **Status:** ✅ Completada
- **Archivos creados/modificados:**
  - `funky-cli/scripts/sync-templates.js` (creado — script Node ESM que copia 4 archivos del workspace padre hacia `src/templates/bootstrap`. Usa `fs.copyFileSync` nativo, manejo de errores con `process.exit(1)` y warning no-fatal si el origen no existe)
  - `funky-cli/package.json` (modificado — se agregó script `"sync": "node scripts/sync-templates.js"` y se actualizó `"test"` a `"npm run sync && vitest run"` para ejecutar el sync automáticamente antes de cada test run)
  - `funky-cli/src/commands/init.js` (modificado — se agregó entrada `{ src: 'plantilla-worker-handoff.md', dest: path.join('docs', 'funky-ai', 'workers', 'plantilla-worker-handoff.md') }` al array `filesToCopy` de `runInit`)
  - `funky-cli/tests/init.test.js` (modificado — se sincronizó el array `filesToCopy` del unit test con el nuevo estado de `init.js` (7 entradas vs 6 anteriores) para que los `expect(result.created).toBe(filesToCopy.length)` continúen siendo correctos)
  - `funky-cli/tests/init.integration.test.js` (modificado — se agregó nuevo test `'debería copiar la plantilla canónica worker-handoff al nuevo workspace'` que aserta existencia y contenido del archivo en disco)
- **Bugs encontrados:**
  - **[OUT OF SCOPE — DOCUMENTADO]** El path especificado en `spec.md` para la plantilla era `docs/funky-ai/workers/plantilla-worker-handoff.md`, pero ese archivo no existía en el workspace. La fuente canónica real es `funky-cli/src/templates/sdd/worker-handoff.md`. Se usó esa fuente real. El `spec.md` tiene un path incorrecto que debería corregirse en una futura revisión documental.
- **Tests:** 17/17 ✅ (`pnpm test` = sync automático + vitest run)
- **Próxima acción:** Volver al Orquestador para:
  1. Actualizar `ORCHESTRATOR-STATE.md` — marcar los dos bugs de scaffolding como ✅ resueltos.
  2. Lanzar el **Smoke Test v1.7.0 (Reintento Final)** — flujo out-of-workspace completo.
