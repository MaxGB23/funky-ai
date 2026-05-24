# Protocolo: SDD Micro-Planner (Formato de Salida)

**Objetivo:** Este documento define la estructura estricta que el **Sub-Orquestador (Arquitecto Táctico)** debe seguir al generar el archivo `implementation_plan_task[N].md`. Este plan es el puente entre el macro-diseño y el Worker.

## Estructura Requerida para el `implementation_plan_task[N].md`

> **[SISTEMA — PARA EL SUB-ORQUESTADOR]**
> Cuando termines de leer el código fuente requerido en el `planning-handoff.md`, debes escribir tu plan de implementación siguiendo **EXACTAMENTE** este formato.

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

---
> **Una vez generado este archivo, el humano lo revisará y se creará el `worker-handoff.md` oficial adjuntando este micro-plan.**
