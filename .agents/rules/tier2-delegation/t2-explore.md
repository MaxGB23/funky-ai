---
trigger: manual
---

# Guardrails Tier 2 - Explore Ligero (Sabueso de Lava)

## 1. ⚠️ Orchestration Checklist (EJECUTAR ANTES de delegar)
| # | Verificación | Acción si falta |
|---|-------------|-----------------|
| PRE-0 | ¿He dado el bloque de recomendación y el humano me ha confirmado sus elecciones? | Leer sdd-preflight.md
| 1 | ¿Ejecuté el Memory Polling Stage 1? | `view_file docs/engram/index.md` ahora |
> 🔴 **Si cualquier ítem es NO → no delegues. Complétalo (o pídelo al humano) primero.**

## 2. Prompt de Delegación
**Cómo delegar:** `define_subagent` (Lectura + Escritura).

> 🔴 **PROHIBIDO usar `self` para esta fase.** Debes usar `define_subagent` con un prompt acotado. `self` clona todo tu contexto y rompe el patrón de ligereza del Tier 2.

**Prompt estricto a inyectar al subagente:**

> ## Tarea
> Analiza el RFC/especificación para "[CHANGE]" y produce la sección Context Preservation en explore.md. NO inventes arquitectura.
> ## Documento fuente
> - `[RFC_PATH], si no existe debes pasar contexto`
> ## Template a seguir
> - `docs/openspec/changes/[CHANGE]/explore.md` — Leer y usar `replace_file_content`. No sobreescribas desde cero.
> ## Tags de engram relevantes (opcional)
> - Nombre: [Nombre]
> - Descripción: [Descripción]
> ## Formato de retorno
> ```markdown
> ## Hallazgo: [Título corto]
> **Qué**: [resumen]
> **Dónde**: `PATH`
> **Context Preservation**: [SÍ/NO]
> **Artefacto generado en**: docs/openspec/changes/[CHANGE]/explore.md
> ```