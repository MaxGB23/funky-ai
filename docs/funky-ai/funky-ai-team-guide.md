# ⚡ Guía Rápida: Flujo de Trabajo "Funky AI"

**Para el Equipo de Desarrollo:**
Funky AI no es una herramienta para instalar, es una **disciplina de trabajo**. Lo usamos cuando tenemos modelos de lenguaje ultrapesados (como Gemini Pro) en entornos donde no hay APIs automáticas de sub-agentes. 

En lugar de que la IA orqueste en segundo plano, **vos sos el router API humano.**

---

## 🧠 Concepto Clave: "Chats Desechables"

El peor enemigo de la IA es la "Degradación de Contexto". Si usás un solo chat gigante de principio a fin, el bot va a mezclar código viejo con nuevo y a alucinar. Funky AI soluciona esto simulando una arquitectura de microservicios usando **chats**.

Acá hay solo tres elementos que tenés que entender:
1. **El Disco Duro (`openspec/`):** Es nuestra base de datos. Ninguna decisión técnica vital se queda flotando en el chat; se guarda en un `.md`.
2. **Chat Orquestador (El PM):** Un único chat destinado a planificar (Specs). Nunca programa código de producción inline.
3. **Chat Worker (El Albañil):** Un chat que creás virgen para cada tarea, le das contexto con un `.md`, lo ponés a escribir código, y cuando termina, **LO MATÁS**.

---

## 🛤️ El Flujo de Trabajo Paso a Paso

Supongamos que vamos a construir un login. El flujo es estricto:

### Paso 1: Planificación (El Orquestador)
1. Abrís un chat ("Orquestador Lógico").
2. **Si el proyecto ya existe:** Le arrobás el `@ORCHESTRATOR-STATE.md` para que recupere la memoria.
3. **Si es nuevo:** Le explicás la idea y usás comandos SDD (ej. *"Quiero hacer un login. Usá `/sdd-explore` y `/sdd-tasks`"*).
4. La IA pensará arquitectónicamente y **escribirá archivos físicos** como `spec.md` y `tasks.md` en tu carpeta de documentación.

### Paso 2: La Delegación (El Worker)
Acá está la magia de Funky AI:
1. **Dejás abierto el Chat Orquestador**, pero lo minimizás.
2. Abrís un **NUEVO CHAT completamente vacío** (Esto simula el despliegue de un Sub-agente).
3. Le pasás el contexto de la tarea etiquetando el plan con `@` (ej. `@docs/tasks.md`):  
   > *"Soy el Orquestador Humano. Leé `@docs/tasks.md`. Ejecutá exclusivamente el Paso 1 (UI del Login) y dejame un reporte."*
   > *NOTA CLAVE:* **YA NO ES NECESARIO** inyectar el `post-mortem.md` arrobándolo manualmente. Nuestro mecanismo interno `.agents/rules/engram-protocol.md` dispara alertas para que el Worker haga *Memory Polling* de su propio Engram de manera autónoma.
4. El bot codifica brutalmente las vistas y te genera un reporte en el disco.
5. **DOBLE RESTRICCIÓN:** El Worker tiene terminantemente prohibido parlotear. Al finalizar, está obligado a entregar la información empaquetada como un **"Return Envelope"** físico con los campos: `status`, `executive_summary`, `artifacts` (archivos tocados), `next_recommended` y `risks`.

### Paso 3: El Sacrificio (Cierre Burocrático)
1. **Cerrás y borrás el Chat Worker inmediatamente.** Cumplió su tarea vital y ahora el log de ese chat es "basura" cognitiva.
2. Volvés a maximizar tu **Chat Orquestador Original**.
3. Arrobás el reporte recién hecho:  
   > *"`@reporte-login.md` fue completado exitosamente. Actualizá el estado del flujo y decime con qué tarea seguimos."*

---

## 🚀 Workflow V1.2: CLI & Slash Commands

El ecosistema pegó un salto de calidad brutal. Ahora el Router Humano tiene un estándar dorado donde el CLI y el Chat operan en tándem perfecto, ahorrando la fricción de escribir testamentos para dar contexto. Es así de metódico:

1. **Humano en consola:** Ejecutá `funky phase explore` ➔ El CLI tira el template `.md` de la fase crudo al disco.
2. **Humano en chat de IA:** Tirá el comando `/sdd-explore` y arrobá (con `@`) el template que se acaba de crear. El agente entra directamente en *Modo Arquitecto* y lo llena.
3. **Humano en consola:** Ejecutá `funky phase design` ➔ Se inyecta el próximo template en la carpeta.
4. **Humano en chat de IA:** Tirá el comando `/sdd-propose` arrobando el archivo resultante de la fase anterior. El agente lee la base y arma el diseño técnico.

Con esta mecánica de un-dos (Consola-Chat), el modelo queda *psicológicamente pre-acondicionado* desde la tecla uno, cortando de raíz la burocracia de prompt. Es así de fácil, loco.

---

## ⚖️ Matriz de Decisión: ¿Automatizar o Manual?

Dado que ser el "Router Humano" en Funky AI requiere intervención constante (cerrar ventanas, pasar el `.md` a mano), **no debe convertirse en tu herramienta por defecto para todo**. Si tenés acceso a VS Code con Gentle AI nativo (automatizado con SQLite Engram) y modelos veloces/baratos (Claude Haiku, GPT-o mini), debés elegir sabiamente.

| Escenario de Código / Tarea | Entorno Recomendado | Justificación Arquitectónica |
| :--- | :--- | :--- |
| **Bugfixes aislados, Tareas CRUD** | **VS Code (Gentle AI 100% Auto)** | El costo de hacer el ruteo humano no vale la pena. Los agentes automáticos lo resuelven en *background* y guardan en base de datos. |
| **Scaffolding, Tests Unitarios, Docs** | **VS Code (Gentle AI 100% Auto)** | Son tareas de bajo esfuerzo cognitivo. Mantené tu ecosistema automatizado y rápido. |
| **Refactors Core, Migraciones Densas** | **Antigravity (Funky AI Manual)** | Necesitás un IQ masivo (como Gemini 3.1 Pro). Los modelos automatizados de bajo costo alucinarán y destruirán tu código. El esfuerzo de usar Funky AI te garantiza código grado *Senior*. |
| **Auditorías o Lógica Abstracta (AST)** | **Antigravity (Funky AI Manual)** | Resoluciones que requieren retener un millón de tokens en memoria RAM y cruzar decenas de archivos al mismo tiempo. |

> **Regla de Pulgar:** Automatizá todo en VS Code hasta que el modelo devuelva un error lógico, alucine o rompa la compilación. En ese momento, frenás todo, armás el respectivo `.md` (Openspec) y cruzás a Antigravity para demoler el problema usando Funky AI con armamento pesado.

---

## 🚫 Reglas de Oro del Equipo (Golden Rules)

- ❌ **Prohibido:** Programar todo un flujo entero en un solo hilo de conversacion gigante.
- ❌ **Prohibido:** Continuar usando un "Chat Worker" para una tarea diferente a la que fue asignado. Una vez que guardó el avance, se mata.
- ❌ **Prohibido:** Que un Worker arregle un bug silenciosamente. Todo bug no trivial debe documentarse en el reporte bajo `## Bugs Found`.
- ✅ **Obligatorio:** Todo conocimiento técnico nuevo de una sesión se baja a la carpeta `docs` en formato Markdown. Si solo lo sabe el chat, no existe.
- ✅ **Obligatorio al cerrar sesión:** Actualizar el `ORCHESTRATOR-STATE.md` con el estado actual del proyecto antes de matar el chat Orquestador. Es el único hilo que conectará la sesión de hoy con la de mañana.
