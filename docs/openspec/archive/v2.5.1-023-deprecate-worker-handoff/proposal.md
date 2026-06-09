# Proposal: 023-deprecate-worker-handoff

> **Budget:** Propuesta técnica interna para purga del legacy `worker-handoff.md`.

## 1. Contexto
Migración hacia un modelo de **Message Passing directo** para la comunicación Orquestador-Worker. Se eliminará por completo la dependencia del archivo físico `worker-handoff.md` como intermediario. El Orquestador ahora inyectará el *scope* y las tareas directamente en la invocación del prompt del custom workflow (`/funky-worker`). Esto reduce la carga de I/O en el disco, limpia el CLI y alinea el sistema a la nueva visión de "Workflows as System Prompts".

## 2. Capabilities (CONTRATO CON SPECS)
> Este es un cambio puramente arquitectónico de herramientas (Agentes y CLI). No requiere nuevas capabilities de negocio.

**Modified Capabilities:**
- Flujo de inyección de scaffolds (`funky-cli`) -> Ya no inyectará ni copiará `worker-handoff.md`.
- Reglas del `sdd-orchestrator.md` -> Se purgan los Gates G1, G2 y G3 que exigían la existencia física del archivo.

## 3. Decisiones Técnicas

| Área | Decisión | Justificación Corta |
|------|----------|---------------------|
| Arquitectura | Message Passing Directo | Elimina I/O basura y muletas legacy; se delega la identidad y esquema de respuesta (Return Envelope) al custom workflow. |
| Dependencias | Eliminación de Archivos | Se borran templates residuales en `.agents/templates/sdd/` y `funky-cli/src/templates/`. |
| Excepciones | Preservar `planning-handoff.md` | El planning handoff de Tier 4 es un contrato más pesado que sí justifica persistencia física. |

## 4. Stack / Scope
**Stack Tecnológico:**
- Funky CLI (`init.js`, `feature.js`, `sync-templates.js`)
- Agentes / Orquestadores (`sdd-orchestrator.md`, `tasks.md` rules)

**Fuera de Scope (Non-Goals):**
- Modificar la arquitectura o los archivos del `/funky-suborchestrator`.
- Modificar flujos funcionales del front/back de los proyectos. 

## 5. Riesgos y Rollback
**Riesgos:**
| Riesgo | Probabilidad | Mitigación |
|--------|--------------|------------|
| Rompimiento de Tests en CLI (`init.test.js`) | Alta | Actualizar la suite de unit tests para que esperen la NO-inyección del archivo `worker-handoff.md`. |
| Orquestadores viejos se bloquean | Media | Refactor completo de las reglas G1-G3 en `.agents/rules/sdd-orchestrator.md`. |

**Rollback Plan (OBLIGATORIO):**
- `git checkout -- .agents/rules/sdd-orchestrator.md`
- `git revert` del commit en `funky-cli` y regenerar los templates eliminados desde el historial de git.

## 6. Success Criteria
- [ ] Ejecutar `funky feature test-feature` no genera `worker-handoff.md`.
- [ ] Ejecutar `funky init test-repo` no copia `plantilla-worker-handoff.md`.
- [ ] Los tests del CLI pasan limpiamente.
- [ ] Reglas del `sdd-orchestrator` limpias y sin Gates bloqueantes por el archivo.

> **[SISTEMA - PARA EL ORQUESTADOR]** Si la propuesta es aprobada, procede a generar el `spec.md` basado en las Capabilities, o directo a `tasks.md` si no requiere specs.
