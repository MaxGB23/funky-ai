<!-- ============================================================
  AGENT INSTRUCTIONS — Leer antes de escribir. NO incluir en el output.
  ============================================================
  TAREA: Genera el delta spec de la feature y escríbelo en:
         openspec/changes/[CHANGE]/specs/[DOMAIN]/spec.md

  PASOS OBLIGATORIOS:
  1. IDENTIFICAR DOMINIO
     - Lee el proposal.md para identificar el/los dominios afectados.
     - Ejecuta en terminal para validar nombres reales:
       Get-ChildItem -Directory "openspec/specs/" -ErrorAction SilentlyContinue | Select-Object Name
     - Si el dominio del proposal NO coincide exactamente con uno existente → asumir typo, usar el existente.
     - Solo crea un dominio nuevo si la feature introduce un módulo genuinamente nuevo.

  2. CALCULAR ROOT HASH (por cada dominio)
     - Ejecuta en PowerShell:
       if (Test-Path "openspec/specs/[DOMAIN]/spec.md") { (Get-FileHash -LiteralPath "openspec/specs/[DOMAIN]/spec.md" -Algorithm SHA256).Hash } else { "NULL" }
     - Usa el valor exacto resultante como root-sha256 en el frontmatter del output.
     - NUNCA copies el comando ni el placeholder al output.

  3. ESCRIBIR OUTPUT
     - Usa write_to_file para crear openspec/changes/[CHANGE]/specs/[DOMAIN]/spec.md
     - El output SOLO contiene el bloque delimitado por OUTPUT START / OUTPUT END de abajo.
     - Secciones sin cambios MAY omitirse del delta.

  REGLAS CRÍTICAS:
  - DO NOT include implementation details (HOW). Only WHAT.
  - FULL Spec (dominio nuevo) → todas las secciones como ADDED, sin MODIFIED/REMOVED.
  - DELTA Spec (dominio existente) → solo secciones con cambios reales.
  - MODIFIED: copiar bloque COMPLETO del root spec, luego editar inline. Parcial = pérdida de datos.
  - COBERTURA: OBLIGATORIO happy paths + edge cases. Error states solo si hay I/O, red o asincronismo.
  - RFC 2119: MUST/SHALL = obligatorio · SHOULD = recomendado · MAY = opcional
  ============================================================ -->

<!-- OUTPUT START — Escribe SOLO lo que está debajo de esta línea -->
---
root-sha256: [ESCRIBIR HASH AQUÍ] o null
---
# Spec: [Nombre de la Funcionalidad o Cambio]

## ADDED Requirements
<!-- Incluir SOLO si hay comportamiento nuevo. Omitir si no aplica. -->

### Requirement: [Nombre]

El sistema MUST/SHALL/SHOULD [comportamiento específico].

#### Scenario: [Happy path]
- GIVEN [precondición ideal]
- WHEN [acción]
- THEN [resultado exitoso]

#### Scenario: [Edge case]
- GIVEN [precondición inusual o límite]
- WHEN [acción]
- THEN [resultado esperado]

#### Scenario: [Error state] <!-- Opcional: Requerido solo si hay I/O, red o asincronismo -->
- GIVEN [condición de falla o error]
- WHEN [acción]
- THEN [manejo del error o resultado]

## MODIFIED Requirements
<!-- Incluir SOLO si cambia comportamiento existente. Omitir si no aplica. -->

### Requirement: [Nombre Existente]

[Texto completo actualizado — reemplaza el existente.]
(Previously: [qué cambió, en una línea])

#### Scenario: [Copiado íntegro sin omisiones]
- GIVEN ...
- WHEN ...
- THEN ...

## REMOVED Requirements
<!-- Incluir SOLO si se depreca funcionalidad. Omitir si no aplica. -->

### Requirement: [Nombre]
(Reason: [por qué se depreca])
<!-- OUTPUT END -->