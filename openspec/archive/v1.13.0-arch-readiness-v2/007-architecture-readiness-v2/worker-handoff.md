# 🤖 Funky AI — Worker Handoff: Fase 0, 1 y 2 (Branch, Templates y TDD)

> **Instrucción para el LLM:** Sos un Worker **Tier T2** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `sdd-report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/007-architecture-readiness-v2/worker-handoff.md Ejecutá la Fase 1`

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

### C) Especificación de Tarea
```
view_file docs/openspec/changes/007-architecture-readiness-v2/tasks.md
view_file docs/openspec/changes/007-architecture-readiness-v2/spec.md
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Crear la rama del feature (Fase 0), modificar los templates de `architecture-assessment.md` y `architecture-review-template.md` para incluir los nuevos NFRs, y escribir los tests unitarios (`assess.test.js`) asegurando que el parser pueda extraer estos nuevos valores antes de refactorizar la lógica principal.

**Directiva Agent DRY:**
Leé tus tareas a ejecutar directamente desde la **Fase 0**, **Fase 1** y **Fase 2** en `tasks.md` (cargado en §1.C). Podés agrupar las tres fases en esta ejecución.

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Tu scope está delimitado en §2. Si algo fuera de scope está roto, documentalo en el report, no lo arregles |
| 🔴 Acción Directa | Cada archivo se escribe con tools de escritura directa. |
| 🟡 Bugs Encontrados | Si encontrás un bug no relacionado con tu tarea → registralo en `sdd-report.md` bajo `## Bugs Encontrados` con schema engram (`What / Why / Where / Learned`) |
| 🟢 Idempotencia | Verificá si el destino ya existe antes de sobreescribir. Documentá si salteás algo |

---

## 4. Criterios de Éxito

- [ ] Todos los archivos listados en §2 fueron creados/modificados en disco.
- [ ] El `sdd-report.md` fue actualizado con la sección de esta Fase.
- [ ] Ningún archivo fuera de scope fue modificado.
- [ ] Si se encontraron bugs no relacionados, están documentados con schema engram.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/007-architecture-readiness-v2/sdd-report.md` con:

```markdown
## Fase 0, 1 y 2 — Branch, Templates & TDD
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `ruta/al/archivo.ext` (descripción del cambio)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No / Sí — [Si Sí: describir qué encontraste que invalida o modifica fases siguientes]
- **Próxima acción:** Qué debe hacer el Orquestador a continuación
```
