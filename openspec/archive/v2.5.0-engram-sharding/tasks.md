# Tasks: Engram Sharding y Comando Add

**Estado:** 🟢 FASE 4 COMPLETADA
**Rama:** `feature/nombre-del-branch`
**Ref:** `sdd-proposal.md`

> **ORCHESTRATOR GATE**: Si sos el Orquestador — STOP. Do NOT execute these instructions inline. Delegá al worker o sub-agente.

> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verificá el Planning Checklist en `.agents/rules/sdd-orchestrator.md`. El `worker-handoff.md` ya está generado en esta carpeta. Solo debes asignarle el Tier correspondiente. **NO delegues mediante prompts en el chat.**

> **[SISTEMA - PREREQUISITO]** ¿Existe `sdd-spec.md` en esta misma carpeta (`docs/openspec/changes/{feature}/`)? Si **NO** existe → **PARAR. Generarlo primero.** El `tasks.md` sin `spec.md` es construir sin plano arquitectónico.

---

## 📊 Review Workload Forecast

> **[SISTEMA — CONTRATO DE ESTIMACIÓN]**
Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

**Suggested Work Units:**
| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Scaffold & Migration | PR 1 | `scripts/migrate-engram.js` y `init.js` |
| 2 | Engram Command | PR 1 | `engram.js` y `funky.js` |
| 3 | Rules Update | PR 1 | `grep_search` en reglas/templates |
| 4 | Testing | PR 1 | Tests unitarios e integración |

---

## ✅ Checklist de Ejecución

> **[SISTEMA — ORQUESTADOR — ENFORCEMENT]** Al completar cada ítem:
> 1. Marcarlo `[x]` en este archivo **INMEDIATAMENTE**.
> 2. Guardar el archivo al disco antes de continuar al siguiente ítem.
> Un `tasks.md` desactualizado = próxima sesión ciega. Sin excusas.

> **GUARDRAIL DE TAREAS (Budget: ≤ 530 palabras):**
> Cada tarea DEBE cumplir estos criterios:
> | Criteria | ✅ Bien | ❌ Mal |
> |----------|---------|--------|
> | Specific | "Create internal/auth/middleware.go con validación JWT" | "Add auth" |
> | Actionable | "Add ValidateToken() a AuthService" | "Handle tokens" |
> | Verifiable | "Test: POST /login retorna 401 sin token" | "Make sure it works" |
> | Small | Un archivo o una unidad lógica | "Implement the feature" |

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [x] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [x] Verificar que el branch NO existe: `git branch --list feature/engram-sharding`
- [x] Crear y cambiar al branch: `git checkout -b feature/engram-sharding`
- [x] Confirmar branch activo: `git status`
- [x] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

### FASE 1 — Scaffold & Migration (Worker)
> Objetivo: Configurar estructura y migrar engrama heredado.

- [x] 1.1 Modificar `funky-cli/src/commands/init.js` para usar `fs.mkdirSync` y crear carpetas `docs/engram/{architecture,pattern,discovery,decision,bugfix}`.
- [x] 1.2 Crear `scripts/migrate-engram.js` para fragmentar historial heredado de `discoveries.md` y `bugfixes.md` usando heurística de tags.
- [x] 1.3 Ejecutar `scripts/migrate-engram.js` localmente para poblar directorios, indexarlos en `index.md` y eliminar los archivos monolíticos viejos.

**🚫 Restricciones:** No modificar CLI core aún, solo script de migración e `init.js`.

---

### FASE 2 — Core Command Implementation (Worker)
> Objetivo: Implementar el comando `funky engram add`.

- [x] 2.1 Crear `funky-cli/src/commands/engram.js` usando `commander` para soportar flags (`--tag`, `--category`, `--desc`).
- [x] 2.2 Implementar modo interactivo con `@inquirer/prompts` para solicitar datos si no se pasan flags.
- [x] 2.3 Implementar inyección atómica del engrama en la categoría correcta y append automático a `docs/engram/index.md`.
- [x] 2.4 Modificar `funky-cli/bin/funky.js` para registrar el comando `engram`.

**🚫 Restricciones:** Evitar modificar reglas y templates en esta fase.

---

### FASE 3 — Rules & Templates Refactor (Worker)
> Objetivo: Cambiar a modo búsqueda dinámica.

- [x] 3.1 Refactorizar reglas en `.agents/rules/` (ej. `sdd-orchestrator.md`) para usar `grep -ril` o `grep_search` sobre la ruta `docs/engram/`.
- [x] 3.2 Refactorizar templates SDD en `funky-cli/src/templates/sdd/` y `.agents/templates/sdd/` (ej. `worker-handoff.md`) para reflejar las nuevas instrucciones de búsqueda dinámica.

---

### FASE 4 — Testing (Worker)
> Objetivo: Validar la inyección atómica de engramas.

- [x] 4.1 Escribir tests unitarios con Vitest para `runEngramAdd` (mockeando `fs`).
- [x] 4.2 Probar comando `engram add` de forma headless.

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

- [x] **Doc [#1]** — `docs/funky-ai/operaciones/funky-init-flow.md`: Actualizada estructura de carpetas y listado de estáticos.
- [x] **Doc [#2]** — `docs/funky-ai/operaciones/guia-flujo-completo.md`: Actualizado árbol del engrama y comando `funky engram add`.
- [x] **Doc [#3]** — `funky-cli/README.md`: Añadido comando `funky engram add` y árbol de directorios sharded.
- [x] **Doc [#4]** — `docs/funky-ai/guias/funky-ai.md`: Actualizado el pilar Falso Engram con el sharding y `funky engram add`.
- [x] **Doc [#7]** — `docs/funky-ai/operaciones/escenarios-de-uso.md`: Añadido Escenario 4 para inyección de engramas interactiva.

**🚫 Restricción:** Abrir cada archivo SOLO en el momento de editarlo (Safe-Contexting). No cargar todo el índice a la vez.

</OPTIONAL_DOC_UPDATE>

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Doc-Ops [ORQUESTADOR — Inline, modelo actual]
> **Objetivo:** Producir todos los artefactos de la release y ejecutar los archivados. El Orquestador lo hace inline mientras el contexto está fresco — no se delega a un Worker.
> **Modelo:** El que está activo en la sesión actual (contexto ya cargado = cero transcripción).

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [x] **Tests [CONDICIONAL]:** `[OMITIDO: ejecutados exitosamente en Fase 4]`.
- [x] **Release Notes:** Generar `docs/funky-ai/releases/vX.Y.Z-release.md` usando como base `funky-cli/src/templates/release.md`. *(Redactar para consumo humano. IGNORAR Token Diet aquí.)*
- [x] **README [CONDICIONAL]:** `[COMPLETADO en Doc-Update]`.
- [x] **CLI Docs:** `[COMPLETADO en Doc-Update]`.
- [x] **Package.json:** Bumpar `"version"` en `funky-cli/package.json` a la nueva versión (v2.5.0).
- [x] **Archivado:** Mover `docs/openspec/changes/{feature}/` → `docs/openspec/archive/{version}-{feature}/`. Ejecutar AHORA (antes del Worker).
- [x] **RFCs:** Decidir qué RFCs fueron implementados en esta release → moverlos a `docs/openspec/archive/`. Ejecutar AHORA. (`proposals/` está deprecado — no usar).
- [x] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (versión, rama, estado estable).
- [x] **Smoke Test [CONDICIONAL]:** `[OMITIDO: sin cambios de integración E2E]`.
- [x] **Preparar datos para Git-Ops:** 
  - Versión exacta: `v2.5.0`
  - Mensaje de commit: `feat: engram sharding y comando funky engram add`
  - Nombre del branch: `feature/engram-sharding`
  - Mensaje del tag: `release: v2.5.0`

> ⚠️ **Regla de oro:** Todo lo que requiere criterio o genera texto → Orquestador inline. Todo lo mecánico post-archivado → Worker Git-Ops.

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

Al finalizar cada fase, actualizar `sdd-report.md` (o el return envelope del handoff) con:

> **MANDATORY:** Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems de `MANDATORY_RELEASE_PROTOCOL` marcados como `[x]` o `[OMITIDO: razón]`. Sin este bloque, la Fase NO se considera completa. Además de los resultados de testing estructurados.

```markdown
## Return Summary

| Phase | Status | Issues |
|-------|--------|--------|
| [N]   | ✅ Done | None   |

**Workload Forecast Update:**
- Chain Strategy: [Si cambió]
- 400-line risk: [Actual]

**Archivos creados/modificados:** (lista)
**Bugs encontrados:** (si aplica, usar schema engram)
**Próxima acción:** (qué debe hacer el Orquestador)
```

---

> **[SISTEMA — ORQUESTADOR — LEER ANTES DE COMUNICAR AL HUMANO]**
> Antes de escribir cualquier instrucción al humano, verificar **en este orden**:
> 1. ¿`worker-handoff.md` generado en `docs/openspec/changes/{feature}/`? Si **NO** → generarlo AHORA. No se delegada ninguna fase sin handoff.
> 2. ¿Revisaste el Planning Checklist (items 0–4) en `.agents/rules/sdd-orchestrator.md`? Si **NO** → leerlo antes de continuar.
> 3. Solo después de confirmar los dos puntos anteriores, instruir al humano: *"Cerrá este chat, abrí uno nuevo y decíme: `@docs/openspec/changes/{feature}/worker-handoff.md Ejecutá la Fase N`"*
