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

> 🔴 **PROHIBIDO usar `self` para esta fase.** Debes usar `define_subagent` con un prompt acotado. `self` clona todo tu contexto y rompe el patrón de ligereza del Tier 2.

**Prompt estricto a inyectar al subagente:**

> ## Tarea
> Genera las especificaciones del cambio para "[CHANGE]".
> ## Artefactos a leer
> - `openspec/changes/[CHANGE]/proposal.md`
> ## Template a seguir
> - `openspec/changes/[CHANGE]/spec.md` — Leer y usar `replace_file_content`.
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
> **Artefacto generado en**: openspec/changes/[CHANGE]/spec.md
> ```