# ORCHESTRATOR-STATE.md — Funky AI

> **Propósito:** Contexto de recuperación de sesión para el Orquestador. Leer PRIMERO al iniciar cualquier chat de Orquestación.

---

## 🏷️ Estado Actual

- **Versión:** v2.3.0
- **Rama activa:** `main` (Git-Ops listo)
- **Última sesión:** 2026-05-20
- **Estado:** 🟢 v2.3.0 en producción. Protocolo sdd-micro-planner y Gate Human-in-the-loop implementados.

---

## 📂 Archivos Clave

| Archivo / Directorio | Rol |
|---------|-----|
| `.agents/protocols/index.md` | Índice de protocolos on-demand |
| `.agents/templates/sdd/` | Templates "golden" (personalizados de este workspace de funky-ai). **¡USAR ESTOS SIEMPRE COMO REFERENCIA PARA ESTE REPO!** |
| `funky-cli/src/commands/` | Lógica core del CLI (`init`, `phase`) |
| `funky-cli/src/templates/sdd/` | Templates "base" estáticos del CLI (los que se empaquetan y distribuyen a terceros). **¡NO USAR PARA LAS FEATURES DE ESTE REPOSITORIO!** |
| `funky-cli/src/utils/canvas.js` | Motor del Project Canvas (`generateCanvasMarkdown`) |
| `docs/repo-map.md` | Mapa estructural oficial del repositorio (Fuente de la verdad) |
| `docs/antigravity-cli/` | Documentación técnica y taxonómica de capacidades del CLI (`pensamiento-inicial`, `taxonomia-ecosistema`) |
| `docs/engram/` | Memoria persistente Two-Stage (`index`, `discoveries`, `bugfixes`) |
| `docs/funky-ai/conceptos/` | Fundamentos del framework (Manifiesto, reglas base) |
| `docs/funky-ai/historico/` | Cápsula del tiempo (Releases, Journey, Retrospectivas) |
| `docs/openspec/changes/` | Zona activa de ejecución de features del ciclo SDD |

---

## ✅ Tareas Completadas
- [x] **009.b Scaffolding Dinámico:** Implementado el comando `funky feature <name>` para inicializar scaffolding completo de fases SDD en lugar de crearlo a mano o mediante el Orquestador.
- [x] **Doc-Update v1.18.1:** Auditoría documental completa. Fix `funky init --template` (inyecta `canvas-planning-guide.md`). Creado `escenarios-de-uso.md`. Parche mayor `funky-init-flow.md` (v1.7.0 → actual). Parche `guia-flujo-completo.md`. `OPTIONAL_DOC_UPDATE` agregado a `tasks.md` con índice de 7 docs vivos. Engram actualizado con `[doc-update-index-manual-drift]`.
- [x] **002 Planificación Cost Estimator:** Fase de Orchestrator completada para RFC 002. Artefactos SDD (explore, proposal, spec, tasks) generados en `docs/openspec/changes/002-cost-estimator/`. Listo para ejecución.
- [x] **002 Calculadora de Presupuestos:** Comando `funky estimate` implementado (Fases Worker y Doc-Ops completadas). Integración con @inquirer/prompts y Value-Based Pricing. Lanzado en v1.19.0.
- [x] **018 Arquitectura de Agentes v2.0.0 — Rediseño Monumental del Sistema de Configuración:** Redistribución inteligente de archivos de configuración aprovechando nativamente los Workflows de Antigravity (Capa 1: Global, Capa 2: Workspace Rules, Capa 3: Workflows On-Demand). Elimina el Context Dilution y resuelve el límite de tokens. Breaking Change de UX. Lanzado en v2.0.0.
- [x] **Fix v2.0.1 — Asimetría Operativa (Context Fix):** Orquestador de vuelta a Capa 2 (`.agents/rules/sdd-orchestrator.md`). Rescate Feature 012 (Auto-Tiering + Escalation Matrix). Sincronización CLI template. Nuevo doc `agent-config-architecture.md`. Stale-ref corregida en `comando-vs-archivos.md`.
- [x] **015 Protocolos On-Demand v2.1.0:** `.agents/protocols/` local + `devil-advocate.md`. Etiquetado proactivo `[⚠️ RIESGO ALTO]` en templates SDD. CLI `funky init` con selector interactivo `p.multiselect` de protocolos. Templates distribuibles en `funky-cli/src/templates/protocols/`.
- [x] **016 Environment-Aware Scaffolding v2.2.0:** Integración de selector interactivo de entorno (`IDE` vs `CLI`) en `funky init`. Ruteo dinámico de plantillas de reglas desde subcarpetas `ide/` y `cli/`. Guardrail robusto de no-interactividad (headless mode) determinista para CI/CD y automatización sin bloqueos.
- [x] **015 Protocolos On-Demand:** ✅ Completado en v2.1.0 y v2.3.0 (Micro-Planner + Human-in-the-loop).

---

## ⏳ Tareas Pendientes

**Roadmap sugerido:** PENDIENTE

- [x] **Prevención de Agentic Drift (Overwrite Trap & Batching):** Leer a fondo el documento `docs/openspec/changes/rfcs/02-agentic-drift-overwrite-trap.md`. Durante la construcción de la v3.0, diseñar mecanismos de "Action Forcing" e "Interactive Gates" duros en el CLI para evitar que el Orquestador agrupe fases (Batching) o sobrescriba templates inyectados usando `write_to_file` con Overwrite en vez de parsear quirúrgicamente con `replace_file_content`.
- [  ] IDEA POST V3.0 - Nuestro engram actualmente usa md ya que al inicio de funky-ai solo existia antigravity IDE, ahora con la salida del cli, podríamos intentar replicar un engram original basado en sqlite o usar el mcp oficial.
- [ ] **Feature 3.0 (Funky AI Engine Automático):** Analizar a fondo los archivos `docs/antigravity-cli/pensamiento-inicial.md` y `taxonomia-ecosistema.md`. Extraer lecciones sobre el aislamiento de contexto (Contexto Cero), delegación asíncrona IPC y las asimetrías operativas frente a Antigravity 2.0 Desktop. Usar este marco taxonómico para diseñar el motor v3.0 (despacho asíncrono e interactivo de subagentes), aprovechando al máximo el rol del Verdadero CLI con acceso de edición de archivos y Gatekeeper de comandos.
- [ ] **006 Arquitectura SDD — Test Planning (Backlog)**: Diseñar e integrar una fase formal de "Test Planning" (ej. `test-plan.md` o mejora de `spec.md`). Debe ser agnóstica al framework y adaptarse a proyectos con o sin TDD estricto, mitigando puntos ciegos lógicos.
- [ ] **011 Comando de Bootstrap de Prompts (Backlog):** Añadir un comando al CLI que genere los documentos del directorio `docs/prompts` o archivos de config como workers/orquestadores de la v2.0.0. Es un comando de uso poco frecuente (ej. al configurar una nueva laptop), pero vital para asegurar que el entorno de IA (prompts globales y de backup) esté disponible inmediatamente en cualquier equipo de trabajo.
- [ ] **013 Comando de Generación Dinámica de Árbol (Backlog):** Crear una tool o comando (ej. `funky tree`) que recorra el repositorio y genere un mapa detallado archivo-por-archivo, infiriendo el propósito a través de comentarios o cabeceras. Previene el *Doc Rot* al eliminar la necesidad de mapas estáticos. → [Ver RFC](./docs/openspec/rfcs/013-dynamic-repo-tree.md)
- [ ] **003 Protocolo de Seguridad — Revisión de Repos Externos:** Crear un documento de protocolo (distinto de `secops.md`, que ya cubre npm) para auditar repos de GitHub, extensiones de VSCode y código de terceros. Incluye: detección de caracteres Unicode invisibles (Trojan Source), vectores de ejecución implícita en Python (import time / setup.py), y checklist para revisar repos ya clonados. → Contexto completo en [`docs/funky-ai/drafts/midudev.md` — Pendiente 1](./docs/funky-ai/drafts/midudev.md)
- [ ] **004 Protocolo de Optimización por Tipo de Proyecto:** Definir estándares mínimos de optimización según el tipo de proyecto (frontend, backend, CLI, API), con límites explícitos de cuándo parar y un framework de tradeoff entre rendimiento, UX, DX y funcionalidad. → Contexto completo en [`docs/funky-ai/drafts/midudev.md` — Pendiente 2](./docs/funky-ai/drafts/midudev.md)
- [ ] **005 Auditoría Legacy (Backlog):** Analizar el workspace del proyecto Next.js anterior. El objetivo es barrer el desastre de reglas/skills viejas, rescatar las decisiones arquitectónicas que eran joyas, y re-documentarlas usando el formato estructurado y liviano de Funky AI.
- [ ] Añadir el template de architect-assessment-guide al comando funky assess.
- [ ] **Auditoría Stale-Template-Refs (Quick):** `grep_search` en `docs/` y `.agents/` buscando textos como "copiar templates", "revisar templates", "crear manualmente los archivos" que ya son responsabilidad de `funky feature`. Actualizar o eliminar las referencias obsoletas. → Contexto: mejora detectada durante sesión 012.b.
Revisar todos los templates para verificar que no haya referencias obsoletas o deprecadas post v2.0.0. El analisis lo hará el humano y el orquestador tiene que unicamente darle sugerencias, es una tarea de pares, idea tras idea, tal vez no requiera sdd ni workers.
- [ ] **Revisión de Templates SDD:** Revisar todos los templates SDD para reforzarlos en caso de que tuvieran puntos flojos (instrucciones ambiguas, falta de guardrails, etc).
- [ ] **RFC 016: `funky engram add`** → [RFC Creado](./docs/openspec/rfcs/016-funky-engram-add.md)
  - Implementar un comando nativo en el CLI para inyectar descubrimientos al Engram atómicamente (`funky engram add --tag "[xxx]" --desc "..."`). Esto evita que los Agentes tengan que cargar todo el archivo `discoveries.md` en memoria para hacer un append, reduciendo el Context Pollution y protegiendo contra errores de codificación.
- [ ] **RFC 017: Modo Worker Inline Condicional (Escalation Matrix T0)**
  - Agregar un cuarto nivel implícito a la Escalation Matrix del Orquestador: cuando detecta que una tarea es trivial (máx. 1 archivo, sin lógica de negocio, reversible sin riesgo), en lugar de delegar a un Worker o ejecutar sin avisar, debe **preguntar al humano**: *"¿Querés que lo ejecute yo directamente o preferís abrir un Worker?"*. Preserva el rol del humano como decisor y evita overhead innecesario para tareas realmente atómicas. **Guardrail clave:** el criterio de "trivial" debe ser objetivo y acotado en la regla para evitar que el Orquestador se auto-justifique para saltarse el SDD. → Ver `[context-economy]` y `[orchestrator-role-boundary]` en Engram.
- [ ] **Feature 020: Phase Workflows Especializados por Fase SDD**
  - Crear Global Workflows transversales a todos los Tiers como `/funky-explore`, `/funky-spec`, `/funky-tasks`. Cada workflow carga en contexto únicamente las instrucciones del rol correspondiente a esa fase SDD, reduciendo ruido y mejorando la precisión del agente. **Decisión arquitectónica (sesión 019):** son un acelerador universal, NO un diferenciador de Tier. T3 se diferencia por templates enriquecidos (NFRs + Devil's Advocate), no por workflows exclusivos. → Referencia: Feature 019 explore.md §2 Opción D, Engram.
  - **[v3.0 — Diferido]:** Analizar compatibilidad multi-entorno (IDE Antigravity, Desktop, CLI) antes de implementar. Cada entorno tiene mecanismos distintos para cargar contexto de workflows.

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
| v2.0.1 | Fix Asimetría Operativa: Orquestador a Capa 2, rescate Auto-Tiering (Feature 012), nuevo `agent-config-architecture.md`. |
| v2.1.0 | Protocolos On-Demand: `.agents/protocols/`, `devil-advocate.md`, etiquetado `[⚠️ RIESGO ALTO]` en templates SDD, selector interactivo en `funky init`. |
| v2.3.0 | Protocolo sdd-micro-planner On-Demand y Gate Human-in-the-loop en Orquestador. Ahorro de tokens en templates SDD. |
