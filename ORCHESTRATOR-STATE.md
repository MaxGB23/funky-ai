# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual

- **Versión:** v2.0.0
- **Rama activa:** `main` (feature/v2.0.0-agent-architecture mergeada y taggeada)
- **Última sesión:** 2026-05-14
- **Estado:** ✅ Versión v2.0.0 lanzada. Todo en verde.

---

## 📂 Archivos Clave

| Archivo / Directorio | Rol |
|---------|-----|
| `funky-cli/src/commands/` | Lógica core del CLI (`init`, `phase`) |
| `funky-cli/src/templates/sdd/` | Templates inyectables del ciclo SDD (ej. `explore, worker-handoff.md`) |
| `funky-cli/src/utils/canvas.js` | Motor del Project Canvas (`generateCanvasMarkdown`) |
| `docs/repo-map.md` | Mapa estructural oficial del repositorio (Fuente de la verdad) |
| `docs/engram/` | Memoria persistente Two-Stage (`index`, `discoveries`, `bugfixes`) |
| `docs/funky-ai/conceptos/` | Fundamentos del framework (Manifiesto, reglas base) |
| `docs/funky-ai/historico/` | Cápsula del tiempo (Releases, Journey, Retrospectivas) |
| `docs/openspec/changes/` | Zona activa de ejecución de features del ciclo SDD |

---

## ✅ Tareas Completadas (v1.16 y v1.17)

- [x] **009 Base Templates & Customization Guide:** Refactorizado el comando `init` para inyectar templates agnósticos y un `TEMPLATE_GUIDE.md`. Creado backup inmutable en `.agents/templates`. Fase de Scaffolding Dinámico para `funky phase ff` diferida.
- [x] **014 Reestructuración de Documentación:** Consolidación de 7 carpetas dispersas en 5 pilares semánticos (`conceptos`, `guias`, `operaciones`, `historico`, `drafts`) y actualización de `repo-map.md`.
- [x] **017 Enforcement de Handoff Contract (Agent DRY):** Return Statement bloqueante con gates G1/G2/G3 en `sdd-orchestrator.md`. Prerequisito `view_file tasks.md` agregado al comando `/sdd-ff`. Engram actualizado con `[handoff-as-return-statement]`.
- [x] **016 Semántica de RFCs vs Proposals (Backlog):** Separación estricta de responsabilidades (Brain Dump vs Artifact). Guardrails en Orchestrator y Template dinámico en el CLI.
- [x] **009.b Scaffolding Dinámico:** Implementado el comando `funky feature <name>` para inicializar scaffolding completo de fases SDD en lugar de crearlo a mano o mediante el Orquestador.
- [x] **Doc-Update v1.18.1:** Auditoría documental completa. Fix `funky init --template` (inyecta `canvas-planning-guide.md`). Creado `escenarios-de-uso.md`. Parche mayor `funky-init-flow.md` (v1.7.0 → actual). Parche `guia-flujo-completo.md`. `OPTIONAL_DOC_UPDATE` agregado a `tasks.md` con índice de 7 docs vivos. Engram actualizado con `[doc-update-index-manual-drift]`.

- [x] **002 Planificación Cost Estimator:** Fase de Orchestrator completada para RFC 002. Artefactos SDD (explore, proposal, spec, tasks) generados en `docs/openspec/changes/002-cost-estimator/`. Listo para ejecución.
- [x] **002 Calculadora de Presupuestos:** Comando `funky estimate` implementado (Fases Worker y Doc-Ops completadas). Integración con @inquirer/prompts y Value-Based Pricing. Lanzado en v1.19.0.
- [x] **018 Arquitectura de Agentes v2.0.0 — Rediseño Monumental del Sistema de Configuración:** Redistribución inteligente de archivos de configuración aprovechando nativamente los Workflows de Antigravity (Capa 1: Global, Capa 2: Workspace Rules, Capa 3: Workflows On-Demand). Elimina el Context Dilution y resuelve el límite de tokens. Breaking Change de UX. Lanzado en v2.0.0.

---

## ⏳ Tareas Pendientes

**Roadmap sugerido:** 018 (v2.0.0) → 015 → resto

- [ ] Discutir con agente la posibilidad de implementar una fase intermedia tipo sdd, por ejemplo, en la v2.0.0 el orquestador genero todos los artefactos correctamente pero en las tasks habia una tarea que era critica revisar, por lo que a mi parecer esa simpple task podría requerir todo un pensamiento complejo para una mejor ejecucion, como si fuera algo que requiriera algo tipo sdd, ya que delegarla directo a un worker podría generar alucinaciones o algo que no es aceptable, por lo que necesito de tu ayuda para que me ayudes a ver como plantear estas situaciones.
- [x] **Fix inmediato** Añadir el template de SDD spec.md al comando del cli que corresponda, ya que el template no existe y por lo tanto no se inyecta en .agents/templates.
- [ ] **012 Protocolo de Auto-Tiering del Orquestador (REGRESIÓN V2.0.0):** Implementar una fase de "Razonamiento Pre-Vuelo" donde el Orquestador analice el pedido del usuario contra la *Escalation Matrix* y declare su Tier de operación (T1/T2/T3) de forma autónoma antes de generar cualquier artefacto. (Nota: Se perdió la Escalation Matrix en la migración a Workflows. Reparar).
- [x] **012.b Implementación de Tier 4 (Deep SDD) en CLI:** Comando `funky gentle <feature>` implementado. 14 templates con `<system_prompt>` de roles aislados. Tests: 11 suites, 39 tests en verde. Pendiente: Git-Ops (Fase 6).
- [ ] **015 Protocolos On-Demand (Skills Inyectables) (Backlog):** Crear un mecanismo (ej. `.agents/skills/protocols/sdd-reviewer.md`) para protocolos de uso específico que no inflen el prompt global. Permite al humano invocar roles especializados (ej. "Abogado del Diablo" para auditar inconsistencias lógicas en un plan) solo cuando el escenario lo amerita, evitando el "Context Dilution".
- [ ] **006 Arquitectura SDD — Test Planning (Backlog)**: Diseñar e integrar una fase formal de "Test Planning" (ej. `test-plan.md` o mejora de `spec.md`). Debe ser agnóstica al framework y adaptarse a proyectos con o sin TDD estricto, mitigando puntos ciegos lógicos.
- [ ] **011 Comando de Bootstrap de Prompts (Backlog):** Añadir un comando al CLI que genere los documentos del directorio `docs/prompts` o archivos de config como workers/orquestadores de la v2.0.0. Es un comando de uso poco frecuente (ej. al configurar una nueva laptop), pero vital para asegurar que el entorno de IA (prompts globales y de backup) esté disponible inmediatamente en cualquier equipo de trabajo.
- [ ] **013 Comando de Generación Dinámica de Árbol (Backlog):** Crear una tool o comando (ej. `funky tree`) que recorra el repositorio y genere un mapa detallado archivo-por-archivo, infiriendo el propósito a través de comentarios o cabeceras. Previene el *Doc Rot* al eliminar la necesidad de mapas estáticos. → [Ver RFC](./docs/openspec/rfcs/013-dynamic-repo-tree.md)
- [ ] **003 Protocolo de Seguridad — Revisión de Repos Externos:** Crear un documento de protocolo (distinto de `secops.md`, que ya cubre npm) para auditar repos de GitHub, extensiones de VSCode y código de terceros. Incluye: detección de caracteres Unicode invisibles (Trojan Source), vectores de ejecución implícita en Python (import time / setup.py), y checklist para revisar repos ya clonados. → Contexto completo en [`docs/funky-ai/drafts/midudev.md` — Pendiente 1](./docs/funky-ai/drafts/midudev.md)
- [ ] **004 Protocolo de Optimización por Tipo de Proyecto:** Definir estándares mínimos de optimización según el tipo de proyecto (frontend, backend, CLI, API), con límites explícitos de cuándo parar y un framework de tradeoff entre rendimiento, UX, DX y funcionalidad. → Contexto completo en [`docs/funky-ai/drafts/midudev.md` — Pendiente 2](./docs/funky-ai/drafts/midudev.md)
- [ ] **005 Auditoría Legacy (Backlog):** Analizar el workspace del proyecto Next.js anterior. El objetivo es barrer el desastre de reglas/skills viejas, rescatar las decisiones arquitectónicas que eran joyas, y re-documentarlas usando el formato estructurado y liviano de Funky AI.
- [ ] Añadir el template de architect-assessment-guide al comando funky assess.
- [ ] **Auditoría Stale-Template-Refs (Quick):** `grep_search` en `docs/` y `.agents/` buscando textos como "copiar templates", "revisar templates", "crear manualmente los archivos" que ya son responsabilidad de `funky feature`. Actualizar o eliminar las referencias obsoletas. → Contexto: mejora detectada durante sesión 012.b.
- [ ] **Revisión de Templates SDD:** Revisar todos los templates SDD para reforzarlos en caso de que tuvieran puntos flojos (instrucciones ambiguas, falta de guardrails, etc).
- [ ] **RFC 016: `funky engram add`**
  - Implementar un comando nativo en el CLI para inyectar descubrimientos al Engram atómicamente (`funky engram add --tag "[xxx]" --desc "..."`). Esto evita que los Agentes tengan que cargar todo el archivo `discoveries.md` en memoria para hacer un append, reduciendo el Context Pollution y protegiendo contra errores de codificación.

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
| v1.6 | TDD (Vitest) + CI (GitHub Actions) + Refactor para Testabilidad |
| v1.7 | Project Canvas v2 Dinámico y fixes de legacy pipeline. Tests refactorizados (18/18). |
| v1.8.0 | Cognitive Audit: Token Diet en reglas globales, XML Roles, Action Forcing en templates. |
| v1.8.1 | Auditoría de Documentación: Guardrails estructurales (Tier enforcement, Checkpoints) y limpieza de links legacy. |
| v1.9.0 | Agent DRY Pattern: Handoffs refactorizados como punteros estrictos (Lost in the Middle evitado). |
| v1.10.0 | Automatización Fase 0 y Comando funky release. |
| v1.11.0 | Two-Stage Memory Polling con engram index. |
| v1.12.0 | Architecture Readiness Gate: `funky assess` + motor de reglas (3 reglas MVP) + templates. |
| v1.13.0 | Architecture Readiness v2 (Context Expansion) + NFR parsing. |
| v1.14.0 | Housekeeping: Proposals migradas a RFCs con headers explícitos de draft. |
| v1.15.0 | Enforcement Analysis: Fixes estructurales post sesión 007 y fortalecimiento del SDD. |
| v1.16.0 | Handoff Enforcement: Return Statement bloqueante (G1/G2/G3) + prerequisito `view_file tasks.md` en `/sdd-ff`. Debate CLI-first scaffolding documentado para 009. |
| v1.17.0 | Aislamiento y Agnostización de Base Templates (RFC 009). Creado backup interno de templates inmutables. |
| v1.18.0 | `funky feature <name>` + arquitectura modular de scaffolding SDD. |
| v1.18.1 | Doc-patch: fix `--template`, nuevo `escenarios-de-uso.md`, `funky-init-flow.md` actualizado, `OPTIONAL_DOC_UPDATE` en tasks template, engram `[doc-update-index-manual-drift]`. |
| v1.19.0 | Comando `funky estimate` interactivo, generación de `pricing-analysis.md` y Value-Based Pricing. |
| v1.20.0 | Comando `funky gentle` (Tier 4 Deep SDD): 7 roles aislados, golden/fallback pattern, sync ampliado, 2 mejoras en `sdd-orchestrator.md`. |
| v2.0.0 | Arquitectura de 3 Capas (Global, Workspace Rules, Workflows On-Demand). Migración de flujos SDD a Antigravity Workflows para prevenir el Context Dilution. |
