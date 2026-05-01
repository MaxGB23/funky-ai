# SDD Spec — Memory Polling v2

> **Feature:** `memory-polling-v2`
> **Fecha:** 2026-05-01
> **Rama target:** `feat/memory-polling-v2`

---

## 1. Archivos a Crear

### `docs/engram/index.md` — NUEVO

**Propósito:** Índice liviano (~30 líneas) de todas las entradas del engram. Primera parada del Memory Polling Two-Stage.

**Estructura:**

```markdown
# Engram Index — Funky AI
<!-- 
  Fuente de verdad para el Memory Polling Two-Stage.
  Actualizar CADA VEZ que se agregue una entrada a discoveries.md o bugfixes.md.
  Formato: | [tag-exacto] | resumen de una línea máximo |
-->

## Discoveries
| Tag | Resumen |
|-----|---------|
| [model-efficacy-quota] | Flash=Worker, Pro Low=Orquestador, Sonnet=crisis |
| [massive-consolidation] | Tablas > narrativa — reduce carga cognitiva y tokens |
| [in-template-rule-injection] | Reglas cerca de ejecución (en template), no en globales |
| [sdd-template-quality-gap] | Templates CLI son esqueletos — siempre adjuntar canónico como referencia |
| [cli-missing-readme] | Cada paquete publicable necesita README como DoD |
| [release-dod-gap] | tasks.md sin pasos de release notes/README → drift garantizado |
| [worker-invocation-prompt] | Incluir bloque [HUMANO] en handoff con el prompt exacto de invocación |
| [cli-testing-pure-functions] | Testear CLI = extraer función pura, nunca mockear commander/process |
| [tty-headless-e2e-limitation] | Agentes headless no pueden enviar keystrokes a CLIs interactivos |
| [worker-return-envelope-compliance] | Return Envelope debe pedir intentos fallidos, no solo resultado final |
| [smoke-test-is-dod] | Tests en verde ≠ software funcionando. Smoke test en directorio virgen es DoD |
| [cli-template-sync-drift] | Templates estáticos de CLI necesitan script de sync automático (pretest) |
| [agent-cognitive-load] | Token Diet + XML Tags + Action Forcing para evitar Lost in the Middle |
| [pnpm-strict-usage] | Auditar archivo lock antes de sugerir comandos de paquetes |
| [agent-dry-handoffs] | Handoff como puntero a tasks.md — nunca duplicar instrucciones |
| [skills-obsolescence-vs-templates] | Skills para lógica dinámica, no para estructuras de documentos |
| [documentation-vs-enforcement] | Documentar ≠ enforcer — el fix correcto hace el error estructuralmente imposible |
| [versioning-policy] | Release notes para Mayor/Menor. Patches solo en Engram + ORCHESTRATOR-STATE |
| [phase0-t1-automation] | Fase 0 siempre T1 Worker — nunca tarea del Humano |
| [release-template-ssot] | Template canónico release.md + funky release <version> |
| [readme-template-context-drift] | README raíz = Architecture Hub, no clon del CLI README |
| [memory-polling-index-layer] | Two-Stage Polling: index.md primero, grep por tag solo si relevante |
| [openspec-backlog-lifecycle] | backlog/ → changes/ → archive/: mover items implementados al archive en el release |

## Bugfixes
| Tag | Resumen |
|-----|---------|
| [ci-lockfile-mismatch] | Regenerar pnpm-lock al pinar versiones, antes del commit |
| [worker-prompt-persistence] | Nunca "devolveme" — siempre "escribí el archivo en ruta X" |
| [git-ops-orchestrator] | Crear branch ANTES de generar el primer handoff |
| [worker-tier-omission] | Declarar Tier explícito en cada handoff |
| [phase-template-path] | Al mover templates, actualizar rutas en comandos JS en la misma Fase |
| [cli-headless-overwrite] | Validar flags en función pura, no solo en command handler |
| [stale-post-mortem-ref] | Al deprecar un archivo, grep_search en .agents/rules/ para limpiar refs |
```

---

## 2. Archivos a Modificar

### `.agents/rules/sdd-orchestrator.md`

**Sección:** `## Memory Polling (OBLIGATORIO antes de cambios estructurales)`

**Reemplazar:**
```markdown
## Memory Polling (OBLIGATORIO antes de cambios estructurales)
- `ACTION: Execute grep_search on docs/engram/discoveries.md`
- `ACTION: Execute grep_search on docs/engram/bugfixes.md`
```

**Con:**
```markdown
## Memory Polling — Two-Stage (OBLIGATORIO antes de cambios estructurales)

**Stage 1 (siempre):**
- `ACTION: Execute view_file on docs/engram/index.md`

**Stage 2 (condicional — solo si detectás un tag relevante en Stage 1):**
- `ACTION: Execute grep_search "[TAG-EXACTO]" on docs/engram/discoveries.md`
- `ACTION: Execute grep_search "[TAG-EXACTO]" on docs/engram/bugfixes.md`

> Al agregar una nueva entrada al engram, SIEMPRE actualizar también `docs/engram/index.md`.
```

---

### `funky-cli/src/templates/sdd/worker-handoff.md`

**Sección:** `### B) Memoria Persistente (Memory Polling)` (líneas 22-25)

**Reemplazar:**
```markdown
### B) Memoria Persistente (Memory Polling)
```
view_file docs/engram/index.md
grep_search "[topic-key-relevante]" docs/engram/discoveries.md (IsRegex: false)
grep_search "[topic-key-relevante]" docs/engram/bugfixes.md (IsRegex: false)
```
```

**Con:**
```markdown
### B) Memoria Persistente (Memory Polling — Two-Stage)

**Stage 1 (siempre ejecutar):**
```
view_file docs/engram/index.md
```

**Stage 2 (solo si encontrás un tag relevante en Stage 1):**
```
grep_search "[TAG-EXACTO-DEL-INDICE]" docs/engram/discoveries.md (IsRegex: false)
grep_search "[TAG-EXACTO-DEL-INDICE]" docs/engram/bugfixes.md (IsRegex: false)
```

> Si agregás una entrada nueva al engram en esta Fase, TAMBIÉN actualizá `docs/engram/index.md`.
```

---

### `docs/engram/discoveries.md`

**Agregar al final (dos entries nuevas — en este orden):**

> ⚠️ Nota: `[openspec-backlog-lifecycle]` ya fue agregado al engram por el Orquestador en esta sesión. Solo agregar la entry al `index.md`. No duplicar en `discoveries.md`.

```markdown
### [DISCOVERY][memory-polling-index-layer] Two-Stage Polling para Eficiencia de Tokens
**What:** Reemplazar el grep_search directo sobre discoveries.md (175 líneas) por un acceso Two-Stage: primero leer `docs/engram/index.md` (índice liviano ~30 líneas), luego hacer grep solo del tag exacto si es relevante.
**Why:** Con grep_search directo sobre archivos que crecen, el costo de tokens del Memory Polling escala sin control. A 25 entries/18KB ya, en 6 meses podría superar 300 líneas. El Two-Stage mantiene el costo de Stage 1 fijo (~30 líneas siempre) e independiente del tamaño del engram.
**Where:** `.agents/rules/sdd-orchestrator.md` — Memory Polling. `funky-cli/src/templates/sdd/worker-handoff.md` — §1.B.
**Learned:** El índice es la SSOT del TOC del engram. Cada vez que se agrega una entrada al engram, DEBE actualizarse el índice en la misma operación. La disciplina de mantenimiento del índice es el único punto de falla de este patrón.
```

---

### `ORCHESTRATOR-STATE.md`

- Bump versión de `v1.10.0` a `v1.11.0`
- Marcar la tarea de Memory Polling como `[x]`
- Agregar `v1.11.0` a la tabla de historial
- Actualizar `docs/engram/index.md` en la tabla de Archivos Clave

---

## 3. Archivos SIN tocar

- `funky-cli/src/commands/*.js` — no es un cambio de código
- `docs/funky-ai/` — no es un release de nueva feature CLI
- `ORCHESTRATOR-STATE.md` última sesión — el Worker la actualiza en Fase 3

---

## 4. Riesgos

| Riesgo | Probabilidad | Mitigación |
|--------|-------------|------------|
| Index drift: el índice queda desincronizado con el engram | Media | Agregar instrucción explícita en ambos templates (handoff + orchestrator) |
| Worker agrega discovery pero olvida el índice | Media | Instrucción en Return Envelope: "¿Actualizaste index.md?" |
| Tag en índice no coincide exactamente con el tag en el archivo | Baja | Usar el mismo formato `[tag-en-kebab-case]` como convención estricta |
