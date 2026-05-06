# 🤖 Funky AI — Worker Handoff: Reestructuración de Docs (014)

> **Instrucción para el LLM:** Sos un Worker **Tier T2** (Reestructuración Estructural).
> Tu misión es ejecutar las Fases 1, 2, 3 y 4 detalladas en `tasks.md` interactuando con PowerShell para mover carpetas, limpiar los directorios viejos, archivar SDDs y hacer el commit de GitOps.

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/014-docs-restructure/worker-handoff.md Ejecutá las Fases 1, 2, 3 y 4`

---

## 1. Inyección de Contexto (Safe-Contexting)
```
view_file ORCHESTRATOR-STATE.md
view_file docs/openspec/changes/014-docs-restructure/tasks.md
view_file docs/repo-map.md
```

## 2. La Misión (Surgical Task)
**Objetivo:** Reorganizar físicamente `docs/funky-ai/` consolidando 7 carpetas dispersas en 5 pilares semánticos (`conceptos`, `guias`, `operaciones`, `historico`, `drafts`), eliminando el ruido y actualizando el `repo-map.md`.

## 3. Reglas de Ejecución Estrictas
| Regla | Descripción |
|-------|-------------|
| 🔴 Foco Láser | Solo vas a mover archivos dentro de `docs/funky-ai/`. No toques código fuente ni testing. |
| 🔴 Ejecución Segura | Asegurate de mover el contenido (con `Move-Item`) y validar antes de borrar los directorios originales (`Remove-Item`). |

## 4. Criterios de Éxito
- [ ] El directorio `docs/funky-ai/` quedó simplificado en los pilares definidos.
- [ ] El `repo-map.md` refleja la nueva arquitectura en la sección 2.1.
- [ ] La Tarea 014 está tachada en el `ORCHESTRATOR-STATE.md`.

## 5. Return Envelope
Actualizá `docs/openspec/changes/014-docs-restructure/report.md` resumiendo la limpieza.
