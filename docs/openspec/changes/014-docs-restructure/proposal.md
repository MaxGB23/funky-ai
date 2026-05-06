# RFC 014: Reestructuración de Documentación Central (`docs/funky-ai/`)

## 1. El Problema (Doc Sprawl)
Actualmente, el directorio `docs/funky-ai/` sufre de solapamiento de dominios. Las líneas entre `core-concepts`, `guias/estudio`, `retrospectivas-lecciones` y `journey` son borrosas. Por ejemplo, una retrospectiva de la versión 1.7 puede contener lecciones que deberían ser una guía de estudio, o conceptos core del framework. Si tenemos demasiadas subcarpetas, la información se fragmenta y el Worker (o el Humano) no sabe dónde buscar ni dónde escribir.

## 2. La Propuesta: Arquitectura basada en Diátaxis (Adaptada)
Vamos a consolidar los 7 directorios actuales en **4 pilares lógicos y excluyentes**:

### Pilar 1: `conceptos/` (Teoría y Fundamentos)
*Antiguo: `core-concepts/`*
Acá va la teoría pura. El *por qué* de las cosas. El `manifiesto.md`, la filosofía del framework, la explicación de qué es el Orquestador vs el Worker. No hay tutoriales acá.

### Pilar 2: `guias/` (Educación y Práctica)
*Antiguo: `guias/` + extracción de conocimiento útil de retrospectivas*
Documentación accionable para humanos. Guías de estudio (como la de testing vs CI), tutoriales de onboarding. Si es para aprender, va acá.

### Pilar 3: `operaciones/` (Manuales y SDD)
*Antiguo: `workflows/`*
El *cómo* de los procesos repetitivos. Cómo hacer un release, cómo ejecutar el flujo SDD, cómo usar comandos del CLI.

### Pilar 4: `historico/` (Bitácora de Tiempo)
*Consolida: `journey/`, `releases/`, `retrospectivas-lecciones/`*
Todo lo que está atado a una línea temporal. Un smoke-test de la v1.7, el changelog de la v1.5, o los apuntes del journey de desarrollo. No son conceptos vivos, son fotos del pasado. Al agruparlos, limpiamos la raíz drásticamente.

### Extra: `drafts/` (Zona de Guerra)
*Antiguo: `mierdilla/`*
Renombrar a `drafts/` para mantener la profesionalidad semántica. Es el espacio temporal para bajar ideas antes de clasificarlas.

## 3. Plan de Migración
1. Renombrar y consolidar las carpetas físicas.
2. Mover `v1.7.0-smoke-test.md` a `historico/retrospectivas/`.
3. Actualizar `repo-map.md` con la nueva estructura simplificada.
