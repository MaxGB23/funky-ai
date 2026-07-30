# Tasks: Arquitectura de Agentes v2.0.0

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/v2.0.0-agent-architecture`
**Ref:** `proposal.md`, `spec.md`

> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verifica el Planning Checklist en `.agents/rules/sdd-orchestrator.md`. Genera un `worker-handoff.md` basado en `funky-cli/src/templates/sdd/worker-handoff.md`. **NO delegues mediante prompts en el chat.**

> **[SISTEMA - PREREQUISITO]** ¿Existe `sdd-spec.md` en esta misma carpeta (`docs/openspec/changes/{feature}/`)? Si **NO** existe → **PARAR. Generarlo primero.** El `tasks.md` sin `spec.md` es construir sin plano arquitectónico.

---

## ✅ Checklist de Ejecución

> **[SISTEMA — ORQUESTADOR — ENFORCEMENT]** Al completar cada ítem:
> 1. Marcarlo `[x]` en este archivo **INMEDIATAMENTE**.
> 2. Guardar el archivo al disco antes de continuar al siguiente ítem.
> Un `tasks.md` desactualizado = próxima sesión ciega. Sin excusas.

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [x] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [x] Verificar que el branch NO existe: `git branch --list feature/v2.0.0-agent-architecture`
- [x] Crear y cambiar al branch: `git checkout -b feature/v2.0.0-agent-architecture`
- [x] Confirmar branch activo: `git status`
- [x] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

### FASE 1 — Capa 1: Refactor Global (Worker - T2)
> Objetivo: Limpiar `GEMINI-funky-global.md` manteniendo solo el core.

- [x] Eliminar de `docs/prompts/GEMINI-funky-global.md` toda la sección referida a "Funky AI Protocol — Manual SDD Orchestrator Rule", "Dual Persona", "Orchestrator vs Worker".
- [x] Asegurar que permanezcan intactas las secciones de: Rules, Personalidad, Language, Tone, Philosophy y Expertise.
- [x] **Restricción Crítica:** NO TOCAR `docs/prompts/gemini-funky-backup.md`.

**🚫 Restricciones:** Estricta adherencia a "no eliminar" la personalidad y tono.

---

### FASE 2 — Capa 2: Workspace Rules Fragmentación (Worker - T3)
> Objetivo: Dividir `sdd-orchestrator.md` sin perder información útil.

- [x] Crear `.agents/rules/orchestrator-core.md`.
- [x] Mover a `orchestrator-core.md` las reglas estructurales indispensables (ej: Bootstrap, Semántica RFC vs Proposal, Auto-Tiering).
- [x] **Restricción Crítica (Anti-Alucinación):** NO eliminar lógica operativa de Worker o planificación profunda. Debe ser movida/refactorizada para inyectarla después en Capa 3. Nada se pierde, todo se reubica.
- [ ] Eliminar `.agents/rules/sdd-orchestrator.md` original SÓLO cuando su contenido esté salvado o mapeado a Capa 3.

**🚫 Restricciones:** Evitar sobreoptimización. Respetar el contenido de las reglas que hacen al protocolo seguro.

---

### FASE 3 — Capa 3 y Templates de Delegación (Worker - T2)
> Objetivo: Crear Workflows de Antigravity y actualizar strings de Handoff.

- [x] Crear en `docs/openspec/changes/funky-cli-v2.0.0/` los borradores `funky-orchestrator.md` y `funky-worker.md` con las lógicas extraídas en la Fase 2.
- [x] Actualizar `.agents/templates/sdd/worker-handoff.md`, reemplazando el texto de Handoff final por: `/funky-worker @.../worker-handoff.md Ejecuta la fase N`.
- [x] Actualizar `funky-cli/src/templates/sdd/worker-handoff.md` con el mismo reemplazo.
- [x] Actualizar `.agents/templates/bootstrap/agents-rules-sdd-orchestrator.md` con el mismo reemplazo.

**🚫 Restricciones:** No tocar código JS de la CLI.

---

### FASE 4 — Doc-Update [ORQUESTADOR — Inline]
> Doc-Update completado con la actualización a la nueva arquitectura.

- [x] **Doc 2** — `docs/funky-ai/operaciones/guia-flujo-completo.md`: Actualizada la sección 4.2 para reflejar el comando de delegación `/funky-worker`.
- [x] **Doc 4** — `docs/funky-ai/guias/funky-ai.md`: Actualizada la sección de configuración para explicar la Arquitectura de 3 Capas y el concepto de Token Diet.

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Doc-Ops [ORQUESTADOR — Inline, modelo actual]
> **Objetivo:** Producir todos los artefactos de la release y ejecutar los archivados. El Orquestador lo hace inline mientras el contexto está fresco — no se delega a un Worker.
> **Modelo:** El que está activo en la sesión actual (contexto ya cargado = cero transcripción).

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Tests [CONDICIONAL]:** ¿Esta feature modificó código fuente testeable (comandos, utils, lógica de negocio)? 
  - **SÍ aplica →** Ejecutar la suite completa antes de archivar: `pnpm run test` (o el script del proyecto). Si falla → PARAR y resolver el bug antes de continuar. El push nunca parte de una base rota.
  - **NO aplica →** Marcar como `[OMITIDO: sin cambios en código fuente — solo docs/templates/config]`.
- [ ] **Release Notes:** Generar `docs/funky-ai/releases/vX.Y.Z-release.md` usando como base `funky-cli/src/templates/release.md`. *(Redactar para consumo humano. IGNORAR Token Diet aquí.)*
- [ ] **README [CONDICIONAL]:** ¿La release cambió la versión, comandos disponibles o arquitectura conceptual? → Actualizar `README.md` raíz manteniéndolo como Architecture Hub. Si no → `[OMITIDO: sin cambios estructurales]`.

- [ ] **CLI Docs:** SI la release incluyó nuevos comandos o flags → actualizar tabla en `funky-cli/README.md`. Si no → `[OMITIDO: sin nuevos comandos]`.
- [ ] **Package.json:** Bumpar `"version"` en `funky-cli/package.json` a la nueva versión.
- [ ] **Archivado:** Mover `docs/openspec/changes/{feature}/` → `docs/openspec/archive/{version}-{feature}/`. Ejecutar AHORA (antes del Worker).
- [ ] **RFCs:** Decidir qué RFCs fueron implementados en esta release → moverlos a `docs/openspec/archive/`. Ejecutar AHORA. (`proposals/` está deprecado — no usar).
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (versión, rama, estado estable).
- [ ] **Smoke Test [CONDICIONAL]:** Si la feature altera el flujo E2E del proyecto, agregar escenario de QA a `docs/operaciones/master-smoke-test.md`. Si no → `[OMITIDO: sin cambios de integración E2E]`.
- [ ] **Preparar datos para Worker Git-Ops:** Declarar en el handoff: versión exacta, mensaje de commit, nombre del branch, mensaje del tag.

> ⚠️ **Regla de oro:** Todo lo que requiere criterio o genera texto → Orquestador inline. Todo lo mecánico post-archivado → Worker Git-Ops.

---

### FASE X+1 — Git-Ops [Worker T1 — ⚡ Flash / Haiku]
> **Objetivo:** Comandos git puros. Sin edición de archivos, sin redacción, sin decisiones.
> **Modelo:** Flash / Haiku — el más liviano disponible. Si comete un error → documentar y PARAR.
> **Prerequisito:** El Orquestador completó la Fase Doc-Ops y los archivados ya están ejecutados.

**🚨 CHECKLIST GIT-OPS (OBLIGATORIO - NO OMITIR):**
- [x] **Verificar estado:** `git status` — confirmar limpio. Si hay archivos inesperados → documentar y PARAR.
- [x] **Commit:** `git add -A && git commit -m "{mensaje declarado por Orquestador}"`
- [x] **Merge:** `git checkout main && git merge --no-ff {branch-declarado}`
- [x] **Tag:** `git tag -a {version} -m "{mensaje-declarado}"`
- [x] **Push:** `git push origin main --tags`

> ⚠️ Esta fase NO edita archivos de texto. Solo ejecuta comandos git. Si algo falla → documentar en `sdd-report.md` y PARAR.


</MANDATORY_RELEASE_PROTOCOL>

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `sdd-report.md` con:

> **MANDATORY:** Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems de `MANDATORY_RELEASE_PROTOCOL` marcados como `[x]` o `[OMITIDO: razón]`. Sin este bloque, la Fase NO se considera completa.

```markdown
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (si aplica, usar schema engram. OBLIGATORIO: incluir intentos fallidos y anti-patrones descartados, no solo bugs finales)
- **Próxima acción:** (qué debe hacer el Orquestador)
```

---

> **[SISTEMA — ORQUESTADOR — LEER ANTES DE COMUNICAR AL HUMANO]**
> Antes de escribir cualquier instrucción al humano, verificar **en este orden**:
> 1. ¿`worker-handoff.md` generado en `docs/openspec/changes/{feature}/`? Si **NO** → generarlo AHORA. No se delega ninguna fase sin handoff.
> 2. ¿Revisaste el Planning Checklist (items 0–4) en `.agents/rules/sdd-orchestrator.md`? Si **NO** → leerlo antes de continuar.
> 3. Solo después de confirmar los dos puntos anteriores, instruir al humano: *"Cierra este chat, abre uno nuevo y dime: `/funky-worker @docs/openspec/changes/{feature}/worker-handoff.md Ejecuta la fase N`"*
