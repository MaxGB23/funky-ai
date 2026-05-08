# 🤖 Funky AI — Worker Handoff: Fase 0 & Fase 1

> **Instrucción para el LLM:** Sos un Worker **Tier T2** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `sdd-report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/016-rfc-semantics/worker-handoff.md Ejecutá la Fase 0 y Fase 1`

---

## 1. Inyección de Contexto (Safe-Contexting)

### A) Estado Global del Proyecto
```
view_file ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente (Memory Polling — Two-Stage)

**Stage 1 (siempre ejecutar):**
```
view_file docs/engram/index.md
```

**Stage 2:** (No tags required for this task)

### C) Especificación de Tarea
```
view_file docs/openspec/changes/016-rfc-semantics/tasks.md
view_file .agents/rules/sdd-orchestrator.md
view_file docs/repo-map.md
view_file funky-cli/src/commands/init.js
```

### D) Skills Requeridas (Explicit Routing)
```
(Ninguna)
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Crear el branch de la feature y actualizar los archivos de reglas y documentación para separar la semántica de RFCs vs Proposals.

**Directiva Agent DRY:**
Leé tus tareas a ejecutar directamente desde la Fase 0 y Fase 1 en `tasks.md` (cargado en §1.C).

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Solo modificar los archivos indicados en tasks.md |
| 🔴 Acción Directa | Usar tools de edición sobre disco directo o comandos unix básicos |

---

## 4. Criterios de Éxito

- [ ] Branch git creado exitosamente.
- [ ] `.agents/rules/sdd-orchestrator.md` actualizado con reglas de RFC.
- [ ] `docs/repo-map.md` actualizado con nueva descripción de `rfcs/`.
- [ ] `funky-cli/src/templates/sdd/rfc-template.md` creado.
- [ ] `funky-cli/src/commands/init.js` modificado para copiar el template.
- [ ] `sdd-report.md` creado/actualizado con status de ambas fases.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/016-rfc-semantics/sdd-report.md` con:

```markdown
## Fase 0 & Fase 1 — Setup y Refactor Doc
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `ruta/al/archivo.ext` (descripción del cambio)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No / Sí
- **Próxima acción:** Qué debe hacer el Orquestador a continuación
```
