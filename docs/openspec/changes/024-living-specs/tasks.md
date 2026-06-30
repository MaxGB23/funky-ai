# Tasks: 024 — Transición a Living Specs

**Estado:** 🟡 EN PROGRESO (Fases 0, 1, 2 y 3 completadas — pendiente Fase 4)
**Rama:** `feature/024-living-specs`
**Ref:** `proposal.md`, `specs/openspec/spec.md`, `specs/workflow/spec.md`

> **ORCHESTRATOR GATE**: Si eres el Orquestador — STOP. No ejecutes inline. Delega al Worker o sub-agente por fase.

---

## Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| U1 — `/funky-archive` Workflow | Implementar el workflow de merge + archivado | PR-1 | ⚠️ Riesgo alto: anti-lazy rule crítica |
| U2 — Estructura `openspec/specs/` | Crear Root Spec canónico inicial para dominio `workflow` | PR-1 o PR-2 | U1 depende de U2 — archive necesita el root spec para tener algo contra qué mergear |
| U3 — Actualizar `/funky-spec` | Inyectar formato Delta estricto y checksum en el workflow de Spec | PR-2 | Toca workflow global — cuidado con regresiones |

---

## FASE 0 — Branch Setup

**🚫 Restricciones:** Solo git, sin modificar código ni docs.

- [x] 0.1 Verificar git disponible: `git --version`
- [x] 0.2 Verificar que el branch no existe: `git branch --list feature/024-living-specs`
- [x] 0.3 Crear branch: `git checkout -b feature/024-living-specs`
- [x] 0.4 Confirmar branch activo: `git status`

---

## FASE 1 — Root Spec Structure

> Objetivo: Establecer la estructura `openspec/specs/` y el Root Spec canónico del dominio `workflow` como source of truth.

**🚫 Restricciones:** No tocar workflows globales todavía.

- [x] 1.1 Crear directorio `docs/openspec/specs/workflow/` si no existe
- [x] 1.2 Crear `docs/openspec/specs/workflow/spec.md` como FULL Spec (sin secciones ADDED/MODIFIED/REMOVED) con los requisitos actuales del dominio workflow tal como están definidos
- ~~1.3~~ **NOTA:** El Root Spec NO lleva hash inline. Su path ya lo identifica únicamente. El hash del Root Spec se calcula en el momento de crear el Delta (task 3.3) y se guarda como `root-sha256` en el frontmatter del Delta Spec, no en el Root Spec.
- [x] 1.4 Verificar: el archivo existe y no contiene secciones Delta (`ADDED`, `MODIFIED`, `REMOVED`)

---

## FASE 2 — `/funky-archive` Workflow [⚠️ RIESGO ALTO]

> Objetivo: Crear el workflow que merge Delta → Root Spec + mueve la feature a `archive/`.

**🚫 Restricciones:** No modificar otros workflows. El workflow debe ser standalone.

- [x] 2.1 Crear `docs/prompts/sdd/funky-archive.md` (o actualizar si ya existe con stub vacío)
- [x] 2.2 Implementar el bloque **Bootstrap**: instrucción al agente de leer `ORCHESTRATOR-STATE.md` y detectar el feature path como argumento de entrada
- [x] 2.3 Implementar el bloque **Checksum Validation**: el agente lee el `root-sha256` del Delta Spec, ejecuta `Get-FileHash -LiteralPath "docs/openspec/specs/{dominio}/spec.md" -Algorithm SHA256` y compara el valor de `Hash` con el `root-sha256` del Delta — si no coinciden, abortar y emitir error explícito **antes de escribir cualquier archivo**
- [x] 2.4 Implementar el bloque **Merge Logic** con anti-lazy enforcement:
  - Instrucción explícita: "PRESERVE ALL EXISTING REQUIREMENTS VERBATIM. Apply ONLY the blocks declared under ADDED, MODIFIED, or REMOVED."
  - Aplicar secciones `ADDED` → append al Root Spec
  - Aplicar secciones `MODIFIED` → reemplazar bloque original por el bloque completo del Delta (incluyendo anotación `Previously:`)
  - Aplicar secciones `REMOVED` → eliminar bloque identificado por su título exacto
- [x] 2.5 Implementar el bloque **Full Spec Path**:
  > ⚠️ CRÍTICO: Si `root-sha256: null` → el delta es un **FULL Spec**, copiar íntegro sin transformación.
  > Si `root-sha256` tiene un valor → es un **DELTA**, mergear sección por sección.
  > Confundir ambas ramas corrompe el Root Spec silenciosamente.
- [x] 2.6 Implementar el bloque **Archive Move**: mover `openspec/changes/{feature}/` a `openspec/archive/{new-name}/` con naming convention:
  - `vX.Y.Z-{desc}` si es release versionado
  - `YYYY-MM-DD-{desc}` si es dated
  - Verificar soft limit ~40 entries en `openspec/archive/` y advertir si se supera
- [x] 2.7 Verificar: dry-run conceptual completado — el workflow cubre todos los escenarios de los Delta Specs de `024-living-specs` (checksum, merge, full-spec path, archive move)

---

## FASE 3 — Actualizar `/funky-spec` Workflow

> Objetivo: Que el workflow de Spec genere automáticamente Delta Specs con formato estricto y checksum.

**🚫 Restricciones:** Modificación quirúrgica — no alterar lógica de tiering ni scaffolding de la fase.

- [x] 3.1 Leer el workflow actual `funky-spec.md` para identificar el bloque de instrucciones de salida
- [x] 3.2 Agregar al workflow la instrucción de **formato obligatorio** de Delta Spec:
  - Secciones en orden: `## ADDED Requirements`, `## MODIFIED Requirements`, `## REMOVED Requirements`
  - Secciones vacías pueden omitirse
- [x] 3.3 Agregar al workflow la instrucción de **checksum**: el agente DEBE ejecutar `Get-FileHash -LiteralPath "docs/openspec/specs/{dominio}/spec.md" -Algorithm SHA256` y usar el valor de `Hash` como `root-sha256` en el frontmatter/header del Delta Spec. Si no existe Root Spec → `root-sha256: null`
- [x] 3.4 Agregar al workflow la instrucción de **Full-Block Integrity**: para `MODIFIED`, copiar el bloque original íntegro con todos sus scenarios y anotar `(Previously: ...)` en el campo modificado
- [x] 3.5 Verificar: los specs actuales de `024-living-specs` ya tienen formato equivalente (ADDED/MODIFIED/REMOVED con Given/When/Then) — el workflow actualizado es backward-compatible

---

## FASE 4 — Smoke Test End-to-End
**Fase pendiente de aplicar en el futuro, fuera de esta feature**
El motivo es que aun hay una feature que contiene un release.md (condicional dependiendo el tipo de feature), que puede tener logica que colapse con el funky-archive, ya que release.md contiene tambien algunas reglas de archivado.

> Objetivo: Validar el flujo completo con los artefactos de `024-living-specs`.

- [ ] 4.1 Usar el Delta `specs/openspec/spec.md` de `024-living-specs` y ejecutar `/funky-archive` sobre el Root Spec del dominio `openspec` (crear Root Spec vacío si no existe, con `root-sha256: null`)
- [ ] 4.2 Verificar que el Root Spec resultante contiene los 4 requirements del Delta sin omisiones ni parafraseos
- [ ] 4.3 Usar un Delta con SHA256 desactualizado (modificar el hash manualmente) y verificar que el workflow aborta con error claro antes de escribir
- [ ] 4.4 Verificar que `openspec/changes/024-living-specs/` es movido correctamente a `openspec/archive/` con el nombre apropiado

---

> **[ORQUESTADOR]** Al terminar cada fase, marcar `[x]` y guardar en disco inmediatamente. Un `tasks.md` desactualizado = sesión ciega.
> Siguiente fase: `/funky-apply docs/openspec/changes/024-living-specs`