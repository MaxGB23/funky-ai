<MANDATORY_RELEASE_PROTOCOL>

> **Ejecución:** El Orquestador ejecuta este checklist después de funky-archive.

### Versión (Post-Archive) **ORCHESTRATOR**
La versión se determina DESPUÉS de funky-archive: leer `package.json` → incrementar según tipo (MINOR: +0.1.0, MAJOR: +1.0.0, PATCH: +0.0.1).

---

### FASE X — Release Notes [Solo MINOR o MAJOR]
> ⚠️ **OMITIR COMPLETAMENTE si el release_type es PATCH o None.**
> 
> **Tipo de release:** Se clasifica ahora (post-archive), no antes. 
> Decidir con todo lo recabado durante el flujo SDD, si corresponde a PATCH, MINOR o MAJOR.

**🚨 CHECKLIST:**
- [ ] **Release Notes:** Generar `docs/funky-ai/releases/vX.Y.Z-release.md` Leer template .agents/templates/release-notes.md. 
- [ ] **Sincronización:** Leer y Actualizar `ORCHESTRATOR-STATE.md`

---

### FASE X+1 — Archive Move [SIEMPRE — todos los release_type]
> ✅ **Esta fase es obligatoria sin excepción.** Mueve el change folder a archive después de que la versión fue determinada.

**🚨 CHECKLIST:**
- [ ] **Determinar archive name:** Leer versión de `package.json` → construir nombre `vX.Y.Z-{feature}` (ej. `v1.2.0-living-specs`)
- [ ] **Mover carpeta:**
  ```
  openspec/changes/{feature}/  →  openspec/archive/{vX.Y.Z-{feature}}/
  ```
- [ ] El sdd surgió de un rfc? Sí: **Mover RFC al archivado en caso de que exista**,  No: Marcar como omitido en [OMITIDO] 
- [ ] **Verificar conteo:** Si `openspec/archive/` tiene más de 40 entradas → emitir warning
- [ ] **Confirmar limpieza:** Verificar que `openspec/changes/{feature}/` ya no existe
- [ ] **Actualizar versión en Readme**: Actualizar la versión en `README.md`

---

### FASE X+2 — Git-Ops [SIEMPRE — todos los release_type]
> ✅ **Esta fase es obligatoria sin excepción, incluyendo PATCH.**

**🚨 CHECKLIST:**
- [ ] **Package.json:** Bumpar versión en `funky-cli/package.json`
- [ ] `git status` — confirmar limpio
- [ ] `git add -A && git commit -m "{mensaje}"`
- [ ] `git checkout main && git merge --no-ff {branch}`
- [ ] `git tag -a {version} -m "{mensaje}"`
- [ ] `git push origin main --tags`
- [ ] `git branch -d {branch}`

---

> **MANDATORY - ORQUESTADOR:** Tu ÚLTIMA respuesta DEBE incluir un bloque con todos los ítems marcados como `[x]` o `[OMITIDO: razón]`.

</MANDATORY_RELEASE_PROTOCOL>
