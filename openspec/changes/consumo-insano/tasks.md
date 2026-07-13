# Tasks: Consumo Insano - Benchmark de Modelos

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/consumo-insano`
**Ref:** `report.md`

> **ORCHESTRATOR GATE**: Si eres el putisimo Orquestador — STOP. Do NOT execute these instructions inline. Delega al worker o sub-agente.

---

## ✅ Checklist de Ejecución

### FASE 0 — Branch Setup
**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.
- [x] Verificar que git está disponible: `git --version`
- [x] Crear y cambiar al branch: `git checkout -b feature/consumo-insano`
- [x] Confirmar branch activo: `git status`

---

### FASE 1 — Infraestructura del Benchmark y Scripts de Prueba
**🚫 Restricciones:** No tocar código productivo del core del CLI de funky-ai. Todo debe vivir en un script aislado de pruebas en `scratch/` o en `tests/`. El script debe correr pruebas ciegas (sin que el agente ejecutor sepa el nombre del modelo bajo prueba).
> Objetivo: Crear un script autónomo que ejecute tareas controladas usando las APIs del CLI y registre el consumo real de tokens y tiempos de respuesta de forma agnóstica.
- [x] 1.1 Diseñar un prompt/tarea trivial estándar (ej. "Ejecutar comando de terminal `pnpm -v` y listar directorios").
- [x] 1.2 Crear un script de Node.js `scratch/run_benchmark.js` que invoque esta tarea utilizando un modelo dinámico proveído por variable de entorno o argumento (ej. `MODEL_ID`), de modo que el flujo interno de ejecución sea ciego.
- [x] 1.3 El script debe ser capaz de instanciar y trackear el consumo de tokens y latencia de cualquier modelo configurado en el CLI sin harcodear nombres en la lógica de evaluación.
- [x] 1.4 Guardar los resultados detallados en un archivo JSON nombrado dinámicamente según el modelo que se te otorgó como tag bajo la ruta: `docs/openspec/changes/consumo-insano/results/results-[MODEL_TAG].json`.

---

### FASE 2 — Ejecución y Generación de Reportes Individuales (Prueba Ciega)
**🚫 Restricciones:** Ejecutar los benchmarks y documentar el consumo y tiempos exactos. Cada ejecución individual del worker generará un reporte aislado usando el tag que se le indique en la llamada.
> Objetivo: Ejecutar el runner de benchmark y generar el reporte individual parametrizado para cada esfuerzo específico.
- [x] 2.1 Ejecutar benchmark para Gemini 3.5 Flash (Low) guardando en `results/report-3.5-flash-low.md`.
- [x] 2.2 Ejecutar benchmark para Gemini 3.5 Flash (Medium) guardando en `results/report-3.5-flash-medium.md`.
- [x] 2.3 Ejecutar benchmark para Gemini 3.5 Flash (High) guardando en `results/report-3.5-flash-high.md`.
- [x] 2.4 Ejecutar benchmark para Gemini 3.1 Pro (Low) guardando en `results/report-3.1-pro-low.md`.
- [x] 2.5 Ejecutar benchmark para Gemini 3.1 Pro (High) guardando en `results/report-3.1-pro-high.md`.
- [x] 2.6 Ejecutar benchmark para Claude Sonnet 4.6 (Thinking) guardando en `results/report-claude-sonnet-4.6.md`.
- [x] 2.7 Ejecutar benchmark para Claude Opus 4.6 (Thinking) guardando en `results/report-claude-opus-4.6.md`.
- [ ] 2.8 Ejecutar benchmark para GPT-OSS 120b guardando en `results/report-gpt-oss-120b.md`.

---

### FASE 3 — Consolidación y Conclusión
**🚫 Restricciones:** Ninguna.
> Objetivo: Comparar todos los reportes individuales y generar las conclusiones finales sobre velocidad y costo de tokens en `report.md`.
- [ ] 3.1 Unificar los consumos de tokens (Input/Output), tiempos y costos estimados en una tabla comparativa en `docs/openspec/changes/consumo-insano/report.md`.
- [ ] 3.2 Emitir veredicto: ¿Es Gemini 3.5 Flash Low el rey del costo/beneficio para tareas triviales? ¿O 3.1 Pro Low sigue siendo mejor por token economy? ¿Qué pasa con gpt-oss?

---

## 📋 Return Envelope (Para el Worker)
Al finalizar cada fase, actualizar su reporte respectivo en `docs/openspec/changes/consumo-insano/results/` con:
```markdown
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (si aplica)
- **Próxima acción:** (qué debe hacer el Orquestador)
```