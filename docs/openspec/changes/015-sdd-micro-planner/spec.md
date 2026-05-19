# Spec: 015 Protocolos On-Demand (SDD Micro-Planner)

## 1. Arquitectura de la Solución

El flujo de trabajo modificado del Orquestador será el siguiente:
1. El Orquestador genera el `tasks.md`.
2. Si identifica una tarea que requiere decisiones de diseño complejas (Tier 3 o superior), le añade el prefijo `[REQUIRES-MICRO-PLAN]`.
3. Antes de generar el `worker-handoff.md`, el Orquestador invoca la Skill `sdd-micro-planner`.
4. La Skill guía al Orquestador para generar un artefacto `implementation_plan.md` (o `task-X-plan.md`) en la carpeta de la feature.
5. El Orquestador genera el `worker-handoff.md` instruyendo al Worker a seguir estrictamente ese plan.

## 2. Componentes a Implementar

### A. Skill Inyectable (`.agents/skills/sdd-micro-planner/SKILL.md`)
Deberá contener:
- **Nombre y Descripción:** Para que el sistema la detecte.
- **Instrucciones de Redacción:** "Sos un arquitecto detallando una única tarea. Tu output debe ser un artefacto `implementation_plan.md`...".
- **Estructura del Plan:** Debe forzar secciones como: Archivos a modificar, Pseudocódigo o lógica clave, Casos borde, Validaciones.

### B. Modificación al Orquestador (`.agents/rules/sdd-orchestrator.md`)
- Actualizar la **Planning Checklist** o la sección de **Delegación (Handoff)**.
- Añadir la regla: "Si una tarea en `tasks.md` es crítica, agregale el tag `[REQUIRES-MICRO-PLAN]`. Antes de delegar esa fase, debés invocar la Skill `sdd-micro-planner` para generar su diseño detallado".

## 3. Criterios de Aceptación (DoD)
- [ ] La carpeta `.agents/skills/sdd-micro-planner/` existe y contiene `SKILL.md`.
- [ ] Las reglas del Orquestador están actualizadas para contemplar el tag `[REQUIRES-MICRO-PLAN]`.
- [ ] Se documenta este nuevo flujo en el `ORCHESTRATOR-STATE.md` o en el Engram.
