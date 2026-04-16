# La Filosofía de Funky AI

## 🧬 Origen e Inspiración: El Modelo Gentle AI

Para entender Funky AI, primero hay que comprender la maquinaria real de su mayor influencia: **Gentle AI** (cuyo prompt maestro está preservado en `docs/gentle-ai/gentle-persona.md`).

Gentle AI no es un chatbot. Es un **Sistema de Actores Distribuidos** sobre un IDE. Su funcionamiento interno tiene tres pilares técnicos exactos:

### Pilar A: El Orquestador Puro (Hard Stop Rule)
El Orquestador de Gentle AI tiene una restricción absoluta y sin excepciones: **NO toca código, especificaciones, ni archivos de proyecto directamente**. Los únicos archivos que puede leer directamente son tres: `git status/log`, resultados del Engram y el estado de tareas pendientes. Todo lo demás es delegado a sub-agentes. 
> *"Two edits across two files is still execution work." — gentle-persona.md*

### Pilar B: Delegación Asíncrona por Defecto (`delegate` > `task`)
Gentle AI opera con dos modalidades de delegación. La regla es `delegate` (background, asíncrono) por defecto absoluta. Solo usa `task` (bloqueante) cuando el Orquestador necesita imperiosamente el resultado antes de su siguiente acción. Esto garantiza que el Orquestador siga coordinando sin bloquearse esperando que un `grep` termine.

### Pilar C: El Engram de 2 Pasos (Mem Search + Mem Get)
Para no saturar el contexto con bloques masivos de texto, Gentle AI consulta su memoria SQLite con protocolo MCP en exactamente 2 pasos:
1. `mem_search(query)` → retorna un ID de observación (índice liviano)
2. `mem_get_observation(id)` → extrae el contenido completo (solo si el ID es relevante)

Los Sub-Agentes **nacen con contexto CERO**. El Orquestador es el único que hace `mem_search` y les inyecta en el prompt de lanzamiento exactamente lo que necesitan (rutas de skills, topic keys). Los sub-agentes no buscan nada por sí mismos: reciben instrucciones precisas o nada.

---

## 🚀 La Adaptación: Nacimiento de Funky AI

Funky AI toma la Filosofía de Gentle AI (memoria estructurada, separación de responsabilidades, ejecución predecible) pero la adapta para sobrevivir en un ecosistema diferente y sumamente ventajoso: **El IDE Antigravity**.

### La Ventaja Injusta (¿Por qué Antigravity?)
Antigravity proporciona acceso nativo a modelos fundacionales de razonamiento masivo (familia Gemini) de forma **totalmente gratuita**. Esto es algo que VSCode con OpenCode no puede ofrecer a esta escala sin costos por token.

### El Trade-Off (El Costo de Orquestación)
Antigravity es seguro por diseño. No expone las APIs que permiten que un bot spawnee sub-agentes en background ni ejecute scripts invisibles. Por ende, **Funky AI establece un contrato táctico de 3 sustituciones**:

| Gentle AI (Automático) | Funky AI (Manual-Asistido) |
|---|---|
| Base de datos SQLite + MCP (`mem_save`) | Archivos Markdown planos (`docs/post-mortem.md`) |
| Engram de 2 pasos: `mem_search` + `mem_get_observation` | Engram de 2 pasos: `grep_search` + `view_file` |
| Delegación autónoma vía `delegate` en background | Router Humano abre pestañas de chat manualmente |

### El Axioma Final
En Funky AI, la intervención del desarrollador (copiar Return Envelopes, abrir chats de Worker) es **requerida por diseño de seguridad**. Debido a este "impuesto burocrático":

> **Funky AI no se enciende para scripts desechables. Es un framework que el Humano elige activar en Proyectos de Ingeniería Reales**, donde la calidad del razonamiento de modelos Gemini de última generación y la gratuidad absoluta superan con creces el costo del enrutamiento manual.
