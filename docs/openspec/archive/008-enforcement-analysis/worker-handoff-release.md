# 🤖 Funky AI — Worker Handoff: Fase Release — Doc-Ops (v1.15.0)

> **Instrucción para el LLM:** Sos un Worker **Tier T1** de ejecución de Funky AI.
> Tu única misión es leer este documento, ejecutar las tareas exactas detalladas abajo escribiendo al disco mediante tus tools, y luego actualizar el `sdd-report.md` final.
> **NO redactes código ni explicaciones largas en el chat. Acción directa al disco.**

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/008-enforcement-analysis/worker-handoff-release.md Ejecutá la Fase Release`

---

## 1. Inyección de Contexto (Safe-Contexting)

### A) Estado Global del Proyecto
```
view_file ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente (Memory Polling — Two-Stage)

**Stage 1 (siempre ejecutar):**
```
view_file docs/engram/index.md
```

**Stage 2 (tag relevante para esta tarea):**
```
grep_search "[versioning-policy]" docs/engram/discoveries.md (IsRegex: false)
grep_search "[release-dod-gap]" docs/engram/discoveries.md (IsRegex: false)
```

### C) Especificación de Tarea
```
view_file funky-cli/src/templates/release.md
view_file funky-cli/package.json
view_file README.md
```

---

## 2. La Misión (Surgical Task)

**Objetivo:** Producir todos los artefactos de documentación de la release v1.15.0 en disco.

**Directiva Agent DRY:**
Leé el `MANDATORY_RELEASE_PROTOCOL` directamente desde la Fase Release en el template `funky-cli/src/templates/sdd/tasks.md`. Ejecutá exactamente lo que dice ahí.

**Contexto de la release v1.15.0:**
Esta release introduce los fixes de enforcement derivados del análisis forense de fallas de la sesión 007. Los cambios son:
- `enforcement-vs-documentation.md` — Sección de análisis forense agregada (4 fallas → causas → fixes)
- `.agents/rules/sdd-orchestrator.md` — Ítem 0 en Planning Checklist + prerrequisito en `/sdd-ff`
- `funky-cli/src/templates/sdd/tasks.md` — Warning de spec prerequisito al inicio + bloque `[SISTEMA]` al final
- `docs/engram/discoveries.md` + `index.md` — Discovery `[sdd-failure-forensics-007]`
- `docs/openspec/rfcs/` — `002-project-cost-estimator.md` migrado desde `proposals/` (v1.14, incluir en estas notes)

**Versiones incluidas en estas release notes:** v1.14.0 (Housekeeping RFC) + v1.15.0 (Enforcement Analysis).

**Pasos concretos:**
- [ ] **Package.json:** Bumpar `"version"` en `funky-cli/package.json` de la versión actual a `1.15.0`
- [ ] **Release Notes:** Generar `docs/funky-ai/releases/v1.15.0-release.md` usando `funky-cli/src/templates/release.md` como base. Cubrir v1.14 y v1.15 en el mismo documento. *(SISTEMA: Redactar para consumo humano. IGNORAR Token Diet aquí).*
- [ ] **README:** Actualizar `README.md` en la raíz manteniéndolo como Architecture Hub — bumpar la versión referenciada a v1.15.0.
- [ ] **CLI Docs:** No hubo nuevos comandos ni flags — este ítem se omite. Documentar `[OMITIDO: sin nuevos comandos en v1.15]` en el Return Envelope.
- [ ] **Archivado:** Este cambio no tiene carpeta `changes/` propia con artefactos SDD (fue trabajo inline del Orquestador). Documentar `[OMITIDO: trabajo inline, sin carpeta changes/ con artefactos para archivar]` en el Return Envelope.
- [ ] **RFCs:** Revisar `docs/openspec/rfcs/` — ningún RFC fue implementado en v1.15 (002 y 009 siguen pendientes). Documentar `[OMITIDO: ningún RFC implementado en esta release]`.
- [ ] **Sincronización:** Actualizar `ORCHESTRATOR-STATE.md`: versión → `v1.15.0`, estado → `✅ Estable`, rama activa → `main` (post-merge), agregar entrada en Tareas Completadas v1.15.

---

## 3. Reglas de Ejecución Estrictas

| Regla | Descripción |
|-------|-------------|
| 🔴 Cero Exploración | No uses `list_dir` ni `view_file` sobre archivos no indicados en §1 |
| 🔴 Foco Láser | Solo los archivos listados en §2. Si algo fuera de scope está roto, documentalo en el report |
| 🔴 Acción Directa | Cada archivo se escribe con tools. Sin redactar en el chat. |
| 🟢 Idempotencia | Verificar si `v1.15.0-release.md` ya existe antes de crear. Si existe, PARAR y documentar. |

---

## 4. Criterios de Éxito

- [ ] `funky-cli/package.json` tiene `"version": "1.15.0"`
- [ ] `docs/funky-ai/releases/v1.15.0-release.md` existe y está redactado para consumo humano
- [ ] `README.md` raíz referencia v1.15.0
- [ ] `ORCHESTRATOR-STATE.md` tiene v1.15.0 como estable y rama `main`
- [ ] `sdd-report.md` actualizado con esta fase

---

## 5. Return Envelope (Al terminar)

Actualizá `docs/openspec/changes/008-enforcement-analysis/sdd-report.md` con:

```markdown
## Fase Release — Doc-Ops v1.15.0
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `funky-cli/package.json` (version bump a 1.15.0)
  - `docs/funky-ai/releases/v1.15.0-release.md` (creado)
  - `README.md` (version bump a v1.15.0)
  - `ORCHESTRATOR-STATE.md` (v1.15.0 estable, rama main)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No
- **Próxima acción:** Orquestador ejecuta el Worker de Git-Ops (worker-handoff-gitops.md)
```
