# Nuevas Estrategias de Orquestación (Funky AI)

Este documento recopila las decisiones arquitectónicas acordadas para mejorar el protocolo Funky AI, evitando la degradación del contexto y optimizando la delegación a los Workers.

---

## 1. Patrón "Worker Handoff" (Prompts Físicos Estructurados)

**El Problema:** Que el Orquestador redacte prompts largos por el chat consume tokens, ensucia el contexto y no deja un registro claro de qué se le pidió al Worker.

propuesta de prompt : /worker/ejemplo-prompt-worker.md
**La Solución:** 
- Al finalizar la fase de `Tasks`, el Orquestador debe generar un archivo físico llamado `worker-handoff.md` (o `prompt-faseX.md`) en la carpeta del feature.
- Este archivo funciona como un template estricto que contiene:
  1. **Safe-Contexting:** Archivos que el Worker debe leer y comandos de Memory Polling (`grep_search` en `post-mortem.md`).
  2. **La Misión:** Instrucciones quirúrgicas y restricciones ("Qué NO tocar").
  3. **Criterios de Éxito:** Qué debe pasar para que el Worker genere el `report.md`.
- **Ejecución del Humano:** El humano abre un chat virgen, adjunta el archivo con `@` y da la orden corta: `Ejecutá tu misión`.

---

## 2. Ciclo de Vida de Artefactos: "Squash & Trash" (Andamios Descartables)

**El Problema:** La generación de archivos SDD (`proposal.md`, `tasks.md`, `worker-handoff.md`, `report.md`) por cada feature va a llenar el repositorio de basura Markdown, mareando al LLM en el futuro y duplicando el historial de Git.

**La Solución:** 
Tratar a los archivos SDD de cada feature como "Andamios". Una vez que el edificio está construido, el andamio se desarma.

**El Ciclo:**
1. **Activa:** Se crea la carpeta `docs/openspec/changes/{feature}` y se trabaja ahí.
2. **Merge:** El código se aprueba y se mergea a la rama principal (Git guarda el historial real).
3. **Consolidación (Engram):** El Orquestador revisa el `report.md` final y extrae el conocimiento crítico (Bugs y Decisiones) hacia `docs/post-mortem.md` o `ARCHITECTURE.md`.
4. **Limpieza:** Se **ELIMINA FÍSICAMENTE** toda la carpeta temporal `docs/openspec/changes/{feature}`.

---

## Próximos Pasos

- Actualizar el protocolo central de Funky AI (`funky-ai.md` y reglas del workspace) para reflejar estas dos mecánicas.
- Ajustar el plan maestro de la `v1.4-init-bootstrap` para que los templates que se generen en el CLI incluyan el soporte para el `worker-handoff.md` y expliciten la regla de limpieza.
