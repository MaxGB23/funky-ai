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

### 7.3.1. Mejora a la Escalera de Tiers (Sección 6)

Para evitar decisiones ambiguas y proteger la regla absoluta de "NO escribes código" del Orquestador, la Escalera de Tiers se refina de la siguiente manera:

- **Tier 0 (Micro-Fix):** Fix trivial de 1 línea (typos, imports). **Excepción por Override Humano:** El Orquestador detecta que es trivial, FRENA y pregunta al humano si quiere que lo edite *inline*. Si el humano aprueba, el Orquestador edita el código directo. Sin workflows, sin workers, sin `tasks.md`.
- **Tier 1 (Fast Track):** Tarea chica (1-2 archivos). 
  - **Exploración:** Usa el "Explore Ligero" (sabueso desechable de 7.4) para no ensuciar la memoria del Orquestador leyendo código.
  - **Planeación:** El Orquestador redacta el `tasks.md` *inline*. (Regla: Si el tasks es demasiado complejo para redactarse inline, la feature debe escalarse a Tier 2).
  - **Ejecución:** Delegada al Worker básico.
- **Tier 2 (Standard Feature):** Feature normal (2-5 archivos).
  - **Exploración:** Delegada al workflow `/funky-explore`.
  - **Planeación:** Orquestador redacta `proposal.md` y `spec.md` *inline*.
  - **Tasks:** Delegada al workflow `/funky-tasks` (este workflow funge como detector de riesgo mediante su Return Envelope).
  - **Ejecución:** Delegada al Worker básico.
- **Tier 3 (Insano 👻):** Cambios complejos o de alto riesgo. CADA fase se aísla en su propio workflow. La ejecución la toma `/funky-apply` (que lee el `spec.md y design.md` directo, eliminando la necesidad de microplanning en el Orquestador).
- **Tier 4 (Rediseño):** 8 Roles aislados, máximo límite de tokens. Frenado de emergencia.

### 7.3.2
Leer ./rules-orchestrator-backup.md

### 7.3.3. Cruce de la Lógica SemVer con SDD (Sección 2)

El CLI (`funky feature`) se encargará puramente de la inyección mecánica de plantillas. La **validación e inteligencia** recae completamente en el Orquestador antes de iniciar el comando.

**Regla de la "Trinidad del Setup":**
Cuando el humano pide una feature, el Orquestador analiza y dicta explícitamente los 3 parámetros de los Inquirers:
1. **Tier sugerido** (T0-T4)
2. **Impacto en Docs Core** (Sí/No)
3. **Tipo de Release SemVer** (Major/Minor/Patch/None)

**Ley de Gravedad Inversa (SemVer empuja el Tier):**
El tipo de release (SemVer) define un **piso mínimo** para el Tier. Un cambio puede escalar de Tier si es muy complejo, pero NUNCA puede bajar del piso que le marca el SemVer:
- **MAJOR (Breaking Changes):** Piso mínimo **Tier 3**. `release.md` y `docs.md` OBLIGATORIOS.
- **MINOR (Nuevas Features):** Piso mínimo **Tier 2**. `release.md` OBLIGATORIO. (`docs.md` condicional a impacto).
- **PATCH (Bugfixes/Updates):** Piso mínimo **Tier 1** (o T0 si es micro). El código cambia, requiere subir versión (ej. 1.0.1 -> 1.0.2). Se omite el `release.md`, `docs.md` es condicional, PERO obliga al Orquestador a inyectar una tarea explícita de "Actualizar versión en package.json y actualizar versión en README raíz" en el `tasks.md`.
- **NONE (Internal Chores):** Piso mínimo **Tier 0**. Tareas internas. No se sube versión, se omite release.

**Aclaraciones Técnicas de Coherencia:**
- **Patch Escalado:** Si un Patch es muy complejo, el humano o el Orquestador pueden escalarlo a Tier 2 voluntariamente para usar los workflows de protección, aunque su piso fuera T1.
- **Branch Management (Fase 0):** Para cualquier operación de Tier 1 a Tier 4, la creación de rama (branch) y PR es **OBLIGATORIA**, incluso si el SemVer es NONE. No somos vaqueros. La única excepción donde no se hace branch es el Tier 0 (Micro-fix inline directo).

Con esta regla, el Orquestador protege el SDD. Si el humano pide un breaking change de DB y dice "es Tier 1", el Orquestador frena: *"Karnal, romper contratos es MAJOR, a huevo nos vamos a Tier 3 aislando fases"*.
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

El Orquestador, que sí conoce el Tier y el contexto de negocio, actúa como Puerta de Escalamiento Dinámico al leer este Return Envelope:
- **Riesgo manejable (T2):** El Orquestador añade una instrucción o guardrail extra directo en el prompt del Worker básico para darle contexto sobre el cuidado que debe tener.
- **Riesgo crítico (T3):** El Orquestador frena la ejecución y le pide al humano escalar la fase a Tier 3, reemplazando al worker básico por el workflow `/funky-apply` que tiene todo el contexto arquitectónico.

Separación de responsabilidades limpia: el workflow detecta, el Orquestador evalúa y mitiga.