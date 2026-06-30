# Tasks: 025-engram-index-free-navigation

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/025-engram-index-free-navigation`
**Ref:** `proposal.md`, `spec.md`

> **ORCHESTRATOR GATE**: Si eres el putisimo Orquestador — STOP. Do NOT execute these instructions inline. Delega al worker o sub-agente.
> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verifica el Orchestration Checklist en `.agents/rules/sdd-orchestrator.md`. El `worker-handoff.md` ya está generado en esta carpeta.

---

## ✅ Checklist de Ejecución
> **[SISTEMA — ORQUESTADOR — ENFORCEMENT]** Al completar cada ítem:
> 1. Marcarlo `[x]` en este archivo **INMEDIATAMENTE**.
> 2. Guardar el archivo al disco antes de continuar al siguiente ítem.
> Un `tasks.md` desactualizado = próxima sesión ciega. Sin excusas.

> **[SISTEMA — PARA EL ORQUESTADOR]** Si detectas que una fase tiene lógica de negocio compleja o decisiones de diseño críticas, limítate a etiquetar su título con `[⚠️ RIESGO ALTO]`. El humano decidirá si ejecutar el protocol "micro-planning", nunca lo asumas.

> **GUARDRAIL DE TAREAS (Budget: ≤ 530 palabras):**
> Cada tarea DEBE cumplir estos criterios:
> | Criteria | ✅ Bien | ❌ Mal |
> |----------|---------|--------|
> | Specific | "Create internal/auth/middleware.go con validación JWT" | "Add auth" |
> | Actionable | "Add ValidateToken() a AuthService" | "Handle tokens" |
> | Verifiable | "Test: POST /login retorna 401 sin token" | "Make sure it works" |
> | Small | Un archivo o una unidad lógica | "Implement the feature" |

### Suggested Work Units
| Unit | Goal | Likely PR | Notes |
|---|---|---|---|
| Unit 1 | Update Agent Rules & CLI Templates | 1 | Reemplazar `view_file docs/engram/index.md` con `list_dir docs/engram/` en los 4 archivos objetivo |

### FASE 0 — Branch Setup
**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.
- [x] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [x] Verificar que el branch NO existe: `git branch --list feat/025-engram-index-free-navigation`
- [x] Crear y cambiar al branch: `git checkout -b feat/025-engram-index-free-navigation`
- [x] Confirmar branch activo: `git status`
- [x] Documentar en Return Envelope: branch confirmado ✅

---

### FASE 1 — Rules & Templates Modification
**🚫 Restricciones:** Modificar solo las menciones al index.md, no cambiar nada más de los protocolos.
> Objetivo: Reemplazar el descubrimiento O(N) por O(1) vía `list_dir`.
- [x] 1.1 Modificar `.agents/rules/sdd-orchestrator.md`: Reemplazar la directiva de Memory Polling (Stage 1) para que use `list_dir docs/engram/` en lugar de `view_file docs/engram/index.md`.
- [x] 1.2 Modificar `.agents/rules/engram-protocol.md`: Actualizar la recuperación de contexto para que haga un discovery con `list_dir docs/engram/`.
- [x] 1.3 Modificar `funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`: Aplicar el mismo cambio de 1.1 para que el CLI genere la regla correctamente en proyectos nuevos.
- [x] 1.4 Modificar `funky-cli/src/templates/bootstrap/agents-rules-engram-protocol.md`: Aplicar el mismo cambio de 1.2 para sincronizar el template del CLI.

---

> **[SISTEMA — ORQUESTADOR — LEER ANTES DE COMUNICAR AL HUMANO]**
> Antes de escribir cualquier instrucción al humano, verificar **en este orden**:
> 1. ¿Revisaste el Orchestration Checklist (items 0–4) en `.agents/rules/sdd-orchestrator.md`? Si **NO** → leerlo antes de continuar.
> 2. (Omitir en TIER 4) Solo después de confirmar los dos puntos anteriores, indicar al humano: *"Cierra este chat, abre uno nuevo y dime: `@docs/openspec/changes/{feature}/worker-handoff.md Ejecuta la Fase N`"* 
> **TIER 4** solo indicar: *"Cierra este chat, abre uno nuevo y ejecuta `/funky-{fase} [openspec/changes/{feature}/]`."*