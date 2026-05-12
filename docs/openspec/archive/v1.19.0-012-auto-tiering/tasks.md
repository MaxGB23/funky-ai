# Tasks: 012 - Auto-Tiering del Orquestador

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/v1.19.0-012-auto-tiering`
**Ref:** `proposal.md`, `spec.md`

---

## ✅ Checklist de Ejecución

### FASE 0 — Branch Setup [T1]
> **Tier:** T1 — Git ops puras, cero ambigüedad. Delegable a Worker.

- [ ] Verificar que git está disponible: `git --version`
- [ ] Verificar que el branch NO existe: `git branch --list feature/v1.19.0-012-auto-tiering`
- [ ] Crear y cambiar al branch: `git checkout -b feature/v1.19.0-012-auto-tiering`
- [ ] Confirmar branch activo: `git status`

---

### FASE 1 — Inyección de Prompt (Worker)
> Objetivo: Modificar `.agents/rules/sdd-orchestrator.md` para inyectar la matriz de Auto-Tiering, y marcar la tarea en `ORCHESTRATOR-STATE.md`.

- [ ] Editar `.agents/rules/sdd-orchestrator.md`: Agregar el "Paso 0 - Razonamiento Pre-Vuelo" con la Matriz de Decisión (T1/T2/T3) en el inicio (sección Bootstrap o antes del Planning Checklist). Debe ser formato conciso (Haiku).
- [ ] Editar `.agents/rules/sdd-orchestrator.md`: Explicar el comportamiento para T1 (ir directo a tasks, instruir al worker a limpiar archivos vacíos).
- [ ] Editar `ORCHESTRATOR-STATE.md`: Marcar la tarea 012 (la original, no la 012.b) como `[x]` completada.

**🚫 Restricciones:** No tocar la tarea `012.b`. Mantener la token diet estricta.

---

<MANDATORY_RELEASE_PROTOCOL>

### FASE X — Doc-Ops [ORQUESTADOR — Inline, modelo actual]
> **Objetivo:** Producir todos los artefactos de la release y ejecutar los archivados.

- [ ] **Tests:** `[OMITIDO: sin cambios en código fuente]`
- [ ] **Release Notes:** `[OMITIDO: cambio interno de prompt]`
- [ ] **README:** `[OMITIDO]`
- [ ] **CLI Docs:** `[OMITIDO: sin nuevos comandos]`
- [ ] **Package.json:** `[OMITIDO: no amerita bump de version del CLI]`
- [ ] **Archivado:** Mover `docs/openspec/changes/012-auto-tiering/` → `docs/openspec/archive/v1.19.0-012-auto-tiering/`.
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md` si hace falta.
- [ ] **Preparar datos para Worker Git-Ops:** Rama: `feature/v1.19.0-012-auto-tiering`, Commit: `feat(orchestrator): implement auto-tiering decision matrix`.

---

### FASE X+1 — Git-Ops [Worker T1 — ⚡ Flash / Haiku]
> **Objetivo:** Comandos git puros.

- [ ] **Verificar estado:** `git status`
- [ ] **Commit:** `git add -A && git commit -m "feat(orchestrator): implement auto-tiering decision matrix"`
- [ ] **Merge:** `git checkout main && git merge --no-ff feature/v1.19.0-012-auto-tiering`
- [ ] **Push:** `git push origin main`

</MANDATORY_RELEASE_PROTOCOL>

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `sdd-report.md` con:

```markdown
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** Ninguno
- **Próxima acción:** (qué debe hacer el Orquestador)
```
