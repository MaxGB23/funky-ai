# Spec: 025-engram-index-free-navigation

> **Budget:** sé conciso · tablas > prosa · escenarios 3-5 líneas máx.
> **RFC 2119:** MUST/SHALL = obligatorio · SHOULD = recomendado · MAY = opcional
> ⚠️ **REGLAS CRÍTICAS:**
> - DO NOT include implementation details (HOW) in specs. Only WHAT.
> - Sección MODIFIED: copiar bloque COMPLETO del spec base, luego editar. Parcial = pérdida de datos.

## ADDED Requirements

*(None)*

## MODIFIED Requirements

### Requirement: Orchestrator Memory Polling (Stage 1)

El Orquestador MUST realizar el Stage 1 del Memory Polling listando el directorio de engramas en lugar de cargar el archivo índice.
(Previously: El Stage 1 obligaba a usar `view_file` sobre `docs/engram/index.md` para extraer tags.)

#### Scenario: Inicialización de sesión del Orquestador
- GIVEN un Orquestador iniciando una sesión nueva para una feature
- WHEN ejecuta el Razonamiento Pre-Vuelo y llega al Memory Polling Stage 1
- THEN MUST ejecutar `list_dir docs/engram/` y evaluar los slugs resultantes.

### Requirement: Agent Engram Protocol Rules

Cualquier agente que deba consultar el historial MUST descubrir los engramas existentes listando el directorio base.
(Previously: El `engram-protocol.md` tenía hardcodeado `view_file docs/engram/index.md`.)

#### Scenario: Agente consultando historial
- GIVEN un agente buscando contexto histórico (arquitectura, decisiones)
- WHEN necesita leer engramas existentes
- THEN MUST ejecutar `list_dir docs/engram/` y elegir el archivo específico a leer según el slug.

## REMOVED Requirements

### Requirement: Index.md como paso obligatorio
(Reason: Generaba token waste innecesario equivalente a O(N). El discovery ahora se hace vía `list_dir` en O(1). El archivo `index.md` se mantiene únicamente para consumo de humanos.)

---

> **[SISTEMA - PARA EL ORQUESTADOR]** Si la spec es aprobada y no hay cambios de scope, procede a generar el `tasks.md`.
