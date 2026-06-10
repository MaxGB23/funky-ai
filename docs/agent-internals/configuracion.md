# Configuración y Runtime

> **Veredicto:** OpenCode gana — tiene un contrato declarativo legible y versionable.

---

## OpenCode

Toda la configuración vive en un archivo `opencode.json` con schema JSON. Es declarativo: agentes, tools, MCP, permisos — todo está definido ahí antes de que el agente exista.

```json
// opencode.json (estructura)
{
  "agent": {
    "sdd-apply":  { "model": "anthropic/claude-sonnet-4", "tools": ["bash", "read"] },
    "sdd-design": { "model": "anthropic/claude-opus-4" },
    "gentle-orchestrator": { "model": "opencode/big-pickle" }
  }
}
```

**Lo que esto implica:**
- Podés abrir el archivo y saber exactamente qué agentes existen, qué tools tienen, qué modelo usan.
- El prompt del orquestador vive en `opencode.json` como string controlado por el runtime. Si está mal dimensionado, es un error de configuración visible — no un truncamiento silencioso.
- Versionable en git: los cambios de configuración son diffs legibles.

---

## Antigravity CLI

No lee archivos de configuración al arrancar. El host (Mission Control) ensambla el contexto y lo inyecta en tiempo de ejecución via etiquetas XML en el system prompt.

**Archivos que el host SÍ lee e inyecta** (paths de sesión actual):

| Tipo | Path |
|---|---|
| Regla de orquestador | `M:\funky-ai\.agents\rules\sdd-orchestrator.md` |
| Regla de secops | `M:\funky-ai\.agents\rules\secops.md` |
| Workflow worker | `C:\Users\cb147\.gemini\config\global_workflows\funky-worker.md` |

**Composición del system prompt** (bloques XML ensamblados dinámicamente):

| Bloque | Contenido |
|---|---|
| `<identity>` | Rol base del agente |
| `<web_application_development>` | Stack, diseño, SEO |
| `<user_information>` | OS, paths, workspace URI, Conversation ID |
| `<user_rules>` | Persona, protocolo Engram, Orquestador SDD, reglas absolutas |
| `<skills>` | Índice de skills disponibles con paths |
| `<subagents>` | Sub-agentes estáticos disponibles |
| `<artifacts>` | Convenciones de output |
| `<workflows>` | Slash commands SDD |
| `<planning_mode>` | ⚠️ Solo en IDE — no en CLI |

**El equivalente a `opencode.json`:**
No existe nativamente en el engine. El equivalente arquitectónico es `sdd-orchestrator.md` inyectado en `<user_rules>`, que instruye cómo comportarse como orquestador. Pero no es inspeccionable desde fuera — no podés saber qué tiene el agente sin leer el system prompt ensamblado.

---

## Diferencia clave

OpenCode tiene un **contrato declarativo**: abrís el JSON y sabés todo.
AGY CLI es **puro runtime**: no hay un archivo que describa el estado del agente — es improvisado por el host en cada sesión.

> **Implicación práctica:** En OpenCode, si un sub-agente tiene una configuración incorrecta, lo ves en el JSON y lo corriges. En AGY CLI, tenés que reconstruir mentalmente qué inyectó el host leyendo múltiples archivos `.md` dispersos.
