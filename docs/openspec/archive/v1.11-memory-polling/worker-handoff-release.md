# 🤖 Funky AI — Worker Handoff: v1.11.0 Release — Doc-Ops

> **Instrucción para el LLM:** Sos un Worker **Tier 1** de ejecución de Funky AI.
> **Modelo recomendado:** Estándar (Pro Low / Sonnet) — esta fase requiere redacción.
> Tu misión: producir los artefactos de documentación de la release v1.11.0. Acción directa al disco.

> **[HUMANO]** Para ejecutar este worker, abrí un chat nuevo y pegá:
> `@docs/openspec/changes/memory-polling-v2/worker-handoff-release.md Ejecutá la fase Doc-Ops`

---

## 1. Inyección de Contexto (Safe-Contexting)

### A) Estado Global del Proyecto
```
view_file ORCHESTRATOR-STATE.md
```

### B) Memoria Persistente (Memory Polling — Two-Stage)

**Stage 1 (siempre):**
```
view_file docs/engram/index.md
```

**Stage 2 (si detectás tag relevante):**
Tags probablemente relevantes: `[versioning-policy]`, `[memory-polling-index-layer]`, `[openspec-backlog-lifecycle]`
```
grep_search "[TAG-EXACTO]" docs/engram/discoveries.md (IsRegex: false)
```

### C) Contexto de la Feature
```
view_file docs/openspec/changes/memory-polling-v2/sdd-report.md
view_file funky-cli/src/templates/release.md
view_file funky-cli/src/templates/README.md
view_file README.md
```

---

## 2. La Misión — Doc-Ops

**Objetivo:** Producir los 3 artefactos de documentación faltantes para cerrar la release v1.11.0.

### Tarea 1 — Release Notes

Crear `docs/funky-ai/releases/v1.11.0-release.md` usando `funky-cli/src/templates/release.md` como base.

**Datos para rellenar el template:**
- `{{project_name}}` → `Funky AI`
- `{{version}}` → `v1.11.0`
- **Resumen:** Esta versión introduce el protocolo Two-Stage Memory Polling para controlar el costo de tokens del engram a medida que crece. Incluye el índice liviano `docs/engram/index.md` como primera etapa del polling, la separación del Release en Doc-Ops / Git-Ops con hints de modelo, y el enforcement del ciclo de vida `backlog/ → changes/ → archive/`.
- **Archivos modificados:**
  - `docs/engram/index.md` (creado — índice liviano de 28 entries)
  - `.agents/rules/sdd-orchestrator.md` (Memory Polling → Two-Stage)
  - `funky-cli/src/templates/sdd/worker-handoff.md` (§1.B → Two-Stage)
  - `funky-cli/src/templates/sdd/tasks.md` (Release split en Doc-Ops + Git-Ops con model hints)
  - `docs/engram/discoveries.md` (2 nuevas entries: `[memory-polling-index-layer]`, `[openspec-backlog-lifecycle]`)
  - `ORCHESTRATOR-STATE.md` (bump a v1.11.0)
- **Aprendizajes Engram:** `[memory-polling-index-layer]`, `[openspec-backlog-lifecycle]`

### Tarea 2 — README Update

Actualizar `README.md` en la raíz para reflejar v1.11.0:
- Bump de versión donde aparezca
- Agregar `docs/engram/index.md` en la sección de Archivos Clave si existe

### Tarea 3 — Archivar Feature

Mover (recrear) el contenido de `docs/openspec/changes/memory-polling-v2/` a `docs/openspec/archive/v1.11-memory-polling/`.

> ⚠️ El agente no puede mover carpetas directamente. **Estrategia:** Crear cada archivo en la ruta de archive con el mismo contenido, luego confirmar al humano que elimine `changes/memory-polling-v2/` manualmente o con terminal.

---

## 3. Reglas de Ejecución

| Regla | Descripción |
|-------|-------------|
| 🔴 Foco Láser | Solo los 3 archivos/carpetas definidos en §2 |
| 🔴 Acción Directa | Escribir en disco con tools. Sin redactar en chat. |
| 🟢 Idempotencia | Verificar si destino existe antes de sobreescribir |

---

## 4. Return Envelope

Actualizar `docs/openspec/changes/memory-polling-v2/sdd-report.md` agregando:

```markdown
## Fase Release Doc-Ops
- **Status:** ✅ Completada / ❌ Bloqueada
- **Archivos creados/modificados:**
  - `docs/funky-ai/releases/v1.11.0-release.md` (creado)
  - `README.md` (bumpeado a v1.11.0)
  - `docs/openspec/archive/v1.11-memory-polling/` (archivos copiados — pendiente eliminar changes/ manualmente)
- **Bugs encontrados:** Ninguno / (schema engram si aplica)
- **🔴 Cambio de Scope Detectado:** No
- **Próxima acción:** Humano ejecuta Git-Ops con modelo liviano.
```

> **[HUMANO — POST DOC-OPS]** Una vez completado, cerrá este chat y ejecutá Git-Ops con un modelo liviano:
> `@docs/openspec/changes/memory-polling-v2/worker-handoff-gitops.md Ejecutá Git-Ops`
