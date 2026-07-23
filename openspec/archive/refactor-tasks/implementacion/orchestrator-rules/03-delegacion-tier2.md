# 03 - Delegación Tier 2 (El Chalán Crikoso)

En Tier 2, las fases (Explore, Propose, Spec, Verify) se delegan a un subagente ligero ("Chalán Crikoso") usando `define_subagent`. Este agente NO hereda tus reglas ni tu catálogo. **Debes pasarle instrucciones literales y estrictas**.

### 1. Sabueso de Lava (Explore Ligero - Route B)
**Cuándo:** Fase Explore en Tier 2 (cuando hay un RFC/spec como input).
**Cómo delegar:**
- Usa `define_subagent`. Permisos: Lectura + Escritura.
- **Prompt estricto que debes inyectar:**
  > ## Tarea
  > Analiza el RFC/especificación para "[CHANGE]" y produce la sección Context Preservation en explore.md. NO inventes arquitectura.
  > 
  > ## Documento fuente
  > - `[RFC_PATH]` — documento a analizar
  > 
  > ## Template a seguir
  > - `docs/openspec/changes/[CHANGE]/explore.md` — usar `replace_file_content` para seguir la estructura al pie de la letra. No sobreescribas desde cero.
  > 
  > ## Tag de engram (contexto previo)
  > - Nombre: [Nombre]
  > - Descripción: [Descripción]
  > 
  > ## Formato de retorno
  > ```markdown
  > ## Hallazgo: [Título corto]
  > **Qué**: [1-3 líneas — resumen del análisis]
  > **Dónde**: `docs/openspec/changes/[CHANGE]/explore.md`
  > **Context Preservation**: [SÍ/NO]
  > ```

### 2. Propose Ligero
**Cuándo:** Fase Propose en Tier 2.
**Cómo delegar:**
- Usa `define_subagent`. Permisos: Lectura + Escritura.
- **Prompt estricto que debes inyectar:**
  > ## Tarea
  > Genera la propuesta de cambio para "[CHANGE]".
  > 
  > ## Hallazgos del Explore
  > **[INYECCIÓN CONDICIONAL]**: Si corriste el Sabueso de Lava en la fase previa, DEBES INYECTAR AQUÍ TEXTUALMENTE SUS HALLAZGOS. El subagente no debe buscar en disco.
  > 
  > ## Template a seguir
  > - `docs/openspec/changes/[CHANGE]/proposal.md` — usar `replace_file_content`. No sobreescribas desde cero.
  > 
  > ## Tag de engram (contexto previo)
  > - Nombre: [Nombre]
  > - Descripción: [Descripción]
  > 
  > ## Formato de retorno
  > ```markdown
  > ## Proposal Created
  > **Change**: [CHANGE]
  > **Summary**: [1-3 líneas]
  > **Risk Level**: [Low/Medium/High]
  > ```

### 3. Spec Ligero
**Cuándo:** Fase Spec en Tier 2.
**Cómo delegar:**
- Usa `define_subagent`. Permisos: Lectura + Escritura.
- **Prompt estricto que debes inyectar:**
  > ## Tarea
  > Genera las especificaciones del cambio para "[CHANGE]". Solo happy paths y error principal.
  > 
  > ## Artefactos a leer
  > - `docs/openspec/changes/[CHANGE]/proposal.md`
  > 
  > ## Template a seguir
  > - `docs/openspec/changes/[CHANGE]/specs/[DOMAIN].md` — usar `replace_file_content`. No sobreescribas desde cero.
  > 
  > ## Tag de engram (contexto previo)
  > - Nombre: [Nombre]
  > - Descripción: [Descripción]
  > 
  > ## Formato de retorno
  > ```markdown
  > ## Specs Created
  > **Change**: [CHANGE]
  > | Domain | Type | Requirements | Scenarios |
  > |--------|------|-------------|-----------|
  > | [domain] | [New/Delta] | [N] | [M] |
  > 
  > **Coverage**: happy paths ✅ / error states ⚠️ parcial
  > ```

### 4. Verify Ligero
**Cuándo:** Fase Verify en Tier 2.
**Cómo delegar:**
- Usa `define_subagent`. Permisos: Lectura + Escritura.
- **Prompt estricto que debes inyectar:**
  > ## Tarea
  > Verifica que la implementación de "[CHANGE]" cumple con las especificaciones.
  > 
  > ## Artefactos a leer
  > - `docs/openspec/changes/[CHANGE]/spec.md` — especificaciones a validar
  > - `docs/openspec/changes/[CHANGE]/tasks.md` — tareas asignadas
  > 
  > ## Tag de engram (contexto previo)
  > - Nombre: [Nombre]
  > - Descripción: [Descripción]
  > 
  > ## Formato de retorno
  > ```markdown
  > ## Verification Report
  > **Change**: [CHANGE]
  > **Verdict**: PASS | PASS WITH FUNCTIONAL WARNINGS | PASS WITH COSMETIC WARNINGS | FAIL
  > 
  > ### Build & Tests
  > **Build**: ✅/❌
  > **Tests**: [N] passed / [M] failed
  > 
  > ### Issues
  > [lista de issues o "None"]
  > 
  > ### Acción para el Orquestador
  > [PASS → archive | FUNCTIONAL WARNINGS → re-apply | COSMETIC WARNINGS → fix inline si <5 líneas | FAIL → funky-worker]
  > ```
