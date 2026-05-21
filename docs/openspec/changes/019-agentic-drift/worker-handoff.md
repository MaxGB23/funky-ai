# 🤖 Funky AI — Worker Handoff: Fase 1 (Templates & Protocols Setup)

> **Instrucción para el LLM:** Sos un Worker **Tier T2** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `/funky-worker @docs/openspec/changes/019-agentic-drift/worker-handoff.md Ejecutá la Fase 1`

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
view_file docs/openspec/changes/019-agentic-drift/tasks.md
view_file docs/openspec/changes/019-agentic-drift/proposal.md
view_file docs/openspec/changes/019-agentic-drift/spec.md
```

### D) Skills Requeridas (Explicit Routing)
```
[Ninguna específica para esta fase. Markdown puro.]
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Actualizar los templates SDD base e inyectar los nuevos bloques de protocolo para T3, asegurando compatibilidad con los marcadores de inyección del nuevo CLI Stateful Wizard.

**Directiva Agent DRY:**
Leé tus tareas a ejecutar directamente desde la **FASE 1** en `tasks.md` (cargado en §1.C). Deberás crear dos archivos nuevos en `protocols/` y modificar cuatro archivos existentes en `funky-cli/src/templates/sdd/` y `.agents/templates/sdd/`.

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Tu scope está delimitado en §2. Si algo fuera de scope está roto, documentalo en el report, no lo arregles |
| 🔴 Acción Directa | Cada archivo se escribe con tools de escritura directa. |
| 🔴 **Restricción Crítica** | **NO TOCAR NINGÚN CÓDIGO JAVASCRIPT DEL CLI EN ESTA FASE.** Solo Markdown. |
| 🟢 Idempotencia | Verificá si el destino ya existe antes de sobreescribir. |

---

## 4. Criterios de Éxito

- [ ] Todos los archivos listados en la FASE 1 de `tasks.md` fueron creados/modificados en disco.
- [ ] Los marcadores (`<!-- T3:NFR_SECTION -->`, `<!-- T3:DEVIL_ADVOCATE -->`, y `<!-- T1:REMOVE -->`) fueron colocados exactamente donde corresponde sin alterar la estructura original de los templates base.
- [ ] El `report.md` (o `sdd-report.md`) fue actualizado con la sección de esta Fase.
- [ ] Ningún archivo `.js` fue modificado.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/019-agentic-drift/report.md` con:

```markdown
## Fase 1 — Templates & Protocols Setup
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `ruta/al/archivo.md` (breve rol del archivo)
- **Detalle de Ejecución:**
  - [Lista de lo implementado]
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No / Sí
- **Próxima acción:** Qué debe hacer el Orquestador a continuación
```
