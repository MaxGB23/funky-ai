# 📐 SDD Spec — Funky AI v1.10.0
## "Phase 0 Automation & Release Templates"

> **Generado por:** Orquestador (modo `/sdd-ff`)
> **Fecha:** 2026-04-30
> **Ref:** `sdd-proposal.md`

---

## §1. Decisiones de Arquitectura

### [DECISIÓN 1] `funky release` como comando nuevo (no extensión de `phase`)

**Razón:** La semántica de un release es fundamentalmente distinta a una phase. `funky phase` inyecta contexto de planificación SDD; `funky release` es un Doc-Ops terminal que copia artifacts de publicación. Mezclarlos aumentaría la complejidad de `phase.js` sin beneficio real.

**Contrato del nuevo comando:**
```bash
funky release <version>
# Ej: funky release 1.10.0
```

Copia al workspace activo:
- `docs/funky-ai/releases/v{version}-release.md` (desde template `release.md`)
- Abre `README.md` para edición (flag opcional `--readme`)

**Archivos involucrados:**
- `funky-cli/src/commands/release.js` — comando nuevo
- `funky-cli/src/templates/release.md` — template canónico
- `funky-cli/src/templates/README.md` — template canónico
- `funky-cli/funky.js` — registro del nuevo subcommand

---

### [DECISIÓN 2] Phase 0 → Worker Tier 1 (no Humano)

**Razón:** El bloque `FASE 0 — Setup (Humano)` en `tasks.md` crea un punto de falla no-enforced. Refactorizar a T1 (git ops puras, cero ambigüedad) elimina esa dependencia.

**Guardrail de seguridad:** El Worker T1 DEBE verificar que `git --version` responde antes de ejecutar checkout. Si falla, documenta en Return Envelope y bloquea.

**Cambios en `funky-cli/src/templates/sdd/tasks.md`:**
- Reemplazar `FASE 0 — Setup (Humano)` por `FASE 0 — Branch Setup [T1]` con checklist ejecutable.
- El Orquestador es responsable de generar el `worker-handoff.md` de Fase 0 con Tier: T1.

---

## §2. Contratos de Interfaces

### `funky release <version>` — API Contract

| Aspecto | Especificación |
|---------|----------------|
| Input | `version` string (formato `X.Y.Z`) |
| Validación | Regex `^\d+\.\d+\.\d+$`. Abortar con error si inválido. |
| Output destino | `docs/funky-ai/releases/v{version}-release.md` |
| Conflicto | Si el archivo ya existe → abort con mensaje claro. NO sobreescribir. |
| Interpolación | `{{version}}` y `{{date}}` reemplazados en el template |
| Exit code | 0 = éxito, 1 = error de validación |

### Template `release.md` — Estructura Canónica

Basada en v1.7–v1.9 (patrón consolidado):

```markdown
# 🚀 Funky AI v{{version}} Release Notes

## 🌟 Resumen de la Versión
[...]

### ✨ Nuevas Funcionalidades
[...]

### 🛠️ Archivos Modificados
[...]

### 🧪 Tests
[...]

### 🧠 Aprendizajes (Engram)
[...]
```

### Template `README.md` — Estructura Canónica

Basada en el README actual del CLI:

```markdown
# {{project-name}}

> {{tagline}}

## ¿Qué es?
## Instalación
## Comandos
## Arquitectura SDD
## Licencia
```

---

## §3. Restricciones Técnicas

| Restricción | Motivo |
|-------------|--------|
| `sync-templates.js` DEBE actualizarse en la misma fase que los templates | Evitar Template Sync Drift (discovery v1.7.0) |
| Nuevos tests DEBEN pasar antes del merge | Contrato de CI establecido en v1.6 |
| `release.js` sigue el patrón de `init.js` / `phase.js` | Consistencia de exports: `{ runRelease }` + wrapper CLI |
| Idempotencia en release notes | Verificar existencia antes de copiar. No overwrite silencioso |

---

## §4. Out of Scope (v1.10.0)

- Automatización git completa (commit, tag, push) — el checklist git sigue siendo manual en MANDATORY_RELEASE_PROTOCOL
- Interactividad con `@clack/prompts` en `funky release` — fase 1 es headless con arg posicional
- Integración con GitHub Releases API

---

## §5. Criterios de Done (DoD)

- [ ] `funky-cli/src/templates/release.md` existe con estructura canónica
- [ ] `funky-cli/src/templates/README.md` existe con estructura canónica
- [ ] `funky-cli/src/commands/release.js` implementado con validación y tests
- [ ] `funky.js` registra `funky release`
- [ ] `funky-cli/src/templates/sdd/tasks.md` tiene Fase 0 como T1 con checklist git
- [ ] Todos los tests pasan (suite existente + nuevos)
- [ ] `docs/funky-ai/releases/v1.10.0-release.md` creado
- [ ] `README.md` actualizado a v1.10.0
- [ ] `ORCHESTRATOR-STATE.md` actualizado
