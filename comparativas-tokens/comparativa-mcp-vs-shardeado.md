# Comparativa de Consumo de Tokens: MCP Engram vs Falso Engram Shardeado

> **Propósito:** Documentación cruda y real del consumo de tokens entre el MCP Engram oficial de Gentle AI y el falso engram basado en archivos markdown shardeados de funky-ai.
>
> **Estado:** Inicial — datos estimados basados en tamaño real de archivos y overhead de tool calls. Actualizable cuando tengamos mediciones con herramientas reales.

---

## Metodología

### ¿Cómo se calculan los tokens?

Usamos la regla general estándar: **1 token ≈ 4 caracteres** para texto en español/inglés con código.

Para tool calls (MCP y bash/grep/read), contamos:
- **Input:** tool name + parameter names + parameter values (serializados como JSON)
- **Output:** tool result (lo que devuelve el MCP server o la shell)

No contamos:
- Overhead de system prompt (es fijo en ambos casos)
- Overhead de conversación (depende de cada sesión)
- Tokens de respuesta generada por el LLM (es idéntica en ambos)

### Convenciones

- Los valores son **promedios estimados** basados en archivos reales de funky-ai (51 KB, 60 entradas).
- `~` indica valor aproximado. El rango refleja variación según longitud de queries y contenido.
- "Shardeado" = falso engram post-migración (`descubrimientos/<tag>.md` + `bugfixes/<tag>.md`).
- "Monolítico" = falso engram pre-migración (`discoveries.md` + `bugfixes.md` un solo archivo cada uno).

---

## 1. Overhead de Tool Calls

Cada tool call tiene un costo fijo de serialización + transmisión. Medido en caracteres del JSON tool call / 4.

### MCP Engram

| Tool Call | Input (chars) | Input (tok) | Output típico (tok) | Total (tok) |
|-----------|--------------|-------------|---------------------|-------------|
| `mem_search("query", project)` | ~160 | ~40 | ~200-500 | ~240-540 |
| `mem_get_observation(id)` | ~100 | ~25 | ~200-400 | ~225-425 |
| `mem_context(limit: 10)` | ~140 | ~35 | ~400-600 | ~435-635 |
| `mem_save(title, type, content, topic_key)` | ~240 | ~60 | ~25 | ~85 |

### Falso Engram Shardeado

| Tool Call | Input (chars) | Input (tok) | Output típico (tok) | Total (tok) |
|-----------|--------------|-------------|---------------------|-------------|
| `bash: grep -ril "query" descubrimientos/` | ~140 | ~35 | ~20-40 (solo nombres) | ~55-75 |
| `read descubrimientos/archivo.md` | ~140 | ~35 | ~200-400 | ~235-435 |
| `ls descubrimientos/` | ~140 | ~35 | ~80-120 | ~115-155 |
| `write descubrimientos/archivo.md (content)` | ~200 | ~50 | ~15 | ~65 |
| `bash: test -f descubrimientos/archivo.md` | ~170 | ~42 | ~10 | ~52 |

### Falso Engram Monolítico (pre-migración, referencia)

| Tool Call | Input (chars) | Input (tok) | Output típico (tok) | Total (tok) |
|-----------|--------------|-------------|---------------------|-------------|
| `view_file docs/engram/index.md` | ~140 | ~35 | ~1.500 | ~1.535 |
| `view_file docs/engram/discoveries.md` | ~140 | ~35 | ~9.400 | ~9.435 |
| `grep_search "query" discoveries.md` | ~180 | ~45 | ~200-500 | ~245-545 |
| `edit docs/engram/index.md (agregar fila)` | ~200 | ~50 | ~25 | ~75 |

---

## 2. Operaciones Específicas

### 2.1 Leer un entry conocido (sabes el tag exacto)

**Escenario:** El agente ya sabe que existe `[massive-consolidation]` y quiere leerlo.

| Sistema | Pasos | Total (tok) |
|---------|-------|-------------|
| **MCP Engram** | `mem_search("massive-consolidation")` → 280-540 tok + `mem_get_observation(id)` → 225-425 tok | **~505-965** |
| **MCP Engram** (con topic_key conocido) | `mem_get_observation(id)` directo → 225-425 tok | **~225-425** |
| **Shardeado** | `read descubrimientos/massive-consolidation.md` → 235-435 tok | **~235-435** |
| **Monolítico** | `grep_search "massive-consolidation" discoveries.md` → 245-545 tok + leer resultado parcial | **~245-545** |

**Ganador:** MCP con topic_key conocido. Sin topic_key, empata con shardeado.

### 2.2 Buscar por keyword y leer el mejor match

**Escenario:** El agente busca "token diet" y quiere leer la entrada más relevante.

| Sistema | Pasos | Total (tok) |
|---------|-------|-------------|
| **MCP Engram** | `mem_search("token diet")` → 240-540 tok + `mem_get_observation(id)` → 225-425 tok | **~465-965** |
| **Shardeado** | `grep -ril "token.diet" descubrimientos/` → 55-75 tok + `read archivo.md` → 235-435 tok | **~290-510** |
| **Monolítico** | `grep_search "token.diet" discoveries.md` → 245-545 tok + leer bloque → ~200-400 tok | **~445-945** |

**Ganador:** Shardeado. `grep -ril` devuelve solo nombres de archivo (20-40 tok) vs snippets enteros del MCP (200-500 tok).

> **Nota:** Si el grep matchea 5 archivos y el agente necesita leer 2 para decidir cuál es el correcto, el shardeado suma ~235-435 tok por archivo adicional. El MCP Engram ya trajo snippets de todos los matches en un solo call, así que puede elegir sin costo extra. Hay un punto de quiebre (~3+ archivos matcheados) donde el MCP empieza a ganar.

### 2.3 Agregar una entrada nueva

**Escenario:** El agente descubre algo y lo guarda en el engram.

| Sistema | Pasos | Total (tok) |
|---------|-------|-------------|
| **MCP Engram** | `mem_save(title, type, content, topic_key)` → 85 tok + content (~200-400 tok) | **~285-485** |
| **Shardeado** | `write descubrimientos/nuevo-tag.md (content)` → 65 tok + content (~200-400 tok) | **~265-465** |
| **Monolítico** | `view_file index.md` → 1.535 tok + `edit index.md` → 75 tok + `edit discoveries.md` (append) → ~75 tok | **~1.685** |

**Ganador:** Shardeado (marginal). MCP y shardeado son casi idénticos. El monolítico pierde por tener que leer `index.md` para verificar duplicados.

### 2.4 Listar todo lo disponible (vista panorámica)

**Escenario:** El agente llega nuevo y quiere saber qué conocimiento existe.

| Sistema | Pasos | Total (tok) |
|---------|-------|-------------|
| **MCP Engram** | `mem_context(limit: 20)` → 435-635 tok (solo últimas 20) | **~435-635** |
| **Shardeado** | `ls descubrimientos/` → 115-155 tok (48 nombres) + `ls bugfixes/` → 115-155 tok (10 nombres) | **~230-310** |
| **Monolítico** | `view_file index.md` → 1.535 tok | **~1.535** |

**Ganador:** Shardeado. `ls` es ridículamente barato comparado con cualquier otra opción. El MCP Engram trae metadata adicional (fechas, tipos, resúmenes) que pueden justificar el costo extra dependiendo del caso.

### 2.5 Recuperar sesión (el agente vuelve y necesita contexto)

**Escenario:** El agente inicia una sesión nueva y necesita saber en qué estaba trabajando.

| Sistema | Pasos | Total (tok) |
|---------|-------|-------------|
| **MCP Engram** | `mem_context(limit: 10)` → 435-635 tok | **~435-635** |
| **Shardeado** | `ls descubrimientos/` + `ls bugfixes/` → 230-310 tok + opcional: leer 1-2 archivos (~235-435 c/u) | **~230-1.180** |
| **Monolítico** | `view_file index.md` → 1.535 tok + opcional: leer discoveries.md → 9.435 tok | **~1.535-10.970** |

**Ganador:** MCP Engram (si el valor está en el resumen de sesión). Shardeado (si solo necesita saber qué archivos hay).

El MCP Engram gana en **riqueza de información**: `mem_context` te dice QUÉ se hizo en sesiones anteriores. El shardeado solo te dice qué archivos existen. Para realmente retomar contexto, probablemente termines leyendo 2-3 archivos (700-1.300 tok) y ahí se emparejan.

### 2.6 Delegar a un sub-agente (costo oculto)

**Escenario:** El orquestador delega una tarea y el sub-agente necesita acceder al engram.

| Sistema | Pasos | Total (tok) |
|---------|-------|-------------|
| **MCP Engram** | 0 — el sub-agente ya tiene las tools MCP | **~0** |
| **Shardeado** | Instrucciones en el prompt de delegación: "usa `grep -ril` en `docs/engram/descubrimientos/`" | **~200-400** |
| **Monolítico** | Instrucciones + advertencia de no leer discoveries.md entero | **~200-400** |

**Ganador:** MCP Engram. Cada sub-agente que delegás paga 0 tokens extra porque las tools MCP ya están disponibles globalmente.

**Costo anualizado:** Si delegás 50 tareas/día hábil = ~250 delegaciones/semana × ~300 tok = **~75.000 tokens/semana** que el shardeado paga y el MCP no.

> **Mitigación para shardeado:** Poner las instrucciones de grep en el `worker-handoff.md` template (costo único, no por delegación). El orquestador solo pasa "usa el engram estándar" en vez de repetir las instrucciones cada vez.

---

## 3. Escenarios Reales Compuestos

### Escenario A: El agente investiga un bug

1. Busca "worker false positive" en el engram → 290-510 tok
2. Lee 2 entries relacionados → 470-870 tok
3. Agrega un nuevo bugfix encontrado → 265-465 tok
4. Lista discoveries para ver si algo más es relevante → 230-310 tok

| Sistema | Total (tok) |
|---------|-------------|
| **MCP Engram** | ~1.195-2.375 |
| **Shardeado** | ~1.255-2.155 |
| **Monolítico** | ~2.245-4.475 |

### Escenario B: Code review con búsqueda de contexto

1. Recupera sesión anterior → 435-635 tok
2. Busca 3 keywords distintas → 3 × 290-510 tok
3. Lee 1 entry encontrado → 235-435 tok

| Sistema | Total (tok) |
|---------|-------------|
| **MCP Engram** | ~1.540-3.020 |
| **Shardeado** | ~1.300-2.500 |
| **Monolítico** | ~2.640-7.940 |

### Escenario C: Onboarding de nuevo agente

1. Lista todo el engram → 230-310 tok
2. Lee 5 entries clave → 5 × 235-435 tok
3. Lee 2 bugfixes relevantes → 2 × 235-435 tok

| Sistema | Total (tok) |
|---------|-------------|
| **MCP Engram** | ~2.260-4.350 |
| **Shardeado** | ~1.880-3.640 |
| **Monolítico** | ~3.170-9.870 |

---

## 4. Fórmulas de Cálculo

Para recalcular con tus propios números cuando el engram crezca:

### MCP Engram

```
leer_con_tag(tag)   = 225 + entry_tok + noise        // ≈ 225-625
                     // noise si hay que buscar primero

buscar(query)        = 40 + snippet_tok               // ≈ 40-500
                     // snippet_tok depende de cuántos matches

leer_por_id(id)     = 25 + entry_tok                  // ≈ 225-425

agregar(entry)      = 285 + content_tok               // ≈ 285-685

recuperar_sesion    = 435 + (entries × summary_tok)   // ≈ 435-635 (limit 10)
```

### Shardeado

```
leer_archivo(tag)   = 35 + file_tok                   // ≈ 235-435
                     // file_tok ≈ tamaño del archivo / 4

buscar(query)        = 35 + 10 + files_matched         // ≈ 45-85
                     // el resultado es solo nombres, casi gratis

agregar(entry)      = 65 + content_tok                // ≈ 265-465

listar_todo         = 35 + (files × 2)                // ≈ 115-155 (48 files)
```

### Monolítico (referencia, pre-migración)

```
leer_index          = 35 + index_tok                  // ≈ 1.535
                     // index_tok = ~1.500 (63 líneas)

leer_discoveries    = 35 + discoveries_tok            // ≈ 9.435
                     // discoveries_tok = ~9.400 (241 líneas)

buscar_en_file      = 45 + snippet_tok                // ≈ 245-545
```

---

## 5. Tabla Definitiva

| Operación | MCP Engram | Shardeado | Monolítico | Ganador |
|-----------|-----------|-----------|------------|---------|
| Leer entry conocido (con topic_key) | ~225-425 | ~235-435 | ~245-545 | **MCP** (marginal) |
| Leer entry conocido (sin topic_key) | ~505-965 | ~235-435 | ~245-545 | **Shardeado** |
| Buscar + leer 1 match | ~465-965 | ~290-510 | ~445-945 | **Shardeado** |
| Buscar + leer 3 matches | ~465-965 | ~760-1.380 | ~445-945 | **MCP** (emparda con snippets) |
| Agregar entrada | ~285-485 | ~265-465 | ~1.685 | **Shardeado** (marginal) |
| Listar todo | ~435-635 | ~230-310 | ~1.535 | **Shardeado** |
| Recuperar sesión | ~435-635 | ~230-1.180 | ~1.535-10.970 | **Depende** |
| Delegar (costo oculto) | ~0 | ~200-400 | ~200-400 | **MCP** |
| **Escenario A (investigar bug)** | ~1.195-2.375 | ~1.255-2.155 | ~2.245-4.475 | **Shardeado** (marginal) |
| **Escenario B (code review)** | ~1.540-3.020 | ~1.300-2.500 | ~2.640-7.940 | **Shardeado** |
| **Escenario C (onboarding)** | ~2.260-4.350 | ~1.880-3.640 | ~3.170-9.870 | **Shardeado** |

---

## 6. Conclusión

### El shardeado gana en crudo

En la mayoría de las operaciones diarias, el falso engram shardeado consume **igual o menos tokens** que el MCP Engram oficial. La razón principal:

1. **`ls` y `grep -ril` son casi gratis** — devuelven metadata mínima en comparación con los tool calls MCP que siempre traen bodies parciales o metadata estructurada.
2. **No hay intermediario** — el filesystem no agrega overhead de serialización de respuestas estructuradas.

### El MCP Engram gana en calidad y ecosistema

Donde el MCP Engram realmente supera al shardeado NO es en tokens:

| Aspecto | MCP Engram | Shardeado |
|---------|-----------|-----------|
| **FTS5 search** | Stemming, ranking, fuzzy matching | Regex plano (`grep`) |
| **Timestamps automáticos** | Sí | No (hay que agregarlos manualmente) |
| **Deduplicación** | Nativa (topic_key) | Manual (test -f) |
| **Costo de delegación** | 0 tok | ~200-400 tok por sub-agente |
| **Persistencia cross-session** | Automática | Archivos en disco (git-trackeable) |
| **Portabilidad** | Solo IDEs con MCP | Cualquier IDE que lea archivos |

### TL;DR

Si tu IDE soporta MCP y no tienes problemas de conectividad → **usa el MCP Engram**. La diferencia de tokens es insignificante (~200-400 tok por operación) y ganas FTS5, deduplicación, y cero boilerplate en delegaciones.

Si tu IDE no soporta MCP o está inestable (como tu caso actual) → **el falso engram shardeado es perfectamente viable**. Estás perdiendo features de búsqueda, no eficiencia de tokens. De hecho, en operaciones de listar y buscar con grep, el shardeado es **más barato**.

---

## Apéndice A: Datos de los archivos reales de funky-ai

```yaml
# docs/engram/ al 2026-05-29
archivos:
  index.md:
    lineas: 63
    bytes: 6.165
    tokens_estimados: ~1.500
  discoveries.md:
    lineas: 241
    bytes: 37.718
    tokens_estimados: ~9.400
  bugfixes.md:
    lineas: 57
    bytes: 7.171
    tokens_estimados: ~1.800

total:
  lineas: 361
  bytes: 51.054
  tokens: ~12.700

entries:
  discoveries: 48
  bugfixes: 10
  total: 58
```

## Apéndice B: Archivos individuales post-shardeo

```yaml
tamaño_promedio_por_entry:
  bytes: ~400-800
  tokens: ~100-200

tokens_por_consulta_tipica:
  "ls descrubrimientos/":
    input: 35 tok
    output: ~80-120 tok (48 archivos)
    total: ~115-155 tok
  "read un entry":
    input: 35 tok
    output: ~100-200 tok
    total: ~135-235 tok
  "grep -ril keyword":
    input: 35 tok
    output: ~20-40 tok (nombres de archivo)
    total: ~55-75 tok
```
