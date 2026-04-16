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






2----

Excelente decisión técnica. No arrastrar deuda es la filosofía base acá.

Te armo el brief del Worker para liquidar este bug de memoria.

🟢 Worker Brief — Fix Deuda IsRegex | Tier 1
¿Por qué Tier 1? Modificación súper puntual a un archivo único basándonos en un descubrimiento ya documentado en el Engram. Un solo comando lo liquida.

Archivos a arrobar: @.agents/rules/engram-protocol.md @docs/post-mortem.md

markdown
Sos un Worker Tier 1 de Funky AI. Tu tarea es resolver una Deuda Técnica documentada.
IMPORTANTE: Escribí todos los cambios directamente al disco con tus tools. NO respondas en el chat.
CONTEXTO:
Si revisás `docs/post-mortem.md`, la entrada `[discovery][grep-regex-topic-key]` dice:
"El grep_search por substring exacto no matchea cuando el topic_key está embebido
junto a otros tokens en la misma línea... El Memory Polling DEBE usar IsRegex: true
con el patrón escapado cuando busca topic_keys compuestos".
El archivo `.agents/rules/engram-protocol.md` en su `## 4. Topic Key / Upsert Pattern`
tiene documentado el flujo (paso 1) usando un `grep_search` simple de substring, lo cual lleva a
falsos negativos a los futuros Workers.
TU MISIÓN:
Editá el archivo `.agents/rules/engram-protocol.md` y modificá la sección 4,
específicamente el "Paso 1". 
Cambiá la línea que dice:
`1. Antes de escribir en Engram → grep_search "auth-model" docs/post-mortem.md`
Por una versión más robusta y explicativa que advierta del uso de regex, algo parecido a esto:
`1. Antes de escribir en Engram → grep_search por el término. ⚠️ ATENCIÓN: Si vas a buscar en archivos donde el topic_key puede estar anidado en un título (ej: ### [bugfix][auth-model] Texto), DEBÉS usar el argumento IsRegex: true de la tool con un patrón escapado como "\[tipo\]\[topic-key\]" porque la búsqueda por substring puro fallará.`
RESTRICCIONES:
- Solo alterá el contenido dentro del Paso 1 de la sección 4.
- Escribí el cambio usando tus tools de file-system.
AL TERMINAR:
Creá `docs/funky-ai/workers/patch-isregex-report.md` con este Return Envelope:
---
Worker: PATCH-ISREGEX
Estado: ✅ Completado
Archivos Mutados:
- `.agents/rules/engram-protocol.md` — Modificado §4 para explicitar el uso de IsRegex: true 
Bugs Encontrados: [ninguno]
---
Copiá esto, abríle un chat nuevo a un Worker, que ejecute, y traeme el patch-isregex-report.md cuando termine, loco. Con esto dejamos la mesa súper limpia para la V1.2.