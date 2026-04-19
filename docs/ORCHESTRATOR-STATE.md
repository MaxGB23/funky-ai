# ORCHESTRATOR-STATE.md
> Archivo canónico de estado. Leer al inicio de CADA sesión de Orquestador antes de hacer cualquier cosa.

---

## 🎯 Objetivo Actual
**V1.4 CLI BOOTSTRAP**. 🟡 IN PROGRESS.

## 📋 Estado del Proyecto
- **Versión activa:** v1.3.0 (Stable) ✅
- **Rama activa:** `feature/v1.4-init-bootstrap` 🌿
- **Siguiente acción inmediata:** Delegar **Fase 1: Templates** a Worker Flash.
- **Métrica Clave:** v1.3 logró una reducción de ~80% en el peso de las reglas core.

## ✅ Completado en Esta Sesión (V1.3 Token Diet)
- Fase 0 ✅ — Infraestructura Git-Ops.
- Fase 1 ✅ — Inventario y análisis.
- Fase 2 ✅ — Reglas Core optimizadas.
- Fase 3 ✅ — Teoría y Guías optimizadas (-2200 tokens).
- Fase 4 ✅ — Consolidación Flash.
- Fase 5 ✅ — QA QA Técnico & Model Benchmark (Completado: `MERGE WITH AMENDMENTS`).

## 🧠 Instrucciones Aprendidas
- ### [DISCOVERY] Model Efficacy & Quota Optimization
**What:** Gemini 3 Flash es ideal para tareas de Worker (picar código/templates) por su velocidad. Gemini 3.1 Pro Low es el "punto dulce" para Orquestación, ofreciendo estabilidad sin el consumo masivo de Pro High.
**Why:** El tráfico alto genera errores de retry que pueden agotar cuotas; modelos más ligeros fallan menos y responden más rápido.
**Where:** Workflow de ruteo de modelos en Funky AI.
**Learned:** Reservar Sonnet 4.6 Thinking / Pro High solo para crisis arquitectónicas o refactors masivos.
- **Peligro de Flash:** Gemini Flash NO debe usarse para comprimir reglas filosóficas abstractas; poda las heurísticas críticas creyendo que son cháchara. Para "downscaling" del core vital, usar modelos Pro.

## 🔴 Pending Inmediato
- Ninguno.

## 📁 Archivos Clave
- `docs/openspec/changes/v1.3-token-diet/fase-3-report.md` — Reporte de mutación de guías.
- `docs/openspec/changes/v1.3-token-diet/tasks.md` — Plan maestro.
