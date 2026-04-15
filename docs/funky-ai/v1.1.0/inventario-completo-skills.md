# Inventario Forense Exhaustivo: Gentle AI Skills

A continuación, el análisis uno a uno de la capa de skills de Spec-Driven Development (SDD) original.

### 📂 `sdd-explore`
- **🎯 Propósito Core:** Investigar código, comparar enfoques y devolver un análisis estructurado ANTES de comprometerse a realizar un cambio (Feature/Bug).
- **⚙️ Mecánica Subyacente:** Lee el código de forma pasiva, evalúa la estructura actual, enumera las áreas afectadas y arma opciones (A/B) evaluando Pros, Contras y Complejidad. Luego persiste ese `exploration.md` en Engram u Openspec.  
- **♻️ Nivel de Portabilidad (Funky AI):** **Media.** Hay que podar toda la lógica de `mem_search/mem_save` de Engram, pero el workflow de crear `exploration.md` en disco calza perfecto como paso inicial del Orchestrator.
- **💎 Diamante Oculto:** El checklist `INVESTIGATE:` estructurado y la sección obligatoria "Ready for Proposal", que fuerza al agente a decir si falta info para tomar una decisión.

### 📂 `sdd-propose`
- **🎯 Propósito Core:** Traducir una exploración en una propuesta formal (`proposal.md`) de cambio, estableciendo la intención, el alcance (qué se hace y qué NO).
- **⚙️ Mecánica Subyacente:** Lee el output del `sdd-explore` y mapea los entregables. Limita estrictamente su propio output, usando viñetas y tablas.
- **♻️ Nivel de Portabilidad (Funky AI):** **Media.** Cambiar almacenamiento a disco puro.
- **💎 Diamante Oculto:** La imposición por prompt de que *toda propuesta debe tener un "Rollback Plan"* (Plan de Reversión) y la regla de "Size budget: under 400 words" (limitar palabrerío en las specs).

### 📂 `sdd-spec`
- **🎯 Propósito Core:** Redactar "Delta Specs" (Especificaciones Delta), o sea, los requerimientos formales y testables que serán AÑADIDOS, MODIFICADOS o ELIMINADOS.
- **⚙️ Mecánica Subyacente:** Traduce alcance en requerimientos usando palabras clave de la RFC 2119 (MUST, SHALL, SHOULD, MAY). Define escenarios GIVEN / WHEN / THEN por cada requerimiento.
- **♻️ Nivel de Portabilidad (Funky AI):** **Alta.** La generación de Markdown en ramas "Delta" es 100% textual y no requiere SQLite.
- **💎 Diamante Oculto:** El modelo Delta (añadidos, modificados, eliminados). Mantener un registro delta evita que el agente reescriba especificaciones monolíticas gigantes de cero, reduciendo tokens y alucinaciones.

### 📂 `sdd-design`
- **🎯 Propósito Core:** Elaborar un Documento de Diseño Técnico (`design.md`) detallando **CÓMO** se va a implementar lo que dijo el spec: componentes, esquemas de datos, interfaces y flujos.
- **⚙️ Mecánica Subyacente:** Obliga al agente a parsear la codebase real ANTES de diseñar. Usa tablas de Decisión de Arquitectura y traza qué archivos exactos se van a tocar.
- **♻️ Nivel de Portabilidad (Funky AI):** **Media.** Nuevamente, purgar calls a engram. 
- **💎 Diamante Oculto:** El formato de "Architecture Decisions" (Choice / Alternatives considered / Rationale) y el forzar el uso de diagramas de flujo ASCII simples para el Data Flow.

### 📂 `sdd-tasks`
- **🎯 Propósito Core:** Desglosar el diseño técnico en un checklist transaccional de pasos de implementación agendados (`tasks.md`).
- **⚙️ Mecánica Subyacente:** Lee el `design.md` y escupe viñetas agrupadas por Fases con formato jerárquico (`1.1`, `1.2`). 
- **♻️ Nivel de Portabilidad (Funky AI):** **Alta.** Solo requiere adaptar el prompt.
- **💎 Diamante Oculto:** El "Task Writing Rules". Prohíbe terminantemente viñetas vagas (ej. "Agregar auth"). Obliga a especificar acciones concretas testeables (ej. "Crear \`auth.go\` con \`ValidateToken()\").

### 📂 `sdd-apply`
- **🎯 Propósito Core:** Ser el "Coder". Es la instrucción que lee el checklist, implementa, marca `[x]` y sigue con el próximo.
- **⚙️ Mecánica Subyacente:** Detecta si el entorno es TDD mirando configuraciones. Si es TDD, entra en un loop maniático de: Escribe Test Fallando (RED) -> Escribe Código (GREEN) -> Refactoriza (REFACTOR) -> Marca Task Completa. 
- **♻️ Nivel de Portabilidad (Funky AI):** **Alta (en modo Worker).** Este es el núcleo de tu nuevo flujo Worker en Funky AI (cuando cerrás el chat de planeamiento y abrís el de ejecución).
- **💎 Diamante Oculto:** El árbol de decisión para autodetectar configuraciones de TDD y el flujo estricto "RED -> GREEN -> REFACTOR" embebido como ley para el coding (evita codear a lo loco sin tests si el repo los exige).

### 📂 `sdd-verify`
- **🎯 Propósito Core:** Servir de "Quality Gate" final. Demostrar con ejecución que el código armado hace match con las Specs iniciales.
- **⚙️ Mecánica Subyacente:** Escanea tareas pendientes. Obliga al uso de `run_command` para correr tests, builds, type-checks y coverage. Genera una Matriz de Cumplimiento conductual.
- **♻️ Nivel de Portabilidad (Funky AI):** **Baja / Media.** Depende fuertemente de herramientas autónomas de terminal. Para Funky AI hay que rutear esto de forma semimanual o que el Worker dispare los comandos y dumpee los logs en disco.
- **💎 Diamante Oculto:** La matriz de compliance per-scenario. *Un escenario solo se da por cumplido si hay un test específico en ejecución (resultado GREEN) que lo cubra, no si el agente dice "veo el código y anda"*.

### 📂 `sdd-archive`
- **🎯 Propósito Core:** Sincronizar las especificaciones Delta con el Spec principal y mover a historial. El "Merge" bibliotecario.
- **⚙️ Mecánica Subyacente:** Copia texto añadido a `specs/main`, reemplaza modificado y elimina dropeado. Mueve la carpeta de changes a un directorio de archive zippeando por fecha (YYYY-MM-DD).
- **♻️ Nivel de Portabilidad (Funky AI):** **Alta.** Manipulación de strings y mover carpetitas, ideal para operaciones directas en disco de Agent AI. 
- **💎 Diamante Oculto:** Actúa como un version control manual semántico. Impide la mutación perversa de specs largas fusionando incrementos granulares de manera quirúrgica.

### 📂 `sdd-init`
- **🎯 Propósito Core:** Inicializar en un repo en blanco la infraestructura SDD, configurando convenciones basándose en la app.
- **⚙️ Mecánica Subyacente:** Detecta el tech stack actual. Crea la estructura `openspec/` y autogenera un `config.yaml` adaptado.
- **♻️ Nivel de Portabilidad (Funky AI):** **Alta.** Esto es un puro scaffolder en disco. 
- **💎 Diamante Oculto:** La inyección automática de reglas por fase (`rules.specs`, `rules.apply`) basándose en los linters y test-frameworks que encuentra orgánicamente instalados en el target.

### 📂 `go-testing`
- **🎯 Propósito Core:** Knowledge base focalizado y ejemplos de patrones idiomáticos para pruebas en Go y Bubbletea (TUI).
- **⚙️ Mecánica Subyacente:** No es un skill orquestador, es un diccionario contextual que el agente debe leer. "Skill de Conocimiento".
- **♻️ Nivel de Portabilidad (Funky AI):** **100% Alta.** Es pasivo. 
- **💎 Diamante Oculto:** Su árbol de decisión simple ("¿Tiene side effects? -> Mock dependencias. ¿Complejo? -> Divide.") que encarrila brutalmente a modelos junior hacia código Senior.

### 📂 `_shared` (Lógicas Base Estructurales)
Debido a la densidad técnica y la importancia crítica de la carpeta `_shared`, desglosamos su contenido (convenciones, engram, contrato de persistencia y phase-common) en un análisis independiente.
👉 [Ver análisis detallado de la arquitectura de la carpeta _shared](inventario-shared-skills.md)
