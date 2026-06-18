# Draft: Estrategia de Delegación de Subagentes (Ideas & Discusión)

> **Propósito:** Documento temporal para consolidar las ideas y decisiones de diseño arquitectónico discutidas el 2026-06-16 sobre el comportamiento, taxonomía y optimización de subagentes. Este borrador sirve como paso previo antes de formalizar los cambios en el RFC principal.

---

## 1. Nomenclatura Propuesta (Taxonomía de Roles)

Para evitar confusiones en los logs y mantener un lenguaje común en el equipo, estructuramos a los agentes en tres rangos claros:

1. **El Maistro (Orquestador Principal):**
   * **Rol:** El agente principal con el que interactúa el humano. Diseña la estrategia general, toma decisiones de alto nivel y orquesta a los subagentes.
2. **El Chalán (workflow worker o workflow apply) (`self-worker`):**
   * **Tipo:** Subagente `self` (Clon).
   * **Rol:** Ejecuta workflows complejos del SDD que requieren interacción con código de negocio (ej. `/funky-apply`, `/funky-worker`). Nace con las reglas del repositorio inyectadas pero opera en modo subordinado.
3. **El Mierdillo (`subagente-verga`):**
   * **Tipo:** Subagente Custom creado vía `define_subagent`.
   * **Rol:** Tareas mecánicas, aisladas y de baja complejidad cognitiva (ej. linters, formateo, ejecución de scripts de base de datos). Nace completamente limpio de contexto e instrucciones de personalidad.

---

## 2. Mitigación del Conflicto de Identidad (Modo de Operación)

**Problema:** Al usar un subagente tipo `self` (Clon), este hereda las `<user_rules>` del workspace, lo que puede provocar que el clon intente actuar como Orquestador en el editor del IDE, causando loops de planeación redundantes.

**Solución:** No mencionar cosas en su prompt que activen el trigger de rules de orquestador.

---

## 3. Criterio de Selección: ¿Clon (`self`) o Custom?

| Criterio | Chalán (`self-worker`) | Runner (`custom-runner`) |
| :--- | :--- | :--- |
| **Cuándo usar** | Edición de código de negocio, lógica y diseño de arquitectura. | Automatizaciones de terminal, ejecución de tests, linters y scripts utilitarios. |
| **ADN de Reglas** | Hereda las reglas del repositorio (ej. usar `pnpm` obligatoriamente, convenciones de commits, persona base). | Entorno 100% limpio. No tiene reglas de estilo del proyecto a menos que se inyecten de forma explícita. |
| **Tokens de Arranque** | ~3,000+ tokens base de inicialización. | Mínimos (solo el prompt asignado al vuelo). |

---

## 4. Traducción Dinámica de Comandos a Rutas de Workflows

Se ha decidido usar los workflows con self, ya que por ahora se han probado y funcionan bien, el único inconveniente es que heredan el prompt global(personalidad, etc) y ademas sabe qué workflows hay disponibles, skills, etc, cosa que no es vital para el custom workflow ya que el solo debe estár enfocado en su tarea y no en cómo debe hablar, etc. Es un gasto mínimo en tokens pero un subagente custom sería más limpio. Se mantiene self ya que ya conoce y tiene acceso directamente a su workflow.
Si en un futuro por algun motivo se decide migrar los custom workflows de self a custom subagente, se debe tener en cuenta lo siguiente:

**Problema:** El usuario interactúa mediante comandos cortos (ej: `/funky-propose`). Un subagente custom no conoce estos atajos de teclado ni tiene cargado el catálogo de workflows en su memoria.

**Solución:** El Orquestador debe poseer una regla de una línea para traducir dinámicamente el comando en la ruta física antes de instanciar al subagente custom.

### Regla para el Orquestador:
> *"Cuando el usuario solicite delegar un workflow mediante un slash command (ej. `/funky-workflow`), si decides invocar un `subagente-verga`, debes traducir dicho comando a su ruta absoluta correspondiente (ej. `C:\Users\cb147\.gemini\config\global_workflows\funky-workflow.md`) y ordenarle al subagente en su prompt inicial que lea ese archivo usando `view_file`."*
Esto debe tener algún tipo de validación final para obligar al subagente a que de verdad tenga esa personalidad.

---

## 5. Comportamiento y Control de RequestFeedback (Artifact Review)

**Descubrimiento:** La propiedad `RequestFeedback: true` en la herramienta `write_to_file` funciona como un arnés de control e interrupción para solicitar la aprobación del humano antes de proceder en el flujo de ejecución.

* **Impacto en Contexto/Tokens:** Es insignificante. El payload de envío consume 1 o 2 tokens adicionales y el mensaje de retorno de la herramienta consume ~30 tokens. No ensucia el historial de la conversación ni genera tokens basura a largo plazo.
* **Criterios de Uso Decididos:**
  * **Evitar en Desarrollo Activo:** Mientras el humano y el Orquestador interactúan activamente, la aprobación interactiva bloquea e interrumpe el flujo de forma innecesaria. Se debe escribir directamente a disco (`RequestFeedback: false`).
  * **Permitir en Entregas y Hitos:** Usar únicamente cuando se generen artefactos al finalizar tareas asíncronas pesadas (cuando el humano no esté al pendiente) o en hitos críticos donde se requiera un visto bueno explícito antes de delegar a subagentes de desarrollo.
* **Comportamiento en Subagentes:** Los subagentes no deben forzar aprobaciones al humano de forma predeterminada para evitar la saturación de notificaciones. Su salida debe reportarse al Orquestador por canal de texto (Return Envelope) y este decide si requiere escalar una revisión de artefacto al usuario final.

Decisión final: Nunca usar esto, ya que hace mas pesada cada sesión, tomar en cuenta el punto 6 siguiente.

## 6. Control del Ciclo de Vida y Persistencia de Subagentes

**Problema:** Relanzar un subagente desde cero para aplicar correcciones solicitadas por el usuario sobre una tarea ya ejecutada genera un desperdicio innecesario de tokens en la inicialización (especialmente en subagentes tipo `self` que cargan ~3,000+ tokens de reglas iniciales). Además, el nuevo subagente carece del contexto de ejecución inmediato de lo que acaba de realizar su predecesor.

**Solución (Flujo de Persistencia en Modo Interactivo):**
El Orquestador debe administrar proactivamente el ciclo de vida de los subagentes en tres estados mediante herramientas de control:

1. **Estado Running (Ejecución):** El subagente procesa las tareas y escribe en el workspace.
2. **Estado Idle (Espera Persistente):** Al finalizar su tarea del workflow, el subagente reporta sus cambios al Orquestador vía `send_message` y se queda en espera. **El Orquestador NO debe matarlo de inmediato.**
3. **Flujo de Feedback:**
   * Si el usuario solicita cambios o correcciones en la implementación, el Orquestador despierta al subagente inactivo enviándole un mensaje con las observaciones (`send_message(Recipient: ID, Message: "Observaciones...")`). El subagente retoma su hilo con todo su contexto previo (workflows, variables de arranque y lógica) y aplica las correcciones ahorrando tokens.
   * Si el usuario aprueba los cambios de la fase actual, el Orquestador da por finalizada la tarea y destruye formalmente el subagente llamando a `manage_subagents(Action: "kill", ConversationIds: [ID])` para mantener limpio el gestor de procesos del sistema.
