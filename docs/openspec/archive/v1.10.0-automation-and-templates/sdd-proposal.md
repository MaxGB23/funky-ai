# 📋 SDD Proposal — Funky AI v1.10.0
## "Phase 0 Automation & Release Templates"

> **Generado por:** Orquestador (modo `/sdd-propose`)
> **Fecha:** 2026-04-30
> **Rama target:** `feat/v1.10-automation-and-templates`
> **Versión actual:** v1.9.0

---

## 🧭 Contexto y Motivación

### El Problema: El Humano como Punto de Falla Manual

En el ciclo SDD actual, dos fricciones recurrentes siguen delegándose al Router Humano cuando no deberían:

**Problema A — Fase 0 sin enforcement (Branch Delegation):**
El template `sdd-tasks.md` marca la "Fase 0 — Creación de Branch" como tarea "para el Humano". Esto genera tres fallos sistémicos:
1. El Orquestador la omite frecuentemente porque no hay mecanismo de enforcement.
2. Features arrancan sin branch propia, contaminando `main`.
3. El Humano (Router) hace trabajo que debería ser del Worker Tier 1.

**Problema B — Templates de Release y README sin SSOT:**
Cada release (v1.7, v1.8, v1.9) se construye "mirando el anterior". No existe un template canónico. Esto lleva a:
1. Inconsistencias de formato entre releases.
2. El Orquestador improvisa estructura cada vez, aumentando el riesgo de omisiones (como la directiva README, que ya costó un bug en v1.6).
3. No hay un comando `funky release` o integración con `funky phase` para automatizar esto.

---

## 🎯 Objetivo de v1.10.0

**Eliminar trabajo manual del Router Humano y consolidar la SSOT de release artifacts.**

| Objetivo | Métrica de Éxito |
|----------|-----------------|
| Fase 0 delegada a Worker Tier 1 | `sdd-tasks.md` incluye Fase 0 con checklist de `git checkout -b` ejecutable por Worker |
| Template canónico de Release Notes | `funky-cli/src/templates/release.md` siguiendo el estilo v1.7–v1.9 |
| Template canónico de README | `funky-cli/src/templates/README.md` con secciones estandarizadas |
| Integración en CLI | `funky phase` o nuevo `funky release` los inyecta/copia al workspace |
| Tests actualizados | Suite de tests cubre los nuevos templates y cualquier lógica de CLI añadida |

---

## 🏗️ Propuesta Técnica

### Feature A — Phase 0 Automation (Worker Tier 1)

**Cambio en `sdd-tasks.md` template:** La Fase 0 deja de decir `[HUMANO: crear branch]` y pasa a ser una misión ejecutable por un Worker T1.

```markdown
## Fase 0 — Branch Setup
**Tier:** T1 (Pure file/git ops, zero ambiguity)
**Worker:** Abrí chat nuevo, pasá el handoff de Fase 0

### Checklist:
- [ ] Verificar que el branch no existe: `git branch --list feat/vX.Y-{name}`
- [ ] Crear y cambiar al branch: `git checkout -b feat/vX.Y-{name}`
- [ ] Verificar con: `git status`
- [ ] Documentar en Return Envelope: branch activo confirmado
```

**Impacto en `funky-cli/src/templates/sdd/tasks.md`:**
- Reemplazar el bloque "Fase 0 — HUMANO" por la nueva Fase 0 con checklist T1.
- Mantener los guardrails estructurales de v1.8.1 (Tier placeholders, Checkpoint, Return Envelope).

**Test coverage:**
- Unit test: verificar que el template `tasks.md` contiene la nueva Fase 0 con `[T1]`.

---

### Feature B — Release & README Templates

**Nuevo archivo:** `funky-cli/src/templates/release.md`

Basado en el estilo consolidado de v1.7–v1.9:
```markdown
# 🚀 Release Notes — Funky AI vX.Y.Z
## "Codename"

**Fecha de Release:** {{date}}
**Versión anterior:** vX.Y-1.Z

## ✨ Highlights
## 🔧 Cambios Técnicos
## 🧪 Tests
## 📚 Documentación
## ⚠️ Breaking Changes / Deprecations
## 🔮 Próximos Pasos (Backlog)
```

**Nuevo archivo:** `funky-cli/src/templates/README.md`

Template canónico del README del proyecto:
```markdown
# Funky AI — vX.Y.Z

## ¿Qué es Funky AI?
## Instalación
## Comandos
## Arquitectura SDD
## Changelog
```

**Integración en CLI:**
Opción preferida: extender `funky phase` para que acepte un tipo especial `release`, o crear el comando `funky release` que copie ambos templates al directorio docs del workspace con la versión interpolada.

**Test coverage:**
- Unit test: verificar existencia de `release.md` y `README.md` en `src/templates/`.
- Integration test: verificar que `funky release` (o la integración en `phase`) copia los templates correctamente.

---

## ⚠️ Riesgos y Decisiones Pendientes

| Riesgo | Mitigación |
|--------|------------|
| `funky phase` vs `funky release` — scope ambiguo | **[DECISIÓN PENDIENTE]** Ver Spec §2 |
| Worker T1 ejecutando git: entorno sin git configurado | Agregar guardrail: verificar `git --version` antes. Documentar en template. |
| Template README sobreescribe README existente | Idempotencia: verificar si existe antes de copiar. Documentar en Return Envelope. |
| Sync-templates.js drift | Al agregar nuevos templates, actualizar `sync-templates.js` en la misma Fase. |

---

## 📅 Estimación de Fases

| Fase | Nombre | Tier | Estimación |
|------|--------|------|------------|
| 0 | Branch Setup | T1 | ~5 min |
| 1 | Phase 0 Automation — Template Refactor | T2 | ~30 min |
| 2 | Release & README Templates + CLI Integration | T2 | ~60 min |
| 3 | Tests & Coverage | T2 | ~45 min |
| 4 | Release — README bump, release notes v1.10.0, tag | T1 | ~20 min |

**Total estimado:** ~2.5 hs de Worker time.

---

## 🔗 Artefactos Relacionados

- `ORCHESTRATOR-STATE.md` — Líneas 83-84 (pendientes v1.10.0)
- `docs/openspec/backlog/agent-dry-handoffs.md` — ✅ Completado (v1.9.0, referencia de patrón)
- `funky-cli/src/templates/sdd/worker-handoff.md` — Base para los nuevos handoffs
- `funky-cli/src/templates/sdd/tasks.md` — Archivo a refactorizar en Fase 1

---

> **Siguiente paso:** Revisar y aprobar este Proposal. Si hay acuerdo, ejecutar `/sdd-ff` para generar `sdd-spec.md` + `sdd-tasks.md`.
