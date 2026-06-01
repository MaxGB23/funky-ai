### [DISCOVERY][phase0-t1-automation] Phase 0 siempre es T1
**What:** La Fase 0 del template `tasks.md` era tarea del Humano, causando omisiones.
**Why:** Depender de la intervención humana para pasos estructurados genera inconsistencias.
**Where:** Template `sdd-tasks.md`.
**Learned:** Fix en v1.10.0: Implementar Worker T1 con checklist git ejecutable para garantizar la creación del branch.