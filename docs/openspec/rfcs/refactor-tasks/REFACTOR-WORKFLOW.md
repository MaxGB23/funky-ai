# Metodología de Refactorización de RFCs (SDD)
Este documento establece el flujo de trabajo para migrar, consolidar y pulir los borradores (drafts) hacia especificaciones finales. El objetivo principal es **respetar al 100% la redacción original del Tech Lead**, asegurando que el agente de IA solo actúe como facilitador y auditor de contradicciones, nunca como redactor no autorizado.

---

> 💡 **MINI-CONTEXTO ARQUITECTÓNICO (Para el Agente):**
> Al leer los drafts, encontrarás aparentes contradicciones sobre quién orquesta. Esto es una Arquitectura de Dos Tiempos:
> 1. **Fase Actual (IDE):** Proceso más manual (dependiente del copy-paste). El IDE sigue siendo el rey indiscutible para ejecución pura (Apply/Worker) gracias a sus herramientas visuales (diffs, accept/reject).
> 2. **Fase Futura (CLI):** La orquestación ágil se muda al CLI con subagentes nativos (modos *auto* e *interactivo*), eliminando el copy-paste manual. OJO: en modo interactivo siempre exige aprobación humana antes de avanzar de fase.

---

## 🛠️ El Flujo de Trabajo (Paso a Paso)

> ⚠️ **REGLA ABSOLUTA DE CONTEXTO (ANTI-CONTAMINACIÓN):** El agente debe guiarse ESTRICTAMENTE por el `GRANULAR-CHECKLIST.md` como índice. **TIENE ESTRICTAMENTE PROHIBIDO** leer (`view_file`) otros archivos de la carpeta `/drafts` por adelantado o para "buscar choques/referencias cruzadas". Solo debe abrir y extraer el texto del draft que corresponda exactamente al punto específico que se está trabajando en ese momento. Leer drafts completos fuera de turno contamina la memoria y el humano te matará la sesión.

Para cada tema o dominio, seguiremos este ciclo estricto:

### 1. Extracción y Referencias Cruzadas (El Agente)
- **Cruce en el Checklist:** Antes de abrir archivos, el agente debe revisar **ÚNICAMENTE** el `GRANULAR-CHECKLIST.md` para identificar si hay otros puntos en el índice que hablen de lo mismo o puedan chocar.
- **Extracción Quirúrgica:** El agente abrirá **EXCLUSIVAMENTE** el archivo indicado en el encabezado del checklist (ej. `📄 blueprint-final-draft.md`). **TIENE PROHIBIDO** escanear toda la carpeta `/drafts`.
- **Acción:** El agente le presenta al humano los bloques de texto exactos copiados del draft específico.

### 2. Auditoría y Discusión (Agente + Humano)
El agente analizará los fragmentos extraídos y señalará:
- **Contradicciones:** "Karnal, aquí dices A y acá dices B."
- **Sugerencias Arquitectónicas:** Oportunidades de mejora o clarificación.
- **Acción:** Discutimos el punto en el chat.

### 3. Pulido y Redacción (El Humano)
El humano decide cómo resolver las contradicciones y **provee la redacción final pulida** (o aprueba fragmentos exactos del draft).
- **Acción:** El humano tiene la última palabra y redacta la "Ley".

### 4. Consolidación (El Agente)
El agente toma la redacción exacta proveída por el draft y la inyecta mediante copy-paste para no perder redacción e info original. En el caso de que haya un punto con contradicciones que se ha discutido y resuelto, el humano debe dar la indicación al agente de redactar el nuevo punto con las conclusiones que se hayan acordado, el archivo de especificación final debe ser (`spec-[tema].md`).


---

## 📋 Checklist Granular (por Sección del Index)
Cada ítem corresponde a una sección exacta del índice de drafts. Se marca cuando el punto fue discutido, resuelto y consolidado en su `spec-*.md` final.
Sirve para confirmar que ningún punto se quedó en el olvido.

Se ha movido para ahorrar tokens.
Leer `./GRANULAR-CHECKLIST.md`

## Sugerencia de Specs (No Obligatorio)
Esta es una lista sugerida de archivos destino para agrupar los temas del checklist. El agente puede proponer ajustes si, al investigar a fondo el contexto, lo amerita:
1. `spec-routing-tiers.md` (Escalera de Tiers, Ley SemVer, Deprecación de Microplanning)
2. `spec-contracts-templates.md` (artifact_state, frontmatter, tasks.md, exclusiones de templates)
3. `spec-roles-subagents.md` (Taxonomía, lazy loading, explore ligero, identidad)
4. `spec-cli-ide-boundaries.md` (CLI vs IDE, Inquirers, interactivo vs auto, Fase 1 vs Fase 2)
5. `spec-orchestrator-rules.md` (Identidad, checklists pre-vuelo, protocolo engram, return envelope)
6. `spec-nfrs-lifecycle.md` (Discovery → Formalización → Cascada de NFRs)
