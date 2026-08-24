---
trigger: manual
---

# Guardrails Tier 2 - Propose Ligero

## 1. ⚠️ Orchestration Checklist (EJECUTAR ANTES de delegar)
| # | Verificación | Acción si falta |
|---|-------------|-----------------|
| 1 | ¿Tengo los hallazgos del Explore listos para inyectar? | Revisa los resultados del subagente anterior |
> 🔴 **Si falta, no delegues.**

## 2. Prompt de Delegación
**Cómo delegar:** `define_subagent` (Lectura + Escritura).

> 🔴 **PROHIBIDO usar `self` para esta fase.** Debes usar `define_subagent` con un prompt acotado. `self` clona todo tu contexto y rompe el patrón de ligereza del Tier 2.

**Prompt estricto a inyectar al subagente:**

> ## Tarea
> Genera la propuesta de cambio para "[CHANGE]".
> ## Artefactos a leer
> - `openspec/changes/[CHANGE]/explore.md`, **Prohibido ignorar la sección "2. Context Preservation"**
> ## Template a seguir
> - `openspec/changes/[CHANGE]/proposal.md` — Leer y usar `replace_file_content`.
> ## Contexto Previo
> [Inyecta aquí el digest del funkygram y las metodologías activas del proyecto. Si no aplican, omite esta sección.]
> ## Formato de retorno
> ```markdown
> ## Proposal Created
> **Change**: [CHANGE]
> **Summary**: [resumen]
> **Risk Level**: [Low/Medium/High]
> **Artefacto generado en**: openspec/changes/[CHANGE]/proposal.md
> ```