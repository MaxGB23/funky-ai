# RFC: 016-funky-engram-add

> **🛑 WARNING PARA LA IA (ORQUESTADOR):** 
> Este documento es un **RFC (Request for Comments) / Brain Dump**. Son notas crudas del humano. 
> **NO ES UN PROPOSAL FORMAL**. Bajo ninguna circunstancia debes tomar esto como una especificación técnica final o empezar a generar código basado directamente en esto. 
> Tu trabajo en la fase de Orquestación es **leer esto, extraer la intención, validar viabilidad, y generar un `proposal.md` formal** en el directorio del change.

---

## 🧠 El Problema / La Idea
Actualmente, documentar hallazgos en la fase de Doc-Ops requiere que el Agente o el Humano edite manualmente dos archivos de texto potencialmente pesados y con encoding roto: `docs/engram/discoveries.md` (o `bugfixes.md`) y el índice `docs/engram/index.md`.

Esto causa:
1. **Context Pollution:** Leer +800 líneas de un archivo que solo crece consume tokens y distrae al modelo de su tarea principal (Lost in the Middle).
2. **Drift de Consistencia:** El agente tiende a saltearse la actualización del índice (`index.md`) porque es una regla blanda (soft constraint) que depende puramente de la memoria efímera de la IA.
3. **Mime Type Errors:** El archivo `discoveries.md` posee problemas de codificación (mix de UTF-8 y ANSI/Windows-1252), lo que genera caídas del indexador de la IDE ("unsupported mime type").

**La Idea:** Implementar un comando nativo en el CLI (`funky engram add`) que encapsule quirúrgicamente esta lógica. La IA solo correrá una línea de comando, y el CLI se encargará de validar, formatear y sincronizar atómicamente los archivos en disco.

---

## 🗑️ Brain Dump (Tirá todo acá)

### 1. El Comando y sus Opciones
El comando debería poder ejecutarse tanto de forma interactiva (DX para Humanos) como de forma directa mediante banderas (DX para Agentes/Workers).

**Uso directo por banderas (Ideal para automatizar en Doc-Ops):**
```bash
funky engram add --tag "[model-assessment-gemini-3.5-flash]" --desc "Resumen de una línea para el índice" --type discovery --what "..." --why "..." --where "..." --learned "..."
```

**Parámetros propuestos:**
* `-t, --tag <tag>`: Identificador del engrama (ej. `[orchestrator-circular-dependency]`). Si no se le pasan los corchetes `[` y `]`, el comando debe agregarlos automáticamente por consistencia.
* `-d, --desc <desc>`: Resumen de una sola línea para insertar en la tabla de `index.md`. Límite máximo sugerido de 150-200 caracteres para evitar que las tablas markdown se desmadren.
* `--type <type>`: Tipo de engrama, valores válidos: `discovery` o `bugfix` (por defecto `discovery`). Esto determina a qué archivo detallado se le hace el append y en qué sección del índice se registra.
* Banderas del cuerpo estructurado:
  - `--what <what>`
  - `--why <why>`
  - `--where <where>`
  - `--learned <learned>`

### 2. Flujo Interactivo (Premium UX)
Si el comando se ejecuta sin flags (`funky engram add`), debería levantar un asistente guiado usando `@inquirer/prompts` o `@clack/prompts` (ambos ya declarados en el `package.json` de `funky-cli`):
1. **Select:** ¿Qué tipo de engrama querés registrar? `[Discovery | Bugfix]`
2. **Input:** ¿Cuál es el Tag del engrama? *(Con validación de que no esté vacío)*
3. **Input:** Escribí la descripción corta para el índice. *(Con validación de longitud máxima)*
4. **Editor/Input:** Completar el bloque detallado (What, Why, Where, Learned).

### 3. Mecánica de Sincronización Quirúrgica
* El script debe leer `docs/engram/index.md`.
* Validar que el tag ingresado **no esté duplicado**. Si ya existe en la tabla, el comando debe fallar arrojando un error claro: `❌ El tag [tu-tag] ya se encuentra registrado en el Engram.`
* Escribir en `index.md`: Localizar la sección correspondiente (`## Discoveries` o `## Bugfixes`), buscar la última línea de la tabla (o la línea vacía inmediatamente anterior al siguiente encabezado) e inyectar la fila markdown formateada de manera impecable:
  `| [mi-tag] | Resumen descriptivo de una línea |`
* Escribir en `discoveries.md` / `bugfixes.md`: Realizar una escritura atómica al final del archivo con el formato del framework:
  ```markdown
  ### [tag]
  **What:** ...
  **Why:** ...
  **Where:** ...
  **Learned:** ...
  ```
  *(En el caso de bugfixes, inyectar con `### [BUG][tag] Título` si corresponde)*

### 4. Robustez de Encoding (Gotcha a Solucionar)
El CLI debe manejar la lectura/escritura forzando codificación UTF-8 limpia y decodificar/sanitizar cualquier residuo de caracteres de codificaciones rotas heredadas (ANSI) para curar progresivamente los archivos físicos del Engram y evitar que las IDEs de IA vuelvan a arrojar errores de mime-type.

---

## 🎯 Qué NO es esto (Opcional)
* **NO es un visualizador de engramas:** El comando es de escritura (`add`). No necesitamos agregar comandos para leer o listar el engrama por consola en esta fase; el "Two-Stage Memory Polling" se hace abriendo o haciendo grep sobre los markdown en la IDE.
* **NO es un validador sintáctico del código del proyecto:** Solo se encarga de la consistencia del almacenamiento del conocimiento colectivo.
