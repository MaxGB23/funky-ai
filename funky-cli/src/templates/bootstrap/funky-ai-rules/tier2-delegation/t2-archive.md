---
trigger: manual
---

# Guardrails - Archive tier 2

## 1. ⚠️ Orchestration Checklist (EJECUTAR ANTES de delegar)
| # | Verificación | Acción si falta |
|---|-------------|-----------------|
| 1 | ¿Verify PASS? | Aplicar los cambios |
> 🔴 **Si falta, no delegues.**

## 2. Prompt de Delegación
**Cómo delegar:** `self` (excepción válida — archive requiere contexto compartido de workflow)
**Prompt:**
```text
/funky-archive
feature_name: {change-name}
tag: {tag-opcional}
```
## 3. Siguiente fase es release-checklist.md