# Custom Agents y Model Tiers en Antigravity CLI

> **Propósito:** Documentar la arquitectura de Custom Agents, discovery de agentes, resolución de modelos y la separación entre el Modelo de Sesión Interactiva y los Modelos de Subagentes.
>
> **Fecha de introspección:** 2026-08-25
> **Harness:** Antigravity CLI (`agy`)

---

## 1. Estructura y Discovery de Custom Agents

Antigravity CLI implementa un sistema de descubrimiento automático de agentes basado en paquetes modulares con formato Markdown + YAML Frontmatter.

### Rutas Canónicas de Discovery:
* **Workspace (Nivel de repositorio):** `.agents/agents/{agent_name}/agent.md`
* **Global (Nivel de sistema/usuario):** `~/.gemini/config/agents/{agent_name}/agent.md`

> ⚠️ **Nota de Duplicación:** Si un agente existe con el mismo `name` tanto en la carpeta global como en el workspace, el panel interactivo `/agents` listará ambas entradas y sincronizará su selección. Para evitar duplicados en la TUI, se recomienda definir los agentes únicamente en una de las dos capas (o mantener copias de backup en rutas de documentación como `docs/funky-ai/prompts/agy-agents/`).

### Formato de Frontmatter:
```yaml
---
name: funky-lakra
description: Fast and lightweight generalist agent.
model: flash_lite
mainAgent: true
subagent: true
---
```

### Herencia de Prompts y Contexto:
* **Aislamiento Total:** El archivo `agent.md` **reemplaza** el system prompt por completo (no hereda automáticamente `GEMINI.md` ni los harnesses/workflows globales).
* Esto reduce la carga inicial de contexto de **~25k tokens** a **~10k tokens** (ahorro del 60%). Para más detalle ver [custom-agents-inheritance.md](custom-agents-inheritance.md).
* Si contiene cuerpo de texto, este actúa como su System Prompt exclusivo. Si no contiene cuerpo, opera como un agente base ligero sin overhead.

---

## 2. Separación Arquitectónica: Session Model vs. Subagent Model

Existe una distinción estricta en el runtime de Antigravity entre el modelo interactivo principal y los modelos de ejecución delegada:

| Concepto | Control / Configuración | Modelos Disponibles | Propósito |
|---|---|---|---|
| **Session Model** (Interactivo) | Se define al arrancar (`agy --model <slug>`) o en caliente con el comando `/model`. | `Gemini 3.7 Flash`, `Gemini 3.7 Pro`, `Claude Sonnet`, etc. | Chat principal, razonamiento interactivo y diálogo con el desarrollador. |
| **Subagent Model** (Delegado) | Se define en el frontmatter (`model: <tier>`) del `agent.md` o en la llamada `invoke_subagent`. | `flash_lite`, `flash`, `pro`, `inherit`. | Tareas en segundo plano, exploración de código, ejecución de workers y lectura masiva. |

### La restricción de `flash_lite`:
* `flash_lite` está diseñado por el harness de Antigravity exclusivamente como un tier de background execution (subagentes/workers).
* **No es seleccionable como Session Model interactivo principal** en el selector `/model` de la TUI.
* Aunque un custom agent tenga `model: flash_lite` y `mainAgent: true`, al seleccionarlo como agente principal interactivo, la sesión conservará el modelo base de la sesión interactiva activa.

---

## 3. Patrón de Operación Óptimo (Best Practice)

Para balancear velocidad, capacidad de razonamiento y consumo mínimo de cuota y tokens:

1. **Sesión Principal (Interactive Driver):**
   * Usar **Flash regular** (`Gemini 3.7 Flash`) como modelo de sesión para interactuar, planificar y orquestar.
2. **Exploración y Búsquedas Masivas (Delegación Ligera):**
   * Delegar siempre a un subagente dedicado como **Sabueso Regular (`sabueso-route-a`)** configurado con tier **`flash_lite`**.
   * Esto aísla el ruido de búsqueda fuera del contexto de la conversación principal y minimiza el consumo de tokens.
