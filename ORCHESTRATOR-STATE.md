# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual

- **Versión:** v1.5.0
- **Rama activa:** `main`
- **Última sesión:** 2026-04-20
- **Estado:** 🟢 Estable. Versión 1.5 lanzada.

---

## 📂 Archivos Clave

| Archivo | Rol |
|---------|-----|
| `funky-cli/src/commands/init.js` | Comando `funky init` — copia ecosystem bootstrap |
| `funky-cli/src/commands/phase.js` | Comando `funky phase <nombre>` — inyecta templates SDD |
| `funky-cli/src/templates/bootstrap/` | Templates canónicos v1.4 que `init` copia |
| `funky-cli/src/templates/sdd/` | Templates del ciclo SDD que `phase` inyecta |
| `docs/funky-ai/workers/plantilla-worker-handoff.md` | Template oficial del patrón Worker Handoff |
| `docs/engram/discoveries.md` | Memoria de descubrimientos arquitectónicos |
| `docs/engram/bugfixes.md` | Memoria de bugs y fixes |
| `docs/post-mortem.md` | DEPRECATED — apunta al sharded engram |

---

## ✅ Tareas Completadas (v1.5)

- [x] Fase 1 — Templates SDD enriquecidos y con Doc-Ops
- [x] Fase 2 — CLI README creado
- [x] Fase 3 — Deuda de Release remediada
- [x] Fase 4 — Tag v1.5.0 creado

---

## ⏳ Tareas Pendientes

Ninguna.

---

## 🐛 Bugs Activos

Ninguno.

---

## 📋 Historial de Versiones

| Versión | Descripción |
|---------|-------------|
| v1.0 | Setup inicial del protocolo Funky AI |
| v1.1 | Reglas SDD en `.agents/rules/` (workspace-scoped) |
| v1.2 | Engram sharding — `docs/engram/discoveries.md` + `bugfixes.md` |
| v1.3 | Protocolo Worker Handoff + Memory Polling canonizado |
| v1.4 | `funky init` + `funky phase` — CLI bootstrapper completo |
| v1.5 | Templates SDD enriquecidos, Doc-Ops jerarquía Tier N y CLI README |
