# Explore: 012 - Auto-Tiering del Orquestador

## 1. Contexto Actual
El Orquestador de Funky AI actualmente procesa las tareas sin un nivel de rigor determinístico por defecto. Si el usuario no lo especifica, el LLM suele asumir un **Tier 2 (Standard)**, lo cual genera:
1. *Overhead documental* para tareas triviales (T1).
2. *Subestimación de riesgos* para cambios en el core o NFRs críticos (T3/T4).

## 2. Mapa de Impacto (Archivos Involucrados)
- `.agents/rules/sdd-orchestrator.md` **(Impacto Crítico):** Necesitamos inyectar la Matriz de Decisión ("Razonamiento Pre-Vuelo") directamente en el **Bootstrap** o antes del **Planning Checklist**.
- `ORCHESTRATOR-STATE.md` **(Impacto Menor):** Marcar como resuelto y purgar del backlog.
- *Opcional:* Documentación en `docs/funky-ai/guias/` si formalizamos el Tier 4 (Deep SDD).

## 3. Descubrimientos y Riesgos
- **Riesgo de Falsos Positivos (Demasiada burocracia):** El Orquestador puede ponerse excesivamente precavido bloqueando flujos ágiles. Debe existir una cláusula de *Override Humano* rápida.
- **Inflación de Tokens (Token Diet):** Agregar el algoritmo de "Self-Assessment" al archivo de reglas aumenta la carga cognitiva global. Debemos redactar la lógica en formato *Haiku / Estricto*.
- **Incompatibilidad con Scaffolding Actual:** Si el Orquestador define autónomamente que es Tier 1 (Flash), el comando `funky feature` ya nos inyectó un `explore.md` y `proposal.md` físicos y vacíos. ¿Qué pasa con esos archivos?
   - *Solución:* El Orquestador en T1 no los toca y le indica al Worker que vaya directo al `tasks.md`. Los archivos vacíos se ignoran o se destruyen en el post-archivado.

## 4. Viabilidad
**Alta.** No requiere modificar el motor del CLI (`funky-cli`). El cambio reside al 100% en *Prompt Engineering* sobre las Workspace Rules del repositorio y la adherencia estricta del LLM a declarar su estado antes de pensar soluciones técnicas.

---
> 🔴 **Cambio de Scope Detectado:** No
