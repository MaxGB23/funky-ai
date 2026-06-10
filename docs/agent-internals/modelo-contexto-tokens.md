# Modelo, Contexto y Tokens

> **Veredicto:** OpenCode gana en modelo por sub-agente. En tokens totales: empate (~28k chars upfront). AGY CLI tiene un bug crítico de truncamiento.

---

## Modelo por sub-agente

### OpenCode ✅

Cada sub-agente puede tener su propio modelo configurado en `opencode.json`:

```json
"agent": {
  "sdd-apply":          { "model": "anthropic/claude-sonnet-4" },
  "sdd-design":         { "model": "anthropic/claude-opus-4" },
  "gentle-orchestrator": { "model": "opencode/big-pickle" }
}
```

**Qué habilita esto:** Podés mandar tareas pesadas de implementación a un modelo más barato (`sonnet`) y reservar el modelo caro (`opus`) para diseño o especificación. Optimización de costo real, por task.

### Antigravity CLI ❌

`define_subagent` **no tiene parámetro `model`**. Todos los sub-agentes heredan el modelo de la sesión activa o el default de Mission Control.

```js
// Lo que existe
define_subagent({ name, description, system_prompt, enable_write_tools, ... })
// Lo que falta
define_subagent({ ..., model: "anthropic/claude-haiku-3" })  // ← NO EXISTE
```

**Implicación:** Si cambiás a "Gemini Pro Low" en la sesión, todos los sub-agentes corren bajo ese modelo. No hay routing fino por rol. Por eso la regla del orquestador dice: *"If model switching is not available mid-session, use this table as a reasoning-depth guide"* — es un workaround manual.

**Para resolverlo:** El equipo de Antigravity tendría que agregar un campo opcional `model: string` en el schema JSON de la tool `define_subagent`.

---

## Token Consumption — Empate

Ambos andan en ~20k-30k chars de carga inicial (upfront). Misma liga.

| Categoría | OpenCode | AGY CLI |
|---|---|---|
| Total upfront | ~28k chars | ~20-30k chars |
| Config/core | 60-70% | 30-40% |
| Reglas/negocio | 30-40% | 60-70% |

**Por qué la distribución es distinta:**
- OpenCode: `AGENTS.md` liviano → el core runtime pesa más
- AGY CLI: el runtime es magro (casi sin config estática) → las reglas personalizadas pesan más proporcionalmente. La inteligencia está en lo que vos inyectás.

---

## Skills: ¿Quién paga el lazy loading?

| | OpenCode | AGY CLI |
|---|---|---|
| Índice de skills | `available_skills` — ~2k chars | `<skills>` tag — ~1.5-2k chars |
| ¿Quién lee el SKILL.md? | **El sub-agente** (cuando lo necesita) | **El orquestador** (y lo incrusta en el system_prompt del sub-agente) |

**Trade-off:**
- Si el orquestador es el modelo caro y los sub-agentes son baratos → **gana OpenCode** (el caro no gasta en leer skills)
- Si querés que los sub-agentes arranquen con todo listo sin tener que leer nada → **gana AGY CLI**

No hay un ganador absoluto — depende de tu modelo económico.

---

## ⚠️ Bug crítico: Truncamiento de user_rules (AGY CLI)

Este es el hallazgo más importante de la segunda ronda de análisis.

**Qué pasó:** El runtime de AGY CLI truncó **5,291 bytes** de las reglas del usuario (`<user_rules>`) sin avisar.

**Por qué es peligroso:**
1. No sabés qué parte de tus instrucciones se perdió
2. El agente no sabe que perdió esa parte — opera como si las tuviera completas
3. Si el truncamiento cortó una regla de seguridad, delegación o el protocolo de sesión preflight, te enterás cuando explota

**Qué pudo haberse perdido:** Partes del protocolo SDD, reglas de delegación, manejo de Engram, cualquier instrucción que estuviera al final del bloque.

**Por qué no pasa en OpenCode:** El prompt del orquestador vive en `opencode.json` como string controlado. Si está mal dimensionado, es un error de configuración visible. El runtime no trunca silenciosamente.

**Mitigación actual para AGY CLI:** Medir y recortar manualmente las reglas para que entren completas. No hay detección automática de truncamiento.

> **TL;DR:** AGY CLI puede estar operando con instrucciones incompletas sin saberlo. Este es el riesgo más serio para usarlo como orquestador en producción.
