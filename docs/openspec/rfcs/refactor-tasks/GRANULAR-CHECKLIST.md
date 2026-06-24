### 📄 `blueprint-final-draft.md`
- [x] **§1 — El Barrio: Taxonomía y Criterios de Selección** — Roles (Maistro, Sabueso, Chalán, Chalán Vergas, Chalán Fresón, Mierdillo), permisos y costos en tokens.
- [x] **§2 — Reglas de Nacimiento (Loading y Conflicto de Identidad)** — Lazy Loading de Skills, mitigación de conflicto de identidad en subagentes `self`.
- [x] **§3 — Delegación de Workflows (Slash Commands)** — Cambio de paradigma: slash commands + parámetros en frontmatter del prompt.
- [x] **§4 — Ciclo de Vida, Retorno y Persistencia** — Return Envelope, prohibición de `RequestFeedback: true`, flujo Idle → Feedback → Kill.
- [x] **§5 — Modos de Operación: Interactivo vs Auto** — Diferencias CLI interactivo vs automático, mini-delegación en Tier 2, checkpoints pre-apply.
- [x] **§A1 — El "Explore Ligero" (Protección de Contexto)** — Sabueso desechable tipo `research` para búsquedas rápidas.
- [x] **§A2 — Arquitectura de Dos Tiempos: IDE Presente, CLI Futuro** — Separación cronológica de roles.

### 📄 `delegaciones.md` *(CLOSED — revisar si hay info no absorbida)*
- [ ] **§Inicial — Modo interactivo y Tier 2** — Ritmo de inyección de artefactos para frenar alucinaciones en cascada.
- [ ] **§Separación CLI vs IDE** — CLI "piensa y coordina", IDE ejecuta con control del humano sobre diffs.
- [ ] **§Kill Switch** — Prompt de advertencia para detener al agente IDE si se le exige orquestación.

### 📄 `draft-extras.md`
- [ ] **§E1 — Contrato de Parámetros** — Unificación de `artifact_state`, `has_design`, `feature_name`, `tag` derivados del Tier.
- [ ] **§1 — Manejo de Params** — Inyección obligatoria como frontmatter del prompt; plantillas físicas limpias.
- [ ] **§2 — Ciclo de Vida y Transición Arquitectónica** — Fase 1 (Puente Manual Copy-Paste) → Fase 2 (Automatización total).
- [ ] **§E2 — El Template Siempre Manda** — `tasks.md` mantiene Fase 0 (Branch Setup) intocable sin importar el Tier.

### 📄 `draft-tasks.md`
- [ ] **§1 — Resumen y Motivación** — Fragmentación del monolito `tasks` en `tasks.md`, `docs.md` y `release.md`.
- [ ] **§2 — Reglas de Release (SemVer x SDD)** — Reglas de inyección de `release.md` y `docs.md` por SemVer. *(Consolidado en `spec-routing-tiers.md`)*
- [ ] **§3 — Flujo de Inyección (Diagrama)** — Diagrama y lógica de Inquirers del CLI (`funky feature`).
- [ ] **§4 — Orquestación y Decisión Humana (Inquirers)** — IA sugiere, humano aprueba o corrige.
- [ ] **§5 — Custom Workflows y Exclusión de Templates** — Exclusión de scaffolding en T3/T4 con agentes libres.
- [ ] **§6 — Escalera de Tiers y Aislamiento de Fases** — Jerarquía T1→T4. *(Consolidado en `spec-routing-tiers.md`)*
- [ ] **§7.1 — Trazabilidad Vertical de NFRs** — Ciclo Discovery → Formalización → Bloqueo → Cascada → Tagging. 
- [ ] **§7.2 — Modos de Ejecución CLI: Automático vs Interactivo** — Ritmo de inyección y aprobación por fase.
- [ ] **§7.3 — Escalera de Tiers Refinada (con T0)** — Tier 0 y Branch Management. *(Consolidado en `spec-routing-tiers.md`)*
- [ ] **§7.4 — El "Explore Ligero" — Sabueso Desechable** — Ciclo de vida v1 (Canary) → v2 (Autónomo).
- [ ] **§7.5 — Arquitectura del `/funky-tasks` y Deprecaciones** — Un solo workflow agnóstico al Tier, deprecación del Microplanning, Return Envelope. *(Consolidado en `spec-routing-tiers.md`)*

### 📄 `rules-orchestrator-backup.md`
- [ ] **§Identidad** — Rol del Orquestador, prohibición de abuso de slash commands.
- [ ] **§Escalation Matrix** — Tabla de routing por Tiers. *(Consolidado en `spec-routing-tiers.md`)*
- [ ] **§Guardrails de Edición de Templates** — Prohibición de `write_to_file`; uso obligatorio de `replace_file_content`.
- [ ] **§Paso 0 — Razonamiento Pre-Vuelo** — Autodeclaración del Tier antes de responder.
- [ ] **§Memory Polling — Two-Stage** — Rutina de chequeo en `docs/engram/index.md` y `grep_search`.
- [ ] **§Orchestration Checklist** — Lista de control obligatoria de inicialización.
- [ ] **§Puerta de Escalamiento Dinámico (Return Envelope)** — Leer el Return Envelope de `/funky-tasks` y decidir si se escala.
- [ ] **§Phase Batching y Checkpoint entre Fases** — Ejecución secuencial, lectura de `report.md`.
- [ ] **§Protocolo del Engram (Persistencia Proactiva)** — Registro de gotchas y edge cases en el engram.
- [ ] **§Session Close** — Actualización obligatoria de `ORCHESTRATOR-STATE.md`.
