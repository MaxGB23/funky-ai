# SDD Phase: Design - Funky AI Protocol v1.1 Refactor

## 🎯 Objetivo de la Arquitectura
Implementar un sistema avanzado de retentiva y herramientas para que los sub-agentes (Workers) de Funky AI puedan consultar su "Falso Engram" y auto-descubrir sus "Skills" de forma 100% autónoma, mitigando el cansancio cognitivo del Humano (Router) de inyectar rutas fijas de memoria.

## 🏗️ Resoluciones de Diseño (Pattern: Structural Contexting)

### Pilar 1: Auto-descubrimiento Pasivo de Skills (Global Context)
Las instrucciones de los agentes en `.agents/skills` se elevarán como "Catálogo Central" de habilidades de todo Worker.
- **Decisión Arquitectónica**: Las reglas base globales instruirán a cualquier Agente instanciado a que: *"Antes de emitir propuesta de código o ejecución, el agente está obligado a indagar pasivamente la carpeta `.agents/skills/` si percibe patrones estandarizables en su tarea actual (Testing, refactoring, creaciones de pipelines, etc.)."*

### Pilar 2: Memory Polling Dinámico (Local Directory Trigger)
Para emular un hook de base de datos como haría Gentle AI, usaremos las facilidades condicionales del IDE atadas al filesystem.
- **Implementación**: Se redactará un archivo de contexto lógico (`.agents/rules/engram-protocol.md`).
- **Activador de Inyección**: El trigger que inserta esta regla en la memoria del modelo al momento cero NO ES semántico, es topológico: se limitará a dispararse ante una matriz como `[docs/]` o un flag afín que certifique que *este proyecto* usa Funky AI. 
- **Comportamiento (Querying)**: Si la condición positiva se cumple, el Agente asume el deber mandatorio de usar `grep_search` sobre `docs/post-mortem.md` antes de cualquier modificación estructural.

### Pilar 3: Estructuración MCP en Texto Plano (Indexación)
Cualquier query falla frente a strings de texto sueltos y no tipificados. Por el hallazgo de la tool de MCP de *Gentle AI*, toda inserción a la persistencia debe tener formato de entidad tabular emulada en Markdown.
- **Implementación**: Se reescribirá la norma oficial a dictar en `funky-ai.md`. Cuando los Workers documenten en `docs/post-mortem.md`, están atados irrevocablemente al esquema:

```markdown
### [{type}] {title}
**What:** [Lo que se hizo a nivel de código o configuración, concreto]
**Why:** [La justificación, el causante del error o la métrica de negocio/estado]
**Where:** [El rastro de las entidades o archivos modificados. Ej: root/configs/db.json]
**Learned:** [Casuística rara, caveats, advertencias de cara al futuro. Campo vital]
```
*(Ej. Types permitidos: `bugfix`, `decision`, `arquitectura`, `discovery`)*

### Pilar 4: Recuperación de Contexto en Dos Pasos (Safe-Contexting)
Para proteger la memoria del llm de saturación, prohibimos la lectura ciega de archivos masivos.
- **Implementación**: Se dictará un flujo estricto: Primero usar `grep_search` apuntando a lista de archivos o pequeñas líneas clave. Recién tras confirmar la pertinencia, usar `view_file` para extraer el contenido en memoria.

### Pilar 5: Comunicación Normalizada (Return Envelopes)
Se aniquila la conversación libre del Worker hacia el Orchestrator. El Worker debe devolver data rígida.
- **Implementación**: Todo reporte de fase terminado debe ajustarse obligatoriamente a este sobre de entrega: `status`, `executive_summary`, `artifacts`, `next_recommended`, `risks`.
---

## 🛠️ Plan de Implementación Activa (Worker Checklist)
*(Ejecución paralizada hasta orden explícita del Router Humano)*

- [x] **Tarea A:** Crear archivo `.agents/rules/engram-protocol.md`. Programarle el disparador por condición de directorio e inyectarle los comandos para "Read" y "Write" estructurado en el disco.
- [x] **Tarea B:** Actualizar el archivo manifiesto maestro (`docs/funky-ai/funky-ai.md` o el equivalente) para reflejar las políticas MCP, el "Read en 2 Pasos" y los "Return Envelopes".
- [x] **Tarea C:** Añadir a la base general un flag o directiva global para que el motor de `skills` fluya.
- [x] **Tarea D:** Actualizar la guía del equipo (`docs/funky-ai/funky-ai-team-guide.md`) para enseñar al router humano cómo manejar los nuevos Return Envelopes y que ya no hace falta arrobar contextos de memoria manualmente.
