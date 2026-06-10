# Sub-agentes

> **Veredicto:** Empate técnico — distinta filosofía. OpenCode es restrictivo (hojas del árbol). AGY CLI es flexible pero con riesgo de recursión.

---

## OpenCode

**9 sub-agentes pre-definidos y fijos** en `opencode.json`:

```
sdd-apply, sdd-verify, sdd-design, sdd-propose, sdd-spec,
sdd-tasks, sdd-explore, sdd-archive, gentle-orchestrator
```

Características:
- Cada uno tiene tools **restringidas**: no tienen `task()` ni `delegate()` — no pueden crear más sub-agentes.
- Son **hojas del árbol**: el árbol de delegación tiene profundidad máxima 1.
- Contexto **fresh** cada vez: arrancan sin historial de la conversación padre.
- El rol lo dicta el archivo de configuración — es **declarativo y auditable** antes de que el agente exista.

```json
// Ejemplo de sub-agente en opencode.json
"sdd-apply": {
  "prompt": "You are an SDD executor...",
  "tools": { "bash": true, "read": true }
  // NO tiene delegate, NO tiene task
}
```

---

## Antigravity CLI

**2 sub-agentes estáticos** por defecto:

| Agente | Descripción |
|---|---|
| `research` | Read-only. Busca en web, lee archivos, explora codebase en background. |
| `self` | Clon completo. Hereda TODO el contexto y herramientas del padre, incluyendo `define_subagent`. |

**Más `define_subagent`** — creación dinámica en runtime:

```js
define_subagent({
  name: "sdd-apply",
  description: "...",
  system_prompt: contenido_del_SKILL_md,  // incrusta TODO el contenido del skill
  enable_write_tools: true,
  enable_mcp_tools: false,
  enable_subagent_tools: false            // controla si puede crear más sub-agentes
})
```

Parámetros configurables:
- `name`, `description`, `system_prompt` — rol completo
- `enable_write_tools` — acceso a crear/editar archivos y correr comandos
- `enable_mcp_tools` — acceso a MCP servers (Engram, etc.)
- `enable_subagent_tools` — si puede usar `define_subagent` e `invoke_subagent`
- **❌ No existe parámetro `model`** — ver [modelo-contexto-tokens.md](./modelo-contexto-tokens.md)

---

## Riesgo de recursión (AGY CLI)

El agente `self` hereda **todas** las tools, incluyendo `define_subagent`. Esto significa:

```
Orquestador → self → self → self → ... (infinito)
```

Un sub-agente clon puede crear más sub-agentes, que crean más sub-agentes. En teoría, podés perder el control de quién está haciendo qué y consumir tokens ilimitadamente.

**Mitigación:** `enable_subagent_tools: false` al crear sub-agentes con `define_subagent` corta la cadena. Pero depende de que el orquestador lo haga conscientemente — el runtime no lo fuerza.

> OpenCode es más seguro por diseño: los sub-agentes son hojas, punto. AGY requiere disciplina del orquestador.

---

## Workspace Isolation (AGY CLI gana)

AGY CLI tiene algo que OpenCode no tiene: **aislamiento de filesystem por sub-agente**.

| Modo | Comportamiento |
|---|---|
| `inherit` | Mismo workspace que el padre (default) |
| `branch` | Clona el workspace a un directorio temporal aislado |
| `share` | Git worktree — comparte el `.git` pero con branch independiente |

**Por qué importa:** Un sub-agente con `branch` puede romper todo en un temporal sin tocar el código real. Ideal para explorar refactors riesgosos. OpenCode no tiene nada equivalente — todos los sub-agentes operan en el mismo filesystem.
