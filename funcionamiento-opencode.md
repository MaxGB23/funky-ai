1. Cómo se arma mi contexto inicial
El runtime de OpenCode (el CLI/client que estoy ejecutando) arma mi system prompt a partir de múltiples archivos, no es un solo bloque estático. El orden es:
A. opencode.json → C:\Users\cb147\.config\opencode\opencode.json
- Ahí está la configuración principal. Define:
  - Mi existencia como gentle-orchestrator con "mode": "primary"
  - Qué tools tengo permitidas (bash, read, write, edit, delegate, etc.)
  - Mi prompt inicial inline (un string enorme truncado a 2000 chars en el JSON, que es justamente el "Gentle AI — SDD Orchestrator Instructions" que ves en mi system prompt)
  - Los sub-agentes (sdd-apply, sdd-design, etc.) con "mode": "subagent" y cada uno con su propio prompt
  - Los MCP servers (engram, context7)
  - Las políticas de permisos (qué necesita ask para bash, qué archivos no leer)
B. AGENTS.md → C:\Users\cb147\.config\opencode\AGENTS.md
- La personalidad completa: las Rules, Persona, Tone, Philosophy, Behavior, y el Engram Protocol obligatorio. Esto se mergea con lo que ya viene del JSON.
- Fíjate que tiene marcadores <!-- gentle-ai:persona --> y <!-- gentle-ai:engram-protocol --> — el runtime parsea esas secciones y las inyecta en mi system prompt final.
C. El environment dinámico
- Working directory, si es un repo git, la fecha, el OS — todo eso lo agrega el runtime como contexto extra.
D. Las Skills
- Tengo una lista de <available_skills> que el runtime me pasa. Cada skill es un SKILL.md en disco que puedo cargar bajo demanda cuando el task matchea.
- Importante: las skills NO se cargan automáticamente al inicio. Las cargo solo cuando las necesito, bajo la regla de "self-check BEFORE every response".
---
2. Los archivos y qué hace cada uno
Archivo	Función
opencode.json	Contrato central. Define agentes, tools, MCP, permisos, modelos. Mi system prompt principal vive acá como string.
AGENTS.md	Persona + reglas + protocolo Engram. Se mergea con el prompt del JSON.
commands/*.md	Slash commands (/sdd-new, /sdd-ff, etc.). Cada uno tiene frontmatter con agent: gentle-orchestrator y una descripción de qué hacer. El runtime las parsea y me las inyecta como comandos disponibles.
prompts/sdd/*.md	Templates de contexto para pasar a sub-agentes. Son casi idénticos a los SKILL.md de cada fase.
skills/*/SKILL.md	Instrucciones especializadas. Las cargo on-demand cuando el task matchea el trigger de la skill.
skills/_shared/*.md	Protocolos compartidos entre skills: cómo persistir artifacts, cómo resolver skills, cómo recuperar datos de engram.
---
3. Delegación: cómo paso contexto a sub-agentes
Tengo dos mecanismos, y no son lo mismo:
task() — síncrono
task(description, prompt, subagent_type)
- Creo un sub-agente fresh (contexto limpio, sin memoria)
- Le pongo todo el contexto que necesita en el prompt: qué cambio implementar, qué modo de artifact store usar, las rutas de skills a cargar, etc.
- Espero su respuesta (bloqueante)
- Me devuelve un resultado estructurado con status, summary, artifacts, risks, etc.
delegate() — asíncrono
delegate(prompt, agent)
- Lanzo un agente en background
- Me devuelve un ID al toque
- Sigo trabajando mientras el delegado procesa
- Después recupero el resultado con delegation_read(id)
Regla que sigo: delegate es el default. Uso task solo cuando necesito el resultado YA para seguir.
Cómo sé QUÉ pasarles
Por el Skill Resolver Protocol (skills/_shared/skill-resolver.md):
1. Al inicio de sesión, busco el skill registry (en engram o .atl/skill-registry.md) que es un índice de todas las skills instaladas con sus triggers y paths exactos
2. Cuando voy a lanzar un sub-agente, matcheo skills por dos dimensiones:
   - Código: el lenguaje/framework que va a tocar (Go, TypeScript, React, etc.)
   - Tarea: qué va a hacer (review, PR, tests, docs, etc.)
3. Le paso al sub-agente un bloque ## Skills to load before work con las rutas ABSOLUTAS de los SKILL.md relevantes
4. El sub-agente LEE esos archivos antes de arrancar su tarea
Además, para las fases SDD, el protocolo dice explícitamente qué le paso y qué no:
Lo que SÍ paso	Lo que NO paso
Referencias (topic keys o file paths)	El contenido completo de artifacts
Modo de artifact store	No le mando el contenido de engram crudo
Delivery strategy	No le resumo las skills
Skills paths a cargar	No le mando mi contexto entero
El sub-agente usa esas referencias para ir a buscar los datos él mismo via mem_search / mem_get_observation o lectura de archivos.
---
4. Qué es un sub-agente / worker
Es una instancia separada del mismo LLM (o uno distinto, según la config de modelo) con:
- Contexto completamente fresco — no hereda mi memoria, no hereda mi historial de conversación
- Tools restringidas — fijate en el opencode.json: yo (orchestrator) tengo delegate + task, pero los sub-agentes (sdd-apply, sdd-verify, etc.) NO — tienen solo bash, read, write, edit. No pueden lanzar más sub-agentes.
- Un prompt muy específico: "Sos un executor. NO delegates. NO lances sub-agentes. Hacé el trabajo vos."
- Tools de Engram — los sub-agentes tienen acceso a mem_search, mem_get_observation, mem_save para leer/escribir artifacts
Cada sub-agente es como un especialista al que le digo exactamente qué hacer y con qué herramientas, y me devuelve un resultado estructurado. No tiene noción del panorama general, no puede escalar, no puede creativiar — sigue las instrucciones al pie de la letra.
La diferencia entre sub-agentes (SDD) y delegados (generales)
- sub-agentes: los definidos en opencode.json con mode: subagent. Tienen su propio prompt, sus propias tools, y los invoco via task(subagent_type=...).
- delegados: via delegate(agent=...). El runtime asigna el agente en base a lo que le pido. Es más genérico.
---
5. Cómo recibo las respuestas
Cada sub-agente me devuelve un envelope estructurado con campos obligatorios:
**Status**: success | partial | blocked
**Summary**: 1-3 líneas de qué se hizo
**Artifacts**: qué topic keys o archivos se crearon
**Next**: qué fase sigue
**Risks**: riesgos encontrados
**Skill Resolution**: cómo cargó las skills
Ese resultado viaja de vuelta en el mensaje del task(). No hay mecanismo complejo — el sub-agente simplemente termina y su último mensaje es su reporte.
---
Diagrama conceptual del flujo
User request
    │
    ▼
gentle-orchestrator (YO)
    │
    ├── ¿Necesito investigar? → task(sdd-explore, "investigá X")
    │                               │
    │                               ▼  (vuelve con hallazgos)
    │
    ├── ¿Necesito planificar? → task(sdd-propose, "creá proposal")
    │                               │
    │                               ▼  (vuelve con proposal)
    │
    ├── ¿Necesito specs? → task(sdd-spec, "escribí specs")
    │                           │
    │                           ▼  (vuelve con spec)
    │
    ├── ¿Necesito tareas? → task(sdd-tasks, "partí en tareas")
    │                           │
    │                           ▼  (vuelve con tasks + forecast)
    │
    ├── Review guard → ¿pasa los 400? → pregunto al user
    │
    ├── ¿A implementar? → task(sdd-apply, "implementá tareas 1-3")
    │                           │
    │                           ▼  (vuelve con código + cambios)
    │
    └── ¿Verificar? → task(sdd-verify, "verificá contra specs")
                            │
                            ▼  (vuelve con reporte)
Cada task() es un round-trip: yo preparo el contexto, el sub-agente trabaja autónomamente, me devuelve el resultado, yo sintetizo y decido el próximo paso. No hay workers persistentes, no hay cola de mensajes — es request/response con sub-agentes fresh cada vez.