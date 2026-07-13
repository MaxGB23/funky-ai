<MANDATORY_RELEASE_PROTOCOL>

> **Ejecución:** El Orquestador ejecuta este checklist después de funky-archive.
### Versión (Post-Archive) **ORCHESTRATOR** 
La versión se determina DESPUÉS de funky-archive: leer package.json → incrementar según tipo (MINOR: +0.1.0, MAJOR: +1.0.0, PATCH: +0.0.1).

### FASE X — Release-Ops [FUNKY-TASKS — Generación]
> **Contexto:** Solo se inyecta para MINOR o MAJOR.

**🚨 CHECKLIST:**
- [ ] **Release Notes:** Generar `docs/funky-ai/releases/vX.Y.Z-release.md`
- [ ] **Package.json:** Bumpar versión en `funky-cli/package.json`
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md`

---

### FASE X+1 — Git-Ops [ORQUESTADOR — Ejecución]

**🚨 CHECKLIST:**
- [ ] `git status` — confirmar limpio
- [ ] `git add -A && git commit -m "{mensaje}"`
- [ ] `git checkout main && git merge --no-ff {branch}`
- [ ] `git tag -a {version} -m "{mensaje}"`
- [ ] `git push origin main --tags`
- [ ] `git branch -d {branch}`

---

> **MANDATORY - ORQUESTADOR:** Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems marcados como `[x]` o `[OMITIDO: razón]`.

</MANDATORY_RELEASE_PROTOCOL>