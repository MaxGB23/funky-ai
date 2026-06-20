# RFC: Desacoplamiento de Templates SDD e Inyección Dinámica

> **Estado:** Draft Inicial (En revisión)

## 1. Motivación & Arquitectura

Actualmente, el archivo `tasks` funge como un monolito que mezcla la ejecución de código, la auditoría de documentación y las listas de liberación (release). Para cumplir con el Principio de Responsabilidad Única (SRP) y mantener un "Change Folder" esbelto y enfocado, se divide este monolito en tres templates especializados:

1. **`tasks.md`:** Contiene estrictamente las fases de ejecución de código (Fase 1, 2, N). Se inyecta siempre.
2. **`docs.md` (Condicional):** Checklist de auditoría documental que se inyecta solo cuando se modifica documentación crítica (arquitectura, ADRs, RFCs) o el Tier lo exige.
3. **`release.md` (Condicional):** Checklist exclusivo para el lanzamiento de un release o versionamiento.

Esta separación modulariza el trabajo de los subagentes, evitando la dilución del *Context Window* con instrucciones que no les competen.

## 2. La Escalera SemVer x Tier (Ley de Gravedad Inversa)

El CLI (`funky feature`) inyecta mecánicamente las plantillas, pero la **inteligencia y validación** recaen en el Orquestador. 

El tipo de release (SemVer) define un **piso mínimo** para el Tier de la operación. Un cambio puede escalar de Tier voluntariamente por su complejidad, pero **NUNCA puede bajar del piso** que le marca el SemVer.

* **NONE (Internal Chores / Micro-fixes):** Tareas puramente internas. No se sube versión.
  * **Piso mínimo:** Tier 0 (Micro) o Tier 1 (Fast Track).
  * **Templates:** `tasks.md` (excepto en T0 que es edición *inline*). No lleva `release.md`.
* **PATCH (Hotfixes / Bugfixes):** Arreglos que estabilizan el sistema sin nueva funcionalidad.
  * **Piso mínimo:** Tier 1.
  * **Templates:** `tasks.md` (El Orquestador *debe* inyectar una tarea de "Actualizar versión en package.json"). Se omite `release.md`. `docs.md` es condicional.
* **MINOR (Features nuevas):** Adición de funcionalidad retrocompatible.
  * **Piso mínimo:** Tier 2 (Standard Feature).
  * **Templates:** `tasks.md` + **`release.md` (Obligatorio)**. `docs.md` es condicional al impacto.
* **MAJOR (Breaking changes):** Cambios profundos en arquitectura, API o modelos de datos que rompen retrocompatibilidad.
  * **Piso mínimo:** Tier 3 (Deep).
  * **Templates:** `tasks.md` + **`release.md` (Obligatorio)** + **`docs.md` (Obligatorio)**.

> **⚠️ Aclaración Arquitectónica:** El Orquestador funge como el perro guardián de esta regla. Si el humano solicita un breaking change (MAJOR) e intenta forzarlo por la vía rápida diciendo "es Tier 1", el Orquestador tiene la **obligación absoluta** de frenar la ejecución y exigir el escalamiento a Tier 3 para asegurar el aislamiento de las fases SDD. No somos vaqueros.
