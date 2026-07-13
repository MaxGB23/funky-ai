# Reporte: Cherry-Pick de `sdd-explore` (Gentle AI vs Funky AI Local)

## 1. Mecanismos Extraídos de Gentle AI

### Action Forcing & Anti-Ambigüedad
1. **Orchestrator Gate Explicito**:  
   `> **ORCHESTRATOR GATE**: If you loaded this skill... you are the ORCHESTRATOR — STOP. Do NOT execute... Delegate...`
   Fuerza al orquestador a no intentar resolver el problema por sí mismo (evitando alucinaciones de código en el chat principal) y lo obliga a delegar.
2. **Pasos Obligatorios Marcados Fuertemente**:  
   `**This step is MANDATORY when tied to a named change — do NOT skip it.**`
3. **Control Estricto de Salida**:  
   `Return EXACTLY this format to the orchestrator (and write the same content to exploration.md if saving)`
4. **Instrucciones de Árbol de Decisión para Análisis**:  
   Provee un pseudo-árbol (INVESTIGATE) para que el agente no divague:
   ```text
   ├── Read entry points and key files
   ├── Search for related functionality
   ├── Check existing tests (if any)
   ├── Look for patterns already in use
   └── Identify dependencies and coupling
   ```

### Guardrails
1. **Límites de Escritura**: `The ONLY file you MAY create is exploration.md... DO NOT modify any existing code or files.`
2. **Anti-Alucinación**: `ALWAYS read real code, never guess about the codebase.`
3. **Manejo de Incertidumbre**: `If you can't find enough information, say so clearly.` / `If the request is too vague... say what clarification is needed.`
4. **Context Economy Rule**: `Keep your analysis CONCISE - the orchestrator needs a summary, not a novel.`

---

## 2. Recomendaciones de Adopción (Context Economy)

Dado nuestro enfoque **lean (Context Economy)**, sugerimos adoptar los siguientes fragmentos de Gentle AI e integrarlos en nuestras instrucciones/templates:

### A. Adoptar el "Orchestrator Gate" (Adaptado)
**Justificación**: En nuestro stack actual con herramientas como `/funky-worker`, es vital que el Orquestador no intente escribir código directamente en el chat. Esto ahorra tokens y previene que el LLM del orquestador sature su contexto con código.
*Sugerencia:* Incluir un blockquote restrictivo al inicio de nuestras skills de SDD si son exclusivas para delegación.

### B. Adoptar la sección `INVESTIGATE` (Árbol de Decisión)
**Justificación**: Mantener el contexto limpio significa que el agente de exploración debe saber exactamente *qué* leer y *qué no* leer. Dándole una guía explícita sobre qué buscar (entry points, tests, patterns) evitamos que el agente lance tool calls (`view_file` o `grep`) al azar consumiendo tokens innecesariamente.
*Sugerencia:* Agregarlo como comentario de bloque en nuestro template o como regla en las instrucciones de ejecución.

### C. Adoptar Guardrails Críticos Anti-Alucinación
**Justificación**: Las reglas "ALWAYS read real code, never guess" y "If you can't find enough information, say so clearly" son fundamentales para un entorno "Context Economy". Es preferible que un agente falle rápido y pida ayuda humana en vez de gastar 5 iteraciones intentando adivinar el código, lo que quema tokens masivamente.
*Sugerencia:* Sumarlas al pie de nuestro template `explore.md` como reglas dirigidas al modelo.

### Lo que NO recomendamos adoptar:
- **Toda la burocracia de los "Tiers" o modos de persistencia (engram | openspec | hybrid | none)** si no los usamos activamente, ya que inflaría el contexto sin valor. Nuestro sistema es más directo (`TIER DE ORQUESTACIÓN ELEGIDO: "N"`).
