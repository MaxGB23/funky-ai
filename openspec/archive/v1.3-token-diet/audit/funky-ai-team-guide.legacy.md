# ÔÜí Gu├¡a R├ípida: Flujo de Trabajo "Funky AI"

**Para el Equipo de Desarrollo:**
Funky AI no es una herramienta para instalar, es una **disciplina de trabajo**. Lo usamos cuando tenemos modelos de lenguaje ultrapesados (como Gemini Pro) en entornos donde no hay APIs autom├íticas de sub-agentes. 

En lugar de que la IA orqueste en segundo plano, **vos sos el router API humano.**

---

## ­ƒºá Concepto Clave: "Chats Desechables"

El peor enemigo de la IA es la "Degradaci├│n de Contexto". Si us├ís un solo chat gigante de principio a fin, el bot va a mezclar c├│digo viejo con nuevo y a alucinar. Funky AI soluciona esto simulando una arquitectura de microservicios usando **chats**.

Ac├í hay solo tres elementos que ten├®s que entender:
1. **El Disco Duro (`openspec/`):** Es nuestra base de datos. Ninguna decisi├│n t├®cnica vital se queda flotando en el chat; se guarda en un `.md`.
2. **Chat Orquestador (El PM):** Un ├║nico chat destinado a planificar (Specs). Nunca programa c├│digo de producci├│n inline.
3. **Chat Worker (El Alba├▒il):** Un chat que cre├ís virgen para cada tarea, le das contexto con un `.md`, lo pon├®s a escribir c├│digo, y cuando termina, **LO MAT├üS**.

---

## ­ƒøñ´©Å El Flujo de Trabajo Paso a Paso

Supongamos que vamos a construir un login. El flujo es estricto:

### Paso 1: Planificaci├│n (El Orquestador)
1. Abr├¡s un chat ("Orquestador L├│gico").
2. **Si el proyecto ya existe:** Le arrob├ís el `@ORCHESTRATOR-STATE.md` para que recupere la memoria.
3. **Si es nuevo:** Le explic├ís la idea y us├ís comandos SDD (ej. *"Quiero hacer un login. Us├í `/sdd-explore` y `/sdd-tasks`"*).
4. La IA pensar├í arquitect├│nicamente y **escribir├í archivos f├¡sicos** como `spec.md` y `tasks.md` en tu carpeta de documentaci├│n.

### Paso 2: La Delegaci├│n (El Worker)
Ac├í est├í la magia de Funky AI:
1. **Dej├ís abierto el Chat Orquestador**, pero lo minimiz├ís.
2. Abr├¡s un **NUEVO CHAT completamente vac├¡o** (Esto simula el despliegue de un Sub-agente).
3. Le pas├ís el contexto de la tarea etiquetando el plan con `@` (ej. `@docs/tasks.md`):  
   > *"Soy el Orquestador Humano. Le├® `@docs/tasks.md`. Ejecut├í exclusivamente el Paso 1 (UI del Login) y dejame un reporte."*
   > *NOTA CLAVE:* **YA NO ES NECESARIO** inyectar el `post-mortem.md` arrob├índolo manualmente. Nuestro mecanismo interno `.agents/rules/engram-protocol.md` dispara alertas para que el Worker haga *Memory Polling* de su propio Engram de manera aut├│noma.
4. El bot codifica brutalmente las vistas y te genera un reporte en el disco.
5. **DOBLE RESTRICCI├ôN:** El Worker tiene terminantemente prohibido parlotear. Al finalizar, est├í obligado a entregar la informaci├│n empaquetada como un **"Return Envelope"** f├¡sico con los campos: `status`, `executive_summary`, `artifacts` (archivos tocados), `next_recommended` y `risks`.

### Paso 3: El Sacrificio (Cierre Burocr├ítico)
1. **Cerr├ís y borr├ís el Chat Worker inmediatamente.** Cumpli├│ su tarea vital y ahora el log de ese chat es "basura" cognitiva.
2. Volv├®s a maximizar tu **Chat Orquestador Original**.
3. Arrob├ís el reporte reci├®n hecho:  
   > *"`@reporte-login.md` fue completado exitosamente. Actualiz├í el estado del flujo y decime con qu├® tarea seguimos."*

---

## ­ƒÜÇ Workflow V1.2: CLI & Slash Commands

El ecosistema peg├│ un salto de calidad brutal. Ahora el Router Humano tiene un est├índar dorado donde el CLI y el Chat operan en t├índem perfecto, ahorrando la fricci├│n de escribir testamentos para dar contexto. Es as├¡ de met├│dico:

1. **Humano en consola:** Ejecut├í `funky phase explore` Ô×ö El CLI tira el template `.md` de la fase crudo al disco.
2. **Humano en chat de IA:** Tir├í el comando `/sdd-explore` y arrob├í (con `@`) el template que se acaba de crear. El agente entra directamente en *Modo Arquitecto* y lo llena.
3. **Humano en consola:** Ejecut├í `funky phase design` Ô×ö Se inyecta el pr├│ximo template en la carpeta.
4. **Humano en chat de IA:** Tir├í el comando `/sdd-propose` arrobando el archivo resultante de la fase anterior. El agente lee la base y arma el dise├▒o t├®cnico.

Con esta mec├ínica de un-dos (Consola-Chat), el modelo queda *psicol├│gicamente pre-acondicionado* desde la tecla uno, cortando de ra├¡z la burocracia de prompt. Es as├¡ de f├ícil, loco.

---

## ÔÜû´©Å Matriz de Decisi├│n: ┬┐Automatizar o Manual?

Dado que ser el "Router Humano" en Funky AI requiere intervenci├│n constante (cerrar ventanas, pasar el `.md` a mano), **no debe convertirse en tu herramienta por defecto para todo**. Si ten├®s acceso a VS Code con Gentle AI nativo (automatizado con SQLite Engram) y modelos veloces/baratos (Claude Haiku, GPT-o mini), deb├®s elegir sabiamente.

| Escenario de C├│digo / Tarea | Entorno Recomendado | Justificaci├│n Arquitect├│nica |
| :--- | :--- | :--- |
| **Bugfixes aislados, Tareas CRUD** | **VS Code (Gentle AI 100% Auto)** | El costo de hacer el ruteo humano no vale la pena. Los agentes autom├íticos lo resuelven en *background* y guardan en base de datos. |
| **Scaffolding, Tests Unitarios, Docs** | **VS Code (Gentle AI 100% Auto)** | Son tareas de bajo esfuerzo cognitivo. Manten├® tu ecosistema automatizado y r├ípido. |
| **Refactors Core, Migraciones Densas** | **Antigravity (Funky AI Manual)** | Necesit├ís un IQ masivo (como Gemini 3.1 Pro). Los modelos automatizados de bajo costo alucinar├ín y destruir├ín tu c├│digo. El esfuerzo de usar Funky AI te garantiza c├│digo grado *Senior*. |
| **Auditor├¡as o L├│gica Abstracta (AST)** | **Antigravity (Funky AI Manual)** | Resoluciones que requieren retener un mill├│n de tokens en memoria RAM y cruzar decenas de archivos al mismo tiempo. |

> **Regla de Pulgar:** Automatiz├í todo en VS Code hasta que el modelo devuelva un error l├│gico, alucine o rompa la compilaci├│n. En ese momento, fren├ís todo, arm├ís el respectivo `.md` (Openspec) y cruz├ís a Antigravity para demoler el problema usando Funky AI con armamento pesado.

---

## ­ƒÜ½ Reglas de Oro del Equipo (Golden Rules)

- ÔØî **Prohibido:** Programar todo un flujo entero en un solo hilo de conversacion gigante.
- ÔØî **Prohibido:** Continuar usando un "Chat Worker" para una tarea diferente a la que fue asignado. Una vez que guard├│ el avance, se mata.
- ÔØî **Prohibido:** Que un Worker arregle un bug silenciosamente. Todo bug no trivial debe documentarse en el reporte bajo `## Bugs Found`.
- Ô£à **Obligatorio:** Todo conocimiento t├®cnico nuevo de una sesi├│n se baja a la carpeta `docs` en formato Markdown. Si solo lo sabe el chat, no existe.
- Ô£à **Obligatorio al cerrar sesi├│n:** Actualizar el `ORCHESTRATOR-STATE.md` con el estado actual del proyecto antes de matar el chat Orquestador. Es el ├║nico hilo que conectar├í la sesi├│n de hoy con la de ma├▒ana.
