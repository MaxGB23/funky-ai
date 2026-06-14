# RFC: 024-living-specs

> **🛑 WARNING PARA IA (FASE EXPLORE):**
> Este documento es un RFC / Brain Dump. No es un proposal formal.
> Tu trabajo en la fase de explore es leer esto, extraer la intención y validar viabilidad.
> Este documento alimenta la fase de explore (nunca delegar sin aprobación).

---

## 🧠 El Problema / La Idea

Hoy los specs viven en archived changes. Si quiero saber el estado actual de `user-auth`, tengo que buscar entre N cambios archiveados, encontrar el más reciente que tocó ese dominio, y leerlo.

Para un sub-agente (explore, spec, design) es caro. Para un humano es imposible sin buscar a mano.

La idea es agregar `openspec/specs/` como **living source of truth** — un archivo por dominio que siempre refleja el comportamiento actual. Cuando se archivea un cambio, los deltas se mergean a este directorio.

## 🗑️ Brain Dump

- Estructura: `openspec/specs/{domain}/spec.md`
- No migrar el archive pasado — arrancar desde el próximo cambio
- El paso de merge va en el prompt de `/funky-archive`
- Para MODIFIED capabilities, el spec agent lee de `openspec/specs/{domain}/spec.md`
- Para NEW capabilities, escribe directo en `openspec/changes/{feature-name}/specs/{domain}/spec.md` y después se mergea a `openspec/specs/` al archivear
- El archive sigue existiendo como audit trail, pero `openspec/specs/` es la fuente rápida

## 🎯 Qué NO es esto

- No es un reemplazo del archive — el archive sigue siendo el audit trail histórico completo
- No es una migración forzada — los archived changes viejos se quedan como están



EJEMPLO:
El modelo completo de openspec
openspec/
├── specs/                  ← LIVING SOURCE OF TRUTH (acumulativo)
│   ├── user-auth/spec.md
│   └── data-export/spec.md
├── changes/                ← cambios EN CURSO
│   └── 023-deprecate-worker-handoff/
│       ├── proposal.md
│       ├── specs/
│       │   └── user-auth/spec.md  ← DELTA del cambio actual
│       └── design.md
│   └── archive/            ← cambios COMPLETADOS
│       └── 2026-06-01-022-fix-auth/
│           ├── proposal.md
│           ├── specs/
│           └── design.md
└── rfcs/                   ← ideas crudas
openspec/specs/ es el acumulado histórico. Cada vez que archiveás un cambio, los deltas se MERGEAN a openspec/specs/{domain}/spec.md. Ese archivo siempre refleja el comportamiento actual del sistema. No tenés que buscar en 30 archived changes para saber cómo funciona user-auth — vas a openspec/specs/user-auth/spec.md y está todo.
