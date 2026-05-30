Plan de implementación — 5 optimizaciones priorizadas
🔴 Prioridad 1 (INMEDIATO): Cache de artifact IDs (OP5)
Costo: Cero. Solo cambiar cómo escribís los prompts.
Ganancia: Eliminás un mem_search (tool call + espera + parseo) por cada fase.
Cómo: Cuando termine sdd-propose, agarro el ID de la observación y lo paso en el prompt de sdd-spec como:
## Artifact References
- Proposal: topic_key "sdd/mi-change/proposal" → observation_id: 8472
El sub-agente llama directo a mem_get_observation(8472) sin buscar.
---
🔴 Prioridad 2 (INMEDIATO): Branch workspace para sdd-apply (OP3)
Costo: Configurar el invoke_subagent de apply con workspace: "branch".
Ganancia: Si apply se manda un refactor falopa, kill al sub-agente y el branch se borra solo. Rollback automático sin tocar tu working directory.
invoke_subagent({
  sub_agents: [{
    TypeName: "sdd-apply",
    Prompt: "...",
    Workspace: "branch"   // ← esto
  }]
})
---
🟡 Prioridad 3 (CORTO PLAZO): Fragmentación + inyección condicional (OP1 con el matiz)
Esto cambió con la data nueva. La ingeniería inversa que nos dijo Antigravity:
Estrategia
view_file para cargar reglas
Inyección condicional del HOST
Lo que NO hay que hacer: Fragmentar y cargar con view_file. Si la sesión se alarga, el motor descarta esa tool response y el agente pierde la regla sin saberlo.
Lo que SÍ hay que hacer: Hablar con el equipo de Antigravity / configurar Mission Control para que inyecte condicionalmente:
.agents/rules/
├── sdd-core.md              → inyectar SIEMPRE
├── sdd-preflight.md         → inyectar SOLO si se detecta SDD
├── sdd-delegation-rules.md  → inyectar SOLO si se detecta SDD
└── engram-protocol.md       → inyectar SIEMPRE
Y cada archivo ser lo suficientemente chico como para que ninguno individualmente necesite truncamiento. Si cada archivo es < 5k chars, ninguno se trunca, y el total se compone dinámicamente.
---
🟡 Prioridad 4 (CORTO PLAZO): Híbrido embed/reference (OP2)
Agregar al flujo de define_subagent una decisión por umbral:
function crear_subagente(nombre, skill_path) {
  const skill_content = leer_skill(skill_path);  // view_file
  const lineas = skill_content.split('\n').length;
  if (lineas < 400) {
    // Embed — incrustar completo
    define_subagent({
      name: nombre,
      system_prompt: skill_content
    });
  } else {
    // Reference — pasar resumen + path
    const resumen = extraer_primeras_20_lineas(skill_content);
    define_subagent({
      name: nombre,
      system_prompt: `${resumen}\n\nFull skill at: ${skill_path}\nRead with view_file before work.`
    });
  }
}
---
🟢 Prioridad 5 (MEDIANO PLAZO): Model depth guide (OP4)
No reemplaza modelo por sub-agente, pero reduce output tokens en tareas mecánicas:
define_subagent({
  name: "sdd-apply",
  system_prompt: `
    Implementá los tasks. NO des vueltas.
    NO analices alternativas. NO pienses en voz alta.
    Producí el código directamente y reportá.
  `
});
vs:
define_subagent({
  name: "sdd-design",
  system_prompt: `
    Este cambio necesita diseño cuidadoso.
    Antes de escribir, analizá 3 enfoques distintos.
    Pensá en trade-offs: performance, mantenibilidad, escalabilidad.
    Recién después proponé el diseño final.
  `
});
---
Diagrama del flujo optimizado
1. [INICIO]
   Mission Control inyecta SOLO sdd-core.md + engram-protocol.md
   (~6k chars en lugar de 15k+)
          │
2. [User pide feature]
   Yo (orquestador) detecto → necesito SDD
          │
3. [Mission Control inyecta]
   sdd-preflight.md + sdd-delegation-rules.md
   (condicional, solo ahora que hay SDD)
          │
4. [sdd-propose]
   invoke_subagent(inherit, prompt con artifact IDs)
          │
5. [sdd-spec]
   invoke_subagent(inherit, prompt con ID de proposal)
   → mem_get_observation(ID) directo, sin search
          │
6. [sdd-design]
   invoke_subagent(inherit, prompt con depth guide + ID)
          │
7. [sdd-tasks]
   invoke_subagent(inherit, prompt con IDs)
          │
8. [Review guard]
   Si forecast > 400 líneas → pregunto
          │
9. [sdd-apply]
   invoke_subagent(BRANCH, prompt con IDs + skill embed/reference)
   → Si falla: kill → branch se borra → limpio
   → Si funciona: merge branch a working dir
          │
10. [sdd-verify]
    invoke_subagent(inherit, prompt con IDs)
---
TL;DR — Las 3 cosas que cambiaron mi opinión
1. No usar view_file para reglas core. Pensé que fragmentar + lazy load era la solución, pero Antigravity nos dijo que tool responses son volátiles. La posta es inyección condicional del host.
2. Branch workspace para apply no es opcional, es REGALO. Rollback automático al kill del sub-agente, y ni siquiera sabía que existía esa feature.
3. Cache de IDs es lo más fácil y lo que más impacto da. Literalmente cero esfuerzo, solo cambiar cómo redactás los prompts de delegación.
¿Querés que te redacte los prompts concretos de delegación con IDs cacheados y depth guide incluidos, cosa de que los tengas listos para copiar/pegar en tu orquestador SDD de Antigravity?