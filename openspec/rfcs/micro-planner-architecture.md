# Análisis Arquitectónico: SDD Micro-Planner

Este documento consolida la filosofía, arquitectura y flujo de trabajo del nuevo protocolo **SDD Micro-Planner**, diseñado para blindar la ejecución de tareas de alto riesgo (`[⚠️ RIESGO ALTO]`) y permitir que modelos de IA de menor capacidad (Workers) ejecuten cambios complejos sin alucinar ni romper el ecosistema.

---

## 1. El Problema (Por qué nace esto)

En el protocolo SDD tradicional, el archivo `tasks.md` funciona como un checklist macro. Por ejemplo:
> *"Modificar feature.js para implementar un REPL interactivo con Inquirer."*

Para un humano o un modelo de IA hiper-avanzado (con contexto infinito y razonamiento perfecto), esto puede ser suficiente. Sin embargo:
1. **Delegación a modelos menores:** Si delegamos esa tarea macro a un Worker más rápido/barato, este va a intentar "adivinar" cómo implementar el REPL. Va a alucinar dependencias, va a reescribir la arquitectura a su gusto, y va a romper el código existente.
2. **Dilución de Contexto:** Si intentamos que un nuevo Orquestador planifique la tarea en el momento de la delegación, este nuevo agente tiene que leer todo el `proposal.md`, `spec.md`, y el código base desde cero. Es ineficiente y propenso a pérdida de información sutil.

## 2. La Solución: El "Sub-Orquestador" (Arquitecto Táctico)

El protocolo `sdd-micro-planner.md` introduce una capa intermedia obligatoria para tareas críticas, resolviendo el problema de la **saturación de la ventana de contexto (Context Bloat)** del Orquestador principal.

**La regla de oro:** 
1. El **Orquestador Principal** se mantiene 100% estratégico y macro. Nunca lee código fuente profundo para no contaminar su contexto.
2. El *diseño de bajo nivel* lo hace un **Sub-Orquestador** (que nace con la ventana de contexto fresca, lee el código, diseña el plan, y muere).
3. La *ejecución de bajo nivel* la hace el **Worker** (que solo sigue las instrucciones del plan).

### Separación de Responsabilidades: Macro vs Micro
- **`tasks.md` (Macro-Plan):** Generado por el Orquestador Principal. Define el *Qué* a alto nivel.
- **`implementation_plan_task[N].md` (Micro-Plan):** Generado por el Sub-Orquestador. Define el *Cómo* exacto (archivos, funciones, líneas, dependencias, mitigación de side-effects).

---

## 3. Flujo de Trabajo del Micro-Planner (End-to-End)

Cuando el Orquestador principal llega a una fase etiquetada con `[⚠️ RIESGO ALTO]` en el `tasks.md`, el flujo de delegación normal se interrumpe:

### Paso 1: Generación del Planning Handoff (Orquestador Principal)
El Orquestador principal detecta el riesgo y redacta un Handoff especial de planificación. No delega la escritura de código, delega el diseño.

### Paso 2: Invocación del Sub-Orquestador (Humano)
El humano abre un chat nuevo y ejecuta el futuro comando:
> `/funky-suborchestrator @docs/openspec/changes/<feature>/planning-handoff.md`

### Paso 3: Análisis y Generación del Micro-Plan (Sub-Orquestador)
El Sub-Orquestador (con su contexto vacío al 100%) lee los requerimientos, abre todo el código fuente necesario (`view_file`), mapea dependencias y redacta el `implementation_plan_task[N].md`. Al escribir en Markdown, utiliza "Chain of Thought", reduciendo la alucinación casi a cero. Cuando termina, el chat se cierra y sus tokens consumidos desaparecen.

### Paso 4: Human Review (Interactive Gate)
El humano revisa el micro-plan. *¿Tiene sentido técnico? ¿Usa las librerías correctas?* Si aprueba, el plan se sella.

### Paso 5: Delegación Quirúrgica al Worker (Orquestador / Humano)
Se genera el `worker-handoff.md` definitivo que enlaza directamente al `implementation_plan_task[N].md`. El humano invoca al `/funky-worker`, el cual lee las instrucciones ultra-detalladas y ejecuta las modificaciones en disco sin tomar decisiones arquitectónicas.

---

## 4. Conclusiones y Futuro de la Arquitectura

Para que este sistema sea robusto en el ecosistema Funky AI, la hoja de ruta es:

1. **Aislamiento Total de Contexto:** Esta arquitectura garantiza que el Orquestador Principal no degrade su capacidad de razonamiento con el paso de las fases, ya que delega el "heavy reading" de código a agentes efímeros.
2. **Especialización de Modelos:** Permite usar modelos caros y pensantes (ej. Opus/Sonnet 4.7) exclusivamente en el `/funky-suborchestrator` para el diseño, mientras se usan modelos veloces y económicos (ej. Flash) para el `/funky-worker`.
3. **El Comando `/funky-suborchestrator` (Feature Futura):** Se deberá implementar este comando en el CLI y su workflow asociado en `.agents/workflows/` para formalizar la invocación de este "Arquitecto Táctico". El protocolo `sdd-micro-planner.md` es la semilla de este rol.
