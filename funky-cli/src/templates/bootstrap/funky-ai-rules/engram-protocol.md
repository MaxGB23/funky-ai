---
trigger: model_decision
description: "Manual de referencia para guardar en el Engram aka Funkygram (No MCP). Debe ser consultado explícitamente vía view_file por agentes antes de registrar decisiones."
---

# Engram Protocol — Funky AI Memory Bus (aka Funkygram)

## 1. Taxonomía de Categorías
| Evento | Categoría | Destino |
|--------|-----------|--------|
| Decisión de arquitectura / convención | `decision` | `docs/engram/decision/<tag>.md` |
| Bug arreglado (causa raíz no obvia) | `bugfix` | `docs/engram/bugfix/<tag>.md` |
| Edge case / hallazgo / restricción técnica | `discovery` | `docs/engram/discovery/<tag>.md` |
| Patrón de código reutilizable | `pattern` | `docs/engram/pattern/<tag>.md` |
| Cambio estructural de arquitectura | `architecture` | `docs/engram/architecture/<tag>.md` |
| Resumen y análisis de sesiones | `session` | `docs/engram/session/<tag>.md` |
| Notas y manifiestos de release | `release` | `docs/engram/release/<tag>.md` |

## 2. Memory Polling (Lectura — OPCIONAL)
Cuando necesites contexto previo del proyecto, busca de específico a general:
1. **Si sabes qué tipo necesitas:**
   `grep_search "### \[|^\# \[" on docs/engram/<categoría>/` — solo esa carpeta.
2. **Si sabes el topic_key exacto:**
   `grep_search "[topic_key]" on docs/engram/` — busca en todas las categorías.
3. **Último recurso — catálogo completo:**
   `grep_search "### \[|^\# \[" on docs/engram/` — todas las categorías. Solo si no sabes dónde está lo que buscas.

## 2. Escritura Indexada — Schema MCP
**Destino (estructura sharded):** `docs/engram/<category>/<tag>.md`
**Comando preferido:** `funky engram add --tag "[tag]" --category <categoría> --desc "..."` (index actualizado automáticamente)
**Paso 2 (obligatorio):** Después de crear el archivo, llenar los campos vacíos (`What`, `Why`, `Where`, `Learned`) con el contenido real. El CLI solo genera el esqueleto.

```markdown
### [{type}][{topic_key}] {title}
**Date:** {YYYY-MM-DD}
**What:** [Cambio técnico concreto]
**Why:** [Causa/Justificación]
**Where:** [Archivos afectados]
**Learned:** [Aprendizajes/Caveats]
```

Tipos válidos: `BUG`, `DECISION`, `DISCOVERY`, `ARCH`, `SESSION`, `RELEASE`

## 4. Upsert Pattern (Anti-Duplicación)
1. `grep_search "[topic_key]" on docs/engram/` — busca si ya existe en cualquier categoría.
2. Si existe → `grep_search "[topic_key]" on docs/engram/<categoría>/` para localizar el archivo, luego `replace_file_content`.
3. Si no existe → usar `funky engram add` para crear el archivo en el subdirectorio correcto.