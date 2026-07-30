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
> - `openspec/changes/[CHANGE]/spec.md`
> - `openspec/changes/[CHANGE]/tasks.md`
> ## Tags de engram relevantes (opcional)
> - Nombre: [Nombre]
> - Descripción: [Descripción]
> ## Formato de retorno
> ```markdown
> ## Verification Report
> **Change**: [CHANGE]
> **Verdict**: PASS | PASS WITH FUNCTIONAL WARNINGS | PASS WITH COSMETIC WARNINGS | FAIL
> 
> ### Build & Tests
> **Build**: ✅/❌
> **Tests**: [N] passed / [M] failed
> 
> ### Issues
> [lista de issues o "None"]
> 
> ### Acción para el Orquestador
> [PASS → archive | FUNCTIONAL WARNINGS → re-apply con funky-worker | COSMETIC WARNINGS → fix inline si <5 líneas | FAIL → funky-worker]
> ```
