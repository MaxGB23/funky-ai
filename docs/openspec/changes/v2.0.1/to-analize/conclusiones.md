# Conclusiones y Plan de Acción (v2.0.1)

## 1. Diagnóstico del Problema (v2.0.0)
La versión 2.0.0 introdujo la Capa 3 (Workflows On-Demand) para aliviar el *Context Dilution*. Sin embargo, el testing empírico reveló un problema crítico de **Asimetría Operativa**:
- **El Worker (Éxito Rotundo):** El comando `/funky-worker` es brillante porque la sesión es corta. El modelo entra, lee el workflow, ejecuta y cierra. No hay tiempo físico para perder contexto.
- **El Orquestador (Falla por Context Fading):** El comando `/funky-orchestrator` es inyectado como un mensaje de usuario en Antigravity. En una sesión de planificación larga (que requiere iterar sobre explore, proposal, spec y tasks), el mensaje original queda sepultado por miles de tokens. El modelo sufre **Context Fading**, olvidando sus checklists y volviendo a su estado genérico (Capa 1), perdiendo el hilo conductor del SDD.

## 2. El Plan de Fix (v2.0.1)
Para solucionar esto, debemos revertir parcialmente la inyección del Orquestador, aprovechando el motor nativo del IDE (Capa 2) para garantizar persistencia sin inflar la Capa 1.

### Acción 1: Consolidar la Capa 2 (El Orquestador vuelve al Repo)
1. **Unificar Rules:** Tomar toda la Lógica Operativa (Checklists de delegación, Return Statements, Fases) que está en `funky-orchestrator.md` y `sdd-orchestrator.md`, y fusionarla en `.agents/rules/sdd-orchestrator-core.md` (o dejarlo como el único archivo definitivo de orquestación).
2. **Eliminar `/funky-orchestrator`:** Descartar este Workflow On-Demand. El Orquestador no debe requerir un *Slash Command*. Al abrir un chat y decir "Quiero planear una feature", el trigger `model_decision` del IDE inyectará automáticamente la regla consolidada. Al vivir en `.agents/rules/`, el IDE re-inyecta/prioriza este contexto, evitando el *Context Fading*.

### Acción 2: Mantener el Worker en Capa 3 (Intocable)
El Workflow `/funky-worker` queda exactamente como está. Se consolida como la única vía legítima para delegar tareas de ejecución. Esto garantiza que el Orquestador planifique (contexto persistente en Capa 2) y el Worker ejecute (contexto efímero en Capa 3), eliminando la confusión de roles.

### Acción 3: Actualizar el Global Prompt
El `GEMINI-funky-global.md` se mantiene igual. Solo rige la personalidad, el tono apasionado y la filosofía rioplatense. Cero lógica SDD.

## 3. Resultado Esperado en v2.0.1
Al abrir un chat virgen, el modelo solo tiene su tono. Cuando el humano pide "armar una feature", la Capa 2 se auto-inyecta y se mantiene "fresca" gracias al IDE. El Orquestador guía todo el proceso SDD sin perder la memoria. Cuando es momento de ejecutar, el humano usa `/funky-worker` en un nuevo chat, asegurando ejecución láser y sin alucinaciones arquitectónicas.
