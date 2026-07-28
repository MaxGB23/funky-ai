# Roadmap: Mejoras a `funky init --template` y comandos relacionados

> Documento de referencia para iniciar nuevas fases. Cada fase tiene un objetivo claro, dependencias, y criterios de completado.

---

## Cadena de dependencias

```
TEMPLATES ──► ASSESS ──► ESTIMATE ──► INTEGRACIÓN
  (base)      (evalúa)   (pricea)     (pipeline)
```

Todo arranca en los templates. Si los canvases no capturan el contexto real, el assess evalúa sobre datos pobres, y el estimate pricea sobre una fórmula ciega al contenido.

---

## Patrón común: Comando + Chat

Todas las fases siguen el mismo patrón. El CLI **nunca resuelve nada solo** — solo inyecta el material. El trabajo real pasa en la discusión entre humano + IA.

```
COMANDO CLI                    CHAT HUMANO + IA
─────────────                  ─────────────────
Inyecta templates/guías   →    Discuten la fase
                               Llegan a acuerdos
                               Documentan decisiones
```

### Cómo se aplica en cada fase

| Fase | Comando inyecta | Qué discuten |
|---|---|---|
| **1. Templates** | Canvases vacíos + planning guide | Stack, alternativas, por qué X y no Y |
| **2. Assess** | Guía de discusión arquitectónica (basada en canvases llenos) | Riesgos, constraints, alternativas, trade-offs |
| **3. Estimate** | Guía de pricing (basada en canvases + decisiones del assess) | Valor real, costo, trade-offs de pricing |

### Flujo visual

```
funky init --template  →  inyecta canvases + guide
        ↓
   Dev team abre chat  →  "Llenemos los canvases"
        ↓                    La IA pregunta "¿por qué X y no Y?"
        ↓                    → Canvases llenos con rationale
        ↓
funky assess           →  inyecta guía de discusión
        ↓
   Dev team abre chat  →  "Analicemos la arquitectura"
        ↓                    La IA lee canvases, detecta riesgos
        ↓                    → Decisiones documentadas
        ↓
funky estimate         →  inyecta guía de pricing
        ↓
   Dev team abre chat  →  "Priceemos esto"
        ↓                    La IA usa decisiones para contextualizar
        ↓                    → Pricing informado
```

---

## Fase 1 — Templates (la base de todo)

**Objetivo:** Que los canvases capturen decisiones reales, no solo nombres de stack.

**Problemas que resuelve:**
- Canvases sin campo de "por qué" ni alternativas descartadas
- Guía que no dice cuándo NO usar cada opción
- Sin Progressive Disclosure (secciones avanzadas solo si aplica)
- Placeholders que no se interpolan (`{{project_name}}`)

**Mejoras incluidas:**
1. **Architect Notes** — micro-lecciones pedagógicas en la guía (ej: "muchos SMB tienen límite psicológico de gasto mensual")
2. **"Mejores preguntas"** — en vez de `rps: 1000`, preguntar "¿cuál es el peor pico realista?"
3. **Análisis LLM-driven de compatibilidades** — sección en templates que instruya al agente para analizar incompatibilidades
4. **Pull not push** — marcar secciones avanzadas como "si aplica" en vez de obligar
5. **Fix orphaned files** — los 4 archivos en `bootstrap/` que se empaquetan pero nunca se copian
6. **Fix sync-templates.js** — referencia `worker-handoff.md` que no existe
7. **Deprecar el modo setup inicial** — eliminar los prompts interactivos, la lógica asociada y la documentación del modo «setup inicial» (antes llamado «interactivo»). El CLI solo ofrecerá `--template` (headless) .

**Dependencias:** Ninguna — es la fase inicial.

**Criterio de completado:**
- [ ] Canvases tienen campo de rationale/por-qué
- [ ] Guía tiene Architect Notes en cada categoría
- [ ] Templates incluyen instrucción para análisis LLM-driven
- [ ] Secciones avanzadas marcadas como condicionales
- [ ] Archivos orphaned resueltos
- [ ] `sync-templates.js` no referencia archivos inexistentes
- [ ] Modo setup inicial eliminado del CLI y la documentación

**Doc de resumen:** [fase-1-resumen.md](./fase-1-resumen.md)

---

## Fase 2 — Assess (discusión arquitectónica humano + IA)

**Objetivo:** Assess como facilitador de discusión, no como calculadora de reglas estáticas.

**Filosofía:** El humano o team discuten sus decisiones arquitectónicas y la IA participa como un peer informado — Devil's Advocate que detecta riesgos, propone alternativas y ayuda a llegar a mejores decisiones juntos. Las mejores soluciones salen de discutir entre varias cabezas.

**Problemas que resuelve:**
- Solo 3 reglas estáticas — no cubren combinaciones reales del proyecto
- Defaults vacíos pasan silenciosamente
- Solo genera review IA cuando fallan reglas
- El CLI "evalúa" solo — no hay discusión, no hay intercambio de ideas
- Las reglas estáticas solo cubren lo que el programador anticipó — una conversación cubre todo

**Qué cambia (antes vs. después):**

| Antes | Después |
|---|---|
| CLI lee YAML, corre 3 reglas, genera archivo | Team + IA tienen una sesión de discusión |
| Output: prompt para agente IA | Output: decisiones documentadas |
| El CLI dice "pasaste o no pasaste" | La IA pregunta, desafía, propone |
| Reglas hardcodeadas | Conversación abierta basada en contexto |
| Examen | Discusión entre peers |

**Mejoras incluidas:**
1. **Prompt de sesión de assess** — template que le da a la IA el contexto de ambos canvases + instrucciones de cómo facilitar la discusión (qué preguntar primero, qué detectar, cómo manejar desacuerdos)
2. **Estructura de discusión** — fases de la conversación: contexto → preocupaciones del equipo → riesgos detectados → alternativas → acuerdos
3. **Output: decisiones documentadas** — en vez de un archivo generado por el CLI, el output es un doc con las decisiones que el equipo tomó, las alternativas que consideraron, y los riesgos que aceptaron
4. **Eliminar reglas estáticas como mecanismo core** — las reglas existentes (budget+K8s, RPS+SQLite, SLA+SingleNode) se convierten en **preguntas guía** para la discusión, no en validaciones binarias
5. **Canvases como input de la conversación** — la IA lee PROJECT-CANVAS e INFRA-CANVAS para entender el stack y hacer preguntas informadas

**Dependencias:** Fase 1 completada (los templates deben capturar datos que la IA pueda usar como punto de partida para la discusión).

**Criterio de completado:**
- [ ] Prompt de sesión de assess creado con contexto de canvases
- [ ] Estructura de discusión documentada (fases, preguntas guía)
- [ ] Template de output para decisiones documentadas
- [ ] Las reglas estáticas existentes se convierten en preguntas guía
- [ ] Flujo probado con un caso real (team + IA discutiendo una arquitectura)

**Doc de resumen:** [fase-2-resumen.md](./fase-2-resumen.md)

---

## Fase 3 — Estimate (pricea las decisiones del assess)

**Objetivo:** Que estimate produzca pricing con contexto real, basado en las decisiones documentadas de la sesión de assess.

**Problemas que resuelve:**
- Fórmula por cantidad de keys (no analiza contenido)
- No consume las decisiones/riesgos del assess
- Sin headless mode (solo prompts interactivos)
- Usa `@inquirer/prompts` en vez de `@clack/prompts` (inconsistencia)
- Canvas parsing frágil

**Qué cambia con la nueva filosofía de assess:**

| Antes | Después |
|---|---|
| Estimate consume "challenges" generados por reglas | Estimate consume decisiones documentadas por el equipo + IA |
| Pricing basado en multiplicadores genéricos | Pricing informado por riesgos reales que el equipo discutió |
| Fórmula ciega al contexto | Fórmula enriquecida con alternativas descartadas y constraints |

**Mejoras incluidas:**
1. **Consumir decisiones del assess** — leer el doc de decisiones documentadas y factorizar riesgos, alternativas descartadas, y constraints en el cálculo
2. **Scoring por contenido** — analizar qué stack fue elegido, no cuántas secciones tiene
3. **Headless mode** — flags para automatización de agentes
4. **Migrar a @clack/prompts** — consistencia con el resto del CLI
5. **Validar canvases completos** — no calcular si hay "No definido / Pendiente"
6. **Prompt de mentoría personalizado** — usar datos del assess para preguntar sobre valor, no solo costo

**Dependencias:** Fase 2 completada (el assess debe generar decisiones documentadas que el estimate consuma).

**Criterio de completado:**
- [ ] Estimate lee el doc de decisiones del assess
- [ ] Scoring basado en contenido real del canvas
- [ ] Headless mode funcional con flags
- [ ] Migrado a @clack/prompts
- [ ] Valida que canvases estén completos antes de calcular
- [ ] Prompt de mentoría usa datos del assess para contextualizar

**Doc de resumen:** [fase-3-resumen.md](./fase-3-resumen.md)

---

## Fase 4 — Integración (une todo en pipeline)

**Objetivo:** `init → assess (sesión) → estimate` como flujo continuo y coherente.

**Problemas que resuelve:**
- Los comandos existen como islas, no se comunican
- No hay output reutilizable entre comandos
- El usuario tiene que ejecutar cada paso manualmente sin feedback

**Qué cambia con la nueva filosofía:**

| Antes | Después |
|---|---|
| Pipeline: init → assess (CLI evalúa) → estimate (CLI pricea) | Pipeline: init → assess (sesión humano+IA) → estimate (consume decisiones) |
| assess es un comando que "pasa o no pasa" | assess es una sesión de discusión que produce decisiones |
| Output intermedio: challenges binarios | Output intermedio: doc de decisiones documentadas |

**Mejoras incluidas:**
1. **Pipeline integrado** — init genera canvases → assess facilita discusión → estimate pricea con contexto
2. **context.json** — output estructurado reutilizable entre comandos (decisiones del assess, datos de canvases)
3. **Feedback entre fases** — assess muestra qué impacta el pricing, estimate referencia qué decisiones se tomaron

**Dependencias:** Fase 3 completada (todos los comandos deben estar individualmente funcionales).

**Criterio de completado:**
- [ ] Pipeline `init → assess (sesión) → estimate` funcional
- [ ] context.json generado y consumido por todos los comandos
- [ ] Feedback visual entre fases
- [ ] Documentación actualizada

**Doc de resumen:** [fase-4-resumen.md](./fase-4-resumen.md)

---

## Quick wins (paralelos a cualquier fase)

Estos se pueden hacer en cualquier momento, no dependen de un orden específico:

| # | Mejora | Esfuerzo | Fuente |
|---|---|---|---|
| 1 | Architect Notes en la guía | Bajo | `recomendaciones.md` |
| 2 | "Mejores preguntas" en templates | Bajo | `recomendaciones.md` |
| 3 | Análisis LLM-driven de compatibilidades | Bajo | `008` (revisado) |
| 4 | Fix 4 archivos orphaned en bootstrap/ | Bajo | `observaciones.md` |
| 5 | Fix sync-templates.js → worker-handoff.md | Bajo | `observaciones.md` |
| 6 | Tests para path `--template` | Medio | `observaciones.md` |

> **Estrategia:** Los quick wins #1-3 ya están incluidos en Fase 1. Los #4-5 también. El #6 (tests) puede hacerse paralelamente a cualquier fase.

---

## Notas para futuras sesiones

- **Al iniciar una fase:** leer este doc + el doc de resumen de la fase anterior
- **Al completar una fase:** crear `fase-N-resumen.md` con qué se hizo, qué archivos cambiaron, y qué se descubrió
- **Si se interrumpe una fase:** documentar el estado actual en el resumen de fase para que la siguiente sesión continúe

---

## Documentación oficial por fase

Cada fase debe tener su documentación oficial como guía para nuevos usuarios. Esta documentación explica el flujo completo: qué inyecta el comando, qué espera del equipo, y cómo se facilita la discusión con IA.

**Importante:** El rediseño de este roadmap modifica fundamentalmente los flujos. La documentación existente deberá ser reescrita, no parcheada. Los templates actuales (formularios YAML, prompts generados) se reemplazan por guías de discusión.

| Fase | Doc necesaria | Estado |
|---|---|---|
| **1. Templates** | Guía de llenado de canvases + planning guide para dev team | Reescribir (existente pero desactualizada) |
| **2. Assess** | Guía de sesión de discusión arquitectónica (team + IA) | Crear desde cero |
| **3. Estimate** | Guía de sesión de pricing (team + IA) | Crear desde cero |
| **4. Integración** | Guía del pipeline completo (init → assess → estimate) | Crear desde cero |

**Criterio para cada doc:**
- Explica el patrón: comando inyecta → team abre chat → discuten → documentan
- Incluye ejemplos reales de la discusión
- Muestra el output esperado (qué se documenta al final)
- Referencia los archivos que el comando inyecta
