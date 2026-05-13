# Tasks: 012-b — Comando `funky gentle <feature>`

**Estado:** ✅ COMPLETADO (Pendiente: Fase 6 Git-Ops)
**Rama:** `feature/v1.20.0-012b-funky-gentle`
**Ref:** `proposal.md`, `explore.md`

> **[SISTEMA - PREREQUISITO]** No existe `spec.md` en esta carpeta — gap conocido (`[silent-spec-skip]`). El proposal.md es suficiente como base dado que el scope está completamente definido en `explore.md` + `proposal.md`.

---

## ✅ Checklist de Ejecución

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras. Delegable a Worker.

- [x] Verificar que git está disponible: `git --version`
- [x] Verificar que el branch NO existe: `git branch --list feature/v1.20.0-012b-funky-gentle`
- [x] Crear y cambiar al branch: `git checkout -b feature/v1.20.0-012b-funky-gentle`
- [x] Confirmar branch activo: `git status`
- [x] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Solo setup de git.

---

### FASE 1 — Templates Gentle (Worker T2)
> **Objetivo:** Crear los 14 templates (7 fallback en CLI + 7 golden en workspace). Cada uno con `<system_prompt>` que bloquee al LLM de salirse de su rol.

**Fallback — `funky-cli/src/templates/gentle/`:**
- [x] Crear `01-explore.md` — rol Explorer. PROHIBIDO: proponer soluciones. Solo mapa de impacto.
- [x] Crear `02-proposal.md` — rol Proposer. PROHIBIDO: diseñar técnicamente. Solo "qué/por qué" (negocio).
- [x] Crear `03-spec.md` — rol Spec Writer. PROHIBIDO: elegir librerías o patrones. Solo requisitos duros y edge cases.
- [x] Crear `04-design.md` — rol Designer. PROHIBIDO: escribir código real. Solo decisiones técnicas (interfaces, patrones, libs).
- [x] Crear `05-tasks.md` — rol Task Planner. PROHIBIDO: implementar. Solo atomic commits.
- [x] Crear `06-implement.md` — rol Implementer. PROHIBIDO: tomar decisiones de arquitectura. Seguir estrictamente `04-design.md`.
- [x] Crear `07-verify.md` — rol Verifier. PROHIBIDO: agregar funcionalidades. Solo validar contra `03-spec.md` y `04-design.md`.

**Golden — `.agents/templates/gentle/`:**
- [x] Copiar los 7 templates desde `funky-cli/src/templates/gentle/` como base inicial.

> ⚠️ Los golden pueden curar/enriquecer el contenido, pero el formato `<system_prompt>` bloqueante es OBLIGATORIO en ambas versiones.

**🚫 Restricciones:** No modificar ningún archivo de comandos JS en esta fase.

---

### FASE 2 — Comando `gentle.js` + Registro (Worker T2)
> **Objetivo:** Crear `gentle.js` y registrarlo en `bin/funky.js`. Blueprint: `feature.js`.

- [x] Crear `funky-cli/src/commands/gentle.js` con función pura `runGentle({ featureName, cliTemplatesDir, cwd })`.
  - Golden: `.agents/templates/gentle/`
  - Fallback: `src/templates/gentle/`
  - Destino: `docs/openspec/gentle/<name>/`
  - Archivos a copiar: `['01-explore.md', '02-proposal.md', '03-spec.md', '04-design.md', '05-tasks.md', '06-implement.md', '07-verify.md']`
  - Contrato de retorno idéntico a `runFeature`: `{ success: boolean, error?: string, path?: string }`
- [x] Agregar import y `addCommand` en `funky-cli/bin/funky.js`.
- [x] Verificar que `funky gentle --help` funciona: `node funky-cli/bin/funky.js gentle --help`

**🚫 Restricciones:** No modificar `feature.js` ni ningún otro comando existente.

---

### FASE 3 — Tests (Worker T2)
> **Objetivo:** Cubrir `gentle.js` con los mismos 4 casos que `feature.test.js`. Actualizar `templates.test.js`.

- [x] Crear `funky-cli/tests/gentle.test.js` con los 4 casos:
  1. Crea directorio y copia los **7 archivos** desde golden templates (`toHaveBeenCalledTimes(7)`)
  2. Usa fallback si golden no existe (verificar que `copyFileSync` apunta a `src/templates/gentle/`)
  3. Sanitiza el nombre de la feature correctamente
  4. Falla si el directorio ya existe
- [x] Actualizar `funky-cli/tests/templates.test.js`: agregar aserciones para que los 7 templates `gentle/` existan en `src/templates/gentle/`.
- [x] Ejecutar suite completa: `pnpm run test` — **✅ 11 suites, 39 tests en verde.**

> ⚠️ Gotcha `[test-mock-drift]`: el mock de `fs.existsSync` debe cubrir los 7 archivos de `gentle/`. Assertar `toHaveBeenCalledTimes(7)` explícitamente.

**🚫 Restricciones:** No modificar tests existentes. Solo agregar.

---

<OPTIONAL_DOC_UPDATE>

> **[SISTEMA — ORQUESTADOR — DECISIÓN REQUERIDA]**
> Analizá los cambios de esta feature contra el índice de abajo. La columna "Aplica si..." es suficiente para decidir.

### 📚 Índice de Docs Vivos

| # | Doc | Cubre | Aplica si... |
|---|-----|-------|--------------|
| 1 | `docs/funky-ai/operaciones/funky-init-flow.md` | Árbol de decisión de `funky init` | Se modificó `init.js` |
| 2 | `docs/funky-ai/operaciones/guia-flujo-completo.md` | Ciclo de vida end-to-end con comandos | Cambió la secuencia de comandos recomendada o se agregó un nuevo modo |
| 3 | `funky-cli/README.md` | Tabla de comandos y flags disponibles | Se agregó, modificó o eliminó un comando |
| 4 | `docs/funky-ai/guias/funky-ai.md` | Pilares del ecosistema, Tiers de complejidad (T0–T3) | Cambió la arquitectura conceptual o se añadió un Tier nuevo |
| 5 | `docs/funky-ai/operaciones/escenarios-de-uso.md` | Escenarios de uso del CLI mapeados al estado inicial | Se agrega un nuevo comando que cambia alguno de los flujos de entrada |

### FASE 4 — Doc-Update [ORQUESTADOR — Inline]
> Docs 2, 3 y 4 aplican (nuevo comando + Tier 4 es un concepto nuevo).

- [x] **Doc [3]** — `funky-cli/README.md`: `funky gentle` agregado a la tabla de comandos. ✅
- [x] **Doc [4]** — `docs/funky-ai/guias/funky-ai.md`: Tier 4 agregado a tabla de Tiers y árbol de decisión. ✅
- [x] **Doc [2]** — `docs/funky-ai/operaciones/guia-flujo-completo.md`: Mapa de flujo y referencia rápida actualizados. ✅

**🚫 Restricción:** Abrir cada archivo SOLO en el momento de editarlo (Safe-Contexting).

</OPTIONAL_DOC_UPDATE>

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE 5 — Doc-Ops [ORQUESTADOR — Inline]
> **Objetivo:** Artefactos de release y archivados. El Orquestador lo hace inline.

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [x] **Tests [CONDICIONAL]:** `pnpm run test` → 11 suites, 39 tests ✅
- [x] **Release Notes:** `docs/funky-ai/historico/releases/v1.20.0-release.md` generado. ✅
- [x] **README raíz:** `README.md` actualizado a v1.20.0 con `funky gentle` en la tabla CLI. ✅
- [x] **CLI Docs:** `funky-cli/README.md` actualizado. ← cubierto en FASE 4. ✅
- [x] **Package.json:** `"version"` bumpeado a `1.20.0`. ✅
- [x] **Archivado feature:** `docs/openspec/changes/012-b/` → `docs/openspec/archive/v1.20.0-012b-funky-gentle/`. ✅
- [x] **Archivado RFC:** `docs/openspec/rfcs/posible-ayuda-012.md.md` → `docs/openspec/archive/posible-ayuda-012-implementado.md`. ✅
- [x] **Sincronización:** `ORCHESTRATOR-STATE.md` actualizado (012.b `[x]`, v1.20.0, rama, estado). ✅
- [x] **Smoke Test [CONDICIONAL]:** Escenario 4 (`funky gentle`) agregado a `master-smoke-test.md`. ✅
- [x] **sync-templates.js:** Ampliado para cubrir `gentle/` — cierra `[cli-template-sync-drift]`. ✅ *(Extra detectado en Doc-Ops)*
- [x] **Preparar datos para Worker Git-Ops:** versión `v1.20.0`, commit `feat(cli): add funky gentle command for Tier 4 Deep SDD`, branch `feature/v1.20.0-012b-funky-gentle`, tag `v1.20.0`. ✅

> ⚠️ **Regla de oro:** Todo lo que requiere criterio → Orquestador inline. Todo lo mecánico post-archivado → Worker Git-Ops.

---

### FASE 6 — Git-Ops [Worker T1 — ⚡ Flash]
> **Objetivo:** Comandos git puros. Sin edición de archivos, sin decisiones.
> **Prerequisito:** Orquestador completó Doc-Ops y archivados.

**🚨 CHECKLIST GIT-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Verificar estado:** `git status` — confirmar limpio. Si hay archivos inesperados → PARAR.
- [ ] **Commit:** `git add -A && git commit -m "feat(cli): add funky gentle command for Tier 4 Deep SDD"`
- [ ] **Merge:** `git checkout main && git merge --no-ff feature/v1.20.0-012b-funky-gentle`
- [ ] **Tag:** `git tag -a v1.20.0 -m "v1.20.0 — funky gentle (Tier 4 Deep SDD)"`
- [ ] **Push:** `git push origin main --tags`

> ⚠️ Esta fase NO edita archivos de texto. Solo git. Si algo falla → documentar en `report.md` y PARAR.

</MANDATORY_RELEASE_PROTOCOL>

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `report.md` con:

> **MANDATORY:** Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems de `MANDATORY_RELEASE_PROTOCOL` marcados como `[x]` o `[OMITIDO: razón]`. Sin este bloque, la Fase NO se considera completa.

```markdown
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (si aplica, usar schema engram. OBLIGATORIO: incluir intentos fallidos y anti-patrones descartados)
- **Próxima acción:** (qué debe hacer el Orquestador)
```

---

> **[SISTEMA — ORQUESTADOR — LEER ANTES DE COMUNICAR AL HUMANO]**
> 1. ¿`worker-handoff.md` generado en `docs/openspec/changes/012-b/`? Si **NO** → generarlo AHORA.
> 2. ¿Revisaste el Planning Checklist en `.agents/rules/sdd-orchestrator.md`? Si **NO** → leerlo.
> 3. Solo entonces instruir: *"Cerrá este chat, abrí uno nuevo y decime: `@docs/openspec/changes/012-b/worker-handoff.md Ejecutá la Fase N`"*
