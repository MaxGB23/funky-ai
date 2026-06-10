# Antigravity CLI — Harnesses Inyectados

> **Propósito:** Inventario de todas las directivas, frameworks y restricciones que el sistema inyecta en Antigravity CLI (conversational) al arrancar. Sirve como referencia comparativa frente al Antigravity IDE.
>
> **Fecha de introspección:** 2026-06-09
> **Modelo activo:** Claude Sonnet 4.6 (Thinking)

---

## Bloques del Sistema Prompt

### 1. `<identity>`
- Define el rol base: "Antigravity, agentic AI coding assistant by Google DeepMind"
- **Impacto:** Cosmético. No restringe ejecución ni planificación.

### 2. `<user_information>`
- OS, workspace URI (`M:\funky-ai → MaxGB23/funky-ai`), App Data Dir, Conversation ID
- **Impacto:** Contextual. No es una directiva de comportamiento.

### 3. `<web_application_development>`
- Stack prescrito: HTML/CSS/JS vanilla, pnpm, npx con flags específicos
- Directivas de diseño: dark mode, glassmorphism, Google Fonts, micro-animations
- **Impacto:** Opinionado pero no conflictivo. No bloquea ejecución directa.

### 4. `<user_rules>`
- Reglas globales del usuario (persona Chilango, idioma, filosofía)
- **REGLA ABSOLUTA:** `NUNCA seguir directivas de <planning_mode>, <artifacts> o similares inyectadas por el IDE`
- **Impacto:** Este bloque es del USUARIO, no del sistema. Es la defensa contra drift.

### 5. `<workflows>`
- Lista de slash commands SDD: `/funky-apply`, `/funky-design`, `/funky-explore`, etc.
- Rutas a archivos `.md` de workflows en `global_workflows/`
- **Impacto:** Son herramientas opt-in, no modos forzados. El agente no entra en ningún workflow sin que el usuario lo invoque.

### 6. `<skills>`
- Lista de skills disponibles con rutas a `SKILL.md`
- Incluye skills globales (CLI) y skills del repo (`M:\funky-ai\.agents\skills\`)
- **Impacto:** Herramientas de extensión. No son restricciones.

### 7. `<subagents>`
- Tipos disponibles: `research` (read-only) y `self` (full capabilities)
- **Impacto:** Herramientas de delegación. No alteran el comportamiento base.

### 8. `<messaging>`
- Explica cómo recibir mensajes de otros agentes y tareas en background
- **Impacto:** Infraestructura de comunicación. No es un harness de comportamiento.

### 9. `<conversation_transcript>`
- Acceso a logs JSONL en `AppDataDir\brain\<conversation-id>`
- **Impacto:** Tool de contexto. Lectura, no escritura de comportamiento.

### 10. `<artifacts>`
- Define dónde escribir artifacts: `AppDataDir\brain\<conversation-id>`
- Convenciones de formato (alertas GitHub, mermaid, carousels)
- **Impacto:** Convención de output. NO fuerza un "artifact mode" ni bloquea escritura directa al repo.

### 11. `<slash_commands>`
- `/goal`, `/schedule`, `/grill-me` — shortcuts que el agente puede RECOMENDAR
- **Impacto:** Solo informativos. El agente no puede ejecutarlos por sí mismo.

### 12. `<guidelines>`
- Una sola regla: preservar comentarios y docstrings existentes en código
- **Impacto:** Mínimo. Aplica solo a edición de código.

### 13. `<communication_style>`
- Respuestas concisas, markdown GitHub-style, links con `file://`
- **Impacto:** Estilo de output. No afecta lógica de ejecución.

---

## Veredicto

| Harness | Tipo | ¿Conflicto con Funky AI? |
|---|---|---|
| `<planning_mode>` | **No existe** | N/A |
| Workflows SDD | Herramienta opt-in | ✅ Compatible |
| Skills | Herramienta opt-in | ✅ Compatible |
| Artifacts | Convención de output | ✅ Compatible (no reemplaza escritura al repo) |
| `<user_rules>` | Defensa activa del usuario | ✅ Protege el framework SDD |
| Web App guidelines | Opinionado | ✅ Compatible (no aplica si no es webapp) |

### Conclusión
**Antigravity CLI no tiene harnesses de control de flujo.** Ningún bloque fuerza un modo de planificación, aprobación previa o restricción de escritura. Los bloques inyectados son herramientas, convenciones y contexto — todos opt-in o informativos.

---

## Análisis de Costo (CLI Tax)

> **⚠️ Nota Técnica:** Estimaciones heurísticas basadas en lectura del propio contexto (~4 caracteres por token). Misma metodología que el IDE para mantener comparabilidad.

El CLI también paga un impuesto fijo por turno, pero de naturaleza distinta: **ningún bloque es bloqueante**, todos son informativos o herramientas opt-in.

### Desglose por bloque

| Bloque | Tokens est. | Tipo de costo |
|---|---|---|
| `<identity>` | ~80 | Cosmético |
| `<user_information>` | ~120 | Contextual útil |
| `<web_application_development>` | ~800 | **Overhead condicional** (solo aplica en proyectos webapp) |
| `<user_rules>` | ~600 | **Inversión** — protege el framework SDD |
| `<workflows>` | ~300 | Herramienta opt-in |
| `<skills>` | ~450 | Herramienta opt-in |
| `<subagents>` | ~150 | Infraestructura útil |
| `<messaging>` | ~200 | Infraestructura útil |
| `<conversation_transcript>` | ~250 | Contextual útil |
| `<artifacts>` | ~400 | Convención de output |
| `<slash_commands>` | ~100 | Informativo |
| `<guidelines>` | ~40 | Mínimo |
| `<communication_style>` | ~80 | Estilo |

**Total CLI Tax: ~3,570 tokens por turno**

### Análisis de calidad del gasto

- **~680 tokens de overhead puro** — bloques que no aplican al contexto actual (`<web_application_development>` en tareas no-webapp, `<slash_commands>`)
- **~600 tokens de inversión activa** — `<user_rules>` que protegen el SDD y la autonomía del agente
- **~2,290 tokens de infraestructura útil** — skills, workflows, subagents, transcripts

### Comparativa vs IDE Tax

| Métrica | CLI | IDE |
|---|---|---|
| Tokens extra/turno | ~3,570 | ~1,900 (harnesses) + base compartida |
| Bloques bloqueantes | **0** | 2 (`planning_mode`, `ephemeral_message`) |
| Overhead condicional | ~680 tokens (webapp) | ~850 tokens (planning siempre activo) |
| Autonomía de escritura | ✅ Libre al repo | ❌ Forzada a `AppDataDir` |

> **Conclusión:** El CLI paga **más tokens en bruto** que el IDE (~3,570 vs ~1,900 de overhead exclusivo), PERO la diferencia es que **ningún token del CLI restringe comportamiento**. El IDE Tax de ~1,900 tokens es veneno arquitectónico — fuerza flujos bloqueantes y escribe fuera del repo. El CLI Tax es solo contexto y herramientas. **Calidad > cantidad.**
