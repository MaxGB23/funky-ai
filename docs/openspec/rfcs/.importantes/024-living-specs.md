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
- El paso de merge va en el prompt de `/funky-archive` o release.md(pendiente decisión)
- Para MODIFIED capabilities, el spec agent lee de `openspec/specs/{domain}/spec.md`
- Para NEW capabilities sin root spec existente, escribe FULL spec (no delta)
- El archive sigue existiendo como audit trail, pero `openspec/specs/` es la fuente rápida
- Separar `changes/` y `archive/` como directorios hermanos (no archive dentro de changes)
- Size budget: cada spec de dominio debe mantenerse bajo ~600 palabras

## 📐 Contrato del Delta Spec

Cada delta spec en `openspec/changes/{feature-name}/specs/{domain}/spec.md` usa TRES secciones obligatorias:

### ADDED Requirements
Comportamiento NUEVO que no existe en el root spec. Al archivear, se INSERTA al final de `openspec/specs/{domain}/spec.md`.

### MODIFIED Requirements
Comportamiento EXISTENTE que cambia. **Regla crítica**: copiar el requirement COMPLETO del root spec (título + todos los escenarios), editarlo, y agregar "(Previously: ...)" con un resumen de una línea de lo que cambió.

> ¿Por qué copiar completo?
> Porque archive REEMPLAZA el bloque entero en el root spec. Si el delta solo incluye el escenario que cambió, archive pierde los escenarios que no se copiaron. Es el error más común.

### REMOVED Requirements
Comportamiento que se elimina. Al archivear, se BORRA del root spec. Identificación: por nombre exacto del requirement (`### Requirement: {Name}`). Si el requirement no existe en el root spec, archive DEBE fallar con error explícito.

## 🆕 Dominios Nuevos (FULL Spec)

Si un change introduce una capability cuyo dominio NO EXISTE en `openspec/specs/`, el spec agent escribe un FULL spec (no un delta):

```markdown
# {Domain} Specification
## Requirements
### Requirement: {Name}
The system MUST/SHOULD...
#### Scenario: {Name}
- GIVEN... WHEN... THEN...
```

Un FULL spec no tiene secciones ADDED/MODIFIED/REMOVED — todo es nuevo. Al archivear, se copia completo a `openspec/specs/{domain}/spec.md`.

## 🔄 Flujo del Spec Workflow según el Contexto

El spec workflow se comporta distinto según el estado del proyecto:

### Escenario A: Proyecto nuevo (no existe `openspec/specs/`)

No hay root specs todavía. Cada change escribe FULL specs porque no hay comportamiento existente contra el cual escribir un delta.

```
change #1 →  openspec/changes/setup-auth/specs/auth/spec.md  (FULL)
archive #1 →  openspec/specs/auth/spec.md  ← se crea el directorio y el primer root spec

change #2 →  openspec/changes/add-teams/specs/teams/spec.md  (FULL)
archive #2 →  openspec/specs/teams/spec.md  ← otro dominio nuevo, otro FULL spec
```

El directorio `openspec/specs/` se crea la primera vez que se archivea un change. Hasta entonces, no existe.

### Escenario B: Proyecto establecido (existe `openspec/specs/`)

El spec agent LEE el root spec del dominio afectado, entiende el comportamiento actual, y escribe un DELTA (ADDED/MODIFIED/REMOVED). Esto es el core del living specs.

```
spec agent →  lee openspec/specs/user-auth/spec.md
           →  escribe openspec/changes/{name}/specs/user-auth/spec.md  (DELTA)
archive    →  mergea el delta a openspec/specs/user-auth/spec.md
```

### Regla

Si `openspec/specs/{domain}/spec.md` existe → se lee y se escribe delta.
Si no existe → se escribe FULL spec.
Si `openspec/specs/` no existe → se trata como si ningún dominio existiera (todos FULL specs).

## ⚔️ Detección de Conflictos en Archive

Cuando `/funky-archive` va a mergear un delta contra el root spec, DEBE verificar que el root spec no cambió desde que se creó el delta:

1. Al crear el delta, spec agent guarda un SHA256 o timestamp del root spec leído
2. Al archivear, se checkea si el root spec actual coincide
3. Si NO coincide → abortar archive con mensaje: "el root spec cambió después de crear este delta. Revisar el delta manualmente o recrearlo contra el nuevo root spec"

## 🎯 Qué NO es esto

- No es un reemplazo del archive — el archive sigue siendo el audit trail histórico completo
- No es una migración forzada — los archived changes viejos se quedan como están

## 🏷️ Naming Convention de Archives

No todos los cambios SDD terminan en una release versionada. Algunos se cancelan pero dejaban registro histórico, otros son experimentos. Por eso dos formatos:

### Versionado (cambios que llegaron a release)

```
v{major}.{minor}.{patch}-{kebab-description}
```

Ejemplos: `v2.5.0-engram-sharding`, `v2.6.0-search-enhancements`

### No versionado (cambios cancelados, experimentos, fixes menores)

```
{yyyy-mm-dd}-{kebab-description}
```

Ejemplos: `2026-06-16-fix-auth-timeout`, `2026-07-01-explore-rust-proof-of-concept`

Usar fecha ISO evita colisiones y ordena cronológico naturalmente.

### Regla

- Los cambios versionados van a `archive/v{major}.{minor}.{patch}-{desc}/`
- Los no versionados van a `archive/{yyyy-mm-dd}-{desc}/`
- **No se mezclan**. Si un cambio empezó como experimento y terminó en release, se renombra a versionado antes de archivear (el cambio en sí no se mueve, solo el nombre del directorio).

## 🧹 Política de Limpieza

El archive no es un vertedero eterno. Para mantenerlo navegable:

- **Límite blando**: ~40 entradas en `archive/`. Al llegar a ese número, revisar y purgar.
- **Criterio de borrado**: cambios que ya no aportan valor — RFCs muy viejos, experimentos fallidos sin aprendizaje relevante, primeros intentos del framework que quedaron obsoletos por cambios de paradigma.
- **No purgar** cambios versionados que llegaron a release (son parte de la historia del producto).
- El criterio final es humano: el orquestador nunca decide borrar archives.

## 📁 Estructura de Directorios

```
openspec/
├── specs/                  ← LIVING SOURCE OF TRUTH (acumulativo)
│   ├── user-auth/spec.md
│   └── data-export/spec.md
├── changes/                ← cambios ACTIVOS (solo los que están en curso)
│   └── 023-deprecate-worker-handoff/
│       ├── proposal.md
│       ├── specs/
│       │   └── user-auth/spec.md  ← DELTA del cambio actual
│       └── design.md
├── archive/                ← cambios COMPLETADOS (copia exacta de lo que había en changes/)
│   ├── v2.5.0-engram-sharding/        ← versionado (llegó a release)
│   │   ├── proposal.md
│   │   ├── design.md
│   │   ├── tasks.md
│   │   ├── apply.md
│   │   ├── verify.md
│   │   └── specs/
│   │       └── engram/spec.md
│   └── 2026-06-16-fix-auth-timeout/   ← no versionado
│       ├── proposal.md
│       ├── specs/
│       └── ...
└── rfcs/                   ← ideas crudas
```

Al archivear, el change se MUEVE de `changes/` a `archive/` (no se copia). Un change completado no debería estar en dos lugares.

`openspec/specs/` es el acumulado histórico. Cada vez que archiveás un cambio, los deltas se MERGEAN a `openspec/specs/{domain}/spec.md`. Ese archivo siempre refleja el comportamiento actual del sistema. No tenés que buscar en 30 archived changes para saber cómo funciona user-auth — vas a `openspec/specs/user-auth/spec.md` y está todo.

### El archive es un mirror del change

El comando `/funky-archive` **mueve** el directorio de `changes/{name}/` a `archive/{new-name}/`. No selecciona archivos, no arma una estructura específica. No importa qué archivos existen o no según el tier — se archivea lo que haya.

```
changes/{name}/    → (move) →    archive/v2.6.0-search-enhancements/
├── proposal.md                    ├── proposal.md
├── design.md          ────────    ├── design.md
├── specs/                         ├── specs/
│   └── user-auth/spec.md          │   └── user-auth/spec.md
├── apply.md                       ├── apply.md
└── verify.md                      └── verify.md
```

Esto incluye cualquier archivo presente: `report.md`, `explore.md`, `worker-handoff.md`, etc. Si existe en `changes/`, existe en `archive/`.

El archive no tiene una estructura fija — refleja lo que el tier y el workflow generaron. Para navegarlo: buscar por nombre de archivo (`proposal.md`, `design.md`, etc.) sabiendo que puede no estar si el tier no lo incluye.

Los cambios viejos (pre-living-specs) se quedan como están. No se migran.

## 🔧 Cambio Pendiente: Naming en Tasks / Release

Para que el naming de archives sea consistente, el sistema necesita saber si un cambio es versionado o no. Pero `release` no corre el 100% de las veces — muchos cambios se cancelan o son experimentos que nunca llegan a release.

**Propuesta inicial**: el template de `tasks` define el default como `dated`. Si después el cambio llega a release, el template `release` lo sobreescribe a `versioned`. Así ningún cambio se queda sin nombre de archive, y los que llegan a release se renombran.

```
tasks →  archive_class: dated (default)
release →  archive_class: versioned (override)
```

**Queda pendiente** porque también interactúa con cómo se define el merge en `/funky-archive`, y eso depende del tier (tasks + release + archive no están completamente definidos en conjunto aún). La decisión final se toma cuando se implemente el proposal.

## ⏳ Pendiente: Integración con Tiers

El merge de deltas en `/funky-archive` no es independiente — depende de cómo interactúan los templates de tasks, release y archive según el tier del cambio. Esa definición no existe todavía y queda fuera del alcance de este RFC.

**Decisión postergada**: la lógica de mergeo en archive se define cuando se diseñe el sistema de tiers.
