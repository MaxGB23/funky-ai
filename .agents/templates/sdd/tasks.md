# Tasks: [Nombre de la Funcionalidad o Cambio]

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/nombre-del-branch`
**Ref:** `sdd-proposal.md`

> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verificá el Planning Checklist en `.agents/rules/sdd-orchestrator.md`. Generá un `worker-handoff.md` basado en `funky-cli/src/templates/sdd/worker-handoff.md`. **NO delegues mediante prompts en el chat.**

> **[SISTEMA - PREREQUISITO]** ¿Existe `sdd-spec.md` en esta misma carpeta (`docs/openspec/changes/{feature}/`)? Si **NO** existe → **PARAR. Generarlo primero.** El `tasks.md` sin `spec.md` es construir sin plano arquitectónico.

---

## ✅ Checklist de Ejecución

> **[SISTEMA — ORQUESTADOR — ENFORCEMENT]** Al completar cada ítem:
> 1. Marcarlo `[x]` en este archivo **INMEDIATAMENTE**.
> 2. Guardar el archivo al disco antes de continuar al siguiente ítem.
> Un `tasks.md` desactualizado = próxima sesión ciega. Sin excusas.
>
> **[SISTEMA — PARA EL ORQUESTADOR]** Antes de redactar o delegar las Fases, leé `.agents/protocols/index.md` para evaluar el riesgo. Si una fase es compleja o de alto riesgo, etiquetá su título con `[⚠️ RIESGO ALTO - Sugiero protocolo: nombre-del-protocolo]`.

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [ ] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [ ] Verificar que el branch NO existe: `git branch --list feat/vX.Y-{name}`
- [ ] Crear y cambiar al branch: `git checkout -b feat/vX.Y-{name}`
- [ ] Confirmar branch activo: `git status`
- [ ] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

### FASE 1 — [Nombre de la Fase 1] (Worker)
> Objetivo: [Objetivo de esta fase]

- [ ] [Tarea específica 1]
- [ ] [Tarea específica 2]

**🚫 Restricciones:** [Ej: No modificar código fuente, solo tests.]

---

<OPTIONAL_DOC_UPDATE>

> **[SISTEMA — ORQUESTADOR — DECISIÓN REQUERIDA]**
> Analizá los cambios de esta feature contra el índice de abajo. Si algún doc cubre exactamente lo que cambió → expandí esta fase con tareas concretas. Si ninguno aplica → **eliminá este bloque completo del archivo.**
> **Regla de contexto:** NO abras ningún doc del índice todavía. La columna "Aplica si..." es suficiente para decidir. Solo abrís el archivo en el momento exacto de editarlo.

### 📚 Índice de Docs Vivos

| # | Doc | Cubre | Aplica si... |
|---|-----|-------|--------------|
| 1 | `docs/funky-ai/operaciones/funky-init-flow.md` | Árbol de decisión de `funky init`, tabla de archivos estáticos del bootstrap, modos Headless / Interactivo / `--template` | Se modificó `init.js`, cambió qué archivos copia el bootstrap, o cambió el comportamiento del flag `--template` o modo Headless |
| 2 | `docs/funky-ai/operaciones/guia-flujo-completo.md` | Ciclo de vida end-to-end: exploración → init → phase → workers → release, con comandos y output esperado | Cambió la secuencia de comandos recomendada, se agregó un nuevo modo o flag al CLI, o cambió el flujo de uso habitual |
| 3 | `funky-cli/README.md` | Tabla de comandos y flags disponibles, fases SDD, estructura de carpetas resultante del `funky init` | Se agregó, modificó o eliminó un comando, flag o fase SDD del CLI |
| 4 | `docs/funky-ai/guias/funky-ai.md` | Pilares del ecosistema, Tiers de complejidad (T0–T3), criterio de decisión Chat vs SDD | Cambió la arquitectura conceptual del protocolo Funky AI o se añadió un pilar nuevo |
| 5 | `docs/funky-ai/operaciones/cli-simulations.md` | Vectores de falla conocidos y simulaciones de bugs del CLI | Se encontró un nuevo vector de falla, se cerró uno existente, o se modificó el comportamiento ante errores |
| 6 | `funky-cli/src/templates/bootstrap/canvas-planning-guide.md` | Opciones disponibles para cada campo de PROJECT-CANVAS e INFRA-CANVAS | Se agregaron / eliminaron opciones en los Canvas o cambió el schema de alguno |
| 7 | `docs/funky-ai/operaciones/escenarios-de-uso.md` | Escenarios de uso del CLI mapeados al estado inicial del usuario (sin definir, definido, repo existente) | Se agrega un nuevo comando o modo al CLI que cambia alguno de los flujos de entrada |

### FASE N+1 — Doc-Update [ORQUESTADOR — Inline]
> Completar SOLO si al menos un doc del índice aplica. Para cada doc afectado, identificar la sección exacta y qué debe cambiar.

- [ ] **Doc [#N]** — `{ruta}`: Actualizar sección `{sección exacta}` → `{qué dice ahora vs. qué debe decir}`

**🚫 Restricción:** Abrir cada archivo SOLO en el momento de editarlo (Safe-Contexting). No cargar todo el índice a la vez.

</OPTIONAL_DOC_UPDATE>

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
- [ ] **Preparar datos para Git-Ops:** Declarar en este mismo `tasks.md` (sección Git-Ops abajo): versión exacta, mensaje de commit, nombre del branch, mensaje del tag. El Worker puede recibir este archivo directamente — no se necesita `worker-handoff.md` separado para T1 git puro.

> ⚠️ **Regla de oro:** Todo lo que requiere criterio o genera texto → Orquestador inline. Todo lo mecánico post-archivado → Worker Git-Ops.

---

### FASE X+1 — Git-Ops [Worker T1 — ⚡ Flash / Haiku]
> **Objetivo:** Comandos git puros. Sin edición de archivos, sin redacción, sin decisiones.
> **Modelo:** Flash / Haiku — el más liviano disponible. Si comete un error → documentar y PARAR.
> **Prerequisito:** El Orquestador completó la Fase Doc-Ops y los archivados ya están ejecutados.

> 💡 **Invocación directa (sin handoff separado):**
> `/funky-worker @docs/openspec/archive/{feature}/tasks.md Ejecutá el Git-Ops`

**🚨 CHECKLIST GIT-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Verificar estado:** `git status` — confirmar limpio. Si hay archivos inesperados → documentar y PARAR.
- [ ] **Commit:** `git add -A && git commit -m "{mensaje declarado por Orquestador}"`
- [ ] **Merge:** `git checkout main && git merge --no-ff {branch-declarado}`
- [ ] **Tag:** `git tag -a {version} -m "{mensaje-declarado}"`
- [ ] **Push:** `git push origin main --tags`

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
> 3. Solo después de confirmar los dos puntos anteriores, instruir al humano: *"Cerrá este chat, abrí uno nuevo y decíme: `@docs/openspec/changes/{feature}/worker-handoff.md Ejecutá la Fase N`"*
