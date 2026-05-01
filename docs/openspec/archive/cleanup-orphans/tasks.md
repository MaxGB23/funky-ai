# 🧹 Plan de Acción: Cleanup de Archivos Huérfanos

## Fase 1 — Auditoría y Detección
- Usar PowerShell (ej. `Get-ChildItem`) para buscar recursivamente archivos con nombres de artifacts generados (`report.md`, `worker-handoff.md`, `explore.md`, `spec.md`, `tasks.md`) que estén flotando en la raíz (`m:\funky-ai`) o en carpetas obsoletas como `legacy/`, `testeo-de-features/`, o en la raíz de `docs/`.
- Identificar carpetas enteras que estén en desuso o sean artefactos viejos de SDD.
- Generar un archivo local `orphans-audit.md` (en esta misma carpeta) con la lista de candidatos a borrar o mover.

## Fase 2 — Limpieza y Consolidación
- **NOTA:** El usuario ya hizo un borrado manual exhaustivo de archivos sensibles y obsoletos. Es probable que muchos de los directorios o archivos listados en la Fase 1 ya no existan. Ignorar errores de "no encontrado".
- Borrar los archivos sueltos restantes identificados en la Fase 1 que sean basura o reportes de features ya completadas.
- Mover los artefactos de la v1.7 que quedaron en la raíz (`M:\funky-ai\openspec\changes\...`) directamente al archivo (`M:\funky-ai\docs\openspec\archive\`).
- Eliminar directorios vacíos en la raíz (ej. `openspec` o similares) que hayan quedado después de la consolidación.

## Fase 3 — Actualización de Estado y Cierre
- Editar `m:\funky-ai\ORCHESTRATOR-STATE.md` para marcar la tarea "Cleanup de Archivos Huérfanos" como `[x] Completada`.
- Generar el `report.md` final en esta carpeta documentando qué se eliminó y qué se consolidó.
