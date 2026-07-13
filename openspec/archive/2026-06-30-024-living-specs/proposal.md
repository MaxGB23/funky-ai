# Proposal: 024-living-specs (Transición a Living Specs)
## Intent
Actualmente, los specs viven dispersos en los cambios archivados (`archive/`), lo que obliga a leer todo el historial para entender el estado actual de un dominio. Queremos introducir "Living Specs" (`openspec/specs/`) como fuente de verdad única y acumulativa, resolviendo la viabilidad técnica del merge entre "Delta Specs" generados durante la feature y el "Root Spec" sin perder información.

## Scope
### In Scope
- Creación del Workflow `/funky-archive` delegado al LLM.
- Definición de formato estricto para "Delta Specs" (`ADDED`, `MODIFIED`, `REMOVED`).
- Validación de integridad usando SHA256 / checksum en Delta Specs.
### Out of Scope
- Migración de features archivadas antiguas a Living Specs.
- Implementación de un parser AST estricto para Markdown (Opción B).
- Uso de parches Git (diffs) para specs.

## Capabilities
### New Capabilities
- `archive-workflow`: Capacidad del agente para hacer merge inteligente de Delta Specs en el Root Spec, preservando intenciones.
- `delta-spec-validation`: Validación de integridad (hash matching) para prevenir merges desactualizados.
- `full-spec-generation`: Capacidad de generar un spec completo (FULL Spec sin deltas) cuando el dominio es nuevo.
- `archive-naming-convention`: Renombrado automático de la carpeta archiveada a versionado (`vX.Y.Z-{desc}`) o dated (`YYYY-MM-DD-{desc}`).

### Modified Capabilities
- Ninguna

## Approach
Se adoptará la **Opción A (Merge Delegado al LLM)**. Se creará un Workflow para `/funky-archive` donde el LLM recibe el Root Spec original y el Delta Spec (o redacta un FULL Spec si es dominio nuevo). El Delta Spec usará una estructura estricta (`ADDED`, `MODIFIED`, `REMOVED`). El prompt enforzará fuertemente no resumir contenido. El Delta Spec incluirá un hash del Root original. Finalmente, el directorio de la feature en `changes/` se moverá a `archive/{new-name}/` respetando las reglas de Naming Convention (Versionado vs Dated) y se aplicará la política de limpieza (soft limit ~40 entries).

## Affected Areas
| Area | Impact | Description |
|---|---|---|
| Workflows | Alto | Nuevo workflow `/funky-archive` |
| Openspec Structure | Medio | Introducción de `openspec/specs/` (Root Specs) |
| SDD Phase (Spec) | Medio | Modificación en la fase de Spec para inyectar checksum y formato estricto en el Delta |

## Risks
| Risk | Likelihood | Mitigation |
|---|---|---|
| Race Conditions / Root Spec desactualizado | Medio | El Agente de Spec debe inyectar el SHA256 (o checksum simple) del Root Spec original en el Delta Spec. El proceso de archive fallará si el SHA actual no coincide. |
| Corrupción del Root Spec por el LLM en el merge | Alto | El Workflow `/funky-archive` debe tener una regla crítica anti-lazy (e.g. "PRESERVE TODOS LOS REQUIREMENTS EXACTAMENTE COMO ESTÁN, SOLO APLIQUE LOS DELTAS"). |
| Pérdida de Escenarios en el Delta | Medio | En la fase de Spec, se debe obligar a copiar el bloque de Requirement ÍNTEGRO al delta, no solo el escenario afectado. |

## Rollback Plan
Si el proceso falla en producción o corrompe specs:
1. Revertir el archivo de workflow `/funky-archive`.
2. Restaurar el estado anterior de `openspec/specs/` desde un commit anterior usando Git.
3. Deshacer el cambio en la plantilla de generación de Specs (volver a formato no-delta).

## Dependencies
- Workflow framework existente (Agent prompt parsing).
- Soporte para hashing (Node/CLI si se hace desde CLI, o comprobación manual/agente).

## Success Criteria
- [ ] Existe un workflow `/funky-archive` funcional.
- [ ] Un Delta Spec con formato estricto es fusionado correctamente en un Root Spec simulado.
- [ ] Una modificación en un Delta Spec no borra el contenido no afectado del Root Spec.
- [ ] Un Delta con checksum desactualizado es rechazado antes de fusionar.
