# Tareas: Auditoría Crítica v1.7.0

## Fase 1: Análisis Estático y Redacción de Simulaciones
- [ ] Auditar el código de `funky-cli/src/commands/init.js` y `phase.js` buscando flujos destructivos (ej. sobreescritura, borrado sin backup) y manejos pobres de errores.
- [ ] Crear el archivo `docs/funky-ai/cli-simulations.md`.
- [ ] Redactar la matriz de simulaciones (mínimo 5 escenarios incluyendo `fromHeadless` y Ctrl+C) con sus resultados esperados vs actuales.
- [ ] **STOP ORQUESTADOR:** Pausar la ejecución. El Worker debe emitir un reporte y pedirle al humano/Orquestador que apruebe el documento de simulaciones antes de tocar código.

## Fase 2: Fix de Código (TDD)
- [ ] Escribir test automatizado que falle (demostrando el bug de Headless Overwrite).
- [ ] Implementar el fix en `init.js` (evitar que `runInit` pise el canvas si viene de headless).
- [ ] (Opcional) Implementar fixes adicionales descubiertos en la Fase 1, si aplican.
- [ ] Asegurar que `npm run test` (o `pnpm test`) devuelva todo en verde.

## Fase 3: Documentación y Cierre
- [ ] Actualizar el Return Envelope (`report.md`) con el listado final de bugs fixeados.
- [ ] Extraer cualquier nuevo aprendizaje al `docs/engram/bugfixes.md` o `discoveries.md`.
- [ ] Instruir al Humano a volver al Orquestador para actualizar el `ORCHESTRATOR-STATE.md`.
