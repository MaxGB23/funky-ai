# ORCHESTRATOR-STATE.md
> Archivo canónico de estado. Leer al inicio de CADA sesión de Orquestador antes de hacer cualquier cosa.
> Equivalente a `mem_context()` de Gentle AI.

---

## 🎯 Objetivo Actual
Ejecutar los patches urgentes de la `v1.1.1` (mejoras al protocolo de memoria) y diseñar técnicamente el `funky-cli` para la `v1.2`.

## 📋 Estado del Proyecto
- **Versión activa:** v1.1.0 (en producción/main)
- **Rama en progreso:** `feature/v1.2-funky-cli` (scaffolding Node.js inicializado)
- **Siguiente acción inmediata:** Atacar los patches urgentes del BACKLOG antes de continuar con la v1.2.

## 🔴 Pending Inmediato (Ver BACKLOG.md para el detalle completo)
- `PATCH-A` — Actualizar `.agents/rules/engram-protocol.md` con Trigger Taxonomy, Self-Check Question y Topic Key/Upsert.
- `PATCH-B` — Estandarizar el formato de `topic_key` en `docs/post-mortem.md`.
- `PATCH-D` — Corregir contradicción en `docs/funky-ai/funky-ai.md` línea 89.
- `PATCH-F` — Crear Skill `.agents/skills/sdd-proposal.md` con template PRD-style.

## 📁 Archivos Clave a Conocer
- `docs/BACKLOG.md` — Fuente de verdad de tareas. Consultar siempre.
- `docs/post-mortem.md` — Engram del proyecto. Bugs y decisiones históricas.
- `docs/funky-ai/core-concepts/manifiesto.md` — Qué ES Funky AI y sus reglas inviolables.
- `docs/funky-ai/core-concepts/filosofia.md` — Por qué existe y cómo funciona Gentle AI por dentro.
- `docs/funky-ai/propuestas/propuesta-v1.2-cli-ecosystem.md` — Diseño de la v1.2 (🚧 In Progress).
- `.agents/rules/engram-protocol.md` — La rule topológica de memoria (incompleta, ver PATCH-A).
- `funky-cli/package.json` — Scaffolding Node.js del CLI (rama feature/v1.2-funky-cli).

## 🧠 Descubrimientos Importantes de la Sesión Anterior
1. **CLAUDE.md de Gentle AI** auditado → 3 estrategias portables identificadas: Trigger Taxonomy, Session Close Protocol, Topic Key/Upsert. Ver `docs/funky-ai/refactor/auditoria-claude-md.md`.
2. **Anti-patrón detectado:** Las propuestas sin campo de Estado obligatorio y sin referencias explícitas generan deuda documental. Solución: Skill PRD-style (`PATCH-F`).
3. **Skill `sdd-proposal.md`** pendiente de crear — previene inconsistencias en futuros documentos de propuesta/release.

## ✅ Completado en Sesión Anterior
- Creadas carpetas `core-concepts/`, `journey/`, `propuestas/`, `releases/`.
- Creado `manifiesto.md`, `filosofia.md`, `rules-vs-skills.md`.
- Creado `journey/01-orchestrator-vs-worker-boundary.md`.
- Actualizado `README.md` como índice real de la nueva estructura.
- Creado `docs/BACKLOG.md` como fuente de verdad de tareas.
- Worker arrancó rama `feature/v1.2-funky-cli` y scaffoldeó `funky-cli/`.
- Auditados todos los archivos pendientes al cierre de sesión.

## 🔭 Horizonte
- `v1.2` → `funky-cli` en Node.js (scaffolding, slash commands, sharding de memoria).
- `v1.3` → Git-Ops Skill (PR automation, git diff analysis).
