# Delegación

> **Veredicto:** OpenCode gana — tiene delegación síncrona y envelope semi-estructurado. AGY CLI es solo async con texto plano.

---

## OpenCode

**2 primitivas de delegación:**

| Primitiva | Tipo | Cuándo usar |
|---|---|---|
| `task()` | **Síncrona** — bloquea hasta que el sub-agente termina | Tasks donde necesitás el resultado antes de continuar |
| `delegate()` | **Asíncrona** — fire and forget, recibe callback | Tasks en paralelo o de larga duración |

**Envelope de respuesta estructurado:**

Los sub-agentes devuelven un objeto con campos semi-obligatorios (instruidos en el skill file):

```
status         → "completed" | "failed" | "needs_review"
executive_summary → resumen de lo que hizo
artifacts      → lista de archivos creados/modificados
risks          → lista de riesgos identificados
```

> Nota: el contrato es semi-estructurado — el runtime instruye el formato pero sigue dependiendo del LLM para respetarlo. No es un JSON forzado por el sistema; es texto que el orquestador parsea explícitamente esperando esos campos.

---

## Antigravity CLI

**1 sola primitiva:**

```
invoke_subagent(Subagents: [...])
```

Parámetros por sub-agente en el array:

| Campo | Tipo | Descripción |
|---|---|---|
| `TypeName` | string | Nombre del tipo de agente (`research`, `self`, o uno definido con `define_subagent`) |
| `Role` | string | Descripción del rol en esta tarea (2-5 palabras, para logs) |
| `Prompt` | string | Contexto completo de la tarea — aquí va TODO lo que necesita saber |
| `Workspace` | string | `inherit` \| `branch` \| `share` (default: `inherit`) |

**Siempre asíncrono.** No hay `task()` síncrono. El orquestador lanza el sub-agente y sigue ejecutando. El sub-agente responde via `send_message` cuando termina.

**Sin envelope estructurado.** La respuesta es texto plano via mensajería:

```
send_message({ Recipient: conversationId, Message: "texto libre" })
```

El orquestador recibe ese texto y lo parsea basándose en el contrato que le impuso al sub-agente en el `Prompt`. No hay garantía de estructura — es a confianza del LLM.

> **Consecuencia:** Si el sub-agente no sigue el contrato SDD (`status, executive_summary, artifacts...`), el orquestador no tiene manera de saberlo a nivel de runtime. Tiene que detectarlo parseando texto.

---

## Comparativa directa

| Aspecto | OpenCode | AGY CLI |
|---|---|---|
| Primitivas | `task()` + `delegate()` | `invoke_subagent()` |
| Delegación síncrona | ✅ `task()` bloquea | ❌ Solo async |
| Delegación asíncrona | ✅ `delegate()` | ✅ `invoke_subagent()` |
| Envelope de respuesta | ✅ Semi-estructurado (campos obligatorios) | ❌ Texto plano |
| Certidumbre de cuándo termina | ✅ `task()` garantiza sincronía | ⚠️ Polling o espera de `send_message` |
| Control de contexto | Prompt del sub-agente en config | Prompt explícito en cada `invoke_subagent` |
| Workspace isolation | ❌ No existe | ✅ `inherit`/`branch`/`share` |

---

## Implicación práctica

En AGY CLI, el orquestador **debe ser explícito** con el contexto en cada invocación — el sub-agente no hereda la conversación del padre automáticamente (a menos que sea `self`). Si olvidás incluir contexto en el `Prompt`, el sub-agente opera ciego.

En OpenCode, el contexto base viene del `system_prompt` en la config — más predecible pero menos flexible.
