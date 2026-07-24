---
trigger: always_on
description: "Manual de referencia para guardar en el Engram. Debe ser consultado explícitamente vía view_file por agentes antes de registrar decisiones."
---

# Engram Protocol — Funky AI Memory Bus

## 1. Memory Polling (Lectura — OBLIGATORIO)
Antes de cualquier cambio estructural:
- `ACTION: Execute list_dir on docs/engram/` (Stage 1 — siempre)
- Si encuentras un tag relevante → `ACTION: Execute grep_search "[TAG]" on docs/engram/` (Stage 2 — recursivo sobre el directorio)

## 2. Escritura Indexada — Schema MCP
**Destino (estructura sharded):** `docs/engram/bugfix/<tag>.md` | `docs/engram/discovery/<tag>.md` | `docs/engram/decision/<tag>.md` | `docs/engram/architecture/<tag>.md` | `docs/engram/pattern/<tag>.md` | `docs/engram/session/<tag>.md` | `docs/engram/release/<tag>.md`
**Comando preferido:** `funky engram add --tag "[tag]" --category <categoría> --desc "..."` (actualiza el index automáticamente)

```markdown
### [{type}][{topic_key}] {title}
**What:** [Cambio técnico concreto]
**Why:** [Causa/Justificación]
**Where:** [Archivos afectados]
**Learned:** [Aprendizajes/Caveats]
```

Tipos válidos: `BUG`, `DECISION`, `DISCOVERY`, `ARCH`, `SESSION`, `RELEASE`

## 3. Taxonomía de Categorías
| Evento | Categoría | Destino |
|--------|-----------|--------|
| Decisión de arquitectura / convención | `decision` | `docs/engram/decision/<tag>.md` |
| Bug arreglado (causa raíz no obvia) | `bugfix` | `docs/engram/bugfix/<tag>.md` |
| Edge case / hallazgo / restricción técnica | `discovery` | `docs/engram/discovery/<tag>.md` |
| Patrón de código reutilizable | `pattern` | `docs/engram/pattern/<tag>.md` |
| Cambio estructural de arquitectura | `architecture` | `docs/engram/architecture/<tag>.md` |
| Resumen y análisis de sesión de IA | `session` | `docs/engram/session/<tag>.md` |
| Notas y manifiestos de release | `release` | `docs/engram/release/<tag>.md` |

## 4. Upsert Pattern (Anti-Duplicación)
1. `grep_search` por `{topic_key}` en `docs/engram/` (directorio completo).
2. Si existe → `replace_file_content` sobre el archivo individual encontrado.
3. Si no existe → usar `funky engram add` para crear el archivo en el subdirectorio correcto y actualizar el index.