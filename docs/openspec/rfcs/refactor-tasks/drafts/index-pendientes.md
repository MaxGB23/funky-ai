# RFC: Refactor Tasks — Índice de Pendientes y Resoluciones

Este documento recopila las decisiones de diseño tomadas para resolver los conflictos operativos y la redefinición del flujo de tareas, testing y cierre de features.

Estos se unirán a los docs oficiales dentro de ./index.md

---

* 📄 **[pendiente.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/drafts/pendiente.md)**
  * **Propósito:** Registrar las resoluciones de diseño pendientes sobre batching de tareas, colisiones de archivado, merge de specs y responsabilidades de testing.
  * **Cuándo leerlo:** Al requerir información detallada sobre las decisiones y flujos de aprobación del fin de ciclo en cualquier Tier.
  * **Contenido:**
    * **1. Phase Batching y Ejecución Secuencial**
      * Detalla cómo se dividen las ejecuciones en batches según el Tier, la mitigación de context drift, y el escalado de Tier a medio vuelo.
    * **2. Pendiente 2: Estrategia DRY (Prompt vs Template)**
      * Resuelve la duplicidad de responsabilidades separando el motor lógico del prompt en `/funky-tasks` del contrato estático de `tasks.md`.
    * **3. Pendiente 3: Colisión de Archivado (`release.md` vs `/funky-archive`)**
      * Centraliza la responsabilidad del archivado físico de la carpeta del cambio exclusivamente en `/funky-archive`.
    * **4. Pendiente 4: Arquitectura del Flujo de Cierre**
      * Establece el orden de ejecución determinista del cierre (`tasks` → `docs` → `/funky-archive` → `release`) y fragmenta el monolito de tareas.
    * **5. Pendiente 5: Ejecución de `docs.md` y `release.md`**
      * Resuelve que el procesamiento de plantillas se resuelva inline por el Orquestador con soporte del output digerido por `/funky-tasks`.
    * **6. Pendiente 6: Mergeo de Specs en Tier 2**
      * Define un flujo condicional de verificación en `/funky-archive` para fusionar specs huérfanos sin requerir reportes de testing de fase Verify.
    * **7. Pendiente 7: Responsabilidad del Testing**
      * Extrae el testing a la fase de cierre de `tasks.md` para evitar el Green-Washing e introduce el diagnóstico técnico vía "Mini-Explore" (Sabueso).
    * **8. Post-verify: cómo manejar issues**
      * Tabla de decisión técnica y flujo operativo para tratar issues críticas, warnings o sugerencias emitidas por el validador.

## Sugerencia de consolidación del doc Pendiente.md
Para evitar tener 8 puntos huérfanos y desmadrosos en `pendiente.md`, podemos agrupar todo este desmáuser en **3 Pilares Conceptuales** bien definidos. Esto hace que sea un chingo más fácil de digerir y meter al `index.md` oficial:

### Pilar 1: Ciclo de Cierre Determinista y Modularización de Templates
*Consolida: Pendiente 3 (Colisión de archivado), Pendiente 4 (Flujo de cierre), Pendiente 5 (Ejecución de docs/release) y Pendiente 6 (Merge de specs en Tier 2).*
* **Flujo Lineal y Orden de Cierre:** El flujo operativo se define estrictamente en esta secuencia: `tasks.md` (código) $\rightarrow$ `docs.md` (arquitectura/ADRs) $\rightarrow$ `/funky-archive` (merge de specs y cleanup físico) $\rightarrow$ `release.md` (GitOps/lanzamiento).
* **Fragmentación del Monolito:** Adiós al `tasks` gigante; se divide en `tasks.md`, `docs.md` (condicional) y `release.md` (condicional).
* **`/funky-archive` como Conserje Único:** Se centraliza al 100% la responsabilidad de mover la carpeta física y hacer el merge de specs (specs delta en Tier 2 y 3). Se ajusta su Paso 0 para permitir mergeos en Tier 2 sin exigir el `verify-report.md`.
* **Ejecución Inline:** La ejecución de `docs.md` y `release.md` corre a cargo del Orquestador de forma inline, apoyado por la planeación ya masticada que le escupe `/funky-tasks` para no inflar la ventana de contexto.

### Pilar 2: Estrategia de Batching Secuencial y Mutación de Tiers
*Consolida: Punto 1 (Batching y ejecución secuencial), 7.1 (Quién parte batches) y secciones de mutación/escalado.*
* **Task Budgeting por Tier:** 
  * *Tiers 1/2:* Mínimo 2 batches secuenciales (Batch A: código; Batch B: cierre/merge).
  * *Tiers 3/4:* Ejecución secuencial fase por fase usando `/funky-apply`.
* **Proactividad y Reactividad de Batches:** `/funky-tasks` es el primer filtro calculando el riesgo y archivos del PR; si se satura en caliente, el Worker ejecuta un freno de mano de emergencia (commit parcial + `report.md`).
* **Mutaciones de Escenario:** 
  * Si se escala de T2 a T3, se borran los artefactos previos de explore/design para evitar ruido en los custom workflows.
  * Si se escala de T1 a T2, se frena en seco y se arranca el SDD desde explore.

### Pilar 3: Estrategia de Quality Assurance (Testing & Verify Guardrails)
*Consolida: Pendiente 2 (Estrategia DRY), Pendiente 7 (Responsabilidad del testing) y Post-verify (Manejo de issues).*
* **Testing en Tasks:** La ejecución de tests se mueve a la fase final de `tasks.md` para garantizar que corra en todos los Tiers (incluyendo Tier 1/Patch).
* **Política Anti-Green-Washing:** Prohibido que el Worker mutile tests ciegamente. Si falla, genera un `report.md` con logs de error y se detiene.
* **Diagnóstico vía Mini-Explore (Sabueso):** El Orquestador no analiza el log roto directamente; delega a un subagente "Mini-Explore" inyectando el contexto de negocio de la feature para obtener un diagnóstico técnico preciso sin alucinaciones.
* **Manejo de Issues Post-Verify:** Matriz de decisión operativa para canalizar fallos de `funky-verify` (CRITICAL, WARNING funcional, WARNING cosmético, SUGGESTION) decidiendo si bloquea el archivado o si se despacha inline.
* **Prompt vs Template (DRY):** `/funky-tasks` maneja la lógica y heurística de planeación; el template `tasks.md` define la estructura física inalterable y el contrato del estado vivo.


CHECKLIST:
Este checklist es una segunda puerta para comprobar que no hayamos dejado algun punto abandonado.
[x]1. Phase Batching y Ejecución Secuencial
[x]2. Pendiente 2: Estrategia DRY (Prompt vs Template)
[x]3. Pendiente 3: Colisión de Archivado (`release.md` vs `/funky-archive`)     
[x]4. Pendiente 4: Arquitectura del Flujo de Cierre     
[x]5. Pendiente 5: Ejecución de `docs.md` y `release.md`
[x]6. Pendiente 6: Mergeo de Specs en Tier 2     
[x]7. Pendiente 7: Responsabilidad del Testing
[x]8. Post-verify: cómo manejar issues
     