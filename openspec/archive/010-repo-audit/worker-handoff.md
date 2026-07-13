# 🤖 Funky AI — Worker Handoff: Auditoría de Repositorio (010)

> **Instrucción para el LLM:** Sos un Worker **Tier T3** (Exploración profunda y análisis semántico).
> Tu única misión es leer este documento, ejecutar la Fase 5 detallada en `tasks.md` interactuando con el sistema operativo, y actualizar el `report.md`.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/010-repo-audit/worker-handoff.md Ejecutá la Fase 5`

---

## 1. Inyección de Contexto (Safe-Contexting)

### A) Estado Global del Proyecto
```
view_file ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente
```
view_file docs/engram/index.md
```

### C) Especificación de Tarea
```
view_file docs/openspec/changes/010-repo-audit/tasks.md
view_file docs/repo-map.md
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Hacer un deep-dive en `docs/funky-ai/`, analizar las carpetas de testing duplicadas para proponer un merge seguro, y aplicar la reubicación de carpetas legacy (`gentle-ai`) a un archivo histórico, respetando las notas humanas del `repo-map.md`.

**Directiva Agent DRY:**
Leé tus tareas paso a paso directamente desde `docs/openspec/changes/010-repo-audit/tasks.md` bajo el título **Fase 5**.

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración Random | Solo inspeccioná `docs/funky-ai/` y los directorios de testing (`funky-cli/test` y `funky-cli/tests`). |
| 🔴 Foco Láser | El objetivo es resolver los comentarios de "ANALISIS HUMANO" dejados en el `repo-map.md`. |
| 🟡 Dudas de Contexto | Si la resolución de las carpetas de testing no es trivial, pedí permiso al Orquestador en el `report.md`. |

---

## 4. Criterios de Éxito

- [ ] Se escaneó y documentó `docs/funky-ai/` en el `repo-map.md`.
- [ ] Se analizó el conflicto de testing y se propuso la resolución.
- [ ] Se archivó `gentle-ai/`.
- [ ] El `report.md` refleja todo esto.

---

## 5. Return Envelope (Al terminar)

Al finalizar, actualizá `docs/openspec/changes/010-repo-audit/report.md` agregando:

```markdown
## Fase 5 — Deep-Dive y Resolución
- **Status:** ✅ Completada / ❌ Bloqueada
- **Resolución de Testing:** (Explicar qué se decidió hacer con test/ y tests/)
- **Archivos Mapeados:** (Resumen de docs/funky-ai/)
- **Próxima acción:** Instruir al humano a regresar al Orquestador con el reporte final.
```
