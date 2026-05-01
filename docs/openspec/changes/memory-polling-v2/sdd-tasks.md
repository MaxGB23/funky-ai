# SDD Tasks — Memory Polling v2

> **Feature:** `memory-polling-v2`
> **Fecha:** 2026-05-01
> **Rama:** `feat/memory-polling-v2`
> **Versión target:** v1.11.0

---

## Resumen de Fases

| Fase | Descripción | Tier | Worker |
|------|-------------|------|--------|
| Fase 0 | Crear feature branch | T1 | Worker |
| Fase 1 | Crear `engram/index.md` con las 25 entradas existentes | T1 | Worker |
| Fase 2 | Actualizar protocolo en `sdd-orchestrator.md` + `worker-handoff.md` template | T1 | Worker |
| Fase 3 | Agregar discovery + cerrar sesión (bump ORCHESTRATOR-STATE.md a v1.11.0) | T1 | Worker |

---

## Fase 0 — Crear Feature Branch

**Tier:** T1 (operación git, sin ambigüedad)
**Objetivo:** Aislar el cambio en rama propia antes de cualquier escritura.

### Tareas

- [ ] Ejecutar: `git checkout -b feat/memory-polling-v2`
- [ ] Verificar con `git branch` que la rama esté activa
- [ ] Crear `docs/openspec/changes/memory-polling-v2/sdd-report.md` con skeleton vacío

### Criterios de Éxito

- [ ] La rama `feat/memory-polling-v2` existe y está activa
- [ ] `sdd-report.md` creado con skeleton de Return Envelope

---

## Fase 1 — Crear Engram Index

**Tier:** T1 (lectura + creación de archivo, sin lógica compleja)
**Objetivo:** Crear `docs/engram/index.md` con las 25 entradas existentes del engram indexadas.

### Contexto a cargar

```
view_file ORCHESTRATOR-STATE.md
view_file docs/engram/index.md        ← verificar idempotencia (no debe existir aún)
view_file docs/openspec/changes/memory-polling-v2/sdd-spec.md  ← fuente de verdad del contenido
```

### Tareas

Leé la Fase 1 en `sdd-spec.md` y ejecutá exactamente lo que dice ahí.

Específicamente:
- [ ] Crear `docs/engram/index.md` con la estructura de tabla definida en `sdd-spec.md §1`
- [ ] Verificar que las 19 entradas de `discoveries.md` y 6 de `bugfixes.md` estén todas representadas (25 total + la nueva que se agrega en Fase 3)

### Criterios de Éxito

- [ ] `docs/engram/index.md` existe en disco
- [ ] Contiene exactamente 25 entradas (22 discoveries actuales + 6 bugfixes, más el nuevo que se agrega en Fase 3 queda pendiente)
- [ ] Cada entrada tiene tag exacto en formato `[kebab-case]`
- [ ] Return Envelope actualizado en `sdd-report.md`

---

## Fase 2 — Actualizar Protocolo de Memory Polling

**Tier:** T1 (modificación de markdown, sin lógica compleja)
**Objetivo:** Reemplazar el protocolo de polling en `sdd-orchestrator.md` y `worker-handoff.md` con el Two-Stage definido en `sdd-spec.md`.

### Contexto a cargar

```
view_file ORCHESTRATOR-STATE.md
view_file docs/engram/index.md                                        ← Stage 1 polling
view_file docs/openspec/changes/memory-polling-v2/sdd-spec.md        ← fuente de verdad
view_file .agents/rules/sdd-orchestrator.md                          ← archivo a modificar
view_file funky-cli/src/templates/sdd/worker-handoff.md              ← archivo a modificar
```

### Contexto adicional a cargar
```
view_file funky-cli/src/templates/sdd/tasks.md   ← también a modificar
```

### Tareas

Leé la Fase 2 en `sdd-spec.md` y ejecutá exactamente lo que dice ahí.

Específicamente:
- [ ] Modificar `.agents/rules/sdd-orchestrator.md`: reemplazar sección `## Memory Polling` con el protocolo Two-Stage
- [ ] Modificar `funky-cli/src/templates/sdd/worker-handoff.md`: reemplazar `§1.B Memory Polling` con el protocolo Two-Stage
- [ ] En ambos archivos, agregar la nota: "Al agregar una nueva entrada al engram, SIEMPRE actualizar también `docs/engram/index.md`"
- [ ] Modificar `funky-cli/src/templates/sdd/tasks.md`: en la sección de Release, agregar al `MANDATORY_RELEASE_PROTOCOL` el check: "¿Revisaste `docs/openspec/backlog/` en busca de items implementados que deban moverse al `archive/`?"

### Criterios de Éxito

- [ ] `sdd-orchestrator.md` tiene el nuevo protocolo Two-Stage sin referencias al grep_search directo antiguo
- [ ] `worker-handoff.md` template §1.B refleja el Two-Stage
- [ ] Ambos archivos mencionan la obligación de actualizar `index.md` al agregar entradas
- [ ] `funky-cli/src/templates/sdd/tasks.md` tiene el check de backlog en su Release section
- [ ] Return Envelope actualizado en `sdd-report.md`

---

## Fase 3 — Discovery + Release (MANDATORY_RELEASE_PROTOCOL)

**Tier:** T1 (escritura de markdown + operaciones git)
**Objetivo:** Cerrar la feature correctamente: agregar discovery, actualizar engram index, bump de versión, commit y merge.

### Contexto a cargar

```
view_file ORCHESTRATOR-STATE.md
view_file docs/engram/index.md
view_file docs/openspec/changes/memory-polling-v2/sdd-spec.md
view_file docs/openspec/changes/memory-polling-v2/sdd-report.md
```

### Tareas

Leé la Fase 3 en `sdd-spec.md` y ejecutá exactamente lo que dice ahí.

Específicamente:
- [ ] Agregar entry `[DISCOVERY][memory-polling-index-layer]` al final de `docs/engram/discoveries.md` (texto exacto en `sdd-spec.md §2`)
- [ ] Agregar la línea correspondiente al final de la tabla de Discoveries en `docs/engram/index.md`
- [ ] Actualizar `ORCHESTRATOR-STATE.md`:
  - Cambiar versión a `v1.11.0`
  - Marcar tarea de Memory Polling como `[x]`
  - Agregar fila `v1.11.0` en la tabla de historial
  - Agregar `docs/engram/index.md` en la tabla de Archivos Clave
  - Actualizar fecha de última sesión

> **[SISTEMA] MANDATORY_RELEASE_PROTOCOL — No declarar esta Fase completada sin:**
> - [ ] ¿Actualizaste `docs/engram/discoveries.md` con el nuevo discovery `[memory-polling-index-layer]`?
> - [ ] ¿Actualizaste `docs/engram/index.md` con las nuevas entries (incluyendo `[openspec-backlog-lifecycle]`)?
> - [ ] ¿Bumpeaste la versión en `ORCHESTRATOR-STATE.md` a v1.11.0?
> - [ ] ¿Registraste la feature en la tabla de historial?
> - [ ] ¿Revisaste `docs/openspec/backlog/` en busca de items implementados que deban moverse al archive?
> - [ ] ¿El `sdd-report.md` tiene todas las fases con Status ✅?

---

## Notas del Orquestador

- Esta feature NO toca código JS del CLI — es puramente un cambio de protocolo de documentación.
- No se requieren tests automatizados.
- El Smoke Test equivalente es: el Orquestador en un chat virgen ejecuta Memory Polling leyendo solo el índice y puede determinar si existe conocimiento previo relevante. Validarlo mentalmente antes de cerrar la sesión.
