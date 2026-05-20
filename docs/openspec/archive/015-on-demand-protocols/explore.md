# Explore: 015 Protocolos On-Demand

**TIER DE ORQUESTACIÓN ELEGIDO: "T3"**
## 1. Contexto del Problema
A veces necesitamos que el agente asuma un rol hiperespecializado para una tarea concreta (ej. "Auditor de Seguridad", "Abogado del Diablo para revisar un plan", o un "Micro-Planificador").
Si agregamos las instrucciones de estos roles especializados al prompt global o a las reglas base del repositorio, generamos *Context Dilution* (inflamos los tokens con instrucciones que se usan en el 1% de los casos). Necesitamos un mecanismo portátil para que el humano pueda invocar estos roles **únicamente bajo demanda**, sin ensuciar los global workflows del IDE.

## 2. Opciones de Arquitectura

| Opción | Descripción | Pros | Contras / Tradeoffs |
|--------|-------------|------|---------------------|
| **A. Extensiones de Prompt CLI** | Agregar flags al CLI que inyecten un bloque de texto extra. | - Controlado desde terminal. | - Requiere modificar código fuente del CLI para cada rol. |
| **B. Sub-carpeta Custom (`.agents/protocols/`)** | Crear una carpeta aislada con markdowns. El humano le dice al agente explícitamente: "Lee este archivo y aplicá el protocolo". | - Cero context dilution global.<br>- 100% portátil entre proyectos.<br>- Invocación explícita (control total del humano). | - Requiere un comando manual del humano (ej. "usá el protocolo X"). |
| **C. Sistema Nativo de Skills/Workflows IDE** | Usar `.agents/skills` o Workflows globales del IDE. | - El IDE lo detecta automático. | - Ensucia el contexto global del IDE para otros proyectos.<br>- Exceso de magia negra (pérdida de control explícito). |

## 3. Recomendación + Riesgos
**Opción recomendada:** Opción B (Sub-carpeta Custom `.agents/protocols/`).

**Justificación:**
La máxima prioridad es evitar el "Context Dilution" y mantener la portabilidad del repositorio. Al crear una carpeta `.agents/protocols/` (fuera del motor automático de Skills o Workflows globales del IDE), garantizamos que estas reglas *jamás* se carguen a menos que el humano diga explícitamente: *"Agente, lee `.agents/protocols/devil-advocate.md` y ejecutalo sobre este plan"*. 
Es una inyección de contexto 100% quirúrgica y bajo demanda real.
Para probar esta infraestructura, implementaremos el **primer protocolo on-demand**: el **Abogado del Diablo** (`devil-advocate.md`).

**Riesgos mitigables:**
- **Riesgo:** Sobrescribir el contexto del agente (Role drifting).
  - *Mitigación:* El archivo del protocolo debe tener una cláusula estricta que diga: "Tu único objetivo es ejecutar esta auditoría y generar un reporte. No delegues tareas ni cambies de fase".

> **[SISTEMA - PARA EL ORQUESTADOR]** Una vez finalizada la exploración, utilizá este documento como base para generar el `sdd-proposal.md`.
