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

### La Idea: Shardear por entrada

En lugar de dos archivos que lo contienen TODO, usar **un archivo por observación**, exactamente como funciona el MCP Engram real pero sobre el filesystem:

```
docs/engram/
├── descubrimientos/
│   ├── model-efficacy-quota.md
│   ├── massive-consolidation.md
│   ├── sdd-template-quality-gap.md
│   ├── cli-missing-readme.md
│   ├── orchestrator-context-overload.md
│   ├── memory-polling-index-layer.md
│   └── ... (uno por tag)
├── bugfixes/
│   ├── ci-lockfile-mismatch.md
│   ├── worker-prompt-persistence.md
│   ├── test-mock-drift.md
│   └── ... (uno por tag)
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

| Operación | Hoy (monolítico) | Shardeado |
|-----------|------------------|-----------|
| **Listar qué hay** | Leer `index.md` → ~1.500 tokens | `ls descubrimientos/` → 0 tokens |
| **Buscar por keyword** | `grep "keyword" discoveries.md` → escanea 9.400 tokens | `grep -ril "keyword" descubrimientos/` → solo nombres de archivo |
| **Leer UN discovery** | Mismo grep + leer todo, o leer archivo entero | `view_file descubrimientos/massive-consolidation.md` → ~200-400 tokens |
| **Agregar uno nuevo** | Leer index (1.500) + edit (400) + append (400) = ~2.300 | Escribir archivo nuevo → ~500 tokens |
| **Saber si un tag existe** | Leer index.md entero o grep general | `test -f descubrimientos/ese-tag.md` → 0 tokens |
| **Migrar masivo** | N/A | Script: leer discoveries.md, partir en archivos, borrar |

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
    "file": "descubrimientos/model-efficacy-quota.md",
    "created": "2026-03-15"
  },
  ...
}
```

### Migración desde el formato actual

1. Script que parsea `discoveries.md` y `bugfixes.md`
2. Por cada bloque `### [tag]`, crea `descubrimientos/<tag>.md` o `bugfixes/<tag>.md`
3. Opcionalmente genera `index.md` y/o `index.json`
4. Los archivos monolíticos viejos se borran (o se archivan)

El script puede ser bash puro o un comando de `funky-cli`. El formato markdown actual ya tiene bloques bien delimitados:

```bash
# Pseudo-lógica por cada bloque
while IFS= read -r line; do
    if [[ $line =~ ^###\ \[([^\]]+)\] ]]; then
        tag="${BASH_REMATCH[1]}"
        # empezar a capturar hasta el próximo ### o EOF
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
# Buscar → solo nombres de archivo, 0 overhead de contenido
bash: grep -ril "token" docs/engram/descubrimientos/

# Leer exactamente lo que necesito → ~200-400 tokens
view_file docs/engram/descubrimientos/massive-consolidation.md

# Agregar nuevo → escribo el archivo, no necesito leer nada
write docs/engram/descubrimientos/mi-nuevo-hallazgo.md
```

### Ventajas colaterales

- **Paralelismo:** El `funky engram add` puede escribir un archivo nuevo sin lockear nada
- **Git diffs limpios:** Un cambio en una observación no toca el diff de las otras 59
- **Git blame útil:** Podés ver exactamente cuándo y por qué se agregó CADA observación
- **Eliminación trivial:** Borrar un archivo vs. editar un markdown de 200 líneas
- **Tags sin naming collision:** El filename es el tag, no hay riesgo de duplicados

### Desventajas / Riesgos

- **Muchos archivos:** 100 entradas = 100 archivos. En Windows, `ls` de directorios con muchos archivos es más lento, pero 100-200 archivos no es nada.
- **No podés "leer todo" fácil:** Si QUERÉS leer todo el engram de una (ej: onboarding de un nuevo dev), no hay un solo archivo. Solución: el `funky engram index` regenera un index.md que es la vista panorámica.
- **Los scripts de grep existentes en worker-handoff.md necesitan actualización:** Donde dice `grep_search "[tag]" docs/engram/discoveries.md` debería apuntar a los directorios shardeados.
- **Perdés la inercia de "abrir discoveries.md y scrollear":** Para humanos que se acostumbraron a leer el archivo entero, el cambio es cultural. Mitigación: el index.md sigue existiendo con la tabla resumen.

---

## 📐 Arquitectura propuesta del directorio final

```
docs/engram/
├── .gitkeep                    ← preserva estructura vacía
├── index.md                    ← auto-generado por `funky engram index`
├── descubrimientos/
│   ├── model-efficacy-quota.md
│   ├── massive-consolidation.md
│   ├── sdd-template-quality-gap.md
│   ├── cli-missing-readme.md
│   ├── release-dod-gap.md
│   ├── worker-invocation-prompt.md
│   ├── cli-testing-pure-functions.md
│   ├── tty-headless-e2e-limitation.md
│   ├── worker-return-envelope-compliance.md
│   ├── smoke-test-is-dod.md
│   ├── cli-template-sync-drift.md
│   ├── agent-cognitive-load.md
│   ├── pnpm-strict-usage.md
│   ├── agent-dry-handoffs.md
│   ├── skills-obsolescence-vs-templates.md
│   ├── documentation-vs-enforcement.md
│   ├── versioning-policy.md
│   ├── phase0-t1-automation.md
│   ├── release-template-ssot.md
│   ├── readme-template-context-drift.md
│   ├── memory-polling-index-layer.md
│   ├── openspec-backlog-lifecycle.md
│   ├── orchestrator-planning-checklist.md
│   ├── assess-gate-context-expansion.md
│   ├── sdd-failure-forensics-007.md
│   ├── release-actor-split.md
│   ├── handoff-as-return-statement.md
│   ├── rfc-semantics-enforcement.md
│   ├── cli-orchestrator-circular-dependency.md
│   ├── doc-update-index-manual-drift.md
│   ├── inquirer-integration.md
│   ├── t1-scaffolding-purge.md
│   ├── cli-base-immutable.md
│   ├── orchestrator-context-overload.md
│   ├── system-prompt-vs-chat-history.md
│   ├── context-economy.md
│   ├── orchestrator-role-boundary.md
│   └── model-assessment-gemini-3.5-flash.md
├── bugfixes/
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
└── ARCHIVO_DE_MIGRACION.md     ← instrucciones post-migración
```

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
- **NO es un cambio en el schema de los datos.** Cada entry mantiene el formato `### [tag]` + `**What:**` + etc. Solo cambia dónde vive.
- **NO es más complejo para el humano.** El index.md sigue dando la vista panorámica. Los directorios son simplemente una organización más limpia.
