# 🤖 Funky AI - Worker Handoff: Fase 3 (v1.4)

> **Instrucción para el LLM:** Sos un Worker **Tier 1** de ejecución de Funky AI. Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `report.md` final. NO redactes código ni explicaciones largas en el chat. **Acción directa al disco.**

## 1. Contexto Obligatorio (Safe-Contexting)
Antes de crear los archivos, revisá tu entorno con `list_dir` en `m:\funky-ai\funky-cli\src\templates\sdd\` para ver qué hay.
Leé el documento de tareas: `m:\funky-ai\docs\openspec\changes\v1.4-init-bootstrap\tasks.md` (Sección Fase 3).

## 2. La Misión (Surgical Task)
Tu objetivo es **completar el ecosistema de templates SDD** para que el comando `funky phase` soporte todo el ciclo de vida de una feature, incluyendo nuestras nuevas estrategias de orquestación.

Acciones exactas a ejecutar en `funky-cli/src/templates/sdd/`:
1. **Crear/Sobreescribir `proposal.md`:** Debe ser un template markdown con las siguientes secciones: Contexto, Decisiones Técnicas, Stack, Riesgos.
2. **Crear `tasks.md`:** Debe ser un template markdown con un checklist por fases. **CRÍTICO:** Debe incluir al final del archivo este exacto bloque oculto (copialo literal):
   `> **[SISTEMA - PARA EL ORQUESTADOR]** Al finalizar, estás obligado a crear un archivo físico worker-handoff.md. NO redactes prompts en chat.`
3. **Crear `worker-handoff.md`:** Debe ser un template markdown con la estructura: Safe-Contexting, La Misión (Surgical Task), Restricciones Críticas, Criterios de Éxito.
4. **Crear `report.md`:** Debe ser un template markdown con la estructura: Resumen, Modificados, Bugs Encontrados, Próxima Acción. **CRÍTICO:** Debe incluir al final del archivo este exacto bloque oculto (copialo literal):
   `> **[SISTEMA - PARA EL ORQUESTADOR]** Al finalizar, extraé conocimiento al post-mortem.md e instruí al usuario a ELIMINAR FÍSICAMENTE toda la carpeta de este feature.`
5. Si existe un archivo `design.md` en esa carpeta, podés borrarlo o renombrarlo a `proposal.md`.

**🚫 Restricciones Críticas:** Solo creá los archivos de texto (templates). No toques ningún archivo de código fuente `.js`.

## 3. Criterios de Éxito
- Los 4 templates (`proposal.md`, `tasks.md`, `worker-handoff.md`, `report.md`) existen en la carpeta `sdd/` y los bloques de sistema ocultos están correctamente inyectados.
- Al terminar, actualizar el archivo `m:\funky-ai\docs\openspec\changes\v1.4-init-bootstrap\report.md` agregando la sección de la Fase 3 y marcando el status.
