# Resumen: Documentación — Actualización post-roadmap

> Estado: **Completada**
> Inicio: 2026-07-28
> Compleción: 2026-07-28

---

## Objetivo

Actualizar la documentación operativa del CLI para reflejar los cambios de las 4 fases del roadmap (templates, assess, estimate, pipeline). Los docs existentes describían comportamientos previos al roadmap (assess con motor de reglas, estimate con fórmula hardcodeada, inexistencia de pipeline, etc.).

## Filosofía

Los living specs en `openspec/specs/` son el SSOT técnico del comportamiento actual. La documentación operativa (`docs/funky-ai/operaciones/`) es la guía para usuarios. Ambas deben coincidir. Donde había conflicto, se actualizó la documentación operativa para reflejar los specs.

## Diagnóstico inicial

| Doc | Estado pre-sesión |
|-----|-------------------|
| `funky-cli/README.md` | ❌ assess/estimate desactualizados, faltaba pipeline, TODO pendiente |
| `docs/funky-ai/operaciones/guia-flujo-completo.md` | ❌ Flujo obsoleto, referencias a comandos viejos, estimate mal descripto |
| `docs/funky-ai/operaciones/escenarios-de-uso.md` | ❌ Assess describía motor de reglas inexistente, outputs incorrectos |
| `docs/funky-ai/operaciones/funky-init-flow.md` | ✅ Actualizado en Fase 1 — sin cambios |
| `docs/funky-ai/guias/funky-ai.md` | ✅ Doc conceptual — sin cambios |
| `docs/funky-ai/operaciones/cli-simulations.md` | ⚠️ Parcialmente obsoleto, faltaban vectores nuevos |
| `.agents/templates/sdd/docs-live-index.md` | ⚠️ Links a índices seccionales que siguen existiendo |
| `.agents/templates/sdd/docs-index/` (7 archivos) | ✅ Existían — algunos requirieron sync menor |

## Qué se hizo

### 1. `funky-cli/README.md`
- **`funky estimate`**: "Calcula costo y riesgo" → "Sesión de pricing colaborativa humano+IA. Sin fórmulas hardcodeadas."
- **`funky assess`**: "Architecture Readiness Gate. Evalúa YAML contra motor de reglas" → "Sesión de discusión arquitectónica con preguntas C1/C2. Sin reglas estáticas, nunca falla."
- **`funky pipeline`**: Nuevo comando agregado a la tabla con sus 4 subcomandos (`assess`, `estimate`, `all`, `status`).
- **Estructura post-bootstrap**: Árbol actualizado con archivos de Fase 1 (`secops-setup.md`, `architecture-assessment-guide.md`, `discoveries.md`, `bugfixes.md`).
- **TODO resuelto**: `**PENDIENTE HACER DISTINCION ENTRE INIT Y BOOTSTRAP**` reemplazado por explicación clara de la diferencia.

### 2. `docs/funky-ai/operaciones/guia-flujo-completo.md`
- **Flow map**: Rediseñado completamente. Ahora muestra: `exploración → init → llenar canvases → bootstrap → [assess] → [estimate] → [pipeline] → SDD planning → Workers → Release`.
- **ETAPA 1.5**: Pasó de "Estimación de Costo y Pricing" (con fórmula) a **"Discusión Arquitectónica con Assess"** — guía de 6 fases, template de decisiones, sin validación binaria.
- **ETAPA 1.6**: Nueva — **"Sesión de Pricing Colaborativa"** — estimate como facilitador de discusión, no como calculadora. Output: guía de pricing + template de decisiones + prompt IA.
- **ETAPA 2**: Separada en init (3 archivos) → llenar canvases → bootstrap (~20 archivos) con outputs de ejemplo reales. Árbol de estructura actualizado.
- **Referencia rápida**: Agregados `assess`, `estimate`, `pipeline all`, `pipeline status`, `engram add`.

### 3. `docs/funky-ai/operaciones/escenarios-de-uso.md`
- **Tabla de referencia**: 4 → **5 escenarios**. Nuevo Escenario 4: "Quiero discutir arquitectura o pricing".
- **Escenario 1**: Assess reescrito (guía de 6 fases, sin reglas). Outputs de init y bootstrap corregidos. Paso 1.6 nuevo con estimate + pipeline.
- **Escenario 2**: Aclarada la distinción init vs bootstrap en el criterio de salida.
- **Escenario 3**: **Fix crítico** — `funky init` → `funky init --bootstrap` en Paso 3.3 (estaba completamente roto: `funky init` solo genera canvases, no copia el ecosistema).
- **Anti-patrones**: assess y estimate entries actualizados para reflejar el comportamiento real (warning pero continúa).
- **Escenario 4** (nuevo): Flujo assess → estimate → pipeline all.
- **Escenario 5** (ex 4): Renumerado.

### 4. `docs/funky-ai/operaciones/cli-simulations.md`
- **Título**: v1.7.0 → v3.2.0+.
- **Vector 1**: Ampliado para cubrir `--bootstrap`.
- **Vector 3**: Marcado como `[PENDIENTE]` con estado claro.
- **Vector 4**: Ampliado para cubrir `--bootstrap`.
- **Vector 6** (nuevo): Assess con canvases incompletos — advierte pero continúa.
- **Vector 7** (nuevo): Estimate sin contexto de assess — advierte pero genera guía parcial.
- **Vector 8** (nuevo): Pipeline sin `context.json` — lo crea automáticamente.

### 5. `.agents/templates/sdd/docs-index/cli-simulations.md`
- Index seccional actualizado para incluir Vectores 3, 6, 7 y 8.

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `funky-cli/README.md` | +14 líneas. assess, estimate, pipeline corregidos; init vs bootstrap aclarado; árbol actualizado |
| `docs/funky-ai/operaciones/guia-flujo-completo.md` | +104 líneas. Flow map, ETAPA 1.5/1.6, ETAPA 2, referencia rápida |
| `docs/funky-ai/operaciones/escenarios-de-uso.md` | +66 líneas. 4→5 escenarios, outputs, bootstrap corregido, anti-patrones |
| `docs/funky-ai/operaciones/cli-simulations.md` | +19 líneas. Vectores 6-8 agregados, V3 marcado pendiente |
| `.agents/templates/sdd/docs-index/cli-simulations.md` | Index sincronizado con vectores actuales |

## Descubrimientos

- **El desfase más grave estaba en `escenarios-de-uso.md` Escenario 3**: decía `funky init` donde debería decir `funky init --bootstrap`. Un usuario siguiendo ese doc no lograba inicializar el ecosistema.
- **`guia-flujo-completo.md`** tenía el problema inverso: el output de ejemplo mostraba 18 archivos para `funky init` sin `--bootstrap`, lo cual era incorrecto desde Fase 1.
- **Los docs-index seccionales** (`.agents/templates/sdd/docs-index/`) son útiles como blueprint de qué debe contener cada doc. Mantenerlos sincronizados con los docs es clave para la estrategia de documentación viva.
- **`funky-cli/README.md`** era el doc más visible pero menos crítico — los errores estaban sobre todo en las descripciones. El árbol y la estructura estaban mayormente bien.

## Lo que quedó pendiente

- **Vector 3 de cli-simulations.md**: El manejo de errores de permisos (`EACCES`) sigue siendo un stacktrace feo. Fix postergado.
- **Docs de `funky pipeline` como documento independiente**: Por ahora pipeline está cubierto en guia-flujo-completo.md y escenarios-de-uso.md. Si el comando crece en complejidad, merece su propio doc operativo.
- **`docs/funky-ai/guias/funky-ai.md`**: Doc conceptual. No se tocó porque el roadmap no cambió la arquitectura conceptual, solo los comandos. Puede requerir revisión separada.

## Stats finales

| Métrica | Valor |
|---------|-------|
| Archivos modificados | 5 |
| Líneas agregadas | ~203 |
| Líneas eliminadas | ~70 |
| Docs operativos cubiertos | 4 de 6 (init-flow y guías conceptuales ya estaban OK) |
| Vectores de simulación agregados | 3 (assess, estimate, pipeline) |
| Escenarios de uso | 4 → 5 |
