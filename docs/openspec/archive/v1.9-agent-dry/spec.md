# Especificación Técnica: Agent DRY Pattern

## Alcance
Refactorización de los templates de inicialización y fases del Funky CLI para implementar el patrón Agent DRY.

## 1. Modificación de Templates Base

**Archivos Objetivo:**
1. `funky-cli/src/templates/sdd/worker-handoff.md`
2. `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md`

**Requisitos de Modificación:**
- Mantener intactas las secciones `1. Inyección de Contexto` (incluyendo los guardrails de Tier), `3. Reglas de Ejecución Estrictas`, `4. Criterios de Éxito` y `5. Return Envelope`.
- En la sección `2. La Misión (Surgical Task)`, preservar el campo **Objetivo**.
- Eliminar el campo **Acciones exactas** y reemplazarlo por la **Directiva Agent DRY** que fuerza al Worker a leer `sdd-tasks.md`.
- El texto inyectado debe ser lo suficientemente imperativo para que el modelo Worker comprenda que debe usar la herramienta `view_file` para leer su fase.

## 2. Actualización de Estados

- Actualizar el archivo `ORCHESTRATOR-STATE.md` para marcar como completado el pendiente `Agent DRY Pattern (Backlog v1.9.0)`.
- Preparar el stage para la liberación de v1.9.0 documentando la nueva feature.

## Consideraciones de Seguridad (Guardrails)
No se debe modificar la lógica de los checkeos de Tiers (T1/T2/T3) ni la jerarquía de conocimiento Doc-Ops, ya que estas fueron correcciones críticas introducidas en versiones anteriores (v1.8.1).
