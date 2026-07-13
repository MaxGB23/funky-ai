# 🤖 Funky AI — Worker Handoff: Fase 1 (Enforcement en Regla del Orquestador)

> **Instrucción para el LLM:** Sos un Worker **Tier T1** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `sdd-report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/017-handoff-enforcement/worker-handoff.md Ejecutá la Fase 1`

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
grep_search "[documentation-vs-enforcement]" docs/engram/discoveries.md (IsRegex: false)
grep_search "[agent-dry-handoffs]" docs/engram/discoveries.md (IsRegex: false)
```

> Si agregás una entrada nueva al engram en esta Fase, TAMBIÉN actualizá `docs/engram/index.md`.

### C) Especificación de Tarea
```
view_file docs/openspec/changes/017-handoff-enforcement/sdd-tasks.md
view_file .agents/rules/sdd-orchestrator.md
view_file docs/engram/discoveries.md
view_file docs/engram/index.md
```

### D) Skills Requeridas (Explicit Routing)
```
No aplica — operaciones puramente documentales (edición de Markdown).
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Modificar `.agents/rules/sdd-orchestrator.md` para que la generación del
`worker-handoff.md` sea un gate bloqueante (Return Statement explícito) antes de la
delegación. Registrar la decisión en el engram.

**Directiva Agent DRY:**
Leé tus tareas a ejecutar directamente desde la **Fase 1** en `sdd-tasks.md` (cargado en §1.C).

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Tu scope está delimitado en §2. Si algo fuera de scope está roto, documentalo en el report, no lo arregles |
| 🔴 Acción Directa | Cada archivo se escribe con tools de escritura directa. |
| 🟡 Bugs Encontrados | Si encontrás un bug no relacionado con tu tarea → registralo en `sdd-report.md` bajo `## Bugs Encontrados` con schema engram (`What / Why / Where / Learned`) |
| 🟢 Idempotencia | Verificá si el destino ya existe antes de sobreescribir. Documentá si salteás algo |

### 🔍 Jerarquía de Conocimiento (Doc-Ops)
1. **Prioridad 1:** Las tareas T1.1, T1.2 y T1.3 en `sdd-tasks.md` son las instrucciones absolutas.
2. No se requiere MCP context7 — es trabajo 100% documental.

---

## 4. Criterios de Éxito

- [ ] La sección "Protocolo de Delegación (MANDATORY)" fue reemplazada por "🔴 Return Statement — Delegación (MANDATORY — BLOCKING)" con tabla de gates G1/G2/G3.
- [ ] El ítem #2 del Planning Checklist fue eliminado y las filas re-numeradas.
- [ ] La entrada `[handoff-as-return-statement]` existe en `docs/engram/discoveries.md`.
- [ ] La entrada `[handoff-as-return-statement]` existe en `docs/engram/index.md`.
- [ ] El `sdd-report.md` fue creado/actualizado con el Return Envelope de esta Fase.

---

## 5. Return Envelope (Al terminar)

Crear `docs/openspec/changes/017-handoff-enforcement/sdd-report.md` con:

```markdown
## Fase 1 — Enforcement en Regla del Orquestador
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `.agents/rules/sdd-orchestrator.md` (Return Statement bloqueante + Planning Checklist limpiado)
  - `docs/engram/discoveries.md` (nueva entrada [handoff-as-return-statement])
  - `docs/engram/index.md` (nueva fila en tabla Discoveries)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No / Sí — [describir si aplica]
- **Próxima acción:** El Orquestador ejecuta el MANDATORY_RELEASE_PROTOCOL (Doc-Ops inline) y delega la Fase 2 (Git-Ops) a un Worker Flash.
```

> **[SISTEMA]** Si `🔴 Cambio de Scope Detectado` es **Sí**, el Orquestador DEBE revisar y actualizar `sdd-tasks.md` y los handoffs de fases siguientes ANTES de continuar la delegación.
