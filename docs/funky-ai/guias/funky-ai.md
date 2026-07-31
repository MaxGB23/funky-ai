# Funky AI: 



---

## 🏗️ Los 3 Pilares del Ecosistema

### 1. El Falso Engram (State Machine Física)


### 2. Sub-Agentes 

### 3. La Torre de Control (Orquestador)


---

## 🛤️ Workflow SDD (Spec-Driven Development)



---

## 🤔 Niveles de Complejidad (Tiers)



---



## ⚙️ Arquitectura JIT (v3.0.0)

El sistema usa **Token Diet** extremo para evitar "Context Dilution":

1. **Capa 1 (Global):** Perfil, Tono, Filosofía (`docs/prompts/GEMINI-funky-global.md`). Siempre activo, súper liviano.
2. **Capa 2 (Workspace Rules):** Identidad básica y routing (`.agents/rules/orchestrator-core.md`). Se activa automáticamente al detectar tareas de planificación.
3. **Capa 3 (Workflows On-Demand):** Lógica operativa profunda y checklists. Viven en Antigravity Workflows (`/funky-orchestrator`, `/funky-worker`). Solo se inyectan en el prompt cuando el humano los llama explícitamente.

---

## 🎯 ¿Por qué Funky AI?
Control granular contra "automatización mágica". Máxima potencia (Gemini Ultra/Pro) a costo cero mediante gestión manual de contexto. Eliminación de alucinaciones por aislamiento de tareas.
