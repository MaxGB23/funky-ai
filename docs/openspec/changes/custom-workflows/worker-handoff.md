# 🤖 Funky AI — Worker Handoff: Fase 3 (Generación de Phase Workflows)

> **Instrucción para el LLM:** Sos un Worker de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `sdd-report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `/funky-worker @docs/openspec/changes/custom-workflows/worker-handoff.md Ejecutá la Fase 3`

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
view_file docs/openspec/changes/custom-workflows/sdd-tasks.md
view_file docs/openspec/changes/custom-workflows/workflow-design.md
```

### D) Skills Requeridas (Explicit Routing)
```
view_file .agents/workflows/funky-explore.md
list_dir docs/openspec/changes/custom-workflows/material
```
> *(Nota: Deberás leer el contenido de los `sdd-prompt-*.md` dentro de `material/` a medida que generes cada workflow).*

---

## 2. La Misión (Surgical Task)

**Objetivo:** Crear los 7 archivos `.agents/workflows/funky-{fase}.md` faltantes, usando el diseño de `workflow-design.md` (y el ejemplo de `funky-explore.md`), e inyectando la lógica base desde los archivos `material/sdd-prompt-*.md`. Aplicar optimización de tokens acortando ejemplos largos y removiendo redundancias.

**Directiva Agent DRY:**
Leé tus tareas a ejecutar directamente desde la Fase actual en `sdd-tasks.md` (cargado en §1.C).

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Tu scope está delimitado en §2. |
| 🔴 Acción Directa | Cada archivo se escribe con tools de escritura directa. |
| 🟢 Idempotencia | Verificá si el destino ya existe antes de sobreescribir. Documentá si salteás algo |

---

## 4. Criterios de Éxito

- [ ] Los 7 workflows (`propose`, `spec`, `design`, `tasks`, `apply`, `verify`, `archive`) fueron creados en `.agents/workflows/`.
- [ ] Tienen el frontmatter de slash command (trigger y description).
- [ ] Siguen el estándar de cierre sin preguntas (Return Envelope final).
- [ ] Las instrucciones core se mantuvieron, pero los ejemplos se acortaron para ahorrar tokens.
- [ ] El `sdd-report.md` fue actualizado.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/custom-workflows/sdd-report.md` con:

```markdown
## Fase 3 — Generación de Phase Workflows
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `.agents/workflows/funky-propose.md` (Workflow)
  - ... (los 7 archivos)
- **Detalle de Ejecución:**
  - Se crearon los 7 workflows recortando verbosidad para optimizar tokens.
- **Bugs encontrados:** Ninguno
- **🔴 Cambio de Scope Detectado:** No
- **Próxima acción:** Notificar al humano que la Feature 020 está implementada.
```
