# Tasks: [Nombre de la Funcionalidad o Cambio]

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/nombre-del-branch`
**Ref:** `sdd-proposal.md`, `sdd-spec.md`

> **ORCHESTRATOR GATE**: Si eres el putisimo Orquestador — STOP. Do NOT execute these instructions inline. Delega al worker o sub-agente.
> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verifica el Orchestration Checklist en `.agents/rules/sdd-orchestrator.md`. El `worker-handoff.md` ya está generado en esta carpeta.

---

## ✅ Checklist de Ejecución
> **[SISTEMA — ORQUESTADOR — ENFORCEMENT]** Al completar cada ítem:
> 1. Marcarlo `[x]` en este archivo **INMEDIATAMENTE**.
> 2. Guardar el archivo al disco antes de continuar al siguiente ítem.
> Un `tasks.md` desactualizado = próxima sesión ciega. Sin excusas.

> **[SISTEMA — PARA EL ORQUESTADOR]** Si detectas que una fase tiene lógica de negocio compleja o decisiones de diseño críticas, limítate a etiquetar su título con `[⚠️ RIESGO ALTO]`. El humano decidirá si ejecutar el protocolo "micro-planning", nunca lo asumas.

> **GUARDRAIL DE TAREAS (Budget: ≤ 530 palabras):**
> Cada tarea DEBE cumplir estos criterios:
> | Criteria | ✅ Bien | ❌ Mal |
> |----------|---------|--------|
> | Specific | "Create internal/auth/middleware.go con validación JWT" | "Add auth" |
> | Actionable | "Add ValidateToken() a AuthService" | "Handle tokens" |
> | Verifiable | "Test: POST /login retorna 401 sin token" | "Make sure it works" |
> | Small | Un archivo o una unidad lógica | "Implement the feature" |

### FASE 0 — Branch Setup
- [ ] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [ ] Verificar que el branch NO existe: `git branch --list feat/vX.Y-{name}`
- [ ] Crear y cambiar al branch: `git checkout -b feat/vX.Y-{name}`
- [ ] Confirmar branch activo: `git status`
- [ ] Documentar en Return Envelope: branch confirmado ✅
**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

### FASE 1 — [Nombre de la Fase 1]
> Objetivo: [Objetivo de esta fase]
- [ ] [Tarea específica 1]
- [ ] [Tarea específica 2]
**🚫 Restricciones:** [Ej: No modificar código fuente, solo tests.]

---

<OPTIONAL_DOC_UPDATE>

> **[SISTEMA — ORQUESTADOR — DECISIÓN REQUERIDA]**
> Analiza los cambios de esta feature contra el índice de abajo. Si algún doc cubre exactamente lo que cambió → Añade esta fase con tareas concretas. Si ninguno aplica → **elimina este bloque completo del archivo para que no gaste tokens de más.**
> **Regla de contexto:** NO abras ningún doc del índice todavía. La columna "Aplica si..." es suficiente para decidir. Solo abre el archivo en el momento exacto de editarlo.

## 📚 Índice de Docs Vivos
| # | Doc | Cubre | Aplica si... |
|---|-----|-------|--------------|
| 1 | `ruta/archivo` | Descripción | Cuándo aplica modificar | 

### FASE N+1 — Doc-Update [ORQUESTADOR — Inline]
> Completar SOLO si al menos un doc del índice aplica. Para cada doc afectado, identificar la sección exacta y qué debe cambiar.
- [ ] **Doc [#N]** — `{ruta}`: Actualizar sección `{sección exacta}` → `{qué dice ahora vs. qué debe decir}`
**🚫 Restricción:** Abrir cada archivo SOLO en el momento de editarlo (Safe-Contexting). No cargar todo el índice a la vez.

</OPTIONAL_DOC_UPDATE>

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Doc-Ops [ORQUESTADOR — Inline, modelo actual]
> **Objetivo:** Producir todos los artefactos de la release y ejecutar los archivados. El Orquestador lo hace inline mientras el contexto está fresco — no se delega a un Worker. Si alguna task no aplica para la feature, eliminar el checklist correspondiente.
> **Modelo:** El que está activo en la sesión actual (contexto ya cargado = cero transcripción).

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Tests [CONDICIONAL]:** ¿Esta feature modificó código fuente testeable (comandos, utils, lógica de negocio)?
  - **SÍ aplica →** Ejecutar la suite completa antes de archivar: `pnpm run test` (o el script del proyecto). Si falla → PARAR y resolver el bug antes de continuar. El push nunca parte de una base rota.
  - **NO aplica →** Marcar como `[OMITIDO: sin cambios en código fuente — solo docs/templates/config]`.
- [ ] **Release Notes:** Generar notas de release en la ubicación acordada para el proyecto.
- [ ] **Versión:** Actualizar manifest (`package.json` u otro) a la nueva versión.
- [ ] **Archivado:** Mover `openspec/changes/{feature}/` → `openspec/archive/{version}-{feature}/`. Ejecutar AHORA (antes del Worker).
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (versión, rama, estado estable).
- [ ] **Preparar datos para Git-Ops:** Declarar en este mismo `tasks.md` (sección Git-Ops abajo): versión, mensaje de commit, nombre del branch, mensaje del tag.



> ⚠️ **Regla de oro:** Todo lo que requiere criterio o genera texto → Orquestador inline. Todo lo mecánico post-archivado → Ejecución por el Humano.

---

### FASE X+1 — Git-Ops [HUMANO — Ejecución local]
> **Objetivo:** Comandos git puros en la terminal local del Humano.
> **Razón arquitectónica:** Evita la contaminación de contexto (Context Pollution) en el Orquestador generada por las respuestas de comandos en la terminal de IA, y elimina el overhead innecesario de despachar un subagente pesado para tareas mecánicas secuenciales.
> **Acción del Orquestador:** Al terminar la Fase X (Doc-Ops), el Orquestador DEBE resolver e imprimir un bloque de código Markdown con los comandos listos para copiar y pegar (con las variables reales ya completadas).

**🚨 CHECKLIST GIT-OPS (HUMANO - COPIAR Y PEGAR):**
- [ ] **Verificar estado:** `git status` — confirmar limpio y que no haya archivos inesperados fuera de stage.
- [ ] **Commit:** `git add -A && git commit -m "{mensaje declarado por Orquestador}"`
- [ ] **Merge:** `git checkout main && git merge --no-ff {branch-declarado}`
- [ ] **Tag:** `git tag -a {version} -m "{mensaje-declarado}"`
- [ ] **Push:** `git push origin main --tags`
- [ ] **Limpieza (Opcional):** `git branch -d {branch-declarado}`

> ⚠️ Esta fase es de ejecución puramente humana y local. Al finalizar el push, notificar al Orquestador en un chat nuevo para iniciar la planificación del siguiente ciclo.


</MANDATORY_RELEASE_PROTOCOL>

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `report.md` con:

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
> 1. ¿`worker-handoff.md` generado en `openspec/changes/{feature}/`? Si **NO** → generarlo AHORA. No se delega ninguna fase sin handoff.
> 2. ¿Revisaste el Orchestration Checklist (items 0–4) en `.agents/rules/sdd-orchestrator.md`? Si **NO** → leerlo antes de continuar.
> 3. Solo después de confirmar los dos puntos anteriores, instruir al humano: *"Cierra este chat, abre uno nuevo y dime: `@openspec/changes/{feature}/worker-handoff.md Ejecuta la Fase N`"*
