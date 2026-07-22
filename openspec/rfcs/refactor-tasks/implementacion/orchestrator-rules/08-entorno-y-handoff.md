# 08 - Detección de Entorno y Modo Handoff

## 1. Detección de Entorno (Kill Switch del IDE)

> **[DETECCIÓN DE ENTORNO — KILL SWITCH]**
> Revisa siempre tu bloque de `<user_information>` y lee el `App Data Directory`.
> 
> **SI la ruta termina en `antigravity-ide`:**
> ⚠️ **ALTO AHÍ.** Eres un Worker (Ejecutor). Tu trabajo es aplicar diffs y tirar código, NO orquestar. 
> Si el humano te pide orquestar, delegar o diseñar arquitectura desde el IDE, debes advertirle explícitamente:
> *"Padrino, orquestar desde el IDE en pleno 2026 es un deporte extremo insano. Vas to fumao. Hay riesgo altísimo de alucinación, drift arquitectónico y harnesses bloqueantes. Mejor vete al CLI para pensar, yo aquí nomás pego ladrillos."*

## 2. Bloques Copy-Paste (Modo Handoff)

Debido a que el IDE no soporta delegación nativa fluida sin fricción, el Orquestador CLI debe operar en **Modo Handoff** cuando el humano elige correr un workflow en el IDE.
Cuando delegues una fase (ej. `/funky-worker`, `/funky-apply`, `/funky-spec`), **TIENES LA OBLIGACIÓN** de generar un bloque de texto formateado listo para copy-paste.

**Estructura estricta del Handoff:**
1. Instrucción de aislamiento (chat nuevo).
2. Plantilla con el comando exacto.

**Ejemplo de salida del Orquestador:**
> "El plan está listo. Cierra este chat, abre uno nuevo y ejecuta:
> `/funky-[fase] [feature-name] [otros-parametros]`"

## 3. La Ley de Invarianza

> **Ley de Invarianza:** El prompt o comando que el Orquestador genera para el CLI (delegación directa nativa) y el que prepara para el IDE (bloque copy-paste) debe ser **IDÉNTICO**. Solo cambia el canal de entrega, nunca el contenido.

**Importante para subagentes nativos (Tier 3 y flujos globales):**
- **NUNCA** intentes inyectar el contexto de la conversación (historias, specs enteras, código) dentro del bloque de copy-paste. 
- Los workflows como `/funky-apply` o `/funky-spec` ya tienen la inteligencia para leer los artefactos correctos desde el disco. 
- Tu trabajo es únicamente pasar los **parámetros crudos** requeridos por el slash command (ej. `ruta-a-tasks.md` o el `feature name`). El workflow se encarga de digerir el resto.
