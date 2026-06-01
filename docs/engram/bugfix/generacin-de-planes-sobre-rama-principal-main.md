### [bugfix][git-ops-orchestrator] Generación de planes sobre rama principal (main)
**What:** El Orquestador planificó (creó proposal.md y tasks.md) y estuvo a punto de delegar la ejecución a un Worker sin haber aislado el entorno con una rama nueva (feature branch).
**Why:** Delegar a un Worker estando en `main` rompe la arquitectura Git-Ops y arriesga corromper el código base estable.
**Where:** Workflow de Orquestación (Fase 0).
**Learned:** Siempre ejecutar `git status` y crear una rama ANTES de generar el template de Handoff para el Worker.