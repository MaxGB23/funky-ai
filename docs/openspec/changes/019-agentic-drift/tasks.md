# Tasks: CLI Stateful Wizard (Agentic Drift Prevention)

**Estado:** 🟡 PENDIENTE
**Rama:** `feat/v3.0-019-agentic-drift`
**Ref:** `proposal.md`, `spec.md`

> **[SISTEMA - PARA EL ORQUESTADOR]** Antes de delegar la primera fase, verificá el Planning Checklist en `.agents/rules/sdd-orchestrator.md`. Generá un `worker-handoff.md` basado en `funky-cli/src/templates/sdd/worker-handoff.md`. **NO delegues mediante prompts en el chat.**

> **[SISTEMA - PREREQUISITO]** ¿Existe `spec.md` en esta misma carpeta (`docs/openspec/changes/{feature}/`)? Si **NO** existe → **PARAR. Generarlo primero.** El `tasks.md` sin `spec.md` es construir sin plano arquitectónico.

---

## ✅ Checklist de Ejecución

> **[SISTEMA — ORQUESTADOR — ENFORCEMENT]** Al completar cada ítem:
> 1. Marcarlo `[x]` en este archivo **INMEDIATAMENTE**.
> 2. Guardar el archivo al disco antes de continuar al siguiente ítem.
> Un `tasks.md` desactualizado = próxima sesión ciega. Sin excusas.
>
> **[SISTEMA — PARA EL ORQUESTADOR]** Si detectás que una fase tiene lógica de negocio compleja o decisiones de diseño críticas, limitate a etiquetar su título con `[⚠️ RIESGO ALTO]`. El humano decidirá el protocolo a seguir.

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [ ] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [ ] Verificar que el branch NO existe: `git branch --list feat/v2.4-agentic-drift`
- [ ] Crear y cambiar al branch: `git checkout -b feat/v2.4-agentic-drift`
- [ ] Confirmar branch activo: `git status`
- [ ] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

### FASE 1 — Templates & Protocols Setup (Worker)
> Objetivo: Actualizar los templates SDD base e inyectar los nuevos bloques de protocolo para T3, asegurando compatibilidad con los marcadores.

- [ ] Crear `funky-cli/src/templates/protocols/nfr-analysis.md` (basado en el bloque definido en proposal).
- [ ] Crear `funky-cli/src/templates/protocols/risk-matrix.md` (o `devil-advocate.md` según proposal).
- [ ] Modificar `funky-cli/src/templates/sdd/explore.md` para incluir los marcadores `<!-- T3:NFR_SECTION -->` y `<!-- T3:DEVIL_ADVOCATE -->`.
- [ ] Modificar `funky-cli/src/templates/sdd/tasks.md` para incluir los bloques `<!-- T1:REMOVE -->` y `<!-- /T1:REMOVE -->` alrededor de la estructura innecesaria para T1.
- [ ] Aplicar exactamente las mismas modificaciones a los templates en `.agents/templates/sdd/` (Golden Templates).

**🚫 Restricciones:** No tocar código JS del CLI en esta fase, exclusivamente archivos markdown de templates.

---

### FASE 2 — Refactor CLI Core: Stateful Wizard (Worker) [⚠️ RIESGO ALTO]
> Objetivo: Convertir `funky feature` de un inyector masivo a una máquina de estados interactiva. 

- [ ] Modificar `funky-cli/src/commands/feature.js` para usar `@inquirer/prompts` y solicitar el Tier (`T1`, `T2`, `T3`, `T4`).
- [ ] Implementar la función `injectTemplate(src, dest, tier, protocolsDir)` con la lógica de resolución de marcadores especificada.
- [ ] Implementar el REPL interactivo con comandos `next`, `status`, `exit`, `help`.
- [ ] Implementar la persistencia de estado escribiendo y leyendo el archivo `.funky-session.json`.
- [ ] Implementar `--resume <name>` para restaurar sesión desde `.funky-session.json`.
- [ ] Implementar comportamiento Tier 1 (inyección reducida directa) y Tier 4 (mensaje y redirección a `funky gentle`).

---

### FASE 3 — Auditoría y Actualización de Reglas (Orquestador) [⚠️ CRÍTICO]
> Objetivo: Alinear el comportamiento del agente con la nueva arquitectura del Wizard. Las reglas mandan.

- [ ] Editar `.agents/rules/sdd-orchestrator.md` -> Agregar explícitamente la **PROHIBICIÓN DE OVERWRITE** detallada en el `proposal.md` bajo la sección de Reglas de Escritura.
- [ ] Editar `.agents/rules/sdd-orchestrator.md` -> Actualizar el *Planning Checklist* (ítem 0) para que tenga en cuenta que en T1 el `explore.md` no existirá.
- [ ] Editar `.agents/rules/sdd-orchestrator.md` -> Revisar la regla de `/sdd-explore` para no asumir que los archivos posteriores a `explore.md` ya están creados (dado que el Wizard los bloquea físicamente).

---

<OPTIONAL_DOC_UPDATE>

### FASE 4 — Doc-Update [ORQUESTADOR — Inline]
> Objetivo: Actualizar los documentos vivos impactados por el cambio de flujo del CLI.

- [ ] **Doc [2]** — `docs/funky-ai/operaciones/guia-flujo-completo.md`: Actualizar la sección sobre `funky feature` → Detallar que ahora es un **Stateful Wizard** interactivo, que requiere el uso del comando interno `next` para avanzar de fase, que previene el Batching y que bloquea físicamente los archivos. Mencionar el guardado en `.funky-session.json` y el uso de `--resume`.
- [ ] **Doc [3]** — `funky-cli/README.md`: Actualizar la tabla de comandos → Reflejar que `funky feature <name>` ahora inicia un REPL interactivo y requiere `--resume <name>` para recuperar sesiones.

**🚫 Restricción:** Abrir cada archivo SOLO en el momento de editarlo (Safe-Contexting). No cargar todo el índice a la vez.

</OPTIONAL_DOC_UPDATE>

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Doc-Ops [ORQUESTADOR — Inline]
> **Objetivo:** Producir todos los artefactos de la release y ejecutar los archivados. El Orquestador lo hace inline.

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Tests [CONDICIONAL]:** ¿Esta feature modificó código fuente testeable? 
  - **SÍ aplica →** Ejecutar `pnpm run test`. Si falla → PARAR.
- [ ] **Release Notes:** Generar notas de release detallando el Drift Prevention.
- [ ] **Versión:** Actualizar `package.json` a la versión iterada correspondiente.
- [ ] **Archivado:** Mover `docs/openspec/changes/019-agentic-drift/` → `docs/openspec/archive/{version}-019-agentic-drift/`. Ejecutar AHORA.
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (versión, rama, estado estable).
- [ ] **Preparar datos para Git-Ops:** Declarar abajo versión, mensaje de commit, rama.

---

### FASE X+1 — Git-Ops [HUMANO — Ejecución local]

**🚨 CHECKLIST GIT-OPS (HUMANO - COPIAR Y PEGAR):**
- [ ] **Verificar estado:** `git status`
- [ ] **Commit:** `git add -A && git commit -m "{mensaje declarado por Orquestador}"`
- [ ] **Merge:** `git checkout main && git merge --no-ff {branch-declarado}`
- [ ] **Tag:** `git tag -a {version} -m "{mensaje-declarado}"`
- [ ] **Push:** `git push origin main --tags`
- [ ] **Limpieza:** `git branch -d {branch-declarado}`

</MANDATORY_RELEASE_PROTOCOL>

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `sdd-report.md` con:

> **MANDATORY:** Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems de `MANDATORY_RELEASE_PROTOCOL` marcados como `[x]` o `[OMITIDO: razón]`. Sin este bloque, la Fase NO se considera completa.

```markdown
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (si aplica, usar schema engram)
- **Próxima acción:** (qué debe hacer el Orquestador)
```
