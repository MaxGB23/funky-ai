# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual

- **Versión:** v1.4.0
- **Rama activa:** `feature/v1.4-init-bootstrap` → pendiente de merge a `main`
- **Última sesión:** 2026-04-19
- **Estado:** ✅ Feature completa — lista para release

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

## ✅ Tareas Completadas (v1.4)

- [x] Fase 0 — pnpm link global configurado
- [x] Fase 1 — Templates bootstrap materializados en `funky-cli/src/templates/bootstrap/`
- [x] Fase 2 — `init.js` refactorizado para copiar ecosystem completo con idempotencia
- [x] Fase 3 — Templates SDD creados en `funky-cli/src/templates/sdd/`
- [x] Fase 4 — Smoke Test pasado (init idempotente + phase inject ok)
- [x] Fase 5 — `plantilla-worker-handoff.md` oficial creada

---

## ⏳ Tareas Pendientes

- [ ] Merge `feature/v1.4-init-bootstrap` → `main`
- [ ] Eliminar carpeta `docs/openspec/changes/v1.4-init-bootstrap/` post-merge
- [ ] Crear tag `v1.4.0` en git

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
