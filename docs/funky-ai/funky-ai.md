# Funky AI: The "Manual-Agent" Protocol

**Funky AI** es un patrón de diseño empírico, nacido como alternativa directa a *Gentle AI*. Está optimizado para entornos como Antigravity donde tienes acceso a modelos LLM gratuitos de máxima potencia (Ej. Gemini 3.1 Pro), pero **careces** de infraestructura asíncrona de fondo (no hay bases de datos SQLite nativas ni APIs para spawnear sub-agentes invisibles).

En Funky AI, la máxima es: **El Disco Duro es el Servidor de Memoria, y el Humano es el Router API.**

---

## 🏗️ Los 3 Pilares del Ecosistema

### 1. El Falso Engram Estructurado (State Machine Física)
El viejo concepto de notas sueltas y archivos masivos arrobados se destruye. La doctrina nueva dicta que la memoria se guarda estructurada simulando una base de datos MCP y los agentes ya no leen ciegamente el contexto, previniendo la degradación cognitiva.

Dado que no existe `mem_save()` o `mem_search()` asíncrono, operamos bajo **dos archivos canónicos** con reglas de acceso draconianas:

| Archivo | Equivalente Gentle AI | Propósito |
|---|---|---|
| `docs/ORCHESTRATOR-STATE.md` | `mem_search()` | Estado actual del proyecto. Qué está hecho, qué falta, qué archivos clave leer. El Orquestador lo busca al arrancar cada sesión. |
| `docs/post-mortem.md` | `mem_get_observation()` | Memoria de bugs históricos y resoluciones arquitectónicas. |

**La Doctrina MCP (Indexación Estructurada):** Toda escritura en `post-mortem.md` debe respetar irrevocablemente un esquema tabular emulado: `What` (qué hicimos), `Why` (causa/justificación), `Where` (archivos mutados) y `Learned` (casuística a vigilar).
**La Recuperación en 2 Pasos (Safe-Contexting):** Se prohíbe a los Workers leer de golpe el post-mortem entero. Están obligados a ejecutar un Memory Polling dinámico: primero un `grep_search` masivo por los términos clave de la tarea, y solo previa validación de pertinencia, un `view_file` circunscrito.

### 2. Sub-Agentes Descartables (Manipulación de Chats)
Para simular el comportamiento asíncrono y evitar la *degradación de contexto* masiva en un solo hilo:
- **Nace un Sub-Agente:** Se crea abriendo un chat 100% virgen en el IDE.
- **Se le inyecta el Contexto:** El "Router Humano" arrobá (usando `@`) únicamente los archivos `.md` estrictamente necesarios para su tarea.
- **Micro-Delegación:** Se le da una orden finita: *"Agente, sos el ejecutor de la Fase 2. Usá estos archivos, escribí el código y dejame un reporte físico."*
- **Aislamiento/Muerte:** Una vez que el archivo físico está guardado, el chat se recicla o cierra. El "Agente" ha muerto, pero el ecosistema avanza con memoria renovada.

### 3. La Torre de Control (El Chat Orquestador)
Si el proyecto es inmenso, el usuario puede mantener **un único hilo de chat abierto fijo** que nunca programe. A ese chat inicial se le van adjuntando los reportes físicos que los "chats sub-agentes" van soltando en el disco, para que ayude al humano a llevar la cuenta de qué tarea del plan falta delegar.

---

## 🤔 Niveles de Complejidad (Tiers Funcionales)

El nivel de rigor burocrático que asumas como Router Humano **debe ser directamente proporcional a la complejidad del proyecto**. Para evitar fatiga innecesaria (el anti-patrón de burocratizar tareas triviales), clasificamos el trabajo en 4 Tiers:

### Tier 0: Modo Conversacional (Zero SDD)
- **Caso de uso:** Lluvia de ideas, entendimiento de código legacy, debugging casual rápido, setups teóricos, y preguntas conceptuales.
- **Flujo:** Chat tradicional de VS Code o IDE. Le arrojás código, le preguntás por qué falla, y lo cerrás.
- **Regla:** Se prohíbe generar artefactos Markdown en disco porque la arquitectura no se va a ver alterada.
- **Costo Humano:** Nulo.

### Tier 1: Funky Lite (Compresión Total)
- **Caso de uso:** Refactors menores aislados, endpoints sueltos, scripts paralelos.
- **Flujo:** Las Fases se comprimen. En **UN solo chat y en 1 solo prompt** le pedís al bot que analice (`explore`), te dé un camino (`proposal`) y haga las tareas (`tasks.md`). 
- **Costo Humano:** Bajo (requiere poca gestión de carpetas).

### Tier 2: Funky Standard (Descompresión Cognitiva Básica)
- **Caso de uso:** Módulos gruesos, extensiones legacy, arquitecturas compartidas (Ej: nuestro CLI o `color-highlight`).
- **Flujo:** Dividís la lógica en 2 golpes físicos:
  1. `explore-propose.md` (Paso Arquitectónico).
  2. `design-tasks.md` (Paso Táctico).
- **Costo Humano:** Medio (abre paso a la IA a "respirar" y planificar antes de escupir checkboxes).

### Tier 3: Funky Heavy (Descompresión Asíncrona Total)
- **Caso de uso:** Reescribir un Core completo de producto, migraciones globales, infraestructuras complejas desde cero.
- **Flujo:** Cero compresión. Emulación algorítmica perfecta. Cada fase SDD (`explore`, `proposal`, `spec`, `design`, `tasks`) **es un archivo independiente y se genera en un Chat VIRGEN distinto**. 
- **Costo Humano:** Extremadamente Alto (sos literalmente el cartero y el bot cambia de chat a cada paso de la planificación). Pero garantiza **calidad 100% libre de alucinaciones** y rastreo forense total del ciclo de vida.

---

## 🚦 Cuándo pisar el freno: Chat vs SDD

Es fundamental para la salud mental del Dev Team saber cuándo activar Funky AI y cuándo seguir como de costumbre. **Usa este árbol de decisión rápido:**

1. **¿El cambio involucra más de 2 archivos o afecta el estado global (Redux, Zustand, Arquitectura)?**
   - *Sí* ➔ Activar SDD (Mínimo **Tier 2**).
   - *No* ➔ Saltar a la pregunta 2.

2. **¿Sabés exactamente la línea de código que hay que tocar y cómo?**
   - *Sí* ➔ **Tier 0** (Ojo, si el bug tardas más de 10 mins en verlo, pasa automáticamente a Tier 1).
   - *No, no sé ni por dónde empezar...* ➔ **Tier 1** (Para explorar en un chat único y generar un plan de acción mínimo).

3. **¿Estamos migrando un sistema obsoleto o levantando un proyecto desde cero ("Greenfield")?**
   - *Sí* ➔ Parada obligatoria. Entramos en **Tier 3**. Nada de programar sin antes auditar con Falsos Engrams.

---

## ⚙️ Parametrización del Sistema (`GEMINI.md` Global)

Para que Funky AI funcione, hay que **evitar que el IDE bloquee a sus modelos por creer que son "Gerentes"**.

**Reglas de tu `~/.gemini/GEMINI.md` Global:**
- **SÍ:** Debe contener el Perfil Psicológico (Persona), el Tono y la Filosofía (Clean Architecture).
- **SÍ:** Debe contener el mapeo de `Skills` si usás reglas nativas del IDE (ej, condicionales de autoloader).
- **NO DEBE EXISTIR NI UN RASTRO DE RESTRICCIÓN DE ORQUESTACIÓN.** Las reglas que digan "Solo delegá, no programes" **anulan** este ecosistema entero. El agente ejecutando el chat debe sentirse completamente libre y capacitado para programar 1000 líneas *inline* si el contexto del chat es el de un "Agente Ejecutor".

---

## 🎯 ¿Por qué usar Funky AI?
*Gentle AI* (en Claude Code/OpenCode) tiene un costo constante por inyección masiva de contexto en background manejado por APIs de pago. *Funky AI* es una infraestructura brutal y económica donde el programador cambia la automatización mágica por un **control granular y explícito** de qué lee y qué ejecuta el sistema en cada chat temporal, forzando la pulcritud técnica gratis.
