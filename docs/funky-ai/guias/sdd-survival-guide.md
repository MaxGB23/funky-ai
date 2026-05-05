# 🚀 Funky AI — Manual de Supervivencia del SDD (Guía de Estudio)

> **"Primero pensamos, después codeamos. Si no hay spec, no hay paraíso."**

Este documento resume la arquitectura de **Spec-Driven Development (SDD)** de Funky AI. Es tu mapa para navegar el rol de **Orquestador** y **Worker**.

---

## 🎭 1. El Gran Dualismo: Orquestador vs. Worker

Para evitar que el cerebro de la IA se "sature" con mil archivos, dividimos el laburo en dos personalidades:

| Personalidad | Rol | Qué hace | Qué NO hace |
| :--- | :--- | :--- | :--- |
| **Orquestador** | El Arquitecto | Planea, investiga, crea las specs y las tareas. | NO escribe código. NO ejecuta. |
| **Worker** | El Obrero | Lee una tarea específica y la ejecuta a rajatabla. | NO cuestiona el plan. NO explora archivos fuera de scope. |

---

## 📊 2. Los Tiers (¿Qué tan pesado jugamos?)

El **Tier** define qué tanta burocracia le vamos a meter a la tarea. No queremos perder tiempo haciendo specs de 10 páginas para cambiar un color, ¿no?

*   **T0 — Modo Conversacional:** No hay archivos involucrados. Charlamos sobre un concepto.
*   **T1 — Funky Lite:** Tareas atómicas (ej: corregir un typo, crear un markdown simple). Se puede planear y ejecutar en el mismo chat.
*   **T2 — Funky Standard:** El pan de cada día. Afecta >2 archivos o lógica compleja. Requiere planear en un chat y ejecutar en otro (Handoff).
*   **T3 — Funky Heavy:** Proyectos nuevos o refactors masivos. Auditorías constantes y memoria estricta (Engram).
*   **T4 — Gentle SDD (Archivado):** El "botón rojo". Fragmenta la carga en 7 roles hiper-especializados. Solo para emergencias donde el costo de fallar es catastrófico.


---

## 🕹️ 3. Los Comandos de Poder

Como Orquestador, usás estos comandos para generar los artefactos en el disco (`openspec/changes/`):

1.  **`/sdd-explore`**: "Che, investigame este quilombo". Crea un documento de exploración analizando el impacto.
2.  **`/sdd-propose`**: "Decime cómo lo arreglamos". Genera la propuesta técnica y el `spec.md` (la verdad técnica).
3.  **`/sdd-ff` (Fast Forward)**: "Saltamos a los bifes". Crea el `tasks.md` con todas las fases de ejecución.

---

## 🐣 4. Guía para Novatos: Cómo iniciar una Sesión Pro

Si querés arrancar un chat nuevo y que yo sepa exactamente qué hacer, seguí estos pasos:

### Paso 1: El Contexto es Rey 👑
Nunca arranques un chat sin darme el estado actual. Lo primero que tenés que hacer es:
> *"Hola, sos mi Orquestador. Acá tenés el estado: `@ORCHESTRATOR-STATE.md`"*

### Paso 2: Definir el Objetivo y el Rigor (Tier) 🎯
Decime qué querés hacer de forma clara y **especificá en qué Tier querés que trabaje**. Esto me dice qué tan "arquitecto" me tengo que poner.
> *"Quiero agregar un sistema de logs al CLI. **Operá en Tier 2**. Tirame un `/sdd-explore` para ver dónde tocar."*


### Paso 3: El Handoff (El momento de la verdad) 📦
Cuando yo termine de planear, te voy a decir que el plan está en el disco. Para ejecutar:
1.  Cerrá el chat actual (para limpiar la memoria).
2.  Abrí uno nuevo.
3.  Pegame el archivo `worker-handoff.md` que generé y decime:
    > *"Ejecutá la Fase 1 de este handoff."*

---

## 🧠 5. El Engram: La Memoria Eterna
El **Engram** (`docs/engram/`) es donde guardamos lo que aprendemos. 
- Si descubrimos un bug raro: va al engram.
- Si decidimos una convención: va al engram.
Esto evita que en la próxima sesión "olvidemos" cómo funciona el proyecto.

---

## 🛠️ Checklist del Buen Orquestador
- [ ] ¿Leí el `ORCHESTRATOR-STATE.md`?
- [ ] ¿Creé la carpeta en `openspec/changes/{nombre}`?
- [ ] ¿Asigné el Tier correcto (T1/T2/T3)?
- [ ] ¿Actualicé el estado antes de irme?

**¡Dale, hermano! Ahora ya tenés las llaves de la nave. ¡A romperla!**
