# The Funky AI Journey

Este documento narra la evolución de Funky AI, recopilando las lecciones estructurales y filosóficas aprendidas iteración tras iteración. Sirve como registro histórico de nuestras decisiones arquitectónicas.

## [v1.0 - v1.6] La consolidación de SDD y la disciplina arquitectónica

*(Auditoría consolidada en v1.6)*

### 1. Evolución de la Arquitectura de Memoria (Engram & Sharding)
*   **v1.1 - Memory Polling Dinámico:** Descubrimos que depender del humano para arrobar archivos como `@post-mortem.md` no era escalable. Implementamos heurísticas pasivas: si un Worker ve `docs/`, ejecuta `grep_search` proactivamente. Nació el concepto de *Zero-Prompt Context*.
*   **v1.2 - Memory Sharding:** El archivo monolítico de memoria (post-mortem) causaba fatiga de contexto y Token Bloat. Lo "hicimos explotar" particionándolo en dominios: `bugfixes.md` y `discoveries.md` dentro de `docs/engram/`. Las búsquedas segmentadas ahorran tokens.
*   **Tipado de Memoria (MCP Style):** Adoptamos un formato estricto (What/Why/Where/Learned) que transformó el engram de un bloc de notas libre a una base de datos NoSQL basada en texto.

### 2. Herramientas y Control: Funky CLI
*   **v1.2 a v1.4 - El nacimiento de `funky-cli`:** Dejamos de copiar y pegar a pedal. Construimos una CLI (`funky init`, `funky phase`) para inicializar proyectos inyectando templates del ciclo SDD (Spec-Driven Development) directo al disco. Esto nos dio un control arquitectónico inquebrantable, estandarizando cada fase del ciclo de vida.
*   **Archivos físicos > Variables de memoria:** La CLI obliga a usar archivos físicos `.md` (`explore.md`, `design.md`, etc.), liberando la memoria en la ventana de chat y estableciendo el disco duro local (`openspec`) como la única fuente de verdad.

### 3. SDD & El Protocolo Worker Handoff
*   **El Humano como Router:** Ante la incapacidad de hacer spawn de agentes en background de forma nativa en este entorno local, formalizamos el Worker Handoff (v1.3). El flujo se separó en **Modo Orquestador** (Planificador arquitectónico, sin escribir código fuerte) y **Modo Worker** (Ejecutor rudo guiado por especificaciones estrictas).
*   **Return Envelope:** Imposibilitamos a los Workers divagar. Al terminar una tarea, devuelven un sobre de estado cerrado (`status`, `artifacts`, `risks`, etc.) para cerrar el ciclo de manera determinista y predecible.

### 4. Testing Sólido y CI/CD (La Barrera de Calidad en v1.6)
*   **TDD y Funciones Puras:** La consolidación técnica (v1.6) se dio a través de Vitest. Aprendimos que para testear un CLI (`commander`) no se debe mockear el framework, sino extraer la lógica en **funciones puras**. Esto hizo el código inquebrantable.
*   **Seguridad en Pipelines:** Implementamos GitHub Actions bajo estándares restrictivos (SecOps). Reemplazamos las sugerencias por defecto (`npm ci`) por `pnpm install --frozen-lockfile` y versionado explícito (`4.1.4` sin caret) en Vitest y PNPM. El tooling estricto sobrevive; la magia, no.

### Conclusión Central: CONCEPTS > CODE
El camino de v1.0 a v1.6 reafirma nuestra filosofía fundamental: **Conceptos sobre Código**. Construimos un ecosistema de automatización dura operando puramente sobre archivos de texto planos, funciones puras y convenciones disciplinadas, demostrando que no se necesitan frameworks oscuros ni bases de datos complejas para orquestar agentes. La disciplina arquitectónica es todo lo que cuenta.
