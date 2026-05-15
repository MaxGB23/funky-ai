# Análisis de Arquitectura v2.0.1 — Directorio de Trabajo

Este directorio agrupa los artefactos actuales (v2.0.0) para auditar el problema de *Context Fading* y planificar el fix para la versión v2.0.1.

## Archivos Analizados
1. `GEMINI-funky-global.md` (Capa 1): Analizado. Contiene personalidad y tono. Limpio de lógica operativa.
2. `sdd-orchestrator-core.md` (Capa 2): Analizado. Contiene principios core, pero le falta la operativa diaria.
3. `sdd-orchestrator.md` (Capa 2 / Legacy): Analizado. Contiene la lógica profunda que se intentó mover a la Capa 3.
4. `funky-orchestrator.md` (Capa 3 / Workflow): Analizado. Sufre de *Context Fading* por ser inyectado como mensaje de usuario en sesiones largas.
5. `funky-worker.md` (Capa 3 / Workflow): Analizado. Funciona perfecto porque las sesiones de worker son cortas y atómicas.

## Resultados
Ver [conclusiones.md](./conclusiones.md) para el diagnóstico profundo y el plan de acción concreto para la v2.0.1.
