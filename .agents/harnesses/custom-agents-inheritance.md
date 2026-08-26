# Aislamiento de Prompt y Reglas en Custom Agents

> **Propósito:** Documentar el comportamiento real de aislamiento de contexto en Custom Agents (`agent.md`) dentro de Antigravity CLI y el impacto en consumo de tokens.
> **Fecha de introspección:** 2026-08-25
> **Harness:** Antigravity CLI (`agy`)

---

## 1. Hallazgo de Aislamiento (No-Inheritance)

A diferencia de la sesión estándar (donde se cargan automáticamente `GEMINI.md`, directivas globales de usuario, harnesses SDD y reglas de workspace), **los Custom Agents NO heredan los prompts ni reglas globales del sistema**.

### Comportamiento Confirmado:
* Cuando se activa un agente personalizado (por ejemplo, `funky-lakra`), el contenido de su `agent.md` actúa como un **reemplazo completo del system prompt**, eliminando el overhead base.
* **Lo que NO hereda:**
  * `GEMINI.md` global del usuario (`~/.gemini/GEMINI.md` o workspace).
  * Reglas de orquestación y workflows SDD (`.agents/rules/`, `global_workflows/`).
  * Personalidad, tono y modismos definidos en prompts globales.
  * Reglas de herramientas/skills a menos que se declaren explícitamente.
* **Lo que SÍ conserva:**
  * Configuración estructural de la plataforma (`<user_information>`, herramientas disponibles y MCPs registrados).
  * Parámetros del frontmatter (`mainAgent`, `subagent`, permisos y tools declaradas).

---

## 2. Impacto en Consumo de Tokens (Benchmark Real)

En una sesión nueva con un input idéntico inicial (`"hola"`):

| Agente | Tokens de Inicio | Overhead Inyectado | Propósito Ideal |
|---|---|---|---|
| **Default Agent** | **~25,000 tokens** | Carga completa: `GEMINI.md`, SDD rules, harnesses, workflows, persona. | Orquestación compleja, flujos formales SDD / TDD. |
| **Custom Agent Limpio (`funky-lakra`)** | **~10,000 tokens** | **Aislamiento total:** Solo directivas del runtime base. (Ahorro del **60%**). | Tareas ad-hoc, scripting, debugging rápido, pairing sin ceremonia. |

---

## 3. Oportunidad de Diseño: Agentes Custom Especializados

Este aislamiento abre la puerta a diseñar agentes a la medida para casos donde **NO** se requiere la maquinaria de SDD:

1. **Agentes Ligeros / Ad-hoc:**
   * Al tener un prompt limpio o mínimo, maximizan el context window efectivo para código y evitan bloqueos o ceremonias innecesarias.
2. **Personalización Granular de Herramientas y Reglas:**
   * Se pueden definir agentes con listas de `tools` restringidas o reglas específicas inyectadas puntualmente en su cuerpo de Markdown.
3. **Autosuficiencia:**
   * Cada custom agent debe considerarse una entidad autocontenida. Si requiere una regla específica del workspace (ej. `sabueso-route-a`), debe ser referenciada explícitamente en su definición.
