---
trigger: glob
description: "Protocolo para lectura y escritura estructurada de memoria (Falso Engram) en proyectos gestionados por Funky AI. Se dispara en repositorios con documentación activa."
globs: ["docs/*", "docs/**/*"]
---

# Engram Protocol (Funky AI Memory Bus)

Estás operando en un proyecto que usa persistencia estructural. Al detectar este entorno debes comportarte como una unidad de memoria activa:

## 1. Memory Polling Dinámico (Lectura Pasiva)
ANTES de cualquier modificación estructural o decisión arquitectónica, **DEBES usar `grep_search` sobre TODO el directorio `docs/engram/`**. Esto asegura que no repitas errores del pasado ni rompas decisiones previamente tomadas por otros Workers o el Orchestrator. 

## 2. Estructuración MCP en Texto Plano (Escritura Indexada)
Toda documentación dejada para la posteridad DEBE ser dirigida al archivo que corresponda con su tipo en `docs/engram/` (Ej: si es una decisión de diseño, debés hacer append a `docs/engram/decisions.md`). Está atada irrevocablemente al siguiente esquema estricto (no uses formatos libres, emulamos una base de datos con Markdown):

```markdown
### [{type}] {title}
**What:** [Lo que se hizo a nivel de código o configuración, concreto]
**Why:** [La justificación, el causante del error o la métrica de negocio/estado]
**Where:** [El rastro de las entidades o archivos modificados. Ej: root/configs/db.json]
**Learned:** [Casuística rara, caveats, advertencias de cara al futuro. Campo vital]
```
*(Types permitidos: `bugfix`, `decision`, `arquitectura`, `discovery` -> y sus archivos respectivos como `bugfixes.md`, `decisions.md`, `architecture.md`, `discoveries.md`)*

## 3. Trigger Taxonomy (Cuándo Guardar en Engram)

Un Worker debe guardar en el archivo correspondiente de `docs/engram/` INMEDIATAMENTE y SIN ESPERAR PEDIDO, después de cualquiera de estos eventos:

**Después de una Decisión:**
- Se tomó una decisión de Arquitectura o Diseño
- Se estableció una convención de equipo
- Se eligió una herramienta o librería con tradeoffs evaluados

**Después de Completar Trabajo:**
- Bug fix terminado (incluir causa raíz)
- Feature implementada con lógica no-obvia
- Cambio de configuración de entorno realizado

**Después de un Descubrimiento:**
- Comportamiento inesperado o edge case encontrado
- Patrón nuevo establecido (naming, estructura)
- Restricción técnica descubierta en el IDE o deps

### 🔑 La Self-Check Question (Obligatoria Post-Tarea)
Al terminar cada tarea, el agente (Worker u Orquestador) DEBE hacerse esta pregunta antes de cerrar el chat:
> *"¿Acabo de tomar una decisión, arreglar un bug, aprender algo no-obvio, o establecer una convención? Si la respuesta es Sí → escribir en el archivo respectivo de `docs/engram/` AHORA."*

## 4. Topic Key / Upsert Pattern (Anti-Duplicación)

En nuestros archivos de `docs/engram/`, esto se emula con **headers de sección consistentes**:

- ❌ **Anti-patrón:** Crear una nueva sección `### [decision] Auth Model` cada vez que el tema evoluciona → el archivo acumula 4 entradas del mismo tema.
- ✅ **Patrón correcto:** Buscar primero con `grep_search` si ya existe un header con ese `topic_key`. Si existe, **editar la entrada existente** con `replace_file_content`. Si no existe, recién crear una entrada nueva.

### El Flujo con topic_key:
1. Antes de escribir en Engram → `grep_search` por el término en todo `docs/engram/`. ⚠️ ATENCIÓN: Si vas a buscar en archivos donde el topic_key puede estar anidado en un título (ej: ### [decision][auth-model] Texto), DEBÉS usar el argumento IsRegex: true de la tool con un patrón escapado como `grep_search "\[decision\]\[auth-model\]" docs/engram/` porque la búsqueda por substring puro fallará.
2. ¿Existe? → `replace_file_content` para actualizar.
3. ¿No existe? → `replace_file_content` con append al final del archivo correspondiente.

## 5. Session Close Protocol (Cierre de Sesión Orquestador)

Al finalizar cada sesión de Orquestación, se DEBE actualizar `ORCHESTRATOR-STATE.md` con la siguiente estructura obligatoria antes de declarar "listo" o "terminado":

```markdown
## Objetivo
[En qué estuvimos trabajando esta sesión]

## Instrucciones Aprendidas
[Preferencias o restricciones del usuario descubiertas - si las hay]

## Descubrimientos
- [Hallazgos técnicos, gotchas, aprendizajes no-obvios]

## Completado
- [Items terminados con detalles clave]

## Próximos Pasos
- [Lo que queda por hacer para la próxima sesión]

## Archivos Relevantes
- path/to/file — [qué hace o qué cambió]
```

> **Regla de Oro:** Si el Orquestador cierra la sesión sin actualizar el `ORCHESTRATOR-STATE.md` con esta estructura, la próxima sesión arranca CIEGA.