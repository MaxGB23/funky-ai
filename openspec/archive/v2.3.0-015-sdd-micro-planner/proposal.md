# Proposal: 015 Protocolos On-Demand (SDD Micro-Planner)

## 1. Resumen
Esta propuesta resuelve el problema de "Task Explosion" y la alucinación de Workers en la arquitectura v2.0.0. Implementaremos un Protocolo On-Demand (`sdd-micro-planner.md`) que el Orquestador puede invocar bajo demanda para crear un documento de diseño detallado (`implementation_plan.md`) para tareas específicas marcadas como complejas (`[REQUIRES-MICRO-PLAN]`), antes de delegarlas a un Worker. Esto cumple con el pendiente 015 del backlog.

## 2. Motivación
- **Reducir Alucinaciones:** Los Workers que ejecutan tareas complejas sin contexto macro tienden a fallar.
- **Evitar Context Dilution:** No podemos enseñarle al Orquestador a detallar cada tarea por defecto en su prompt global; debemos inyectar esta habilidad solo cuando sea necesaria.
- **Aprovechar Warm Cache:** El Orquestador ya entiende el código y el objetivo tras generar el `explore.md` y `spec.md`. Es el actor ideal para planificar el nivel micro.

## 3. Alcance (Scope)
**In-Scope:**
- Creación del protocolo `.agents/protocols/sdd-micro-planner.md`.
- Añadir el template base a `funky-cli/src/templates/protocols/sdd-micro-planner.md` para distribución.
- Actualización de las reglas del Orquestador (`.agents/rules/sdd-orchestrator.md` y/o Workflow) para incluir el uso del tag `[REQUIRES-MICRO-PLAN]`.
- Definir el estándar del artefacto `implementation_plan.md` generado por la Skill.

**Out-of-Scope:**
- Creación de otras Skills on-demand no relacionadas con planificación (eso queda para futuros issues).
- Modificación del Worker (el Worker solo necesita leer el plan, su comportamiento base no cambia).

## 4. Viabilidad (Feasibility)
**Alta.** Ya consolidamos la infraestructura de protocolos en la v2.1.0. Solo necesitamos crear el archivo en `.agents/protocols/` con las instrucciones correctas y entrenar al Orquestador para que lo invoque en su Workflow.
