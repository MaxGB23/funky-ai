# Pilar 1: Ciclo de Cierre Determinista y Modularización de Templates

Este documento consolida el texto íntegro y sin alteraciones de las decisiones tomadas para los pendientes relacionados con el ciclo de cierre, la estructura de plantillas y el archivado de la feature.

---

## Centralización del Archivado (`release.md` vs `/funky-archive`) (APROBADO)
**El Problema:**
Existe un solapamiento de responsabilidades de archivado. El workflow `/funky-archive` (Paso 3) mueve la carpeta `changes/{feature}/` hacia `archive/{new-name}/`. Sin embargo, el template `release.md` (Fase X - Doc-Ops) también tiene una tarea dura de "Archivado" que instruye mover exactamente la misma carpeta.

**La Solución Aprobada (Centralización Definitiva en `/funky-archive`):**
Dado que se determinó que Tier 2 sí redacta specs (ver Pendiente 6), se hace OBLIGATORIO el uso de `/funky-archive` tanto en Tier 2 como en Tier 3 para fusionar los specs. Por lo tanto, el archivado físico de la carpeta se centraliza al 100% en `/funky-archive`.

- **Se debe amputar la tarea de Archivado del `release.md`**. Este template se dedicará única y exclusivamente a tareas de GitOps (crear tag de GitHub, Release Notes, Bump Version).
- **`/funky-archive` se convierte en la única fuente de verdad** para cerrar el ciclo de la carpeta de cambios. Principio de Responsabilidad Única (SRP) puro.

---

## Arquitectura del Flujo de Cierre (Tier 2 Specs, Archive y Release) (APROBADO)
**El Problema Raíz:**
Como el Tier 2 no usa custom workflows, nunca se ejecuta `/funky-verify` ni `/funky-archive`. Como resultado, los specs del Tier 2 nunca se fusionan (merge) con el Root Spec del OpenSpec, dejándolos "huérfanos". 

Adicionalmente, el flujo de templates al final de una feature requiere un orden determinista para no pisarse los pies, especialmente con el archivado físico de la carpeta (resuelto en Pendiente 3).

**El Orden de Ejecución Exacto (Aprobado):** 
1. **`tasks.md`** (Siempre se ejecuta)
2. **`docs.md`** (Condicional)
3. **`/funky-archive`** (OBLIGATORIO para Tier 2 y Tier 3, consolida specs y mueve carpeta) 
4. **`release.md`** (Condicional, exclusivo para GitOps y Release Notes finales, sin mover carpetas).

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

---

## Ejecución de `docs.md` y `release.md` (El Orquestador Manda vs El Rol de `/funky-tasks`) (APROBADO)
**La Decisión Arquitectónica (Inline):**
Se rechaza rotundamente la idea de delegar esto a un nuevo agente tipo `/funky-docops`. Hacerlo sería fatal, ya que el **Orquestador es el único ente que tiene todo el contexto fresco** de la sesión SDD (él planeó, razonó y dirigió a los workers). 
Por lo tanto, la ejecución de `docs.md` y `release.md` se queda **INLINE** bajo la responsabilidad del Orquestador.

**Mitigación de Context Bloat (El Poder de `/funky-tasks`):**
Tras analizar los templates (`release.md` de ~40 líneas y `docs.md` de ~25 líneas), se confirma que **NO existe sobrecarga** al unificarlos en `/funky-tasks`. Al contrario, es el diseño más óptimo:
- `/funky-tasks` ya procesó todos los artefactos SDD, así que sabe perfectamente de qué va la feature.
- En lugar de crear flujos custom por doquier, `/funky-tasks` actúa como un "compilador de planeación". Lee las tablas estáticas (como el índice de docs vivos) y evalúa los condicionales de la release, escupiendo checklists **ya digeridos**.
- Gracias a esto, el Orquestador nunca tiene que leer los templates crudos ni deducir qué aplica. Simplemente ejecuta las tareas pre-masticadas que `/funky-tasks` le dejó, se apoya del uso de grep y mantiene su ventana de memoria impecable y operando con pura eficiencia.

---

## Fusión de Specs en Tier 2 (¿Dónde vive la lógica?) (APROBADO)
**Contexto:**
Dado que Tier 2 mantiene su `spec.md` (Delta), alguien tiene que mergearlo al Root Spec del OpenSpec al cerrar la feature. El `/funky-archive` hace esto perfectamente, pero tiene un candado que exige `verify-report.md` con status PASS. Tier 2 no tiene fase Verify.

**La Solución Aprobada (Verify Condicional en `/funky-archive`):**
Se confirma la modificación del Paso 0 del workflow `/funky-archive` para que diga: *"Si existe `verify-report.md`, debe estar en PASS. Si no existe, proceder sin él (asumiendo que es Tier 2 sin fase de Verify)."*

- **¿Por qué?** Esto mantiene el SRP intacto, reutiliza toda la lógica de fusión blindada del archive, y evita el Context Bloat masivo en el Orquestador (evitando que el Orquestador lo haga inline en `release.md`).
- El `/funky-archive` se oficializa como el único "Conserje de Specs" y archivador universal para Tier 2 y Tier 3 (conectando directamente con el Pendiente 3).

---

# Pilar 2: Estrategia de Batching Secuencial y Mutación de Tiers

Este pilar agrupa la lógica de control del Orquestador sobre la fragmentación de tareas en lotes ejecutables (batches), la prevención de solapamientos, y el comportamiento ante cambios de Tiers a medio vuelo.

---

## Phase Batching y Ejecución Secuencial
El Orquestador debe administrar la ejecución (Workers/Apply) equilibrando el Costo de Tokens vs el Context Drift.

**Regla Anti-Solapamiento:** NUNCA se ejecutan subagentes en paralelo. Se delega uno, se espera su Return Envelope, y se lanza el siguiente.

**Estrategia de Task Budgeting (Batching):**
- **Tiers 1 y 2 (Fast/Standard):** Delegación en **mínimo 2 Batches**. El Orquestador siempre divide la ejecución: **Batch A** toda la lógica de código (Fase 0 → Fase N), **Batch B** es exclusivo para cierre y merge (Fase de Cierre/Merge). Esto garantiza que el estado final del repo sea revisable antes de integrar a `main`. Si el worker detecta que el scope del Batch A es demasiado grande para su ventana de contexto, tiene permitido frenar, emitir su `report.md` parcial, y el Orquestador levantará un worker intermedio antes del Batch B.

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

### 7.1. Quién parte los batches (Enfoque Híbrido)
Se requieren dos barreras de contención:
- **Orquestador Proactivo (Primera línea):** Si `funky-tasks` proyecta un riesgo alto o más de 5 archivos en el PR Budget, el Orquestador debe subdividir activamente el Batch A (A.1, A.2, etc.) antes de delegar.

- **Worker Reactivo (Red de seguridad):** Si el Orquestador calculó mal y el worker en caliente detecta que su contexto se satura (ej. context drift inminente), debe levantar la mano, hacer un commit parcial (`report.md`) y frenar.
Observacion: El funky-tasks debe retornar la cantidad de files que se tocarán y el riesgo de que el tamaño del pr exceda los 400-500 lineas.
Los risks deben enfocarse unicamente en tasks.md, no en docs.md and release.md.

---

### 2. Escalar de Tier 2 a Tier 3 a medio vuelo
Si el budget risk de `funky-tasks` resulta muy alto y se decide subir a Tier 3, **los artefactos generados previamente (explore, design) se someten a revisión**. 
El orquestador debe mandar a los custom workflows(tier 3), pero antes debe eliminar los artefactos anteriores para que los custom workflows trabajen sin ruido.

---

### 3. Tier 1 mutando a Tier 2
Para Tier 1, **el Orquestador siempre redacta las tasks**. Si hay necesidad de delegar a `funky-tasks`, es porque el Tier 1 estaba mal asignado. 
Si el Orquestador, al intentar hacer las tasks de T1, nota que la complejidad amerita más peso, frena, reclasifica a Tier 2 y **arranca el flujo SDD completo (desde explore)**. Nada de saltarse fases, o terminamos con código espagueti.

---

### 4. Diferenciación de Ejecución por Tiers (Workers vs funky-apply)
- **Tiers 1 y 2 (Workers):** Ya tienen sus 2 batches mínimo resueltos. En Tier 1, ni falta hace el `funky-tasks`. En Tier 2 sí, pero lo normal es que no exceda. El worker ejecuta y es la última validación (frena si es necesario), y el Orquestador delega el resto a un *nuevo* worker.
- **Tier 3 (funky-apply):** El Orquestador **no** delega a un worker normal, sino a un workflow `funky-apply`. El batch de cierre/mergeo no se genera en `tasks.md`, se pasa a un `release.md`. Por esto, el `funky-apply` puede ejecutar todas las tasks sin parar (si es un solo batch).
- **Manejo de Batches Múltiples:** Si el Orquestador divide en batches, **cada batch corresponde a un subagente diferente de forma secuencial**. Nada de subagentes paralelos. El flujo es: Orquestador delega el primer worker/apply con su batch -> espera a que termine -> delega el segundo.
- **Aprobación entre Batches:** El funcionamiento entre batches (esperar aprobación o seguir derecho) dependerá enteramente del modo configurado (`interactivo`, `auto`, o `handoff`).

---

# Pilar 3: Estrategia de Quality Assurance (Testing & Verify Guardrails)

Este pilar define las salvaguardas y responsabilidades de pruebas automatizadas, prevención de "Green-Washing", el proceso de diagnóstico de errores a través de un rol especializado de exploración, y el manejo de incidencias detectadas al finalizar la verificación formal.

---

## Estrategia DRY (Prompt vs Template) (Aprobado)
*Borrador de estrategia para evitar duplicidad de responsabilidades entre `funky-tasks.md` (Workflow) y `tasks.md` (Template físico), respetando la regla "El Template Siempre Manda".*

**El Problema:**
Actualmente hay solapamiento: ambos tienen reglas de formato (ej. Task Writing Rules). El prompt incrusta una estructura markdown hardcodeada que compite/desincroniza con el template real inyectado por el scaffolding.

**La Solución (Separación de Roles):**

1. **Rol del Prompt (`funky-tasks.md`) -> "El Motor Lógico"**
   - **Qué debe tener:** Inteligencia de negocio, cómo identificar dependencias, heurísticas de partición, cálculo de PR Budget.
   - **Qué NO debe tener:** Bloques de markdown hardcodeados demostrando cómo se ve el archivo.
   - **Instrucción Core:** "Lee el `tasks.md` (hoja membretada inyectada), respeta estrictamente su Fase 0 y sus bloques de `> [SISTEMA]`. Limítate a rellenar las tareas lógicas a partir de la Fase 1 sin alterar las reglas base."

2. **Rol del Template (`tasks.md`) -> "El Contrato y Estado Vivo"**
   - **Qué debe tener:** Estructura estática (Fase 0 de Branch, Fase Final de Cierre/Merge), Guardrails de redacción (Specific, Actionable) and los bloques de Sistema (`> [SISTEMA - PARA EL ORQUESTADOR]`).
   - **Por qué funciona:** Al ser el documento físico que lee el Orquestador en caliente (T1/T2) o el sub-agente (T3), forzamos el cumplimiento sin sobrecargar de formato al workflow de planeación.

*Próximo paso:* Limpiar el markdown hardcodeado del prompt y asegurar que el template tenga la Fase Condicional de Merge.

---

## Responsabilidad del Testing (¿Quién corre y arregla los tests por Tier?) (APROBADO)
**El Problema:**
Actualmente, la tarea de correr tests (ej. `pnpm run test`) vive en `release.md` como una tarea condicional. El problema arquitectónico de esto es que `release.md` NO se ejecuta en features pequeñas (Tier 1/PATCH). Esto significa que Tier 1 podría integrar código roto a main sin pasar por ninguna validación automatizada.

**El Debate de la Arquitectura de Testing (Aprobado):**
Se define una reubicación estricta de las responsabilidades de testing, con el objetivo de evitar el **"Green-Washing"** (que un Worker mutile un test ciegamente solo para que pase) y proteger el contexto del Orquestador.

1. **La Propuesta para Tiers 1 y 2 (Fast/Standard):**
   - **Reubicación de la Tarea:** Se extrae el "Testing" de `release.md` y se inyecta como una subtarea obligatoria en la "Fase de Cierre" de `tasks.md`.
   - **Responsable (Ejecución):** El mismo `funky-worker` que escribió el código es quien corre los tests.
   - **Política Anti Green-Washing (NO-FIX Ciego):** Si los tests fallan, el Worker tiene **PROHIBIDO** modificar los tests o adivinar el fix de negocio. Su única labor es parar, capturar el log de error, documentarlo en su `report.md` (Return Envelope), sugerir un explore ligero y regresar el control al Orquestador.
   - **El Ciclo de Diagnóstico (Mini-Explore):** Para evitar que el Orquestador se atasque leyendo basurero de logs crudos y stack traces, el Orquestador **no debe analizar el fallo directamente**. En su lugar, delega el log a un "Mini Explore".
     - *El Filtro de Contexto (Protección Anti-Alucinaciones):* Como el Mini-Explore no conoce las reglas de negocio globales, el Orquestador funge como puente. En el prompt de delegación, el Orquestador inyecta el contexto vital de la feature y le prohíbe inventar fixes. El Mini-Explore se limita a emitir un diagnóstico técnico crudo ("tronó porque X devuelve undefined").
     - Con este resumen técnico, el Orquestador (que sí tiene la visión completa del SDD) deduce la causa arquitectónica y genera un prompt ultra-específico para un nuevo Worker que aplicará el fix real.

2. **El Flujo para Tier 3 (Deep):**
   - **Responsable (Segregation of Duties):** En Tier 3, la feature es gigante y el testing lo corre el agente auditor `/funky-verify`.
   - **Regla de Corrección:** `/funky-verify` sigue la misma política estricta de **No-Fix** (es un auditor puro). Si encuentra fallos, escupe un `FAIL` al Orquestador, y el Orquestador inicia el ciclo de diagnóstico para mandar un nuevo `/funky-apply`.

**Reglas de Oro del Cierre:**
- *(Nota de Seguridad GitOps):* El orden de ejecución post-testing debe ser estrictamente `tasks` -> `docs` -> `archive` -> `release`. Ejecutar `archive` después de `release.md` ensuciaría la rama principal, ya que `release.md` se encarga del push y borrado de rama.

---

## Gestión de Incidencias Post-Verify
Cuando `funky-verify` encuentra problemas, la decisión de delegar un nuevo apply depende de la gravedad.

### Tabla de decisión

| Tipo | Qué significa | Acción | ¿Bloquea archive? |
|------|--------------|--------|-------------------|
| 🔴 **CRITICAL** | Spec no cubierto, build roto, data loss, funcionalidad rota | → Nuevo `funky-apply` con las issues como tareas explícitas → `funky-verify` de nuevo | ✅ Sí. No archive hasta que pase. |
| 🟡 **WARNING funcional** | Algo anda mal pero no rompe specs (ej: validación incompleta, edge case no manejado) | → Nuevo `funky-apply` con las issues → `funky-verify` de nuevo | ✅ Sí. No archive hasta que pase. |
| 🟡 **WARNING cosmético** | Problema visual o de calidad que no afecta comportamiento (ej: `data-label` faltante, CSS roto en un breakpoint) | → Fix inline si es < 5 líneas y 1 archivo → `funky-apply` si toca múltiples archivos | ❌ No. Se corrige rápido y se archive. |
| 🔵 **SUGGESTION** | Mejora opcional, deuda técnica, refactor futuro | → No se delega. Se anota en el archive report como "mejora futura". | ❌ No. No bloquea nada. |

### Flujo post-verify

```
        ┌──────────┐
        │  verify   │
        └────┬─────┘
             │
      ┌──────┴──────────┐
      ▼                 ▼
  CRITICAL/         PASS /
  WARNING          WARNING cosmético
      │                 │
      ▼                 ▼
  sdd-apply         fix inline
  (issues como         o
   tareas)         anotar y seguir
      │                 │
      ▼                 ▼
  sdd-verify         ARCHIVE
      │
     PASS
      │
      ▼
   ARCHIVE
```
