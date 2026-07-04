---
root-sha256: {Ejecutar Get-FileHash -LiteralPath "docs/openspec/specs/{dominio}/spec.md" -Algorithm SHA256. Si no existe Root Spec (dominio nuevo) → null}
---
# Spec: [Nombre de la Funcionalidad o Cambio]

> **Budget:** sé conciso · tablas > prosa · escenarios 3-5 líneas máx.
> **RFC 2119:** MUST/SHALL = obligatorio · SHOULD = recomendado · MAY = opcional
> ⚠️ **REGLAS CRÍTICAS:**
> - DO NOT include implementation details (HOW) in specs. Only WHAT.
> - FULL Spec (dominio nuevo) → escribir todas las secciones como ADDED.
> - DELTA Spec (dominio existente) → solo incluir secciones con cambios.
>   Si ninguna sección aplica (refactor puro), escribir "**Spec-level changes:** None. Pure refactor — no behavior affected."
> - MODIFIED: copiar bloque COMPLETO del spec base, luego editar. Parcial = pérdida de datos.
> - REMOVED: identificar por nombre exacto del requirement.

## ADDED Requirements
<!-- Incluir SOLO si hay comportamiento nuevo. Omitir si no aplica. -->

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
<!-- Incluir SOLO si cambia comportamiento existente. Omitir si no aplica. -->

### Requirement: [Nombre Existente]

[Texto completo actualizado — reemplaza el existente.]
(Previously: [qué cambió, en una línea])

#### Scenario: [Copiado sin cambios o modificado]
- GIVEN ...
- WHEN ...
- THEN ...

## REMOVED Requirements
<!-- Incluir SOLO si se depreca funcionalidad. Omitir si no aplica. -->

### Requirement: [Nombre]
(Reason: [por qué se depreca])
