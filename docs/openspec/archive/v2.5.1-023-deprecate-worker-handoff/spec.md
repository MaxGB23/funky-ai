# Spec: 023-deprecate-worker-handoff

> **Budget:** Comportamiento estricto del CLI y Orquestador post-deprecación.

## ADDED Requirements

*(Ninguno. Esta feature se enfoca en destrucción y refactor de flujos existentes).*

## MODIFIED Requirements

### Requirement: Inicialización de Proyecto (`funky init`)

El CLI SHALL inicializar el scaffolding base del proyecto, inyectando los templates globales en la carpeta `docs` y `.agents`, pero omitiendo cualquier referencia o archivo llamado `worker-handoff.md` o `plantilla-worker-handoff.md`.
(Previously: El CLI inyectaba una copia de `plantilla-worker-handoff.md` en `.agents/templates/sdd/`.)

#### Scenario: Creación de un proyecto nuevo
- GIVEN un repositorio vacío
- WHEN el usuario ejecuta `funky init`
- THEN el scaffolding se genera exitosamente
- AND el archivo `.agents/templates/sdd/worker-handoff.md` NO existe
- AND el archivo `.agents/templates/sdd/plantilla-worker-handoff.md` NO existe

### Requirement: Inicialización de Feature (`funky feature`)

El CLI SHALL crear una nueva carpeta dentro de `docs/openspec/changes/<nombre>` con todos los artefactos SDD, EXCEPTO el `worker-handoff.md`.
(Previously: El CLI inyectaba una copia de `worker-handoff.md` en la carpeta de la feature.)

#### Scenario: Arrancar una nueva feature SDD
- GIVEN un proyecto inicializado con Funky
- WHEN el usuario ejecuta `funky feature mi-nueva-idea`
- THEN se crea el directorio `docs/openspec/changes/mi-nueva-idea` con `explore.md`, `proposal.md`, `spec.md`, `tasks.md`, etc.
- AND el archivo `docs/openspec/changes/mi-nueva-idea/worker-handoff.md` NO se genera.

### Requirement: Regla de Delegación del Orquestador (`sdd-orchestrator.md`)

El Orquestador SHALL delegar las tareas hacia el Worker inyectando el scope y tareas de forma explícita en el prompt usando Message Passing directo. Los Gates de validación G1, G2 y G3 que exigían el archivo físico quedan eliminados.
(Previously: El Orquestador tenía un "Return Statement" bloqueante que fallaba si el archivo `worker-handoff.md` no existía o no estaba llenado.)

#### Scenario: Orquestador delega fase 1 al Worker
- GIVEN el plan en `tasks.md` está aprobado y detallado
- WHEN el Orquestador emite su última respuesta para delegar
- THEN el Orquestador indica al humano que ejecute: `/funky-worker Ejecuta la Fase 1. Tu scope son los archivos X y Y.`
- AND NO exige revisar ni llenar ningún `worker-handoff.md`.

## REMOVED Requirements

### Requirement: Protocolo de Generación de Worker Handoff
(Reason: Deprecado. Era Disk I/O basura y una muleta legacy del framework antes de que existieran los custom workflows. Ahora se usa Message Passing directo en memoria.)

---

> **[SISTEMA - PARA EL ORQUESTADOR]** Si la spec es aprobada y no hay cambios de scope, procede a generar el `tasks.md`.
