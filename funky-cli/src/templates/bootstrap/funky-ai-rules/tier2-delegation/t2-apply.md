---
trigger: manual
---

# Guardrails Tier 2 - Worker (Apply)

## 1. ⚠️ Orchestration Checklist (EJECUTAR ANTES de delegar)
| # | Verificación | Acción si falta |
|---|-------------|-----------------|
| 1 | ¿Están completos specs y tasks? | Completa las fases previas |
| 2 | ¿El humano eligió Nativa o Handoff en el Checkpoint PRE-APPLY? | Ejecuta el Checkpoint |
> 🔴 **Si falta algo, no delegues.**

## 2. Prompt de Delegación (modo Nativa)
**Cómo delegar:** `define_subagent` (Lectura + Escritura).
> 🔴 **PROHIBIDO usar `self` para esta fase.**

**Prompt estricto a inyectar al subagente:**

> ## Tarea
> Asume el rol del workflow en `docs/funky-ai/prompts/sdd/funky-worker.md` y ejecuta el batch indicado ([BATCH]) o `openspec/changes/[CHANGE]/tasks.md`.
> ## Contexto Previo
> [Inyecta aquí el digest del funkygram y las metodologías activas del proyecto — en Apply son CRÍTICAS: el worker debe cumplirlas mientras implementa.]
> ## Formato de retorno
> Genera tu `report.md` según la estructura del workflow.

## 3. Reglas de Orquestación
- Múltiples batches → **secuencial** (uno por uno), subagente individual por batch, nunca reutilizados.
- **CRÍTICO:** cada worker genera un `report.md`; espéralo y léelo antes de continuar.

## 4. Modo Handoff
NO delegues — prepara el bloque copy-paste: `/funky-worker` + referencia al batch o `tasks.md`. Nada más (Ley de Invarianza): el IDE ya trae el workflow como slash command; el prompt de "leer path y tomar rol" es mecánica EXCLUSIVA del CLI para `define_subagent`.
