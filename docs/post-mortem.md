# The Funky AI Engram (Memoria Persistente Base)

### [bugfix][worker-prompt-persistence] Semántica de escritura en Prompts de Workers
**What:** Todo prompt destinado a instanciar a un Worker debe exigir explícitamente el uso de la tool de FileSystem para persistir su reporte en disco (ej: "escribir a un archivo `report.md`").
**Why:** Los LLMs son extremadamente literales. Si el Orquestador pide que "devuelvan un Return Envelope en markdown", el Worker lo imprimirá en su chat UI, perdiéndose la persistencia en el disco para la arquitectura Openspec.
**Where:** Protocolo de Orquestación (Redacción de Prompts para Tier 2/3).
**Learned:** NUNCA utilizar la palabra "devolveme" al pedir artefactos. La heurística absoluta de comunicación entre agentes debe ser: *"Creá un archivo físico con formato Return Envelope en la ruta [X]"*.

### [discovery][prompts-adelantados] Anti-patrón: Generación Anticipada de Todos los Worker Briefs
**What:** El Orquestador generó los 3 prompts de Workers (PATCH-A, B+D, F) en simultáneo antes de ejecutar ninguno, planificando sin datos reales.
**Why:** El Return Envelope de cada Worker existe precisamente para retroalimentar al Orquestador con descubrimientos reales del disco (contradicciones, formatos inesperados, dependencias ocultas) que pueden cambiar el brief del siguiente Worker. Ignorar ese ciclo es planificar sobre suposiciones.
**Where:** Protocolo de Orquestación — flujo de delegación secuencial entre Workers.
**Learned:** El Orquestador NUNCA debe pre-generar todos los briefs de Workers en cadena. El flujo correcto es: `brief W1 → ejecutar → leer report → brief W2 → ejecutar → leer report → brief W3`. El Router Humano es el API gateway: el valor está en el ciclo de feedback, no en la velocidad de planificación.

### [discovery][grep-regex-topic-key] grep_search con substring falla en headers con topic_key compuesto
**What:** Un Worker ejecutó `grep_search "proposal-sin-estado" docs/post-mortem.md` y no obtuvo resultados, a pesar de que la entrada existía con topic_key `[discovery][proposal-sin-estado]` en un header H3.
**Why:** El `grep_search` por substring exacto no matchea cuando el topic_key está embebido junto a otros tokens en la misma línea (`### [discovery][proposal-sin-estado] Texto descriptivo...`). El término buscado SÍ existe, pero la herramienta necesita modo regex para capturar el patrón correctamente.
**Where:** `docs/post-mortem.md` — afecta al Memory Polling de cualquier Worker que use el engram-protocol.md §4.
**Learned:** El Memory Polling DEBE usar `IsRegex: true` con el patrón escapado cuando busca topic_keys compuestos: `grep_search "\\[tipo\\]\\[topic-key\\]"`. El modo substring puro es insuficiente para el formato `### [{type}][{topic_key}] Título`. Actualizar el §4 del engram-protocol.md para documentar esta distinción.

### [discovery][proposal-sin-estado] Anti-patrón: Propuestas sin Estado Obligatorio ni Referencias Explícitas
**What:** Durante la auditoría de cierre de sesión se detectaron 2 inconsistencias en `propuesta-v1.2-cli-ecosystem.md`: (1) el campo "Estado" decía "Ideación" cuando la rama ya estaba activa; (2) el Pilar 5 decía "establecer por norma" sin indicar en qué archivo específico.
**Why:** Las propuestas se redactaron iterativamente en el chat sin un template estructurado que obligue a definir Estado actual, Backlog IDs vinculados y Referencias de archivo explícitas en cada punto de implementación.
**Where:** `docs/funky-ai/propuestas/` — aplica a todos los documentos de propuesta y release del ecosistema.
**Learned:** Toda propuesta/release doc DEBE tener: (1) campo `Estado` con valores controlados (Ideación/In Progress/Done), (2) cada punto de implementación debe referenciar el archivo concreto donde vive la norma, (3) al cierre de sesión hay que auditar que el Estado refleje la realidad del repo. Solución sistémica: crear Skill `sdd-proposal.md` con template PRD-style.
