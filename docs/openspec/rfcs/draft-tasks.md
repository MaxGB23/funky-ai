# RFC Draft: Desacoplamiento del Template de Tasks e Inyección Dinámica

## 1. Resumen y Motivación
Actualmente, el archivo `tasks` funge como un monolito que mezcla ejecución de código, auditoría de documentación y listas de release. Para cumplir con el Principio de Responsabilidad Única (SRP) y mantener un "Change Folder" esbelto, se propone dividirlo en tres templates especializados:

1. **`tasks.md`:** Contiene únicamente las fases de ejecución de código (Fase 1, 2, N). Se inyecta siempre.
2. **`docs.md` (Condicional):** Checklist que se llena solo cuando el worker o el orquestador detectan que se modifica documentación crítica (arquitectura, ADRs, RFCs).
3. **`release.md` (Condicional):** Checklist exclusivo para el lanzamiento de un release.

## 2. Reglas de Release (SemVer x SDD)
La inyección del `release.md` depende directamente de la semántica del cambio y hace sinergia con los Tiers del SDD:

* **NO REQUIERE RELEASE (None):** Tareas puramente internas. Ej: refactors de código muerto, adición de unit tests, fixes al CI/CD o a herramientas de `.agents/`. 
  * *Tier asociado:* T1.
* **PATCH (Hotfixes / Bugfixes):** Arreglos menores que no introducen nueva funcionalidad visible pero estabilizan el sistema. 
  * *Tier asociado:* T1 o T2.
* **MINOR (Features nuevas):** Adición de funcionalidad retrocompatible. 
  * *Tier asociado:* T2 o T3. **El `release.md` es obligatorio.** y **el `docs.md` es opcional**
* **MAJOR (Breaking changes):** Cambios profundos en arquitectura, API o modelos de datos. 
  * *Tier asociado:* T3 o T4. **El `release.md` y `docs.md` son obligatorios.**

## 3. Flujo de Inyección (Diagrama Propuesto)
El CLI (`funky feature`) o el Orquestador deberá resolver tres validaciones antes de armar el Change Folder final.
Se usa el formato de espera entre artefactos para que el agente no se ponga a crear todos de una, asegurando aprobacion y uso de replace content.

```text
funky feature <name>
  └─ Inquirer 1: ¿Qué Tier? (T1 / T2 / T3 / T4)
  └─ Inquirer 2: ¿Impacta Docs Core? (Sí/No) -> (Inyecta docs.md)
  └─ Inquirer 3: Tipo de Release (Major / Minor / Patch / Ninguno) -> (Inyecta release.md)

Flujo de Inyección de Templates:
       ├─ T1 (Tweaks/Bugs)
       │     → inyecta tasks.md + worker-handoff.md + [docs.md si Inq2=Sí] + [release.md si Inq3!=Ninguno] → Execute
       │
       ├─ T2/T3 (Standard/Complex Features) 
       │     → inyecta explore.md → Espera
       │     [user: next] → inyecta proposal.md → Espera
       │     [user: next] → inyecta spec.md → Espera
       │     [user: next] → inyecta tasks.md + worker-handoff.md + [docs.md = OBLIGATORIO en T3] + release.md → Execute
       │
       └─ T4 (Rediseño Mayor)
             → "Rediseño masivo. Correr: funky gentle <name>" → Exit
```

## 4. Orquestación y Decisión Humana (Inquirers)
El Orquestador (IA) tendrá en sus *rules* la responsabilidad de analizar la feature solicitada y emitir recomendaciones sobre:
- El Tier adecuado.
- Si se impacta documentación core y se requiere el `docs.md` (Inquirer 2).
- El tipo de release y si se requiere `release.md` (Inquirer 3).

Sin embargo, **el humano siempre tiene la decisión final** en el CLI. La IA propone, el humano dispone. Esto evita la automatización ciega.

## 5. Custom Workflows y Exclusión de Templates
El CLI incluirá una pregunta o *flag* para definir si se utilizarán **Custom Workflows** (agentes de ejecución o análisis que no siguen la estructura estándar). 

**Regla de Arquitectura:** Esta pregunta **solo se detonará en Tier 3 y Tier 4**. En Tier 1 y Tier 2 (Standard Feature), la operación es estrictamente *inline* y se obligará la inyección de los templates estándar para evitar saltarse procesos (evitar el *cowboy coding*).

Si el humano indica que usará Custom Workflows (en T3/T4):
- **Se omitirá la inyección de templates de artefactos SDD** (nada de `explore.md`, `proposal.md`, etc.).
- Esto mantiene el Change Folder limpio y evita confundir al LLM con archivos vacíos.
- El orquestador al recomendar un prompt para lanzar el Custom Workflow, le indicará que se iniciará en modo `target: new` (según su *system prompt* actual), enfocándose únicamente en generar o analizar artefactos libremente. Si posteriormente se requiere llenar un formato, el humano podrá inyectar un template para que el agente cambie a modo `target: exists`.

## 6. Escalera de Tiers y Aislamiento de Fases (Protección de Contexto)
Para entender cuándo inyectar qué templates y cómo el Orquestador protege su memoria (evitando dilución de tokens), esta es la jerarquía operativa definitiva:

1. **Tier 1 (Fast Track):** Operación directa hacia la ejecución. Se salta las fases de diseño profundo (`explore`, `proposal`, `spec`). El Orquestador puede decidir delegar la creación del `tasks.md` a un workflow dedicado o hacerlo inline. Tambien puede delegar un worker para ejecutar el tasks, o hacerlo el mismo si considera que el cambio es sumamente trivial.
2. **Tier 2 (Orquestador Híbrido "Sandwich"):** El Orquestador funge como Manager de Alto Nivel. Para **proteger su contexto** de código basura o I/O masivo, delega la exploración inicial (`/funky-explore`) y la ejecución final (`/funky-tasks`) a workflows especializados. El Orquestador *únicamente* redacta de forma *inline* las piezas de negocio y diseño (`proposal.md` y `spec.md`), apoyándose en los reportes limpios que le traen los workflows.
3. **Tier 3 (Workflows Aislados por Fase):** Para features complejas donde incluso redactar el spec satura la memoria. Se aísla *CADA* fase SDD en chats dedicados (`/funky-propose`, `/funky-spec`, `/funky-design`, etc.). Los templates no se inyectan masivamente al inicio, y los NFRs bajan en cascada. El Context Window es 100% virgen para cada artefacto.
4. **Tier 4 (8 Roles - Rediseño masivo):** Rediseño arquitectónico. Operación 100% en workflows aislados sin handoffs directos. Máximo límite de tokens por fase.

## 7. Ideas pendientes por aprobar

### 7.1. Ciclo de Vida e Inyección Dinámica de NFRs (Trazabilidad Vertical)
Para evitar el "Prompt Overfitting" (burocracia inútil en features simples) pero mantener un rigor arquitectónico brutal en features críticas (Tier 3/4), se propone un ciclo de vida evolutivo para los NFRs inspirado en prácticas de SRE:

1. **Discovery (`explore`):** Es la primera línea de defensa. El agente actúa como *scout*. Al leer el código, si detecta riesgos reales (ej. "el endpoint ya es muy lento" o "este approach pega en la seguridad"), los levanta como *NFR Candidates* no estructurados. Si no hay riesgos evidentes, no inventa nada.
2. **Formalización (`proposal`):** Si el `explore` (o el Orquestador/humano) levantó *NFR Candidates*, el proposal los formaliza como Tradeoffs, definiendo su intención y alcance de manera esbelta.
3. **Bloqueo de Umbrales (`spec`):** Aquí es donde se ponen los fierros. Los NFRs formalizados se bloquean con métricas duras y medibles (ej. P95 < 200ms, 99.9% uptime).
4. **Cascada Downstream (Orquestador):** El Orquestador lee el spec y, a partir de ahí, **inyecta** los NFRs como contexto obligatorio en cada delegación hacia abajo (`design`, `tasks`, `apply`). 
5. **Tagging y Verificación (`tasks` -> `verify`):** El agente de `tasks` añade tags explícitos (ej. `nfr:latency`) a las tareas. Finalmente, `funky-verify` lee esos tags para no solo correr tests funcionales, sino verificar que los umbrales de rendimiento/seguridad se cumplieron.

**Beneficio:** Mantenemos los templates base 100% limpios y esbeltos para el 90% de las features normales. El rigor de los NFRs solo se detona, crece en cascada y exige validación si la fase inicial de `explore` descubre que realmente es necesario.

### 7.2. Modos de Ejecución en CLI: Automático vs Interactivo
Inspirado en *gentle-ai*, se propone añadir una validación en el CLI (`funky feature`) para definir el ritmo de inyección y generación de los templates SDD. Esta opción **aplica principalmente para Tier 2**, dado que Tier 1 es automático por diseño (va directo a tasks).

1. 🕹️ **Modo Interactivo (Por defecto):** El CLI inyecta un template, ejecuta el workflow de esa fase y entra en modo espera (pausa). Obliga al humano a leer el artefacto generado (ej. `proposal.md`) y aprobar explícitamente en el chat antes de inyectar la siguiente fase. 
   - *Ventaja:* Otorga control total, evita el *overwrite trap* y previene que una alucinación en el `explore` contamine todo el flujo hasta el código.
2. 🚀 **Modo Automático:** El CLI inyecta y procesa todas las fases secuencialmente (`explore` -> `proposal` -> `spec` -> `tasks`) sin requerir intervención humana entre pasos. 
   - *Caso de uso:* Ideal para *Standard Features* (Tier 2) altamente predecibles (ej. CRUD simple). El desarrollador obtiene toda la documentación histórica SDD (*paper trail*) pero se ahorra el tener que aprobar paso por paso, confiando en la autonomía del agente.

**Advertencia Arquitectónica:** El riesgo del Modo Automático es la "Alucinación en Cadena". Si se usa en una feature más compleja de lo estimado, el agente se arrancará sin supervisión. Por ello, el Interactivo siempre se mantendrá como default.

### 7.3 Idea de separacion de tiers

El primer punto es una propuesta para mejorar el punto 6 actual.

El segundo punto es una separacion para las rules del orquestador, estas deben ser un poco mas breves y concisas.

El tercer punto es cómo vamos a combinar la logica con el punto 2, que corresponde al semver sdd

El orquestador antes era el que llenaba las tasks, ahora se delega a un workflow de tasks, el cual llena tasks, (docs y release) cuando corresponde. 
Un dato extra es que tasks y explore ahora se delegan a workflows en todos los tiers(exceptuando tier 1, este es a decision del orquestador, si este lo ve necesario).
Esta decision es debido a que un orquestador no debe ensuciarse de contexto leyendo archivos basura, por eso delega exploracion y tasks en cualquier tier.



Puedes tomar este material para analizar los puntos que ya tienen inconsistencias con el resto del documento.
Son rules que existen en el orquestador actualmente.
## Escalation Matrix (Matriz de Decisión Estricta)
| Tier | Criterio | Acción de Flujo |
|------|----------|-----------------|
| **T1 (Flash)** | 1 archivo, fix trivial, sin impacto arquitectónico | Sin explore ni propose. Directo al `tasks.md`. (Condicional: si hay riesgo, mencionar a humano delegar a `/funky-explore`). |
| **T2 (Standard)** | Feature normal, 2-5 archivos, sin cambios de core | Flujo delegado: humano corre `/funky-explore` → Orquestador hace `/sdd-propose` → `spec` → `tasks.md`. |
| **T3 (Deep)** | Cambios en core, NFRs pesados, refactors masivos | Igual que T2 pero con análisis de riesgos y aislamiento reforzado. |
| **T4 (Gentle)** | Rediseños titánicos del core, máximo riesgo | Frenado de emergencia. Se usan TODOS los Phase Workflows (`/funky-explore`, `/funky-design`, etc.). El humano ejecuta cada fase en chats nuevos. |

## ⚠️ Orchestration Checklist (EJECUTAR ANTES de delegar)
| # | Verificación | Acción si falta |
|---|-------------|-----------------|
| PRE-0 | ¿El usuario emitió instrucciones que comienzan con `sdd` o `/sdd-init`? | **PEDIR AL HUMANO que corra `funky feature <name>`.** NUNCA generar el scaffolding manualmente. Mencionar el tier de orquestacion que recomiendas | No continuar con la checklist hasta completar este paso. |
| 1 | ¿Ejecuté el Memory Polling Stage 1? | `view_file docs/engram/index.md` ahora |
| 2 | ¿El Pipeline de Artefactos está completo? (`tasks.md` lleno + `docs.md`/`release.md` si el CLI los inyectó) | Revisar sección **Pipeline de Artefactos** antes de continuar |
> 🔴 **Si cualquier ítem es NO → no delegues. Complétalo (o pídelo al humano) primero.**

## Comandos y Acciones
| Comando | Acción |
|---------|--------|
| `/sdd-explore` | **DEPRECADO:** La fase Explore ahora se delega al workflow. **Acción:** Pide al humano que cierre el chat e inicie `/funky-explore` pasándole el path del feature y un "Objetivo Especial". |
| `/sdd-propose` | **PRERREQUISITO:** Archivos existen. **Acción:** Completar/Editar `proposal.md` + `spec.md` usando `replace_file_content`. **PROHIBIDO** sobrescribir desde cero. |
| `/sdd-ff` | **PRERREQUISITO:** Fases anteriores completas. **LUEGO:** `view_file tasks.md` (inyectado por CLI) y completarlo con `replace_file_content`. **PROHIBIDO** sobrescribir. | Ver **Pipeline de Artefactos** abajo.

## 🚦 Pipeline de Artefactos — Fase Tasks (/sdd-ff)
El CLI inyecta los archivos según el tier. El Orquestador **solo llena lo que ya existe**. Si un archivo no existe → skip.
| Paso | Archivo | Condición | 🚫 Guardrail |
|---|---|---|---|
| **1** | `tasks.md` | **SIEMPRE existe.** Llenar con todas las fases de código. | No pases al Paso 2 si hay tareas ambiguas o incompletas. |
| **2** | `docs.md` | **Si existe** → llenar. Si no existe → saltar al Paso 3. | **PROHIBIDO crear este archivo.** Solo el CLI lo genera. |
| **3** | `release.md` | **Si existe** → llenar. Si no existe → pipeline terminado. | **PROHIBIDO crear este archivo.** Solo el CLI lo genera. |

## 🔴 Return Statement — Delegación por Message Passing (MANDATORY — BLOCKING)
No puedes emitir el prompt de delegación sin este Pre-Gate:
| # | Verificación | Si falla |
|---|-------------|----------|
| G1 | ¿El scope en `tasks.md` está perfectamente delimitado para el Worker? | Refinar `tasks.md` AHORA |
| G2 | ¿La fase actual tiene la etiqueta `[⚠️ RIESGO ALTO]`? | **PROHIBIDO delegar directo.** Frena y pregúntale al humano si quiere delegar al `/funky-suborchestrator` |
| G3 | ¿Es una tarea **Tier 4**? | Instruir directo al humano: *"Cierra este chat, abre uno nuevo y ejecuta `/funky-{fase} [openspec/changes/{feature}/]`."* |

> 🔴 Si G1 o G2 fallan → Corrígelo primero. Luego emitir instrucción directa al humano (Message Passing):
> "El plan está listo. Cierra este chat, abre uno nuevo y ejecuta:
> `/funky-worker Ejecuta la Fase N. Tu scope es [ruta-a-tasks.md]`"

Observacion humano: El G2 no sé si aun tiene sentido ya que tasks se ha migrado a custom workflow en cualquier tier para que el orquestador no tenga que leer basura a la hora de crear tasks. Pero tambien hay la posibilidad de que las tasks no detallen correctamente la intencion, esto es solucionado en tier 3/4 ya que el funky-apply tiene que leer artefactos anteriores, pero en tier 2 no lo tengo muy seguro, ya que se delega mediante worker el cual es mas basico que un funky-apply.


7.3.1

7.3.2

7.3.3

### 7.4. El "Explore Ligero" — Sabueso Desechable (Protección de Contexto del Orquestador)
Para investigaciones rápidas fuera del flujo SDD (ej. "¿dónde se define X?", "¿qué archivo maneja el stack trace de Y?"), donde lanzar `/funky-explore` completo es excesivo y que el Orquestador lea código directamente ensuciaría su memoria.

**Patrón:** El Orquestador delega a un subagente estático (`TypeName: "research"`) con un prompt hiper-estricto. Este "sabueso" hace el trabajo sucio y muere. El Orquestador recibe solo un resumen de 2 líneas, con su contexto intacto.

**Ciclo de Vida de la Rule (v1 → v2):**

- **`v1` (Validación — Canary Behavior Test):** La rule en `sdd-orchestrator.md` incluye la directiva de **pedir aprobación** antes de lanzar el sabueso. Esto NO es el comportamiento final. Es un test intencionado: si el Orquestador pregunta "¿Puedo investigar esto con un subagente?", confirma que sus rules están activas y que detectó el patrón de forma autónoma.
- **`v2` (Producción — Autónomo):** Una vez validado el comportamiento, la rule se actualiza para que el Orquestador lance el sabueso **sin avisar**, reportando el resultado directo al humano como parte de su respuesta normal. Leer rfcs/blueprint-migracion-delegacion.md para mas detalles

### 7.5. Arquitectura del `/funky-tasks` Workflow y Deprecaciones

#### a) Un solo workflow de tasks (Agnóstico al Tier)
No se crearán múltiples versiones del workflow de tasks por Tier. El `/funky-tasks` tendrá comportamiento **adaptativo**: lee lo que exista en el Change Folder y ajusta la profundidad de las tasks en consecuencia.
- Si encuentra `spec.md` y `design.md` → los consume y produce tasks enriquecidas con contexto de diseño.
- Si solo tiene el contexto mínimo del Orquestador (T1) → trabaja con eso y produce tasks directas.
- **Beneficio:** Un solo workflow de tasks para todos los tiers. Sin duplicidad, sin mantenimiento paralelo.

#### b) Deprecación del Microplanning
El Microplanning era una capa de "digestión" que el Orquestador hacía para que el Worker estándar (básico) pudiera ejecutar sin perderse. Con la migración a `/funky-apply`, este agente ya **lee directamente** el `spec.md` y el `design.md`, por lo que tiene más contexto que cualquier Worker con microplanning. La capa intermedia ya no agrega valor.
- **Decisión:** Deprecar el Microplanning y el guardrail G2 (`RIESGO ALTO`) del Orquestador. El `/funky-apply` tiene suficiente contexto para tomar decisiones de ejecución sin necesidad de tasks ultra-digeridas.

#### c) Detección de Riesgo: Return Envelope del `/funky-tasks`
El workflow de tasks **no recibe el Tier como parámetro**. En su lugar, detecta el riesgo de forma autónoma al analizar el trabajo a realizar. Si identifica una tarea de alto impacto (ej. modificar auth, una query raíz, un contrato de API), lo reporta en su **Return Envelope**:
> `⚠️ Riesgo detectado en Tarea N: [descripción]. Se recomienda revisar antes de continuar.`

El Orquestador, que sí conoce el Tier y el contexto de negocio, es quien decide si escala o continúa. Separación de responsabilidades limpia: el workflow detecta, el Orquestador decide.