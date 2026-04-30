# Exploración: Agent DRY Pattern en Handoffs

## Contexto
Durante el ciclo de desarrollo de Funky AI y tras la auditoría en la v1.8.1, se ha identificado un antipatrón en la comunicación entre el Orquestador y el Worker, documentado en `docs/openspec/backlog/agent-dry-handoffs.md`.

## El Problema
Actualmente, el Orquestador (Orchestrator LLM) planifica las tareas en `sdd-tasks.md`. Luego, debe generar un archivo `worker-handoff.md` donde transcribe manualmente el bloque `Acciones exactas`.
Esta duplicación genera el síndrome del **Teléfono Descompuesto (Lost in the Middle)**, donde la ventana de contexto del Orquestador se satura, omitiendo pasos críticos (como actualizar el `README.md` o usar archivos deprecados).

## Análisis de Archivos Implicados
- `funky-cli/src/templates/sdd/worker-handoff.md`
- `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md`

Ambos contienen la sección:
```markdown
## 2. La Misión (Surgical Task)

**Objetivo:** [Describir en una oración qué debe producir este Worker al final.]

**Acciones exactas:**
1. [Acción 1 con archivo destino explícito]
2. [Acción 2]
```

## Solución Propuesta
Aplicar el principio DRY (Don't Repeat Yourself) en los prompts de delegación. El Worker Handoff debe ser únicamente un envoltorio y un puntero estricto. La "fuente de la verdad" de las acciones debe ser exclusivamente `sdd-tasks.md`.
