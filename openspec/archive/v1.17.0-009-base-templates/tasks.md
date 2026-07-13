# Tasks: 009 - Base Project Templates & Customization

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/v1.17.0-009-base-templates`
**Ref:** `proposal.md`

> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verificá el Planning Checklist en `.agents/rules/sdd-orchestrator.md`. Generá un `worker-handoff.md` basado en `funky-cli/src/templates/sdd/worker-handoff.md`. **NO delegues mediante prompts en el chat.**

> **[SISTEMA - PREREQUISITO]** ¿Existe `sdd-spec.md` en esta misma carpeta (`docs/openspec/changes/{feature}/`)? Si **NO** existe → **PARAR. Generarlo primero.** El `tasks.md` sin `spec.md` es construir sin plano arquitectónico.

---

## ✅ Checklist de Ejecución

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [ ] Verificar que git está disponible: `git --version`
- [ ] Verificar que el branch NO existe: `git branch --list feature/v1.17.0-009-base-templates`
- [ ] Crear y cambiar al branch: `git checkout -b feature/v1.17.0-009-base-templates`
- [ ] Confirmar branch activo: `git status`
- [ ] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

### FASE 1 — Aislamiento y Backup Legacy (Worker T1)
> Objetivo: Aislar el workspace de `funky-ai` copiando TODOS los templates a `.agents/templates`. Esto servirá como motor seguro para el Orquestador y como backup histórico/legacy inmutable de los templates originales pre-limpieza (incluyendo las rules, sdd, y roots).

- [ ] Crear directorio `.agents/templates/` si no existe.
- [ ] Copiar recursivamente todos los archivos y subcarpetas de `funky-cli/src/templates/` hacia `.agents/templates/`.
- [ ] Modificar `.agents/rules/sdd-orchestrator.md` para reemplazar la cadena `funky-cli/src/templates/` por `.agents/templates/` en todo el documento.

**🚫 Restricciones:** No alterar ni borrar ningún archivo dentro de `funky-cli/src/templates/` en esta fase.

---

### FASE 2 — Creación de TEMPLATE_GUIDE (Worker T2)
> Objetivo: Redactar la guía de customización agnóstica para proyectos nuevos, implementando el concepto de Progressive Disclosure.

- [ ] Crear `funky-cli/src/templates/bootstrap/TEMPLATE_GUIDE.md` siguiendo las definiciones establecidas en el `spec.md` y documentando cómo el Orquestador o el equipo debe mutar el `tasks.md` local luego del Arch-Assessment.

---

### FASE 3 — Agnostización de Templates (Worker T2)
> Objetivo: Purgar la basura y el acoplamiento dentro de los templates públicos de `funky-cli/src/templates/` dejándolos como un esqueleto base limpio.

- [ ] Editar `funky-cli/src/templates/sdd/tasks.md` para remover acoplamiento específico de funky-ai. Dejar un esqueleto conformado por la FASE 0, los invariantes estructurales y el RETURN ENVELOPE intacto.
- [ ] Editar `funky-cli/src/templates/README.md` para remover la documentación explícita de uso del CLI, convirtiéndolo en un Architecture Hub vacío.

---

### FASE 4 — Refactor del Comando Init (Worker T2)
> Objetivo: Conectar los nuevos archivos (especialmente la guía) al pipeline de inyección del comando `funky init`.

- [ ] Identificar y actualizar el código fuente en `funky-cli` (probablemente `src/commands/init.js` o funciones utils de plantillas) para asegurar que la inyección inicial incorpore el `TEMPLATE_GUIDE.md` correctamente al proyecto destino.

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Doc-Ops [ORQUESTADOR — Inline, modelo actual]
> **Objetivo:** Producir todos los artefactos de la release y ejecutar los archivados. El Orquestador lo hace inline mientras el contexto está fresco — no se delega a un Worker.
> **Modelo:** El que está activo en la sesión actual (contexto ya cargado = cero transcripción).

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Release Notes:** Generar `docs/funky-ai/releases/v1.17.0-release.md` usando como base `funky-cli/src/templates/release.md`. *(Redactar para consumo humano. IGNORAR Token Diet aquí.)*
- [ ] **README:** Actualizar `README.md` raíz manteniéndolo como Architecture Hub (template: `funky-cli/src/templates/README.md`).
- [ ] **CLI Docs:** SI la release incluyó nuevos comandos o flags → actualizar tabla en `funky-cli/README.md`. Si no → `[OMITIDO: sin nuevos comandos]`.
- [ ] **Package.json:** Bumpar `"version"` en `funky-cli/package.json` a la nueva versión.
- [ ] **Archivado:** Mover `docs/openspec/changes/009-base-templates/` → `docs/openspec/archive/v1.17.0-009-base-templates/`. Ejecutar AHORA (antes del Worker).
- [ ] **RFCs:** Decidir qué RFCs fueron implementados en esta release → moverlos a `docs/openspec/archive/`. Ejecutar AHORA. (`proposals/` está deprecado — no usar).
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (versión, rama, estado estable).
- [ ] **Preparar datos para Worker Git-Ops:** Declarar en el handoff: versión exacta, mensaje de commit, nombre del branch, mensaje del tag.

> ⚠️ **Regla de oro:** Todo lo que requiere criterio o genera texto → Orquestador inline. Todo lo mecánico post-archivado → Worker Git-Ops.

---

### FASE X+1 — Git-Ops [Worker T1 — ⚡ Flash / Haiku]
> **Objetivo:** Comandos git puros. Sin edición de archivos, sin redacción, sin decisiones.
> **Modelo:** Flash / Haiku — el más liviano disponible. Si comete un error → documentar y PARAR.
> **Prerequisito:** El Orquestador completó la Fase Doc-Ops y los archivados ya están ejecutados.

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
