# Tasks: [Nombre de la Funcionalidad o Cambio]

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/nombre-del-branch`

> **ORCHESTRATOR GATE**: Si eres el Orquestador — STOP. Do NOT execute these instructions inline. Delega al worker o sub-agente.

---

> **[SISTEMA — PARA funky-tasks]** Si detectas que una fase tiene lógica de negocio compleja o decisiones de diseño críticas, limítate a etiquetar su título con `[⚠️ RIESGO ALTO]`.

> **GUARDRAIL DE TAREAS (Budget: ≤ 530 palabras):**
> Cada tarea DEBE cumplir estos criterios:
> | Criteria | ✅ Bien | ❌ Mal |
> |----------|---------|--------|
> | Specific | "Create internal/auth/middleware.go con validación JWT" | "Add auth" |
> | Actionable | "Add ValidateToken() a AuthService" | "Handle tokens" |
> | Verifiable | "Test: POST /login retorna 401 sin token" | "Make sure it works" |
> | Small | Un archivo o una unidad lógica | "Implement the feature" |
> | NFR Tagging | "`[nfr:latency]` Add cache to GET /users" | "Make it fast" |

### FASE 0 — Branch Setup
**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.
- [ ] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [ ] Verificar que el branch NO existe: `git branch --list feat/vX.Y-{name}`
- [ ] Crear y cambiar al branch: `git checkout -b feat/vX.Y-{name}`
- [ ] Confirmar branch activo: `git status`

---

### FASE 1 — [Nombre de la Fase 1]
**🚫 Restricciones:** [Ej: No modificar código fuente, solo tests.]
> Objetivo: [Objetivo de esta fase]
- [ ] 1.1 [Tarea específica 1]
- [ ] 1.2 [Tarea específica 2]

---