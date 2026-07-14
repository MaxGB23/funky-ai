# Funky-ai Inputs — Contrato de delegación del orquestador

> **Propósito:** Documentar qué recibe cada sub-agente cuando el orquestador
> delega trabajo. Cubre Tier 3 (custom workflows `funky-<fase>`) y Tier 2
> (SDD Ligeros).
>
> **Regla de oro:** El orquestador arma el prompt completo. El sub-agente
> NO busca en engram ni resuelve paths por su cuenta.

---

## Contrato Base E1

Parámetros mínimos de delegación. Aplica a **todos** los workflows
Tier 3 y como referencia para Tier 2.

```yaml
feature_name: string    # Nombre del cambio (se deriva del change folder)
tag: string | null      # Tag de engram para búsqueda dirigida (opcional)
```

**Deprecado:** `artifact_state` (se reemplaza por instrucción en lenguaje
natural si hay WIP). `has_design` (Tier 3 = design siempre, no hay flag).

---

## Tier 3 — Custom Workflows `funky-<fase>`

**Todos** los workflows Tier 3 reciben únicamente el contrato E1:

| Input | Obligatorio |
|-------|-------------|
| `feature_name` | Sí |
| `tag` | No |

No hay excepciones excepto Explore (ver abajo). El workflow se encarga
de leer los artifacts desde disco según la fase.

### Explore SDD (Tier 3)

**Excepción:** Además de E1, recibe contexto especial para el análisis.

| Input | Fuente | Obligatorio |
|-------|--------|-------------|
| Contexto a analizar | Path a RFC, engram entry, o descripción directa | Sí |
| Objetivo especial | Dirección táctica o puntos críticos | No |

**Prompt de delegación:**

```text
/funky-explore
feature_name: {change-name}
tag: {tag-opcional}

Contexto a analizar: {path-rfc-o-descripción}
Objetivo especial: {dirección-táctica-opcional}
```

### Demás fases Tier 3

Propose, Spec, Design, Tasks, Apply, Verify y Archive reciben **solo** E1.
El workflow lee los artifacts previos desde disco por su cuenta.

```text
/funky-{fase}
feature_name: {change-name}
tag: {tag-opcional}
```

---

## Tier 2 — SDD Ligeros

Aquí el orquestador brilla: arma el prompt completo para que el sub-agente
ligero no tenga que resolver nada. Cada fase recibe cinco elementos:

1. **Tarea concreta** — qué hacer, en lenguaje directo
2. **Artefacto anterior** — path al output de la fase previa (o documento fuente)
3. **Template a seguir** — path al template + instrucción de view_file + `replace_file_content`
4. **Tag de engram** (opcional) — nombre y descripción ya digeridos
5. **Formato de retorno** — qué regresar al orquestador

**El sub-agente ligero NO busca en engram, NO resuelve paths, NO decide
estructura.** Sigue el template al pie de la letra.

**Regla de templates:** El sub-agente NUNCA sobreescribe la estructura
base inyectada por el CLI. Usa `replace_file_content` para rellenar secciones.

---

### Explore Ligero (Sabueso de Lava)

**Delegación:** `define_subagent` (lectura + escritura). Exclusivo Tier 2.

**Trigger:** Hay un RFC/spec como input, o la tarea requiere entender
reglas, definiciones y constraints de un documento fuente.

**Prompt de delegación:**

```text
## Tarea
Analiza el RFC/especificación para "{change}" y produce la sección
Context Preservation en explore.md.

## Documento fuente
- `{rfc_path}` — documento a analizar

## Template a seguir
- `openspec/changes/{change}/explore.md` — leer y usar replace_file_content
  para seguir la estructura al pie de la letra. No sobreescribas desde cero.

## Tag de engram (contexto previo)
- Nombre: {nombre-descriptivo-del-tag}
- Descripción: {resumen-de-una-línea-de-qué-hay-en-engram}

## Formato de retorno
## Hallazgo: {título corto}
**Qué**: {1-3 líneas — resumen del análisis}
**Dónde**: `openspec/changes/{change}/explore.md`
**Context Preservation**: {SÍ/NO — si se pudo volcar el contexto del RFC}
```

**Persiste artefacto:** `explore.md` con Context Preservation. Resuelve el
anti-patrón de "Teléfono Descompuesto" en Tier 2.

**Diferencia con Explore SDD (Tier 3):** No reemplaza a `funky-explore`.
Es un template ligero enfocado en Context Preservation, no en análisis
profundo de opciones de arquitectura.

---

### Propose Ligero

**Delegación:** Chalán Crikoso (`define_subagent`) con prompt armado por orquestador.

**Prompt de delegación:**

```text
## Tarea
A partir del análisis en explore.md, genera la propuesta de cambio
para "{change}".

## Artefacto a leer
- `openspec/changes/{change}/explore.md` — análisis de la fase previa

## Template a seguir
- `openspec/changes/{change}/proposal.md` — leer y usar replace_file_content
  para seguir la estructura al pie de la letra. No sobreescribas desde cero.

## Tag de engram (contexto previo)
- Nombre: {nombre-descriptivo-del-tag}
- Descripción: {resumen-de-una-línea-de-qué-hay-en-engram}

## Formato de retorno
## Proposal Created
**Change**: {change-name}
**Summary**: {1-3 líneas}
**Risk Level**: {Low/Medium/High}
```

---

### Spec Ligero

**Delegación:** Chalán Crikoso (`define_subagent`) con prompt armado por orquestador.

**Prompt de delegación:**

```text
## Tarea
A partir de la propuesta, genera las especificaciones del cambio
para "{change}".

## Artefactos a leer
- `openspec/changes/{change}/proposal.md` — propuesta de la fase previa
- `view_file openspec/specs ← si hay specs existentes

## Template a seguir
- `openspec/changes/spec.md` — leer y usar replace_file_content
  para seguir la estructura al pie de la letra. No sobreescribas desde cero.

## Tag de engram (opcional)
- Nombre: {nombre-descriptivo-del-tag}
- Descripción: {resumen-de-una-línea-de-qué-hay-en-engram}

## Formato de retorno
## Specs Created
**Change**: {change-name}
| Domain | Type | Requirements | Scenarios |
|--------|------|-------------|-----------|
| {domain} | {New/Delta} | {N added/modified} | {M} |

**Coverage**: happy paths ✅ / error states ⚠️ parcial
```

---

### Verify Ligero

**Delegación:** Chalán Crikoso (`define_subagent`) con prompt armado por orquestador.

**Prompt de delegación:**

```text
## Tarea
Verifica que la implementación de "{change}" cumple con las especificaciones.

## Artefactos a leer
- `openspec/changes/{change}/spec.md` — especificaciones a validar
- `openspec/changes/{change}/tasks.md` — tareas asignadas

## Tag de engram (contexto previo)
- Nombre: {nombre-descriptivo-del-tag}
- Descripción: {resumen-de-una-línea-de-qué-hay-en-engram}

## Formato de retorno
## Verification Report
**Change**: {change-name}
**Verdict**: PASS | PASS WITH FUNCTIONAL WARNINGS | PASS WITH COSMETIC WARNINGS | FAIL

### Build & Tests
**Build**: ✅/❌
**Tests**: {N passed} / {M failed}

### Issues
{lista de issues o "None"}

### Acción para el Orquestador
{PASS → archive | FUNCTIONAL WARNINGS → re-apply | COSMETIC WARNINGS → fix inline si <5 líneas | FAIL → funky-worker}
```

---

## Viaje de artifacts entre fases

| Fase A | Fase B | Artefacto que pasa |
|--------|--------|-------------------|
| Explore | Propose | `explore.md` |
| Propose | Spec | `proposal.md` |
| Spec | Tasks | `specs/*.md` |
| Tasks | Apply | `tasks.md` |
| Apply | Verify | `apply-progress` + `tasks.md` |
| Verify | Archive | `verify-report.md` + todos los artifacts |

---

## Referencias

| Documento | Qué define |
|-----------|------------|
| `spec-contracts-templates.md` §1 | Contrato E1 |
| `spec-roles-subagents.md` §2 | Reglas de delegación |
| `tier2-delegation-rules.md` | Contrato inline para SDD ligeros |
