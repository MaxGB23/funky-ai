<OPTIONAL_DOC_UPDATE>

> **[SISTEMA - PARA FUNKY-TASKS]** Analiza las tareas de la feature contra el índice de abajo. Si algún doc cubre exactamente lo que cambiará → expande esta fase con tareas concretas. Si ninguno aplica → **Avisa al humano que elimine este file.**
> **Regla de contexto:** NO abras ningún doc del índice todavía. La columna "Aplica si..." es suficiente para decidir. 

### 📚 Índice de Docs Vivos

> **⚠️ Pendiente de mejora:** Este índice será actualizado para incluir las columnas `Propósito`, `Cuándo leerlo` y `Contenido clave`, siguiendo la estructura usada en `docs/openspec/rfcs/refactor-tasks/index.md`.

| # | Doc | Cubre | Aplica si... |
|---|-----|-------|--------------|
| 1 | `docs/funky-ai/operaciones/funky-init-flow.md` | Árbol de decisión de `funky init`, tabla de archivos estáticos del bootstrap, modos Headless / Interactivo / `--template` | Se modificó `init.js`, cambió qué archivos copia el bootstrap, o cambió el comportamiento del flag `--template` o modo Headless |
| 2 | `docs/funky-ai/operaciones/guia-flujo-completo.md` | Ciclo de vida end-to-end: exploración → init → phase → workers → release, con comandos y output esperado | Cambió la secuencia de comandos recomendada, se agregó un nuevo modo o flag al CLI, o cambió el flujo de uso habitual |
| 3 | `funky-cli/README.md` | Tabla de comandos y flags disponibles, fases SDD, estructura de carpetas resultante del `funky init` | Se agregó, modificó o eliminó un comando, flag o fase SDD del CLI |
| 4 | `docs/funky-ai/guias/funky-ai.md` | Pilares del ecosistema, Tiers de complejidad (T0–T3), criterio de decisión Chat vs SDD | Cambió la arquitectura conceptual del protocolo Funky AI o se añadió un pilar nuevo |
| 5 | `docs/funky-ai/operaciones/cli-simulations.md` | Vectores de falla conocidos y simulaciones de bugs del CLI | Se encontró un nuevo vector de falla, se cerró uno existente, o se modificó el comportamiento ante errores |
| 6 | `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | Opciones disponibles para cada campo de PROJECT-CANVAS e INFRA-CANVAS | Se agregaron / eliminaron opciones en los Canvas o cambió el schema de alguno |
| 7 | `docs/funky-ai/operaciones/escenarios-de-uso.md` | Escenarios de uso del CLI mapeados al estado inicial del usuario (sin definir, definido, repo existente) | Se agrega un nuevo comando o modo al CLI que cambia alguno de los flujos de entrada |

### FASE N+1 — Doc-Update
> Completar SOLO si al menos un doc del índice aplica. Para cada doc afectado, identificar el concepto o comportamiento modificado que justifica el cambio.

**🚫 Restricción de Contexto (Safe-Contexting y Tácticas de Cirujano):** 
1. **Durante la planeacíon (funky-tasks):** NUNCA abrir los archivos documentales al redactar este checklist. Limítate a señalar la ruta del file y el concepto.
2. **Durante la Ejecución (Orquestador):** ESTÁ PROHIBIDO hacer un `view_file` completo del documento para editarlo. Debes usar `grep_search` para buscar subtítulos (ej. `grep_search "^## "`) o palabras clave, y aplicar reemplazos quirúrgicos o adiciones. ¡Protege tu ventana de contexto!

- [ ] **Doc [#N]** — `{ruta}`: Actualizar documento X para reflejar: `{concepto nuevo o comportamiento modificado}`
- [ ] **Opcional:** Sólo si la feature actual en cuestión crea un documento "nuevo" (no contemplado en el indice) vital para el proyecto, debe añadirse al indice de docs vivos en el golden template .agents/templates/sdd/docs.md 



</OPTIONAL_DOC_UPDATE>