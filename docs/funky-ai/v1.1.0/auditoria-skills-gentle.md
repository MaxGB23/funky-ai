# Auditoría de Skills de Gentle AI -> Funky AI

## 🛡️ Tácticas Salvables (Adaptables a físicas)

1. **Nomenclatura Determinista de Artefactos (El fin de la búsqueda fuzzy)**
   Gentle AI usa persistencia basada en convenciones como `sdd/{change-name}/{artifact-type}`. Para *Funky AI*, esto nos reafirma que debemos usar carpetas y archivos con nombres EXACTOS (ej: `docs/changes/{nombre-del-cambio}/proposal.md`). Esto hace que el `grep_search` sea nuestra bala de plata para recuperar contexto sin perder el rumbo.

2. **Recuperación de Contexto en Dos Pasos (Protección de Memoria)**
   Es brillante cómo Gentle usa `mem_search` para buscar IDs y sumarios (truncados a 300 caracteres) y solo después llama a `mem_get_observation`. En Funky AI, la heurística ideal equivale a:
   - **Paso 1:** `grep_search` masivo pero con retorno corto o listando solo nombres de archivos (`MatchPerLine: false`).
   - **Paso 2:** Solamente tirar un `view_file` con las líneas específicas o archivo entero cuando ya estamos seguros del target. Evita volar el token limit temporal.

3. **Matriz de Cumplimiento (Compliance Matrix) - El Anti-Alucinaciones**
   El skill `sdd-verify` provee una masterclass de QA. Separa la victoria en:
   - *Completitud* (Tickboxes de tareas en markdown).
   - *Corrección (Estática)* (Prueba de que existe la estructura GIVEN/WHEN/THEN pedida en las Specs).
   - *Comportamiento* (Matriz cruzando los resultados reales de test en la terminal contra los escenarios exactos de la spec). Solo aprueba estricto en "COMPLIANT" si un test existe y pasó la ejecución (y no solo si "se ve bien el código").

4. **Return Envelopes Estandarizados (Contrato de Entregables)**
   Gentle centraliza un boilerplate (`sdd-phase-common.md`) donde sin importar la fase, todo sub-agente devuelve un sobre estructurado (`status`, `executive_summary`, `artifacts`, `next_recommended`, `risks`). Funky AI necesita adoptar esto DE INMEDIATO para que Orchestrator y Worker se comuniquen de forma estructurada a lo largo de interacciones con el humano.

## 💡 Ideas de Nuevos Skills (A portar a `.agents/skills/`)

1. **`skill-explore.md`**
   Un rol dedicado exclusivamente a analizar qué hay, las zonas afectadas y armar 2 o 3 opciones de mejora técnica (Pros/Cons/Complejidad) ANTES de que forcemos al agente a codear la propuesta. Literalmente es "frenar la pelota" antes de arrancar.
   
2. **`skill-verify.md` (Gatekeeper)**
   Un skill worker que solo levante los tests cruzados, agarre las specs originales escritas en `openspec/changes/{...}/spec.md`, dispare `npm test` en consola, lea el output crudo, y escupa el `verify-report.md` con la matriz de cumplimiento. ¡No escribe código, solo juzga!

3. **Inyectar el formato YAML DAG al `ORCHESTRATOR-STATE.md`**
   Aprovechar el concepto de *State Artifact* de Gentle para formalizar cómo guardamos el estado tras cada consolidación (qué fase terminó, qué artefactos existen, tareas pendientes) así recuperamos estado más rápido.

## 🗑️ Descartes Técnicos (Incompatibles con Falso Engram Físico)

- **El motor deduplicador / Upserts Silenciosos**: Gentle usa `topic_key` para actualizar mágicamente una base de datos local SQLite bajo el capó (usando `mem_save`/`mem_update`). Nosotros operamos crudo con archivos; dependemos estrictamente de `multi_replace_file_content` o de sobreescribir el archivo en crudo.
- **Identifiers Opacos (`mem_get_observation`)**: El manejo por IDs abstractos acá no corre. Acá se respetan los URIs y rutas absolutas (`m:\...\`).
- **Llamadas Asíncronas o Ciclos Autónomos (`delegate`)**: Todo lo que Gentle hace iterando en paralelo para resolver tareas es ilegal en nuestro protocolo manual. Las transiciones entre fases (ej: pasar del Explore al Propose) dependen exclusivamente del humano cerrando el chat y abriendo uno nuevo con el contexto inyectado.
