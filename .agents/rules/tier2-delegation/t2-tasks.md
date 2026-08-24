---
trigger: manual
---

# Guardrails - Tasks Adaptado a Tier 2

## 1. ⚠️ Orchestration Checklist (EJECUTAR ANTES de delegar)
| # | Verificación | Acción si falta |
|---|-------------|-----------------|
| 1 | ¿Existe propose y spec? Design(opcional) | Ejecuta las fases faltantes |
> 🔴 **Si falta, no delegues.**

## 2. Prompt de Delegación
> 🔴 **PROHIBIDO:** delegar usando `self`. 
**Cómo delegar:** Utiliza **siempre** `define_subagent`

**Prompt:**
```text
Lee el workflow en `docs/funky-ai/prompts/sdd/funky-tasks.md` (usando `view_file`) y adopta tu rol (Tasks Phase Agent).
feature_name: {change-name}
Contexto Previo: {digest del funkygram + metodologías activas — opcional}
Genera los entregables dentro del workspace en `openspec/changes/{feature_name}/...` o la estructura que defina el workflow.
NUNCA guardes outputs en un directorio brain local.
```