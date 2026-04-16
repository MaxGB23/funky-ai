Sos un Worker Tier 1 de Funky AI. Tenés DOS tareas quirúrgicas independientes.
IMPORTANTE: Escribí todos los cambios directamente al disco con tus tools. NO respondas en el chat.
Antes de comenzar, ejecutá Memory Polling obligatorio:
  grep_search "worker-prompt-persistence" docs/post-mortem.md
  grep_search "proposal-sin-estado" docs/post-mortem.md
---
TAREA 1 — PATCH-B: Estandarizar topic_key en docs/post-mortem.md
Leé el archivo.
Actualmente tiene 3 entradas. Sus headers son:
  a) ### [bugfix] Semántica de escritura en Prompts de Workers
  b) ### [discovery][prompts-adelantados] Anti-patrón: Generación Anticipada...
  c) ### [discovery] Anti-patrón: Propuestas sin Estado Obligatorio...
El problema: las entradas (a) y (c) no tienen topic_key machine-readable.
La convención canónica está en `.agents/rules/engram-protocol.md` §4 Topic Key/Upsert Pattern.
ACCIÓN — Editá SOLO los headers de estas dos entradas:
  a) Reemplazar por:
     ### [bugfix][worker-prompt-persistence] Semántica de escritura en Prompts de Workers
  c) Reemplazar por:
     ### [discovery][proposal-sin-estado] Anti-patrón: Propuestas sin Estado Obligatorio ni Referencias Explícitas
NO toques el contenido de ninguna entrada (What, Why, Where, Learned).
La entrada (b) ya tiene topic_key correcto — no la toques.
---
TAREA 2 — PATCH-D: Corregir contradicción en docs/funky-ai/funky-ai.md
Abrí el archivo. Buscá la sección "## ⚙️ Parametrización del Sistema".
La línea problemática (aproximadamente línea 89) dice:
  "NO DEBE EXISTIR NI UN RASTRO DE RESTRICCIÓN DE ORQUESTACIÓN."
Esta afirmación es una contradicción: en la v1.1 actual el protocolo SDD
fue inyectado correctamente mediante workspace rules (`.agents/rules/`),
NO en el GEMINI.md global. La línea sugiere incorrectamente que cualquier
regla de orquestación es inválida en el global.
ACCIÓN — Reemplazá el bullet **NO** y su párrafo explicativo completo por:
  - **NO (en `~/.gemini/GEMINI.md` global):** Este archivo NO debe contener
    restricciones de orquestación del tipo "solo delegá, no programes".
    Esas reglas anulan la capacidad de ejecución inline de cualquier Worker.
  - **SÍ (en `.agents/rules/`):** El canal correcto para inyectar el protocolo
    SDD es mediante workspace rules. Esto aísla las restricciones de orquestación
    al contexto del proyecto sin contaminar el perfil global del agente.
Mantené el tono, los emojis de sección y el resto del documento intacto.
---
AL TERMINAR:
Creá el archivo físico `docs/funky-ai/workers/patch-bd-report.md` con este Return Envelope:
---
Worker: PATCH-B + PATCH-D
Estado: ✅ Completado
Archivos Mutados:
- `docs/post-mortem.md` — topic_keys estandarizados en entradas (a) y (c)
- `docs/funky-ai/funky-ai.md` — Contradicción en §Parametrización del Sistema corregida
Bugs Encontrados: [ninguno / describí si encontraste algo]
Notas: [cualquier decisión editorial tomada]
---