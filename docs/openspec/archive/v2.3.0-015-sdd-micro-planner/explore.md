# Explore: 015 Protocolos On-Demand (SDD Micro-Planner)

## 1. Contexto del Problema
**Problema:** "Task Explosion" y Alucinaciones de Worker.
Cuando el Orquestador planifica (Fase SDD), genera un `tasks.md` de alto nivel. Algunas de estas tareas son simples (T1/T2), pero otras son arquitectónicamente críticas o complejas (T3). Si el Orquestador le delega una tarea compleja directamente a un Worker, el Worker carece de la "visión macro" (contexto fresco del repo, decisiones previas, tradeoffs) y tiende a alucinar, tomar malas decisiones de diseño o implementar soluciones frágiles. 
A su vez, no podemos obligar al Orquestador a detallar a nivel de pseudocódigo *cada* tarea en el `tasks.md` original, porque eso saturaría la ventana de contexto (Context Dilution).

**Solución Esperada:** Implementar el issue "015 Protocolos On-Demand" creando un Protocolo inyectable (`sdd-micro-planner.md`) que el Orquestador pueda cargar bajo demanda para diseñar un plan de implementación detallado (`implementation_plan.md`) ÚNICAMENTE para las tareas que lo requieran, antes de hacer el handoff al Worker.

## 2. Opciones de Arquitectura

| Opción | Descripción | Pros | Contras / Tradeoffs |
|--------|-------------|------|---------------------|
| **A. Sub-Orquestador Autónomo** | Las tareas complejas se delegan a una nueva sesión completa del Orquestador que vuelve a hacer todo el ciclo SDD para la sub-tarea. | - Escalabilidad extrema.<br>- Separación de responsabilidades purista. | - Overkill de tokens y tiempo.<br>- Complejidad innecesaria en el state management. |
| **B. Protocolo On-Demand** | El Orquestador actual, aprovechando su caché caliente (warm context), etiqueta tareas como `[REQUIRES-MICRO-PLAN]` y ejecuta el protocolo `sdd-micro-planner` antes del cierre de sesión para crear un plano de diseño. | - Cero Context Dilution global.<br>- Aprovecha contexto existente.<br>- Alta precisión para el Worker. | - Añade un paso intermedio antes de delegar. |
| **C. Workers Especializados (Spike)** | Se crea un "Worker Diseñador" cuya única tarea es leer y proponer, devolviendo el control al humano antes de codear. | - Mitiga el riesgo directo al código. | - El Worker arranca "frío" sin el macro-contexto que el Orquestador ya tenía.<br>- Multiplica las idas y vueltas de chat. |

## 3. Recomendación + Riesgos
**Opción recomendada:** Opción B (Protocolo On-Demand / Skill)

**Justificación:**
Es la solución más elegante dentro de la arquitectura v2.0.0. Evita el Context Dilution porque la lógica de "cómo hacer un micro-plan" vive encapsulada en `.agents/protocols/sdd-micro-planner.md` y solo se inyecta cuando la tarea es crítica. Aprovecha eficientemente el "warm cache" del Orquestador, quien ya entiende perfectamente el objetivo de la feature. Finalmente, blindamos al Worker obligándolo a seguir el artefacto `implementation_plan.md` generado.

**Riesgos mitigables:**
- **Riesgo:** Que el Orquestador olvide invocar la Skill antes de crear el `worker-handoff.md`.
  - *Mitigación:* Se debe documentar en la Escalation Matrix o en el Workflow del Orquestador que si una tarea es Tier 3 / Crítica, el micro-plan es prerrequisito para el handoff.
- **Riesgo:** Incompatibilidad de herramientas.
  - *Mitigación:* Usaremos la infraestructura de protocolos consolidada en la v2.1.0 (`.agents/protocols/`).

> **[SISTEMA - PARA EL ORQUESTADOR]** Una vez finalizada la exploración, utilizá este documento como base para generar el `sdd-proposal.md`.
