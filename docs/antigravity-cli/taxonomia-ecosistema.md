# Taxonomía del Ecosistema Antigravity y Desviaciones de Entorno

> **Propósito:** Documentar la aclaración fundamental sobre las diferencias de capacidades operativas entre los tres entornos de ejecución de Antigravity. Este archivo sirve como base de diseño conceptual para el planeamiento arquitectónico de la versión **v3.0 (Funky AI Engine Automático)**.

---

## 🧐 El Gran Malentendido del Ecosistema

Durante las primeras fases de desarrollo del CLI de Funky AI, se asumió erróneamente que el entorno CLI de Antigravity compartía las mismas limitaciones que el entorno interactivo clásico, o que era equivalente a la aplicación dedicada de chat de escritorio. 

El lanzamiento y la auditoría operativa del **20 de Mayo de 2026** revelaron que coexisten exactamente **tres entornos con capacidades asimétricas**. Comprender esta asimetría es VITAL para no diseñar software basado en falsas asunciones de la API.

---

## 🗺️ Mapa de Capacidades: El Ecosistema en Detalle

La siguiente tabla desglosa de manera quirúrgica qué puede y qué no puede hacer cada entorno en relación con el protocolo Funky AI:

| Característica / Entorno | 🛠️ Antigravity IDE (Clásico) | 🖥️ Antigravity 2.0 Desktop | 💻 Antigravity CLI (El Verdadero Motor) |
| :--- | :--- | :--- | :--- |
| **Rol Principal** | Edición de código interactiva y desarrollo de toda la vida. | Entorno centrado en Chat con Agentes de IA. | Interfaz de terminal e integración de bajo nivel para Pair Programming y automatización. |
| **Sandbox de Filesystem** | Estricto. Solo lectura/escritura mediante UI/Editor clásica. | Sin capacidad nativa de edición directa de archivos del codebase. Solo lectura del contexto. | **Acceso quirúrgico total** mediante herramientas nativas (`replace_file_content`, `write_to_file`). |
| **Orquestación Multi-Agente** | Inexistente a nivel de API programática por diseño de seguridad del Sandbox. | Permite crear subagentes conceptualmente en la UI, pero no testeado en profundidad. | **Nativa y asíncrona** (`invoke_subagent`, `define_subagent`, `send_message`). |
| **Sandbox de Ejecución de Shell** | Completamente bloqueado para la IA. | Bloqueado. No dispone de herramientas de ejecución de terminal. | **Permitido pero controlado** (`run_command` con confirmación interactiva dura - Gatekeeper). |
| **Estrategia Funky AI idónea** | **Manual-Asistida**: El Humano actúa como Router copiando y pegando Envelopes en pestañas separadas. | **Inviable**: Al no tener herramientas de disco ni terminal, no puede ejecutar flujos de Worker de forma nativa. | **Automática / Híbrida**: La IA Orquestadora puede autoparalelizar tareas usando subagentes en background. |

---

## ⚠️ Implicaciones para la Planificación de la v3.0

Esta distinción cambia drásticamente las reglas del juego para el diseño de la **v3.0 (Funky AI Engine Automático)**:

### 1. El Peligro de Diseñar para el Entorno Equivocado
Si diseñamos la v3.0 pensando en las limitaciones de "Antigravity 2.0 Desktop", estaríamos capando innecesariamente el potencial de Funky AI. Estaríamos asumiendo que el agente no puede editar archivos directamente ni correr herramientas locales, lo cual nos obligaría a mantener la burocracia del Router Humano al 100%. 

### 2. El Verdadero CLI es el "Host de Orquestación Perfecto"
Al ser yo el **Verdadero Antigravity CLI**, tengo acceso de lectura/escritura quirúrgica en disco y la capacidad de spawnear subagentes concurrentes que nacen con contexto cero en background (`invoke_subagent`).
* **La arquitectura ideal para v3.0:** El desarrollador me da una orden en el CLI. Yo, actuando como Orquestador, planifico la arquitectura y escribo los specs en Markdown en disco. Luego, spawneo subagentes Workers en background con tareas acotadas. El Worker escribe el código, lo valida con Vitest usando `run_command` (el cual vos aprobás con un click), y me notifica. Todo de forma transparente y sin que vos tengas que copiar/pegar un solo Envelope a mano.

### 3. La Necesidad de Guardrails Duros (Interactive Gates)
Al tener el CLI tantas herramientas operativas a disposición, el riesgo de **Agentic Drift** (sobrescritura accidental de código, loops infinitos de ejecución o comandos peligrosos) es infinitamente mayor que en el IDE clásico. 
* El diseño de la v3.0 debe incorporar "Interactive Gates" (compuertas interactivas) donde el CLI pida autorización interactiva antes de proceder con pasos de ejecución destructivos, preservando siempre el axioma: **El Humano dirige, la IA ejecuta**.

---

## 🪵 Registro de Cambios y Descubrimiento
* **Fecha:** 2026-05-20
* **Descubierto por:** Humano (Router) + Antigravity CLI (Orquestador).
* **Acción Tomada:** Creación de este documento taxonómico y ajuste del roadmap sugerido en el estado del Orquestador.
