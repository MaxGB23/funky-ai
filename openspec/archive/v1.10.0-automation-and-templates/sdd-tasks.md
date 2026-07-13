# Tasks: Funky AI v1.10.0 — Phase 0 Automation & Release Templates

**Estado:** 🟡 PENDIENTE
**Rama:** `feat/v1.10-automation-and-templates`
**Ref:** `sdd-proposal.md` | `sdd-spec.md`

---

## ✅ Checklist de Ejecución

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Ejecutable por Worker.

- [ ] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
- [ ] Verificar que el branch NO existe aún: `git branch --list feat/v1.10-automation-and-templates`
- [ ] Crear y cambiar al branch: `git checkout -b feat/v1.10-automation-and-templates`
- [ ] Confirmar branch activo: `git status` (debe mostrar `On branch feat/v1.10-automation-and-templates`)
- [ ] Documentar en Return Envelope: branch confirmado ✅

**🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.

---

### FASE 1 — Phase 0 Template Refactor [T2]
> Objetivo: Refactorizar `funky-cli/src/templates/sdd/tasks.md` para que Fase 0 sea un Worker T1, no una instrucción al Humano.

- [ ] `view_file funky-cli/src/templates/sdd/tasks.md` — leer el estado actual completo
- [ ] Reemplazar el bloque `FASE 0 — Setup (Humano)` con el nuevo bloque `FASE 0 — Branch Setup [T1]`:
  ```markdown
  ### FASE 0 — Branch Setup [T1]
  > **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.
  
  - [ ] Verificar que git está disponible: `git --version` (si falla → documentar en Return Envelope y PARAR)
  - [ ] Verificar que el branch NO existe: `git branch --list feat/vX.Y-{name}`
  - [ ] Crear y cambiar al branch: `git checkout -b feat/vX.Y-{name}`
  - [ ] Confirmar branch activo: `git status`
  - [ ] Documentar en Return Envelope: branch confirmado ✅
  
  **🚫 Restricciones:** No modificar ningún archivo de código. Esta fase es SOLO setup de git.
  ```
- [ ] Verificar que los guardrails v1.8.1 siguen intactos: Tier placeholders, Scope Change Checkpoint, Return Envelope, MANDATORY_RELEASE_PROTOCOL
- [ ] Actualizar `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md` si hace referencia a "Fase 0 — Humano" (verificar con grep_search)
- [ ] Agregar/actualizar test unitario en `funky-cli/tests/` que verifique que `tasks.md` contiene el texto `FASE 0 — Branch Setup [T1]`
- [ ] Ejecutar suite de tests: `npm test` (deben pasar todos)

**🚫 Restricciones:** No modificar `worker-handoff.md` canónico (ya fue refactorizado en v1.9.0). Solo `tasks.md` y tests.

---

### FASE 2 — Release & README Templates + `funky release` [T2]
> Objetivo: Crear los templates canónicos y el comando `funky release <version>`.

#### 2.A — Templates canónicos

- [ ] Crear `funky-cli/src/templates/release.md` con la estructura canónica:
  ```markdown
  # 🚀 Funky AI v{{version}} Release Notes
  
  ## 🌟 Resumen de la Versión
  [Describir en 2-3 párrafos el objetivo de la versión y su contexto histórico]
  
  ### ✨ Nuevas Funcionalidades
  - **[Feature]:** [descripción]
  
  ### 🛠️ Archivos Modificados
  - **`ruta/al/archivo.ext`:** [descripción del cambio]
  
  ### 🧪 Tests
  - [N] tests pasando. [Descripción de qué cubre la suite]
  
  ### 🔒 Guardrails Preservados
  [Si aplica: qué contratos anteriores se mantienen]
  
  ### 🧠 Aprendizajes (Engram)
  - **`[discovery-key]`:** [qué se aprendió]
  ```

- [ ] Crear `funky-cli/src/templates/README.md` con la estructura canónica basada en el README actual del CLI

#### 2.B — Comando `funky release`

- [ ] Crear `funky-cli/src/commands/release.js`:
  - Exportar `{ runRelease }` (consistente con patrón `init.js` / `phase.js`)
  - Validar `version` con regex `^\d+\.\d+\.\d+$`. Si inválido → `console.error` + `process.exit(1)`
  - Verificar que `docs/funky-ai/releases/v{version}-release.md` NO existe (idempotencia). Si existe → abort con mensaje.
  - Leer `funky-cli/src/templates/release.md`
  - Interpolar `{{version}}` y `{{date}}` (ISO date: `new Date().toISOString().split('T')[0]`)
  - Escribir el archivo interpolado en `docs/funky-ai/releases/v{version}-release.md`
  - Log de éxito con la ruta del archivo generado

- [ ] Registrar el comando en `funky-cli/funky.js`:
  ```js
  program
    .command('release <version>')
    .description('Genera release notes desde el template canónico')
    .action(runRelease);
  ```

#### 2.C — Sync y Tests

- [ ] Actualizar `funky-cli/src/utils/sync-templates.js` para incluir `release.md` y `README.md` en la lista de templates sincronizados (prevenir Template Sync Drift)
- [ ] Escribir tests para `runRelease`:
  - Test: versión válida → archivo generado con `{{version}}` interpolado
  - Test: versión inválida (`abc`) → proceso termina con exit code 1
  - Test: release ya existente → abort, no sobreescribe
- [ ] Ejecutar `npm test` (todos los tests deben pasar)

**🚫 Restricciones:** No modificar `init.js` ni `phase.js`. Seguir el patrón exportado existente.

---

### FASE 2.5 — Auditoría y Consolidación de Templates [T3]
> Objetivo: Comparar los nuevos templates canónicos (`release.md` y `README.md`) con los archivos reales existentes en el proyecto para identificar brechas, unificar lo mejor de ambos, y eliminar burocracia inútil.
> **Rol Asignado al Worker:** Arquitecto Senior (15+ años exp). Tu trabajo es ser hiper-crítico.

- [ ] Comparar `funky-cli/src/templates/release.md` contra archivos reales (ej. `docs/funky-ai/releases/v1.7.0-release.md`).
- [ ] Comparar `funky-cli/src/templates/README.md` contra el `README.md` principal del repositorio.
- [ ] Evaluar pragmatismo: ¿Los templates piden datos que nadie llena? ¿Los archivos reales tienen "golden paths" no documentados en el template?
- [ ] Documentar hallazgos y decisiones en `docs/openspec/changes/v1.10.0-automation-and-templates/template-audit.md`.
- [ ] Modificar `funky-cli/src/templates/release.md` y `README.md` aplicando las conclusiones.

**🚫 Restricciones:** No agregar contenido por "completitud teórica". Si no aporta valor táctico, se elimina.

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE 3 — Release y Doc-Ops [T1]
> Objetivo: Merge, tag v1.10.0, y actualización de la deuda documental.

**🚨 CHECKLIST DE RELEASE (OBLIGATORIO - NO OMITIR):**
- [ ] **Release Notes:** Crear `docs/funky-ai/releases/v1.10.0-release.md` usando `funky release 1.10.0` (o manualmente si el comando no está disponible aún)
- [ ] **README:** Actualizar `README.md` con la versión v1.10.0 y el nuevo comando `funky release`
- [ ] **Archivado:** Mover `docs/openspec/changes/v1.10.0-automation-and-templates/` → `docs/openspec/archive/`
- [ ] **Git:** `git add -A && git commit -m "feat: Phase 0 automation + funky release command v1.10.0"`
- [ ] **Git:** `git checkout main && git merge --no-ff feat/v1.10-automation-and-templates`
- [ ] **Git:** `git tag -a v1.10.0 -m "release: v1.10.0"`
- [ ] **Git:** `git push origin main && git push origin v1.10.0`
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` (versión → v1.10.0, estado → estable, pendientes limpiados)

</MANDATORY_RELEASE_PROTOCOL>

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `docs/openspec/changes/v1.10.0-automation-and-templates/sdd-report.md` con:

> **MANDATORY:** Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems de `MANDATORY_RELEASE_PROTOCOL` marcados como `[x]` o `[OMITIDO: razón]`. Sin este bloque, la Fase NO se considera completa.

```markdown
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (si aplica, usar schema engram. OBLIGATORIO: incluir intentos fallidos y anti-patrones descartados)
- **🔴 Cambio de Scope Detectado:** No / Sí — [Si Sí: describir qué invalida o modifica fases siguientes]
- **Próxima acción:** (qué debe hacer el Orquestador)
```

> **[SISTEMA - PARA EL ORQUESTADOR]** Al finalizar, estás obligado a crear un archivo físico `worker-handoff.md` para cada fase de Worker. NO redactes prompts en chat.
