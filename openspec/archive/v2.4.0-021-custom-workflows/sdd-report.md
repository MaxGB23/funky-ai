# SDD Report: 021-custom-workflows

## Fase Cherry-Pick — Templates Locales SDD
- **Status:** ✅ Completada
- **Archivos creados/modificados:**
  - `.agents/templates/sdd/explore.md` (Template de exploración)
  - `.agents/templates/sdd/spec.md` (Template de requerimientos y escenarios)
  - `.agents/templates/sdd/proposal.md` (Template de propuesta arquitectónica)
  - `.agents/templates/sdd/tasks.md` (Template de tareas y orquestación)
  - `.agents/templates/sdd/apply.md` (Prompt/System file para el Worker)
  - `.agents/templates/sdd/design.md` (Template de diseño técnico)
  - `.agents/templates/sdd/verify.md` (Prompt/System file para QA/Verify)
- **Detalle de Ejecución:**
  - Se inyectó el **ORCHESTRATOR GATE** explícito ("STOP. Do NOT execute inline") en todos los documentos aplicables para evitar la contaminación del contexto del Orquestador (Action Forcing).
  - Se definieron **límites duros de palabras** (Budget) en los documentos para mantener la *Context Economy* (ej. 450 palabras en proposals, 650 en specs).
  - En `spec.md` se adoptó la estructura GIVEN/WHEN/THEN y palabras clave RFC 2119.
  - En `tasks.md` se sumó el *Workload Forecast*, los criterios estrictos para tareas individuales y el uso de `[x]` forzado con guardado inmediato al disco.
  - Se eliminó la burocracia multi-modo de persistencia en favor de simplificar todo bajo el paraguas local de `openspec`.
- **Bugs encontrados:** Ninguno
