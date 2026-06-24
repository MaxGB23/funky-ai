# Índice Enciclopédico de Refactor Tasks (RFCs)

Este directorio contiene las especificaciones, drafts y reglas arquitectónicas para la reestructuración de tareas, subagentes y la separación de entornos entre CLI e IDE.

---

## 📖 Contenido del Directorio

* 📄 **[blueprint-final-draft.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/blueprint-final-draft.md)**
  * *Descripción:* Estrategia definitiva de delegación y subagentes. Unifica la taxonomía, ciclo de vida, estrategias de delegación de workflows y mitigación de contexto para subagentes en AGY CLI.
  * *Estructura:*
    * **1. El Barrio: Taxonomía y Criterios de Selección**
      * Clasificación de roles (Maistro, Sabueso, Chalán, Chalán Vergas, Chalán Fresón y Mierdillo), permisos y costos asociados en tokens.
    * **2. Reglas de Nacimiento (Loading y Conflicto de Identidad)**
      * Mecanismo de Lazy Loading estricto para Skills (evitar drogar al Maistro) y mitigación de conflicto de identidad para subagentes `self`.
    * **3. Delegación de Workflows (Slash Commands)**
      * Cambio de paradigma: delegación vía slash commands y envío de parámetros en el frontmatter del prompt.
    * **4. Ciclo de Vida, Retorno y Persistencia**
      * Contrato "Return Envelope", prohibición de `RequestFeedback: true` en desarrollo y flujo de estados (Idle -> Feedback -> Kill).
    * **5. Modos de Operación del Orquestador: Interactivo vs Auto**
      * Diferencias operativas del CLI en modo interactivo vs automático, mini-delegación en Tier 2 y checkpoints pre-apply.
    * **Anexos - A1. El "Explore Ligero" (Protección de Contexto)**
      * Implementación del sabueso desechable de tipo `research` para búsquedas rápidas.

* 📄 **[delegaciones.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/delegaciones.md)** CLOSED
  * *Descripción:* Ideas sobre delegación y separación de entornos. Justificación técnica para delegar tareas pesadas en CLI y limitar el IDE a ejecución pura.
  * *Estructura:*
    * **[Sección Inicial] (Modo interactivo y Tier 2)**
      * Análisis del ritmo de inyección de artefactos para frenar alucinaciones en cascada.
    * **Contexto de Separación entre Entornos de Orquestación (CLI) y Ejecución (IDE)**
      * Por qué el CLI "piensa y coordina" mientras el IDE ejecuta con mayor control del humano sobre los diffs aplicados.
    * **Prevención en Rules Propuesta (Kill Switch)**
      * Prompt de advertencia para detener al agente en el IDE si se le exige comportamiento de orquestación.

* 📄 **[draft-extras.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/draft-extras.md)**
  * *Descripción:* Ideas pendientes y contratos de parámetros entre el Orquestador y los subagentes al lanzar workflows.
  * *Estructura:*
    * **E1. Contrato de Parámetros del Orquestador al Lanzar Workflows (RFC 026 x §5)**
      * Unificación de contratos de parámetros (`artifact_state`, `has_design`, `feature_name`, `tag`) derivados del Tier.
    * **1. Manejo de Params**
      * Inyección obligatoria de parámetros como frontmatter del prompt para mantener limpias las plantillas físicas.
    * **2. Ciclo de Vida y Transición Arquitectónica**
      * Transición progresiva: Fase 1 (Puente Manual por Copy-Paste) a Fase 2 (Automatización total).
    * **E2. El Template Siempre Manda — Incluso en Tier 4**
      * Justificación de por qué `tasks.md` requiere mantener la estructura base (Fase 0 - Branch Setup) sin importar el Tier de libertad del subagente.

* 📄 **[draft-tasks.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/draft-tasks.md)**
  * *Descripción:* RFC Draft sobre el desacoplamiento del template de tasks en plantillas modulares inyectadas dinámicamente.
  * *Estructura:*
    * **1. Resumen y Motivación**
      * Propuesta de fragmentación del monolito `tasks` en `tasks.md`, `docs.md` y `release.md`.
    * **2. Reglas de Release (SemVer x SDD)**
      * Reglas de negocio para la inyección obligatoria de `release.md` y `docs.md` basándose en SemVer.
    * **3. Flujo de Inyección (Diagrama Propuesto)**
      * Diagrama y lógica interna de preguntas del CLI (`funky feature`) al usuario.
    * **4. Orquestación y Decisión Humana (Inquirers)**
      * Dinámica donde la IA sugiere el setup óptimo y el desarrollador aprueba o corrige.
    * **5. Custom Workflows y Exclusión de Templates**
      * Exclusión de scaffolding en T3/T4 si se decide usar agentes libres.
    * **6. Escalera de Tiers y Aislamiento de Fases (Protección de Contexto)**
      * Jerarquía de aislamiento del contexto desde Tier 1 (Fast Track) hasta Tier 4 (Rediseño masivo).
    * **7. Ideas pendientes por aprobar**
      * Propuestas evolutivas: trazabilidad vertical de NFRs, modos de ejecución, escalera refinada (con Tier 0), ley de gravedad inversa de SemVer y el Return Envelope de `/funky-tasks`.

* 📄 **[rules-orchestrator-backup.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/rules-orchestrator-backup.md)**
  * *Descripción:* Draft de las posibles nuevas reglas del Orquestador de Funky AI. Detalla el rol, la Escalation Matrix y las medidas de seguridad del agente principal.
  * *Estructura:*
    * **Identidad**
      * Definición estricta del rol del Orquestador (no tira código excepto en T0) y prohibición de abuso de slash commands.
    * **Escalation Matrix (Routing Estricto)**
      * Tabla de enrutamiento operativo por Tiers (T0-T4).
    * **⚠️ Guardrails de Edición de Templates**
      * Regla de no sobrescribir desde cero y editar con `replace_file_content` para proteger el frontmatter.
    * **Paso 0 — Razonamiento Pre-Vuelo**
      * Autodeclaración del Tier antes de procesar cualquier respuesta.
    * **Memory Polling — Two-Stage**
      * Rutina de chequeo y búsqueda en el engram en disco.
    * **⚠️ Orchestration Checklist**
      * Lista de control obligatoria de inicialización y chequeo previo de contexto.
    * **🔴 Puerta de Escalamiento Dinámico (Return Envelope)**
      * Evaluación de riesgo del workflow de tareas para decidir si se escala a `/funky-apply`.
    * **⚡ Phase Batching y Checkpoint entre Fases**
      * Límite secuencial de ejecución de fases y control de scope.
    * **⚠️ Protocolo del Engram (Persistencia Proactiva)**
      * Proceso estricto de documentación de gotchas y edge cases.
    * **Session Close**
      * Protocolo obligatorio de actualización de `ORCHESTRATOR-STATE.md`.

---

Para consultas históricas y trazabilidad de la evolución del diseño:
* 📄 **[closed/blueprint-draft.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/closed/blueprint-draft.md)**
  * Primer borrador del plan de delegación de subagentes.
* 📄 **[closed/blueprint-migracion-delegacion.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/closed/blueprint-migracion-delegacion.md)**
  * Análisis inicial del desacoplamiento de herramientas y migración CLI/IDE.
