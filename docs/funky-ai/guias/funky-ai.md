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
| `docs/post-mortem.md` | `mem_get_obs()` | Historial de bugs y decisiones arquitectónicas. |

- **Escritura (Doctrina MCP):** Todo registro en `post-mortem.md` requiere campos: `What`, `Why`, `Where`, `Learned`.
- **Lectura (Safe-Contexting):** Prohibido leer archivos masivos. Usar `grep_search` masivo + `view_file` quirúrgico.

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
| **Explore** | Auditoría de contexto y análisis de código. | Gemini Flash | `explore.md` |
| **Propose** | Diseño técnico y definición arquitectónica. | Gemini Pro | `proposal.md` |
| **Tasks** | Desglose en unidades de implementación. | Gemini Flash | `tasks.md` |
| **Report** | Ejecución de cambios y cierre de ciclo. | Gemini Flash/Pro | `report.md` |

---

## 🤔 Niveles de Complejidad (Tiers)

| Tier | Caso de Uso | Flujo de Trabajo |
| :--- | :--- | :--- |
| **T0: Chat** | Consultas, entendimiento rápido. | Sin artefactos físicos. Chat efímero. |
| **T1: Lite** | Refactors menores, scripts. | Planificación comprimida en un solo prompt/chat. |
| **T2: Std** | Módulos nuevos, extensiones. | 1. `design-propose.md` | 2. `tasks.md`. |
| **T3: Heavy** | Greenfield, Core refactor. | 1 phase = 1 file = 1 new chat (Aislamiento total). |

---

## 🚦 Decisión: ¿Chat o SDD?

1. **¿Afecta >2 archivos o Arquitectura?** ➔ Activar SDD (**Tier 2+**).
2. **¿Punto de entrada desconocido?** ➔ Activar SDD (**Tier 1**).
3. **¿Proyecto Greenfield / Core Migración?** ➔ Activar SDD (**Tier 3**).

---

## ⚙️ Configuración (`GEMINI.md`)

- **Global:** Perfil, Tono, Filosofía, Skills. **PROHIBIDO** poner restricciones de orquestación aquí.
- **Workspace:** `.agents/rules/` para protocolos SDD específicos. Aísla restricciones sin romper la ejecución global.

---

## 🎯 ¿Por qué Funky AI?
Control granular contra "automatización mágica". Máxima potencia (Gemini Ultra/Pro) a costo cero mediante gestión manual de contexto. Eliminación de alucinaciones por aislamiento de tareas.
