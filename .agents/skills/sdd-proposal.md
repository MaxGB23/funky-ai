---
trigger: manual
description: >
  Cargar este Skill cada vez que un agente (Orquestador o Worker) deba crear o
  actualizar un documento de propuesta, release doc, SDD, o cualquier artefacto
  de planificación dentro del ecosistema Funky AI. NO se activa por glob —
  debe ser invocado explícitamente desde el prompt del Orquestador o del Worker.
---

# Skill: SDD Proposal — Redacción Estructurada de Propuestas

## Contexto e Intención

Este Skill existe para prevenir el anti-patrón documentado en `docs/post-mortem.md`
bajo el topic_key `[discovery][proposal-sin-estado]`:

> *"Las propuestas se redactaron iterativamente en el chat sin un template
> estructurado que obligue a definir Estado actual, Backlog IDs vinculados y
> Referencias de archivo explícitas en cada punto de implementación."*

La consecuencia directa de ese anti-patrón fue que el campo `Estado` quedó
desactualizado (decía "Ideación" cuando la rama ya estaba activa) y varios
puntos de implementación carecían de referencia a un archivo concreto, haciendo
la propuesta no auditable ni trazable.

**Principio rector:** Una propuesta sin Estado controlado y sin referencias de
archivo explícitas NO es una propuesta válida en el ecosistema Funky AI — es
ruido documental.

---

## Cuándo Usar Este Skill

- Al crear cualquier documento nuevo en `docs/funky-ai/propuestas/`
- Al crear release docs (ej: `propuesta-vX.Y-*.md`)
- Al redactar SDDs de features nuevas dentro de Funky AI
- Al actualizar una propuesta existente que cambia de Estado

---

## Campos OBLIGATORIOS (sin estos, el documento es inválido)

| Campo          | Descripción                                                              |
|----------------|--------------------------------------------------------------------------|
| `Estado`       | Valor controlado: `Ideación`, `In Progress`, o `Done`. Debe reflejar la realidad del repo **hoy**, no la intención futura. |
| `Backlog IDs`  | Al menos un ID del `BACKLOG.md`. Si no existe aún, crear la entrada primero. |
| `Implementación` | Cada punto DEBE mencionar el archivo destino concreto. Formato: `→ path/to/file.md — [qué cambia]`. Sin archivo = punto inválido. |
| `Criterios de Aceptación` | Al menos 2 ítems testeables con checkbox. Cada uno debe poder responderse ✅ o ❌. |

## Campos OPCIONALES

| Campo            | Descripción                                                            |
|------------------|------------------------------------------------------------------------|
| `Versión Target` | Semver del milestone asociado (ej: `v1.2`).                            |
| `Fecha`          | Fecha de creación o última actualización en formato `YYYY-MM-DD`.      |
| `Riesgos / Tradeoffs` | Qué se compromete al implementar esta propuesta.                  |

---

## Audit Check — Ejecutar ANTES de declarar la sesión "lista"

Antes de cerrar tu sesión o emitir tu Return Envelope, verificá cada punto:

- [ ] **Estado refleja la realidad HOY**: ¿La rama existe? ¿Hay código commiteado? → `In Progress`. ¿Merged a main? → `Done`.
- [ ] **Cada punto de Implementación tiene archivo**: Ningún punto puede decir "establecer por norma" sin indicar el archivo donde vive esa norma.
- [ ] **Criterios de Aceptación son testeables**: ¿Podés responder ✅ o ❌ *ahora mismo* para cada uno?
- [ ] **BACKLOG.md actualizado**: ¿Los IDs referenciados existen en `docs/BACKLOG.md`?
- [ ] **Frontmatter del documento destino**: ¿El archivo guardado existe físicamente en disco?

---

## Template Copiable

Usá este bloque como base. Eliminá los comentarios entre corchetes al completar.

```markdown
# [Título de la Propuesta]

| Campo           | Valor                             |
|-----------------|-----------------------------------|
| Estado          | Ideación / In Progress / Done     |
| Versión Target  | vX.Y                              |
| Backlog IDs     | [ID-A, ID-B]                      |
| Fecha           | YYYY-MM-DD                        |

## Problema / Motivación

[¿Qué duele hoy sin esta feature? Sé concreto. Evitá frases genéricas como
"mejorar la experiencia". Describí el dolor real con ejemplos del repo.]

## Criterios de Aceptación

- [ ] [Condición concreta y verificable — debe poder responderse ✅ o ❌]
- [ ] [Cada ítem debe ser testeable sin ambigüedad]

## Implementación

- → `path/to/file.md` — [qué cambia exactamente en ese archivo]
- → `path/to/other.md` — [qué cambia exactamente en ese archivo]

*(Cada punto DEBE referenciar el archivo destino. Sin referencia = punto inválido.)*

## Riesgos / Tradeoffs

- [Qué comprometemos al implementar esto — performance, deuda técnica, complejidad]

## Audit Check (Ejecutar al cierre de sesión)

- [ ] ¿El campo Estado refleja la realidad del repo HOY?
- [ ] ¿Cada punto de Implementación tiene referencia de archivo?
- [ ] ¿Los Criterios de Aceptación son testeables?
- [ ] ¿El BACKLOG.md fue actualizado con los IDs de esta propuesta?
```
