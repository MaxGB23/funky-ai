# RFC: Deprecación Completa de `worker-handoff.md`

> **🛑 WARNING PARA LA IA (ORQUESTADOR):** 
> Este documento es un **RFC (Request for Comments) / Brain Dump**. Son notas crudas del humano. 
> **NO ES UN PROPOSAL FORMAL**. Bajo ninguna circunstancia debes tomar esto como una especificación técnica final o empezar a generar código basado directamente en esto. 
> Tu trabajo en la fase de Orquestación es **leer esto, extraer la intención, validar viabilidad, y generar un `proposal.md` formal** en el directorio del change.

---

## 🧠 El Problema / La Idea
Tener un archivo físico en disco (`worker-handoff.md`) solo para pasarle un mensaje (Contexto/Tareas) de una IA a otra (Orquestador -> Worker) es un anti-patrón de "Disk I/O basura". Era una muleta del pasado.
Con los nuevos **custom workflows** (`/funky-worker`), el workflow mismo actúa como *System Prompt* y define la identidad. El Orquestador ahora puede y debe inyectar el "payload" directo en el prompt al invocar al worker (Message Passing), sin necesidad de generar archivos temporales engorrosos.

La idea central es **matar el template `worker-handoff.md`**, sacarlo del scaffolding del CLI, y actualizar las reglas del Orquestador para que use delegación directa.

---

## 🗑️ Brain Dump (Tira todo acá)

### 1. ¿Qué debe recibir el custom workflow (`funky-worker.md`)?
- La info vital del viejo handoff se migra a memoria/prompt.
- **Scope (Archivos)** y **Tasks**: El Orquestador los inyectará directamente al mandar a llamar al worker. Ejemplo: `Aplica workflow funky-worker. Tu scope es X. Tus tareas son Y`.
- **Return Envelope Schema**: Se va a mover el formato estricto de reporte (que antes vivía en el handoff) hacia adentro del mismo workflow `docs/prompts/sdd/funky-worker.md`. Así el worker sabe qué esquema usar para actualizar el `report.md`.

### 2. Reglas del Orquestador a Cambiar
- **`sdd-orchestrator.md`**: Purgar la regla de "Protocolo Obligatorio — Generación de Worker Handoffs". Modificar los Gates (G1, G2, G3) del "Return Statement" para que ya no verifiquen la existencia del archivo físico, sino que obliguen al orquestador a inyectar explícitamente el Scope y las Tareas en la instrucción final.
- **`tasks.md`**: Borrar las advertencias (líneas iniciales y finales) que obligan al humano a crear el `worker-handoff.md` antes de delegar la fase.

### 3. Limpieza de Scaffolding y CLI
- **`funky-cli/src/commands/feature.js` e `init.js`**: Eliminar las líneas de código que copian `worker-handoff.md` y `plantilla-worker-handoff.md`.
- **`funky-cli/README.md`**: Quitarlo de la tabla de templates.
- **Borrado físico**: Eliminar de `.agents/` y de `funky-cli/src/` todos los `worker-handoff.md` residuales.

### Preguntas Abiertas / Para Pensar Mañana
1. ¿Borramos físicamente los archivos viejos de una, o solo los desenchufamos del CLI?
2. ¿Aplicamos la misma lógica destructiva para el `planning-handoff.md` que usamos con el `/funky-suborchestrator` en Tier 4, o ese tiene sentido mantenerlo como archivo físico por la complejidad del contexto?

---

## 🎯 Qué NO es esto (Opcional)
- NO implica cambiar la arquitectura de los SDD Phases (explore, propose, etc). Esos siguen igual.
- NO cambiamos el flujo de cómo los workers actualizan el `report.md`. Solo cambiamos CÓMO reciben la orden inicial (Message Passing vs File Read).
