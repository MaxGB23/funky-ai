# RFC: Estandarización del Contrato Bootstrap Sub-Agente

> **🛑 WARNING PARA LA IA (ORQUESTADOR):**
> Este documento es un **RFC (Request for Comments) / Brain Dump**. Son notas crudas del humano.
> **NO ES UN PROPOSAL FORMAL**. Bajo ninguna circunstancia debes tomar esto como una especificación técnica final o empezar a generar código basado directamente en esto.
> Tu trabajo en la fase de Orquestación es **leer esto, extraer la intención, validar viabilidad, y generar un `proposal.md` formal** en el directorio del change.

---

**Estado:** Borrador
**Autor:** Humano + Orquestador
**Fecha:** 2026-06-11
**RFC Relacionados:** `022-tasks-template-sharding.md`, `024-sdd-fast-track-and-workflow-synergy.md`

---

## 🧠 El Problema

Hoy cada sub-agente SDD (propose, spec, design, tasks, apply, verify) tiene en su system prompt una sección de **"Prerequisitos (Bootstrap)"** con pasos duros como:

```markdown
1. view_file ORCHESTRATOR-STATE.md
2. grep_search docs/engram/index.md
3. grep_search "[TAG]" recursivo en docs/engram/
4. view_file docs/openspec/changes/{feature-name}/proposal.md
5. view_file docs/openspec/changes/{feature-name}/spec.md
6. view_file docs/openspec/changes/{feature-name}/design.md (solo si existe)
7. docs/openspec/changes/{feature-name}/tasks.md ← target
```

Esto tiene **tres problemas**:

### Problema 1: Pasos 1-3 son trabajo duplicado del orquestador

El orquestador **ya** tiene el `ORCHESTRATOR-STATE`, sabe qué tag relevante va, conoce el feature name y el contexto del proyecto. Obligar a cada sub-agente a rediscover lo mismo es:

- **Round-trips al pedo** → cada `view_file` / `grep_search` es un tool call que no aporta valor
- **Contexto inflado** → el sub-agente recibe el resultado de esas lecturas, que el orquestador ya procesó
- **Fragilidad** → si el index cambia, hay N prompts que actualizar en lugar de 1

### Problema 2: El condicional "design — solo si existe" es ineficiente

Hoy el prompt dice `view_file design.md (solo si existe)`. Esto hace que el sub-agente **siempre** intente leerlo, reciba un error, y siga. Son ~2-3 tool calls al pedo por cada ejecución. En un tier básico que nunca tiene design phase, es ruido permanente.

### Problema 3: No hay un contrato explícito de "qué hago con el target"

Hoy cada sub-agente asume que crea el archivo de destino desde cero. Pero hay escenarios donde el archivo **ya existe** (por ejemplo, un sub-agente anterior dejó un borrador, o hubo una ejecución parcial), y lo que necesitamos es **complementar/amendear**, no overwritear.

No hay un parámetro que le diga al sub-agente: "crealo de nuevo" vs "lee lo que hay y complementalo".

---

## 🗑️ Análisis — La正交alidad de los Conceptos

Después de darle vueltas, identificamos **dos ejes independientes** que hoy están mezclados en un solo bloque de bootstrap:

| Eje | Qué define | Valores | Ejemplo |
|-----|-----------|---------|--------|
| **artifact_state** | ¿El archivo destino ya existe o lo creamos de cero? | `new` / `exists` | `new` → primera vez, creo el archivo desde cero con mi estructura interna. `exists` → leo el archivo existente, analizo qué falta, complemento. |
| **has_design** | ¿Este tier/flujo incluye la fase de diseño? | `true` / `false` | `false` → ni intento leer design.md, no pierdo tiempo. `true` → design.md es una entrada obligatoria. |

Son **ortogonales**. Las combinaciones posibles:

| artifact_state | has_design | Escenario |
|---------------|-----------|-----------|
| `new` | `true` | SDD completo, primer cambio. Tasks se crea desde cero, lee design.md |
| `new` | `false` | SDD básico (sin design phase). Tasks se crea desde cero, **no** busca design.md |
| `exists` | `true` | SDD completo, complementando tasks existentes. Lee design.md |
| `exists` | `false` | SDD básico, complementando tasks existentes. **No** busca design.md |

**Conclusión**: NO se puede capturar esto en un solo parámetro tipo `sdd_tier: "basic" | "full"` porque:

- El día que quieras `basic + design` (un tier intermedio) tenés que redefinir el enum
- Creás acoplamiento entre la fase de diseño y el estado del artifacto
- Dos booleanos te dan todas las combinaciones sin tocar el contrato

---

## 🎯 Propuesta de Contrato

### Parámetros que el orquestador pasa al sub-agente

```json
{
  "artifact_state": "new" | "exists",
  "has_design": true | false,
  "tag": "auth-v2" | null,
  "feature_name": "nombre-de-la-feature",
  "extra_params": {}
}
```

#### `artifact_state: "new"`

El sub-agente NO busca el archivo target existente. Crea el archivo desde cero usando su propia estructura interna (la que ya tiene en el system prompt). Si el archivo ya existe por algún motivo, el sub-agente decide si overwrite o aborta según el contexto.

#### `artifact_state: "exists"`

El sub-agente PRIMERO lee el archivo target existente, analiza qué hay y qué falta, y **complementa** sin perder lo que ya está escrito. No es un "merge a ciegas" — es un "analizar + mejorar".

#### `has_design: true`

El sub-agente lee `design.md` como entrada obligatoria de la fase. Si no existe, es un error.

#### `has_design: false`

El sub-agente NO intenta leer `design.md`. Cero `view_file` al pedo. El prompt no menciona design en absoluto.

### Lo que SALE del bootstrap del sub-agente

Los pasos 1-3 (ORCHESTRATOR-STATE, engram index, tag search) **desaparecen** del prompt del sub-agente. El orquestador resuelve eso y pasa solo el contexto relevante.

El nuevo bloque bootstrap sería:

```markdown
## Bootstrap (Contexto recibido del orquestador)
- **feature_name**: {feature_name}
- **artifact_state**: {new|exists}
- **has_design**: {true|false}
- **tag**: {tag|null}

## Input a leer
- docs/openspec/changes/{feature-name}/proposal.md (obligatorio)
- docs/openspec/changes/{feature-name}/spec.md (obligatorio)
- docs/openspec/changes/{feature-name}/design.md (solo si has_design=true)
```

---

## 🗑️ Casos de Uso Concretos

### Caso 1: SDD Completo, primera vez
```
artifact_state: new
has_design: true
```
→ Crea tasks.md desde cero. Lee proposal, spec, y design.

### Caso 2: SDD Básico (sin design), primera vez
```
artifact_state: new
has_design: false
```
→ Crea tasks.md desde cero. Lee solo proposal y spec.

### Caso 3: SDD Completo, complementando tasks existentes
```
artifact_state: exists
has_design: true
```
→ Lee tasks.md existente, analiza qué falta, complementa. Lee design.md como entrada.

### Caso 4: Sub-agente apply progress
```
artifact_state: exists
has_design: false
```
→ Aplica en el caso de apply-progress que se mergea con lo existente. No busca design.

---

## 🚫 Qué NO queremos

1. **Un solo parámetro que mezcle todo** — ej. `sdd_tier: "basic" | "full"` que intente inferir `has_design` y `artifact_state` al mismo tiempo. Es una bomba de acoplamiento.

2. **Que el sub-agente descubra por sí mismo el tag** — el orquestador ya sabe qué tag va. Que lo busque de nuevo es un round-trip.

3. **Que el sub-agente decida si leer design.md basándose en "existe o no"** — eso es runtime guessing. El orquestador sabe si este flujo incluye design. Que lo decida él y lo pase como parámetro.

4. **Seguir teniendo el ORCHESTRATOR-STATE como paso de bootstrap** — el sub-agente no necesita saber el estado global del orquestador. Necesita saber su **porción** de estado.

---

## 📋 Impacto por Artefacto

| Fase | Cambia bootstrap? | Recibe artifact_state? | Recibe has_design? |
|------|------------------|----------------------|-------------------|
| propose | Sí — sacar pasos 1-3 | `new` siempre (nunca se complementa un proposal existente) | `false` (no aplica, es la primera fase) |
| spec | Sí | ✅ | ✅ |
| design | Sí | ✅ | `false` (design nunca lee design) |
| tasks | Sí | ✅ | ✅ — **este es el caso que destapó el RFC** |
| apply | Sí | ✅ (para apply-progress merge) | ✅ |
| verify | Sí | ✅ | ✅ |
| archive | Sí | `exists` siempre | ✅ |

---

## 🔜 Próximos Pasos

1. Validar este RFC con el equipo
2. Generar `proposal.md` formal con el scope completo
3. Decidir si los params van como `mem_search` context en engram o como frontmatter en el prompt
4. Actualizar los prompts de cada sub-agente fase por fase
5. Actualizar la lógica del orquestador para resolver y pasar estos parámetros
6. Actualizar `022-tasks-template-sharding.md` si es necesario
