# Funky AI: The "Manual-Agent" Protocol

**Funky AI** es un patrón de diseño para Antigravity/Gemini. Optimizado para modelos potentes sin infraestructura asíncrona nativa.

**Máxima:** Disco Duro = Memoria (Capa de Persistencia) | Humano = Router API.

---

## 🏗️ Los 3 Pilares del Ecosistema

### 1. El Falso Engram (State Machine Física)
Memoria estructurada tipo MCP en archivos canónicos. Reglas de acceso estrictas:

| Archivo | Equivalente | Propósito |
|---|---|---|
| `docs/ORCHESTRATOR-STATE.md` | `mem_search()` | Estado actual, tareas pendientes, archivos clave. |
| `docs/engram/index.md` | `mem_search()` | Índice tabla de todos los engramas (Stage 1 del Two-Stage Polling). |
| `docs/engram/{category}/{tag}.md` | `mem_get_obs()` | Engrama individual: cada entry es un archivo único en su directorio semántico (`architecture/`, `pattern/`, `discovery/`, `decision/`, `bugfix/`). |

- **Escritura (Doctrina MCP):** Todo registro usa `funky engram add --tag "[tag]" --category <categoría> --desc "..."`. Requiere campos: `What`, `Why`, `Where`, `Learned`.
- **Lectura (Safe-Contexting):** Stage 1 = `view_file docs/engram/index.md`. Stage 2 = `grep_search "[tag]" docs/engram/` (búsqueda recursiva sobre subdirectorios). Prohibido leer archivos masivos.

### 2. Sub-Agentes Descartables (Manipulación de Chats)
Evitar degradación de contexto mediante aislamiento:
- **Spawn:** Abrir chat virgen.
- **Context Injection:** Cargar solo archivos `.md` necesarios con `@`.
- **Misión:** Orden finita con reporte físico.
- **Kill:** Cerrar chat tras guardar el artefacto en disco.

### 3. La Torre de Control (Chat Orquestador)
Hilo persistente de planificación y seguimiento.
- **Función:** Centralizar reportes de Workers y actualizar el plan maestro.
- **Slash Commands:** Pre-acondicionamiento psicológico del modelo (`/sdd-explore`, `/sdd-propose`).
- **Prohibición:** Este chat NO escribe código ni ejecuta refactors inline. Actúa única y exclusivamente como Arquitecto/Project Manager.

---

## 🛤️ Workflow SDD (Spec-Driven Development)

| Fase | Acción | Modelo | Resultado |
| :--- | :--- | :--- | :--- |
| **Explore** | Auditoría de contexto y análisis de código. | Gemini Flash | `sdd-explore.md` |
| **Propose** | Diseño técnico y definición arquitectónica. | Gemini Pro | `sdd-proposal.md` |
| **Tasks** | Desglose en unidades de implementación. | Gemini Flash | `sdd-tasks.md` |
| **Report** | Ejecución de cambios y cierre de ciclo. | Gemini Flash/Pro | `sdd-report.md` |

---

## 🤔 Niveles de Complejidad (Tiers)

| Tier | Caso de Uso | Flujo de Trabajo |
| :--- | :--- | :--- |
| **T0: Chat** | Consultas, entendimiento rápido. | Sin artefactos físicos. Chat efímero. |
| **T1: Lite** | Refactors menores, scripts. | Planificación comprimida en un solo prompt/chat. |
| **T2: Std** | Módulos nuevos, extensiones. | 1. `sdd-proposal.md` \| 2. `sdd-tasks.md`. |
| **T3: Heavy** | Greenfield, Core refactor. | 1 phase = 1 file = 1 new chat (Aislamiento total). |

---

## 🚦 Decisión: ¿Chat o SDD?

1. **¿Afecta >2 archivos o Arquitectura?** ➔ Activar SDD (**Tier 2+**).
2. **¿Punto de entrada desconocido?** ➔ Activar SDD (**Tier 1**).
3. **¿Proyecto Greenfield / Core Migración?** ➔ Activar SDD (**Tier 3**).
4. **¿Fallo en producción es catastrófico?** ➔ Activar Gentle SDD (**Tier 4** — `funky gentle`).

---

## ⚙️ Arquitectura de 3 Capas (v2.0.0)

El sistema usa **Token Diet** extremo para evitar "Context Dilution":

1. **Capa 1 (Global):** Perfil, Tono, Filosofía (`docs/prompts/GEMINI-funky-global.md`). Siempre activo, súper liviano.
2. **Capa 2 (Workspace Rules):** Identidad básica y routing (`.agents/rules/orchestrator-core.md`). Se activa automáticamente al detectar tareas de planificación.
3. **Capa 3 (Workflows On-Demand):** Lógica operativa profunda y checklists. Viven en Antigravity Workflows (`/funky-orchestrator`, `/funky-worker`). Solo se inyectan en el prompt cuando el humano los llama explícitamente.

---

## 🎯 ¿Por qué Funky AI?
Control granular contra "automatización mágica". Máxima potencia (Gemini Ultra/Pro) a costo cero mediante gestión manual de contexto. Eliminación de alucinaciones por aislamiento de tareas.
