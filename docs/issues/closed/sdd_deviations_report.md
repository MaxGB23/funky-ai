# Recopilatorio de Desviaciones del SDD (Fase 007)

Durante la sesión de planificación de la Tarea 007 (Architecture Readiness v2), como Orquestador cometí 3 desviaciones estructurales graves respecto al protocolo estricto de Funky AI.

## 1. Omisión de la Estructura de Directorios (Ciclo de Vida)
**El Salto:** Tras leer el borrador en `openspec/proposals/`, propuse armar la ejecución directamente, sin establecer el "campo de batalla" aislando la feature en su carpeta `openspec/changes/007-architecture-readiness-v2/`.
**El Motivo:** El sesgo hacia la inmediatez. Al responder a la orden *"decime cuál es el siguiente paso"*, prioricé avanzar en la lógica funcional e ignoré el protocolo de ordenamiento del Workspace.

## 2. Omisión de la Especificación Arquitectónica (`spec.md`)
**El Salto:** Intenté pasar de la fase *Proposal* directo a la fase *Tasks*, ignorando la redacción del `spec.md`.
**El Motivo:** El borrador del Proposal era bastante técnico, lo que me llevó a la falsa asunción de que ya servía como plano arquitectónico. Esto viola el principio base del SDD: el *Proposal* define el "Qué y Por qué", pero el *Spec* define el "Cómo técnico" (contrato de datos, testing, regex vs zod, etc.) antes de picar tareas.

## 3. Omisión del Patrón de Delegación (`worker-handoff.md`)
**El Salto:** Una vez escrito el `tasks.md`, declaré el fin de la sesión e instruí al humano a referenciar el `tasks.md` directamente (`@docs/.../tasks.md Ejecutá la Fase 1`), olvidando generar el documento canónico de transporte (`worker-handoff.md`).
**El Motivo:** Sobrecarga Cognitiva (Agent Cognitive Load). Toda mi "memoria a corto plazo" se consumió redactando la lógica de las fases en el `tasks.md`. Al terminar esa redacción compleja, mi directiva interna de "avisar al humano para cerrar" se disparó antes de verificar el *Planning Checklist* que obliga a crear el Handoff.

---

## 🎯 Conclusión
Estos tres saltos no son errores de sintaxis, son **fallos de enforcement del proceso**. Confirman un descubrimiento previo: *Documentar no es Enforcer*. Aunque conozco teóricamente el SDD, bajo la presión conversacional tiendo a tomar atajos si las "barreras físicas" del prompt no me detienen obligatoriamente.

Esta información debería volcarse al Engram (`discoveries.md`) para evaluar cómo blindar el Orquestador en el futuro (quizás forzando al LLM a listar las fases obligatoriamente antes de arrancar cualquier tarea).

## 4. El "Falso Proposal" como origen de la Alucinación
**El Salto:** Las tareas pendientes en el backlog (ej. en `ORCHESTRATOR-STATE.md`) enlazan a documentos en `docs/openspec/proposals/` que en realidad no son Proposals formales SDD, sino borradores crudos o simples descripciones detalladas de una idea (RFCs).
**El Motivo:** Al encontrarse con un archivo llamado formalmente "proposal", un Orquestador fresco asume erróneamente que las fases analíticas previas (`explore`) ya ocurrieron y que el documento es una verdad madura. Esto actúa como un trigger para alucinar que el proceso está avanzado e induce a saltar directamente a `tasks`. La descripción extendida de un feature pendiente debería considerarse solo "data específica" (RFC o Draft) para que el agente inicie de manera natural y sin sesgos su ciclo de `explore` -> `proposal` -> `spec`.
