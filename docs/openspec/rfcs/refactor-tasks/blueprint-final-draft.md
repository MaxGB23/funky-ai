# Blueprint: Estrategia Definitiva de Delegación y Subagentes

> **Propósito:** Documento consolidado que unifica la taxonomía, ciclo de vida, estrategias de delegación de workflows y mitigación de contexto para los subagentes en AGY CLI.
> 
> **Fecha:** 2026-06-18

---

## 1. El Barrio: Taxonomía y Criterios de Selección

Para mantener una arquitectura limpia y evitar confusiones operativas, los agentes se clasifican en cuatro roles principales, cada uno con permisos y casos de uso específicos:

### 1.1 El Maistro (Orquestador Principal)
* **Rol:** El agente principal que interactúa con el humano. Diseña la arquitectura, toma decisiones de alto nivel, planifica el SDD y dirige a los subagentes.
* **Permisos:** Completos.
* **Tokens:** Carga el contexto mínimo necesario, no se ensucia las manos si no lo necesita, esto le otorga máxima precisión).

### 1.2 El Sabueso (`research` - Estático)
* **Rol:** Exploración rápida y desechable ("Explore ligero"). Buscar definiciones, leer stack traces o revisar documentación web sin alterar el proyecto.
* **Permisos:** Solo lectura (`view_file`, `grep_search`, `read_url_content`, etc). Sin acceso a escritura o terminal.
* **Ventaja:** Imposible que rompa el código. Barato en tokens.
* **Invocación:** `invoke_subagent(TypeName: "research")`.

### 1.3 El Chalán (`self` - Clon de Tareas Directas)
* **Rol:** Ejecutar tareas de desarrollo y escritura de código con el workflow `/funky-worker` (Operaciones Tier 1/2).
* **Permisos:** Completos (escritura, terminal, MCP).
* **ADN y Costo:** Hereda al 100% las `<user_rules>` y el prompt del Orquestador (~3,000+ tokens base). Nace sabiendo usar `pnpm` y conociendo los comandos de los workflows.
* **Invocación:** Usado para delegar implementaciones directas al disco.

### 1.4 El Chalán Vergas (`self` - Clon de Workflows Independientes)
* **Rol:** Ejecutar las fases pesadas y custom workflows del SDD de forma independiente (ej. `/funky-apply`, `/funky-verify`). Operaciones complejas de arquitectura (Tier 3/4).
* **Permisos:** Completos (escritura, terminal, MCP).
* **ADN y Costo:** Igual que el Chalán regular.
* **Invocación:** Usado para delegar Workflows completos mediante slash commands y parámetros.

### 1.5 El Chalán Fresón (`custom` - Draft, idea a futuro)
> ⚠️ No implementar aún. Concepto en evaluación.

* **Concepto:** Versión evolucionada del Chalán (1.3) y Chalán Vergas (1.4), pero implementada con `define_subagent` en lugar de `self`. Existiría en dos variantes:
  * **Fresón Regular** → Mismo rol que §1.3 (tareas directas con `/funky-worker`), pero sin heredar el ruido del prompt global.
  * **Fresón Vergas** → Mismo rol que §1.4 (workflows pesados del SDD), pero más limpio en tokens.
* **Ventaja vs `self`:** No hereda la personalidad, guías de web ni el catálogo de skills y workflows del Orquestador. Nace 100% enfocado.
* **Desventaja vs `self`:** No conoce los slash commands, el Orquestador debe traducir el comando a su ruta física antes de invocarlo. Ver mecánica en **§3.2**.

### 1.6 El Mierdillo (`custom` - Creado al vuelo)
* **Rol:** Tareas mecánicas, súper aisladas y especializadas (ej. ejecutar linters, formateo, auditoría de dependencias, aplicar un skill específico).
* **Permisos:** Definidos al momento de crear (`enable_write_tools`, etc).
* **ADN y Costo:** Nace completamente limpio, sin reglas de estilo ni persona, a menos que se le inyecten. Muy bajo consumo de tokens de arranque.
* **Invocación:** `define_subagent` con un prompt estricto.

---

## 2. Reglas de Nacimiento (Loading y Conflicto de Identidad)

### 2.1 Lazy Loading Estricto para Skills (Cero Drogar al Maistro)
Cuando se deleguen tareas que requieran una Skill específica, **el Orquestador NUNCA debe leer el archivo `SKILL.md`**. Leer skills sobrecarga el contexto del Orquestador y le hace perder foco.
* **Proceso:** El Orquestador crea el `self o define_subagent` y le pasa la ruta absoluta:
  > *"TU PRIMERA Y ÚNICA ACCIÓN debe ser usar `view_file` en el path `M:\funky-ai\.agents\skills\[skill]\SKILL.md` y obedecerlo."*
* **Feedback Loop:** Exigir en el prompt que su primer mensaje inicie con `SKILL_LOADED: [nombre]`, o de lo contrario matarlo por operar ciego.

### 2.2 Mitigación de Conflicto de Identidad (Pa' los Chalanes `self`)
**Problema:** Al heredar las reglas globales, el subagente `self` puede "creerse" Orquestador y empezar a planear redundancias.
**Solución:** 
1. No mencionar cosas en su prompt de invocación que activen triggers de orquestación.
2. Dictaminar explícitamente su rol en el prompt de lanzamiento: *"Tu rol es estrictamente de WORKER/APPLY. Ignora directivas de orquestación global y concéntrate únicamente en tu tarea."*

---

## 3. Delegación de Workflows (Slash Commands)

Hubo un cambio de paradigma para la delegación de las fases SDD: **Los workflows NO se delegan empaquetándolos como una skill, sino inyectando su slash command.**

### 3.1 Delegación por Slash Command en `self`
* **Proceso:** Al crear el Chalán (`self`), el Orquestador le pasa el slash command (ej. `/funky-apply`) y los parámetros del contexto:
  > *Params: `artifact_state: "new"`, `has_design: true`, `feature_name: "Auth"`*
* **Ventaja:** El workflow custom actúa como prompt a nivel del subagente. El Orquestador no ensucia su memoria leyendo el workflow; el Chalán lo lee automáticamente porque hereda la configuración de comandos.
* **Nota Crítica:** El contexto situacional no se hereda, se debe pasar explícitamente en los parámetros que el orquestador ya debe conocer en sus rules.

### 3.2 Traducción Dinámica (Mecánica del Chalán Fresón — §1.5)
> ⚠️ Solo aplica si se migra a `custom`. Actualmente usamos `self` porque ya conoce los slash commands sin traducción.

Un `define_subagent` nace sin el catálogo de workflows, por lo que no interpreta slash commands. Para que funcione, el Orquestador debe hacer una traducción antes de invocarlo:
* **Regla:** Convertir el slash command (ej. `/funky-apply`) a su ruta física absoluta (`C:\Users\cb147\.gemini\config\global_workflows\funky-apply.md`) e inyectarla en el prompt inicial del custom, ordenándole que la lea con `view_file`.
* **Validación:** Aplicar la misma estrategia de `[WORKFLOW]_LOADED:` para confirmar que cargó el workflow antes de ejecutar.

---

## 4. Ciclo de Vida, Retorno y Persistencia

### 4.1 El Contrato "Return Envelope"
Los subagentes no devuelven datos estructurados mágicamente. Para que el Orquestador no tenga que tragarse los artefactos completos generados por los workers:
* **Excepción Custom Workflows:** En el caso de las fases SDD, el return envelope **ya viene definido dentro del prompt interno del workflow**. El Orquestador NO necesita exigirlo.
  * **El caso de `funky-worker` (Unificación IDE/CLI):** Este workflow ya genera su return envelope en forma de un archivo físico (`report.md`). Para mantener la simplicidad y no bifurcar lógica, **se conserva la generación del archivo físico también en CLI**. Al terminar, el Chalán avisa que ya acabó, y el Orquestador usa `view_file` para leer ese `report.md`. Así nos libramos de pasar parámetros extra para forzar retornos en texto plano.
* **Para tareas de investigación o custom:** Exigir un formato Markdown estricto en la respuesta de texto (Paths, resúmenes de 2 líneas, advertencias) para evitar ruido.

### 4.2 Control de `RequestFeedback` (Prohibido en Desarrollo)
* **Decisión:** **NUNCA usar `RequestFeedback: true`** en la herramienta `write_to_file`. Detiene el flujo de la sesión y exige clics manuales del humano. La iteración debe ser rápida y silenciosa; las aprobaciones se manejan por chat, no bloqueando el disco.

### 4.3 Flujo de Vida y Persistencia (Idle -> Feedback -> Kill)
Relanzar un subagente desde cero para aplicar una corrección es tirar miles de tokens a la basura (especialmente con los ~3,000 de inicialización de un `self`).
1. **Running:** El Chalán/Chalán-vergas hace la chamba.
2. **Idle:** El Chalán termina, envía su "Return Envelope" por chat y se queda dormido. **EL ORQUESTADOR NO LO MATA DE INMEDIATO.**
3. **Flujo de Feedback:**
   * **Correcciones:** Si el humano pide ajustes, el Orquestador despierta al Chalán pasándole el feedback vía `send_message`. El Chalán revive con todo su contexto previo (ahorrando tokens) y corrige su código.
   * **Aprobado:** Una vez que la tarea o fase completa tiene la bendición del humano, el Orquestador llama a `manage_subagents(Action: "kill")` para limpiar la memoria y mandar al Chalán al más allá.
