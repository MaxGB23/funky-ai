# Tasks: [Nombre de la Funcionalidad o Cambio]

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/nombre-del-branch`
**Ref:** `proposal.md`, `spec.md` (opcional, solo si existen)

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

### FASE 0 — Branch Setup
**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.
- [ ] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [ ] Verificar que el branch NO existe: `git branch --list feat/vX.Y-{name}`
- [ ] Crear y cambiar al branch: `git checkout -b feat/vX.Y-{name}`
- [ ] Confirmar branch activo: `git status`
- [ ] Documentar en Return Envelope: branch confirmado ✅

---

### FASE 1 — [Nombre de la Fase 1]
**🚫 Restricciones:** [Ej: No modificar código fuente, solo tests.]
> Objetivo: [Objetivo de esta fase]
- [ ] 1.1 [Tarea específica 1]
- [ ] 1.2 [Tarea específica 2]

---

## 📋 Return Envelope (Para el Worker)
Al finalizar cada fase, actualizar `report.md` (o el return envelope del handoff) con:
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
> 1. ¿Revisaste el Orchestration Checklist (items 0–4) en `.agents/rules/sdd-orchestrator.md`? Si **NO** → leerlo antes de continuar.
> 2. (Omitir en TIER 4) Solo después de confirmar los dos puntos anteriores, indicar al humano: *"Cierra este chat, abre uno nuevo y dime: `@docs/openspec/changes/{feature}/worker-handoff.md Ejecuta la Fase N`"* 
> **TIER 4** solo indicar: *"Cierra este chat, abre uno nuevo y ejecuta `/funky-{fase} [openspec/changes/{feature}/]`."*