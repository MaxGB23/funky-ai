# Skills y Memoria

> **Veredicto:** Empate — ambos usan el mismo sistema de skills y el mismo protocolo Engram MCP.

---

## Skills

### Sistema compartido

Ambos agentes usan la misma estructura:
- Carpeta de skill con `SKILL.md` como entry point
- Mismo trigger-based activation: si el skill parece relevante, el agente lee `SKILL.md`
- Mismo `skill-registry` para mantener el índice

**Dato interesante:** Los skills del proyecto son literalmente compartidos. OpenCode y AGY CLI leen los mismos archivos:
- `M:\funky-ai\.agents\skills\github-actions-templates\SKILL.md`
- `M:\funky-ai\.agents\skills\playwright\SKILL.md`
- etc.

### Paths de instalación (AGY CLI)

| Tipo | Path |
|---|---|
| Skills globales / CLI | `C:\Users\cb147\.gemini\antigravity-cli\skills\` |
| Skills del proyecto | `M:\funky-ai\.agents\skills\` |

Skills globales de ejemplo: `branch-pr`, `chained-pr`, `go-testing`, `work-unit-commits`, `judgment-day`
Skills del proyecto: `playwright`, `github-actions-templates`, `github-actions-docs`, `vitest`, `protocolo-tepito`

### Registro de skills

AGY CLI tiene una skill dedicada al mantenimiento del índice:
- Path: `C:\Users\cb147\.gemini\antigravity-cli\skills\skill-registry\SKILL.md`
- Las reglas del orquestador instruyen buscar en Engram o en `.atl/skill-registry.md` antes de delegar

### Diferencia de carga (quién paga los tokens)

Ver [modelo-contexto-tokens.md](./modelo-contexto-tokens.md) — sección "Skills: ¿Quién paga el lazy loading?"

---

## Memoria Persistente — Engram

> **Diferencia Crítica:** OpenCode usa el protocolo MCP oficial de Engram. En AGY CLI, **el servidor MCP de Engram está oficialmente roto**, por lo que se utiliza un "Falso Engram" basado en archivos `.md`.

### OpenCode (Engram MCP Oficial)

Utiliza el Model Context Protocol para interactuar con un servidor backend real de memoria persistente.

| Tool | Descripción |
|---|---|
| `mem_save` | Guarda una observación en la base de datos de Engram |
| `mem_context` | Recupera contexto relevante |
| `mem_search` | Búsqueda semántica real |
| `mem_session_summary` | Guarda un resumen al cerrar la sesión |

### Antigravity CLI (Fallback "Falso Engram")

Dado que el MCP oficial no funciona en el CLI, Funky AI implementa un workaround arquitectónico:

- **Almacenamiento:** Archivos `.md` físicos en el sistema de archivos (típicamente en `/docs/engram/` o `.atl/`).
- **Tools:** El agente no tiene tools nativas `mem_*`. En su lugar, usa `view_file`, `write_to_file` y `grep_search` para leer y escribir en estos archivos Markdown.
- **Búsqueda:** En lugar de búsqueda semántica (vectorial), se hace búsqueda de texto plano con `grep` sobre los archivos `.md`.

### Implicación práctica

El "Falso Engram" cumple la función de persistencia (sobrevive al compactado de contexto), pero **pierde la búsqueda semántica vectorial** y requiere que el agente gestione los archivos manualmente en lugar de hacer llamadas limpias a una API. Esto ensucia el contexto y aumenta el consumo de tokens en operaciones de memoria.
