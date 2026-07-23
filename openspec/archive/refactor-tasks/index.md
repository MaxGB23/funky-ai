# RFC: Refactor Tasks — Índice de Especificaciones y Resoluciones

Este índice consolida las especificaciones, contratos arquitectónicos, decisiones y flujos operativos que definen el comportamiento de los agentes, la separación de fronteras CLI/IDE, la jerarquía de Tiers, y el ciclo de vida de los subagentes en el ecosistema Funky AI.

---

* 📄 **[spec-cli-ide-boundaries.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/spec-cli-ide-boundaries.md)**
  * **Propósito:** Delimitar las responsabilidades operativas y de contexto entre el entorno del CLI y el IDE.
  * **Cuándo leerlo:** Relevante al diseñar flujos de interacción interactivos o automáticos y al definir reglas de ejecución en el IDE.
  * **Contenido:**
    * **1. Arquitectura de Dos Tiempos: IDE Presente, CLI Futuro**
      * Define la transición cronológica del control de delegación manual en el IDE (v1 con envelopes) a la automatización de subagentes en el CLI (v2 nativo).
    * **2. Separación de Entornos y Justificación de Roles**
      * Explica el rol de coordinación/orquestación del CLI versus el rol ejecutor táctico del IDE (Apply/Worker).
    * **3. Detección de Entorno (Kill Switch del IDE)**
      * Guardrail que detiene a un agente en el IDE si intenta realizar tareas de arquitectura u orquestación.
    * **4. Interacción Humano-Máquina: Los Inquirers del CLI**
      * *Fragmentación del Monolito de Tareas:* Separación en `tasks.md`, `docs.md` (condicional) y `release.md` (condicional).
      * *El Flujo de Inquirers:* Proceso interactivo de creación de features (`funky feature`) configurando Tier, Docs Core y SemVer.
      * *Diagrama de Inyección:* Flujo de inyección y eliminación de pausas manuales redundantes en Tiers bajos.
    * **5. Modos de Ejecución del CLI**
      * *Modo Interactivo (Default Tiers Altos):* Pausas intencionales para aprobación humana y manejo de Return Envelopes.
      * *Modo Automático:* Auto-inyección en T1/T2 y auto-delegación directa de prompts a subagentes nativos en T3.
    * **6. Transición de Entorno: Puente Manual (v1) → CLI Nativo (v2)**
      * Detalla la evolución de la comunicación de subagentes usando envelopes manuales a mensajería directa en CLI bajo la Ley de Invarianza.

* 📄 **[spec-contracts-templates.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/spec-contracts-templates.md)**
  * **Propósito:** Definir los contratos de parámetros y las reglas de preservación de templates en los workflows del SDD.
  * **Cuándo leerlo:** Relevante al programar o extender workflows y configurar delegaciones en Tiers altos.
  * **Contenido:**
    * **1. Contrato de Parámetros de Delegación (El E1)**
      * Establece la estructura de metadatos (`feature_name`, `tag`) para delegar workflows en Tiers Altos y depreca `artifact_state` y `has_design`.
    * **2. El Template Siempre Manda (E2 - Caso Especial `tasks.md`)**
      * Regla absoluta que obliga a los workflows a respetar la estructura base inyectada por el CLI sin sobreescribirla.
      * *Fase de Merge Condicional:* Manejo inteligente del cierre y merge según si se inyectó `release.md`.
    * **3. Contexto de Workflows vs Rigidez de Templates (E3)**
      * Delega la responsabilidad de formato a la inteligencia del workflow para optimizar tokens.
    * **4. Custom Workflows y Exclusión de Templates**
      * Restringe el uso de workflows personalizados a Tiers altos omitiendo la inyección de plantillas vacías.

* 📄 **[spec-orchestrator-rules.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/spec-orchestrator-rules.md)**
  * **Propósito:** Establecer los guardrails operativos, razonamientos de inicio y control de ciclo de vida del Orquestador.
  * **Cuándo leerlo:** Obligatorio para programar o auditar el comportamiento del rol Orquestador (Maistro).
  * **Contenido:**
    * **1. Identidad del Orquestador**
      * Define la prohibición de escribir código (salvo micro-fixes con aprobación) y el uso exclusivo de slash commands en Tiers altos.
    * **2. Guardrails de Edición de Templates (Regla JIT)**
      * Prohíbe la redacción manual e inline de templates de planeación.
      * *Excepción:* Ejecución inline de `docs.md` y `release.md` con soporte digerido de `/funky-tasks`.
    * **3. Razonamiento Pre-Vuelo (Paso 0)**
      * Obliga al Orquestador a declarar y justificar explícitamente el Tier de la feature.
    * **4. Memory Polling (Two-Stage)**
      * Rutina obligatoria de recuperación de contexto a través de consultas indexadas al engrama.
    * **5. Orchestration Checklist**
      * Flujo y triggers para la verificación de scaffolding (`jit-delegation-guardrails`).
    * **6. Message Passing y Delegación (Modo Handoff / IDE)**
      * Describe el protocolo de generación de bloques copy-paste en el entorno IDE.
    * **7. Phase Batching y Ejecución Secuencial**
      * *Estrategia de Task Budgeting:* División de tareas en mínimo 2 batches en T1/T2 (Batch A de código, Batch B de cierre) y secuencial por fases en T3.
      * *Quién Parte los Batches:* Enfoque híbrido entre Orquestador Proactivo y Worker Reactivo.
      * *Verify de Ciclo Completo:* Regla de no ejecutar `sdd-verify` a medias.
    * **8. Persistencia Proactiva y Cierre de Sesión (Session Close)**
      * *Protocolo del Engram:* Extracción de conocimiento obligatoria vía `funky engram add`.
      * *Session Close:* Actualización obligatoria del estado en `ORCHESTRATOR-STATE.md`.

* 📄 **[spec-roles-subagents.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/spec-roles-subagents.md)**
  * **Propósito:** Definir la taxonomía, los ciclos de vida y las estrategias de delegación de subagentes.
  * **Cuándo leerlo:** Relevante al estructurar nuevos agentes, administrar sus tokens y controlar sus estados en ejecución.
  * **Contenido:**
     * **1. El Barrio: Taxonomía y Criterios de Selección**
       * Clasifica y asigna responsabilidades a los roles de Maistro, Sabueso (investigación de solo lectura, fuera de SDD), Chalán Crikoso (familia SDD Ligero Tier 2: Sabueso de Lava + variantes de Propose/Spec/Verify), Chalán Regular y Vergas, y Mierdillo.
    * **2. Reglas de Nacimiento y Carga de Contexto**
      * *Delegación de Skills:* Lazy Loading estricto sin contaminar la memoria del Orquestador.
      * *Delegación de Workflows del SDD:* Inyección a través de slash commands sin solapar identidades.
      * *Mitigación de Conflicto de Identidad:* Delimitación clara del rol del subagente `self`.
    * **3. Ciclo de Vida, Retorno y Persistencia**
      * *Contrato "Return Envelope":* Manejo de salidas estructuradas y archivos `report.md`.
      * *Control de `RequestFeedback`:* Prohibido su uso en modo de desarrollo automatizado.
      * *Flujo de Vida:* Estados y persistencia del subagente en Modo Interactivo vs Automático.
    * **4. Modos de Operación del Orquestador: Interactivo vs Auto**
      * *Mini-Delegación en Tier 2:* Delegación de propose y spec simplificados usando plantillas mínimas.
      * *Checkpoint Pre-Apply:* Reglas de confirmación explícita antes de lanzar el Worker en modo auto.
     * **Anexo: Explore Ligero — Dos Variantes**
       * *Route A — El Sabueso Desechable (cualquier Tier):* Investigaciones rápidas sin RFC como input. `TypeName: "research"`, solo lectura, findings inline, no produce artefactos.
       * *Route B — El Sabueso de Lava (Tier 2 exclusivo):* Explore SDD ligero con RFC/spec como input. `define_subagent` con escritura, produce `explore.md` with Context Preservation. Resuelve el anti-patrón "Teléfono Descompuesto" en Tier 2.

* 📄 **[spec-routing-tiers.md](file:///m:/funky-ai/docs/openspec/rfcs/refactor-tasks/spec-routing-tiers.md)**
  * **Propósito:** Especificar el ruteo de Tiers, correspondencia con SemVer y el diseño adaptativo del workflow de tareas.
  * **Cuándo leerlo:** Relevante al evaluar riesgos de features, gestionar ramas y configurar el workflow `/funky-tasks`.
  * **Contenido:**
    * **1. Escalera de Tiers (Jerarquía Operativa)**
      * *Escalera Base:* Definición operativa de los Tiers 1 al 3.
      * *Escalera Refinada con T0:* Regla especial para Micro-fixes directos sin ramas ni `tasks.md`.
      * *Branch Management:* Obligatoriedad de ramas y PRs (T1 a T3).
      * *Mutaciones a Medio Vuelo:* Protocolo de escalado y purga de artefactos en cambios de Tier en caliente.
    * **2. Reglas de Release: SemVer x SDD**
      * *Tabla de Correspondencia y Ley de Gravedad Inversa:* Relación estricta SemVer ↔ Tier.
      * *El CLI es el Ejecutor, el Orquestador es el Inteligente:* La trinidad de setup de inquirers.
      * *Fusión de Specs en Tier 2:* Flexibilidad para mergear specs delta en `/funky-archive` sin reportes de verificación.
    * **3. Trazabilidad Vertical de NFRs**
      * Flujo incremental e inteligente de requerimientos no funcionales (Discovery → Formalización → Bloqueo → Cascada → Tagging y Verificación).
    * **4. Arquitectura del `/funky-tasks`, Flujo de Cierre y Deprecaciones**
      * *Arquitectura del Flujo de Cierre:* Orden lineal estricto de cierre (`tasks.md` → `docs.md` → `/funky-archive` → `release.md`).
      * *Un Solo Workflow Agnóstico:* Comportamiento adaptativo de `/funky-tasks` según el Change Folder.
      * *Deprecación del Microplanning:* Migración de control a `/funky-apply` en Tier 3.
      * *Detección de Riesgo:* Return Envelope y escalamiento dinámico basado en PR budget y complejidad.
      * *Estrategia DRY:* Separación estricta entre el motor lógico del prompt `/funky-tasks` y el contrato estático de `tasks.md`.

---
