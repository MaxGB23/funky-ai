# Tasks: 017 — Enforcement de Handoff Contract (Agent DRY)

**Estado:** ✅ COMPLETADO — v1.16.0
**Rama:** `feat/v1.16.0-017-handoff-enforcement`
**Ref:** `sdd-proposal.md`

> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verificá el Planning Checklist en `.agents/rules/sdd-orchestrator.md`. Generá un `worker-handoff.md` basado en `funky-cli/src/templates/sdd/worker-handoff.md`. **NO delegues mediante prompts en el chat.**

> **[SISTEMA - PREREQUISITO]** ¿Existe `sdd-spec.md` en esta misma carpeta (`docs/openspec/changes/017-handoff-enforcement/`)? Si **NO** existe → **PARAR. Generarlo primero.** El `tasks.md` sin `spec.md` es construir sin plano arquitectónico.

---

## ✅ Checklist de Ejecución

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [x] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [x] Verificar que el branch NO existe: `git branch --list feat/v1.16.0-017-handoff-enforcement`
- [x] Crear y cambiar al branch: `git checkout -b feat/v1.16.0-017-handoff-enforcement`
- [x] Confirmar branch activo: `git status`
- [x] Documentar en Return Envelope: branch confirmado ✅

> ⚠️ **NOTA POST-MORTEM:** La Fase 0 no fue ejecutada como fase separada por un Worker T1. El branch fue creado dentro de la Fase 3 Git-Ops. Esto es una desviación del protocolo — FASE 0 debería preceder a cualquier cambio en el código/docs.

**🚫 Restricciones:** No modificar ningún archivo de código o markdown. Esta fase es SOLO setup de git.

---

### FASE 1 — Enforcement en Regla del Orquestador [T1]
> Objetivo: Reemplazar la sección de delegación en `.agents/rules/sdd-orchestrator.md` por un Return Statement bloqueante con 3 gates explícitos (G1/G2/G3), y registrar la decisión en el engram.

- [x] En `.agents/rules/sdd-orchestrator.md`, reemplazar la sección `## Protocolo de Delegación (MANDATORY)` por `## 🔴 Return Statement — Delegación (MANDATORY — BLOCKING)` con la tabla de gates G1/G2/G3 según `sdd-spec.md §2.1`.
- [x] En `.agents/rules/sdd-orchestrator.md`, en el Planning Checklist eliminar la fila del ítem `#2` (generación del handoff) y re-numerar las filas restantes (0, 1, 2) — ver `sdd-spec.md §2.2`.
- [x] En `docs/engram/discoveries.md`, agregar entrada `### [handoff-as-return-statement]` con schema (What / Why / Where / Learned) — ver `sdd-spec.md §3`.
- [x] En `docs/engram/index.md`, agregar fila `| [handoff-as-return-statement] | ... |` en la tabla Discoveries — ver `sdd-spec.md §3`.

**🚫 Restricciones:** No modificar archivos fuera de los 3 indicados. No tocar el template `funky-cli/src/templates/sdd/worker-handoff.md` — ese ya es correcto. Si encontrás inconsistencias en otros archivos → documentarlas en `sdd-report.md`, no corregirlas.

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE 2 — Doc-Ops [ORQUESTADOR — Inline, modelo actual]
> **Objetivo:** Producir todos los artefactos de la release y ejecutar los archivados. El Orquestador lo hace inline mientras el contexto está fresco — no se delega a un Worker.
> **Modelo:** El que está activo en la sesión actual (contexto ya cargado = cero transcripción).

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [x] **Release Notes:** Generar `docs/funky-ai/releases/v1.16.0-release.md` usando como base `funky-cli/src/templates/release.md`. *(Redactar para consumo humano. IGNORAR Token Diet aquí.)*
- [x] **README:** Actualizar `README.md` raíz manteniéndolo como Architecture Hub (template: `funky-cli/src/templates/README.md`). Ejecutado post-auditoría del tasks.md: título bumpeado a v1.16.0, Estado del Arte actualizado con mención al Return Statement bloqueante, tabla Releases con v1.16.0 como Actual.
- [OMITIDO: sin nuevos comandos] **CLI Docs**
- [x] **Package.json:** Bumpar `"version"` en `funky-cli/package.json` a `1.16.0`.
- [x] **Archivado:** Mover `docs/openspec/changes/017-handoff-enforcement/` → `docs/openspec/archive/v1.16.0-017-handoff-enforcement/`. Ejecutar AHORA (antes del Worker).
- [OMITIDO: sin RFCs relacionados] **RFCs**
- [x] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (versión → v1.16.0, rama → main, estado estable).
- [x] **Preparar datos para Worker Git-Ops:** Declarar en el handoff de Fase 3: versión `v1.16.0`, mensaje de commit `feat(rules): enforce handoff as return statement (#017)`, branch `feat/v1.16.0-017-handoff-enforcement`, mensaje del tag `v1.16.0`.

> ⚠️ **Regla de oro:** Todo lo que requiere criterio o genera texto → Orquestador inline. Todo lo mecánico post-archivado → Worker Git-Ops.

---

### FASE 3 — Git-Ops [Worker T1 — ⚡ Flash / Haiku]
> **Objetivo:** Comandos git puros. Sin edición de archivos, sin redacción, sin decisiones.
> **Modelo:** Flash / Haiku — el más liviano disponible. Si comete un error → documentar y PARAR.
> **Prerequisito:** El Orquestador completó la Fase 2 Doc-Ops y los archivados ya están ejecutados.

**🚨 CHECKLIST GIT-OPS (OBLIGATORIO - NO OMITIR):**
- [x] **Verificar estado:** `git status` — confirmar limpio. Si hay archivos inesperados → documentar y PARAR.
- [x] **Commit:** `git add -A && git commit -m "feat(rules): enforce handoff as return statement (#017)"`
- [x] **Merge:** `git checkout main && git merge --no-ff feat/v1.16.0-017-handoff-enforcement`
- [x] **Tag:** `git tag -a v1.16.0 -m "v1.16.0"`
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
> 1. ¿`worker-handoff.md` generado en `docs/openspec/changes/017-handoff-enforcement/`? Si **NO** → generarlo AHORA. No se delega ninguna fase sin handoff.
> 2. ¿Revisaste el Planning Checklist (items 0–4) en `.agents/rules/sdd-orchestrator.md`? Si **NO** → leerlo antes de continuar.
> 3. Solo después de confirmar los dos puntos anteriores, instruir al humano: *"Cerrá este chat, abrí uno nuevo y decime: `@docs/openspec/changes/017-handoff-enforcement/worker-handoff.md Ejecutá la Fase N`"*
