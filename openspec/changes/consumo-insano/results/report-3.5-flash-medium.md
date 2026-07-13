# Reporte de Benchmark: Gemini 3.5 Flash (Medium)

## Métricas Obtenidas
- **Modelo:** Gemini 3.5 Flash (Medium)
- **Tag:** `3.5-flash-medium`
- **Latencia:** 335 ms
- **Tokens de Entrada (Estimados):** 390
- **Tokens de Salida (Estimados):** 34
- **Tokens Totales (Estimados):** 424

## Detalles de Ejecución
- **Timestamp:** 2026-06-14T03:57:14.407Z
- **Comando Trivial Ejecutado:** Ejecutar `pnpm -v` y listar directorios de primer nivel.
- **Resultado de Comando:**
  - Versión pnpm: `11.5.0`
  - Directorios detectados: `.agents`, `.antigravitycli`, `.atl`, `.git`, `.github`, `comparativas-tokens`, `docs`, `funky-cli`, `scratch`, `scripts`

## Análisis de Rendimiento
La latencia de **335 ms** es sumamente rápida, muy cercana a la obtenida en el tier de baja prioridad (322 ms). Con un consumo estimado idéntico de **424 tokens totales**, este modelo de prioridad media mantiene un tiempo de respuesta óptimo para tareas rutinarias sin penalizar la velocidad.

---

## Fase 2.2 — Ejecución benchmark para Gemini 3.5 Flash (Medium)
- **Status:** ✅ Completada
- **Archivos creados/modificados:**
  - `docs/openspec/changes/consumo-insano/results/results-3.5-flash-medium.json`
  - `docs/openspec/changes/consumo-insano/results/report-3.5-flash-medium.md`
- **Bugs encontrados:** Ninguno
- **Próxima acción:** Proceder con la Fase 2.3 para Gemini 3.5 Flash (High).
