# Evolución Arquitectónica: Pre v2.0 vs v2.0.0

Este documento ilustra cómo resolvió Funky AI el problema de la sobrecarga de contexto (*Context Dilution*) mediante la separación física de responsabilidades.

---

## 🛑 Pre v2.0: El Monolito (El Problema)

Antes de la versión 2.0.0, la comunicación entre componentes sufría de acumulación de contexto. 

### Estructura
Teníamos dos archivos principales cargados de forma global o semi-global:
1. `GEMINI-funky-global.md`: Contenía la personalidad, pero a veces se contaminaba con reglas de orquestación puntuales.
2. `.agents/rules/sdd-orchestrator.md`: Era un archivo GIGANTE. Contenía **ambos roles** (Orquestador y Worker) delimitados por tags XML (`<ROLE_ORCHESTRATOR>` y `<ROLE_WORKER>`).

### Cómo se comunicaban
- El IDE inyectaba el `GEMINI-funky-global.md` en todos los chats.
- Al detectar la carpeta del proyecto, el IDE inyectaba el `sdd-orchestrator.md` completo.
- **El flujo:** Cuando el humano delegaba una tarea a un Worker, abría un chat nuevo y copiaba el handoff. Sin embargo, el LLM **leía todo el archivo `sdd-orchestrator.md`**, aprendiendo a planificar, evaluar Tiers, armar checklists... aunque su única misión fuera modificar un archivo de texto.
- **Resultado:** *Context Dilution*. El modelo recibía demasiadas instrucciones que no aplicaban a su rol actual, lo que aumentaba el costo de inferencia, ralentizaba la respuesta y generaba alucinaciones (ej. Workers que se ponían a planificar en vez de ejecutar).

---

## 🚀 Post v2.0.0: Arquitectura de 3 Capas (La Solución)

La v2.0.0 destruye el monolito y usa los **Workflows On-Demand** (Slash Commands de Antigravity) como motor de inyección quirúrgica.

### Estructura
1. **Capa 1: Global (`docs/prompts/GEMINI-funky-global.md`)**
   - **Qué tiene:** Solo identidad, tono y filosofía.
   - **Cuándo se inyecta:** Siempre. Da la personalidad base.
2. **Capa 2: Workspace Rules (`.agents/rules/orchestrator-core.md`)**
   - **Qué tiene:** Reglas estructurales mínimas (no escribir código, usar memoria, auto-tiering).
   - **Cuándo se inyecta:** Al planificar (mediante el trigger `model_decision`). Da el marco del repositorio.
3. **Capa 3: Workflows On-Demand (`/funky-orchestrator`, `/funky-worker`)**
   - **Qué tienen:** La lógica operativa densa (checklists paso a paso, guardrails de delegación).
   - **Cuándo se inyectan:** SOLO cuando el humano escribe el comando correspondiente.

### Cómo se comunican ahora
1. **Planificación:** El usuario abre un chat y dice *"Quiero hacer X"*. El sistema carga la Capa 1 y la Capa 2. El LLM opera como Arquitecto.
2. **Delegación (Handoff):** El Orquestador arma el plan y le dice al humano: *"Ejecuta `/funky-worker @handoff.md`"*. 
3. **Ejecución Quirúrgica:** El usuario abre un **chat nuevo** y ejecuta ese comando. Antigravity carga la Capa 1, pero en lugar de cargar las reglas del Orquestador, **inyecta el Workflow del Worker** (Capa 3) y el contenido del Handoff. 
4. **Resultado:** El Worker entra ciego a la planificación, pero con foco láser en la ejecución. Cero Context Dilution. Cero alucinaciones de roles. 

### Conclusión
En la v2.0.0, los archivos **no se pasan mensajes entre ellos**, sino que **el IDE compone el prompt perfecto** basado en las acciones del humano. El humano es el enrutador físico que decide qué pieza de lógica (Capa 3) entra en la cabeza del LLM en cada momento.
