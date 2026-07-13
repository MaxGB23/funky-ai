# Debate: CLI-first Scaffolding para Fases SDD

> **Fecha:** 2026-05-07
> **Contexto:** Surgido durante la planificación del pendiente 017 (Handoff Enforcement).
> **Relevante para:** Pendiente 009 (Base Templates & Customization Guide), fase futura post-009.

---

## El problema que disparó el debate

Durante la sesión del 017, el Orquestador generó el `sdd-tasks.md` **sin leer el template canónico** (`funky-cli/src/templates/sdd/tasks.md`). El resultado fue un archivo con:

- FASE 0 (Branch Setup) ausente
- MANDATORY_RELEASE_PROTOCOL sin XML tags ni estructura canónica
- Sin checklists Doc-Ops / Git-Ops separados
- Sin restricciones por fase (`🚫 Restricciones:`)
- Return Envelope incompleto

**La meta-ironía:** el pendiente 017 existe para evitar que el Orquestador saltee pasos de protocolo, y en el proceso de crearlo, el Orquestador salteó leer el template de tasks.

---

## Diagnóstico de la causa raíz

El único comando con un prerequisito explícito de "leer template antes de generar" era el `worker-handoff.md`:

```
## ⚠️ Protocolo Obligatorio — Generación de Worker Handoffs
Antes de escribir CUALQUIER worker-handoff.md, el Orquestador DEBE:
1. ACTION: Execute view_file on funky-cli/src/templates/sdd/worker-handoff.md
```

El `/sdd-ff` no tenía el equivalente. Solo decía "crear `sdd-tasks.md`". El modelo fue de memoria.

**Fix aplicado en v1.16.0:** Agregar `ACTION: Execute view_file on funky-cli/src/templates/sdd/tasks.md` como prerequisito explícito del comando `/sdd-ff`.

---

## Las tres opciones debatidas

### Opción A — Parche puntual (elegida para 017)
Agregar la instrucción de leer el template al comando `/sdd-ff` en las reglas del Orquestador.

- ✅ Mínima invasión, resolución inmediata
- ✅ Patrón ya probado (funciona para worker-handoff)
- ⚠️ No rompe el ciclo de "más reglas = más superficie de error"

### Opción B — CLI-first Scaffolding
`funky phase ff <name>` genera `sdd-tasks.md` y `worker-handoff.md` en `openspec/changes/{name}/` directamente desde los templates canónicos. El modelo solo llena los placeholders.

**Por qué suena bien:**
- La estructura la garantiza código, no la memoria del modelo
- El CLI ya tiene el 80% del mecanismo (`funky phase` existe y lee templates)
- Un solo punto de mantenimiento: actualizás el template → todos los futuros scaffolds lo usan
- El modelo hace lo que hace bien: razonar y generar contenido, no recordar estructura

**Por qué tiene un problema crítico con 009:**
El pendiente 009 define que el CLI inyecta una base genérica, y el modelo la adapta según el Project Canvas y el Arch-Assessment. Esa versión adaptada es el "template real" para el proyecto.

Si la Opción B inyecta el template base sin las adaptaciones del Canvas, el modelo tiene que hacer adaptaciones estructurales de todas formas → mismo problema de antes, solo desplazado un paso.

**La pregunta de diseño sin resolver:** ¿El CLI debe inyectar el base genérico (como 009 define para `init`) o el adaptado post-Canvas? ¿Cuándo y quién hace la adaptación?

Esta pregunta no se puede responder hasta que 009 esté implementado y se sepa con precisión qué significa "template adaptado" en la práctica.

### Opción C — Reducir artefactos SDD
Fusionar explore + proposal, hacer el spec inline en tasks.

Descartada porque conflicta con el pendiente 012 (Auto-Tiering), que requiere que el Orquestador declare su Tier en un paso explícito de pre-vuelo previo a la generación de artefactos. Mezclar artefactos hace más difícil insertar ese punto de decisión.

---

## El patrón sistémico identificado

> Estamos en una espiral de complejidad documental:
> Bug de protocolo → nueva regla/checklist → más superficie de error → nuevo bug → nueva regla...

El sistema tiene:
- 136 líneas de reglas en `sdd-orchestrator.md`
- 7 templates SDD que el modelo debe recordar usar
- 5 checklists distintos
- 4 artefactos previos al handoff

Y el modelo sigue cometiendo errores estructurales. **Más reglas no resuelve el problema de cumplir reglas.**

La dirección correcta a largo plazo es que el CLI garantice la estructura (código es determinístico) y el modelo aporte contenido (razonamiento es donde brilla). Pero eso requiere que 009 esté resuelto primero para entender la estrategia completa de templates.

---

## Decisión final de esta sesión

| Item | Decisión |
|------|---------|
| Fix inmediato (017) | Parche puntual: prerequisito `view_file tasks.md` en `/sdd-ff` + Return Statement bloqueante con gates G1/G2/G3 |
| CLI-first scaffolding (Opción B) | Diferido a post-009. Requiere que 009 resuelva la estrategia de templates primero. |
| Reducción de artefactos (Opción C) | Descartada por conflicto con 012 |

---

## Pregunta abierta para cuando se retome en 009

> Cuando el CLI inyecta el `sdd-tasks.md` desde el template, ¿qué partes son **invariantes** (FASE 0, MANDATORY_RELEASE_PROTOCOL, Return Envelope — siempre iguales) y qué partes son **variables** (fases específicas del feature, restricciones por fase)?

La hipótesis es que las partes invariantes (que son exactamente las que el modelo olvidó hoy) podrían ser scaffoldeadas por el CLI con seguridad, y las variables serían los únicos placeholders que el modelo debe completar. Esto podría ser compatible con 009 si el "template base" solo contiene la estructura invariante.
