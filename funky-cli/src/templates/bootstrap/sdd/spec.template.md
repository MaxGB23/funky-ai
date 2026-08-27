<!-- ============================================================
  AGENT INSTRUCTIONS — Leer antes de escribir. NO incluir en el output.
  ============================================================
  TAREA: Genera el delta spec de la feature y escríbelo en:
         openspec/changes/[CHANGE]/specs/[DOMAIN]/spec.md

  PASOS OBLIGATORIOS:
  1. IDENTIFICAR DOMINIO(S)
     - Lee la sección `## 2. Capabilities` del proposal.md.
     - Extrae el dominio de cada capability del path embebido: `openspec/specs/{dominio}/...`
     - Si hay capabilities de MÚLTIPLES dominios, crea un spec por cada uno.
     - Si el path está malformado o tiene typo, infiere el nombre más cercano y valida en el paso siguiente.
     - Ejecuta en terminal para validar nombres reales:
       Get-ChildItem -Directory "openspec/specs/" -ErrorAction SilentlyContinue | Select-Object Name
     - Si el dominio del proposal NO coincide exactamente con uno existente → asumir typo, usar el existente.
     - Solo crea un dominio nuevo si la feature introduce un módulo genuinamente nuevo.

  2. CALCULAR ROOT HASH (por cada dominio)
     - Ejecuta en PowerShell:
       if (Test-Path "openspec/specs/[DOMAIN]/spec.md") { (Get-FileHash -LiteralPath "openspec/specs/[DOMAIN]/spec.md" -Algorithm SHA256).Hash } else { "NULL" }
     - Hash real → usa el valor como `root-sha256: {HASH}` en el frontmatter.
     - NULL → `root-sha256: null` + el output es un **FULL Spec**: escribe el spec completo SIN headers `## ADDED Requirements`, `## MODIFIED Requirements` ni `## REMOVED Requirements`. Solo `## Requirements` directo.
     - NUNCA copies el comando ni el placeholder al output.

  3. ESCRIBIR OUTPUT (uno por dominio)
     - Usa write_to_file para crear openspec/changes/[CHANGE]/specs/{domain}/spec.md por cada dominio identificado.
     - El output SOLO contiene el bloque delimitado por OUTPUT START / OUTPUT END de abajo.
     - Secciones sin cambios MAY omitirse del delta.

  REGLAS CRÍTICAS:
  - DO NOT include implementation details (HOW). Only WHAT.
  - FULL Spec (root-sha256 = null) → se escribe sin headers `## ADDED Requirements` / `## MODIFIED Requirements` / `## REMOVED Requirements`. Usa `## Requirements` directo con todos los requisitos.
  - DELTA Spec (dominio existente) → solo secciones con cambios reales.
  - MODIFIED: copiar bloque COMPLETO del root spec, luego editar inline. Parcial = pérdida de datos.
  - COBERTURA: OBLIGATORIO happy paths + edge cases. Error states solo si hay I/O (incluye creación/escritura de archivos), red o asincronismo.
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