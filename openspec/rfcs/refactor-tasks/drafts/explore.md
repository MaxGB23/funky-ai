# Explore: Refactor Tasks & Orchestration Unification
**TIER DE ORQUESTACIÓN ELEGIDO: "N/A" (Análisis de RFCs)**

## 1. Contexto del Problema
Se analizaron cuatro documentos de la fase draft (`draft-tasks.md`, `draft-extras.md`, `blueprint-final-draft.md`, `rules-orchestrator-backup.md`) que proponen mejoras a la inyección de plantillas, flujos de SDD, delegación de subagentes y contratos entre el Orquestador y el CLI. Existen múltiples conceptos solapados y contradicciones sobre quién tiene la responsabilidad (Orquestador vs CLI), cómo se maneja la planeación (Microplanning) y los parámetros de delegación.

## 2. Incongruencias y Conceptos que se Están Peleando

### Dominio 1: Escalafón de Tiers y el "Desmadre del Microplanning"
**El Conflicto:**
- Por un lado (`draft-tasks.md` §7.3.1 y `rules-orchestrator.md`), el **Tier 2** delega a `/funky-tasks` para que redacte el `tasks.md` y luego el Chalán Básico (`/funky-worker`) lo ejecute.
- Por otro lado (`draft-tasks.md` §7.5.b), se decreta la **"Deprecación del Microplanning"**, argumentando que `/funky-apply` ya lee el `spec.md` directo, por lo que la capa intermedia de tareas ultra-digeridas "ya no agrega valor".
- **El Cortocircuito:** Si el microplanning muere porque `/funky-apply` es muy listo, ¿qué carajos hace `/funky-tasks` en Tier 2? Si T2 usa al Worker básico (que sí necesita tareas digeridas), entonces el microplanning no puede morir del todo para ese Tier. Además, `draft-tasks` §7.5.c dice que `/funky-tasks` funciona como "detector de riesgo" para escalar a T3. Si lo eliminas o dejas de usarlo, pierdes el detector.

**Decisión Final:** Se confirma la deprecación total del microplanning. `/funky-apply` tiene la inteligencia suficiente para leer el `spec.md` directo sin necesidad de la capa intermedia de tareas ultra-digeridas.

### Dominio 2: Contrato de Parámetros (Frontmatter vs Template)
**El Conflicto:**
- `draft-tasks.md` (§5) habla de pasar el modo `target: new` o `exists` para los custom workflows. `draft-extras.md` (E1) estandariza esto a `artifact_state: new | exists` en el frontmatter.
- **El Cortocircuito (La Trampa del Tier 4):** Se asume que en T4 el workflow tiene vía libre y usaría `artifact_state: new`. PERO `draft-extras.md` (E2) frena en seco y dice: *"¡Pérate! El template de tasks.md tiene guardrails innegociables (como el Branch Setup de la Fase 0). Si le mandas `new`, los borra"*.
- Conclusión peleada: ¿Quién manda, el workflow o el template? Aquí `draft-extras` gana la pelea: **El Template es la fuente de verdad estructural, siempre debe ser `exists` para tasks, sin importar el Tier.**

**Decisión Final:** `artifact_state` (`new` | `exists`) es la convención definitiva para parámetros, la redaccion de draft-tasks es la mas vieja, por lo que puede tener cosas deprecadas. Excepción sagrada: El archivo `tasks.md` es el ÚNICO caso donde SIEMPRE se respeta el template original (forzando `exists`), sin importar si es Tier 2, 3 o 4. Se ajustará el system prompt de `/funky-tasks` para asegurar esto.

### Dominio 3: Frontera de Responsabilidad (CLI vs Orquestador vs Humano)
**El Conflicto:**
- `draft-tasks.md` (§3) dice que el CLI (`funky feature`) tiene "Inquirers" (preguntas interactivas) para definir el Tier, Docs Core y Tipo de Release.
- Luego, `draft-tasks.md` (§4 y §7.3.3) dice que "la inteligencia recae completamente en el Orquestador" y que él es quien dicta estos tres parámetros, no el CLI.
- Finalmente, `draft-extras.md` (P1.2) introduce el modelo "Puente Manual (Fase 1)", donde el Orquestador genera un bloque *Copy-Paste* y el humano es el chango que lo pega.
- **El Cortocircuito:** Si el Orquestador dicta todo y escupe el *Copy-Paste* con los parámetros exactos, ¿por qué el CLI le haría preguntas al usuario? Los "Inquirers" del CLI sobran o son redundantes si el Orquestador ya tomó la decisión.

**Decisión Final:** El Orquestador solo DA UNA RECOMENDACIÓN inicial. El humano, al correr el CLI (`funky feature`), tiene la última palabra sobre las opciones. Si el humano cambia algo (no sigue la recomendación), DEBE avisarle al Orquestador después. El bloque "copy-paste" actual es solo un puente temporal para abrir chats y delegar rápido en el IDE. A futuro, el CLI pasará este payload directamente a los subagentes nativos que operarán en modo auto/interactivo, pero en modo interactivo esperará primero aprobación y después delegará.

### Dominio 4: Ciclo de Vida de los Chalanes (Fase 1 vs Fase 2)
**El Conflicto:**
- `blueprint-final-draft.md` (§4.3) detalla cómo el Orquestador duerme, revive y mata (`kill`) a los subagentes vía MCP.
- `draft-extras.md` (Fase 1) dice que ahorita todo es un *Copy-Paste* manual en chats nuevos.
- **El Cortocircuito:** Se están documentando mecánicas de automatización pura (MCP manage_tasks) mezcladas con instrucciones de copy-paste manual. Hay que separar claramente el flujo actual (arquitectura de transición) del estado final.

**Decisión Final:** Las aparentes contradicciones son en realidad dos puntos en el tiempo. Hay que hacer una separación cronológica clara en la arquitectura:
1. **Fase Actual (IDE):** Proceso más manual (copy-paste) porque el IDE aún no tiene subagentes nativos plenos. El IDE seguirá siendo el rey para ejecución pura (Apply/Worker) donde brilla.
2. **Fase Futura (CLI):** La orquestación pesada y delegación se moverá al CLI, donde vivirán los subagentes nativos operando en modo auto.

---