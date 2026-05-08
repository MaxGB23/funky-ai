# Proposal: RFC Semantics Enforcement

## Solución Propuesta
Establecer un límite estricto de responsabilidad entre RFCs y Proposals.

- **RFCs (`docs/openspec/rfcs/`)**: Pasan a ser exclusivamente "Brain Dumps" de autoría humana. Carecen de validez técnica vinculante.
- **Proposals (`docs/openspec/changes/{feature}/proposal.md`)**: Son los únicos documentos válidos para guiar la ejecución de código (Workers). Generados exclusivamente por el Orquestador tras analizar un RFC o input humano.

## Impacto Arquitectónico
1. **Actualización de Reglas (`.agents/rules/sdd-orchestrator.md`)**: Inyectar una regla explícita indicando al Orquestador que ignore especificaciones directas de un RFC sin antes pasarlas por el proceso de SDD (Explore -> Proposal -> Spec).
2. **Actualización de Mapas (`docs/repo-map.md`)**: Modificar la descripción de `docs/openspec/` y sus subcarpetas para reflejar esta semántica.
3. **Creación de Template**: Crear `docs/openspec/rfcs/000-TEMPLATE.md` con un warning bloqueante para IA, e integrarlo en `funky-cli/src/commands/init.js` para que todos los proyectos nuevos lo tengan de base.

## Trade-offs
- *Pro*: Fricción cero para el humano (puede escribir ideas de forma caótica).
- *Pro*: Protege la arquitectura al forzar a la IA a formalizar la idea en un Proposal.
- *Contra*: Requiere un paso adicional de planificación por parte de la IA si el humano escribió algo que ya parecía técnico.
