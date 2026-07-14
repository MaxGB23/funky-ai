# Spec: Roles y Subagentes

> **Propósito:** Documento consolidado que unifica la taxonomía, ciclo de vida, estrategias de delegación de workflows y mitigación de contexto para los subagentes en AGY CLI.
> 
> **Origen:** Consolidación de `blueprint-final-draft.md` (§1).

---

## 1. El Barrio: Taxonomía y Criterios de Selección

Para mantener una arquitectura limpia y evitar confusiones operativas, los agentes se clasifican en cinco roles, cada uno con permisos y casos de uso específicos:

### 1.1 El Maistro (Orquestador Principal)
* **Rol:** El agente principal que interactúa con el humano. Diseña la arquitectura, toma decisiones de alto nivel, planifica el SDD y dirige a los subagentes.
* **Permisos:** Completos.
* **Tokens:** Carga el contexto mínimo necesario, no se ensucia las manos si no lo necesita, esto le otorga máxima precisión.

### 1.2 El Sabueso (`research` — Solo Lectura, Fuera de SDD)
* **Rol:** Exploración rápida y desechable para investigaciones **fuera del flujo SDD** (o en cualquier tier donde solamente se quiera investigar sin generar artefacto). Buscar definiciones, leer stack traces, revisar documentación web. Disponible en cualquier Tier (T0–T3), pero su contexto natural es fuera de SDD.
* **Permisos:** Solo lectura (`view_file`, `grep_search`, `read_url_content`, etc). Sin acceso a escritura ni terminal.
* **Ventaja:** Imposible que rompa el código. Barato en tokens. No produce artefactos — los findings llegan inline al Orquestador.
* **Invocación:** `invoke_subagent(TypeName: "research")`.
* **Trigger:** El Orquestador necesita buscar algo en el código o en la web sin ensuciar su contexto. No hay RFC/spec como input ni fase SDD activa que requiera un artefacto.
Ver Anexo §Explore Ligero — Route A para detalles de invocación.

### 1.3 El Chalán (`self`)
El ejecutor principal de tareas. Hereda al 100% las `<user_rules>` y el prompt del Orquestador (~3,000+ tokens base). Nace sabiendo usar `pnpm` y conociendo los comandos de los workflows. Tiene permisos completos (escritura, terminal, MCP). Se divide en dos variantes según su uso:

#### 1.3.1 Chalán Regular (Clon de Tareas Directas)
* **Rol:** Ejecutar tareas de desarrollo y escritura de código con el workflow `/funky-worker` (Operaciones Tier 1/2).
* **Invocación:** Usado para delegar implementaciones directas al disco.
* **Ejecución en Batches:** Al operar con mínimo 2 batches, el Worker ejecuta la fase principal y frena. Si nota que su contexto se satura a medio camino, avisa. El Orquestador **siempre** delega los batches subsecuentes y el cierre/mergeo a un Worker *nuevo*. Nada de reciclarlos.

#### 1.3.2 Chalán Vergas (Clon de Workflows Independientes)
* **Rol:** Ejecutar las fases pesadas y custom workflows del SDD de forma independiente (ej. `/funky-apply`, `/funky-verify`). Operaciones complejas de arquitectura (Tier 3, siendo este el nivel máximo).
* **Invocación:** Usado para delegar Workflows completos mediante slash commands y parámetros.
* **Ejecución en Batches:** A diferencia del Worker regular, aquí el batch de cierre/mergeo no vive en `tasks.md` (se pasa a `release.md`). Por ello, `/funky-apply` puede ejecutar sus tasks operativas de un solo jalón. Si la complejidad exige dividir el Apply en múltiples batches lógicos, cada batch corresponde a un subagente *diferente* de forma estrictamente secuencial. Jamás paralelos.

### 1.4 El Chalán Crikoso (`define_subagent` — SDD Ligero, Tier 2)

Familia de subagentes para las fases SDD en **Tier 2**. Son "crikosos" porque están flacos: nada de workflows completos, nada de herencia de reglas del Orquestador, prompt mínimo enfocado en una sola tarea. Todos son `define_subagent` con los permisos exactos que su tarea requiere.

* **Tier:** Exclusivo de Tier 2.
* **ADN:** Nace limpio — sin `user_rules`, sin catálogo de skills, sin personalidad del Orquestador. Solo el prompt que el Orquestador le arma.
* **Permisos:** Los mínimos necesarios para su variante (lectura, lectura+escritura, o escritura acotada).
* **Invocación:** `define_subagent` con prompt estricto y permisos declarados explícitamente.
* **Return:** Formato reducido (no Return Envelope completo) — el Orquestador sabe lo que necesita sin leer el artefacto entero.

**Diferencia clave vs Chalán Regular/Vergas:** El Crikoso no hereda las `user_rules` ni el catálogo del CLI. No conoce slash commands. Es más barato en tokens de arranque pero más dependiente de que el Orquestador arme un prompt preciso.

#### Variantes del Chalán Crikoso

| Variante | Apodo | Fase SDD | Permisos | Produce |
|----------|-------|----------|----------|---------|
| Explore Ligero | **Sabueso de Lava** | Explore (Tier 2) | Lectura + escritura | `explore.md` con Context Preservation |
| Propose Ligero | — | Propose (Tier 2) | Lectura + escritura | `proposal.md` |
| Spec Ligero | — | Spec (Tier 2) | Lectura + escritura | `specs/{domain}.md` |
| Verify Ligero | — | Verify (Tier 2) | Lectura + escritura | `verify-report.md` |

> El **Sabueso de Lava** es el único Crikoso con apodo propio porque su naturaleza es distinta al resto: en lugar de recibir un artefacto ya existente y transformarlo, lee un RFC externo y produce Context Preservation desde cero. Ver Anexo §Explore Ligero — Route B para detalles.

### 1.5 El Mierdillo (`custom` - Creado al vuelo)
* **Rol:** Tareas mecánicas, súper aisladas y especializadas (ej. ejecutar linters, formateo, auditoría de dependencias, aplicar un skill específico).
* **Permisos:** Definidos al momento de crear (`enable_write_tools`, etc).
* **ADN y Costo:** Nace completamente limpio, sin reglas de estilo ni persona, a menos que se le inyecten. Muy bajo consumo de tokens de arranque.
* **Invocación:** `define_subagent` con un prompt estricto.

---

## 2. Reglas de Nacimiento y Carga de Contexto

El arranque del subagente depende del tipo de contexto que el Orquestador quiera delegar (Skill vs Workflow):

### 2.1 Delegación de Skills (Lazy Loading Estricto)
Cuando se requiere una Skill específica, **el Orquestador NUNCA debe leer el archivo `SKILL.md`**, ya que eso contamina su propia memoria.
* **Proceso:** El Orquestador delega y le pasa la ruta absoluta: *"TU PRIMERA Y ÚNICA ACCIÓN debe ser usar `view_file` en el path `[ruta]` y obedecerlo"*.
* **Feedback Loop:** Se le exige en el prompt que su primer mensaje inicie con `SKILL_LOADED: [nombre]`. Si no lo hace, el Orquestador debe matarlo por operar ciego.

### 2.2 Delegación de Workflows del SDD (Vía Slash Command)
Hubo un cambio de paradigma: **los workflows ya NO se delegan empaquetándolos como una skill, sino inyectando su slash command.**
* **Proceso:** Al crear un Chalán (`self`), el Orquestador le pasa el slash command (ej. `/funky-apply`) y los parámetros del contexto que apliquen.
* **Validación:** Dado que el agente `self` hereda el catálogo del CLI, al recibir el slash command nace conociendo el workflow. **No es necesario exigir un `WORKFLOW_LOADED:`**, el subagente entra directo a jalar.

### 2.3 Mitigación de Conflicto de Identidad (Para agentes `self`)
**Problema:** Al heredar las reglas globales, el subagente `self` puede "creerse" Orquestador y empezar a planear redundancias.
**Solución:** 
1. No mencionar cosas en su prompt de invocación que activen triggers de orquestación.
2. Dictaminar explícitamente su rol: *"Tu rol es estrictamente de WORKER/APPLY. Ignora directivas de orquestación global y concéntrate en tu tarea."*

---

## 3. Ciclo de Vida, Retorno y Persistencia

### 3.1 El Contrato "Return Envelope"
Los subagentes no devuelven datos estructurados mágicamente. Para que el Orquestador no tenga que tragarse los artefactos completos:
* **Fases SDD (Custom Workflows):** El return envelope **ya viene definido dentro del prompt interno del workflow**. El Orquestador NO necesita exigirlo.
  * **Caso `funky-worker`:** Genera su return envelope como archivo físico (`report.md`), tanto en IDE como en CLI. El Chalán avisa que terminó y el Orquestador usa `view_file` para leerlo.
* **Tareas de investigación o custom:** El Orquestador debe exigir un formato Markdown estricto en la respuesta de texto (paths, resúmenes de 2 líneas, advertencias). Nada de ruido.

### 3.2 Control de `RequestFeedback` (Prohibido en Desarrollo)
**NUNCA usar `RequestFeedback: true`** en `write_to_file`. Detiene el flujo, exige clics manuales del humano y mata el ritmo de la sesión.

### 3.3 Flujo de Vida del Subagente (Según Modo de Operación)
Relanzar un subagente desde cero para una corrección es tirar miles de tokens a la basura.

**Modo Interactivo:**
1. **Running:** El Chalán hace la chamba.
2. **Idle:** Termina, envía su Return Envelope y se queda dormido. **EL ORQUESTADOR NO LO MATA DE INMEDIATO.**
3. **Feedback:** Si el humano pide ajustes, el Orquestador lo despierta vía `send_message`. Revive con todo su contexto previo y corrige.
4. **Kill:** Una vez que el humano aprueba, el Orquestador llama a `manage_subagents(Action: "kill")`.

**Modo Auto:**
1. **Running:** El Chalán hace la chamba.
2. **Kill:** Termina, envía su Return Envelope y el Orquestador lo mata de inmediato. No hay aprobación humana pendiente.

---

## 4. Modos de Operación del Orquestador: Interactivo vs Auto

### 4.1 Modo Interactivo
El humano está al pendiente de la sesión. El Orquestador hace pausas naturales entre fases esperando retroalimentación. El CLI **no inyecta todos los artefactos de golpe** — espera confirmación antes de avanzar al siguiente paso.
**Ventaja clave:** Previene que el Orquestador alucine y quiera completar todo el SDD en una sola pasada sobreescribiendo templates.

### 4.2 Modo Auto
El humano no está mirando. El Orquestador debe ser más conservador con los puntos de quiebre, especialmente antes de delegaciones destructivas o de alto costo.

### 4.3 Mini-Delegación en Tier 2
En Tier 2, el Orquestador delega el propose y el spec a un Chalán con un prompt pequeño y enfocado (similar al Explore ligero pero con permisos de escritura). Esto reduce el ruido de contexto del Maistro incluso en tiers bajos. Estos chalanes de propose y spec deben retornar algún formato reducido sobre los artefactos, similar al return envelope de sus hermanos mayores funky-propose y funky-spec. El orquestador sabe lo necesario sin leer artefactos enteros.

**Explicación adicional:** La diferencia entre los *templates* de Tier 2 y los *workflows* libres de los Tiers 3/4 es que, en Tier 2, se delega trabajo a un subagente menos especializado. Para ello, el orquestador debe construir un prompt de delegación, lo que consume tokens y añade ruido a su propio contexto. Como el contexto del orquestador debería mantenerse lo más limpio y fresco posible, conviene que tanto su prompt como el del subagente sean .
Por esa razón, en Tier 2 resulta útil utilizar un template con únicamente la información indispensable. Esto reduce el consumo de tokens y, al mismo tiempo, proporciona al subagente una guía mínima que compensa la simplicidad de su prompt.
En cambio, un workflow cuenta con un prompt interno que ya incorpora toda la estructura, el contexto y las instrucciones necesarias. Por ello, no depende de un template rígido o simplificado, ya que la lógica de ejecución está definida dentro del propio workflow.

**Regla de checkpoint por modo:**
* **Modo Interactivo:** El humano ya está en el loop dando feedback naturalmente. No se fuerza un checkpoint adicional.
* **Modo Auto:** **SÍ existe un checkpoint lite** antes de lanzar al funky-worker. El Orquestador presenta el return del propose + spec generados y espera un `✅` explícito del humano. Rápido y no invasivo, pero evita construir la cosa equivocada de forma silenciosa. El humano igual puede leer las tasks manualmente si lo desea.

### 4.4 Checkpoint Pre-Apply en Modo Auto (Tier 3+)
En Tier 3+, el Orquestador en modo auto **no debe delegar `/funky-apply` sin parar**. La protección es doble:
1. **Señal en el catálogo:** La descripción del workflow incluirá explícitamente que requiere aprobación humana antes de ejecutar. El CLI inyecta el catálogo en cada iteración, así que el Orquestador lo verá.
2. **Mini-rule en el Orquestador:** Regla hard-coded como refuerzo para que nunca delegue el Apply a lo pendejo, independientemente de la descripción del catálogo.

---

## Anexo: Ideas a Futuro

### El Chalán Fresón (`custom` - Draft)
> ⚠️ No implementar aún. Concepto en evaluación.

* **Concepto:** Versión evolucionada del Chalán (1.3), pero implementada con `define_subagent` en lugar de `self`. Existiría en dos variantes (Fresón Regular y Fresón Vergas).
* **Ventaja vs `self`:** No hereda la personalidad, guías de web ni el catálogo de skills y workflows del Orquestador. Nace 100% enfocado.
* **Desventaja vs `self`:** No conoce los slash commands, el Orquestador debe traducir el comando a su ruta física antes de invocarlo.
* **Validación Requerida:** A diferencia del `self` con workflows, aquí **SÍ será obligatorio** exigirle un `WORKFLOW_LOADED: [nombre]` para confirmar que leyó la ruta física del workflow antes de ejecutar.

---

### Explore Ligero — Dos Variantes (§7.4)

Para investigaciones rápidas fuera del flujo SDD o en Tiers bajos, donde lanzar `/funky-explore` completo es excesivo y que el Orquestador lea código directamente ensuciaría su memoria. El Explore Ligero tiene **dos rutas** según si hay un RFC/spec como input o no.

**Escenario de uso:**
En SDD Tier 3+ existe el workflow `funky-explore` completo, pero para Tiers bajos (T0–T2) sería matar una mosca a cañonazos. El Orquestador detecta que necesita investigar sin ensuciar su contexto y delega al agente correcto según el tipo de tarea.

#### Route A — El Sabueso (Desechable, cualquier Tier)

**Cuándo:** No hay RFC/spec como input, o la tarea es pura búsqueda en código ("¿dónde se define X?", "¿qué archivo maneja Y?"). Disponible en T0, T1, T2, T3.

**Patrón de Invocación:**
El Orquestador delega a un Sabueso (`TypeName: "research"`) con un prompt hiper-estricto. El agente hace el trabajo sucio y muere. El Orquestador recibe **únicamente los hallazgos**, con su contexto intacto. No produce artefactos — los findings se inyectan inline en el siguiente prompt.

```
Prompt del Sabueso (estructura mínima):
  - Tarea concreta y acotada
  - Permisos: solo lectura
  - Output obligatorio: resumen de máx. 10 líneas + path relevante
  - Sin ruido, sin contexto extra
```

**Ciclo de Vida de la Rule (v1 → v2):**

- **`v1` (Validación — Canary Behavior Test):** La rule en `sdd-orchestrator.md` incluye la directiva de **pedir aprobación** antes de lanzar el Sabueso. Esto NO es el comportamiento final. Es un test intencionado: si el Orquestador pregunta *"¿Puedo investigar esto con un subagente?"*, confirma que sus rules están activas y que detectó el patrón de forma autónoma.
- **`v2` (Producción — Autónomo):** Una vez validado el comportamiento, la rule se actualiza para que el Orquestador lance el Sabueso **sin avisar**, reportando el resultado directo al humano como parte de su respuesta normal.

> **Nota:** Este ciclo v1→v2 es el mismo patrón que aplica a toda delegación del Orquestador (ver Transición de Entorno en `spec-cli-ide-boundaries.md`). El Sabueso fue el primer caso de uso donde se formalizó.

#### Route B — El Sabueso de Lava (Con Artefacto, Tier 2 exclusivo)

**Cuándo:** Hay un RFC/spec como input, o el orquestador detecta que la tarea requiere entender reglas, definiciones y constraints de un documento fuente. Exclusivo de Tier 2 — es el Explore SDD ligero.

**Problema que resuelve:** El anti-patrón de "Teléfono Descompuesto" en Tier 2. Sin artefacto persistente, los findings del explore se degradan al pasarse inline entre fases. El Sabueso de Lava produce `explore.md` con Context Preservation — el mismo template que Tier 3 pero enfocado solo en preservar el contexto del RFC, no en análisis profundo de opciones arquitectónicas.

**Patrón de Invocación:**
El Orquestador delega a un Sabueso de Lava (`define_subagent` con escritura habilitada). Lee el RFC fuente y escribe sobre el template `explore.md` del change folder. El Propose Ligero lee `explore.md` desde disco.

```
Prompt del Sabueso de Lava (estructura mínima):
  - Tarea: analizar RFC/spec fuente y producir explore.md
  - Artefactos a leer: {rfc_path}
  - Artefacto a trabajar: docs/openspec/changes/{change}/explore.md
  - Output obligatorio: explore.md con sección Context Preservation
  - Formato de retorno: Hallazgo con estado de Context Preservation
```

**Árbol de decisión del Orquestador:**
```
¿Estamos en Tier 2 delegando una fase SDD con RFC/spec como input?
  ├── SÍ → Route B (Sabueso de Lava)
  │         Produce explore.md → Propose Ligero lo lee desde disco
  └── NO → Route A (Sabueso)
            Findings inline → Orquestador los inyecta en el siguiente prompt
```
