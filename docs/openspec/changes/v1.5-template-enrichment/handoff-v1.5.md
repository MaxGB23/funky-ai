# 🤖 Funky AI — Worker Handoff: Fase 3 (Remediar Deuda de Release)

> **Instrucción para el LLM:** Sos un Worker de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

---

## 1. Inyección de Contexto (Safe-Contexting)

### A) Estado Global del Proyecto
```
view_file ORCHESTRATOR-STATE.md
view_file README.md
```

### B) Memoria Persistente (Memory Polling)
```
grep_search "" docs/engram/discoveries.md (IsRegex: false)
```

### C) Especificación de Tarea
```
view_file docs/openspec/changes/v1.5-template-enrichment/tasks.md
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Reparar la deuda técnica de documentación generando las release notes faltantes (v1.3.0 y v1.4.0) y actualizando los archivos de estado (`README.md` y `ORCHESTRATOR-STATE.md`) para que reflejen la realidad actual del proyecto.

**Acciones exactas:**
1. Crear `docs/funky-ai/releases/v1.3.0-release.md` con las Release notes de v1.3 (Worker Handoff, Memory Polling canonizado).
2. Crear `docs/funky-ai/releases/v1.4.0-release.md` con las Release notes de v1.4 (`funky init`, `funky phase`, templates bootstrap y SDD, smoke test, plantilla oficial worker handoff).
3. Actualizar la raíz del proyecto `README.md`:
   - Cambiar versión a v1.4.0.
   - Actualizar sección de Engram para que apunte a `docs/engram/` (no a `docs/post-mortem.md`).
   - Agregar sección del CLI documentando brevemente `funky init` / `funky phase`.
   - Agregar link a `docs/funky-ai/guia-flujo-completo.md`.
4. Actualizar `ORCHESTRATOR-STATE.md`:
   - Corregir el estado indicando que el merge de la v1.4 ya está hecho y estamos operando sobre la feature v1.5.
   - Limpiar las tareas pendientes (ya no está pendiente mergear la v1.4).
   - Agregar v1.5 como feature activa/estado actual.

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1. |
| 🔴 Foco Láser | Tu scope está delimitado en §2. |
| 🔴 Acción Directa | Escribí/modificá los archivos con tus tools. Cero borradores en el chat. |
| 🟡 Restricción | Solo manipular los archivos `.md` indicados. No tocar código. |

---

## 4. Criterios de Éxito

- [ ] Los 4 archivos mencionados en la Sección 2 fueron creados/actualizados en disco.
- [ ] Ningún otro archivo fuera de scope fue tocado.
- [ ] El `report.md` (en `docs/openspec/changes/v1.5-template-enrichment/report.md`) fue actualizado con el status de la Fase 3.

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/v1.5-template-enrichment/report.md` con:

```markdown
## Fase 3 — Remediar Deuda de Release
- **Status:** ✅ Completada
- **Archivos creados/modificados:**
  - `docs/funky-ai/releases/v1.3.0-release.md`
  - `docs/funky-ai/releases/v1.4.0-release.md`
  - `README.md`
  - `ORCHESTRATOR-STATE.md`
- **Bugs encontrados:** Ninguno
- **Próxima acción:** Avisar al Orquestador para ejecutar la Fase 4 (Release Humano).
```
