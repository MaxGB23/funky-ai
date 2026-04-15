---
trigger: glob
description: "Protocolo para lectura y escritura estructurada de memoria (Falso Engram) en proyectos gestionados por Funky AI. Se dispara en repositorios con documentación activa."
globs: ["docs/*", "docs/**/*"]
---

# Engram Protocol (Funky AI Memory Bus)

Estás operando en un proyecto que usa persistencia estructural. Al detectar este entorno debes comportarte como una unidad de memoria activa:

## 1. Memory Polling Dinámico (Lectura Pasiva)
ANTES de cualquier modificación estructural o decisión arquitectónica, **DEBES usar `grep_search` o `view_file` sobre `docs/post-mortem.md`**. Esto asegura que no repitas errores del pasado ni rompas decisiones previamente tomadas por otros Workers o el Orchestrator. 

## 2. Estructuración MCP en Texto Plano (Escritura Indexada)
Toda documentación dejada para la posteridad en `docs/post-mortem.md` está atada irrevocablemente al siguiente esquema estricto (no uses formatos libres, emulamos una base de datos con Markdown):

```markdown
### [{type}] {title}
**What:** [Lo que se hizo a nivel de código o configuración, concreto]
**Why:** [La justificación, el causante del error o la métrica de negocio/estado]
**Where:** [El rastro de las entidades o archivos modificados. Ej: root/configs/db.json]
**Learned:** [Casuística rara, caveats, advertencias de cara al futuro. Campo vital]
```
*(Types permitidos: `bugfix`, `decision`, `arquitectura`, `discovery`)*