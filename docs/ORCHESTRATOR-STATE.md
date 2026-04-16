# ORCHESTRATOR-STATE.md
> Archivo canónico de estado. Leer al inicio de CADA sesión de Orquestador antes de hacer cualquier cosa.
> Equivalente a `mem_context()` de Gentle AI.

---

## 🎯 Objetivo Actual
Ejecutar la Fase de Implementación para el CLI en Node.js (V1.2). Ya pasamos la barrera de planificación arquitectónica y auditoría. Es hora de crear el código de `funky init`.

## 📋 Estado del Proyecto
- **Versión activa:** v1.1.1 
- **Rama en progreso:** `feature/v1.2-funky-cli` 
- **Siguiente acción inmediata:** Orquestar el Brief de un **Worker Tier 2** para que empiece a escribir el código de `[V1.2-C] Implementar funky init`.

## ✅ Completado en Esta Sesión (V1.2 Planning)
- `V1.2-A` ✅ — Worker Analista extrajo con éxito políticas QA de Gentle AI. (Reflejado en `v1.2-a-report.md`).
- `V1.2-B` ✅ — Creado el Documento de Diseño Técnico `diseno-tecnico-funky-cli.md` usando el nuevo Skill `sdd-proposal.md`.
- `DEUDA-REGEX` ✅ — Parche aplicado a `engram-protocol.md`. (Deuda técnica de la sesión anterior purgada).
- `BACKLOG.md` ✅ — Marcados los ítems completados.

## 🧠 Instrucciones Aprendidas
- El usuario valida que se siga usando el flujo de delegación manual (un Worker a la vez).
- Respetamos firmemente la prohibición de picar código en el Rol de Orquestador. Todo código de CLI debe ser delegado a Workers concretos.

## 🔍 Descubrimientos de Esta Sesión
1. Las políticas de QA strict que usaban en Gentle AI (validar labels vía HTTP) resultan de extrema burocracia temprana (over-engineering) para nuestro Node CLI en este punto. Solo validaremos `Closes #` y un label manual `type:*`. 
2. Nos movemos a una solución `memfs` / mocks rápidos para vitest con el fin de evitar que nuestra suite e2e corrompa el sistema de archivos del usuario testeando herramientas de scaffolding.

## 🔴 Pending Inmediato
- **[V1.2-C]** Implementar `funky init` — Worker Tier 2 crea la estructura base del Falso Engram (directorio `docs/engram/` en lugar de `post-mortem.md` monolítico).
- **[V1.2-D]** Implementar `funky phase <name>` — Worker Tier 2 crea templates de fases SDD.

## 📁 Archivos Clave
- `docs/BACKLOG.md` — Fuente de verdad de tareas.
- `docs/funky-ai/propuestas/diseno-tecnico-funky-cli.md` — El Master Plan del código que viene ahora.
- `funky-cli/package.json` — Scaffolding que el Worker tendrá que rellenar.

## 🔭 Horizonte
- Setup del Framework de CLI Node.js (`commander`/`yargs` decidiremos pronto).
