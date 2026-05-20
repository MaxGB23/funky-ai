# Tasks: 016 Environment Selector

**Estado:** 🟡 NO INICIADO
**Rama:** `feature/v2.2.0-016-environment-selector`
**Ref:** `sdd-proposal.md`

> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verificá el Planning Checklist en `.agents/rules/sdd-orchestrator.md`. Generá un `worker-handoff.md` basado en `funky-cli/src/templates/sdd/worker-handoff.md`. **NO delegues mediante prompts en el chat.**

> **[SISTEMA - PREREQUISITO]** ¿Existe `spec.md` en esta misma carpeta (`docs/openspec/changes/{feature}/`)? Si **NO** existe → **PARAR. Generarlo primero.** El `tasks.md` sin `spec.md` es construir sin plano arquitectónico.

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

- [x] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [x] Verificar que el branch NO existe: `git branch --list feature/v2.2.0-016-environment-selector`
- [x] Crear y cambiar al branch: `git checkout -b feature/v2.2.0-016-environment-selector`
- [x] Confirmar branch activo: `git status`
- [x] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

### FASE 1 — Estructuración de Templates (Worker) [T1]
> Objetivo: Separar físicamente los directorios base para IDE y CLI.

- [x] Crear directorios `ide/` y `cli/` en `funky-cli/src/templates/bootstrap/`.
- [x] Mover reglas actuales del Orquestador y Engram a la carpeta `ide/`.
- [x] Crear copias de esas reglas en `cli/` y actualizarlas con las reglas específicas asíncronas / warm-up.

---

### FASE 2 — Refactorización Core de `runInit` (Worker) [T2]
> Objetivo: Parametrizar el motor de copiado.

- [x] Modificar la función pura `runInit` en `funky-cli/src/commands/init.js` para recibir la variable `environment`.
- [x] Modificar las rutas estáticas para inyectar la variable dinámicamente en el source path.

---

### FASE 3 — Inyección Interactiva en CLI [⚠️ RIESGO ALTO - Sugiero protocolo: devil-advocate.md] [T2]
> Objetivo: Proveer la UI inicial para la selección de entorno.

- [x] Añadir prompt de selección `p.select` al inicio del `initCommand` en `funky-cli/src/commands/init.js`.

---

### FASE 4 — Pruebas Unitarias (Worker) [T2]
> Objetivo: Garantizar la retrocompatibilidad y la inyección correcta por rama.

- [x] Validar o añadir pruebas para `runInit` considerando el pasaje por defecto (`'ide'`) y el pasaje explícito (`'cli'`).

---

<OPTIONAL_DOC_UPDATE>

### FASE 5 — Doc-Update [ORQUESTADOR — Inline]
> Actualización de la documentación viva basada en el impacto de la separación IDE/CLI.

- [x] **Doc [#1]** — `docs/funky-ai/operaciones/funky-init-flow.md`: Actualizar árbol de decisión de `funky init` → Incluir el nuevo prompt de entorno (IDE/CLI) y la separación de carpetas `bootstrap/ide` y `bootstrap/cli`.
- [x] **Doc [#3]** — `funky-cli/README.md`: Actualizar estructura resultante del `funky init` → Reflejar cómo se copian las reglas dependiendo del entorno.
- [x] **Doc [#7]** — `docs/funky-ai/operaciones/escenarios-de-uso.md`: Actualizar flujos → Añadir el paso de selección de entorno al inicio de los escenarios.

**🚫 Restricción:** Abrir cada archivo SOLO en el momento de editarlo (Safe-Contexting). No cargar todo el índice a la vez.

</OPTIONAL_DOC_UPDATE>

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Doc-Ops [ORQUESTADOR — Inline, modelo actual]
> **Objetivo:** Producir todos los artefactos de la release y ejecutar los archivados. El Orquestador lo hace inline mientras el contexto está fresco — no se delega a un Worker.
> **Modelo:** El que está activo en la sesión actual (contexto ya cargado = cero transcripción).

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [x] **Tests [CONDICIONAL]:** ¿Esta feature modificó código fuente testeable? 
  - **SÍ aplica →** Ejecutar la suite completa antes de archivar: `pnpm run test` en funky-cli/. Si falla → PARAR y resolver el bug. (✅ Pasaron 42/42 tests)
- [x] **Release Notes:** Generar `docs/funky-ai/releases/v2.2.0-release.md` usando como base `funky-cli/src/templates/release.md`.
- [x] **README [CONDICIONAL]:** `[OMITIDO: sin cambios estructurales]`.
- [x] **CLI Docs:** SI la release incluyó nuevos comandos o flags → actualizar tabla en `funky-cli/README.md`. Si no → `[OMITIDO: sin nuevos comandos]`. (✅ Se actualizó la tabla con el soporte interactivo de funky init)
- [x] **Package.json:** Bumpar `"version"` en `funky-cli/package.json` a la nueva versión (v2.2.0).
- [x] **Archivado:** Mover `docs/openspec/changes/016-environment-selector/` → `docs/openspec/archive/v2.2.0-016-environment-selector/`. Ejecutar AHORA (antes del Worker).
- [x] **RFCs:** `[OMITIDO: sin RFCs a archivar]`.
- [x] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (versión, rama, estado estable).
- [x] **Smoke Test [CONDICIONAL]:** `[OMITIDO: sin cambios de integración E2E críticos]`.
- [x] **Preparar datos para Git-Ops:** Declarar en este mismo `tasks.md` (sección Git-Ops abajo): versión `v2.2.0`, mensaje de commit, nombre del branch `feature/v2.2.0-016-environment-selector`, mensaje del tag.

> ⚠️ **Regla de oro:** Todo lo que requiere criterio o genera texto → Orquestador inline. Todo lo mecánico post-archivado → Worker Git-Ops.

---

### FASE X+1 — Git-Ops [Worker T1 — ⚡ Flash / Haiku]
> **Objetivo:** Comandos git puros. Sin edición de archivos, sin redacción, sin decisiones.

> 💡 **Invocación directa (sin handoff separado):**
> `/funky-worker @docs/openspec/archive/v2.2.0-016-environment-selector/tasks.md Ejecutá el Git-Ops`

**🚨 CHECKLIST GIT-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Verificar estado:** `git status` — confirmar limpio. Si hay archivos inesperados → documentar y PARAR.
- [ ] **Commit:** `git add -A && git commit -m "feat(cli): selector interactivo de entorno IDE vs CLI"`
- [ ] **Merge:** `git checkout main && git merge --no-ff feature/v2.2.0-016-environment-selector`
- [ ] **Tag:** `git tag -a v2.2.0 -m "Release v2.2.0: Environment Selector"`
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
