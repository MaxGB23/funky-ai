# SDD Explore — 017 Handoff Enforcement (Agent DRY)

> **Feature:** 017 — Enforcement de Handoff Contract (Agent DRY)
> **Fecha:** 2026-05-07
> **Estado:** ✅ Exploración completa

---

## 1. Problema

El Orquestador puede terminar su planning phase SIN haber generado el `worker-handoff.md`.
Actualmente, la generación del handoff está documentada como un paso del flujo, pero no
existe ningún mecanismo estructural que impida al Orquestador "saltear" ese paso.

**Consecuencia:** El Worker queda ciego. El humano tiene que recordar pedirle al Orquestador
que genere el handoff, lo que introduce micro-gestión y rompe el flujo autónomo del protocolo.

### Síntoma concreto observado
- El Orquestador genera `sdd-tasks.md` y luego instiga al humano a abrir un chat nuevo...
  sin haber escrito el `worker-handoff.md`.
- El humano no tiene nada que pegarle al Worker en el nuevo chat.

---

## 2. Estado Actual del Sistema

### `.agents/rules/sdd-orchestrator.md`

El archivo contiene un **Planning Checklist** (§ "Planning Checklist") que lista la generación
del handoff como ítem #2. Sin embargo, este checklist está redactado como una **tabla de
verificación post-hoc**, NO como un gate estructural que bloquee la delegación.

El "Protocolo de Delegación (MANDATORY)" dice:
> "Cuando el plan esté en disco, PARAR y decir..."

Pero no define explícitamente QUÉ constituye "el plan completo en disco".
La frase "plan listo" es ambigua → el modelo puede interpretar que `sdd-tasks.md` alcanza.

### `funky-cli/src/templates/sdd/worker-handoff.md`

El template canónico existe y es correcto. El problema NO está en el template —
está en el protocolo que ordena su generación.

---

## 3. Causa Raíz

**Root Cause:** La regla de delegación usa el término vago `"plan listo"` como trigger de salida,
en lugar de requerir explícitamente la presencia física del `worker-handoff.md` en disco.

Engram relevante:
- `[documentation-vs-enforcement]`: Documentar ≠ enforcer. El fix correcto hace el error estructuralmente imposible.
- `[orchestrator-planning-checklist]`: Enforcement al inicio del artefacto, no al final.

---

## 4. Impacto / Scope del Cambio

| Archivo | Tipo de cambio | Justificación |
|---------|---------------|---------------|
| `.agents/rules/sdd-orchestrator.md` | Edición — refuerzo de protocolo | Redefinir el "Return Statement" de la fase de orquestación |

**Solo 1 archivo** a modificar. Sin cambios en CLI, templates o engram (el template ya es correcto).

---

## 5. Restricciones

- **NO duplicar** instrucciones del template en la regla (respeta `[agent-dry-handoffs]`).
- La regla debe referenciar el template como source of truth, no copiarlo.
- El cambio debe ser mínimamente invasivo — no reescribir secciones que funcionan.

---

## 6. Tags de Engram Aplicables

- `[documentation-vs-enforcement]` — la causa raíz exacta
- `[orchestrator-planning-checklist]` — patrón de enforcement temprano
- `[agent-dry-handoffs]` — restricción de diseño
- `[in-template-rule-injection]` — colocar reglas cerca del punto de ejecución
