# Phase Workflows: Puntos de Debate Activos

Este documento centraliza los debates generados a partir de la propuesta de la Feature 020 para tener mayor control sobre las decisiones pendientes.

---

## 🔲 Debate 1: Autosuficiencia vs Reuso de `funky-worker`

**El problema:** `funky-worker` tiene la regla `🔴 Cero Exploración` (no podés usar `list_dir` ni `view_file` fuera del scope del handoff). Eso es incompatible con las fases de investigación y planificación del ciclo SDD.

**Clasificación de fases por compatibilidad:**

| Fases | Tipo | ¿Compatible con funky-worker? |
|-------|------|-------------------------------|
| `explore`, `propose`, `spec`, `design` | Investigación/Planificación | ❌ Necesitan exploración libre |
| `tasks`, `apply`, `verify`, `archive` | Ejecución/Validación | ✅ Foco láser, acción directa |

**Decisión preliminar (D4):** Los 8 workflows de fase SDD deben ser slash commands **propios y autosuficientes** con sus propias reglas. `funky-worker` sigue existiendo para tareas de implementación genéricas fuera del pipeline SDD formal.

Observacion humano: 1. Deben ser autosuficientes las fases por si solas, saber qué revisar como el engram, tasks, etc, y cómo entregar el report. 
2. Veo que el handoff es redundante con buscar en engram entre otras cosas. No sé si mantenerlo en handoff o en cada prompt de workflows.


---

## 🔲 Debate 2: Overhead de Chats y Tiers Aplicables (D6)

**El problema:** El nuevo flujo requiere abrir un chat nuevo por cada fase. Esto incrementa considerablemente el trabajo manual del humano. 

**Contexto:** La decisión en sesión 019 dice que los phase workflows son *"acelerador universal, NO un diferenciador de Tier"*. Sin embargo, abrir hasta 8 chats para un T1 es overhead excesivo. El Orquestador actual ya ejecuta `/sdd-explore` y `/sdd-propose` inline en el mismo chat para features simples.

**Opciones a debatir:**

| Opción | Descripción | Tradeoff |
|--------|-------------|----------|
| **A — Universal** | Los 8 workflows aplican a todos los Tiers | Overhead alto en T1. Consistencia total en el proceso. |
| **B — T2+ solamente (Recomendada)** | T1 sigue ejecutándose inline en el Orquestador. T2/T3 y T4 usan phase workflows. | Dos patrones de ejecución a mantener, pero mucho más realista en UX. |
| **C — Opt-in por fase** | El Orquestador decide qué fases delegar y cuáles ejecutar inline según el Tier y el riesgo. | Máxima flexibilidad, pero delega mayor complejidad al Orquestador. |

**Pregunta al humano:** ¿Para un T1 el Orquestador sigue operando de forma inline, o forzamos el pipeline SDD completo para todos los cambios?

Observacion humano: 1. Para el t1 el orquestador tiene en sus rules solo modificar el tasks. Hay un pendiente en orchestrator que aun no se implementa pero el orquestador si ve que es una tarea de modificar 1 archivo o algo similar, obligatoriamente debe preguntar, "lo hago inline o delegamos worker". Si es una tarea t1 pero con un poco mas de archivos si se delega workers.

2. El t2 quiero que el orquestador lo siga haciendo como su funcionamiento actual, el inline va generando cada artefacto sdd. El tier 3 si no me equivoco tiene las mismas fases que el t2, pero a diferencia que el cli inyecta templates con mejoras para tier 3, y en este caso hay que debatir si deberiamos usar los custom workflows o  mantenerlo inline con el mismo orquestador. Para tier 4 está clarisimo usar las 8 fases sdd con sus respectivos prompts de workflows en chats nuevos individualmente.

---

## 🔲 Debate 3: Calibración de Workers mediante Tiers (D7)

**El problema:** Quiero saber si un worker tiene la capacidad de saber qué hacer si se le especifica algún Tier de operación. Esto nos hará saber si los Tiers en workers son útiles o no. Hoy el Tier es información exclusiva para el **Orquestador** (para decidir cuánto SDD aplicar). 

**¿Cómo calibraría un worker por Tier?** (principalmente en planificación)

| Tier | explore | spec | design |
|------|---------|------|--------|
| T1 | 2 opciones, 200 palabras | Escenarios mínimos | No aplica |
| T2 | 3 opciones, 350 palabras | Happy path + 1 edge case | Estándar |
| T3 | 3+ opciones, devil's advocate, 450 palabras | Happy path + N edge cases + NFRs | Detallado |

**Postura actual:** Los tiers en workers pueden ser muy útiles **solo en fases de planificación** (`explore`, `spec`, `design`). Para fases de ejecución (`apply`, `verify`), el tier no cambia el comportamiento: el worker siempre debe escribir código correcto o verificar completamente, sin importar si es T1 o T3.

**Pregunta al humano:** ¿Agregamos reglas condicionales de Tier dentro de cada workflow de planificación para calibrar su profundidad, o el Tier seguirá siendo de uso exclusivo del Orquestador?

Observación humano: El tier en orquestadores está bien definido, pero este orquestador en handoffs debe generar un tier que un worker tiene que leer. El problema es que este no sabe ni qué carajos hacer si ve un tier. Tenemos un doc que documenta estos tiers, pero a mi parecer son inutiles. Los relevantes son los de orquestador. Hay que debatir si los deprecamos o si encontramos una manera de darles valor, ya que las tareas ya vienen bien digeridas por el orquestador y solo debe seguirlas.
