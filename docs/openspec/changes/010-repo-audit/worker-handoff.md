# 🤖 Funky AI — Worker Handoff: Auditoría de Repositorio (010)

> **Instrucción para el LLM:** Sos un Worker **Tier T3** (Exploración profunda y análisis semántico) de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas en `tasks.md` interactuando con el sistema operativo y el disco, y luego actualizar el `report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/010-repo-audit/worker-handoff.md Ejecutá la Fase 1 y 2`

---

## 1. Inyección de Contexto (Safe-Contexting)

Antes de ejecutar **cualquier tarea**, el Worker DEBE cargar los pilares de contexto:

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
view_file docs/openspec/changes/010-repo-audit/spec.md
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Extraer el árbol completo de directorios usando un script de terminal (Fase 1) y analizar mentalmente su semántica (Fase 2) para sentar las bases del mapa del repositorio.

**Directiva Agent DRY:**
Leé tus tareas paso a paso directamente desde `docs/openspec/changes/010-repo-audit/tasks.md`. NO repitas las tareas acá.

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | En la Fase 1 NO uses `list_dir` manualmente 1 por 1. Usá `run_command` en terminal (PowerShell) para extraer el árbol entero a un archivo txt excluyendo `node_modules`. |
| 🔴 Foco Láser | Tu scope es puramente analítico y documental. NO ELIMINES NINGUNA CARPETA en esta sesión. |
| 🟡 Dudas de Contexto | Si no sabés qué hace una carpeta (ej. `mierdillas/`), dejala marcada en el reporte para que el Humano decida. |

---

## 4. Criterios de Éxito

- [ ] El comando de PowerShell se ejecutó correctamente y volcó el árbol en `raw-tree.txt`.
- [ ] Se procesó `raw-tree.txt` según la Fase 2.
- [ ] Se creó el `report.md` resumiendo el estado del escaneo.

---

## 5. Return Envelope (Al terminar)

Al finalizar, asegurate de crear/actualizar `docs/openspec/changes/010-repo-audit/report.md` con:

```markdown
## Fases 1 y 2 — Extracción y Análisis Crudo
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos generados:** `raw-tree.txt`
- **Dudas / Carpetas desconocidas:** (Listar las que el Orquestador/Humano debe revisar)
- **Próxima acción:** Instruir al humano a revisar el reporte y dar luz verde para la Fase 3.
```
