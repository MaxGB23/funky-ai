# 🧠 Arquitectura de Shared Base: El Núcleo del Protocolo

Este documento es un spin-off exhaustivo del inventario de auditoría forense para los archivos `_shared` alojados en Gentle AI. A diferencia de las fases (Explore, Propose, etc.), los archivos `_shared` no son "skills ejecutables", sino el marco normativo (leyes) que rigen cómo los sub-agentes manipulan memoria, rutean datos y arman reportes de status.

Para adaptar nuestro SDD (Funky AI) al 100% como un protocolo autónomo "Local/File-Based", dominar estos cuatro archivos es crucial.

---

## 📂 `_shared/openspec-convention.md`
**La Biblia del File System.**

- **🎯 Propósito Core:** Establecer, con precisión maníaca, la topología del directorio `openspec/` y asignar permisos estrictos de qué agente genera/lee qué archivo.
- **⚙️ Mecánica Subyacente:** 
  Define una tabla de verdad absoluta (ej: `sdd-verify` lee `tasks.md`, `design.md` y escupe un `verify-report.md`). También detalla las directrices del `config.yaml` que imponen convenciones del tech-stack al vuelo para todas las fases de planeamiento.
- **♻️ Nivel de Portabilidad (Funky AI):** **100% Adaptable y Esencial.** 
  Esta es la espina dorsal. Nosotros en Funky AI nos apalancamos pura y exclusivamente en el sistema de archivos. Este framework de lectura/escritura previene que los agentes "alucinen" rutas fantasmas o se chanquen (sobreescriban) trabajo entre sí.
- **💎 Diamante Oculto (Patrones a Robar):** 
  Su regla de "SIEMPRE CREAR" primero el directorio físico si no existe, seguida de "SI EL ARCHIVO EXISTE, LÉELO ACTUALÍZALO, NO LO SOBREESCRIBAS A LO CIEGO". Al usar esto en Funky AI, garantizamos que las iteraciones sobre el `proposal.md` o las `specs` no tiren código útil de sesiones previas.

---

## 📂 `_shared/engram-convention.md`
**El Cementerio de SQLite.**

- **🎯 Propósito Core:** Estandarizar cómo nombrar las "memorias" persistentes en la Base de Datos Engram (`mem_save`), forzando consistencia vía `topic_keys`.
- **⚙️ Mecánica Subyacente:**
  Explica un protocolo rústico de 2 pasos forzoso por el tamaño del contexto. 
  Paso 1: `mem_search` (Trae Previews truncadas de 300 chars y el ID). 
  Paso 2: `mem_get_observation(id)` (Carga toda la carnaza en memoria).
  Además, implementa el uso de "topic_key" para simular Upserts (Si el key existe, reescribo; si no, inserto).
- **♻️ Nivel de Portabilidad (Funky AI):** **Nula/Muy Baja... PERO Inspiradora.**
  Toda la mecánica SQLite vuela. Pero...
- **💎 Diamante Oculto (Patrones a Robar):** 
  El concepto de **`topic_key` = Upsert Determinístico**. 
  En Funky AI, el "Topic Key" es lisa y llanamente **el path absoluto de un archivo**. Si queremos emular Engram para "state management" o "bug post-mortems", debemos forzar al Agente a actualizar siempre un payload en una sola ruta (ej. `docs/post-mortem.md`). Lo mismo con la técnica de 2 pasos de la que podríamos sacar provecho para no saturar contextos largos.

---

## 📂 `_shared/persistence-contract.md`
**El Contrato de Lectoescritura (La Eficiencia del Prompt).**

- **🎯 Propósito Core:** Explicar cómo se comporta la memoria dependiendo de qué modo corre el Orchestrator (`engram`, `openspec`, `hybrid`, `none`). Y más importante: quién es responsable de la Lectura y de la Escritura del contexto.
- **⚙️ Mecánica Subyacente:** 
  Decreta que a nivel global (Non-SDD), el Orchestrator busca y hace un resumen en su prompt para no quemar tokens. Pero en SDD, son **los sub-agentes** quienes descargan (leen) el crudo y siempre **ellos** son los que escriben los resultados, porque lo tienen fresco y no pierden granularidad.
- **♻️ Nivel de Portabilidad (Funky AI):** **Alta Modificando Modos.**
  Se debe purgar el ruteo de `hybrid` y `engram`. Hay que imponer `openspec` como el rey absoluto.
- **💎 Diamante Oculto (Patrones a Robar):** 
  **La Tabla "Who reads, who writes".** Este es un patrón supremo de optimización de LLM. Al emular sub-agentes asíncronos mediante sesiones de chat independientes (la regla Worker mode que pusimos de Funky AI), evitamos destruir el contexto del Orchestrator. El Orchestrator guarda "Punteros", el Worker "hace la bajada de línea dura".

---

## 📂 `_shared/sdd-phase-common.md`
**El Bozal Estructural (Return Envelope).**

- **🎯 Propósito Core:** Servir como inyección de boilerplate estándar en todas las fases del framework para estructurar la salida de texto (output) del LLM.
- **⚙️ Mecánica Subyacente:**
  Instruye sin lugar a duda a todos los sub-agentes a retornar un bloque "sobre" predecible tras completar su tarea pesada en disco. Todo lo que el LLM le devuelve al Orchestrator tiene que estar en los campos: `status`, `executive_summary`, `artifacts`, `next_recommended`, y `risks`.
- **♻️ Nivel de Portabilidad (Funky AI):** **100% Crítica.**
  Si querés que Funky AI opere sin que te hable tres párrafos innecesarios de confirmación, esto es clave.
- **💎 Diamante Oculto (Patrones a Robar):** 
  **The Return Envelope.** Unifica la respuesta en un API verbal. Cuando un Worker (en otra sesión) termine de implementar las `tasks.md`, vas a querer que solo copie este sobre y te lo traiga devuelta a tu conversación "Orchestrator". Esto aniquila el parloteo, previene que se coma detalles o warnings y establece el flujo lógico a seguir (gracias a `next_recommended`).
