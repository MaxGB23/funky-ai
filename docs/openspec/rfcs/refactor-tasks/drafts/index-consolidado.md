# RFC: Refactor Tasks — Índice Consolidado de Decisiones y Resoluciones

Este documento sirve como el nuevo índice que recopila las resoluciones de diseño definitivas tomadas para resolver los conflictos operativos, la ejecución de batches, el testing automatizado y el flujo determinista de cierre de features.

Estas decisiones están consolidadas de forma estructurada para su futura unificación con los documentos oficiales en `./index.md`.

---

* 📄 **[draft-consolidado.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/drafts/draft-consolidado.md)**
  * **Propósito:** Registrar con máximo detalle y de forma consolidada las resoluciones de diseño sobre flujo de cierre, batching secuencial de tareas, testing por Tier y estrategia de aseguramiento de calidad (QA).
  * **Cuándo leerlo:** Al requerir el fundamento técnico, el contexto del problema y la solución aprobada para las fases del ciclo final de cualquier Tier en el SDD.
  * **Contenido Organizado por Pilares:**
    * **Pilar 1: Ciclo de Cierre Determinista y Modularización de Templates**
      * *Centralización del Archivado:* Centralización definitiva del archivado físico en `/funky-archive` y remoción en `release.md`.
      * *Arquitectura del Flujo de Cierre:* Flujo secuencial estricto de cierre (`tasks` $\rightarrow$ `docs` $\rightarrow$ `archive` $\rightarrow$ `release`) y fragmentación de plantillas.
      * *Ejecución de Docs y Release:* Procesamiento y ejecución inline de `docs.md` y `release.md` por el Orquestador con soporte pre-masticado de `/funky-tasks`.
      * *Fusión de Specs en Tier 2:* Fusión de specs delta en Tier 2 a través de `/funky-archive` de forma condicional sin requerir reportes de verificación.
    * **Pilar 2: Estrategia de Batching Secuencial y Mutación de Tiers**
      * *Phase Batching y Ejecución Secuencial:* Administración de la ejecución en lotes (mínimo 2 batches en T1/T2, secuencial por fases en T3/T4) para mitigar el Context Drift, y límites interactivos de aprobación.
      * *Escenarios de Mutación:* Gestión de subidas de Tier a medio vuelo (de T2 a T3 y de T1 a T2) con purga de artefactos intermedios y reinicios controlados.
      * *Diferenciación de Ejecución:* Roles específicos de Workers y `funky-apply` en la ejecución de batches.
    * **Pilar 3: Estrategia de Quality Assurance (Testing & Verify Guardrails)**
      * *Estrategia DRY de Tareas:* Separación estricta entre la lógica de negocio de `/funky-tasks` y el contrato estático de `tasks.md`.
      * *Responsabilidad de Pruebas:* Reubicación de la ejecución de tests a la fase final de `tasks.md` en Tiers 1/2 y política estricta de NO-FIX ciego con diagnóstico a través de subagente "Sabueso" (Mini-Explore).
      * *Gestión de Incidencias (Post-Verify):* Matriz de decisión operativa (Critical, Warning funcional/cosmético, Suggestion) ante fallos detectados por el validador.
