# Explore: Arquitectura de Agentes v2.0.0 (Rediseño de Sistema de Configuración)

## 1. Contexto del Problema
Actualmente, el framework Funky AI sufre de **Context Dilution** severa. La IA recibe de golpe todas las reglas globales (`GEMINI-funky-global.md`), las reglas de espacio de trabajo (`sdd-orchestrator.md`, `secops.md`) y el contexto dinámico (estado del proyecto, historial de chats). Al haber tanta carga cognitiva, el modelo (incluso versiones potentes) empieza a tener fallos estructurales: saltea protocolos, inventa tareas, asume roles incorrectos (ansiedad de completitud) y pierde instrucciones que quedaron en medio del prompt (Lost in the Middle). Necesitamos un modelo donde la IA lea estrictamente lo necesario para el paso actual.

## 2. Opciones de Arquitectura

| Opción | Descripción | Pros | Contras / Tradeoffs |
|--------|-------------|------|---------------------|
| **Opción A (Status Quo + Ajustes)** | Mantener los prompts globales pesados pero usar estructuras XML más estrictas y "Action Forcing" más agresivo. | - No rompe el esquema actual de instalación.<br>- Menor esfuerzo de refactor. | - No soluciona de raíz el Context Dilution.<br>- Sigue gastando tokens innecesarios en cada turno. |
| **Opción B (Arquitectura 3 Capas Nativa)** | Diseñar un sistema de 3 capas: **(1) Global:** Solo personalidad y tono. **(2) Workspace Rules:** Reglas condicionales. **(3) Workflows On-Demand:** La lógica pesada de los agentes (Orchestrator, Worker) se migra a Workflows Antigravity invocables vía comando. | - Mitiga el Context Dilution aislando la lógica.<br>- Ahorra tokens masivamente.<br>- Control explícito humano de qué agente opera. | - Breaking Change de UX para los usuarios.<br>- Requiere refactor profundo de plantillas. |
| **Opción C (CLI Wrapper / Agent Proxy)** | Mover toda la lógica del LLM al CLI usando un SDK, creando una CLI interactiva que genere los prompts y hable con la API directamente en la terminal. | - Control absoluto y determinista del pipeline.<br>- Se elimina la dependencia total de la UI del IDE. | - Destruye la experiencia de Pair Programming natural dentro del editor.<br>- Esfuerzo titánico de desarrollo del CLI. |

## 3. Recomendación + Riesgos
**Opción recomendada:** Opción B (Arquitectura 3 Capas Nativa)

**Justificación:**
La Opción B aprovecha las herramientas nativas que ya nos da el IDE de Antigravity (Workspace Rules + Global Workflows) para hacer exactamente lo que queremos: Inyectar contexto solo cuando es semánticamente necesario. Pasamos de un modelo "Push All" a un modelo "Pull On-Demand".

**Riesgos mitigables:**
- **Riesgo 1 (Experiencia Fragmentada):** Al sacar a los agentes pesados del prompt global, los usuarios de Antigravity podrían no saber cómo invocar a los agentes (Orchestrator/Worker).
  - *Mitigación:* Crear un comando de bootstrap en la CLI (`funky prompt` o `funky setup`) que instale o instruya instalar los Workflows globales en el directorio `~/.gemini/antigravity/global_workflows/`.
- **Riesgo 2 (Inconsistencia de Tone/Personalidad):** Que los Workflows on-demand no respeten la personalidad Rioplatense.
  - *Mitigación:* Mantener la capa 1 (Global) estricta: La regla del Tono y Filosofía NUNCA se mueve al Workflow, siempre queda anclada globalmente.
- **Riesgo 3 (Pérdida de Features de v1.20):** Que al desarmar el `sdd-orchestrator.md` actual perdamos el Auto-Tiering o los gates de Handoff.
  - *Mitigación:* La migración del markdown debe ser quirúrgica 1:1, partiendo el archivo actual en sus equivalentes para Workflow.

> **[SISTEMA - PARA EL ORQUESTADOR]** Una vez finalizada la exploración, utilizá este documento como base para generar el `sdd-proposal.md`.
