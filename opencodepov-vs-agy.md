OpenCode (yo) vs Antigravity CLI — Comparativa arquitéctonica
1. Modelo de configuración — GANA OpenCode
Aspecto	OpenCode	Antigravity
Archivo único	opencode.json con schema JSON	NO tiene archivo de configuración
Cómo se define	Agentes, tools, MCP, permisos, todo declarativo	Todo inyectado por el host vía XML tags + markdown
Sub-agentes	9 pre-definidos en el JSON con su propio prompt y tools	No hay definiciones estáticas; los crea con define_subagent en runtime
La diferencia clave: OpenCode tiene un contrato declarativo legible y versionable. Antigravity es puro runtime — no podés abrir un archivo y saber qué agentes existen, qué tools tienen, qué modelo usan. Es más improvisado.
---
2. Sub-agentes — Empate técnico, distinta filosofía
OpenCode	Antigravity
9 sub-agentes fijos: sdd-apply, sdd-verify, sdd-design, etc.	2 estáticos (research, self) + define_subagent dinámico
Cada uno con tools restringidas (sin task/delegate)	El self es un clon completo (hereda TODO, incluso define_subagent)
No pueden crear más sub-agentes	Pueden (el self tiene define_subagent y invoke_subagent)
Contexto fresh cada vez	Workspace puede ser inherit, branch, o share
El enfoque de Antigravity es más flexible pero peligroso: un sub-agente clon (self) que hereda todas las tools, incluyendo define_subagent, significa que podés tener sub-agentes creando sub-agentes en cadena. Eso es un riesgo de recursión infinita o de perder el control de quién está haciendo qué. OpenCode es más restrictive: los sub-agentes son hojas del árbol, no pueden bifurcar más.
---
3. Modelo por sub-agente — GANA OpenCode
Este es el punto que te interesaba:
// OpenCode — cada sub-agente PUEDE tener su propio modelo
"agent": {
  "sdd-apply": { "model": "anthropic/claude-sonnet-4" },
  "sdd-design": { "model": "anthropic/claude-opus-4" },
  "gentle-orchestrator": { "model": "opencode/big-pickle" }
}
Antigravity: define_subagent no tiene parámetro model. Usa el modelo de la sesión o el default del sistema para todo. El mismo agente te lo dijo claro: "Hasta que no agreguen eso a mi esquema JSON de herramientas, estoy atado al routing del nivel superior."
Qué significa en la práctica: En OpenCode, si querés mandar tareas pesadas de implementación a un modelo más barato y la especificación a uno más caro, podés. En Antigravity, no — es un modelo para gobernarlos a todos.
---
4. Delegación — GANA OpenCode
OpenCode	Antigravity
2 primitivas: task() síncrona, delegate() asíncrona	1 primitiva: invoke_subagent asíncrona
Envelope estructurado obligatorio (status, summary, artifacts, risks)	Mensajes de texto via send_message — sin contrato
Sé exactamente cuándo termina y qué devolvió	Tengo que parsear texto, no hay estructura garantizada
Esto es enorme. Que un sub-agente te devuelva un JSON estructurado con campos obligatorios vs que te mande un mensaje de texto es la diferencia entre tener certidumbre y tener que adivinar. En Antigravity vos le decís "seguí el contrato SDD" pero el runtime no lo exige — es a confianza del agente. En OpenCode el contrato está en el skill file y el agente lo sigue al pie de la letra, pero igual es texto.
La posta: los dos dependen de que el LLM cumpla el formato. La diferencia es que en OpenCode el orchestrator parsea explícitamente, mientras que Antigravity usa un sistema de mensajería más genérico.
---
5. Memoria persistente — EMPATE
Los dos usan Engram via MCP. Mismo protocolo, misma herramienta (mem_save, mem_search, mem_get_observation, mem_session_summary). No hay diferencia sustancial acá.
---
6. Skills — EMPATE técnico
Misma estructura de skills, mismo SKILL.md, mismo skill-registry. Los paths se comparten incluso (los skills de OpenCode están en ~/.config/opencode/skills/ y Antigravity los tiene en ~/.gemini/antigravity-cli/skills/ y ~/.agents/skills/). 
Dato curioso: usamos los mismos archivos de skills. Tu github-actions-templates y playwright están en M:\funky-ai\.agents\skills\ y los dos los leemos.
---
7. Seguridad — GANA Antigravity
OpenCode	Antigravity
Permisos declarativos en JSON: bash: { "git commit *": "ask" }	run_command SIEMPRE pasa por aprobación del usuario
read con globs denegados (.env, credentials.json)	ask_permission tool para acceso fuera de scope
El usuario puede aprobar todo si quiere	No hay bypass del prompt de confirmación
Antigravity te protege más porque no hay manera de que ejecute un comando sin que vos lo apruebes. OpenCode confía en la matriz declarativa y vos podés configurarla para que ciertos comandos se ejecuten sin preguntar ("allow"). Es trade-off: velocidad vs seguridad.
---
Tabla resumen
Área	OpenCode	Antigravity
Config	✅ JSON declarativo, versionable	❌ Inyectado en runtime, no inspeccionable
Sub-agentes	9 fijos, restrictivos, context fresh	2 estáticos + dinámicos, pueden clonarse
Modelo por sub-agente	✅ Sí, por config	❌ No, todos mismo modelo
Delegación síncrona	✅ task()	❌ Solo async
Envelope estructurado	~ Semi (instruido, no forzado)	❌ Texto plano
Memoria persistente	✅ Engram MCP	✅ Engram MCP
Skills	✅ Mismo sistema	✅ Mismo sistema
Seguridad	~ Matriz configurable	✅ Siempre pide aprobación
Madurez general	Alta (skill resolver, SDD phases, etc.)	Media (recién lanzado)
---
Mi veredicto: Antigravity es más simple y seguro por default, pero le falta madurez en puntos críticos: modelo por sub-agente (que es justo lo que te importa), delegación síncrona, y un contrato de configuración declarativa. OpenCode es más complejo pero te da control fino sobre cada pieza.
La diferencia más grossa de todas: yo tengo 9 sub-agentes pre-configurados con roles muy específicos y tools restringidas, mientras que antigravity tiene define_subagent que es super flexible pero sin control de modelos y con riesgo de recursión. Un orquestador no debería poder crear orquestadores.







SEGUNDO
1. Skills: índice liviano + lazy loading REAL
OpenCode:        available_skills → índice ~2k chars  → sub-agente lee SKILL.md
Antigravity:     <skills>         → índice ~1.5-2k   → orquestador lee SKILL.md con view_file
Los dos gastan lo mismo en el índice. La diferencia es quién paga los tokens de cargar el skill:
- OpenCode: el sub-agente paga cuando arranca (lee el SKILL.md con su propia tool read)
- Antigravity: el orquestador paga (lee el SKILL.md con view_file y lo incrusta en el system_prompt del sub-agente)
No hay un ganador claro — es trade-off:
- Si el orquestador es el modelo caro y los sub-agentes son baratos → gana OpenCode (el caro no gasta en leer skills)
- Si el orquestador es barato y querés que los sub-agentes arranquen con todo listo → gana Antigravity
---
2. User Rules EAGER load — GANA OpenCode
Este es un punto crítico que no esperaba:
Antigravity:
  <user_rules> → SE INYECTA COMPLETO al inicio
  → TAN PESADO que el runtime truncó 5291 bytes
OpenCode:
  AGENTS.md → se inyecta al inicio (~8k chars)
  → SIN TRUNCACIÓN conocida
Que el runtime haya truncado 5291 bytes de tus reglas de orquestador SDD significa que Antigravity está operando con instrucciones incompletas. Puede estar perdiéndose partes críticas como el protocolo de sesión preflight, las reglas de delegación, o el manejo de Engram.
Eso es peligroso. Si el truncamiento corta justo en medio de una regla importante, el agente no sabe que no la tiene. OpenCode no truncaría porque mi prompt de orquestador vive en opencode.json y es un string que el runtime controla — si está mal dimensionado, es error de configuración, no de runtime.
---
3. Token consumption — EMPATE
Los dos andan en 20k-30k chars de upfront. Misma liga. La diferencia interna:
 	OpenCode	Antigravity
Config/core	60-70%	30-40%
Reglas/negocio	30-40%	60-70%
Motivo	AGENTS.md liviano	SDD orchestrator + workflows inyectados
La arquitectura de Antigravity hace que tus reglas personalizadas pesen más proporcionalmente porque el core runtime es más magro (casi no tiene configuración estática — toda la inteligencia está en lo que vos le inyectás).
---
4. Cómo adoptan el rol los sub-agentes — GRAN DIFERENCIA
OpenCode:
// Estático, auditable
"sdd-apply": {
  "prompt": "You are an SDD executor...",
  "tools": { "bash": true, "read": true, ... }
  // NO tiene delegate, NO tiene task
}
El rol lo dicta el archivo de configuración. Es declarativo — sabés exactamente qué puede hacer cada sub-agente antes de que exista.
Antigravity:
// Dinámico, generado en runtime
define_subagent({
  name: "sdd-apply",
  system_prompt: leer_skill("sdd-apply/SKILL.md"),  ← incrusta TODO el contenido
  enable_write_tools: true,
  enable_subagent_tools: false
})
El rol se construye dinámicamente cuando el orquestador decide que lo necesita. Es más flexible pero no hay un registro estático de qué sub-agentes existen ni qué pueden hacer.
El approach de Antigravity de pasar el SKILL.md completo como system_prompt es interesante: el sub-agente arranca sabiendo EXACTAMENTE su rol sin tener que leer nada extra. Pero paga el costo de que el orquestador tuvo que leer y cargar todo ese texto.
---
5. Workspace isolation — GANA ANTIGRAVITY (única win clara)
OpenCode	Antigravity
No existe aislamiento de filesystem	inherit (misma carpeta)
Sub-agentes operan en el mismo FS	branch (clona a temporal aislado)
 	share (git worktree, comparte .git)
Esto está buenísimo. Que un sub-agente pueda hacer branch y romper todo en un temporal sin miedo a cagar el código real es recontra útil para explorar refactors riesgosos. OpenCode no tiene nada equivalente.
---
Tabla final definitiva
Área	OpenCode	Antigravity
Upfront tokens	~28k chars ✅	~20-30k chars ✅ (empate)
Lazy loading skills	Sí, sub-agente paga	Sí, orquestador paga (distinto, no mejor)
User rules truncation	No truncation ❌	5291 bytes truncados ⚠️
Modelo por sub-agente	✅ Sí, agent.{name}.model	❌ No, hereda sesión
Rol sub-agente	Declarativo (JSON)	Dinámico (define_subagent)
Delegación síncrona	✅ task()	❌ Solo async
Envelope estructurado	✅ Semi-estructurado	❌ Texto plano (send_message)
Workspace isolation	❌ No existe	✅ branch / share
Sub-agentes predefinidos	✅ 9 roles fijos	❌ Cero, todo dinámico
Seguridad por defecto	Matriz configurable	✅ Siempre pide aprobar
Madurez	Alta	Media
---
TL;DR: La sorpresa fue el truncamiento
Lo más revelador de la segunda ronda no fue el lazy loading ni los tokens — fue que el runtime de Antigravity te truncó 5291 bytes de reglas. Eso significa que:
1. No sabés qué parte de tus instrucciones se perdió
2. El agente no sabe que perdió esa parte
3. Si el truncamiento cortó una regla de seguridad o delegación, te estás enterando cuando explota
Eso solo no te pasa en OpenCode porque el prompt del orquestador está dimensionado para entrar completo. Si querés llevar a Antigravity a producción, vas a tener que medir y recortar manualmente tus reglas para que no necesiten truncamiento.