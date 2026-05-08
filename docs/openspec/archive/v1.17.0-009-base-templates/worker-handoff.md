# 🤖 Funky AI — Worker Handoff: Fase X+1 (Git-Ops Release)

> **Instrucción para el LLM:** Sos un Worker **Tier T1** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `sdd-report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/archive/v1.17.0-009-base-templates/worker-handoff.md Ejecutá la Fase Git-Ops`

---

## 1. Inyección de Contexto (Safe-Contexting)

Antes de ejecutar **cualquier tarea**, el Worker DEBE cargar los tres pilares de contexto:

### A) Estado Global del Proyecto
```
view_file ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente (Memory Polling — Two-Stage)

**Stage 1 (siempre ejecutar):**
```
view_file docs/engram/index.md
```

**Stage 2 (solo si encontrás un tag relevante en Stage 1):**
```
grep_search "[TAG-EXACTO-DEL-INDICE]" docs/engram/discoveries.md (IsRegex: false)
grep_search "[TAG-EXACTO-DEL-INDICE]" docs/engram/bugfixes.md (IsRegex: false)
```

> Si agregás una entrada nueva al engram en esta Fase, TAMBIÉN actualizá `docs/engram/index.md`.

### C) Especificación de Tarea
```
view_file docs/openspec/archive/v1.17.0-009-base-templates/tasks.md
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Ejecutar la subida a Git, merge a main y tageo de la versión v1.17.0, consolidando el trabajo de agnostización de templates públicos y la copia del legacy.

**Datos para la ejecución (declarados por Orquestador):**
- **Versión Exacta:** `v1.17.0`
- **Mensaje de Commit:** `feat: base templates agnósticos y progressive disclosure (RFC 009)`
- **Nombre del Branch:** `feature/v1.17.0-009-base-templates`
- **Mensaje del Tag:** `Release v1.17.0 - Aislamiento de templates y refactor de init`

**Directiva Agent DRY:**
Leé tus tareas a ejecutar directamente desde el CHECKLIST GIT-OPS en la Fase X+1 de `tasks.md` (cargado en §1.C).

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` |
| 🔴 Acción Directa | Ejecutá los comandos git directamente en la terminal. |
| 🔴 Solo Comandos Git | No edites archivos de texto. Si algo falla, documentá y pará. |

---

## 4. Criterios de Éxito

- [ ] Repositorio limpio y commiteado.
- [ ] Merge realizado en main.
- [ ] Tag `v1.17.0` creado.
- [ ] Push exitoso a origin main.
- [ ] El `sdd-report.md` en el archivo fue actualizado con la confirmación.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/archive/v1.17.0-009-base-templates/sdd-report.md` con:

```markdown
## Fase X+1 — Git-Ops
- **Status:** ✅ Completada / ❌ Bloqueada
- **Comandos Ejecutados:** (lista)
- **Bugs encontrados:** Ninguno / (error de git si aplica)
- **Próxima acción:** Finalizado.
```
