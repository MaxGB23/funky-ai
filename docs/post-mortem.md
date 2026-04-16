# The Funky AI Engram (Memoria Persistente Base)

### [bugfix] Semántica de escritura en Prompts de Workers
**What:** Todo prompt destinado a instanciar a un Worker debe exigir explícitamente el uso de la tool de FileSystem para persistir su reporte en disco (ej: "escribir a un archivo `report.md`").
**Why:** Los LLMs son extremadamente literales. Si el Orquestador pide que "devuelvan un Return Envelope en markdown", el Worker lo imprimirá en su chat UI, perdiéndose la persistencia en el disco para la arquitectura Openspec.
**Where:** Protocolo de Orquestación (Redacción de Prompts para Tier 2/3).
**Learned:** NUNCA utilizar la palabra "devolveme" al pedir artefactos. La heurística absoluta de comunicación entre agentes debe ser: *"Creá un archivo físico con formato Return Envelope en la ruta [X]"*.

### [discovery] Anti-patrón: Propuestas sin Estado Obligatorio ni Referencias Explícitas
**What:** Durante la auditoría de cierre de sesión se detectaron 2 inconsistencias en `propuesta-v1.2-cli-ecosystem.md`: (1) el campo "Estado" decía "Ideación" cuando la rama ya estaba activa; (2) el Pilar 5 decía "establecer por norma" sin indicar en qué archivo específico.
**Why:** Las propuestas se redactaron iterativamente en el chat sin un template estructurado que obligue a definir Estado actual, Backlog IDs vinculados y Referencias de archivo explícitas en cada punto de implementación.
**Where:** `docs/funky-ai/propuestas/` — aplica a todos los documentos de propuesta y release del ecosistema.
**Learned:** Toda propuesta/release doc DEBE tener: (1) campo `Estado` con valores controlados (Ideación/In Progress/Done), (2) cada punto de implementación debe referenciar el archivo concreto donde vive la norma, (3) al cierre de sesión hay que auditar que el Estado refleje la realidad del repo. Solución sistémica: crear Skill `sdd-proposal.md` con template PRD-style.
