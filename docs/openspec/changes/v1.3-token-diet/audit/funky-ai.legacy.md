# Funky AI: The "Manual-Agent" Protocol

**Funky AI** es un patr├│n de dise├▒o emp├¡rico, nacido como alternativa directa a *Gentle AI*. Est├í optimizado para entornos como Antigravity donde tienes acceso a modelos LLM gratuitos de m├íxima potencia (Ej. Gemini 3.1 Pro), pero **careces** de infraestructura as├¡ncrona de fondo (no hay bases de datos SQLite nativas ni APIs para spawnear sub-agentes invisibles).

En Funky AI, la m├íxima es: **El Disco Duro es el Servidor de Memoria, y el Humano es el Router API.**

---

## ­ƒÅù´©Å Los 3 Pilares del Ecosistema

### 1. El Falso Engram Estructurado (State Machine F├¡sica)
El viejo concepto de notas sueltas y archivos masivos arrobados se destruye. La doctrina nueva dicta que la memoria se guarda estructurada simulando una base de datos MCP y los agentes ya no leen ciegamente el contexto, previniendo la degradaci├│n cognitiva.

Dado que no existe `mem_save()` o `mem_search()` as├¡ncrono, operamos bajo **dos archivos can├│nicos** con reglas de acceso draconianas:

| Archivo | Equivalente Gentle AI | Prop├│sito |
|---|---|---|
| `docs/ORCHESTRATOR-STATE.md` | `mem_search()` | Estado actual del proyecto. Qu├® est├í hecho, qu├® falta, qu├® archivos clave leer. El Orquestador lo busca al arrancar cada sesi├│n. |
| `docs/post-mortem.md` | `mem_get_observation()` | Memoria de bugs hist├│ricos y resoluciones arquitect├│nicas. |

**La Doctrina MCP (Indexaci├│n Estructurada):** Toda escritura en `post-mortem.md` debe respetar irrevocablemente un esquema tabular emulado: `What` (qu├® hicimos), `Why` (causa/justificaci├│n), `Where` (archivos mutados) y `Learned` (casu├¡stica a vigilar).
**La Recuperaci├│n en 2 Pasos (Safe-Contexting):** Se proh├¡be a los Workers leer de golpe el post-mortem entero. Est├ín obligados a ejecutar un Memory Polling din├ímico: primero un `grep_search` masivo por los t├®rminos clave de la tarea, y solo previa validaci├│n de pertinencia, un `view_file` circunscrito.

### 2. Sub-Agentes Descartables (Manipulaci├│n de Chats)
Para simular el comportamiento as├¡ncrono y evitar la *degradaci├│n de contexto* masiva en un solo hilo:
- **Nace un Sub-Agente:** Se crea abriendo un chat 100% virgen en el IDE.
- **Se le inyecta el Contexto:** El "Router Humano" arrob├í (usando `@`) ├║nicamente los archivos `.md` estrictamente necesarios para su tarea.
- **Micro-Delegaci├│n:** Se le da una orden finita: *"Agente, sos el ejecutor de la Fase 2. Us├í estos archivos, escrib├¡ el c├│digo y dejame un reporte f├¡sico."*
- **Aislamiento/Muerte:** Una vez que el archivo f├¡sico est├í guardado, el chat se recicla o cierra. El "Agente" ha muerto, pero el ecosistema avanza con memoria renovada.

### 3. La Torre de Control (El Chat Orquestador)
Si el proyecto es inmenso, el usuario puede mantener **un ├║nico hilo de chat abierto fijo** que nunca programe. A ese chat inicial se le van adjuntando los reportes f├¡sicos que los "chats sub-agentes" van soltando en el disco, para que ayude al humano a llevar la cuenta de qu├® tarea del plan falta delegar.

#### Slash Commands de Contexto R├ípido
Para agilizar la comunicaci├│n con la Torre de Control y evitar la burocracia de armar prompts extensos, la doctrina ahora usa un sistema pre-acondicionante mediante **Slash Commands** en el chat (como `/sdd-explore` o `/sdd-propose`). Usarlos le inyecta instant├íneamente el contexto psicol├│gico al modelo, prepar├índolo para operar como Arquitecto sobre los templates f├¡sicos sin que el humano tenga que darle explicaciones redundantes.

---

## ­ƒñö Niveles de Complejidad (Tiers Funcionales)

El nivel de rigor burocr├ítico que asumas como Router Humano **debe ser directamente proporcional a la complejidad del proyecto**. Para evitar fatiga innecesaria (el anti-patr├│n de burocratizar tareas triviales), clasificamos el trabajo en 4 Tiers:

### Tier 0: Modo Conversacional (Zero SDD)
- **Caso de uso:** Lluvia de ideas, entendimiento de c├│digo legacy, debugging casual r├ípido, setups te├│ricos, y preguntas conceptuales.
- **Flujo:** Chat tradicional de VS Code o IDE. Le arroj├ís c├│digo, le pregunt├ís por qu├® falla, y lo cerr├ís.
- **Regla:** Se proh├¡be generar artefactos Markdown en disco porque la arquitectura no se va a ver alterada.
- **Costo Humano:** Nulo.

### Tier 1: Funky Lite (Compresi├│n Total)
- **Caso de uso:** Refactors menores aislados, endpoints sueltos, scripts paralelos.
- **Flujo:** Las Fases se comprimen. En **UN solo chat y en 1 solo prompt** le ped├¡s al bot que analice (`explore`), te d├® un camino (`proposal`) y haga las tareas (`tasks.md`). 
- **Costo Humano:** Bajo (requiere poca gesti├│n de carpetas).

### Tier 2: Funky Standard (Descompresi├│n Cognitiva B├ísica)
- **Caso de uso:** M├│dulos gruesos, extensiones legacy, arquitecturas compartidas (Ej: nuestro CLI o `color-highlight`).
- **Flujo:** Divid├¡s la l├│gica en 2 golpes f├¡sicos:
  1. `explore-propose.md` (Paso Arquitect├│nico).
  2. `design-tasks.md` (Paso T├íctico).
- **Costo Humano:** Medio (abre paso a la IA a "respirar" y planificar antes de escupir checkboxes).

### Tier 3: Funky Heavy (Descompresi├│n As├¡ncrona Total)
- **Caso de uso:** Reescribir un Core completo de producto, migraciones globales, infraestructuras complejas desde cero.
- **Flujo:** Cero compresi├│n. Emulaci├│n algor├¡tmica perfecta. Cada fase SDD (`explore`, `proposal`, `spec`, `design`, `tasks`) **es un archivo independiente y se genera en un Chat VIRGEN distinto**. 
- **Costo Humano:** Extremadamente Alto (sos literalmente el cartero y el bot cambia de chat a cada paso de la planificaci├│n). Pero garantiza **calidad 100% libre de alucinaciones** y rastreo forense total del ciclo de vida.

---

## ­ƒÜª Cu├índo pisar el freno: Chat vs SDD

Es fundamental para la salud mental del Dev Team saber cu├índo activar Funky AI y cu├índo seguir como de costumbre. **Usa este ├írbol de decisi├│n r├ípido:**

1. **┬┐El cambio involucra m├ís de 2 archivos o afecta el estado global (Redux, Zustand, Arquitectura)?**
   - *S├¡* Ô×ö Activar SDD (M├¡nimo **Tier 2**).
   - *No* Ô×ö Saltar a la pregunta 2.

2. **┬┐Sab├®s exactamente la l├¡nea de c├│digo que hay que tocar y c├│mo?**
   - *S├¡* Ô×ö **Tier 0** (Ojo, si el bug tardas m├ís de 10 mins en verlo, pasa autom├íticamente a Tier 1).
   - *No, no s├® ni por d├│nde empezar...* Ô×ö **Tier 1** (Para explorar en un chat ├║nico y generar un plan de acci├│n m├¡nimo).

3. **┬┐Estamos migrando un sistema obsoleto o levantando un proyecto desde cero ("Greenfield")?**
   - *S├¡* Ô×ö Parada obligatoria. Entramos en **Tier 3**. Nada de programar sin antes auditar con Falsos Engrams.

---

## ÔÜÖ´©Å Parametrizaci├│n del Sistema (`GEMINI.md` Global)

Para que Funky AI funcione, hay que **evitar que el IDE bloquee a sus modelos por creer que son "Gerentes"**.

**Reglas de tu `~/.gemini/GEMINI.md` Global:**
- **S├ì:** Debe contener el Perfil Psicol├│gico (Persona), el Tono y la Filosof├¡a (Clean Architecture).
- **S├ì:** Debe contener el mapeo de `Skills` si us├ís reglas nativas del IDE (ej, condicionales de autoloader).
- **NO (en `~/.gemini/GEMINI.md` global):** Este archivo NO debe contener restricciones de orquestaci├│n del tipo "solo deleg├í, no programes". Esas reglas anulan la capacidad de ejecuci├│n inline de cualquier Worker.
- **S├ì (en `.agents/rules/`):** El canal correcto para inyectar el protocolo SDD es mediante workspace rules. Esto a├¡sla las restricciones de orquestaci├│n al contexto del proyecto sin contaminar el perfil global del agente.

---

## ­ƒÄ» ┬┐Por qu├® usar Funky AI?
*Gentle AI* (en Claude Code/OpenCode) tiene un costo constante por inyecci├│n masiva de contexto en background manejado por APIs de pago. *Funky AI* es una infraestructura brutal y econ├│mica donde el programador cambia la automatizaci├│n m├ígica por un **control granular y expl├¡cito** de qu├® lee y qu├® ejecuta el sistema en cada chat temporal, forzando la pulcritud t├®cnica gratis.
