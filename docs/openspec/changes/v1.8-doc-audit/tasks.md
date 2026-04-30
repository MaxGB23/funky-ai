# 🎯 SDD Tasks: Auditoría de Incongruencias y Estructura v1.8

**Contexto:** El proyecto evolucionó hacia un Engram Sharded (`discoveries.md`, `bugfixes.md`) y las lógicas de rules/skills cambiaron. Sin embargo, persisten referencias zombie al viejo archivo `docs/post-mortem.md`, menciones a skills obsoletas (`sdd-proposal.md`), y el `README.md` principal apunta a rutas que fueron reestructuradas en subdirectorios (como `guias/`, `workflows/`, etc.).

**Misión:** Limpiar la deuda documental y reflejar la verdadera estructura actual en el README.

---

## Fase 1 — Auditoría y Limpieza de Protocolos (Prompts & Rules)
**Objetivo:** Eliminar la terminología vieja de las configuraciones críticas que controlan a los agentes.

- [ ] Escanear y actualizar `docs/prompts/GEMINI-funky-global.md` (y su backup si aplica). Reemplazar referencias de `post-mortem.md` hacia la carpeta `docs/engram/` o los archivos específicos de sharding.
- [ ] Escanear y actualizar `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`. Actualizar el "Manual Engram Protocol" para que apunte a `discoveries.md` y `bugfixes.md`.
- [ ] Revisar si existe el archivo `.agents/skills/sdd-proposal.md` en el disco y eliminarlo físicamente, ya que esa estructura ahora es manejada por el CLI (`funky phase proposal`).
- [ ] El Worker genera `report.md` documentando qué archivos modificó.

> **[SISTEMA]** Worker, recordá usar `multi_replace_file_content` o `replace_file_content` para modificaciones precisas.

---

## Fase 2 — Auditoría de Core Concepts y Guías
**Objetivo:** Asegurar que los documentos teóricos que educan a humanos y agentes hablen de la arquitectura actual.

- [ ] Escanear `docs/funky-ai/core-concepts/manifiesto.md` y `filosofia.md`. Eliminar menciones a `post-mortem.md` y reemplazar por el ecosistema de Engram actual.
- [ ] Escanear `docs/funky-ai/guias/funky-ai.md` y arreglar la tabla del Falso Engram y las Doctrinas MCP.
- [ ] Si existe alguna otra mención obsoleta evidente en `core-concepts/` o `guias/`, fixearla.
- [ ] El Worker documenta los cambios en el `report.md` de la feature.

---

## Fase 3 — Actualización Estructural del README.md
**Objetivo:** El archivo `README.md` raíz está roto porque los archivos dentro de `docs/funky-ai/` fueron organizados en carpetas (`guias/`, `workflows/`, `retrospectivas-lecciones/`, etc.).

- [ ] Hacer un `list_dir` exhaustivo sobre `docs/funky-ai/` y sus subcarpetas.
- [ ] Mapear mentalmente dónde terminaron los archivos que el README actual lista (ej: `guia-flujo-completo.md` ahora está en `workflows/`).
- [ ] Reescribir las secciones del `README.md` actualizando todos los links a las rutas relativas correctas.
- [ ] El Worker actualiza el `report.md`.

---

## Fase 4 — Release y Cierre de Sesión
**Objetivo:** Limpiar y asentar el conocimiento.

- [ ] El Orquestador revisa los reportes. Si hay aprendizajes (ej: un archivo estaba muy perdido), lo registra en `docs/engram/discoveries.md`.
- [ ] Actualizar `ORCHESTRATOR-STATE.md` marcando la Tarea de "Auditoría de Incongruencias Documentales" y la de "Actualización Estructural del README" como completadas.
- [ ] Instruir al humano a eliminar esta carpeta de `openspec/changes/v1.8-doc-audit/` e integrar los cambios a `main`.

---
> **[SISTEMA - PARA EL ORQUESTADOR]** MANDATORY_RELEASE_PROTOCOL: 
> 1. Verificá que los reportes no reporten bugs no registrados.
> 2. Asegurá la actualización del ORCHESTRATOR-STATE.md.
