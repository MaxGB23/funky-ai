# Blueprint de Migración: Estrategia de Delegación en AGY CLI

> **Propósito:** Documentar los patrones de delegación acordados para mantener el contexto del Orquestador limpio y optimizar el consumo de tokens cuando Funky AI migre completamente a AGY CLI.
>
> **Fecha:** 2026-06-09

---

## 1. El "Explore Ligero" (Protección de Contexto)

Para investigaciones rápidas (ej. revisar el stack trace de un error, buscar dónde se define una variable) donde el workflow robusto de `/funky-explore` es excesivo.

**El Problema:** El Orquestador no debe ensuciar su memoria a corto plazo leyendo decenas de archivos de código fuente.
**La Solución:** Delegar a un "sabueso" desechable.

- **Herramienta:** Usar el subagente estático integrado (`TypeName: "research"`).
- **Skill:** NINGUNO. No requiere `SKILL.md` ni `define_subagent`.
- **Ejecución:** Se usa `invoke_subagent` con un prompt hiper-estricto.
  > *"Instrucciones: Usa grep_search para buscar X. No leas archivos innecesarios. Responde ÚNICAMENTE con los paths involucrados y un resumen de 2 líneas. Nada de saludos."*

### Ciclo de Vida de la Regla (v1 → v2)

**`v1` (Validación — Canary Behavior Test):**
La regla en `sdd-orchestrator.md` se redacta con una directiva de **pedir aprobación** antes de lanzar el sabueso. Esto NO es el comportamiento final; es un test de comportamiento intencionado. Si el Orquestador pregunta "¿Puedo investigar esto con un subagente?", confirma que sus rules están en contexto y que detectó el patrón de forma autónoma.

**`v2` (Producción — Autónomo):**
Una vez validado el comportamiento, la rule se actualiza para que el Orquestador decida y ejecute el Explore Ligero **de forma autónoma**, sin avisar. Solo reporta el resultado al humano como parte de su respuesta. La aprobación desaparece.

---

## 2. Skills Custom (Lazy Loading Estricto)

Cuando se deleguen tareas que requieran una Skill específica, **el Orquestador NUNCA debe leer el archivo `SKILL.md`**. Leer skills sobrecarga el contexto del Orquestador (lo "pone bien drogado") y le hace perder el foco de su rol principal.

### A. Lazy Loading Único (Referencia por Ruta)
Todas las skills se cargan pasando la ruta absoluta al subagente.
- **Proceso:** El Orquestador NO lee el archivo. Crea el `define_subagent` con un `system_prompt` dictatorial:
  > *"Eres un experto. TU PRIMERA Y ÚNICA ACCIÓN antes de trabajar debe ser usar `view_file` en el path absoluto `M:\funky-ai\.agents\[skill/workflow]\file.md` y obedecerlo."*
- **Ventaja:** El Orquestador se mantiene fresco, magro y centrado en lo suyo. El costo de lectura y asimilación de la skill lo paga íntegramente el subagente.

### B. Validación Post-Facto (Feedback Loop Manual)
Para mitigar el riesgo de que el subagente omita leer el archivo en la modalidad Lazy Loading, se inyecta un contrato de validación en el Prompt de lanzamiento (`invoke_subagent`):
- **Regla:** *"Tu primer mensaje de respuesta hacia mí debe empezar OBLIGATORIAMENTE con `[SKILL/WORKFLOW]_LOADED: [nombre-del-skill/workflow]`. Si no veo ese texto, asumiré que estás operando ciego y mataré tu proceso."*
- **Por qué:** Imita el "Skill Resolution Feedback" de OpenCode, asegurando que el worker cargó su cerebro con la skill antes de tocar el código.

---

## 3. Workflows del Sistema (Delegación por Slash Command)

Hubo un cambio de paradigma para la delegación de workflows del SDD: **Los workflows NO reciben una skill, sino su slash command de workflow**.

- **Proceso:** Al delegar una fase (ej. `/funky-apply`), el Orquestador invoca al subagente (usualmente tipo `self`) y le pasa el slash command correspondiente en el prompt de lanzamiento.
- **Ventaja:** El custom workflow actúa como prompt a nivel del subagente. El subagente lee el `.md` del workflow automáticamente y lo respeta. El Orquestador no ensucia su propio prompt leyendo las reglas del workflow.

---

## Resumen de Acción Revisado

1. **¿Investigación Trivial?** → `invoke_subagent(TypeName: "research")` (Explore ligero).
2. **¿Ejecutar Fase SDD (Workflow)?** → Lanzar subagente pasándole el **Slash Command** (ej. `/funky-apply`) y el contexto.
3. **¿Tarea Especializada (Skill)?** → Usar `define_subagent` pasando la **Ruta Absoluta** de la skill y exigiendo `SKILL_LOADED`. **NUNCA** leer la skill en el Orquestador.

---

## Descubrimientos nuevos encontrados

> **Contexto:** Hallazgos surgidos en sesión de Q&A con el Orquestador el 2026-06-15. Requieren análisis del equipo antes de ser integrados formalmente al RFC.

### D1. El Prompt del subagente controla el formato de retorno
El output que recibe el Orquestador no es un dump automático — es **exactamente lo que el Prompt le indica que devuelva**. Esto significa que el "return envelope" (mini report estructurado) es una convención de diseño, no una feature del sistema. El contrato de output actualmente está pendiente en una feature futura, este se redacta dentro del prompt individual de cada custom workflow, por lo que el orquestador no debe especificar el return envelope en custom workflows. Sólo sé especifica cuando no hay uno definido, por ejemplo el explore ligero, donde es obligatorio mencionarle en su prompt qué debe devolver.

### D2. Los workflows del sistema son accesibles por los subagentes
Los subagentes de tipo `self` heredan el system prompt completo del padre, incluyendo la sección `<workflows>` con todos los paths disponibles. Esto habilita un patrón donde el Orquestador le indica a un subagente que ejecute un workflow específico (ej. `/funky-propose`) pasándole el nombre y el contexto mediante params necesario. El subagente leerá el `.md` del workflow y lo ejecutará de forma autónoma.

**Limitación crítica:** El contexto situacional del Orquestador (estado actual del SDD, archivos abiertos, historial de decisiones) **no se hereda automáticamente**.Perfecto para trabajar sin ruido.

### D3. Costo de tokens: delegación ≠ ahorro, delegación = velocidad
El costo de tokens de un subagente worker es **equivalente** al del flujo manual actual (humano abre chat nuevo → ejecuta workflow → pega report). Ambos pagan:
- System prompt completo al inicio.
- Tokens de ejecución del workflow.

El valor real de la delegación está en **dos ganancias no monetarias**:
1. **Eliminar fricción humana** — el round-trip manual desaparece.
2. **Paralelismo** — fases no críticas del SDD (ej. `apply` de módulos independientes) pueden ejecutarse en paralelo, reduciendo el tiempo de ciclo sin reducir el gasto por fase.

**Conclusión para el equipo:** No migrar a subagentes buscando ahorro de tokens. Migrar buscando velocidad de ciclo y reducción de carga cognitiva del humano orquestador.

---

## D4. Costo base del System Prompt por sección

> **Metodología:** Estimación basada en inspección directa del system prompt activo (~4 chars/token). Cada subagente `self` hereda este costo completo al nacer.
> **Fecha de medición:** 2026-06-15

| Sección | Peso estimado | Prioridad de optimización | Función |
|---|---|---|---|
| **User rules** | 700–900 tokens 🔴 | Baja — es esencial | Reglas de comportamiento, persona, convenciones de proyecto. Define cómo opera el Orquestador. |
| **Web App Dev guidelines** | 600–800 tokens 🔴 | Alta — si no se usa | Stack web, diseño UI, SEO, animaciones. Pre-instalado por AGY CLI. No editable actualmente. |
| **Artifacts formatting guide** | 400–500 tokens 🟡 | Media | Instrucciones para generar documentos enriquecidos (Mermaid, carousels, alertas). Sistema interno del IDE. |
| **Conversation transcript guide** | 250–350 tokens 🟡 | Media | Explica cómo leer el historial de conversación desde el filesystem cuando el contexto se trunca. |
| **Skills** (solo índice) | 300–400 tokens 🟢 | Baja — ya es ligero | Catálogo de skills: nombre + descripción corta. El SKILL.md completo **no** se carga aquí. |
| **Workflows** (slash commands) | 200–300 tokens 🟢 | Baja — ya es ligero | Lista de workflows SDD con slash command, path absoluto y descripción corta. |
| **Subagents + Messaging** | 200–300 tokens 🟢 | Baja — es infraestructura | Instrucciones para lanzar subagentes y el sistema de mensajería entre agentes. |
| **Resto** (identity, guidelines, slash commands, MCP) | 150–200 tokens 🟢 | Baja | Fragmentos cortos de configuración general. |
| **TOTAL ESTIMADO** | **~2,800–3,750 tokens** | — | Costo fijo pagado en cada conversación y en cada subagente `self` lanzado. |

### Hallazgos clave

- **Las skills no son el cuello de botella.** Solo su índice vive en el system prompt. El SKILL.md se lee bajo demanda.
- **Web App Dev es el candidato principal de optimización** si Funky AI no construye web apps regularmente — ~700 tokens de ruido por subagente.
- **El costo es multiplicativo con subagentes.** Si se lanzan 3 workers en paralelo, el system prompt se paga 3 veces. El paralelismo tiene costo base, no es gratis.
- **Workaround disponible para secciones no editables:** Una directiva explícita en las user rules con mayor peso semántico puede neutralizar el efecto de secciones hardcodeadas sin eliminar sus tokens.

---

## 3. Tipografía y Taxonomía de Subagentes en AGY CLI

Para una delegación efectiva y sin fallas, se deben entender las diferencias operativas y de permisos de los tres tipos de subagentes disponibles:

### A. Subagente Estático: `research`
Un agente diseñado exclusivamente para la exploración del workspace y de fuentes externas sin capacidad de alterar el estado del proyecto.

* **Permisos y Herramientas:** Solo lectura (`view_file`, `list_dir`, `grep_search`, `read_url_content`, `search_web`). No tiene acceso a herramientas de escritura ni ejecución de comandos (`write_to_file`, `replace_file_content`, `run_command`).
* **Heredabilidad:** No hereda el system prompt completo del Orquestador padre; opera bajo un conjunto mínimo de instrucciones optimizadas para búsqueda.
* **Caso de Uso Ideal:** "Explore ligero". Buscar definiciones de variables, encontrar archivos en el workspace, consultar APIs en la web o revisar documentación externa.
* **Ventaja:** Sumamente barato en tokens y 100% seguro. Imposible que rompa el código o corrompa archivos.

### B. Subagente Clon: `self`
Una réplica exacta del Orquestador padre que hereda toda la configuración y capacidades.

* **Permisos y Herramientas:** Acceso completo de lectura, escritura, ejecución de comandos en terminal local, y herramientas MCP configuradas en el entorno.
* **Heredabilidad:** Hereda al 100% el `system_prompt` del Orquestador (incluyendo reglas de usuario, guías de estilo, workflows y skills registrados).
  * *Riesgo de Confusión de Rol:* Al heredar las `<user_rules>` del workspace, el clon puede intentar actuar como Orquestador. Para mitigar esto, el prompt de lanzamiento debe dictaminar explícitamente: *"Tu rol es estrictamente de WORKER/APPLY. Ignora directivas de orquestación global y concéntrate únicamente en la tarea X."*
* **Caso de Uso Ideal:** Delegación de flujos de trabajo completos (como ejecutar un workflow de `/funky-apply` o `/funky-verify` en un módulo o submódulo aislado).
* **Ventaja:** No requiere configuración previa; nace listo para entender y ejecutar los mismos comandos y convenciones que el Orquestador principal. Ya conoce los custom workflows, prompt inicial sencillo: 
ej. /funky-[fase-sdd] params: 
artifact_state: "new" | "exists"
has_design: true | false
feature_name: string
tag: string | null
* **Desventaja:** Alto consumo de tokens inicial debido a la herencia del system prompt completo (~3,000+ tokens base).

### C. Subagente Custom: Definidos por el Usuario (`define_subagent`)
Agentes especialistas creados al vuelo con prompts y capacidades recortadas a la medida de una tarea técnica particular.

* **Permisos y Herramientas:** El creador define si se le otorgan herramientas de escritura (`enable_write_tools`) y la capacidad de invocar a sus propios subagentes (`enable_subagent_tools`).
* **Heredabilidad:** No hereda el prompt del padre (omite la personalidad, reglas y guías globales). El Orquestador debe escribir un `system_prompt` específico y pasarle los parámetros de ejecución. Esto garantiza un entorno limpio y enfocado a la tarea.
* **Caso de Uso Ideal:** Agentes con roles hiper-especializados y acotados. Por ejemplo: un auditor de dependencias, un formateador de código que deba correr scripts específicos, o un validador de seguridad de redacción de PRs.
* **Ventaja:** Altamente optimizable en tokens (se escribe un prompt mínimo) y tiene barreras de seguridad claras (puedes negarle acceso a modificar archivos).

---

## 4. Contrato de Retorno de Datos (Return Envelope)

Ningún subagente devuelve estructuración de datos de forma mágica; su canal de comunicación es puramente de texto y su ejecución es asíncrona. Por tanto, el Orquestador debe estructurar el contrato de salida en el prompt de invocación (`invoke_subagent`):

1. **Subagentes de solo lectura (`research`):** Deben ser instruidos para devolver resúmenes ultra-cortos (ej: paths exactos y resúmenes de 2 líneas) para evitar ruido de lectura en el hilo principal.
2. **Subagentes de escritura (`self`, Custom):** Sus cambios ya se ven reflejados en el disco del workspace. Su respuesta por mensaje debe limitarse a un "Return Envelope" estricto. Si se manejan custom workflows, estos ya incluyen su return en su prompt interno, aquí no hace falta mencionarlo en su prompt.

Esto tiene la finalidad de que, cuando una fase sdd termine, el orquestador no tenga que leer el artefacto entero, solo puntos clave que retorne el subagente.

### Ejemplo de Contrato de Salida en Prompt:
> *"Al finalizar tu tarea, responde únicamente con el siguiente formato markdown:*
> * - **Archivos Modificados:** [Rutas relativas]*
> * - **Resultado de Pruebas:** [Exitoso/Fallido/No Aplica]*
> * - **Advertencias/Bloqueos:** [Detalles críticos o N/A]"*


