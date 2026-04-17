# Funky AI: The "Manual-Agent" Protocol

**Funky AI** es un patrÃ³n de diseÃ±o para Antigravity/Gemini. Optimizado para modelos potentes sin infraestructura asÃ­ncrona nativa.

**MÃ¡xima:** Disco Duro = Memoria (Capa de Persistencia) | Humano = Router API.

---

## ðŸ—ï¸ Los 3 Pilares del Ecosistema

### 1. El Falso Engram (State Machine FÃ­sica)
Memoria estructurada tipo MCP en archivos canÃ³nicos. Reglas de acceso estrictas:

| Archivo | Equivalente | PropÃ³sito |
|---|---|---|
| `docs/ORCHESTRATOR-STATE.md` | `mem_search()` | Estado actual, tareas pendientes, archivos clave. |
| `docs/post-mortem.md` | `mem_get_obs()` | Historial de bugs y decisiones arquitectÃ³nicas. |

- **Escritura (Doctrina MCP):** Todo registro en `post-mortem.md` requiere campos: `What`, `Why`, `Where`, `Learned`.
- **Lectura (Safe-Contexting):** Prohibido leer archivos masivos. Usar `grep_search` masivo + `view_file` quirÃºrgico.

### 2. Sub-Agentes Descartables (ManipulaciÃ³n de Chats)
Evitar degradaciÃ³n de contexto mediante aislamiento:
- **Spawn:** Abrir chat virgen.
- **Context Injection:** Cargar solo archivos `.md` necesarios con `@`.
- **MisiÃ³n:** Orden finita con reporte fÃ­sico.
- **Kill:** Cerrar chat tras guardar el artefacto en disco.

### 3. La Torre de Control (Chat Orquestador)
Hilo persistente de planificaciÃ³n y seguimiento.
- **FunciÃ³n:** Centralizar reportes de Workers y actualizar el plan maestro.
- **Slash Commands:** Pre-acondicionamiento psicolÃ³gico del modelo (`/sdd-explore`, `/sdd-propose`).

---

## ðŸ›¤ï¸ Workflow SDD (Spec-Driven Development)

| Fase | AcciÃ³n | Modelo | Resultado |
| :--- | :--- | :--- | :--- |
| **Explore** | AuditorÃ­a de contexto y anÃ¡lisis de cÃ³digo. | Gemini Flash | `explore.md` |
| **Propose** | DiseÃ±o tÃ©cnico y definiciÃ³n arquitectÃ³nica. | Gemini Pro | `proposal.md` |
| **Tasks** | Desglose en unidades de implementaciÃ³n. | Gemini Flash | `tasks.md` |
| **Report** | EjecuciÃ³n de cambios y cierre de ciclo. | Gemini Flash/Pro | `report.md` |

---

## ðŸ¤” Niveles de Complejidad (Tiers)

| Tier | Caso de Uso | Flujo de Trabajo |
| :--- | :--- | :--- |
| **T0: Chat** | Consultas, entendimiento rÃ¡pido. | Sin artefactos fÃ­sicos. Chat efÃ­mero. |
| **T1: Lite** | Refactors menores, scripts. | PlanificaciÃ³n comprimida en un solo prompt/chat. |
| **T2: Std** | MÃ³dulos nuevos, extensiones. | 1. `design-propose.md` | 2. `tasks.md`. |
| **T3: Heavy** | Greenfield, Core refactor. | 1 phase = 1 file = 1 new chat (Aislamiento total). |

---

## ðŸš¦ DecisiÃ³n: Â¿Chat o SDD?

1. **Â¿Afecta >2 archivos o Arquitectura?** âž” Activar SDD (**Tier 2+**).
2. **Â¿Punto de entrada desconocido?** âž” Activar SDD (**Tier 1**).
3. **Â¿Proyecto Greenfield / Core MigraciÃ³n?** âž” Activar SDD (**Tier 3**).

---

## âš™ï¸ ConfiguraciÃ³n (`GEMINI.md`)

- **Global:** Perfil, Tono, FilosofÃ­a, Skills. **PROHIBIDO** poner restricciones de orquestaciÃ³n aquÃ­.
- **Workspace:** `.agents/rules/` para protocolos SDD especÃ­ficos. AÃ­sla restricciones sin romper la ejecuciÃ³n global.

---

## ðŸŽ¯ Â¿Por quÃ© Funky AI?
Control granular contra "automatizaciÃ³n mÃ¡gica". MÃ¡xima potencia (Gemini Ultra/Pro) a costo cero mediante gestiÃ³n manual de contexto. EliminaciÃ³n de alucinaciones por aislamiento de tareas.
