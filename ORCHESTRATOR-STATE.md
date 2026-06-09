# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual

- **Versión:** v2.5.1
- **Rama activa:** `feature/023-deprecate-worker-handoff`
- **Última sesión:** 2026-06-09
- **Estado:** 🟢 Feature 023 completada. Doc-Ops finalizado. Listo para GitOps Humano (merge + tag v2.5.1).

---

## 📂 Archivos Clave


| Archivo / Directorio | Rol |
|---------|-----|
| `.agents/rules/sdd-orchestrator.md` | Reglas del orquestador |
| `.agents/rules/engram-protocol.md` | Reglas del protocolo de memoria |
| `docs/engram/index.md` | Índice de memoria persistente Two-Stage (`discoveries`, `bugfixes`, etc) |
| `.agents/protocols/index.md` | Índice de protocolos on-demand |
| `.agents/templates/sdd/` | Templates "golden" (personalizados de este workspace de funky-ai). **¡USAR ESTOS SIEMPRE COMO REFERENCIA PARA ESTE REPO!** |
| `funky-cli/src/commands/` | Lógica core del CLI (`init`, `phase`) |
| `funky-cli/src/templates/sdd/` | Templates "base" estáticos del CLI (los que se empaquetan y distribuyen a terceros). **¡NO USAR PARA LAS FEATURES DE ESTE REPOSITORIO!** |
| `funky-cli/src/utils/canvas.js` | Motor del Project Canvas (`generateCanvasMarkdown`) |
| `docs/repo-map.md` | Mapa estructural oficial del repositorio (Fuente de la verdad) |
| `docs/funky-ai/conceptos/` | Fundamentos del framework (Manifiesto, reglas base) |
| `docs/funky-ai/historico/` | Cápsula del tiempo (Releases, Journey, Retrospectivas) |
| `docs/openspec/changes/` | Zona activa de ejecución de features del ciclo SDD |

---

## ✅ Tareas Completadas
- [x] **Doc-Update v1.18.1:** Auditoría documental completa. Fix `funky init --template` (inyecta `canvas-planning-guide.md`). Creado `escenarios-de-uso.md`. Parche mayor `funky-init-flow.md` (v1.7.0 → actual). Parche `guia-flujo-completo.md`. `OPTIONAL_DOC_UPDATE` agregado a `tasks.md` con índice de 7 docs vivos. Engram actualizado con `[doc-update-index-manual-drift]`.
- [x] **002 Planificación Cost Estimator:** Fase de Orchestrator completada para RFC 002. Artefactos SDD (explore, proposal, spec, tasks) generados en `docs/openspec/changes/002-cost-estimator/`. Listo para ejecución.
- [x] **002 Calculadora de Presupuestos:** Comando `funky estimate` implementado (Fases Worker y Doc-Ops completadas). Integración con @inquirer/prompts y Value-Based Pricing. Lanzado en v1.19.0.
- [x] **Sub-Orquestador (Arquitecto Táctico) v2.4.1:** Flujo de Micro-Planner delegado a agente efímero. `planning-handoff.md` template creado. Workflow `/funky-suborchestrator` creado. Regla G4 actualizada.
- [x] **RFC 016 y RFC 017: Engram Sharding y `funky engram add` v2.5.0:** Implementado comando nativo para inyectar engramas atómicamente. Se eliminan los archivos monolíticos `discoveries.md`/`bugfixes.md` en favor de un index dinámico y fragmentos por categoría (`architecture/`, `pattern/`, `discovery/`, `decision/`, `bugfix/`) para proteger el Context Window.
- [x] **023 Deprecate Worker Handoff:** Migración completa a Message Passing directo. Reglas purgadas en Orquestador. Templates residuales eliminados. Tests de CLI refactorizados.

---

## ⏳ Tareas Pendientes

**Roadmap sugerido:** PENDIENTE

- [x] 🛑 **Feature 3.0 (Funky AI Engine Automático):** [CANCELADO/DEPRECADO] Decisión estratégica (ver retrospectiva 2026-05-23). Se prioriza el uso de `antigravity-ide` con la metodología Funky AI para optimizar uso de tokens en el free tier, mientras que el `antigravity-cli` se usará en tándem con Gentle AI como pilar de automatización. No se avanzará con la sobreingeniería del motor automático complejo de V3.0.
- [ ] **006 Arquitectura SDD — Test Planning (Backlog)**: Diseñar e integrar una fase formal de "Test Planning" (ej. `test-plan.md` o mejora de `spec.md`). Debe ser agnóstica al framework y adaptarse a proyectos con o sin TDD estricto, mitigando puntos ciegos lógicos.
- [ ] **011 Comando de Bootstrap de Prompts (Backlog):** Añadir un comando al CLI que genere los documentos del directorio `docs/prompts` o archivos de config como workers/orquestadores de la v2.0.0. Es un comando de uso poco frecuente (ej. al configurar una nueva laptop), pero vital para asegurar que el entorno de IA (prompts globales y de backup) esté disponible inmediatamente en cualquier equipo de trabajo.
- [ ] **013 Comando de Generación Dinámica de Árbol (Backlog):** Crear una tool o comando (ej. `funky tree`) que recorra el repositorio y genere un mapa detallado archivo-por-archivo, infiriendo el propósito a través de comentarios o cabeceras. Previene el *Doc Rot* al eliminar la necesidad de mapas estáticos. → [Ver RFC](./docs/openspec/rfcs/013-dynamic-repo-tree.md)
- [ ] **003 Protocolo de Seguridad — Revisión de Repos Externos:** Crear un documento de protocolo (distinto de `secops.md`, que ya cubre npm) para auditar repos de GitHub, extensiones de VSCode y código de terceros. Incluye: detección de caracteres Unicode invisibles (Trojan Source), vectores de ejecución implícita en Python (import time / setup.py), y checklist para revisar repos ya clonados. → Contexto completo en [`docs/funky-ai/drafts/midudev.md` — Pendiente 1](./docs/funky-ai/drafts/midudev.md)
- [ ] **004 Protocolo de Optimización por Tipo de Proyecto:** Definir estándares mínimos de optimización según el tipo de proyecto (frontend, backend, CLI, API), con límites explícitos de cuándo parar y un framework de tradeoff entre rendimiento, UX, DX y funcionalidad. → Contexto completo en [`docs/funky-ai/drafts/midudev.md` — Pendiente 2](./docs/funky-ai/drafts/midudev.md)
- [ ] **005 Auditoría Legacy (Backlog):** Analizar el workspace del proyecto Next.js anterior. El objetivo es barrer el desastre de reglas/skills viejas, rescatar las decisiones arquitectónicas que eran joyas, y re-documentarlas usando el formato estructurado y liviano de Funky AI.
- [ ] **RFC 017: Modo Worker Inline Condicional (Escalation Matrix T0)**
  - Agregar un cuarto nivel implícito a la Escalation Matrix del Orquestador: cuando detecta que una tarea es trivial (máx. 1 archivo, sin lógica de negocio, reversible sin riesgo), en lugar de delegar a un Worker o ejecutar sin avisar, debe **preguntar al humano**: *"¿Querés que lo ejecute yo directamente o preferís abrir un Worker?"*. Preserva el rol del humano como decisor y evita overhead innecesario para tareas realmente atómicas. **Guardrail clave:** el criterio de "trivial" debe ser objetivo y acotado en la regla para evitar que el Orquestador se auto-justifique para saltarse el SDD. → Ver `[context-economy]` y `[orchestrator-role-boundary]` en Engram.
- [ ] **Feature 020: Phase Workflows Especializados por Fase SDD**
  - Crear Global Workflows transversales a todos los Tiers como `/funky-explore`, `/funky-spec`, `/funky-tasks`. Cada workflow carga en contexto únicamente las instrucciones del rol correspondiente a esa fase SDD, reduciendo ruido y mejorando la precisión del agente. **Decisión arquitectónica (sesión 019):** son un acelerador universal, NO un diferenciador de Tier. T3 se diferencia por templates enriquecidos (NFRs + Devil's Advocate), no por workflows exclusivos. → Referencia: Feature 019 explore.md §2 Opción D, Engram.
  [] con tantas features que han alterado el flujo de trabajo, hay archivos o templates que no se inyectan debido a que no se contemplo actualizar los comandos del cli, detectar qué inconsistencias existen mediante un smoke test

---

## 🐛 Bugs Activos
- [x] **[CLI Bug]** Comando `funky feature` no inyecta el `report.md` en el scaffolding del nuevo cambio. (Corregido: ahora inyecta report.md, design.md, apply.md, verify.md y planning-handoff.md)

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
| v2.0.1 | Fix Asimetría Operativa: Orquestador a Capa 2, rescate Auto-Tiering (Feature 012), nuevo `agent-config-architecture.md`. |
| v2.1.0 | Protocolos On-Demand: `.agents/protocols/`, `devil-advocate.md`, etiquetado `[⚠️ RIESGO ALTO]` en templates SDD, selector interactivo en `funky init`. |
| v2.3.0 | Protocolo sdd-micro-planner On-Demand y Gate Human-in-the-loop en Orquestador. Ahorro de tokens en templates SDD. |
| v2.4.0 | Ecosistema Híbrido, Cherry-Pick Arquitectónico de Templates SDD (Feature 021) y nuevos templates de Design/Apply/Verify. |
| v2.4.1 | Arquitectura Sub-Orquestador (Arquitecto Táctico): `planning-handoff.md`, `/funky-suborchestrator` workflow, `sdd-micro-planner.md` refactorizado como esquema de salida, Gate G4 actualizado. |
| v2.5.0 | Engram Sharding y comando `funky engram add`. Reemplazo de historial monolítico por indexación semántica distribuida. |
| v2.5.1 | Message Passing Directo: Deprecación completa de `worker-handoff.md`. CLI limpiado. `funky-worker.md` y `report.md` refactorizados. |
