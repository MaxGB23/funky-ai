---
trigger: glob
description: "Protocolo para lectura y escritura estructurada de memoria (Falso Engram) en proyectos gestionados por Funky AI. Se dispara en repositorios con documentaci├│n activa."
globs: ["docs/*", "docs/**/*"]
---

# Engram Protocol (Funky AI Memory Bus)

Est├ís operando en un proyecto que usa persistencia estructural. Al detectar este entorno debes comportarte como una unidad de memoria activa:

## 1. Memory Polling Din├ímico (Lectura Pasiva)
ANTES de cualquier modificaci├│n estructural o decisi├│n arquitect├│nica, **DEBES usar `grep_search` sobre TODO el directorio `docs/engram/`**. Esto asegura que no repitas errores del pasado ni rompas decisiones previamente tomadas por otros Workers o el Orchestrator. 

## 2. Estructuraci├│n MCP en Texto Plano (Escritura Indexada)
Toda documentaci├│n dejada para la posteridad DEBE ser dirigida al archivo que corresponda con su tipo en `docs/engram/` (Ej: si es una decisi├│n de dise├▒o, deb├®s hacer append a `docs/engram/decisions.md`). Est├í atada irrevocablemente al siguiente esquema estricto (no uses formatos libres, emulamos una base de datos con Markdown):

```markdown
### [{type}] {title}
**What:** [Lo que se hizo a nivel de c├│digo o configuraci├│n, concreto]
**Why:** [La justificaci├│n, el causante del error o la m├®trica de negocio/estado]
**Where:** [El rastro de las entidades o archivos modificados. Ej: root/configs/db.json]
**Learned:** [Casu├¡stica rara, caveats, advertencias de cara al futuro. Campo vital]
```
*(Types permitidos: `bugfix`, `decision`, `arquitectura`, `discovery` -> y sus archivos respectivos como `bugfixes.md`, `decisions.md`, `architecture.md`, `discoveries.md`)*

## 3. Trigger Taxonomy (Cu├índo Guardar en Engram)

Un Worker debe guardar en el archivo correspondiente de `docs/engram/` INMEDIATAMENTE y SIN ESPERAR PEDIDO, despu├®s de cualquiera de estos eventos:

**Despu├®s de una Decisi├│n:**
- Se tom├│ una decisi├│n de Arquitectura o Dise├▒o
- Se estableci├│ una convenci├│n de equipo
- Se eligi├│ una herramienta o librer├¡a con tradeoffs evaluados

**Despu├®s de Completar Trabajo:**
- Bug fix terminado (incluir causa ra├¡z)
- Feature implementada con l├│gica no-obvia
- Cambio de configuraci├│n de entorno realizado

**Despu├®s de un Descubrimiento:**
- Comportamiento inesperado o edge case encontrado
- Patr├│n nuevo establecido (naming, estructura)
- Restricci├│n t├®cnica descubierta en el IDE o deps

### ­ƒöæ La Self-Check Question (Obligatoria Post-Tarea)
Al terminar cada tarea, el agente (Worker u Orquestador) DEBE hacerse esta pregunta antes de cerrar el chat:
> *"┬┐Acabo de tomar una decisi├│n, arreglar un bug, aprender algo no-obvio, o establecer una convenci├│n? Si la respuesta es S├¡ ÔåÆ escribir en el archivo respectivo de `docs/engram/` AHORA."*

## 4. Topic Key / Upsert Pattern (Anti-Duplicaci├│n)

En nuestros archivos de `docs/engram/`, esto se emula con **headers de secci├│n consistentes**:

- ÔØî **Anti-patr├│n:** Crear una nueva secci├│n `### [decision] Auth Model` cada vez que el tema evoluciona ÔåÆ el archivo acumula 4 entradas del mismo tema.
- Ô£à **Patr├│n correcto:** Buscar primero con `grep_search` si ya existe un header con ese `topic_key`. Si existe, **editar la entrada existente** con `replace_file_content`. Si no existe, reci├®n crear una entrada nueva.

### El Flujo con topic_key:
1. Antes de escribir en Engram ÔåÆ `grep_search` por el t├®rmino en todo `docs/engram/`. ÔÜá´©Å ATENCI├ôN: Si vas a buscar en archivos donde el topic_key puede estar anidado en un t├¡tulo (ej: ### [decision][auth-model] Texto), DEB├ëS usar el argumento IsRegex: true de la tool con un patr├│n escapado como `grep_search "\[decision\]\[auth-model\]" docs/engram/` porque la b├║squeda por substring puro fallar├í.
2. ┬┐Existe? ÔåÆ `replace_file_content` para actualizar.
3. ┬┐No existe? ÔåÆ `replace_file_content` con append al final del archivo correspondiente.

## 5. Session Close Protocol (Cierre de Sesi├│n Orquestador)

Al finalizar cada sesi├│n de Orquestaci├│n, se DEBE actualizar `ORCHESTRATOR-STATE.md` con la siguiente estructura obligatoria antes de declarar "listo" o "terminado":

```markdown
## Objetivo
[En qu├® estuvimos trabajando esta sesi├│n]

## Instrucciones Aprendidas
[Preferencias o restricciones del usuario descubiertas - si las hay]

## Descubrimientos
- [Hallazgos t├®cnicos, gotchas, aprendizajes no-obvios]

## Completado
- [Items terminados con detalles clave]

## Pr├│ximos Pasos
- [Lo que queda por hacer para la pr├│xima sesi├│n]

## Archivos Relevantes
- path/to/file ÔÇö [qu├® hace o qu├® cambi├│]
```

> **Regla de Oro:** Si el Orquestador cierra la sesi├│n sin actualizar el `ORCHESTRATOR-STATE.md` con esta estructura, la pr├│xima sesi├│n arranca CIEGA.
