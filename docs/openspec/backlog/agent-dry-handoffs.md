# 🔄 Backlog: Agent DRY Pattern en Handoffs

**Estado:** 📋 Pendiente (Target: v1.9.0)
**Origen:** Discovery `[agent-dry-handoffs]` (v1.8.0)

## 📋 El Problema: El Síndrome del Teléfono Descompuesto
Actualmente, la arquitectura SDD de Funky AI requiere que el Orquestador lea un template maestro (como `tasks.md`), extraiga mentalmente las acciones requeridas, y las transcriba en un archivo `worker-handoff.md` para que el Worker las ejecute.

Este proceso de "traducción manual" sufre de **Lost in the Middle**: el LLM Orquestador se satura de contexto y olvida pasos críticos. En la v1.8.0, esto causó que el Orquestador omitiera la directiva de actualizar el `README.md` durante la Fase de Release, a pesar de que el Worker sí habría obedecido si se lo hubieran indicado.

## 🎯 Solución Propuesta: "Agent DRY"
El patrón **Agent DRY (Don't Repeat Yourself)** busca que la "fuente de la verdad" sea única.

En lugar de que el Orquestador transcriba las tareas, el archivo `worker-handoff.md` debe refactorizarse para actuar únicamente como un **puntero estricto** hacia la tarea original. 

### Ejemplo de cómo debería verse el nuevo `worker-handoff.md`:
```markdown
# 🤖 Funky AI — Worker Handoff: Fase X

> **Instrucción para el LLM:** Sos un Worker de ejecución. 
> Tu única misión es leer la Fase X del archivo `tasks.md` indicado abajo y ejecutar exactamente las acciones listadas allí, línea por línea.

`ACTION: Execute view_file on docs/openspec/changes/feature-name/tasks.md`

**Objetivo de la Misión:** Completar el checklist de la Fase X al 100%.
```

## 🛠️ Tareas de Implementación
- [ ] Auditar el flujo de comandos `funky phase` para ver cómo inyecta el `worker-handoff.md`.
- [ ] Rediseñar la plantilla canónica `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md` para que deje de tener el bloque `Acciones exactas` y lo reemplace por el bloque de delegación a `tasks.md`.
- [ ] Actualizar la documentación de SDD (ej. `docs/funky-ai/workers/` o la guía de equipo) para explicar a los desarrolladores humanos este cambio de paradigma (menos tipeo para el Orquestador, más lectura directa para el Worker).
- [ ] Probar el flujo completo en un *Smoke Test* para asegurar que los Workers Tier 1 son capaces de leer y parsear un `tasks.md` sin perderse.
