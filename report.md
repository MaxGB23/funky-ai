## Fase: Reparación de Deuda Sistémica (Release Checklist)

- **Status:** ✅ Completada
- **Archivos modificados:** 
  - `funky-cli/src/templates/sdd/tasks.md`
  - `ORCHESTRATOR-STATE.md`
- **Cambios realizados:**
  1. Se modificó el template de `tasks.md` en la sección "FASE X — Release y Doc-Ops". Se transformó la lista en un **🚨 CHECKLIST DE RELEASE (OBLIGATORIO - NO OMITIR)** explícito para evitar que el Orquestador vuelva a omitir la creación de Release Notes y la actualización del README.
  2. *Extra:* Se actualizó la sección de *Return Envelope* dentro del mismo `tasks.md` para cumplir con `[DISCOVERY][worker-return-envelope-compliance]`, obligando a los Workers a reportar intentos fallidos y antipatrones en la sección de Bugs, y no solo bugs productivos.
  3. Se marcó la tarea pendiente de deuda sistémica como `[x]` en el archivo `ORCHESTRATOR-STATE.md`.
- **Bugs encontrados:** Ninguno.
- **Próxima acción:** El Orquestador puede continuar con la siguiente tarea del backlog (`Auditoría de Journey` o `v1.7`).
