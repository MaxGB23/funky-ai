# RFC 024: SDD Fast-Track & Workflow Synergy

> **🛑 WARNING PARA LA IA (ORQUESTADOR):** 
> Este documento es un **RFC (Request for Comments) / Brain Dump**. Son notas crudas del humano y de decisiones arquitectónicas en progreso.

---

## 🧠 1. El Problema: Choque de la Doble Fuente de Verdad

Actualmente existe una fricción arquitectónica entre el andamiaje estático (CLI) y la inteligencia dinámica (Custom Workflows):

- **El Template del CLI (`tasks.md`)**: Nace estructurado con reglas estrictas (como la `Phase 0: Branch Setup` y sus verificaciones `git status`).
- **El Workflow (`/funky-tasks`)**: Su prompt le instruye "crear el archivo si no existe" y le impone su propio formato de markdown, ignorando y sobrescribiendo el trabajo estructural del template base.

### Propuesta / Decisión
**"El Template Manda"**. El CLI inyecta la estructura base inmutable. El prompt del `/funky-tasks` debe ser modificado para prohibirle la sobrescritura total. Su nueva regla será: *Leer el archivo existente y limitarse a **rellenar** las Fases a partir de la Fase 1, respetando cabalmente las restricciones y la Fase 0 inyectadas por el humano en el template canónico.*

---

## 🏎️ 2. SDD Fast-Track (Micro-Features)

Para tareas atómicas o fixes triviales (Tier 1), la burocracia actual es excesiva. No siempre vale la pena generar un Branch, llenar un `release.md` o documentar specs.

### Propuesta / Decisión
Crear un camino "Lightweight" dentro del Orquestador.
- **Trigger**: Una directiva clara como `funky feature mi-fix --fast` o una evaluación temprana del Orquestador.
- **Acción**: Omitir la creación del scaffolding completo. Se debe operar directamente sobre la rama principal o una hotfix, saltándose el `release.md` y `docs.md` si el impacto no amerita versionado semántico ni registro histórico profundo.

---

## 🧹 3. Poda Automática de Documentos Gerenciales

El template `release.md` contiene checklist con etiquetas `[CONDICIONAL]`. Actualmente, si el Orquestador no las limpia manualmente durante la fase Doc-Ops, generan ruido visual.

### Propuesta / Decisión
Trasladar la responsabilidad de "limpieza" al workflow de `/funky-tasks` (o a una regla estricta temprana del Orquestador). Al momento de escanear el proyecto para armar las tareas, el agente de tasks debe evaluar qué condicionales no aplican (ej. "CLI Docs" si no hay comandos nuevos) y **podarlas** automáticamente del `release.md`, dejando al final solo la lista de verificación que de verdad se va a usar.
