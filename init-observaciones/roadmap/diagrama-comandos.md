# Diagrama de Responsabilidad de Comandos

> ⚠️ **DEPRECATED** — Este documento ya no se actualiza. La documentación viva de comandos
> se consolidó en `docs/funky-forge/command-flow.md` (resumen) y archivos individuales
> (`init.md`, `assess.md`, `estimate.md`, `pipeline.md`). Los docs del framework están en
> `docs/funky-ai/scaffold.md`, `docs/funky-ai/feature.md`, `docs/funky-ai/engram.md`.
>
> Generado: 2026-07-29 (actualizado Punto 4 — reorganización funky-pipeline/)
> Propósito: Mapa visual de qué archivos inyecta o genera cada comando.
> Formato: Árbol por comando para identificar rápidamente qué inyecta cada uno.

---

## Leyenda

| Símbolo | Significado |
|---------|-------------|
| 📄 | Copia template estático |
| ✍️ | Genera contenido dinámico (interpola datos) |
| 🔗 | Orquesta otro comando |
| 🗂️ | Crea directorio |
| 🔍 | Lee archivo (solo lectura) |
| ⚠️ | Candidato a eliminar |

---

## `funky init` (sin flags)

```
🔍 Verifica que NO existan PROJECT-CANVAS.md ni INFRA-CANVAS.md en docs/funky-ai/canvas/
   ↓
📄 PROJECT-CANVAS.md → docs/funky-ai/canvas/ (desde src/templates/init/)
📄 INFRA-CANVAS.md → docs/funky-ai/canvas/ (desde src/templates/init/)
📄 canvas-planning-guide.md → docs/funky-ai/canvas/ (si no existe)
```

## `funky init --bootstrap`

```
🔍 No requiere canvases (si existen los respeta)
   ↓
🔄 runInit() → 35 copias + 1 create + 8 mkdir:
   ├── 📄 ORCHESTRATOR-STATE.md → raíz
   ├── 📄 README.md → raíz
   ├── 📄 TEMPLATE_GUIDE.md → raíz
   ├── 📄 .agents/rules/ (8 reglas enggram/secops/sdd/tiers)
   ├── 📄 .agents/templates/sdd/ (explore, proposal, spec, tasks, etc.)
   ├── 🌱 docs-live-index.md → .agents/templates/sdd/
   ├── 🗂️ .agents/templates/sdd/docs-index/
   └── 🗂️ docs/engram/{architecture,pattern,discovery,decision,bugfix,session,release}
```

> 💡 Los canvases ahora se crean en `docs/funky-ai/canvas/` por `funky init` (sin flags). `--bootstrap` solo copia el ecosistema de reglas/templates.

---

## `funky assess`

```
🔍 PROJECT-CANVAS.md + INFRA-CANVAS.md (desde docs/funky-ai/canvas/, siempre filesystem)
🔍 src/templates/assess/architecture-review-template.md
🔍 src/templates/assess/architecture-decisions-template.md (si no existe decisions)
   ↓
✍️ docs/funky-ai/assess/architecture-review.md (guía 6 fases + preguntas dinámicas)
✍️ docs/funky-ai/assess/architecture-decisions.md (template si no existía)
📌 Con --context: actualiza docs/funky-ai/pipeline/context.json (assess.runAt + dynamicQuestions)
```

---

## `funky estimate`

```
🔍 PROJECT-CANVAS.md + INFRA-CANVAS.md (desde docs/funky-ai/canvas/)
🔍 docs/funky-ai/assess/architecture-decisions.md
🔍 src/templates/estimate/pricing-guide-template.md
🔍 src/templates/estimate/pricing-decisions-template.md
   ↓
✍️ docs/funky-ai/estimate/pricing-guide.md
✍️ docs/funky-ai/estimate/pricing-decisions.md
✍️ stdout: prompt IA (banner + cuerpo + footer)
📌 Con --context: actualiza docs/funky-ai/pipeline/context.json (estimate.runAt)
```

---

## `funky pipeline`

```
pipeline assess:
   ├── 🔍 docs/funky-ai/pipeline/context.json (crea metadatos si no existe, sin canvases)
   ├── 🔗 runAssess(targetBase, { context: true })
   └── 💾 context.json (assess.runAt + dynamicQuestions)

pipeline estimate:
   ├── 🔍 context.json (valida que exista + assess.runAt)
   ├── 🔗 runEstimate(targetBase, { context: true })
   └── 💾 context.json (estimate.runAt)

pipeline all:
   ├── 🔍 context.json (crea si no existe)
   ├── 🔗 pipeline assess
   ├── 🔗 pipeline estimate
   └── ✅ "Pipeline complete!"

pipeline status:
   └── 🔍 context.json → stdout (createdAt, assess.runAt, estimate.runAt)
     (ya NO muestra canvas info — context.json no contiene canvases)
```

---

## `funky feature`

```
Argumento: <name> + tier interactivo (T1/T2/T3)
🔍 templates/sdd/ (fallback) o .agents/templates/sdd/ (golden)

T1 (fix/hotfix):
   ├── 📄 tasks.md
   └── 📄 report.md

T2 (feature ligera):
   ├── 📄 tasks.md
   ├── 📄 report.md
   ├── 📄 explore.md
   ├── 📄 proposal.md
   ├── 📄 spec.md
   ├── 📄 [docs.md] (si afecta docs)
   └── 📄 release.md

T3 (feature compleja):
   ├── 📄 tasks.md
   ├── 📄 [docs.md] (si afecta docs)
   └── 📄 release.md

Destino: openspec/changes/{name}/
```

---

## `funky engram add`

```
Flags / input: --tag, --category, --desc
   ↓
✍️ docs/engram/{category}/{tag}.md
✍️ docs/engram/index.md (actualiza sección de categoría)
```

**Categorías:** architecture, pattern, discovery, decision, bugfix, session, release

---

## Directorios de templates (post-Punto 4)

| Directorio | Templates | Comandos que lo usan |
|------------|-----------|---------------------|
| `src/templates/init/` | PROJECT-CANVAS.md, INFRA-CANVAS.md, canvas-planning-guide.md | `funky init` (sin flags) |
| `src/templates/bootstrap/` | ORCHESTRATOR-STATE.md, TEMPLATE_GUIDE.md, sdd/{ explore, proposal, spec, ... } | `funky init --bootstrap` |
| `src/templates/assess/` | architecture-review-template.md, architecture-decisions-template.md | `funky assess` |
| `src/templates/estimate/` | pricing-guide-template.md, pricing-decisions-template.md | `funky estimate` |

---

## Directorios de output (`docs/funky-ai/`)

| Directorio | Archivos | Creado por |
|------------|----------|------------|
| `docs/funky-ai/canvas/` | PROJECT-CANVAS.md, INFRA-CANVAS.md, canvas-planning-guide.md | `funky init` |
| `docs/funky-ai/assess/` | architecture-review.md, architecture-decisions.md | `funky assess` |
| `docs/funky-ai/estimate/` | pricing-guide.md, pricing-decisions.md | `funky estimate` |
| `docs/funky-ai/pipeline/` | context.json (metadatos, sin canvases) | `funky pipeline` |
