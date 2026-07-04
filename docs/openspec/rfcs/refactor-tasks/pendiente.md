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


## Pendiente 2: Estrategia DRY (Prompt vs Template)
*Borrador de estrategia para evitar duplicidad de responsabilidades entre `funky-tasks.md` (Workflow) y `tasks.md` (Template físico), respetando la regla "El Template Siempre Manda".*

**El Problema:**
Actualmente hay solapamiento: ambos tienen reglas de formato (ej. Task Writing Rules). El prompt incrusta una estructura markdown hardcodeada que compite/desincroniza con el template real inyectado por el scaffolding.

**La Solución (Separación de Roles):**

1. **Rol del Prompt (`funky-tasks.md`) -> "El Motor Lógico"**
   - **Qué debe tener:** Inteligencia de negocio, cómo identificar dependencias, heurísticas de partición, cálculo de PR Budget.
   - **Qué NO debe tener:** Bloques de markdown hardcodeados demostrando cómo se ve el archivo.
   - **Instrucción Core:** "Lee el `tasks.md` (hoja membretada inyectada), respeta estrictamente su Fase 0 y sus bloques de `> [SISTEMA]`. Limítate a rellenar las tareas lógicas a partir de la Fase 1 sin alterar las reglas base."

2. **Rol del Template (`tasks.md`) -> "El Contrato y Estado Vivo"**
   - **Qué debe tener:** Estructura estática (Fase 0 de Branch, Fase Final de Cierre/Merge), Guardrails de redacción (Specific, Actionable) y los bloques de Sistema (`> [SISTEMA - PARA EL ORQUESTADOR]`).
   - **Por qué funciona:** Al ser el documento físico que lee el Orquestador en caliente (T1/T2) o el sub-agente (T3), forzamos el cumplimiento sin sobrecargar de formato al workflow de planeación.

*Próximo paso:* Limpiar el markdown hardcodeado del prompt y asegurar que el template tenga la Fase Condicional de Merge.

## Pendiente 3: Colisión de Archivado (`release.md` vs `/funky-archive`)
**El Problema:**
Existe un solapamiento de responsabilidades de archivado. El workflow `/funky-archive` (Paso 3) mueve la carpeta `changes/{feature}/` hacia `archive/{new-name}/`. Sin embargo, el template `release.md` (Fase X - Doc-Ops) también tiene una tarea dura de "Archivado" que instruye mover exactamente la misma carpeta. 
Si una feature de Tier 3/4 tiene specs (usa funky-archive) y además es un Release Minor/Major (usa release.md), ambas lógicas colisionarán: el release intentará mover una carpeta que el workflow ya movió (o viceversa).

**Posibles Soluciones (Para Debate):**
1. **Condicional de Estado en `release.md`:** Modificar la regla de archivado en `release.md` para que diga: *"Si la carpeta `changes/{feature}` aún existe (porque no se usó `/funky-archive`), muévela. Si ya no existe, márcalo como OMITIDO."* (Ideal si `/funky-archive` solo se usa en Tiers altos).
2. **Centralización en `/funky-archive`:** Extraer por completo la tarea de archivado del `release.md` y hacer que `/funky-archive` sea un paso obligatorio al final de **todos** los Tiers, unificando el proceso de cierre.
3. **El Orquestador manda:** Ya que `release.md` lo ejecuta el Orquestador *inline*, enseñarle mediante un system prompt a detectar si la fase anterior fue `/funky-archive` para saltarse el checklist de archivado.

*Recomendación:* La opción 1 es la más resiliente y requiere menos refactor arquitectónico inmediato.

## Pendiente 4: Arquitectura del Flujo de Cierre (Tier 2 Specs, Archive y Release)
**El Problema Raíz:**
Se ha detectado un hueco arquitectónico grave. En Tier 2, se redacta un `spec.md` con un template desactualizado que no tiene relacion al flujo openspec actual(delta,root,full spec,etc). También como el Tier 2 no usa custom workflows, nunca se ejecuta `/funky-verify` ni `/funky-archive`. Como resultado, los specs del Tier 2 nunca se fusionan (merge) con el Root Spec del OpenSpec, dejándolos "huérfanos". 

Adicionalmente, el flujo de templates al final de una feature (`tasks.md` -> `docs.md` -> `release.md`) requiere un orden determinista para no pisarse los pies, especialmente con el archivado físico de la carpeta (ver Pendiente 3).

**Puntos a Debatir para el Flujo Definitivo:**
1. **¿El Tier 2 realmente necesita Specs? (Recomendado: NO):** En Tier 1 no hay specs. En Tier 3 viven los OpenSpecs (Living Specs) pesados. Si le quitamos al Tier 2 la obligación de crear un `spec.md`, se elimina de tajo el problema de los specs huérfanos. Tier 2 podría operar solo con un `proposal.md` (o un markdown de diseño interno) que sirve de contexto para el worker y muere ahí mismo al archivarse la feature, sin tocar los Root Specs globales.
2. **Rol del `/funky-archive`:** Si Tier 2 ya no crea Specs, `/funky-archive` se queda como una herramienta exclusiva y estricta para el Tier 3 (y conserva su candado obligatorio de exigir `verify-report.md`). 
3. **Limpieza del `release.md`:** Depurar basura visual del template (ej. el checkbox de Smoke Test marcado como "DEPRECADO") y oficializar que su tarea de archivado es 100% condicional al estado de la carpeta, por si el `/funky-archive` ya la movió en Tier 3.
4. **El Orden de Ejecución Exacto:** 
   - `tasks.md` (Siempre se ejecuta) -> al terminar llama a:
   - `docs.md` (Condicional) -> al terminar llama a:
   - `/funky-archive` (Condicional, exclusivo de Tier 3 con Specs vivos) -> al terminar llama a:
   - `release.md` (Condicional, para GitOps y Release Notes finales).

*Estatus:* Abierto a debate antes de tocar el código de los workflows o templates.

Observación: Tasks es llenado por funky-tasks y ejecutado por funky-apply(tier 3) o funky-worker (tier 1 y 2). 
Docs y release son inyectados condicionalmente por medio del comando funky feature ejecutado por el humano, el orquestador solo da una recomendacion de como responder a los inquirers y el humano decide.
Si estos son inyectados, el funky-tasks tambien llena los templates de docs y release.
Pero quién ejecuta estos? Actualmente el orquestador lo hace, ya que tiene el contexto de todo el flujo SDD, por lo que sabe cómo redactar docs como las release notes, etc.
Tambien el orquestador llena los docs, pero estos pueden ser muy pesados si se hace un view file. 

### Fragmentación del Monolito de Tareas
Para mantener un "Change Folder" esbelto y cumplir con SRP (Responsabilidad Única), el histórico monolito `tasks` se divide en tres plantillas especializadas:
1. **`tasks.md`:** Ejecución pura de código. Se inyecta siempre.
2. **`docs.md` (Condicional):** Checklist de documentación estructural (arquitectura, ADRs, RFCs).
3. **`release.md` (Condicional):** Checklist exclusivo para lanzamientos (alineado al SemVer).

### Tabla de Correspondencia
| SemVer | Piso Mínimo de Tier | `release.md` | `docs.md` |
|--------|---------------------|--------------|-----------|
| **NONE** (Chores internos) | Tier 0 | ✗ No se sube versión | Condicional |
| **PATCH** (Bugfixes) | Tier 1 | ✗ Sin `release.md`, pero tarea de bump de versión obligatoria en `tasks.md` | Condicional |
| **MINOR** (Nuevas Features) | Tier 2 | ✅ OBLIGATORIO | Condicional |
| **MAJOR** (Breaking Changes) | Tier 3 | ✅ OBLIGATORIO | ✅ OBLIGATORIO |

## Pendiente 5: Ejecución de `docs.md` y `release.md` (Context Bloat vs Delegación)
**El Problema:**
Actualmente, el Orquestador ejecuta `docs.md` y `release.md` *inline*. Y es cierto que **el Orquestador siempre tiene el contexto** de lo que pasó (porque recibe los Return Envelopes de todas las fases, sin importar el Tier). 
El problema real es el **Context Bloat (Saturación de Memoria):**
Si obligamos al Orquestador a hacer `view_file` de templates de documentación pesados, y lo forzamos a redactar biblias de Release Notes o Specs de Arquitectura en su propio chat, su ventana de contexto se contamina con texto estático, degradando su inteligencia para futuras operaciones y encareciendo los tokens innecesariamente.

**Posibles Soluciones (Para Debate):**
1. **Delegación Documental (Workflow Dedicado):** Dado que redactar documentación es intensivo en texto, se propone crear un workflow especializado (ej. `/funky-docops` o `/funky-release`). El Orquestador simplemente le pasa el resumen (o los Return Envelopes) a este agente, y este agente hace el trabajo pesado de leer los templates, rellenar los `docs.md` y el `release.md`, aislando así la carga cognitiva.
2. **Híbrido por Tier:** 
   - **Tier 1 y 2:** Como el cambio es pequeño y el contexto está relativamente limpio, el Orquestador lo hace *inline* para ahorrar pasos.
   - **Tier 3 (Deep):** Se delega a un agente especializado, porque la cantidad de cambios (y por tanto, la longitud de las Release Notes y Docs) justificaría limpiar la carga del Orquestador.

## Pendiente 6: Mergeo de Specs en Tier 2 (¿Dónde vive la lógica?)
**Contexto:**
Si Tier 2 mantiene su `spec.md` (Delta), alguien tiene que mergearlo al Root Spec del OpenSpec al cerrar la feature. El `funky-archive` hace esto perfectamente, pero tiene un candado que exige `verify-report.md` con status PASS. Tier 2 no tiene fase Verify.

**Opciones evaluadas:**

1. **❌ Meter el mergeo en `tasks.md`:** Descartado. El Worker básico no tiene las instrucciones de precisión para fusionar Specs (Anti-Lazy, ADDED/MODIFIED/REMOVED). El riesgo de que corrompa el Root Spec es inaceptable.

2. **❌ Meter el mergeo en `release.md`:** Descartado. El Orquestador tendría que hacer `view_file` del Root Spec gigante y escupir el documento fusionado en su propio chat, causando Context Bloat masivo (Pendiente 5).

3. **✅ Hacer el candado de Verify Condicional en `/funky-archive` (Recomendado):** Modificar únicamente el Paso 0 del workflow para que diga: *"Si existe `verify-report.md`, debe estar en PASS. Si no existe, proceder sin él (asumiendo que es Tier 2 sin fase de Verify)."* Esto mantiene el SRP de cada artefacto intacto, reutiliza toda la lógica de fusión blindada del archive, y no contamina ni el Worker ni el Orquestador. El `/funky-archive` sigue siendo el único "Conserje de Specs" para Tier 2 y Tier 3.

---
```