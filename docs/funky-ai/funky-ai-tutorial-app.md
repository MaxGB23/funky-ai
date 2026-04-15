# Tutorial Funky AI en Acción: "TaskMaster CLI"

Este documento es una simulación End-to-End de cómo aplicar el protocolo **Funky AI** usando manipulaciones manuales de chat en Antigravity para simular una red de sub-agentes asíncronos.

## La App de Ejemplo
**Objetivo Operativo:** Construir desde cero un pequeño CLI (Command Line Interface) en Node.js que permita guardar y listar tareas pendientes en un archivo físico (`tareas.json`).

---

## Ejecución del Workflow (Paso a Paso)

### 📌 PARTE A: El PM / Orquestador (Chat Fijo #1)
*El usuario abre su IDE y dedica UN solo chat para organizar todo el proyecto. Este chat NO programa.*

1. **La Inicialización**
   - **Usuario:** `/sdd-init`
   - **Agente (Orquestador Mode):** Detecta el entorno. Genera en el disco duro la estructura de carpetas de memoria `openspec/`.
   
2. **Definiendo el Norte**
   - **Usuario:** `/sdd-new cli-gestor-tareas`
   - **Agente (Orquestador Mode):** Analiza el problema, escribe en tu disco un archivo `openspec/changes/cli-gestor-tareas/proposal.md` proponiendo la idea básica.
   - **Agente:** *"Propuesta lista en disco. Por favor, cerrá mis persianas y abrí un chat nuevo para delegar el Diseño Técnico."*

---

### 📌 PARTE B: Arquitectura y Workers Descartables

Al no tener sub-agentes automáticos de fondo, vos hacés el "Fork" manualmente:

3. **Sub-Agente de Arquitectura (Chat #2)**
   - **Usuario:** Deja el Chat #1 abierto, pero trae una **VENTANA NUEVA** en limpio. Escribe: *"@proposal.md Soy tu manager. Entrá en Modo Worker (Ejecución). Analizá la propuesta y dejame en disco el `design.md` y `tasks.md`."*
   - **Agente (Gemini):** Con contexto hiper limpio devora el problema, decide que el CLI usará `process.argv` puro para ser veloz y escribe las tareas en el disco duro.
   - **Usuario:** Una vez guardado el `.md`... **CIERRA y DESTRUYE el Chat #2**. El sub-agente murió en paz.

4. **Sub-Agente Albañil - Lote 1 (Chat #3)**
   - **Usuario:** Abre **VENTANA NUEVA** en limpio. Escribe: *"@tasks.md Entrá en Modo Worker. Agarrá la Tarea 1: Init y Scaffolding. Codeala y no hagas otra cosa."*
   - **Agente:** Crea el `package.json` vacío y el archivo inicial. Termina.
   - **Usuario:** **CIERRA y DESTRUYE el Chat #3**. 

5. **Sub-Agente Albañil - Lote 2 (Chat #4)**
   - **Usuario:** Abre **VENTANA NUEVA** en limpio. Escribe: *"@tasks.md Entrá en Modo Worker. Agarrá la Tarea 2: Lógica de Motor FS. Codeala."*
   - **Agente:** Codifica el motor que graba en `tareas.json`.
   - **Usuario:** **CIERRA y DESTRUYE el Chat #4**.

*(Nota la magia empírica: en ningún momento el modelo de IA arrastró las 300 líneas de código del Lote 1 para marearse armando el Lote 2, ni guardó memoria basura de las explicaciones del arquitecto. Clean context puro).*

---

### 📌 PARTE C: Verificación y Reporte de Vuelta al PM

6. **Testing del Humano**
   - **Usuario:** Abre la terminal de verdad y tira `node index.js add "Lavar los platos"`. El CLI lo guarda bien. Éxito.

7. **El Cierre Burocrático (Volvemos al Chat #1)**
   - **Usuario:** Retoma la ventana del Chat #1 (El Orquestador que quedó dormido al principio).
   - **Usuario:** *"El equipo técnico la descoció. El flujo funciona verde. Anotá todas las tareas como Cumplidas y actualizá/creá el documento `docs/ORCHESTRATOR-STATE.md` para sellar la sesión."*
   - **Agente (Orquestador Mode):** Lee sus parámetros, sella el estado del proyecto en el archivo canónico y documenta la victoria para futuras consultas.
