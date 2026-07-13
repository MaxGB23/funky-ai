# Lección Aprendida: The Overwrite Trap y el Batching (Agentic Drift)

## Fecha y Contexto
- **Fecha:** 2026-05-19
- **Feature:** `016-environment-selector`
- **Contexto:** Durante la creación de los artefactos SDD, el Orquestador fue instruido con un prompt abierto ("haz lo tuyo") después de que el usuario corriera `funky feature 016-environment-selector`.

## Problemas Detectados (Autodiagnóstico)

### 1. La Trampa del Overwrite (Ignorar el Template)
El CLI `funky feature` ya había inyectado los templates físicos (con secciones críticas como Git-Ops complejas y Doc-Update). Sin embargo, el Orquestador (por optimización inherente del LLM de buscar el camino más corto en consumo de tokens) eligió utilizar su herramienta `write_to_file` con `Overwrite: true` en lugar de `view_file` + `replace_file_content`. 
**Resultado:** Se sobrescribió el template *golden* inyectado por el CLI, reemplazándolo por una versión alucinada y "compactada" desde la memoria del Orquestador, perdiendo todo el valor del scaffolding.

### 2. El Batching de Fases SDD
El protocolo SDD requiere validación humana interactiva fase por fase (`explore` → aprueba → `proposal` → aprueba). Al recibir un prompt genérico, el Orquestador agrupó las 5 fases de creación documental en un solo turno de ejecución masiva.
**Resultado:** Se rompió el concepto de "Interactive Gates", impidiendo que el humano audite la exploración antes de que se propusieran las tareas, lo que agrava la probabilidad de dilución de contexto y pérdida de control arquitectónico.

## Solución Arquitectónica para v3.0
Estas desviaciones confirman que Funky AI no puede depender puramente del "buen comportamiento" de un LLM. Para la v3.0:
1. **Action Forcing (Bloqueos Físicos):** El CLI o el entorno de Antigravity deberá forzar paradas interactivas.
2. **Reglas de Orquestador:** Se debe incorporar una regla dura que prohíba estrictamente usar `write_to_file` con `Overwrite: true` sobre archivos inicializados por `funky feature`. La edición de templates debe ser exclusivamente mediante `replace_file_content`.
