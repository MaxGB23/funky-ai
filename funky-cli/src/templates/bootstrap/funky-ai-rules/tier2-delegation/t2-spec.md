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
**Cómo delegar:** `define_subagent` (Lectura + Escritura + Terminal).

> 🔴 **PROHIBIDO usar `self` para esta fase.** Debes usar `define_subagent` con un prompt acotado. `self` clona todo tu contexto y rompe el patrón de ligereza del Tier 2.

**Prompt estricto a inyectar al subagente:**

> ## Tarea
> Genera las especificaciones del cambio para la feature "[CHANGE]".
> Lee el template en `openspec/changes/[CHANGE]/spec.template.md` y sigue sus instrucciones al pie de la letra.
> 
> ## Artefactos a leer
> - Proposal: `openspec/changes/[CHANGE]/proposal.md`
> - Template (instrucciones + estructura): `openspec/changes/[CHANGE]/spec.template.md`
> 
> ## Contexto Previo
> [Inyecta aquí el digest del funkygram y las metodologías activas del proyecto. Si no aplican, omite esta sección.]
> 
> ## Formato de retorno
> ```markdown
> ## Specs Created
> **Change**: [CHANGE]
> | Domain | Type | Requirements | Scenarios |
> |--------|------|-------------|-----------|
> | [DOMAIN-1] | [New/Delta] | [N] | [M] |
> | [DOMAIN-2] | [New/Delta] | [N] | [M] |
> 
> **Coverage**: happy paths ✅ / error states ⚠️ parcial
> **Artefactos generados en**: openspec/changes/[CHANGE]/specs/{domain}/spec.md (uno por domain)
> ```