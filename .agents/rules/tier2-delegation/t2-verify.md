---
trigger: manual
---

# Guardrails Tier 2 - Verify Ligero

## 1. ⚠️ Orchestration Checklist (EJECUTAR ANTES de delegar)
| # | Verificación | Acción si falta |
|---|-------------|-----------------|
| 1 | ¿Está completa la fase de specs y tareas (implementación)? | Completa las fases previas |
> 🔴 **Si falta, no delegues.**

## 2. Prompt de Delegación
**Cómo delegar:** `define_subagent` (Lectura + Escritura).

> 🔴 **PROHIBIDO usar `self` para esta fase.** Debes usar `define_subagent` con un prompt acotado. `self` clona todo tu contexto y rompe el patrón de ligereza del Tier 2.

**Prompt estricto a inyectar al subagente:**

> ## Tarea
> Verifica que la implementación de "[CHANGE]" cumple con las especificaciones.
> ## Artefactos a leer
> - `openspec/changes/[CHANGE]/specs/[DOMAIN]/spec.md` (o la ruta donde se haya generado)
> - `openspec/changes/[CHANGE]/tasks.md`
> ## Contexto Previo
> [Inyecta aquí el digest del funkygram y las metodologías activas del proyecto. Si no aplican, omite esta sección.]
> ## Formato de retorno
> ```markdown
> ## Verification Report
> **Change**: [CHANGE]
> **Verdict**: PASS | PASS WITH FUNCTIONAL WARNINGS | PASS WITH COSMETIC WARNINGS | FAIL
> 
> ### Validación
> Ejecuta los comandos de la entrada **Validación del proyecto** del Contexto Previo y reporta ✅/❌ por comando ([N] passed / [M] failed cuando aplique).
> 
> ### Issues
> [lista de issues o "None"]
> 
> ### Acción para el Orquestador
> [PASS → archive | FUNCTIONAL WARNINGS → re-apply con funky-worker | COSMETIC WARNINGS → fix inline si <5 líneas | FAIL → funky-worker]
> ```