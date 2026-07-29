# Release Checklist: [Nombre de la Funcionalidad o Cambio]
<MANDATORY_RELEASE_PROTOCOL>

> Checklist de release SDD para el Orquestador. Completar antes de archivar y taggear.
> **Nota:** Este es el checklist del *proceso* de release, NO las release notes (que se generan con `funky release`).

---

## 📋 Checklist de Release

### Pre-Release
- [ ] **Tests pasan:** Ejecutar suite completa (`pnpm run test`). Si falla → PARAR y resolver.
- [ ] **Lint / Type check:** Ejecutar linting y verificación de tipos. Si falla → PARAR.
- [ ] **Build:** Verificar que el build completo funciona sin errores.

### Versioning
- [ ] **Versión definida:** Confirmar versión SemVer con el equipo/humano.
- [ ] **Manifest actualizado:** Actualizar `package.json` (y otros manifests) a la nueva versión.
- [ ] **Changelog:** Generar o actualizar CHANGELOG.md con las entradas de esta release.

### Release Notes
- [ ] **Release notes generadas:** Usar el template `release-template.md` (inyectado por `--bootstrap`) o crear manualmente.
- [ ] **Review:** Revisar que las release notes sean claras y completas.

### Archivado
- [ ] **Feature archivada:** Mover `openspec/changes/{feature}/` → `openspec/archive/{version}-{feature}/`.
- [ ] **ORCHESTRATOR-STATE.md actualizado:** Actualizar versión, rama y estado estable.

### Post-Archivado
- [ ] **Tag creado:** `git tag -a vX.Y.Z -m "release vX.Y.Z"`
- [ ] **Push:** `git push origin main --tags`
- [ ] **Engram guardado:** Capturar learnings significativos con `funky engram add`.

---

## 📝 Notas

[Notas sobre el proceso de release, blockers encontrados, o decisiones tomadas.]
