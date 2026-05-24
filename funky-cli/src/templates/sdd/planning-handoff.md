# Planning Handoff: [Nombre de la Fase]

> **[SISTEMA — PARA EL ORQUESTADOR PRINCIPAL]**
> Este archivo se genera ANTES de delegar una fase con riesgo alto. Tu objetivo aquí es dar contexto digerido sin que tú leas los archivos y te sobrecargues de contexto, para que el Sub-Orquestador (Arquitecto Táctico) diseñe el plan de implementación. NO diseñes el código vos, limitate a mapear el terreno.

## 1. Contexto de la Tarea
- **Feature:** [Nombre de la feature en spec]
- **Objetivo Macro:** [¿Qué estamos intentando resolver en esta fase específica?]
- **Restricciones de Diseño:** [Reglas de la arquitectura, patrones a seguir, cosas que NO deben hacerse]

## 2. Archivos Críticos a Investigar
> **[SISTEMA — PARA EL SUB-ORQUESTADOR]** Debés hacer un `view_file` explícito de estos archivos para armar tu plan. No alucines el código.

- `ruta/al/archivo1.js` - [Razón por la que debe investigarse]
- `ruta/al/archivo2.js` - [Razón por la que debe investigarse]

## 3. Sugerencias Tácticas (Opcional)
[Acá el Orquestador Principal puede dejar notas sobre dependencias, posibles integraciones, o gotchas conocidos. Ej: "Cuidado con la librería X, asegúrate de no mutar el estado Y".]

---

> **[SISTEMA — INSTRUCCIÓN FINAL PARA EL SUB-ORQUESTADOR]**
> Una vez que hayas leído este documento y los archivos de código correspondientes, generá el `implementation_plan_task[N].md` siguiendo la estructura del protocolo `.agents/protocols/sdd-micro-planner.md`.
