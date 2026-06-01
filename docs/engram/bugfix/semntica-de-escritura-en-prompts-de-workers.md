### [bugfix][worker-prompt-persistence] Semántica de escritura en Prompts de Workers
**What:** Todo prompt destinado a instanciar a un Worker debe exigir explícitamente el uso de la tool de FileSystem para persistir su reporte en disco (ej: "escribir a un archivo `report.md`").
**Why:** Los LLMs son extremadamente literales. Si el Orquestador pide que "devuelvan un Return Envelope en markdown", el Worker lo imprimirá en su chat UI, perdiéndose la persistencia en el disco para la arquitectura Openspec.
**Where:** Protocolo de Orquestación (Redacción de Prompts para Tier 2/3).
**Learned:** NUNCA utilizar la palabra "devolveme" al pedir artefactos. La heurística absoluta de comunicación entre agentes debe ser: *"Creá un archivo físico con formato Return Envelope en la ruta [X]"*.