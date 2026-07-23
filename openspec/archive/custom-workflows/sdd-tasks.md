# Feature 020: Custom Phase Workflows — SDD Tasks

> Tracker oficial de ejecución para la Feature 020. 

## MANDATORY_RELEASE_PROTOCOL

### A) Doc-Ops (Documentación Estricta)
- [ ] ¿El change record (explore/propose/spec/design) documenta *por qué* tomamos estas decisiones? **(Sí, unificado en `workflow-design.md`)**
- [ ] ¿Se actualizaron las convenciones del workspace en `.agents/rules/` si el scope lo requiere? **(Sí, `sdd-orchestrator.md` actualizado)**

---

## Tareas a Ejecutar

### Fase 1: Consolidación Arquitectónica
- [x] Unificar resoluciones (D1, D6, D7) en `workflow-design.md`
- [x] Eliminar `workflow-debates.md` (Cleanup)

### Fase 2: Refactor de Explorer (`funky-explore.md`)
- [x] Actualizar el Bootstrap para lectura de engram y state según plantilla aprobada.
- [x] Reemplazar la pregunta "¿Listo para proposal?" por un statement de cierre.

### Fase 3: Generación de Phase Workflows
> ⚠️ **Restricción de Tokens:** Acortar ejemplos y quitar explicaciones redundantes de los prompts fuente para optimizar gasto de tokens.

- [x] Generar `.agents/workflows/funky-propose.md` (Devil's advocate, NFRs opcionales según Tier)
- [x] Generar `.agents/workflows/funky-spec.md` (Especificación técnica, casos límite)
- [x] Generar `.agents/workflows/funky-design.md` (Arquitectura profunda)
- [x] Generar `.agents/workflows/funky-tasks.md` (Roadmap accionable)
- [x] Generar `.agents/workflows/funky-apply.md` (Máquina de chambeo)
- [x] Generar `.agents/workflows/funky-verify.md` (Validación y QA)
- [x] Generar `.agents/workflows/funky-archive.md` (Cierre, actualización de engram y cleanup)
