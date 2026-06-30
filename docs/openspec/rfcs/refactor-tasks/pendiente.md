## 7. Phase Batching y Ejecución Secuencial
El Orquestador debe administrar la ejecución (Workers/Apply) equilibrando el Costo de Tokens vs el Context Drift.

**Regla Anti-Solapamiento:** NUNCA se ejecutan subagentes en paralelo. Se delega uno, se espera su Return Envelope, y se lanza el siguiente.

**Estrategia de Task Budgeting (Batching):**
- **Tiers 1 y 2 (Fast/Standard):** Delegación **Full-Batch**. El Orquestador manda ejecutar *todas* las fases en un solo worker. Si el worker (al tener inteligencia táctica) detecta que el scope es demasiado grande para su ventana de contexto, tiene permitido frenar a la mitad, emitir su `report.md` (Return Envelope) parcial, y el Orquestador levantará un segundo worker para terminar.

**Resoluciones de los Pendientes:**

**1. División del Tier:**
Se acepta la observación: en Tier 1/2 se debe evitar ejecutar la fase crítica de golpe. Se dividirá mínimo en dos fases, dejando el mergeo/cierre como un batch aislado.

**2. Fase de Merge Condicional en `tasks.md`:**
Es obligatorio cerrar el ciclo de la rama creada en la Fase 0. El template de `tasks.md` debe incluir siempre una fase final de "Cierre y Merge". 
- Si **SE INYECTA** el `release.md` (por ser un Release Mayor/Minor): Esta fase final del `tasks.md` simplemente instruye la transición para ejecutar el `release.md`.
- Si **NO SE INYECTA** el `release.md` (Patch/None): Esta fase asume el control del cierre, indicando explícitamente hacer el merge de la rama hacia `main` y realizar la limpieza.

**3. Formato del Return Envelope (Archivo vs Texto Plano):**
Se mantendrá el uso de un archivo físico `report.md` en lugar de emitir texto plano. Dado que el ecosistema opera en **Modo Handoff** manual entre chats, forzar al humano a copiar y pegar bloques masivos de texto genera fricción innecesaria. Referenciar un archivo (ej. "lee el @report.md") es considerablemente más ágil y deja un rastro claro del estado de la ejecución.


- **Tiers 3 y 4 (Deep/Gentle):** Delegación **Secuencial (Fase por Fase)**. Por el alto riesgo de "Context Decay" en features complejas, el Orquestador debe agrupar por fases lógicas (ej. Fase 0 + Fase 1). Cada apply se muere al terminar su batch, y el Orquestador levanta uno nuevo para la siguiente fase.

**Checkpoints (Modo Interactivo):**
En Modo Interactivo, **ES OBLIGATORIO** que el Orquestador haga una pausa después de recibir cada Return Envelope de ejecución. Debe pedir aprobación explícita al humano (para revisar diffs) antes de autorizar y lanzar el siguiente apply.

### 7.1. [DRAFT] Inspiración de Gentle AI (Para Debate)
**Heurísticas Duras de División:**
- **Regla Empírica:** Si la estimación de la tarea (PR Budget) proyecta tocar **más de 5 archivos o superar las 300-400 líneas**, es **obligatorio** dividir la delegación en batches (fases secuenciales). No hay lugar a dudas, se parte para proteger el contexto.

**Sanity Check por Batch:**
- Un Worker **NO** puede emitir su Return Envelope y cerrar el batch con código roto. Antes de finalizar su iteración, debe correr una validación rápida (ej. compilar, asegurar que no haya errores sintácticos) para evitar heredar basura al siguiente Worker.

**Merge Protocol del Estado (Anti-Sobreescritura):**
- Cuando se usan Workers secuenciales, está **prohibido** que el Worker en turno sobreescriba ciegamente el plan (ej. `tasks.md`). Se debe aplicar un patrón de "Merge": el Worker lee las tareas completadas por los batches anteriores y solo añade el progreso de su batch. Esto evita que se pierda el historial de ejecución.

**Verify de Ciclo Completo (Anti-Falsos Positivos):**
- La validación contra los specs completos (`sdd-verify`) **solo se ejecuta una vez**, al final de todos los batches. Validar a medias produce fallos falsos porque no está la foto completa.