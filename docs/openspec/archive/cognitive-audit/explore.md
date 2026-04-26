# 🕵️ Exploración Arquitectónica: Auditoría de Sobrecarga Cognitiva

## 1. El Problema (Contexto)
Hemos detectado empíricamente que los LLMs (tanto en rol de Orquestador como de Worker) omiten pasos críticos, como la fase de Release, la generación de ciertos archivos o la lectura de dependencias. 

**Hipótesis:** El problema no es la "inteligencia" del modelo, sino la **Sobrecarga Cognitiva (Context Window Dilution)**. Cuando inyectamos múltiples reglas globales (`sdd-orchestrator.md`, `engram-protocol.md`, `secops.md`) más el template largo de `tasks.md`, las directivas críticas quedan enterradas bajo texto narrativo o explicativo. El modelo sufre de "Lost in the Middle" (pérdida de atención en el medio del prompt).

## 2. Objetivos de la Auditoría
1. **Reducir el Token Count:** Eliminar explicaciones filosóficas y dejar solo órdenes accionables (Imperativo).
2. **Mejorar el Salience (Prominencia):** Usar técnicas de Prompt Engineering como etiquetas XML (`<CRITICAL>`, `<RULES>`) para destacar checklists.
3. **Desacoplar Contexto:** Asegurar que los Workers tier-bajo no carguen reglas de orquestación que no les sirven.

---

## 3. Archivos Críticos Bajo la Lupa

### A. `.agents/rules/sdd-orchestrator.md`
- **Diagnóstico Actual:** Contiene la filosofía de "Funky AI Architecture" (Orchestrator vs Worker) y el "Session Bootstrap". Es texto narrativo pensado para humanos, no optimizado para máquinas.
- **Solución Propuesta:** 
  - **Cero Charla en las Reglas (Token Diet):** Convertir todo en reglas SI/ENTONCES en formato militar y directo (`User inputs /sdd-explore -> MODE: ORCHESTRATOR`).
  - **Condicionales de Rol Inquebrantables:** Usar etiquetas `<ROLE_ORCHESTRATOR>` y `<ROLE_WORKER>` con una orden imperativa directa. Ejemplo: `<ROLE_ORCHESTRATOR>\nCRITICAL: IF YOU ARE IN WORKER MODE, IGNORE THIS ENTIRE SECTION.\n...</ROLE_ORCHESTRATOR>`.

### B. `.agents/rules/engram-protocol.md`
- **Diagnóstico Actual:** Explica qué es un Engram y por qué es importante.
- **Solución Propuesta:** **Token Diet:** Reducirlo puramente al schema JSON/Markdown que debe devolver. Nada de historia, solo "Format expected: ...".

### C. `funky-cli/src/templates/sdd/tasks.md`
- **Diagnóstico Actual:** El checklist de Release está en formato markdown regular. El LLM lo lee como "una lista más" y a menudo lo ignora al terminar la fase de código.
- **Solución Propuesta:** **Bloque de Salida Estricto (MANDATORY_CHECKLIST):** Envolver la sección de Release en un bloque `<MANDATORY_RELEASE_PROTOCOL>` y agregar una regla de **Action Forcing** en el Handoff que obligue al Worker a imprimir un bloque `[x]` verificando la fase de Release antes de dar el reporte por terminado.

### D. `funky-cli/src/templates/bootstrap/plantilla-worker-handoff.md`
- **Diagnóstico Actual:** Ya mejoramos este archivo agregándole "Cero Exploración", pero podemos hacerlo aún más estricto. A veces el LLM intenta justificar sus acciones en el chat en lugar de ir directo al disco.
- **Solución Propuesta:** **Militarización del Prompt:** Forzar un formato de salida único. Ejemplo: `RESPONSE_FORMAT: ONLY output the final report.md updates. NO conversational text.`

---

## 4. Opciones de Implementación (Trade-offs)

### Opción 1: Refactorización Agresiva (Militarizada)
- Convertir todas las reglas a puro YAML o pseudo-código.
- **Pros:** Máxima eficiencia de tokens. 0% de distracciones.
- **Contras:** Pierde la "voz humana" y puede ser más difícil de mantener por un desarrollador jr.

### Opción 2: Formato "XML + Markdown" (Recomendada)
- Mantener la lectura amigable, pero encapsular las órdenes críticas en etiquetas XML (`<RULE>`, `<SYSTEM>`). Los LLMs están entrenados masivamente para prestar extrema atención a lo que está dentro de etiquetas XML.
- **Pros:** Mejora radicalmente el "instruction following" de modelos como Claude 3.5 Sonnet o Gemini 1.5 Pro. Mantiene la legibilidad.
- **Contras:** Requiere reescribir unas 100 líneas de reglas.

---

## 5. Próximos Pasos
Si estás de acuerdo con la **Opción 2**, el siguiente paso es abrir un `/sdd-propose` para reescribir los templates, o saltar directo a un `tasks.md` si querés que te reescriba yo mismo esos 4 archivos ahora.
