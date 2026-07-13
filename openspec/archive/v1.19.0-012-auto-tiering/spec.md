# Spec: 012 - Auto-Tiering del Orquestador

## 1. Requerimientos Funcionales (Modificaciones a `.agents/rules/sdd-orchestrator.md`)

El system prompt del Orquestador debe ser actualizado para incluir:

### 1.1 El "Paso 0 - Razonamiento Pre-Vuelo"
Antes de generar artefactos o responder soluciones, la primera respuesta del LLM debe declarar su Tier.

### 1.2 La Matriz de Decisión Estricta
- **Tier 1 (Flash):** Tareas mecánicas, de un solo archivo, documentación, o fix trivial.
- **Tier 2 (Standard):** Features normales, 2-5 archivos, sin cambios arquitectónicos.
- **Tier 3 (Deep/Crítico):** Cambios en el motor core (`funky-cli/src`), NFRs pesados (seguridad/performance), o refactors masivos.

### 1.3 Comportamiento por Tier
- **Flujo T1:** El Orquestador ignora los comandos `/sdd-explore` y `/sdd-propose`. Pasa directamente al `tasks.md`. El Worker ejecutará la tarea y luego purgará los `.md` vacíos.
- **Flujo T2:** Flujo normal. Pide `/sdd-explore`, luego `/sdd-propose`, spec y finalmente `tasks.md` con su handoff.
- **Flujo T3:** Frenado de emergencia. Altera al humano: *"Requiere aislamiento. Preparate para un handoff riguroso."*

## 2. Requerimientos No Funcionales
- **Token Diet:** Las instrucciones que inyectemos en las reglas globales deben escribirse en formato "Haiku" (bullets cortos, alta densidad semántica) para no alargar el tiempo de procesamiento (TTFT) en cada prompt subsecuente.

## 3. Edge Cases
- **El CLI inyectó scaffolding completo, pero el LLM deduce T1:** El Orquestador debe dejar en blanco los archivos de la feature, y el `tasks.md` deberá incluir una tarea explícita en su bloque de Git-Ops o Doc-Ops: *"Borrar explore.md, proposal.md y spec.md al archivar."*

## 4. Criterios de Aceptación
1. `.agents/rules/sdd-orchestrator.md` contiene la "Escalation Matrix".
2. `.agents/rules/sdd-orchestrator.md` describe el comportamiento de salteo de fases en T1.
3. Se actualiza el `ORCHESTRATOR-STATE.md` marcando 012 como resuelta.

---
> 🔴 **Cambio de Scope Detectado:** No
