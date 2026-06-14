# Reporte de Benchmark: Gemini 3.5 Flash (Low)

## Métricas Obtenidas
- **Modelo:** Gemini 3.5 Flash (Low)
- **Tag:** `3.5-flash-low`
- **Latencia:** 322 ms
- **Tokens de Entrada (Estimados):** 390
- **Tokens de Salida (Estimados):** 34
- **Tokens Totales (Estimados):** 424

## Detalles de Ejecución
- **Timestamp:** 2026-06-14T03:55:23.418Z
- **Comando Trivial Ejecutado:** Ejecutar `pnpm -v` y listar directorios de primer nivel.
- **Resultado de Comando:**
  - Versión pnpm: `11.5.0`
  - Directorios detectados: `.agents`, `.antigravitycli`, `.atl`, `.git`, `.github`, `comparativas-tokens`, `docs`, `funky-cli`, `scratch`, `scripts`

## Análisis de Rendimiento
La latencia de **322 ms** demuestra una respuesta sumamente rápida para tareas triviales. Con un consumo estimado de **424 tokens totales**, este modelo se posiciona de forma muy eficiente en consumo energético y de red.

---

## Fase 2.1 — Ejecución benchmark para Gemini 3.5 Flash (Low)
- **Status:** ✅ Completada
- **Archivos creados/modificados:**
  - `docs/openspec/changes/consumo-insano/results/results-3.5-flash-low.json`
  - `docs/openspec/changes/consumo-insano/results/report-3.5-flash-low.md`
- **Bugs encontrados:** Ninguno
- **Próxima acción:** Proceder con la Fase 2.2 para Gemini 3.5 Flash (Medium).
