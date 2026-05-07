# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual

- **Versión:** v1.16.0
- **Rama activa:** `main`
- **Última sesión:** 2026-05-07
- **Estado:** ✅ Estable. Release v1.16.0 completada.

---

## 📂 Archivos Clave

| Archivo / Directorio | Rol |
|---------|-----|
| `funky-cli/src/commands/` | Lógica core del CLI (`init`, `phase`) |
| `funky-cli/src/templates/sdd/` | Templates inyectables del ciclo SDD (ej. `worker-handoff.md`) |
| `funky-cli/src/utils/canvas.js` | Motor del Project Canvas (`generateCanvasMarkdown`) |
| `docs/repo-map.md` | Mapa estructural oficial del repositorio (Fuente de la verdad) |
| `docs/engram/` | Memoria persistente Two-Stage (`index`, `discoveries`, `bugfixes`) |
| `docs/funky-ai/conceptos/` | Fundamentos del framework (Manifiesto, reglas base) |
| `docs/funky-ai/historico/` | Cápsula del tiempo (Releases, Journey, Retrospectivas) |
| `docs/openspec/changes/` | Zona activa de ejecución de features del ciclo SDD |

---

## ✅ Tareas Completadas (v1.16)

- [x] **014 Reestructuración de Documentación:** Consolidación de 7 carpetas dispersas en 5 pilares semánticos (`conceptos`, `guias`, `operaciones`, `historico`, `drafts`) y actualización de `repo-map.md`.
- [x] **017 Enforcement de Handoff Contract (Agent DRY):** Return Statement bloqueante con gates G1/G2/G3 en `sdd-orchestrator.md`. Prerequisito `view_file tasks.md` agregado al comando `/sdd-ff`. Engram actualizado con `[handoff-as-return-statement]`.

---

## ⏳ Tareas Pendientes

**Roadmap sugerido:** 017 → 016 → 012 → 018 (v2.0.0) → 015 → resto

- [x] **017 Enforcement de Handoff Contract (Agent DRY):** ✅ Completado en v1.16.0.
- [ ] **016 Semántica de RFCs vs Proposals (Backlog):** Redefinir formalmente el rol de los RFCs en `docs/openspec/rfcs/` como verdaderos "Brain Dumps" (lluvias de ideas libres y crudas escritas por el humano). El formato formal de restricciones e ingeniería será delegado exclusivamente al `proposal.md` generado por el Orquestador durante la fase SDD, y que un orquestador fresco sepa que no debe tomarse como proposal.
- [ ] **012 Protocolo de Auto-Tiering del Orquestador (Backlog):** Implementar una fase de "Razonamiento Pre-Vuelo" donde el Orquestador analice el pedido del usuario contra la *Escalation Matrix* y declare su Tier de operación (T1/T2/T3) de forma autónoma antes de generar cualquier artefacto. Objetivo: reducir la micro-gestión humana y garantizar consistencia en el rigor documental. Al tener tiers, debatir si el orquestador debería delegar cada una de las fases a workers o si el puede hacer algunas, con pros y contras.
- [ ] **018 Arquitectura de Agentes v2.0.0 — Rediseño Monumental del Sistema de Configuración (Backlog):** Auditoría profunda y redistribución inteligente de TODOS los archivos de configuración de agentes (`GEMINI-funky-global.md`, `.agents/rules/sdd-orchestrator.md`, `.agents/rules/secops.md`, y demás). El objetivo es diseñar un sistema de tres capas aprovechando nativamente los **Workflows de Antigravity** (campo `Description` + campo `Content` en Markdown): **(1) Global (siempre activo):** Solo Personalidad, Tono y Filosofía. Token Diet estricta. **(2) Workspace Rules (condicionales):** Reglas específicas del repo, como `sdd-orchestrator.md` y `secops.md`, que se activan solo cuando el contexto lo amerita. **(3) Workflows Antigravity (on-demand):** Las instrucciones pesadas del Orquestador y del Worker viven como Workflows `/orchestrator` y `/worker`, inyectándose solo cuando el humano los invoca. Este cambio elimina el *Context Dilution*, resuelve el límite de tokens del IDE y es un **Breaking Change** de UX que justifica el salto a **v2.0.0**.
- [ ] **015 Protocolos On-Demand (Skills Inyectables) (Backlog):** Crear un mecanismo (ej. `.agents/skills/protocols/sdd-reviewer.md`) para protocolos de uso específico que no inflen el prompt global. Permite al humano invocar roles especializados (ej. "Abogado del Diablo" para auditar inconsistencias lógicas en un plan) solo cuando el escenario lo amerita, evitando el "Context Dilution".
- [ ] **002 Calculadora de Presupuestos (Backlog):** Crear un template o script interactivo (`project-cost-estimator.md`) para calcular el costo/precio a cobrar por un proyecto freelance/agencia, cruzando características solicitadas por el cliente, NFRs, presupuesto de infraestructura y seniority del equipo. → [Ver RFC](./docs/openspec/rfcs/002-project-cost-estimator.md)
- [ ] **006 Arquitectura SDD — Test Planning (Backlog)**: Diseñar e integrar una fase formal de "Test Planning" (ej. `test-plan.md` o mejora de `spec.md`). Debe ser agnóstica al framework y adaptarse a proyectos con o sin TDD estricto, mitigando puntos ciegos lógicos.
- [ ] **009 Base Templates & Customization Guide (Backlog):** Refactorizar el comando `init` para inyectar templates agnósticos (no acoplados a CLIs) y crear una "Guía de Customización". Esta guía dictará cómo mutar plantillas iniciales (como `tasks.md`) basándose en las decisiones del Project Canvas y Arch-Assessment, evitando el antipatrón de usar presets rígidos. → [Ver RFC](./docs/openspec/rfcs/009-project-templates-and-customization.md) → **[FASE FUTURA PENDIENTE — post-009 implementado]:** Evaluar CLI-first scaffolding para fases SDD (`funky phase ff <name>` genera `sdd-tasks.md` en `docs/openspec/changes/{name}/`). Resolvería que el modelo genere tasks.md de memoria. Decisión de diseño crítica a resolver: compatibilizar el scaffold base con las adaptaciones post-Canvas que 009 define. Ver análisis en `docs/funky-ai/drafts/cli-sdd-scaffolding-debate.md`.
- [ ] **011 Comando de Bootstrap de Prompts (Backlog):** Añadir un comando al CLI que genere los documentos del directorio `docs/prompts`. Es un comando de uso poco frecuente (ej. al configurar una nueva laptop), pero vital para asegurar que el entorno de IA (prompts globales y de backup) esté disponible inmediatamente en cualquier equipo de trabajo.
- [ ] **013 Comando de Generación Dinámica de Árbol (Backlog):** Crear una tool o comando (ej. `funky tree`) que recorra el repositorio y genere un mapa detallado archivo-por-archivo, infiriendo el propósito a través de comentarios o cabeceras. Previene el *Doc Rot* al eliminar la necesidad de mapas estáticos. → [Ver RFC](./docs/openspec/rfcs/013-dynamic-repo-tree.md)
- [ ] **003 Protocolo de Seguridad — Revisión de Repos Externos:** Crear un documento de protocolo (distinto de `secops.md`, que ya cubre npm) para auditar repos de GitHub, extensiones de VSCode y código de terceros. Incluye: detección de caracteres Unicode invisibles (Trojan Source), vectores de ejecución implícita en Python (import time / setup.py), y checklist para revisar repos ya clonados. → Contexto completo en [`docs/funky-ai/drafts/midudev.md` — Pendiente 1](./docs/funky-ai/drafts/midudev.md)
- [ ] **004 Protocolo de Optimización por Tipo de Proyecto:** Definir estándares mínimos de optimización según el tipo de proyecto (frontend, backend, CLI, API), con límites explícitos de cuándo parar y un framework de tradeoff entre rendimiento, UX, DX y funcionalidad. → Contexto completo en [`docs/funky-ai/drafts/midudev.md` — Pendiente 2](./docs/funky-ai/drafts/midudev.md)
- [ ] **005 Auditoría Legacy (Backlog):** Analizar el workspace del proyecto Next.js anterior. El objetivo es barrer el desastre de reglas/skills viejas, rescatar las decisiones arquitectónicas que eran joyas, y re-documentarlas usando el formato estructurado y liviano de Funky AI.

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
| v1.16.0 | Handoff Enforcement: Return Statement bloqueante (G1/G2/G3) + prerequisito `view_file tasks.md` en `/sdd-ff`. Debate CLI-first scaffolding documentado para 009. |}
