# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual
- **Versión:** v2.5.1
- **Rama activa:** `feature/refactor-tasks-sdd`
- **Última sesión:** 2026-06-21
- **Estado:** 🟡 En progreso. 

---

## 📂 Archivos Clave
| Archivo / Directorio | Rol |
|---------|-----|
| `.agents/rules/sdd-orchestrator.md` | Reglas del orquestador |
| `.agents/rules/engram-protocol.md` | Reglas del protocolo de memoria |
| `docs/engram/index.md` | Índice de memoria persistente Two-Stage (`discoveries`, `bugfixes`, etc) |
| `.agents/templates/sdd/` | Templates "golden" (personalizados de este workspace de funky-ai). **¡USAR ESTOS SIEMPRE COMO REFERENCIA PARA ESTE REPO!** |
| `funky-cli/src/commands/` | Lógica core del CLI (`init`, `phase`) |
| `funky-cli/src/templates/sdd/` | Templates "base" estáticos del CLI (los que se empaquetan y distribuyen a terceros). **¡NO USAR PARA LAS FEATURES DE ESTE REPOSITORIO!** |
| `funky-cli/src/utils/canvas.js` | Motor del Project Canvas (`generateCanvasMarkdown`) |
| `docs/repo-map.md` | Mapa estructural oficial del repositorio (Fuente de la verdad) |
| `docs/funky-ai/conceptos/` | Fundamentos del framework (Manifiesto, reglas base) |
| `docs/funky-ai/historico/` | Cápsula del tiempo (Releases, Journey, Retrospectivas) |
| `openspec/changes/` | Zona activa de ejecución de features del ciclo SDD |

---

## ✅ Tareas Completadas

---

## ⏳ Tareas Pendientes

**Roadmap sugerido:** PENDIENTE

---

## 🐛 Bugs Activos


---

## 📋 Historial de Versiones
| Versión | Descripción |
|---------|-------------|
| v1.18.0 | `funky feature <name>` + arquitectura modular de scaffolding SDD. |
| v1.18.1 | Doc-patch: fix `--template`, nuevo `escenarios-de-uso.md`, `funky-init-flow.md` actualizado, `OPTIONAL_DOC_UPDATE` en tasks template, engram `[doc-update-index-manual-drift]`. |
| v1.19.0 | Comando `funky estimate` interactivo, generación de `pricing-analysis.md` y Value-Based Pricing. |
| v2.0.0 | Arquitectura de 3 Capas (Global, Workspace Rules, Workflows On-Demand). Migración de flujos SDD a Antigravity Workflows para prevenir el Context Dilution. |
| v2.5.0 | Engram Sharding y comando `funky engram add`. Reemplazo de historial monolítico por indexación semántica distribuida. |
| 2026-06-30 | Feature 024-living-specs completada: Transición a Living Specs en `openspec/specs/`. Flujo de deltas validado con checksums y merge por LLM. |