# Tareas (014 - Reestructuración de Documentación Funky AI)

## Fase 1 — Creación de la Nueva Estructura
- [ ] Crear los nuevos directorios base dentro de `docs/funky-ai/`: `conceptos/`, `operaciones/`, `historico/`, `drafts/`.
- [ ] Mover todo el contenido de `core-concepts/` hacia `conceptos/`.
- [ ] Mover el contenido de `workflows/` hacia `operaciones/`.
- [ ] Mover el contenido de `mierdilla/` hacia `drafts/`.

## Fase 2 — Consolidación del Histórico
- [ ] Crear las subcarpetas dentro de `docs/funky-ai/historico/`: `journey/`, `releases/`, `retrospectivas/`.
- [ ] Mover todo el contenido de `journey/` original hacia `historico/journey/`.
- [ ] Mover todo el contenido de `releases/` original hacia `historico/releases/`.
- [ ] Mover el contenido de `retrospectivas-lecciones/` hacia `historico/retrospectivas/`.

## Fase 3 — Limpieza y Actualización
- [ ] Eliminar de forma segura las carpetas originales que quedaron vacías (`core-concepts`, `mierdilla`, `workflows`, `journey`, `releases`, `retrospectivas-lecciones`).
- [ ] Actualizar el archivo `docs/repo-map.md` reflejando esta nueva arquitectura consolidada (solo 5 carpetas base en la sección 2.1).
- [ ] Actualizar el `ORCHESTRATOR-STATE.md`, moviendo la tarea **014** a la sección de "Tareas Completadas".
- [ ] Generar el archivo `docs/openspec/changes/014-docs-restructure/report.md` confirmando los movimientos.

## Fase 4 — GitOps y SDD Cleanup (Deuda Técnica)
- [ ] **Archivado SDD:** Revisar el directorio `docs/openspec/changes/`. Hay features viejas (ej. `008`, `010`, `memory-polling-v2`) que ya están terminadas. Mover sus carpetas a `docs/openspec/archive/` para mantener el workspace limpio.
- [ ] **Git Status:** Ejecutar `git status` para validar todos los archivos untracked y borrados (como la movida de `gentle-ai` y la unificación de `tests`).
- [ ] **Git Commit:** Ejecutar `git add .` y armar un commit consolidado usando Conventional Commits (ej. `refactor(docs): auditoria 010 y reestructuracion 014 completadas`). NUNCA agregues "Co-Authored-By".
