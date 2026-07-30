# Planning Handoff: [Nombre de la Fase]

> **[SISTEMA — PARA EL ORQUESTADOR PRINCIPAL]**
> Este archivo se genera ANTES de delegar una fase con riesgo alto. Tu objetivo aquí es dar contexto digerido sin que tú leas los archivos y te sobrecargues de contexto, para que el Sub-Orquestador (Arquitecto Táctico) diseñe el plan de implementación. NO diseñes el código tú, limítate a mapear el terreno.

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

> **[SISTEMA — FORMATO DE SALIDA ESTRICTO PARA EL SUB-ORQUESTADOR]**
> Una vez que hayas leído este documento y los archivos de código correspondientes, genera el `implementation_plan_task[N].md` siguiendo EXACTAMENTE esta estructura:

### 1. Resumen de la Implementación
[Explicar brevemente cómo se va a resolver la tarea a nivel técnico. Mencionando patrones a usar y por qué se eligieron en base al código actual.]

### 2. Archivos a Modificar / Crear
[Para cada archivo, usar el formato exacto de bloques de cambios para que el Worker entienda qué debe hacer. DEBES especificar rutas exactas y líneas si es posible.]

#### `ruta/al/archivo_a_modificar.js`
- **Cambio 1:** [Descripción técnica del cambio: "Modificar la función X para que retorne Y"]
- **Líneas aproximadas:** [Ej: Líneas 45-60]
- **Dependencias afectadas:** [Librerías, imports o módulos internos]

#### `ruta/al/archivo_nuevo.js`
- **Propósito:** [Por qué se crea]
- **Estructura base:** [Esquema o pseudocódigo clave de lo que debe contener]

### 3. Consideraciones de Riesgo y Efectos Secundarios (Side Effects)
- **Riesgo:** [Ej: Al cambiar esta firma, 3 componentes fallarán]
- **Mitigación:** [Cómo el Worker debe arreglar eso o preverlo]

### 4. Criterios de Éxito (Verificación)
- [ ] [Prueba manual 1]
- [ ] [Prueba automatizada 1]
- [ ] [Aserción técnica específica]
