# 🤖 Funky AI — Worker Handoff: Fase Git-Ops (v1.15.0)

> **Instrucción para el LLM:** Sos un Worker **Tier T1** de ejecución de Funky AI.
> Tu única misión es ejecutar los comandos git exactos detallados abajo y actualizar el `sdd-report.md`.
> **Sin redacción. Sin decisiones. Pura ejecución mecánica. Acción directa.**

> **[HUMANO]** Ejecutar SOLO después de que el Worker de Doc-Ops completó su reporte.
> Abrí un chat nuevo y pegá:
> `@docs/openspec/changes/008-enforcement-analysis/worker-handoff-gitops.md Ejecutá la Fase Git-Ops`

---

## 1. Inyección de Contexto (Safe-Contexting)

### A) Estado Global
```
view_file ORCHESTRATOR-STATE.md
```
> Verificar que la rama activa sea `feat/v1.15-enforcement-analysis` antes de continuar.

### B) Reporte previo (prerequisito)
```
view_file docs/openspec/changes/008-enforcement-analysis/sdd-report.md
```
> Si la Fase Release no aparece con Status ✅ → **PARAR. No ejecutar Git-Ops hasta que Doc-Ops esté completa.**

---

## 2. La Misión (Surgical Task)

**Objetivo:** Commit de todos los cambios, merge a `main`, tag `v1.15.0`, push.

**Secuencia exacta de comandos:**

```bash
# 1. Verificar estado — todos los archivos deben estar listos
git status

# 2. Commit en la branch actual
git add -A
git commit -m "feat: enforcement analysis y fixes de protocolo SDD (v1.15.0)"

# 3. Merge a main (sin fast-forward para preservar historial)
git checkout main
git merge --no-ff feat/v1.15-enforcement-analysis

# 4. Tag de release
git tag -a v1.15.0 -m "release: v1.15.0 — Enforcement Analysis + RFC Housekeeping"

# 5. Push con tags
git push origin main --tags
```

**🚫 Restricciones:**
- No modificar NINGÚN archivo de texto en esta fase.
- Si `git status` muestra archivos sin commitear que no sean los esperados → documentar en report y PARAR.
- Si el push falla → documentar el error completo en el report y PARAR.

---

## 3. Criterios de Éxito

- [ ] `git status` limpio antes del commit
- [ ] Commit realizado en `feat/v1.15-enforcement-analysis`
- [ ] Merge `--no-ff` a `main` exitoso
- [ ] Tag `v1.15.0` creado
- [ ] Push a `origin main --tags` exitoso
- [ ] `sdd-report.md` actualizado

---

## 4. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/008-enforcement-analysis/sdd-report.md` agregando:

```markdown
## Fase Git-Ops — v1.15.0
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** ninguno (solo operaciones git)
- **Bugs encontrados:** Ninguno / (error de git si aplica)
- **🔴 Cambio de Scope Detectado:** No
- **Próxima acción:** Release completa. Informar al Orquestador para cerrar sesión.
```
