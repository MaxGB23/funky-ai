# Spec: Engram Sharding y Comando Add

> **ORCHESTRATOR GATE**: If you loaded this skill, you are the ORCHESTRATOR — STOP. Do NOT execute these instructions inline. Delegate to the dedicated worker/sub-agent.

> **Budget:** máx 650 palabras · tablas > prosa · escenarios 3-5 líneas máx.
> **RFC 2119:** MUST/SHALL = obligatorio · SHOULD = recomendado · MAY = opcional
> ⚠️ **REGLAS CRÍTICAS:**
> - DO NOT include implementation details (HOW) in specs. Only WHAT.
> - Sección MODIFIED: copiar bloque COMPLETO del spec base, luego editar. Parcial = pérdida de datos.

## ADDED Requirements

### Requirement: Engram Sharding Structure

El sistema MUST almacenar los engramas de forma fragmentada en directorios categóricos (`architecture/`, `pattern/`, `discovery/`, `decision/`, `bugfix/`). Cada engrama MUST ser un archivo Markdown individual cuyo nombre es su tag.

#### Scenario: Almacenamiento atómico de engrama
- GIVEN un workspace inicializado
- WHEN se registra un nuevo conocimiento con tag `[test-tag]`
- THEN se crea el archivo `[test-tag].md` en el directorio de la categoría correspondiente.

### Requirement: Comando CLI `funky engram add`

El sistema MUST proveer el comando `funky engram add` para inyectar engramas atómicamente. El comando MUST soportar tanto flags para automatización como un asistente interactivo (`@inquirer/prompts`) y MUST actualizar automáticamente el `index.md`.

#### Scenario: Ejecución interactiva
- GIVEN un usuario ejecutando `funky engram add` sin flags
- WHEN el CLI inicia
- THEN solicita interactivamente el tag, categoría y descripción, y guarda el archivo.

#### Scenario: Ejecución desatendida (Flags)
- GIVEN un worker de IA que necesita agregar un engrama
- WHEN ejecuta `funky engram add --tag "[fix-1]" --category "bugfix" --desc "..."`
- THEN el engrama se crea directamente y se actualiza el index sin interactividad.

### Requirement: Script de Migración

El sistema MUST incluir un script de migración masiva para fragmentar los archivos heredados (`discoveries.md`, `bugfixes.md`) hacia la nueva estructura usando heurística de tags.

#### Scenario: Migración de datos legacy
- GIVEN un workspace con engramas monolíticos previos a v3.0
- WHEN se ejecuta la migración
- THEN los tags son extraídos a archivos individuales, indexados y los monolitos son eliminados.

## MODIFIED Requirements

### Requirement: CLI Scaffolding (funky init)

El comando `funky init` MUST generar la nueva estructura de directorios categóricos dentro de `docs/engram/` en lugar de crear los archivos vacíos de texto plano.
(Previously: Generaba archivos vacíos `discoveries.md` y `bugfixes.md`)

#### Scenario: Inicialización de nuevo proyecto
- GIVEN un repositorio vacío
- WHEN el usuario ejecuta `funky init`
- THEN se crean los directorios `architecture/`, `pattern/`, `discovery/`, `decision/`, `bugfix/` dentro de `docs/engram/`.

### Requirement: Agent Engram Read (Recuperación de Conocimiento)

Los agentes y workers MUST utilizar `grep -ril` o `grep_search` sobre los subdirectorios de `docs/engram/` para buscar historial, en lugar de leer archivos monolíticos.
(Previously: Los agentes leían todo `discoveries.md` y `bugfixes.md` causando Context Dilution)

#### Scenario: Búsqueda de contexto previo
- GIVEN un agente que necesita contexto sobre `[testing-strategy]`
- WHEN invoca la herramienta de búsqueda
- THEN ejecuta un `grep_search` en la ruta `docs/engram/` en lugar de intentar leer un solo archivo.

## REMOVED Requirements

### Requirement: Archivos Monolíticos de Engrama
(Reason: Problemas de saturación de contexto (Lost in the Middle) y sobreescrituras accidentales por parte de los agentes, reemplazado por la estructura Sharding)

---

> **[SISTEMA - PARA EL ORQUESTADOR]** Si la spec es aprobada y no hay cambios de scope, procedé a generar el `tasks.md`.
