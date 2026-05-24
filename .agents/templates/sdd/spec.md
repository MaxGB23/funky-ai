# Spec: [Nombre de la Funcionalidad o Cambio]

> **ORCHESTRATOR GATE**: If you loaded this skill, you are the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to the dedicated worker/sub-agent.

> **Budget:** máx 650 palabras · tablas > prosa · escenarios 3-5 líneas máx.
> **RFC 2119:** MUST/SHALL = obligatorio · SHOULD = recomendado · MAY = opcional
> ⚠️ **REGLAS CRÍTICAS:**
> - DO NOT include implementation details (HOW) in specs. Only WHAT.
> - Sección MODIFIED: copiar bloque COMPLETO del spec base, luego editar. Parcial = pérdida de datos.

## ADDED Requirements

### Requirement: [Nombre]

El sistema MUST/SHALL/SHOULD [comportamiento específico].

#### Scenario: [Happy path]
- GIVEN [precondición]
- WHEN [acción]
- THEN [resultado]

#### Scenario: [Edge case]
- GIVEN [precondición]
- WHEN [acción]
- THEN [resultado]

## MODIFIED Requirements

### Requirement: [Nombre Existente]

[Texto completo actualizado — reemplaza el existente.]
(Previously: [qué cambió, en una línea])

#### Scenario: [Copiado sin cambios o modificado]
- GIVEN ...
- WHEN ...
- THEN ...

## REMOVED Requirements

### Requirement: [Nombre]
(Reason: [por qué se depreca])

---

> **[SISTEMA - PARA EL ORQUESTADOR]** Si la spec es aprobada y no hay cambios de scope, procedé a generar el `tasks.md`.
