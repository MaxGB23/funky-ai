# Tasks: v1.5 — SDD Template Enrichment + CLI README

**Estado:** 🟡 PENDIENTE
**Rama:** `feature/v1.5-template-enrichment`
**Ref:** `proposal.md`

---

## ✅ Checklist de Ejecución

### FASE 0 — Setup (Humano)
- [ ] `git checkout -b feature/v1.5-template-enrichment`

---

### FASE 1 — Enriquecer Templates SDD (Worker)
> Objetivo: Reemplazar los 5 templates thin de `funky-cli/src/templates/sdd/` con versiones completas y guiadas.

**Referencia canónica OBLIGATORIA:** Antes de crear cada template, leer `docs/funky-ai/workers/plantilla-worker-handoff.md` como modelo de calidad esperado.

- [ ] Sobreescribir `src/templates/sdd/explore.md` — Secciones: Contexto del Problema, Opciones de Arquitectura (mínimo 3 con tradeoffs), Recomendación + Riesgos.
- [ ] Sobreescribir `src/templates/sdd/proposal.md` — Secciones: Contexto, Decisiones Técnicas (tabla), Stack/Scope, Riesgos.
- [ ] Sobreescribir `src/templates/sdd/tasks.md` — Secciones: Checklist por Fases (con Fase 0 Humano incluida). MANTENER el bloque `[SISTEMA]` al final.
- [ ] Sobreescribir `src/templates/sdd/worker-handoff.md` — Usar como base directa `docs/funky-ai/workers/plantilla-worker-handoff.md`. Debe incluir: Safe-Contexting (A/B/C), La Misión, Reglas de Ejecución (tabla), Criterios de Éxito, Return Envelope.
- [ ] Sobreescribir `src/templates/sdd/report.md` — Secciones: Resumen, Archivos Modificados, Bugs Encontrados (con schema engram), Próxima Acción. MANTENER el bloque `[SISTEMA]` al final.

**🚫 Restricciones:** Solo archivos `.md` en `funky-cli/src/templates/sdd/`. No tocar JS ni templates de `bootstrap/`.

---

### FASE 2 — Crear README del CLI (Worker)
> Objetivo: Crear `funky-cli/README.md` con guía completa de instalación y uso.

- [ ] Crear `funky-cli/README.md` con las siguientes secciones:
  - **¿Qué es Funky AI CLI?** — descripción en 2-3 líneas
  - **Prerequisitos** — Node.js, pnpm, `pnpm setup` para habilitar global bin
  - **Instalación** — `git clone` + `cd funky-cli` + `pnpm install` + `pnpm link --global`
  - **Comandos** — tabla con `funky init` y `funky phase <nombre>`, descripción y ejemplo de output
  - **Fases SDD disponibles** — tabla con los 5 nombres de fase y cuándo usar cada uno
  - **Estructura generada por `funky init`** — árbol de directorios en bloque de código

**🚫 Restricciones:** Solo el archivo `funky-cli/README.md`. No tocar código fuente.

---

### FASE 3 — Remediar Deuda de Release (Worker)
> Objetivo: Reparar los artefactos de release que quedaron sin generar en v1.3 y v1.4, y corregir los archivos stale.

- [ ] Crear `docs/funky-ai/releases/v1.3.0-release.md` — Release notes de v1.3 (Worker Handoff, Memory Polling canonizado). Inferir contenido del historial de ORCHESTRATOR-STATE.md y engram.
- [ ] Crear `docs/funky-ai/releases/v1.4.0-release.md` — Release notes de v1.4 (`funky init`, `funky phase`, templates bootstrap y SDD, smoke test, plantilla oficial worker handoff).
- [ ] Actualizar `README.md` — Cambiar versión a v1.4.0, actualizar sección de Engram (apunta a `docs/engram/` no a `docs/post-mortem.md`), agregar sección del CLI (`funky init` / `funky phase`), agregar link a `guia-flujo-completo.md`.
- [ ] Actualizar `ORCHESTRATOR-STATE.md` — Corregir estado (merge ya hecho, v1.4 en main), limpiar tareas pendientes falsas, agregar v1.5 como feature activa.

**🚫 Restricciones:** Solo archivos `.md`. No tocar código fuente.

---

### FASE 4 — Release v1.5 (Humano)
- [ ] `git add -A`
- [ ] `git commit -m "feat(cli): enrich sdd templates, add cli readme, remediate release debt"`
- [ ] `git checkout main && git merge --no-ff feature/v1.5-template-enrichment -m "release: v1.5.0"`
- [ ] `git tag -a v1.5.0 -m "release: v1.5.0 - enriched templates + release DoD fix"`
- [ ] Crear `docs/funky-ai/releases/v1.5.0-release.md` con lo que entró en esta versión
- [ ] Actualizar `README.md` → versión v1.5.0
- [ ] Actualizar `ORCHESTRATOR-STATE.md` → v1.5, rama main, tareas pendientes vacías
- [ ] Eliminar `docs/openspec/changes/v1.5-template-enrichment/`

---

## 📋 Return Envelope (Para el Worker)

Al finalizar cada fase, actualizar `report.md` con:

```
## Fase [N] — [Nombre]
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:** (lista)
- **Bugs encontrados:** (si aplica, con schema engram)
- **Próxima acción:** (qué debe hacer el Orquestador)
```

> **[SISTEMA - PARA EL ORQUESTADOR]** Al finalizar, estás obligado a crear un archivo físico `worker-handoff.md` para cada fase de Worker. NO redactes prompts en chat.
