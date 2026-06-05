## 🚦 Pipeline de Ejecución Secuencial (Tier-Based Sharding)
**[SISTEMA — ORQUESTADOR]** El ciclo de vida de la feature está fragmentado en varios archivos. Tu obligación es buscar qué generó el CLI en la carpeta y ejecutarlos en este **ORDEN ESTRICTO**:

| Paso | Archivo Físico | Condición y Acción | 🚫 Guardrail / Regla Estricta |
|---|---|---|---|
| **1** | `sdd-tasks.md` | **SIEMPRE.** Delega las tareas al Worker. (Fase de Código). | **TÚ NO ESCRIBES CÓDIGO.** No avanzas al Paso 2 hasta que el 100% de las tareas aquí estén en `[x]`. |
| **2** | `sdd-docs.md` | **(Opcional)** Si existe, asume el rol de Doc-Ops. Cruza los cambios reales con el índice y edita los docs. | Si no existe, sáltate al Paso 3. Solo abre los docs referenciados en el momento de editarlos. |
| **3** | `sdd-release.md` | **(Opcional)** Si existe, ejecuta el Mandatory Release Protocol y finaliza la feature. | **FATAL ERROR:** Prohibido ejecutar este paso si el `tasks.md` no está terminado al 100%. |

> 🔴 **ALERTA DE SISTEMA:** La ejecución es un Pipeline en una sola dirección. Si intentas hacer tareas de documentación o releases antes de que el código (Paso 1) esté completado, vas a corromper el estado del proyecto. No busques atajos.
