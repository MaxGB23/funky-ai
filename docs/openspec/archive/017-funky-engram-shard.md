# RFC: 017-funky-engram-shard

> **🛑 WARNING PARA LA IA (ORQUESTADOR):**
> Este documento es un **RFC (Request for Comments) / Brain Dump**. Son notas crudas del humano.
> **NO ES UN PROPOSAL FORMAL**. Bajo ninguna circunstancia debes tomar esto como una especificación técnica final o empezar a generar código basado directamente en esto.
> Tu trabajo en la fase de Orquestación es **leer esto, extraer la intención, validar viabilidad, y generar un `proposal.md` formal** en el directorio del change.

---

## 🧠 El Problema

El falso engram (`docs/engram/`) actual usa **archivos monolíticos**:

```
docs/engram/
├── index.md           ← 63 líneas, ~1.500 tokens
├── discoveries.md     ← 241 líneas, ~9.400 tokens  ← crece siempre
└── bugfixes.md        ← 57 líneas, ~1.800 tokens   ← crece siempre
```

A 60 entradas ya tenemos **~12.700 tokens totales**. Cuando llegue a 200-300 entradas, leer cualquiera de estos archivos va a consumir una parte significativa del contexto.

El `funky engram add` (RFC 016) resuelve el problema de **escritura** — permite agregar sin leer todo el archivo. Pero no resuelve la **lectura**: el agente sigue necesitando grepear `discoveries.md` entero para encontrar un discovery específico, pagando O(n) tokens donde n es el tamaño del archivo.

Además, el MCP Engram oficial de Gentle AI no está disponible temporalmente (a la espera de un update que lo solucione). Necesitamos una solución intermedia que:

1. Sea **eficiente en tokens** para el agente
2. Siga siendo **archivos planos** (sin MCPs, sin infraestructura)
3. Sea **git-trackeable**
4. Escale a cientos de entradas sin degradarse

---

## 🗑️ Brain Dump

### La Idea: Shardear por entrada + tipo

En lugar de dos archivos que lo contienen TODO, usar **un archivo por observación** organizado en subdirectorios por **tipo**, reflejando el schema del MCP Engram real (`type: architecture | pattern | discovery | decision | bugfix`).

Esto resuelve dos problemas a la vez:
1. **Eficiencia de lectura** — un archivo por entry, O(1)
2. **Separación semántica** — no mezclar una decisión de arquitectura con un hallazgo técnico

```
docs/engram/
├── architecture/         ← decisiones de arquitectura del sistema
│   ├── massive-consolidation.md
│   ├── agent-cognitive-load.md
│   ├── documentation-vs-enforcement.md
│   ├── readme-template-context-drift.md
│   ├── memory-polling-index-layer.md
│   ├── orchestrator-planning-checklist.md
│   ├── assess-gate-context-expansion.md
│   ├── handoff-as-return-statement.md
│   ├── rfc-semantics-enforcement.md
│   ├── cli-base-immutable.md
│   ├── system-prompt-vs-chat-history.md
│   └── orchestrator-role-boundary.md
├── pattern/              ← patrones establecidos (cómo se hacen las cosas)
│   ├── in-template-rule-injection.md
│   ├── cli-missing-readme.md
│   ├── release-dod-gap.md
│   ├── worker-invocation-prompt.md
│   ├── cli-testing-pure-functions.md
│   ├── worker-return-envelope-compliance.md
│   ├── smoke-test-is-dod.md
│   ├── cli-template-sync-drift.md
│   ├── pnpm-strict-usage.md
│   ├── agent-dry-handoffs.md
│   ├── skills-obsolescence-vs-templates.md
│   ├── openspec-backlog-lifecycle.md
│   ├── doc-update-index-manual-drift.md
│   ├── t1-scaffolding-purge.md
│   └── context-economy.md
├── discovery/            ← hallazgos, evaluaciones, post-mortems
│   ├── model-efficacy-quota.md
│   ├── sdd-template-quality-gap.md
│   ├── tty-headless-e2e-limitation.md
│   ├── cli-orchestrator-circular-dependency.md
│   ├── orchestrator-context-overload.md
│   ├── model-assessment-gemini-3.5-flash.md
│   ├── sdd-failure-forensics-007.md
│   └── inquirer-integration.md
├── decision/             ← decisiones explícitas con impacto en el proyecto
│   ├── versioning-policy.md
│   ├── phase0-t1-automation.md
│   ├── release-template-ssot.md
│   ├── release-actor-split.md
│   └── skills-obsolescence-vs-templates.md
├── bugfix/               ← bugs corregidos (bugfixes actuales)
│   ├── ci-lockfile-mismatch.md
│   ├── worker-prompt-persistence.md
│   ├── git-ops-orchestrator.md
│   ├── worker-tier-omission.md
│   ├── phase-template-path.md
│   ├── cli-headless-overwrite.md
│   ├── stale-post-mortem-ref.md
│   ├── worker-report-false-positive.md
│   ├── test-mock-drift.md
│   └── silent-spec-skip.md
├── index.md                      ← auto-generado, opcional
└── index.json                    ← para consumo programático, opcional
```

Cada archivo contiene el bloque markdown de una sola observación:

```markdown
### [model-efficacy-quota]
**What:** Evaluación de modelos: Flash=Worker, Pro Low=Orquestador, Sonnet=crisis
**Why:** Encontramos que asignar el modelo incorrecto a cada rol causaba context overflow en Workers y costo excesivo en Orquestador.
**Where:** docs/openspec/changes/custom-workflows/worker-handoff.md
**Learned:** La asignación de modelo no es técnica pura — depende del rol cognitivo que cumple cada agente en el flujo SDD.
```

### Costos comparativos

| Operación | Hoy (monolítico) | Shardeado por tipo |
|-----------|------------------|--------------------|
| **Listar qué hay** | Leer `index.md` → ~1.500 tokens | `ls */` en cada tipo → ~100-200 tokens |
| **Buscar por keyword en todo** | `grep "keyword" discoveries.md` → escanea 9.400 tokens | `grep -ril "keyword" architecture/ pattern/ discovery/ decision/ bugfix/` → solo nombres de archivo |
| **Buscar en un tipo específico** | Idem, no hay separación | `grep -ril "keyword" architecture/` → escanea solo ~12 archivos |
| **Leer UN entry** | Mismo grep + leer todo, o leer archivo entero | `view_file architecture/massive-consolidation.md` → ~200-400 tokens |
| **Agregar uno nuevo** | Leer index (1.500) + edit (400) + append (400) = ~2.300 | Escribir archivo en el tipo correcto → ~500 tokens |
| **Saber si un tag existe** | Leer index.md entero o grep general | `test -f architecture/ese-tag.md` → 0 tokens |
| **Migrar masivo** | N/A | Script: leer discoveries.md, clasificar por tipo, partir en archivos |

### Estructura del archivo individual

Cada archivo sigue el schema engram existente para mantener consistencia:

- **Filename:** `<tag-sanitizado>.md`
- **Formato interno:** El mismo `### [tag]` + `**What:**` + `**Why:**` + `**Where:**` + `**Learned:**` que ya tenemos.
- **Frontmatter (opcional):** Se podría agregar YAML frontmatter para metadatos parseables:

```markdown
---
type: discovery
tag: model-efficacy-quota
created: 2026-05-27
---
### [model-efficacy-quota]
**What:** ...
```

Pero esto agrega complejidad al `funky engram add`. Mejor mantenerlo simple — el formato markdown plano actual ya es parseable por un script si hace falta.

### ¿Qué hacemos con index.md?

**Eliminarlo como fuente de verdad.** El index.md actual tiene dos problemas:
1. Se desincroniza siempre (drift)
2. Hay que leerlo entero para saber qué hay

**Opción A (recomendada): Index dinámico vía script**
Un comando `funky engram index` que regenera `index.md` a partir del `ls` de los directorios. Se corre bajo demanda. El agente no lo necesita para operar — solo para visión humana.

**Opción B: Sin index fijo**
El `ls` + `grep -rl` cubre el 100% de las necesidades del agente. El humano puede explorar con el explorador de archivos del IDE.

**Opción C: index.json (para consumo programático)**
Además o en lugar del index.md, un `index.json` que el `funky engram add` actualiza atómicamente. El agente puede leer JSON con menos overhead que markdown:

```json
{
  "model-efficacy-quota": {
    "type": "discovery",
    "desc": "Flash=Worker, Pro Low=Orquestador, Sonnet=crisis",
    "file": "discovery/model-efficacy-quota.md",
    "created": "2026-03-15"
  },
  ...
}
```

### Migración desde el formato actual

1. Script que parsea `discoveries.md` y `bugfixes.md`
2. Clasifica cada bloque en su tipo (`architecture`, `pattern`, `discovery`, `decision`, `bugfix`) según su contenido y tag
3. Crea `docs/engram/<tipo>/<tag>.md` por cada bloque
4. Opcionalmente genera `index.md` y/o `index.json`
5. Los archivos monolíticos viejos se borran (o se archivan)

El script puede ser bash puro o un comando de `funky-cli`. La clasificación por tipo puede ser:
- **Automática**: basada en heurísticas del tag (ej: `*fix*` → `bugfix`, `orchestrator-*` o `architecture-*` → `architecture`, `pattern-*` → `pattern`)
- **Manual**: un paso interactivo donde el humano confirma el tipo de cada entry, o un segundo paso opcional

```bash
# Pseudo-lógica por cada bloque
while IFS= read -r line; do
    if [[ $line =~ ^###\ \[([^\]]+)\] ]]; then
        tag="${BASH_REMATCH[1]}"
        # determinar tipo por heurística o input manual
        tipo=$(clasificar_tipo "$tag" "$bloque")
        # crear archivo en el subdirectorio correspondiente
        mkdir -p "docs/engram/$tipo"
        echo "$bloque" > "docs/engram/$tipo/$tag.md"
    fi
done < discoveries.md
```

### ¿Qué cambia en el flujo del agente?

**Antes:**
```bash
# Leer el index → 1.500 tokens para saber qué hay
view_file docs/engram/index.md

# Buscar algo específico → grep de 9.400 tokens
grep_search "token" docs/engram/discoveries.md

# Leer el resultado → view de discoveries.md entero si no hay grep
view_file docs/engram/discoveries.md
```

**Después:**
```bash
# Buscar en todos los tipos → solo nombres de archivo, 0 overhead de contenido
bash: grep -ril "token" docs/engram/architecture/ docs/engram/pattern/ docs/engram/discovery/ docs/engram/decision/ docs/engram/bugfix/

# O buscar en un tipo específico si ya sé dónde mirar
bash: grep -ril "handoff" docs/engram/architecture/

# Leer exactamente lo que necesito → ~200-400 tokens
view_file docs/engram/architecture/memory-polling-index-layer.md

# Agregar nuevo → escribo el archivo en el tipo correcto
write docs/engram/architecture/mi-decision-arquitectonica.md
```

### Ventajas colaterales

- **Paralelismo:** El `funky engram add` puede escribir un archivo nuevo sin lockear nada
- **Git diffs limpios:** Un cambio en una observación no toca el diff de las otras 59
- **Git blame útil:** Podés ver exactamente cuándo y por qué se agregó CADA observación
- **Eliminación trivial:** Borrar un archivo vs. editar un markdown de 200 líneas
- **Tags sin naming collision:** El filename es el tag, no hay riesgo de duplicados

### Desventajas / Riesgos

- **Muchos archivos:** 50 entradas = 50 archivos en 5 directorios. En Windows, `ls` en directorios con muchos archivos es más lento, pero 100-200 archivos no es nada.
- **No podés "leer todo" fácil:** Si QUERÉS leer todo el engram de una (ej: onboarding de un nuevo dev), no hay un solo archivo. Solución: el `funky engram index` regenera un index.md que es la vista panorámica.
- **Los scripts de grep existentes en worker-handoff.md necesitan actualización:** Donde dice `grep_search "[tag]" docs/engram/discoveries.md` debería apuntar a los 5 directorios por tipo.
- **Perdés la inercia de "abrir discoveries.md y scrollear":** Para humanos que se acostumbraron a leer el archivo entero, el cambio es cultural. Mitigación: el index.md sigue existiendo con la tabla resumen.
- **Clasificación por tipo no es trivial:** Migrar automáticamente requiere heurísticas para decidir si algo es `architecture`, `pattern`, `discovery` o `decision`. Algunos entries pueden ser fronterizos (ej: `skills-obsolescence-vs-templates` podría ser pattern o decision).
- **Overhead de elegir tipo al agregar:** Cada nueva entrada requiere decidir en qué directorio va. El `funky engram add` debería pedir el tipo como parámetro obligatorio.
- **Más directorios para explorar:** 5 directorios en vez de 2. El agente necesita saber dónde buscar o usar `grep -rl` contra varios directorios.

---

## 📐 Arquitectura propuesta del directorio final

```
docs/engram/
├── .gitkeep                    ← preserva estructura vacía
├── index.md                    ← auto-generado por `funky engram index`
│
├── architecture/               ← 12 entries — decisiones de arquitectura
│   ├── massive-consolidation.md
│   ├── agent-cognitive-load.md
│   ├── documentation-vs-enforcement.md
│   ├── readme-template-context-drift.md
│   ├── memory-polling-index-layer.md
│   ├── orchestrator-planning-checklist.md
│   ├── assess-gate-context-expansion.md
│   ├── handoff-as-return-statement.md
│   ├── rfc-semantics-enforcement.md
│   ├── cli-base-immutable.md
│   ├── system-prompt-vs-chat-history.md
│   └── orchestrator-role-boundary.md
│
├── pattern/                    ← 15 entries — patrones establecidos
│   ├── in-template-rule-injection.md
│   ├── cli-missing-readme.md
│   ├── release-dod-gap.md
│   ├── worker-invocation-prompt.md
│   ├── cli-testing-pure-functions.md
│   ├── worker-return-envelope-compliance.md
│   ├── smoke-test-is-dod.md
│   ├── cli-template-sync-drift.md
│   ├── pnpm-strict-usage.md
│   ├── agent-dry-handoffs.md
│   ├── skills-obsolescence-vs-templates.md
│   ├── openspec-backlog-lifecycle.md
│   ├── doc-update-index-manual-drift.md
│   ├── t1-scaffolding-purge.md
│   └── context-economy.md
│
├── discovery/                  ← 8 entries — hallazgos y evaluaciones
│   ├── model-efficacy-quota.md
│   ├── sdd-template-quality-gap.md
│   ├── tty-headless-e2e-limitation.md
│   ├── cli-orchestrator-circular-dependency.md
│   ├── orchestrator-context-overload.md
│   ├── model-assessment-gemini-3.5-flash.md
│   ├── sdd-failure-forensics-007.md
│   └── inquirer-integration.md
│
├── decision/                   ← 5 entries — decisiones explícitas
│   ├── versioning-policy.md
│   ├── phase0-t1-automation.md
│   ├── release-template-ssot.md
│   ├── release-actor-split.md
│   └── skills-obsolescence-vs-templates.md
│
├── bugfix/                     ← 10 entries — bugs corregidos
│   ├── ci-lockfile-mismatch.md
│   ├── worker-prompt-persistence.md
│   ├── git-ops-orchestrator.md
│   ├── worker-tier-omission.md
│   ├── phase-template-path.md
│   ├── cli-headless-overwrite.md
│   ├── stale-post-mortem-ref.md
│   ├── worker-report-false-positive.md
│   ├── test-mock-drift.md
│   └── silent-spec-skip.md
│
└── ARCHIVO_DE_MIGRACION.md     ← instrucciones post-migración
```

**Total: 50 entries** (12 architecture + 15 pattern + 8 discovery + 5 decision + 10 bugfix).

---

## 🔮 Próximos pasos posibles (si se acepta)

1. Escribir script de migración (`scripts/migrate-engram.sh` o comando `funky engram migrate`)
2. Ejecutarlo: parte `discoveries.md` y `bugfixes.md` en archivos individuales
3. Actualizar `funky engram add` (RFC 016) para que escriba archivos nuevos en los subdirectorios
4. Actualizar referencias en `worker-handoff.md` y templates que usan `grep_search` contra los archivos viejos
5. Decidir si mantener index.md como auto-generado o dejarlo morir

---

## 🎯 Qué NO es esto

- **NO es un reemplazo del MCP Engram de Gentle AI.** Cuando el MCP Engram oficial vuelva a estar disponible, esta estructura de archivos puede coexistir o ser reemplazada. El objetivo es tener algo que funcione AHORA sin MCPs.
- **NO es un cambio en el schema de los datos.** Cada entry mantiene el formato `### [tag]` + `**What:**` + etc. Solo cambia dónde vive y cómo se clasifica.
- **NO es más complejo para el humano.** El index.md sigue dando la vista panorámica. Los directorios por tipo reflejan exactamente el `type` que usa el MCP Engram real, así que la migración futura es directa.
- **NO es una clasificación definitiva.** La asignación de tipo de cada entry existente es opinable. Se puede ajustar después de la migración moviendo archivos entre directorios.
