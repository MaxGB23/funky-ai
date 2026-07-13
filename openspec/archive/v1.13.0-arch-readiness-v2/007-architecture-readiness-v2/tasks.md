# Tasks: Architecture Readiness Gate v2 (007)

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/007-architecture-readiness-v2`
**Ref:** `spec.md`

Este documento detalla las tareas secuenciales para implementar la especificación de la Fase 007.

---

## ✅ Checklist de Ejecución

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [ ] Verificar que git está disponible: `git --version`
- [ ] Verificar que el branch NO existe: `git branch --list feature/007-architecture-readiness-v2`
- [ ] Crear y cambiar al branch: `git checkout -b feature/007-architecture-readiness-v2`
- [ ] Confirmar branch activo: `git status`
- [ ] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

## Fase 1: Actualización de Templates (Modelo de Datos)
El objetivo es extender los archivos markdown base para que incluyan los nuevos requerimientos no funcionales (NFRs).

- [ ] **Tarea 1.1:** Modificar `funky-cli/src/templates/sdd/architecture-assessment.md`.
  - Agregar una nueva sección (ej. "3. Non-Functional Requirements (NFRs)").
  - Incluir los campos obligatorios: Compliance & Data Residency, Expected Peak Concurrency, Team Seniority / Capabilities, Hosting Budget, y SLA & Redundancy.
- [ ] **Tarea 1.2:** Modificar `funky-cli/src/templates/sdd/architecture-review-template.md`.
  - Agregar las variables/placeholders para inyectar los nuevos NFRs.
  - Modificar las instrucciones del prompt para que el LLM actúe como "Devil's Advocate" cruzando los NFRs (por ejemplo, validando SLA vs Budget), tanto si hay errores detectados por el CLI como si no.

## Fase 2: TDD & Parsing
Asegurar que el motor del CLI sepa extraer los nuevos datos del markdown mediante pruebas antes de tocar la lógica principal.

- [ ] **Tarea 2.1:** Modificar/crear tests en `funky-cli/src/commands/__tests__/assess.test.js` (o `assessRules.test.js` según corresponda).
  - Testear que el parser pueda extraer correctamente los valores de "Compliance", "Budget", etc., utilizando las mismas heurísticas de regex/frontmatter actuales.
- [ ] **Tarea 2.2:** Implementar la lógica de parseo en `funky-cli/src/commands/assess.js` para que extraiga los 5 nuevos NFRs y los exponga en el objeto de metadata evaluado.

## Fase 3: Refactor Core `funky assess`
Cambiar el flujo principal para que la revisión arquitectónica de IA sea obligatoria y no opcional.

- [ ] **Tarea 3.1:** Actualizar los tests del flujo principal de `assess.js`.
  - El test debe fallar inicialmente: esperar que la función que escribe `.agents/prompts/architecture-review.md` se llame SIEMPRE, incluso cuando la evaluación de reglas estáticas no devuelve ningún "Challenge".
- [ ] **Tarea 3.2:** Refactorizar `funky-cli/src/commands/assess.js`.
  - Cambiar el bloque `if (challenges.length > 0)` para que siempre genere el prompt.
  - Inyectar al template el array de `challenges` (que puede estar vacío) y el objeto con los NFRs parseados.
- [ ] **Tarea 3.3:** Modificar el mensaje de consola final (Handoff).
  - El CLI debe avisar al humano: *"✅ Evaluación local completa. ⚠️ Generado prompt de revisión arquitectónica obligatoria. Levantá un agente y apuntalo a `.agents/prompts/architecture-review.md`"*.

## Fase 4: Smoke Test
- [ ] **Tarea 4.1:** Ejecutar `funky assess` en un directorio temporal/virgen.
- [ ] **Tarea 4.2:** Verificar visualmente que el prompt generado tiene sentido y los datos están bien inyectados.

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE 5 — Release y Doc-Ops [T1 — Modelo Estándar]
> **Objetivo:** Producir los artefactos de documentación de la release v1.13.0.

**🚨 CHECKLIST DOC-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Package.json:** Actualizar el campo `"version"` en `funky-cli/package.json` a `1.13.0`.
- [ ] **Release Notes:** Generar `docs/funky-ai/releases/v1.13.0-release.md` usando como base `funky-cli/src/templates/release.md`.
- [ ] **README:** Actualizar `README.md` en la raíz (si aplica).
- [ ] **Archivado:** Mover `docs/openspec/changes/007-architecture-readiness-v2/` → `docs/openspec/archive/v1.13.0-arch-readiness-v2/`.
- [ ] **Proposals:** Mover `docs/openspec/proposals/007-architecture-readiness-v2.md` a archive.
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (rama activa `main`, estado estable, versión `v1.13.0`).

---

### FASE 6 — Git-Ops [T1 — ⚡ Modelo Liviano]
> **Objetivo:** Commit, merge, tag y push.

**🚨 CHECKLIST GIT-OPS (OBLIGATORIO - NO OMITIR):**
- [ ] **Verificar estado:** `git status`
- [ ] **Commit:** `git add -A && git commit -m "feat: architecture readiness v2 context expansion (v1.13.0)"`
- [ ] **Merge:** `git checkout main && git merge --no-ff feature/007-architecture-readiness-v2`
- [ ] **Tag:** `git tag -a v1.13.0 -m "release: v1.13.0"`
- [ ] **Push:** `git push origin main && git push origin v1.13.0`

</MANDATORY_RELEASE_PROTOCOL>

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `sdd-report.md` con:

> **MANDATORY:** Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems de `MANDATORY_RELEASE_PROTOCOL` marcados como `[x]` o `[OMITIDO: razón]`. Sin este bloque, la Fase NO se considera completa.

```markdown
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (usar schema engram. OBLIGATORIO: incluir intentos fallidos)
- **Próxima acción:** (qué debe hacer el Orquestador)
```
