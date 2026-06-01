---
trigger: glob
description: "Protocolo para lectura y escritura estructurada de memoria (Falso Engram) en proyectos gestionados por Funky AI. Se dispara en repositorios con documentación activa."
globs: ["docs/*", "docs/**/*"]
---

# Engram Protocol — Funky AI Memory Bus

## 1. Memory Polling (Lectura — OBLIGATORIO)
Antes de cualquier cambio estructural:
- `ACTION: Execute view_file on docs/engram/index.md` (Stage 1 — siempre)
- Si encontrás un tag relevante → `ACTION: Execute grep_search "[TAG]" on docs/engram/` (Stage 2 — recursivo sobre el directorio)

## 2. Escritura Indexada — Schema MCP

**Destino (estructura sharded):** `docs/engram/bugfix/<tag>.md` | `docs/engram/discovery/<tag>.md` | `docs/engram/decision/<tag>.md` | `docs/engram/architecture/<tag>.md` | `docs/engram/pattern/<tag>.md`

**Comando preferido:** `funky engram add --tag "[tag]" --category <categoría> --desc "..."` (actualiza el index automáticamente)

```markdown
### [{type}][{topic_key}] {title}
**What:** [Cambio técnico concreto]
**Why:** [Causa/Justificación]
**Where:** [Archivos afectados]
**Learned:** [Aprendizajes/Caveats]
```

Tipos válidos: `BUG`, `DECISION`, `DISCOVERY`, `ARCH`

## 3. Cuándo Guardar (Triggers)

| Evento | Acción |
|--------|--------|
| Decisión de arquitectura / convención | Escribir en `decisions.md` |
| Evento | Categoría | Destino |
|--------|-----------|--------|
| Decisión de arquitectura / convención | `decision` | `docs/engram/decision/<tag>.md` |
| Bug arreglado (causa raíz no obvia) | `bugfix` | `docs/engram/bugfix/<tag>.md` |
| Edge case / hallazgo / restricción técnica | `discovery` | `docs/engram/discovery/<tag>.md` |
| Patrón de código reutilizable | `pattern` | `docs/engram/pattern/<tag>.md` |
| Cambio estructural de arquitectura | `architecture` | `docs/engram/architecture/<tag>.md` |

> **Self-Check post-tarea:** ¿Tomé una decisión, arreglé un bug, o aprendí algo no-obvio? Si sí → escribir en Engram AHORA.

## 4. Upsert Pattern (Anti-Duplicación)
1. `grep_search` por `{topic_key}` en `docs/engram/` (directorio completo).
2. Si existe → `replace_file_content` sobre el archivo individual encontrado.
3. Si no existe → usar `funky engram add` para crear el archivo en el subdirectorio correcto y actualizar el index.

## 5. Return Envelope (Worker — OBLIGATORIO)
Todo Worker finaliza escribiendo su reporte físico:

```markdown
---
Worker: [ID/Fase]
Estado: [✅ Completado | ❌ Error | ⚠️ Parcial]
Archivos Mutados:
- [path]: [cambio]
Tokens Ahorrados (Est): [Solo en Fase de Dieta]
Bugs Encontrados: [Ninguno | schema engram]
---
```

**Destino:** `docs/openspec/changes/{change-name}/report.md`

## 6. Session Close (Orquestador — OBLIGATORIO)
Actualizar `ORCHESTRATOR-STATE.md`:

```markdown
## Objetivo: [Tema de la sesión]
## Descubrimientos: [Hallazgos]
## Completado: [Items cerrados]
## Próximos Pasos: [Pendientes]
## Archivos Relevantes: [Path — Descripción]
```

> **REGLA DE ORO:** Un Orquestador sin `ORCHESTRATOR-STATE.md` actualizado deja ciega la siguiente sesión.