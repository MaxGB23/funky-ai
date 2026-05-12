# Discoveries

Aquí se registran los hallazgos técnicos y arquitectónicos que moldean el futuro de Funky AI.

### [DISCOVERY] Model Efficacy & Quota Optimization (Abril 2026)
**What:** Gemini 3 Flash es ideal para tareas de Worker (picar código/templates) por su velocidad. Gemini 3.1 Pro Low es el "punto dulce" para Orquestación, ofreciendo estabilidad sin el consumo masivo de Pro High.
**Why:** El tráfico alto genera errores de retry que pueden agotar cuotas; modelos más ligeros fallan menos y responden más rápido.
**Where:** Workflow de ruteo de modelos en Funky AI.
**Learned:** Reservar Sonnet 4.6 Thinking / Pro High solo para crisis arquitectónicas o refactors masivos.

### [DISCOVERY] Massive Consolidation
**What:** La tablerización de procesos (SDD) es mucho más eficiente que la narrativa secuencial para el modelo.
**Why:** Reduce la carga cognitiva y el "bloat" de tokens de conexión lógica.
**Where:** `funky-ai.md` y guías de equipo.
**Learned:** Priorizar tablas de decisión sobre párrafos largos.

### [DISCOVERY] In-Template Rule Injection (Zero-Token-Waste)
**What:** En lugar de inyectar reglas de orquestación en archivos de workspace globales (ej. `.agents/rules/sdd-orchestrator.md`), se deben colocar como bloques ocultos (`> **[SISTEMA]**`) al final de los propios templates SDD (`tasks.md`, `report.md`).
**Why:** Las reglas globales contaminan el contexto y consumen cuota de tokens en todos los chats irrelevantes. La inyección en el template garantiza que la regla solo se procese en el momento exacto en que se necesita.
**Where:** Protocolo de SDD y generación de Templates.
**Learned:** Las restricciones de orquestación deben vivir lo más cerca posible de la ejecución, no en configuraciones globales.

### [DISCOVERY][sdd-template-quality-gap] Gap entre Plantilla Canónica y Templates del CLI
**What:** Los templates SDD generados por `funky phase` (en `src/templates/sdd/`) son esqueletos mínimos de ~14 líneas, mientras que la plantilla canónica oficial (`docs/funky-ai/workers/plantilla-worker-handoff.md`) tiene 83 líneas con estructura completa: Memory Polling, Reglas de Ejecución, Return Envelope.
**Why:** La Fase 3 de v1.4 fue ejecutada por un Worker con instrucciones demasiado vagas sobre el nivel de detalle esperado. El Worker interpretó "template" como "esqueleto vacío".
**Where:** `funky-cli/src/templates/sdd/` — todos los 5 archivos afectados.
**Learned:** Al instruir a un Worker para crear templates, el Orquestador DEBE adjuntar un ejemplo de referencia concreto o especificar explícitamente el nivel de detalle. "Template con estructura X" no es suficiente — hay que mostrar el modelo canónico.

### [DISCOVERY][cli-missing-readme] CLI sin README de Instalación/Uso
**What:** `funky-cli/` no tiene `README.md`. Un nuevo colaborador que clone el repo no tiene ninguna guía de cómo instalar el CLI (pnpm link), qué comandos existen ni qué hace cada uno.
**Why:** La v1.4 estuvo enfocada en implementar la funcionalidad. La documentación de superficie del paquete fue omitida.
**Where:** `funky-cli/README.md` — archivo inexistente.
**Learned:** Cada paquete publicable debe tener su README como criterio de Done (DoD). Agregar al checklist de release: "¿Existe README con instalación + comandos + ejemplos?".

### [DISCOVERY][release-dod-gap] Template de tasks.md sin pasos de documentación de Release
**What:** La Fase de Release en todos los `tasks.md` generados hasta v1.4 solo incluía `git commit + merge + tag + actualizar ORCHESTRATOR-STATE.md`. Nunca incluyó: crear `docs/funky-ai/releases/vX.Y.Z-release.md`, actualizar `README.md` con la nueva versión, ni verificar que ORCHESTRATOR-STATE.md quedara sincronizado post-merge. Resultado: v1.3 y v1.4 no tienen release notes, el README quedó en v1.2, y el ORCHESTRATOR-STATE.md quedó stale después del merge.
**Why:** El gap está en el template `funky-cli/src/templates/sdd/tasks.md` — la sección de Fase Release nunca tuvo esos pasos. Todos los Orquestadores heredaron el gap al usar `funky phase tasks`.
**Where:** `funky-cli/src/templates/sdd/tasks.md` — Sección de Release. Efecto cascada en v1.3 y v1.4.
**Learned:** El template de `tasks.md` DEBE tener una Fase de Release con checklist explícito: (1) git commit+merge+tag, (2) crear release notes en `docs/funky-ai/releases/`, (3) actualizar README.md con nueva versión, (4) sincronizar ORCHESTRATOR-STATE.md post-merge y verificar que no quede stale.

### [DISCOVERY][worker-invocation-prompt] La Invocación del Worker no está en el Template
**What:** El usuario (Router Humano) a menudo no sabe qué "prompt" usar para invocar al Worker, porque el protocolo Funky AI reemplaza los prompts largos por el archivo `worker-handoff.md`. Sin embargo, la cadena de invocación exacta (`@archivo Ejecutá la Fase X`) no está estandarizada en ningún lado.
**Why:** Asumimos que el Orquestador siempre le diría al usuario qué copiar y pegar en el chat, pero si el Orquestador no lo hace (o el usuario no lee el chat), se pierde la fluidez.
**Where:** Protocolo de Worker Handoff.
**Learned:** El `worker-handoff.md` (y el template de la CLI) debería incluir en su parte superior o inferior un bloque para el humano: `[HUMANO] Para ejecutar este worker, abrí un chat nuevo y pegá: @ruta/al/worker-handoff.md Ejecutá la Fase X`.

### [DISCOVERY][cli-testing-pure-functions] Testear CLI Commands: Extraer Funciones Puras vs. Mockear el Framework
**What:** Al intentar testear comandos de `commander` (CLI Node.js), la estrategia de mockear el módulo `commander` directamente falla. El Worker necesitó 2-3 intentos antes de encontrar el patrón correcto.
**Why:** `commander` y `process.exit()` están acoplados internamente. Mockear el módulo completo rompe la inicialización y genera errores de "cannot read property of undefined" o "process.exit is not a function" en el contexto del test runner.
**Where:** `funky-cli/src/commands/init.js` y `phase.js` — v1.6.
**Learned:** El patrón correcto para testear comandos CLI es **Extracción de Función Pura**: mover toda la lógica de negocio a una función (`runInit(opts)`, `runPhase(opts)`) que recibe sus dependencias como parámetros. El handler de `commander` solo actúa de "entry point" que llama a esa función. Los tests unitarios prueban la función pura directamente, mockeando solo `fs`, `path`, y `console`. Nunca `commander` ni `process`.

### [DISCOVERY][tty-headless-e2e-limitation] Agentes Headless no pueden ejecutar CLIs Interactivos vía TTY
**What:** Un agente de AI ejecutando comandos en una terminal headless (sin TTY real) no puede enviar keystrokes a CLIs interactivos basados en prompts (`@clack/prompts`, `inquirer`, etc.). El proceso arranca y se renderiza, pero queda colgado esperando input que nunca llega.
**Why:** Los agentes usan shells no-interactivos. Las librerías de prompts detectan la ausencia de TTY y pueden comportarse diferente o directamente bloquear el proceso.
**Where:** Fase 4 de v1.7. Afecta cualquier feature que agregue prompts interactivos al CLI.
**Learned:** La cobertura E2E de flujos interactivos se delega a Integration Tests que ejecutan `runInit()` directamente (función pura) en disco real, bypasseando la capa de UI del CLI. El test E2E manual lo hace el humano. Documentar este límite explícitamente en los criterios de éxito del `worker-handoff.md` para flujos interactivos.

### [DISCOVERY][worker-return-envelope-compliance] Workers omiten la sección de Bugs en el Return Envelope
**What:** El Worker de la Fase 2 (v1.6) entregó un reporte en formato libre, omitiendo la sección `Bugs encontrados` del Return Envelope canónico definido en `tasks.md`. Los fallos iniciales (2-3 intentos) no quedaron documentados hasta que el Orquestador lo detectó.
**Why:** El Worker priorizó reportar los éxitos y omitió los fallos intermedios. El schema del Return Envelope no tenía una instrucción explícita de "documentar TODOS los intentos fallidos, no solo el resultado final".
**Where:** Protocolo Return Envelope en `funky-cli/src/templates/sdd/tasks.md`.
**Learned:** El template de Return Envelope debe aclarar explícitamente: "Bugs encontrados incluye intentos fallidos y los anti-patrones descartados, no solo bugs en producción". El Orquestador debe validar el schema del report antes de aprobar la siguiente fase.

### [DISCOVERY][smoke-test-is-dod] El Smoke Test es la única verdad, no los tests unitarios
**What:** Tests unitarios y de integración en verde NO equivalen a software funcionando. Durante el Smoke Test de v1.7.0 descubrimos 3 bugs críticos (Canvas Overwrite, Template Sync Drift, Incomplete Scaffolding) en un CLI con 14/14 tests pasando.
**Why:** Los tests automatizados solo validan lo que el autor del test imaginó. No validan casos de negocio destructivos que el programador no anticipó, ni el comportamiento real en un entorno virgen externo.
**Where:** Definition of Done de cualquier feature con efectos en el sistema de archivos o UX del CLI.
**Learned:** La DoD para features de CLI DEBE incluir: ✅ Tests automatizados + ✅ Smoke Test en directorio virgen fuera del workspace + ✅ Revisión humana de UX. Sin las tres capas, la release no existe.

### [DISCOVERY][cli-template-sync-drift] Los templates del CLI son snapshots que se pudren
**What:** `funky-cli/src/templates/bootstrap/` es una copia estática. Cada vez que el ecosistema padre evoluciona (nuevas reglas, archivos actualizados) sin sincronización automática, el CLI distribuye versiones obsoletas del sistema Funky AI.
**Why:** No existía ningún mecanismo que forzara la sincronización. Era un proceso manual que dependía de que el desarrollador se acordara.
**Where:** `funky-cli/src/templates/bootstrap/` y cualquier carpeta de templates estáticos de una CLI.
**Learned:** Cualquier archivo que una CLI distribuya necesita un script de sincronización automatizado atado al ciclo de tests (`pretest`). Si la sincronización es manual, va a fallar. La solución es el script `sync-templates.js` creado en v1.7.0.

### [DISCOVERY][agent-cognitive-load] La sobrecarga cognitiva del agente omite protocolos críticos
**What:** El Orquestador creaba Worker Handoffs sin consultar la plantilla canónica y los Workers saltaban pasos críticos como la Fase de Release, porque las directivas quedaban enterradas bajo texto narrativo en las reglas globales.
**Why:** Cuando el contexto del agente está saturado con reglas globales, estado del proyecto y el problema técnico simultáneamente, las instrucciones de proceso de menor urgencia percibida se caen del foco de atención ("Lost in the Middle").
**Where:** Protocolo de creación de Worker Handoffs. Reglas globales en `.agents/rules/`. Templates SDD en `funky-cli/src/templates/`.
**Learned:** (1) Token Diet: las reglas globales deben ser imperativas y densas semánticamente, sin narrativa explicativa. (2) XML Tags (`<ROLE_ORCHESTRATOR>`, `<ROLE_WORKER>`) con directiva IGNORE permiten que un bloque global sea ignorado por el rol que no le corresponde. (3) Action Forcing en el Return Envelope (`MANDATORY: Tu última respuesta DEBE incluir...`) obliga a verificar la Fase de Release antes de declarar una fase completa. (4) La sintaxis pseudo-bash en los handoffs puede ser interpretada como comandos de terminal — usar directivas `ACTION: Execute tool_name on ...` exclusivamente.

### [DISCOVERY][pnpm-strict-usage] Mezclar gestores de paquetes (npm vs pnpm)
**What:** El uso accidental de comandos de `npm` (ej. `npm run test`, `npm link`) en un repositorio inicializado y gestionado con `pnpm` (evidenciado por la existencia de `pnpm-lock.yaml`) es destructivo para la integridad del ecosistema local.
**Why:** Genera un `package-lock.json` paralelo, corrompe el algoritmo de hoisting en `node_modules` y causa inconsistencias con dependencias fantasma, desestabilizando builds futuros y la reproducibilidad.
**Where:** Instrucciones de los Agentes/Orquestadores en artefactos como `tasks.md` y operaciones de terminal ejecutadas por Workers.
**Learned:** Siempre auditar pasivamente el directorio raíz en busca de archivos lock (ej. `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`) ANTES de sugerir o ejecutar comandos de empaquetado/linkeo. Mantener estricta fidelidad al gestor oficial detectado en el proyecto.

### [DISCOVERY][agent-dry-handoffs] El síndrome del Teléfono Descompuesto en Orquestación Manual
**What:** En lugar de reescribir checklists (ej. el `MANDATORY_RELEASE_PROTOCOL` de `tasks.md`) dentro de un `worker-handoff.md`, el Orquestador debe generar un Handoff que funcione como puntero.
**Why:** Cuando un Orquestador LLM debe transcribir acciones detalladas de un archivo maestro a un handoff, corre el riesgo de omitir pasos por saturación de ventana de contexto o fallos de memoria (Lost in the Middle). Esto se evidenció al omitir el paso del README en v1.8.0.
**Where:** `worker-handoff.md` pattern y `tasks.md`.
**Learned:** Patrón "Agent DRY" (Don't Repeat Yourself). El Handoff no debe duplicar instrucciones; debe decir: "Leé la Fase X en `tasks.md` y ejecutá exactamente lo que dice ahí". La fuente de la verdad debe ser única para evitar el teléfono descompuesto.

### [DISCOVERY][skills-obsolescence-vs-templates] Las Skills de Plantillas son redundantes con el CLI
**What:** Skills que dictan estructuras de archivos (ej. `sdd-proposal.md`) quedan obsoletas e introducen deuda técnica si el framework ya inyecta templates canónicos (ej. vía `funky phase`).
**Why:** Mantener la estructura de un archivo definida en una Skill obliga a la IA a memorizarla y transcribirla. Un CLI inyecta el template base instantáneamente y sin costo de tokens, haciendo a la skill inútil.
**Where:** Directorio `.agents/skills/`.
**Learned:** Nunca crear una Skill para definir la estructura de un documento si podés usar un scaffolding automático o template estático en el disco. Las skills deben reservarse para lógica dinámica o workflows complejos.

### [DISCOVERY][documentation-vs-enforcement] Documentar no es Enforcer — El Loop Vicioso de los Fixes Textuales
**What:** Cada release de Funky AI corrige un síntoma específico pero ignora la pregunta fundamental: ¿qué mecanismo hace que este error sea posible? Esto produce un patrón recurrente donde el fix genera la condición de su propio próximo fallo. Ejemplo: el Tier fue omitido en handoffs a pesar de estar documentado como anti-patrón, porque documentar no es enforcer.
**Why:** Aplicamos lógica de "parche textual": si algo se olvida, lo documentamos. Pero cada fix de texto hace el sistema más largo, lo que aumenta la probabilidad de ser ignorado por el efecto "Lost in the Middle" en la ventana de contexto. Es un loop vicioso: más documentación → más saturación → más errores → más documentación.
**Where:** Protocolo de orquestación de Funky AI completo. Afecta especialmente las rules (`.agents/rules/`), templates SDD y el flujo de generación de worker handoffs.
**Learned:** (1) Distinguir siempre entre documentación y enforcement — documentar no garantiza ejecución. (2) El fix correcto hace el error estructuralmente imposible, no documentalmente desaconsejado. (3) Evaluar cada fix desde los tres actores: Human Router, Orquestador LLM y Worker LLM. (4) Testear el protocolo como si fuera código: ¿un Orquestador en chat virgen genera un handoff correcto sin haber leído las guías? Si no podés responder eso, el protocolo no está validado. Ver documento completo: `docs/funky-ai/core-concepts/enforcement-vs-documentation.md`.

### [DISCOVERY][versioning-policy] Política de Versionado: Mayor/Menor vs Patches
**What:** En versiones mayores y menores (ej. `v1.8.0`, `v1.9.0`), se debe crear un archivo de release notes oficial (`docs/funky-ai/releases/vX.Y.Z-release.md`). Para parches y fixes (ej. `v1.8.1`), NO se crean release notes separados.
**Why:** Crear archivos de release notes para patches menores genera ruido documental y fragmenta la lectura del proyecto.
**Where:** Protocolo de Cierre de Sesión y Tareas de Release.
**Learned:** Para fixes y patches, el registro debe vivir exclusivamente en tres lugares: (1) Extracción de aprendizaje al Engram (`discoveries.md` / `bugfixes.md`), (2) Bump de versión y registro en `ORCHESTRATOR-STATE.md`, y (3) Commits convencionales en Git.

### [DISCOVERY][phase0-t1-automation] Phase 0 siempre es T1
**What:** La Fase 0 del template `tasks.md` era tarea del Humano, causando omisiones.
**Why:** Depender de la intervención humana para pasos estructurados genera inconsistencias.
**Where:** Template `sdd-tasks.md`.
**Learned:** Fix en v1.10.0: Implementar Worker T1 con checklist git ejecutable para garantizar la creación del branch.

### [DISCOVERY][release-template-ssot] Release Templates SSOT
**What:** Los release artifacts construidos "mirando el anterior" generan drift y pérdida de formato.
**Why:** La ausencia de una única fuente de verdad (SSOT) permite la divergencia estructural.
**Where:** Archivos de release generados manualmente.
**Learned:** Fix en v1.10.0: Crear template canónico `release.md` + comando `funky release <version>` con interpolación de `{{version}}` y `{{date}}`.

### [DISCOVERY][openspec-backlog-lifecycle] La carpeta backlog/ es un fantasma para el Orquestador
**What:** La carpeta `docs/openspec/backlog/` existe como primera etapa del ciclo de vida de una feature (backlog → changes → archive), pero ningún archivo de protocolo la menciona. Ni `sdd-orchestrator.md`, ni el engram, ni `ORCHESTRATOR-STATE.md` tienen referencia a ella. Un Orquestador nuevo jamás sabrá que debe revisarla al planificar o cerrar un ciclo.
**Why:** La carpeta fue creada orgánicamente para el item `agent-dry-handoffs.md` pero nunca se codificó el flujo de su ciclo de vida en el protocolo. Cuando el item pasó a "Implementado" en v1.9.0, nadie movió el archivo al archive ni documentó el patrón.
**Where:** `docs/openspec/backlog/` — referenciada en `ORCHESTRATOR-STATE.md` línea 80 como tarea completada, pero el archivo físico nunca fue movido al archive hasta ser detectado manualmente.
**Learned:** (1) El flujo canónico es `backlog/ → changes/ → archive/`. (2) Al cerrar una feature (Fase Release), el MANDATORY_RELEASE_PROTOCOL debe incluir: "¿Existe un item en `docs/openspec/backlog/` para esta feature? Si existe y está implementado, moverlo a `docs/openspec/archive/{version}-{feature}/`". (3) Agregar este check al template `sdd-tasks.md` en la sección de Release.

### [DISCOVERY][readme-template-context-drift] El clonaje ciego de READMEs
**What:** Al crear el template canónico de `README.md`, el agente copió el README del CLI (`funky-cli/README.md`) en lugar de pensar en el propósito de un README a nivel ecosistema.
**Why:** Los LLMs tienden a copiar el archivo más cercano en nombre cuando se les pide un template de un archivo omnipresente sin darles instrucciones del "rol" de ese archivo.
**Where:** Fase 2 de v1.10.0 y posterior Auditoría (Fase 2.5).
**Learned:** Un README de raíz en el contexto de Funky AI debe ser un "Architecture Hub", no un repositorio de comandos CLI. Validar siempre que los templates iniciales tengan sentido lógico para la raíz del workspace.

### [DISCOVERY][orchestrator-planning-checklist] Las instrucciones de enforcement deben vivir al inicio, no al final
**What:** El Orquestador omitió generar `worker-handoff.md`, release notes y archivado de `openspec/changes/`, a pesar de que las instrucciones existían en el template `tasks.md`. La razón: la instrucción crítica estaba en la **línea 80** (el final del archivo), invisible por el efecto Lost in the Middle.
**Why:** Los LLMs en contextos largos depriorizan el contenido enterrado en el medio o al final. Una instrucción de enforcement que depende de que el modelo la recuerde al finalizar su trabajo es inherentemente frágil.
**Where:** `.agents/rules/sdd-orchestrator.md` y `funky-cli/src/templates/sdd/tasks.md`.
**Learned:** Las instrucciones de enforcement deben estar en el **inicio del artefacto** que el rol va a leer, no al final. Fix: (1) Planning Checklist agregado al inicio de `sdd-orchestrator.md` con 4 verificaciones antes de delegar. (2) Instrucción `[SISTEMA]` movida al encabezado de `tasks.md` donde es lo primero que lee el Orquestador.
**What:** Reemplazar el grep_search directo sobre discoveries.md (175 líneas) por un acceso Two-Stage: primero leer `docs/engram/index.md` (índice liviano ~30 líneas), luego hacer grep solo del tag exacto si es relevante.
**Why:** Con grep_search directo sobre archivos que crecen, el costo de tokens del Memory Polling escala sin control. A 25 entries/18KB ya, en 6 meses podría superar 300 líneas. El Two-Stage mantiene el costo de Stage 1 fijo (~30 líneas siempre) e independiente del tamaño del engram.
**Where:** `.agents/rules/sdd-orchestrator.md` — Memory Polling. `funky-cli/src/templates/sdd/worker-handoff.md` — §1.B.
**Learned:** El índice es la SSOT del TOC del engram. Cada vez que se agrega una entrada al engram, DEBE actualizarse el índice en la misma operación. La disciplina de mantenimiento del índice es el único punto de falla de este patrón.

### [DISCOVERY][assess-gate-context-expansion] El Readiness Gate requiere densidad de NFRs y siempre deriva en AI
**What:** El template `architecture-assessment.md` debe expandirse con campos duros de NFRs (Compliance, Data Residency, Presupuesto Hosting, Team Seniority). Además, `funky assess` DEBE generar el prompt de review AI incluso cuando la validación del CLI pasa con éxito.
**Why:** El CLI es solo la primera barrera superficial; la verdadera validación es el debate final con la IA. La IA no puede evaluar tradeoffs críticos (ej. Vercel vs VPS para datos gubernamentales) si no se le alimenta un contexto denso (Garbage In, Garbage Out).
**Where:** Template `architecture-assessment.md` y comando `funky assess`.
**Learned:** Las plantillas de assessment no deben temer ser exhaustivas; obligar al humano a aportar esa densidad de datos garantiza un debate arquitectónico de alto nivel. Esto además actuará como base para el futuro Project Cost Estimator (002).

### [DISCOVERY][sdd-failure-forensics-007] Análisis Forense de Fallas SDD — Sesión 007
**What:** Las 4 desviaciones del Orquestador en la sesión 007 fueron causadas por mecanismos estructurales específicos, no por falta de documentación. Clasificación: (1) Gate físico ausente — el ciclo de vida `changes/` no estaba en ningún artefacto de lectura obligatoria; (2) Ambigüedad semántica — `/sdd-ff` no tenía prerrequisito de `spec.md`; (3) Lost in the Middle — la instrucción del handoff estaba en posición media del archivo; (4) Naming bias — `proposals/` inducía madurez percibida.
**Why:** Todas las instrucciones existían en el protocolo. El problema no era documentación insuficiente sino ausencia de gates físicos que hicieran los errores estructuralmente imposibles.
**Where:** `.agents/rules/sdd-orchestrator.md` (Planning Checklist, tabla de comandos), `funky-cli/src/templates/sdd/tasks.md` (header prerequisito + bloque SISTEMA final), `docs/openspec/rfcs/` (renombrado desde `proposals/`).
**Learned:** (1) Cada fix debe hacerse desde la pregunta "¿cuál es el mecanismo que hace posible el error?" — no el síntoma. (2) Los gates más efectivos son los que actúan en el momento exacto del error: un `[SISTEMA]` al final de `tasks.md` intercepta al Orquestador justo antes de que olvide el handoff. (3) El naming convention tiene peso semiótico para LLMs — `proposal` señala madurez SDD, `rfc` señala borrador. Ver análisis completo en `docs/funky-ai/core-concepts/enforcement-vs-documentation.md § Análisis Forense`.

### [DISCOVERY][release-actor-split] Estrategia de Release: Split Orquestador / Worker Flash
**What:** El `MANDATORY_RELEASE_PROTOCOL` original mezclaba tareas de criterio (release notes, README, decisiones de archivado) con tareas mecánicas (git commands) bajo un mismo "Doc-Ops Worker". Esto forzaba al Orquestador a transcribir su contexto a un handoff para que un Worker lo reconstruyera — overhead innecesario cuando el contexto está fresco.
**Why:** Las release notes y el README requieren entender el *por qué* de cada cambio, no solo el *qué*. Ese conocimiento vive en el Orquestador durante la sesión. Transcribirlo a un handoff introduce pérdida de información y costo de tokens. Los comandos git en cambio son completamente deterministas: la versión, el mensaje y la rama están dados — no hay criterio que aplicar.
**Where:** `funky-cli/src/templates/sdd/tasks.md` — `MANDATORY_RELEASE_PROTOCOL`. Aplicable a cualquier proyecto que use el protocolo Funky AI.
**Learned:** Dividir la release en dos actores según naturaleza de la tarea: (1) **Orquestador inline**: todo lo que requiere criterio o genera texto (release notes, README, archivados, RFC decisions, package.json bump, ORCHESTRATOR-STATE) — hacerlo mientras el contexto está activo. (2) **Worker T1 Flash**: exclusivamente comandos git (`add`, `commit`, `merge`, `tag`, `push`) con los datos ya declarados por el Orquestador en el handoff. El Worker Flash no toma ninguna decisión — solo ejecuta. Regla de oro: *si necesita pensar, es del Orquestador; si es mecánico, es del Worker Flash.*

### [DISCOVERY][ghost-directory-accumulation] Acumulación de Directorios Fantasma por Refactors Incompletos
**What:** Durante la auditoría 010 se detectó que proyectos migrantes o refactorizados (ej. de `gentle-ai` a `funky-ai`) dejan atrás "carpetas fantasma" (`gentle-ai/`, `github-logs/`) que nadie borra por miedo a romper algo, y duplicidades funcionales (ej. `test/` vs `tests/`).
**Why:** Los Orquestadores priorizan la creación de nueva estructura y evitan la eliminación destructiva a menos que se les ordene explícitamente. Esto causa bloat de contexto y ambigüedad.
**Where:** Directorios raíz y subdirectorios de documentación.
**Learned:** Todo refactor mayor o migración debe incluir obligatoriamente una sub-tarea explícita de "Hard Cleanup" (eliminación de los artefactos viejos) en su respectivo `tasks.md`. No confiar en limpiezas orgánicas.

### [DISCOVERY][handoff-as-return-statement] El worker-handoff.md como único Return Statement válido
**What:** El "Protocolo de Delegación" en `sdd-orchestrator.md` usaba la condición vaga "cuando el plan esté en disco" como trigger de salida. Esto permitía al Orquestador emitir el prompt de delegación sin haber generado el `worker-handoff.md`, dejando al Worker ciego.
**Why:** La condición ambigua dejaba al modelo libre de interpretar que `sdd-tasks.md` era suficiente. Además, el comando `/sdd-ff` no tenía un prerequisito explícito de leer el template canónico `tasks.md` antes de generarlo — a diferencia del handoff, que sí lo tenía. Descubierto durante la planificación del pendiente 017.
**Where:** `.agents/rules/sdd-orchestrator.md` — sección "Return Statement" y tabla de comandos `/sdd-ff`.
**Learned:** (1) El `worker-handoff.md` es el **único Return Statement válido** de la fase de orquestación — sin él, la fase no está completa. (2) El enforcement estructural (gate bloqueante G1/G2/G3) es más robusto que documentar el paso en un checklist post-hoc. (3) Cualquier comando que genere un artefacto de plantilla debe tener como prerequisito explícito `view_file` del template canónico correspondiente. Ref: `[documentation-vs-enforcement]`, `[orchestrator-planning-checklist]`.

### [DISCOVERY][rfc-semantics-enforcement] Semántica Estricta: RFCs como Brain Dumps vs Proposals
**What:** Cuando el humano crea RFCs con lluvia de ideas crudas o chats de IA, Orquestadores frescos en sesiones posteriores pueden confundirlos con especificaciones técnicas formales (Proposals), saltándose la fase de planificación SDD y causando deuda arquitectónica.
**Why:** La semántica de la carpeta `rfcs/` no estaba protegida por ningún Guardrail bloqueante. El LLM confía inherentemente en cualquier documento técnico provisto por el usuario, sin importar su nivel de madurez.
**Where:** Archivos en `docs/openspec/rfcs/` frente a `docs/openspec/changes/`.
**Learned:** (1) Los RFCs deben ser exclusivamente "Brain Dumps" libres para el humano, y los Proposals deben ser artefactos formales generados solo por el Orquestador. (2) La protección más efectiva es un `000-TEMPLATE.md` obligatorio con un bloque de advertencia para IA en la parte superior, distribuido estáticamente mediante `funky init`. (3) Reforzar la separación en las reglas globales del Orquestador (`.agents/rules/sdd-orchestrator.md`).

### [DISCOVERY][cli-orchestrator-circular-dependency] Dependencia Circular entre Orquestador y Templates del CLI
**What:** Cuando un Orquestador gestiona un repositorio que ES un CLI distribuidor de templates (ej. `funky-ai`), las reglas locales de orquestación terminan acopladas a las rutas públicas del CLI (`src/templates/`). Al intentar agnostizar los templates públicos para nuevos proyectos, se corre el riesgo de destruir el ciclo operativo del propio Orquestador.
**Why:** El CLI y el Orquestador local comparten la misma fuente de verdad. El Orquestador necesita reglas rígidas y específicas, mientras que el CLI público debe inyectar esqueletos agnósticos.
**Where:** Rutas de templates en `.agents/rules/sdd-orchestrator.md` y `funky-cli/src/templates/`.
**Learned:** Siempre realizar una "Fase de Aislamiento y Backup": copiar todos los templates vitales a un directorio protegido (`.agents/templates/`) y re-mapear las reglas locales del Orquestador ANTES de purgar la versión pública. Esto previene la rotura del propio ciclo SDD y mantiene un registro legacy.

### [DISCOVERY][doc-update-index-manual-drift] El índice de Docs Vivos en OPTIONAL_DOC_UPDATE es mantenimiento manual
**What:** El bloque `<OPTIONAL_DOC_UPDATE>` en `.agents/templates/sdd/tasks.md` contiene una tabla de 6 docs ("Índice de Docs Vivos") que el Orquestador usa para decidir si necesita actualizar documentación sin abrir ningún archivo. Ese índice es estático y requiere actualización manual cada vez que se agrega un nuevo doc de flujo al proyecto.
**Why:** No existe ningún mecanismo automático que detecte nuevos docs en `docs/funky-ai/operaciones/` o `docs/funky-ai/guias/` y los agregue al índice. Es la contraparte de `[memory-polling-index-layer]` pero aplicada a docs operacionales, no al engram.
**Where:** `.agents/templates/sdd/tasks.md` — bloque `<OPTIONAL_DOC_UPDATE>`, tabla "Índice de Docs Vivos".
**Learned:** Al crear un nuevo doc de flujo/operacional que deba ser mantenido activo, agregar una fila al índice en la misma operación. El índice tiene exactamente un punto de falla: que el autor del nuevo doc se olvide de registrarlo. Como mitigación, incluir este check en el `MANDATORY_RELEASE_PROTOCOL` Doc-Ops: "¿Esta release agrega un nuevo doc de flujo? Si SÍ → actualizar el índice de `OPTIONAL_DOC_UPDATE` en `.agents/templates/sdd/tasks.md`".

### [DISCOVERY][inquirer-integration] Interacción Humano-LLM en Herramientas de CLI
**What:** La integración de `@inquirer/prompts` permite convertir un CLI estático en una herramienta guiada. En lugar de procesar todo vía flags, el CLI asume el rol de entrevistador.
**Why:** Especialmente útil en herramientas analíticas (como `funky estimate`) donde el usuario no conoce los factores técnicos (extraídos automáticamente) pero sí los factores de negocio, combinando ambos para nutrir el contexto del LLM.
**Where:** Comando `funky estimate` en v1.19.0.
**Learned:** Usar Inquirer para inyectar "Factores de Contexto" y cruzar con "Factores Técnicos", persistiendo el resultado en disco (`pricing-analysis.md`) para abrir un debate de mayor valor (Value-Based Pricing) en el chat con la IA, actuando la CLI como puente.
### [t1-scaffolding-purge]
**What:** Manejo de artefactos vac�os cuando el CLI asume T2 pero el Orquestador dictamina T1.
**Why:** Para mantener la simplicidad del scaffolding CLI, el Orquestador en T1 saltea Explore/Proposal e instruye en tasks.md que la basura sea purgada.
**Where:** .agents/rules/sdd-orchestrator.md y flujos T1.
**Learned:** Es m�s seguro corregir el exceso de andamiaje con limpieza post-ejecuci�n que modificar el CLI.

