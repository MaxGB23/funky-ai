# SDD Proposal — 017 Handoff Enforcement (Agent DRY)

> **Feature:** 017 — Enforcement de Handoff Contract
> **Fecha:** 2026-05-07
> **Decisión:** ✅ APROBADO — Proceder a Spec

---

## 1. Propuesta Seleccionada

**Convertir el "Protocolo de Delegación" en un Return Statement explícito con precondiciones verificables.**

La regla en `.agents/rules/sdd-orchestrator.md` debe dejar de ser una *guía narrativa*
y pasar a ser un **contrato de salida**: el Orquestador no puede emitir el prompt de
delegación al humano hasta que `worker-handoff.md` exista físicamente en el disco.

### Mecanismo concreto

1. **Renombrar** la sección "Protocolo de Delegación (MANDATORY)" → **"🔴 Return Statement (MANDATORY — Blocking)"**
2. **Agregar un gate explícito** justo antes del prompt de delegación:
   ```
   BEFORE emitting the delegation prompt:
   ✅ Verify worker-handoff.md exists in openspec/changes/{name}/
   ❌ If missing → generate it NOW using the template in §Protocolo Obligatorio — Generación de Worker Handoffs
   ```
3. **Refrasear** la condición de salida: de `"cuando el plan esté listo"` → `"cuando worker-handoff.md esté en disco"`.

---

## 2. Alternativas Descartadas

| Alternativa | Motivo de descarte |
|-------------|-------------------|
| **A) Agregar un lint/script en el CLI** que valide la carpeta | Over-engineering. El problema es de protocolo de agente, no de tooling. El CLI no puede interceptar lo que el LLM omite. |
| **B) Modificar el template `worker-handoff.md`** para que se auto-explique mejor | El template ya es correcto. El problema está upstream: el Orquestador no lo genera, no en cómo está escrito. |
| **C) Agregar un campo en `sdd-tasks.md`** que exija la ruta del handoff | Introduce redundancia con el Planning Checklist existente. Dos lugares para verificar lo mismo → drift garantizado. |

---

## 3. Tradeoffs de la Propuesta Elegida

| Pro | Contra |
|-----|--------|
| Cero overhead para el humano | Ninguno significativo |
| Mínima invasión (1 archivo, 1 sección) | — |
| DRY: referencia el template, no lo duplica | — |
| Consistente con `[documentation-vs-enforcement]` | — |

---

## 4. Decisión Arquitectónica

> **DECISIÓN:** El `worker-handoff.md` es el **único Return Statement válido** de la fase de orquestación.
> Un Orquestador que emite el prompt de delegación sin haber generado el handoff
> está en **violación de protocolo**, no en un "olvido".

Esta decisión se registrará en el engram bajo el tag `[handoff-as-return-statement]`.
