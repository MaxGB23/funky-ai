# Protocolo: SDD Micro-Planner

**Objetivo:** Generar un plan de implementación detallado (`implementation_plan.md`) ANTES de delegar tareas complejas o de alto riesgo a un Worker.

## Instrucciones para el Orquestador

Cuando se activa este protocolo para una fase marcada con `[⚠️ RIESGO ALTO]`, tu objetivo cambia: ya no delegás inmediatamente al Worker, sino que generás un plano detallado para asegurar la ejecución correcta.

1. **Analizar la Tarea:** Revisá la especificación técnica (`spec.md`) y las tareas asignadas (`tasks.md`) para la fase en cuestión.
2. **Generar el Plan de Implementación (`implementation_plan.md`):**
   - El plan debe desglosar la implementación a nivel de archivos, funciones y líneas de código relevantes.
   - Identificá dependencias exactas y cambios en flujos de datos.
   - Especificá cómo verificar que los cambios funcionan (Testing / QA).
   - Documentá posibles efectos secundarios (side effects) y cómo mitigarlos.
3. **Revisión del Humano:** Solicitá al humano la revisión y aprobación de este plan ANTES de continuar.
4. **Actualizar el Handoff:** Una vez aprobado, incluí el contenido del `implementation_plan.md` (o una referencia muy clara) como contexto fundamental en el `worker-handoff.md` correspondiente.
