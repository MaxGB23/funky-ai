# Worker Handoff: Fase 1 (v2.0.1-context-fix)

> **Misión:** Recuperación y Unificación de la Capa 2 (El Orquestador vuelve al repo).

## Contexto (Capa 2)
Estamos arreglando una regresión arquitectónica. Vamos a unificar toda la lógica del Orquestador en `.agents/rules/sdd-orchestrator.md` y rescatar la "Feature 012" que se había perdido.

## Tareas a Ejecutar
1. **Rescue Feature 012:** Leé el archivo `docs/openspec/archive/v1.19.0-012-auto-tiering/spec.md` y extraé la lógica exacta del "Paso 0 (Auto-Tiering)" y la "Escalation Matrix".
2. **Fusión:** Leé `docs/openspec/archive/v2.0.0-agent-architecture/funky-orchestrator.md` (que contiene los checklists G1/G2/G3).
3. **Escritura Final:** Creá o sobrescribí el archivo `.agents/rules/sdd-orchestrator.md` combinando el Frontmatter adecuado (trigger: model_decision), la lógica rescatada de Auto-Tiering, y los Checklists. 
4. **Limpieza:** Asegurate de que el nuevo archivo **NO** mencione reglas específicas del Worker (cómo debe ejecutar el código el worker, etc). Si el archivo `.agents/rules/sdd-orchestrator-core.md` existe, borralo (usá tu consola de comandos si es necesario, o pedile al humano que lo borre).

## Constraints
- **NO DEBES MODIFICAR CÓDIGO FUENTE EN `funky-cli/src`**. Solo trabajá sobre la carpeta `.agents/rules/`.
- Usa el comando nativo `write_to_file` para generar el nuevo archivo unificado.
- Terminá creando o actualizando el archivo `sdd-report.md` en esta carpeta (`docs/openspec/changes/v2.0.1-context-fix/`) detallando lo que hiciste.

## Invocación (Instrucción para el Humano)
Para ejecutar este Handoff, abrí un **NUEVO CHAT EN BLANCO** y corré:
`/funky-worker @docs/openspec/changes/v2.0.1-context-fix/worker-handoff.md Ejecutá la Fase 1`
