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
**Prompt estricto a inyectar al subagente:**

> ## Tarea
> Genera la propuesta de cambio para "[CHANGE]".
> ## Artefactos a leer
> - `docs/openspec/changes/[CHANGE]/explore.md`, **Prohibido ignorar la sección "2. Context Preservation"**
> ## Template a seguir
> - `docs/openspec/changes/[CHANGE]/proposal.md` — Leer y usar `replace_file_content`.
> ## Tags de engram (opcional)
> - Nombre: [Nombre]
> - Descripción: [Descripción]
> ## Formato de retorno
> ```markdown
> ## Proposal Created
> **Change**: [CHANGE]
> **Summary**: [resumen]
> **Risk Level**: [Low/Medium/High]
> ```
