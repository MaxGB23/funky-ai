# Tareas: Scaffolding Fixes v1.7.0

## Fase 1: Sync Script & Package JSON
- [ ] Crear el script `funky-cli/scripts/sync-templates.js` con manejo de errores (fs.copyFileSync, try/catch).
- [ ] Modificar `funky-cli/package.json` para inyectar el script `"sync"` y atarlo a la ejecución de tests (ej. `"pretest": "npm run sync"`).
- [ ] Ejecutar manualmente `pnpm run sync` dentro de `funky-cli` y validar que el archivo `plantilla-worker-handoff.md` (y el resto) aparece correctamente en `src/templates/bootstrap/`.

## Fase 2: Fix de Scaffolding (`init.js`)
- [ ] Agregar el copiado de `plantilla-worker-handoff.md` al array `filesToCopy` en `funky-cli/src/commands/init.js`.
- [ ] Actualizar tests de integración (`init.integration.test.js` o similares) para asertar que la plantilla canónica se escribe exitosamente en el disco.
- [ ] Ejecutar `pnpm test` (que ahora debería correr el sync automáticamente antes de testear) y validar que da todo verde.

## Fase 3: Cierre
- [ ] Llenar `report.md`.
- [ ] Instruir al Humano a volver al Orquestador.
