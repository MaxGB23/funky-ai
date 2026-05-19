# Proposal: 015 Protocolos On-Demand (SDD Micro-Planner)

## 1. Resumen
Esta propuesta resuelve el problema de "Task Explosion" y la alucinación de Workers en la arquitectura v2.0.0. Implementaremos un "Skill Inyectable" (`sdd-micro-planner`) que el Orquestador puede invocar bajo demanda para crear un documento de diseño detallado (`implementation_plan.md`) para tareas específicas marcadas como complejas (`[REQUIRES-MICRO-PLAN]`), antes de delegarlas a un Worker. Esto cumple con el pendiente 015 del backlog.

## 2. Motivación
- **Reducir Alucinaciones:** Los Workers que ejecutan tareas complejas sin contexto macro tienden a fallar.
- **Evitar Context Dilution:** No podemos enseñarle al Orquestador a detallar cada tarea por defecto en su prompt global; debemos inyectar esta habilidad solo cuando sea necesaria.
- **Aprovechar Warm Cache:** El Orquestador ya entiende el código y el objetivo tras generar el `explore.md` y `spec.md`. Es el actor ideal para planificar el nivel micro.

## 3. Alcance (Scope)
**In-Scope:**
- Creación de la Skill `.agents/skills/sdd-micro-planner/SKILL.md`.
- Actualización de las reglas del Orquestador (`.agents/rules/sdd-orchestrator.md` y/o Workflow) para incluir el uso del tag `[REQUIRES-MICRO-PLAN]`.
- Definir el estándar del artefacto `implementation_plan.md` generado por la Skill.

**Out-of-Scope:**
- Creación de otras Skills on-demand no relacionadas con planificación (eso queda para futuros issues).
- Modificación del Worker (el Worker solo necesita leer el plan, su comportamiento base no cambia).

## 4. Viabilidad (Feasibility)
**Alta.** La infraestructura de Antigravity (MCP / Skills) ya soporta el patrón `.agents/skills/`. Solo necesitamos crear el archivo `SKILL.md` con las instrucciones correctas y entrenar al Orquestador para que lo invoque en su Workflow.
