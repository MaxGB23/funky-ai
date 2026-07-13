# 🎯 SDD Tasks: Auditoría Profunda de Incongruencias y Estructura v1.8

**Contexto:** El ecosistema de Funky AI ha evolucionado significativamente (Engram Sharded, nuevos subdirectorios en `docs/funky-ai/`, adopción del CLI para scaffolding). Sin embargo, existe una alta probabilidad de que haya documentos vitales desactualizados, referencias a flujos legacy (ej: `post-mortem.md`, skills obsoletas como `sdd-proposal.md`), o archivos huérfanos.

**Misión:** Delegar a Workers el análisis exhaustivo e investigativo de cada dominio del proyecto. El Worker debe usar sus tools (`list_dir`, `grep_search`, `view_file`) para encontrar, auditar y corregir inconsistencias sin que el Orquestador le diga exactamente qué archivo mirar. 

---

## Fase 1 — Auditoría de Prompts, Rules y Skills (Domain: Configuración)
**Objetivo:** Asegurar que los cimientos del protocolo (reglas y configuración de agentes) estén actualizados.
- **Scope:** Directorios `.agents/rules/`, `.agents/skills/` y `docs/prompts/`.
- **Acciones:**
  - Analizar cada archivo en estos directorios.
  - Detectar y corregir referencias a `docs/post-mortem.md` (reemplazar por `docs/engram/discoveries.md` y `bugfixes.md`).
  - Identificar skills legacy que hayan sido reemplazadas por el CLI (ej: `sdd-proposal.md`) y eliminarlas.
  - El Worker documenta todos los hallazgos y correcciones en `report-fase1.md`.

---

## Fase 2 — Auditoría de Core Concepts, Guías y Workflows (Domain: Documentación)
**Objetivo:** Auditar la documentación formativa para asegurar que no contradiga los flujos actuales.
- **Scope:** Directorios `docs/funky-ai/core-concepts/`, `docs/funky-ai/guias/` y `docs/funky-ai/workflows/`.
- **Acciones:**
  - Leer y evaluar la coherencia de los documentos clave.
  - Corregir cualquier tabla, mención o doctrina que hable del "viejo engram" o de flujos manuales que ahora resuelve el CLI.
  - Si se detecta información muy obsoleta, actualizarla; si hay archivos basura, eliminarlos.
  - El Worker documenta los hallazgos en `report-fase2.md`.

---

## Fase 3 — Auditoría del Ecosistema CLI (Domain: Templates y Scaffolding)
**Objetivo:** Revisar lo que el CLI inyecta en nuevos proyectos.
- **Scope:** Directorio `funky-cli/src/templates/` (especialmente `bootstrap/` y `sdd/`).
- **Acciones:**
  - Analizar si las plantillas que inyecta el CLI todavía propagan el viejo protocolo.
  - Corregir referencias a `post-mortem.md` o lógicas obsoletas dentro de estos templates.
  - El Worker documenta sus correcciones en `report-fase3.md`.

---

## Fase 4 — Actualización Estructural del README (Domain: Entrypoint)
**Objetivo:** Mapear la realidad física actual del proyecto al README principal.
- **Scope:** Archivo `README.md` en la raíz y la estructura general de `docs/funky-ai/`.
- **Acciones:**
  - El Worker hace un `list_dir` de toda la estructura resultante después de las Fases 1, 2 y 3.
  - Reescribe el `README.md` principal para que los links y tablas reflejen con precisión del 100% las carpetas y archivos vitales que sobrevivieron o se crearon.
  - El Worker documenta el resultado en `report-fase4.md`.

---

## Fase 5 — Release y Consolidación (Orquestador)
**Objetivo:** Cerrar el ciclo SDD.
- El Orquestador lee los 4 reportes generados.
- Extrae aprendizajes arquitectónicos importantes hacia `docs/engram/discoveries.md`.
- Actualiza el `ORCHESTRATOR-STATE.md` marcando las tareas como completadas.

---
> **[SISTEMA - PARA EL WORKER]** Recordá que sos un agente investigativo. No esperes que te den el path exacto de un error; tenés que buscarlo, leer los archivos, entender el contexto y aplicar el fix.
