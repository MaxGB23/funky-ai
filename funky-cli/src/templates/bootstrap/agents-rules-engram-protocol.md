---
trigger: glob
description: "Protocolo para lectura y escritura estructurada de memoria (Falso Engram) en proyectos gestionados por Funky AI. Se dispara en repositorios con documentación activa."
globs: ["docs/*", "docs/**/*"]
---

# Engram Protocol — Funky AI Memory Bus

## 1. Memory Polling (Lectura — OBLIGATORIO)
Antes de cualquier cambio estructural:
- `ACTION: Execute grep_search on docs/engram/discoveries.md with relevant topic`
- `ACTION: Execute grep_search on docs/engram/bugfixes.md with relevant topic`

## 2. Escritura Indexada — Schema MCP

**Destino:** `docs/engram/bugfixes.md` | `docs/engram/discoveries.md` | `docs/engram/decisions.md`

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
| Bug arreglado (causa raíz no obvia) | Escribir en `bugfixes.md` |
| Edge case / hallazgo / restricción técnica | Escribir en `discoveries.md` |

> **Self-Check post-tarea:** ¿Tomé una decisión, arreglé un bug, o aprendí algo no-obvio? Si sí → escribir en Engram AHORA.

## 4. Upsert Pattern (Anti-Duplicación)
1. `grep_search` por `{topic_key}` en `docs/engram/`.
2. Si existe → `replace_file_content` sobre la entrada existente.
3. Si no existe → append al final del archivo.

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