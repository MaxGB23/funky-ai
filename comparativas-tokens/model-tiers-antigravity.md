# Antigravity — Model Tiers & Subagent Research

> **Sesión:** 2026-08-17  
> **Método:** Experimentos en vivo — subagentes interrogados sobre su identidad, workspace, y comportamiento de quota.

---

## 1. Aliases de Modelo (`invoke_subagent` → `Model`)

El parámetro `Model` en `invoke_subagent` acepta 4 valores fijos. No son nombres de modelos reales — son aliases internos que Antigravity resuelve:

```
"Model": "inherit" | "pro" | "flash" | "flash_lite"
```

---

## 2. Tabla de Aliases — Hallazgos Experimentales

| Alias | Modelo auto-reportado | Contexto | Quota del usuario | Identidad estable |
|---|---|---|---|---|
| `flash_lite` | Gemini 1.5 Pro (build 0801) | 2,000,000 tokens | ❌ **NO consume** | ✅ Consistente |
| `flash` | Gemini 3.7 Flash | 1,048,576 tokens | ✅ Consume | ✅ Consistente |
| `pro` | Vago — "familia 1.5/2.0" | ~2,000,000 tokens | ✅ Consume | ❌ Router dinámico |
| `inherit` | Claude Sonnet 4.5 (medium effort) | 200,000 tokens | ✅ Consume | ✅ Consistente |

---

## 3. Hallazgos Clave

### 3.1 `flash_lite` NO consume model quota
Confirmado en dos escenarios:
- Con quota al **0%**: el subagente igualmente se ejecutó y completó tareas (incluida escritura de archivos).
- Con quota **recargada**: tampoco movió el contador.

**Hipótesis:** `flash_lite` corre sobre infraestructura de Google separada del pool de quota personal. Es el tier más económico operativamente.

### 3.2 `flash_lite` es Gemini 1.5 Pro — no un Flash moderno
Contraintuitivo pero confirmado: el tier "lite" usa un modelo de generación anterior (1.5) con 2M de contexto, no una versión capada del Flash actual. Google lo mantiene en alta disponibilidad como tier barato/legacy.

### 3.3 `flash` mapea a Gemini 3.7 Flash — no 3.5 ni 3.6
La documentación oficial de Antigravity menciona 3.5 Flash como default del IDE, pero el tier `flash` de subagentes resolvió a **3.7 Flash** experimentalmente. El subagente reportó explícitamente que **no tiene throttling especial**.

### 3.4 `pro` es un router dinámico — no un modelo fijo
En dos intentos consecutivos, `pro` no pudo (o no quiso) identificar su versión exacta. Dijo "versión gestionada por la API/CLI". Reportó API overloaded en el primer intento. Contexto de ~2M tokens pero sin ID concreto.

**Conclusión:** `pro` apunta a un endpoint de Google que puede cambiar el modelo subyacente según carga, región o tier. No es determinista.

### 3.5 `inherit` hereda Sonnet 4.5 con effort medium — no el modelo exacto del padre
Aunque el agente padre estaba en **Claude Sonnet 4.6 (Thinking)**, el subagente `inherit` reportó:
- Modelo: `claude-sonnet-4-5`
- Effort: **medium** (no full/max)

**Implicación crítica:** `inherit` NO es un espejo 1:1 del modelo del padre. Hay un downgrade de versión y de effort. No delegues tareas de razonamiento pesado asumiendo que `inherit` tendrá el mismo poder que el agente orquestador.

### 3.6 Fallback con 0% de quota Gemini
Cuando la quota Gemini estaba agotada y se delegó `flash_lite`, el sistema **no falló — degradó silenciosamente** a Gemini 1.5 Pro (el mismo modelo que normalmente usa). No hubo warning ni error. Esto sugiere que el fallback y el modelo "real" de `flash_lite` son el mismo, y que efectivamente no usa tu quota.

---

## 4. Workspace Modes

El segundo parámetro relevante en `invoke_subagent` es `Workspace`:

```
"Workspace": "inherit" | "branch" | "share"
```

| Modo | Comportamiento | Cuándo usarlo |
|---|---|---|
| `inherit` | Mismo workspace exacto del padre | Extensión directa del agente padre |
| `branch` | Workspace aislado clonado del padre | Experimentos, POCs, features en paralelo sin riesgo |
| `share` | Directorio subyacente compartido, ramas independientes | Dos agentes en distintas branches del mismo repo |

**`branch` es el modo de mayor valor práctico:** el subagente puede escribir, modificar y romper cosas sin afectar el workspace original. El padre decide qué integrar al terminar.

---

## 5. Información del Filtrado Interno (Confianza Media)

Estos datos provienen de un `tieredModelIds` filtrado de Antigravity — no son documentación oficial:

| Alias | ID interno filtrado |
|---|---|
| `flash_lite` | `gemini-3.1-flash-lite` |
| `flash` | `gemini-3.6-flash-tiered` |
| `pro` | `gemini-3.1-pro-low` |

**Contraste con experimento en vivo:** `flash` reportó ser `gemini-3.7-flash`, no `3.6`. El filtrado podría estar desactualizado o el routing puede variar. El sufijo `-tiered` del ID interno no se traduce en throttling visible según el propio subagente.

---

## 6. Orden de Costo Estimado (Mayor → Menor)

```
inherit (Sonnet 4.6 Thinking full)   ← más caro — usa tu quota principal
pro     (router dinámico ~2.0 Pro)   ← caro — quota Gemini
flash   (Gemini 3.7 Flash)           ← moderado — quota Gemini
flash_lite (Gemini 1.5 Pro)          ← mínimo / gratis — NO consume quota personal
```

---

## 7. Recomendaciones Prácticas

| Caso de uso | Tier recomendado |
|---|---|
| Razonamiento profundo, refactors complejos | `inherit` (con conciencia del downgrade a 4.5) |
| Análisis técnico, implementación moderada | `pro` |
| Research, búsqueda en docs, lectura de archivos | `flash` |
| Extracción de datos, clasificación, scraping masivo | `flash_lite` (no gasta quota) |
| Experimentos sin riesgo al workspace | Cualquier tier + `Workspace: "branch"` |
| Paralelismo real en el mismo repo | Múltiples `branch` simultáneos |

---

## 8. Tipos de Subagente (`TypeName`)

El parámetro `TypeName` en `invoke_subagent` controla **qué herramientas** tiene disponibles el subagente. Es ortogonal al `Model` — puedes combinar cualquier TypeName con cualquier tier.

### `research` — Solo lectura
Herramientas: `grep_search`, `view_file`, `list_dir`, `search_web`, `read_url_content`, `send_message`.  
**No puede** escribir archivos ni ejecutar comandos.

```jsonc
// Caso de uso: explorar el codebase o buscar docs sin riesgo
{
  "TypeName": "research",
  "Model": "flash_lite",   // barato — ideal para research masivo
  "Prompt": "Busca todos los archivos que usen 'invoke_subagent' y resume los patrones."
}
```

### `self` — Configuración completa heredada
Herramientas: todas (write, run_command, browser, MCP, etc.).  
Hereda **system prompt completo**, reglas, persona y MCP del padre.  
⚠️ También hereda la persona del agente — el subagente hablará igual que tú.

```jsonc
// Caso de uso: tareas de escritura que requieren el mismo contexto de reglas
{
  "TypeName": "self",
  "Model": "flash",        // modelo diferente al padre — útil para ahorrar quota
  "Workspace": "branch",   // aislado — puede romper cosas sin riesgo
  "Prompt": "Implementa el feature X siguiendo las reglas del proyecto."
}
```

### `define_subagent` — Agente personalizado desde cero
Primero defines el agente con `define_subagent` (system prompt propio, tools seleccionados), luego lo invocas con `invoke_subagent`.  
**Ventaja:** Control total sobre el comportamiento. No hereda nada del padre — es un agente limpio.

```jsonc
// Paso 1: definir
define_subagent({
  name: "linter-agent",
  system_prompt: "Eres un agente especializado en revisar código TypeScript...",
  enable_write_tools: false,
  enable_mcp_tools: false
})

// Paso 2: invocar
invoke_subagent({
  TypeName: "linter-agent",
  Model: "flash_lite",   // modelo barato para una tarea de análisis
  Prompt: "Revisa M:/funky-ai/src/ y lista todos los errores de tipo."
})
```

### Tabla comparativa

| TypeName | Write | Run CMD | MCP | Hereda persona | Hereda reglas |
|---|---|---|---|---|---|
| `research` | ❌ | ❌ | ❌ | ❌ | ❌ |
| `self` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `define_subagent` | Configurable | Configurable | Configurable | ❌ | ❌ |

---

## 9. Preguntas Abiertas

- [ ] ¿`flash_lite` siempre es gratuito o tiene un límite de uso diario propio?
- [ ] ¿`pro` tiene un modelo fijo en horarios de baja carga?
- [ ] ¿El downgrade de `inherit` (4.6→4.5, full→medium) es configurable?
- [ ] ¿El `-tiered` del filtrado implica rate limiting a nivel de organización, no de usuario?
