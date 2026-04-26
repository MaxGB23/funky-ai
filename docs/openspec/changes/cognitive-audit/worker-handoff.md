# 🤖 Funky AI — Worker Handoff: Fase 1 (Token Diet y Roles)

> **Instrucción para el LLM:** Sos un Worker **Tier 1** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/cognitive-audit/worker-handoff.md Ejecutá la Fase 1`

---

## 1. Inyección de Contexto (Safe-Contexting)

Antes de ejecutar **cualquier tarea**, el Worker DEBE cargar los tres pilares de contexto:

### A) Estado Global del Proyecto
`ACTION: Execute view_file on ORCHESTRATOR-STATE.md`

### B) Memoria Persistente (Memory Polling)
`ACTION: Execute grep_search on docs/engram/discoveries.md with query "orchestrator" or "rules"`
`ACTION: Execute grep_search on docs/engram/bugfixes.md with query "orchestrator" or "rules"`

### C) Especificación de Tarea
`ACTION: Execute view_file on docs/openspec/changes/cognitive-audit/tasks.md`
`ACTION: Execute view_file on .agents/rules/sdd-orchestrator.md`
`ACTION: Execute view_file on .agents/rules/engram-protocol.md`

---

## 2. La Misión (Surgical Task)

**Objetivo:** Refactorizar las reglas globales del orquestador y el protocolo de engrams para eliminar el ruido narrativo e incluir condicionales inquebrantables y XML tags.

**Acciones exactas:**
1. **Refactorizar `.agents/rules/sdd-orchestrator.md`:**
   - Reducir explicaciones largas (Token Diet).
   - Aplicar formato imperativo estricto.
   - Envolver el contenido en etiquetas `<ROLE_ORCHESTRATOR>` y `<ROLE_WORKER>` con la instrucción CRÍTICA de ignorar si no corresponde al rol actual.
   - **Bugfix (Data Stale):** Eliminar la referencia obsoleta a `docs/post-mortem.md` (líneas ~51-57) y apuntar al engram actual (`docs/engram/discoveries.md` y `docs/engram/bugfixes.md`).

2. **Refactorizar `.agents/rules/engram-protocol.md`:**
   - Eliminar explicaciones filosóficas/teóricas.
   - Dejar únicamente el schema Markdown/JSON esperado y órdenes imperativas.

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Tu scope está delimitado en §2. Si algo fuera de scope está roto, documentalo en el report, no lo arregles |
| 🔴 Acción Directa | Cada archivo se escribe con tools de escritura directa. |
| 🟡 Bugs Encontrados | Si encontrás un bug no relacionado con tu tarea → registralo en `report.md` bajo `## Bugs Encontrados` con schema engram (`What / Why / Where / Learned`) |
| 🟢 Idempotencia | Verificá si el destino ya existe antes de sobreescribir. Documentá si salteás algo |

---

## 4. Criterios de Éxito

- [ ] Todos los archivos listados en §2 fueron modificados en disco siguiendo las directivas.
- [ ] El `report.md` fue actualizado con la sección de esta Fase.
- [ ] Ningún archivo fuera de scope fue modificado.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/cognitive-audit/report.md` con:

```markdown
## Fase 1 — Token Diet y Roles
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `.agents/rules/sdd-orchestrator.md` (Token diet, Roles XML, Bugfix post-mortem)
  - `.agents/rules/engram-protocol.md` (Token diet)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **Próxima acción:** El Orquestador debe crear el handoff para la Fase 2.
```
