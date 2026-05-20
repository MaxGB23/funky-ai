# Reporte de Auditoría: Fallo Crítico en Feature 012 (Auto-Tiering)

## 1. El Problema Detectado
Durante la interacción actual, el Orquestador resolvió una tarea de Tier 1 (añadir `spec.md` al CLI) **sin realizar el "Paso 0 - Razonamiento Pre-Vuelo"** ni declarar el Tier de la operación. 

El humano consultó por esta falta de comportamiento y al analizar el código fuente de los prompts activos (`global_workflows/funky-orchestrator.md` y `.agents/rules/sdd-orchestrator.md`), se confirmó que **las reglas de Auto-Tiering no existen en el sistema actual**.

## 2. Análisis de Discrepancia (Spec vs Realidad)

Al revisar el archivo de especificación original (`docs/openspec/archive/v1.19.0-012-auto-tiering/spec.md`), se documentó que la feature debía inyectar 4 elementos clave en el prompt del Orquestador. **Ninguno de ellos está presente hoy:**

| Elemento Requerido en Spec 012 | Estado Actual en Workflows / Reglas |
|--------------------------------|-------------------------------------|
| **1.1 Paso 0 (Pre-Vuelo):** El LLM debe declarar su Tier en su primera respuesta antes de generar artefactos. | ❌ **Ausente.** El orquestador arranca directamente a resolver o delegar. |
| **1.2 Escalation Matrix:** Definición explícita de T1 (Flash), T2 (Standard) y T3 (Deep/Crítico). | ❌ **Ausente.** Solo hay un puntero ciego que dice *"según la Escalation Matrix"*, pero la matriz fue borrada. |
| **1.3 Comportamiento por Tier:** Reglas para saltear flujos en T1, seguir flujo normal en T2 o frenar en emergencia en T3. | ❌ **Ausente.** El orquestador opera con un único flujo rígido de 4 pasos para todo. |
| **Edge Case (Scaffolding):** Si es T1, dejar docs vacíos y añadir una task para borrarlos al final. | ❌ **Ausente.** |

## 3. Causa Raíz (Post-Mortem)

El archivo `.agents/rules/sdd-orchestrator.md` coincide línea por línea con el template de fallback ubicado en `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`.

**Lo que ocurrió:**
1. En algún punto (probablemente antes o durante el Release v2.0.0), el template base que vive en `funky-cli/src/templates/bootstrap/` **nunca se actualizó** con los cambios de la Feature 012.
2. Al reconstruir el repositorio, inicializar un nuevo workspace o realizar la migración hacia `global_workflows`, se tomó como "fuente de la verdad" una versión obsoleta (pre-012) del prompt.
3. El estado de la feature 012 fue marcado como `[x]` en `ORCHESTRATOR-STATE.md`, generando una falsa sensación de seguridad (*Doc Rot / Drift*).

## 4. Impacto Arquitectónico
- **Pérdida de Agilidad:** Tareas triviales de 1 archivo (T1) obligarán al orquestador a intentar ejecutar todo el ciclo pesado de `explore` y `proposal` (o confundirse al saltearlos, al no tener reglas que se lo permitan).
- **Riesgo en T3:** Sin la matriz, el Orquestador no tiene el instinto de detenerse ante cambios masivos en el core (`funky-cli/src`) y pedirá delegar ciegamente a un Worker.
- **Lost in Translation:** El checklist actual exige llenar un campo `Tier` basándose en una matriz que el LLM no tiene en su contexto, provocando que el LLM alucine la definición de los Tiers.

## 5. Próximos Pasos (Acción Requerida)
El prompt del Orquestador (tanto en Workflows como en su backup dentro del CLI) debe ser parcheado inmediatamente para re-inyectar el contenido exacto dictado por el RFC 012.
