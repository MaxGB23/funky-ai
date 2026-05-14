---
description: SDD Orchestrator Workflow - Lógica Operativa de Planificación
---

# SDD Orchestrator — Lógica Operativa

## ⚠️ Planning Checklist (EJECUTAR ANTES de delegar cualquier fase — NO OMITIR)

Antes de escribir el primer `worker-handoff.md` o de decirle al humano qué pegar en el chat, el Orquestador DEBE verificar este checklist:

| # | Verificación | Acción si falta |
|---|-------------|-----------------|
| 0 | ¿Existe `docs/openspec/changes/{feature}/explore.md`? | **PEDIR AL HUMANO que corra `funky feature <name>`.** El scaffolding (carpetas y archivos en blanco) es responsabilidad exclusiva del CLI. El Orquestador SOLO DEBE sobrescribir los archivos ya creados, NUNCA generarlos desde cero. |
| 1 | ¿Ejecuté el Memory Polling Stage 1? | `view_file docs/engram/index.md` ahora |
| 2 | ¿El `tasks.md` tiene `MANDATORY_RELEASE_PROTOCOL` completo? | Verificar secciones Doc-Ops y Git-Ops |
| 3 | ¿El Tier del Worker está declarado (T1/T2/T3)? | Completar campo en el `worker-handoff.md` |

> 🔴 **Si cualquier ítem es NO → no delegues. Completalo (o pedí al humano que lo complete) primero.** Un Orquestador que delega sin estos 4 ítems rompe el protocolo y hace al Worker ciego.

## Comandos y Acciones

| Comando | Acción |
|---------|--------|
| `/sdd-explore` | **PRERREQUISITO:** Verificar que el archivo existe. Si no, pedir al humano `funky feature <name>`. **Acción:** Sobrescribir `openspec/changes/{name}/explore.md` |
| `/sdd-propose` | **PRERREQUISITO:** Verificar que existen los archivos. **Acción:** Sobrescribir `proposal.md` + `spec.md` en el mismo folder |
| `/sdd-ff` | **PRERREQUISITO:** Verificar que existen `explore.md`, `proposal.md` **Y** `spec.md` en `openspec/changes/{name}/` con contenido. **LUEGO:** `ACTION: Execute view_file on docs/openspec/changes/{name}/tasks.md` (ya inyectado por `funky feature` — no leer el golden por separado, es el mismo contenido). Solo entonces sobrescribir `tasks.md`. |

## ⚠️ Protocolo Obligatorio — Generación de Worker Handoffs
Antes de escribir CUALQUIER `worker-handoff.md`, el Orquestador DEBE:
1. `ACTION: Execute view_file on .agents/templates/sdd/worker-handoff.md`
2. Usar ese template como base. NO redactar desde cero.
3. Completar `Tier [⚠️ COMPLETAR: T1 / T2 / T3]` con el valor correcto según la Escalation Matrix.

## 🔴 Return Statement — Delegación (MANDATORY — BLOCKING)

El Orquestador NO puede emitir el prompt de delegación sin verificar este Pre-Gate:

| # | Verificación | Si falla |
|---|-------------|----------|
| G1 | `worker-handoff.md` existe en `openspec/changes/{name}/` | Generarlo AHORA (ver §Protocolo Obligatorio) |
| G2 | El campo `Tier [⚠️ COMPLETAR]` fue reemplazado por T1, T2 o T3 | Completarlo AHORA |
| G3 | §1.C del handoff tiene la ruta exacta del `sdd-tasks.md` de esta feature | Completarlo AHORA |

> 🔴 Si G1, G2 o G3 fallan → NO emitas el prompt. Corregí primero. Solo entonces:

> "El plan está listo. Cerrá este chat, abrí uno nuevo y decime:
> `/funky-worker @docs/openspec/changes/{name}/worker-handoff.md Ejecutá la Fase N`."

## ⚡ T1 Phase Batching (Optimización)
Podés combinar múltiples fases en un único Worker si se cumplen las TRES condiciones:
1. **Todas las fases son Tier 1** (operaciones sin ambigüedad: git, crear/modificar markdown)
2. **No hay dependencia crítica** entre ellas (la salida de Fase N no puede invalidar Fase N+1)
3. **No se espera Scope Change** entre ellas

En ese caso, decile al Worker: `Ejecutá las Fases N y N+1`. El Worker reporta ambas en el `sdd-report.md`.
> ⚠️ Si cualquiera de las 3 condiciones NO se cumple → fases separadas obligatorio.

## ⚠️ Checkpoint Entre Fases (MANDATORY)
Al recibir el reporte de cada Fase, ANTES de delegar la siguiente:
1. `ACTION: Execute view_file on report-faseN.md`
2. Leer el campo `🔴 Cambio de Scope Detectado`.
   - Si es **No** → delegar la siguiente fase directamente.
   - Si es **Sí** → PARAR. Revisar `sdd-tasks.md` y los handoffs afectados. Actualizar antes de continuar.
