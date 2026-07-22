---
trigger: manual
---

# Guardrails Tier 2 - Spec Ligero

## 1. ⚠️ Orchestration Checklist (EJECUTAR ANTES de delegar)
| # | Verificación | Acción si falta |
|---|-------------|-----------------|
| 1 | ¿Existe el proposal generado? | Ejecuta la fase Propose o verifica `proposal.md` |
> 🔴 **Si falta, no delegues.**

## 2. Prompt de Delegación
**Cómo delegar:** `define_subagent` (Lectura + Escritura).
**Prompt estricto a inyectar al subagente:**

> ## Tarea
> Genera las especificaciones del cambio para "[CHANGE]".
> ## Artefactos a leer
> - `docs/openspec/changes/[CHANGE]/proposal.md`
> ## Template a seguir
> - `docs/openspec/changes/[CHANGE]/specs/[DOMAIN].md` — Leer y usar `replace_file_content`.
> ## Tags de engram relevantes (opcional)
> - Nombre: [Nombre]
> - Descripción: [Descripción]
> ## Formato de retorno
> ```markdown
> ## Specs Created
> **Change**: [CHANGE]
> | Domain | Type | Requirements | Scenarios |
> |--------|------|-------------|-----------|
> | [domain] | [New/Delta] | [N] | [M] |
> 
> **Coverage**: happy paths ✅ / error states ⚠️ parcial
> ```
