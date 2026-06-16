# Draft Extras — Ideas Pendientes para draft-tasks.md

> Este archivo captura ideas y conexiones no resueltas que eventualmente se integrarán al `draft-tasks.md`. No son specs finales — son análisis y decisiones pendientes de aprobación.

---

## E1. Contrato de Parámetros del Orquestador al Lanzar Workflows (RFC 026 x §5)

### Conexión detectada

El **RFC 026** formaliza un contrato de dos parámetros ortogonales para que el Orquestador comunique el estado al lanzar un subagente:

- `artifact_state: "new" | "exists"` — ¿el archivo destino se crea desde cero o se complementa?
- `has_design: true | false` — ¿este flujo incluye fase de diseño (`design.md`)?

La **§5 del draft-tasks** ya usaba esta misma semántica de forma informal, mencionando `target: new` y `target: exists` al describir cómo el Orquestador le indica a un Custom Workflow en qué modo arrancar.

### La idea

Estos dos conceptos son **el mismo problema visto desde capas distintas**:
- §5 lo describe a nivel de Custom Workflows (agentes libres, sin estructura SDD estándar).
- RFC 026 lo describe a nivel de subagentes SDD standard (propose, spec, tasks, apply, etc.).

**La conclusión unificada:** El Orquestador debe manejar un vocabulario estándar de parámetros de lanzamiento que aplique a **cualquier cosa que delegue** — ya sea un workflow SDD estándar, un subagente custom, o un worker básico.

Este vocabulario mínimo sería:

```
artifact_state: "new" | "exists"
has_design: true | false
feature_name: string
tag: string | null
```

### Qué resuelve

1. **Elimina ambigüedad en §5:** El modo `target: new/exists` de los Custom Workflows se vuelve el mismo contrato que el resto del sistema, no una terminología aparte.
2. **El Orquestador no improvisa:** Antes de lanzar cualquier workflow, ya sabe qué parámetros debe pasar. Esto va en sus rules como parte del "Razonamiento Pre-Vuelo" (Paso 0).
3. **Workflows adaptativos sin magia:** La §7.5a del draft dice que `/funky-tasks` "lee lo que exista y ajusta" — con `artifact_state` ese comportamiento deja de ser implícito y se vuelve un parámetro explícito que el Orquestador pasa.

### Observación: El Orquestador no debe conocer la firma de cada workflow

El riesgo de tener params como `has_design` específicos por workflow es que el Orquestador necesitaría saber qué necesita cada workflow — acoplamiento duro.

**La solución:** El Orquestador no deriva los params del workflow, los deriva del **Tier**. El Tier ya implica todo:

- T1/T2 → `has_design: false`
- T3/T4 → `has_design: true`

El Orquestador resuelve el contrato completo **una sola vez** antes de cualquier delegación, basándose en el Tier que ya conoce. Cada workflow recibe los 4 params y usa lo que necesita, ignora el resto. Cero acoplamiento Orquestador→workflow.

### Pendiente decidir

- ¿Los parámetros van como frontmatter en el prompt de lanzamiento, o como variables interpoladas en el template del workflow?
- ¿El Orquestador los declara en voz alta al humano (para aprobación) antes de lanzar, o los pasa de forma autónoma?
- Referencia cruzada: actualizar §5 y §7.5 del draft-tasks para apuntar al RFC 026 como la especificación formal de este contrato.

---

## E2. El Template Siempre Manda — Incluso en Tier 4

### La observación

En la discusión anterior se asumió que T4 usaría `artifact_state: new` porque "el workflow tiene vía libre". Pero eso es incorrecto: el template de `tasks.md` contiene cosas innegociables (ej. Phase 0: Branch Setup) que el prompt interno del workflow **no tiene**.

Si T4 recibe `artifact_state: new`, el workflow redactaría tasks desde cero y omitiría esas partes estructurales críticas. El resultado sería un `tasks.md` sin Branch Setup, sin guardrails de Fase 0 — aunque el agente sea "especialista".

### La conclusión

`artifact_state: exists` debe ser **siempre el caso** únicamente para el workflow de funky-tasks — el CLI inyecta el template de tasks en todos los Tiers, incluido T4. Lo que cambia entre Tiers no es si hay template, sino **qué tan libre es el workflow para rellenar las fases**. 

### Implicación arquitectónica

Ciertas instrucciones que hoy viven en el prompt interno del workflow (`/funky-tasks`, `/funky-apply`, etc.) deberían **migrarse al template de `tasks.md`**. El template pasa a ser la fuente de verdad estructural, y el prompt del workflow se adelgaza — solo lleva la inteligencia de contenido, no las reglas de estructura.

Mencionar en el prompt del funky-tasks que debe hacer un replace content para evitar que sobreescriba desde cero
**Pendiente decidir:** ¿Qué secciones del prompt del workflow son candidatas a migrar al template? Requiere auditar el prompt actual de `/funky-tasks`.
