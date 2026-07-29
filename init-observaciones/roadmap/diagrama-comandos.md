# Diagrama de Responsabilidad de Comandos

> Generado: 2026-07-28 (actualizado post-verificación)
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
| 🐛 | Bug detectado |

---

## `funky init` (sin flags)

```
🔍 Verifica que NO existan PROJECT-CANVAS.md ni INFRA-CANVAS.md
   ↓
✍️ PROJECT-CANVAS.md → raíz
✍️ INFRA-CANVAS.md → raíz
📄 canvas-planning-guide.md → raíz
```

## `funky init --bootstrap`

```
🔍 No requiere canvases (si existen los respeta)
   ↓
🔄 runInit() → 13 copias + 7 directorios + 1 index:
   ├── 📄 ORCHESTRATOR-STATE.md → raíz
   ├── 📄 agents-rules-engram-protocol.md → .agents/rules/engram-protocol.md
   ├── 📄 agents-rules-secops.md → .agents/rules/secops.md
   ├── 📄 agents-rules-sdd-orchestrator.md → .agents/rules/sdd-orchestrator.md
   ├── 📄 agents-rules-secops-setup.md → .agents/rules/secops-setup.md
   ├── 📄 architecture-assessment.md → docs/architecture-assessment.md (creo deprecado)
   ├── 📄 architecture-assessment-guide.md → docs/architecture-assessment-guide.md (creo deprecado)
   ├── 📄 TEMPLATE_GUIDE.md → raíz
   ├── 📄 README.md → raíz (sobreescribe)**No debe sobreescribir**
   ├── 📄 rfc-template.md → openspec/rfcs/000-TEMPLATE.md (cambiar nombre a 000-RFC-TEMPLATE.md)
   ├── 📄 engram-discoveries.md → docs/engram/discoveries.md
    ├── 📄 engram-bugfixes.md → docs/engram/bugfix/bugfixes.md (FALTAN MUCHAS COSAS,)
    ├── 📄 release.md → release-template.md (template de release notes)
    ├── 🗂️ docs/engram/{architecture,pattern,discovery,decision,bugfix,session,release}
    └── ✍️ docs/engram/index.md
```

> 💡 **Descubrimiento:** `canvas-planning-guide.md` estaba duplicado — init lo copiaba a raíz y bootstrap también lo copiaba a `docs/funky-ai/cli/`. Se removió de bootstrap. La guía es material de init, no de bootstrap.

---

## `funky assess`

```
🔍 PROJECT-CANVAS.md + INFRA-CANVAS.md (desde archivos o context.json)
🔍 templates/sdd/architecture-review-template.md
🔍 templates/sdd/architecture-decisions-template.md (si no existe decisions)
   ↓
✍️ .agents/prompts/architecture-review.md (guía 6 fases + C1/C2)
✍️ docs/architecture-decisions.md (template si no existía)
📌 Con --context: actualiza context.json (assess.runAt + dynamicQuestions)
```

---

## `funky estimate`

```
🔍 PROJECT-CANVAS.md + INFRA-CANVAS.md
🔍 docs/architecture-decisions.md
🔍 templates/sdd/pricing-guide-template.md
🔍 templates/sdd/pricing-decisions-template.md
   ↓
✍️ .agents/prompts/pricing-guide.md
✍️ .agents/prompts/pricing-decisions-template.md
✍️ stdout: prompt IA (banner + cuerpo + footer)
📌 Con --context: actualiza context.json (estimate.runAt)
```

---

## `funky pipeline`

```
pipeline assess:
   ├── 🔍 context.json (crea si no existe con canvases)
   ├── 🔗 runAssess(targetBase, { context })
   └── 💾 context.json (assess.runAt + dynamicQuestions)

pipeline estimate:
   ├── 🔍 context.json (valida que exista + assess.runAt)
   ├── 🔗 runEstimate(targetBase, { context })
   └── 💾 context.json (estimate.runAt)

pipeline all:
   ├── 🔍 context.json (crea si no existe)
   ├── 🔗 pipeline assess
   ├── 🔗 pipeline estimate
   └── ✅ "Pipeline complete!"

pipeline status:
   └── 🔍 context.json → stdout (muestra estado)
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

> 🐛 **Bug (legacy):** El modo legacy (sin tier, 9 archivos) referencia `design.md`, `apply.md`, `verify.md` que **no existen** en `templates/sdd/`. El comando intenta copiarlos y falla silenciosamente o con error.

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

## Templates disponibles en `templates/sdd/`

| Template | ¿Se usa? |
|----------|----------|
| explore.md | ✅ feature (T2) |
| proposal.md | ✅ feature (T2) |
| spec.md | ✅ feature (T2) |
| tasks.md | ✅ feature (T1/T2/T3) |
| report.md | ✅ feature (T1/T2) |
| docs.md | ✅ feature (T2/T3 condicional) |
| release.md | ✅ feature (T2/T3) — release checklist |
| architecture-assessment.md | ❌ bootstrap (copiado por --bootstrap) |
| architecture-review-template.md | ✅ assess |
| architecture-decisions-template.md | ✅ assess |
| pricing-guide-template.md | ✅ estimate |
| pricing-decisions-template.md | ✅ estimate |
| rfc-template.md | ❌ bootstrap (copiado por --bootstrap) |

---

## Bugs resueltos (PASO 2)

| # | Problema | Resolución |
|---|----------|------------|
| 🔧 1 | `funky phase` con template mismatch | ✅ **Eliminado** — comando eliminado |
| 🔧 3 | `release.md` duplicado | ✅ **Eliminado** — `templates/release.md` movido a `templates/bootstrap/release.md`, `funky release` eliminado |
| 🔧 4 | Golden path de gentle roto | ✅ **Eliminado** — comando y templates `gentle/` eliminados |
| 🔧 5 | `canvas-planning-guide.md` duplicado | ✅ **Corregido** — removido de `runInit()` |
| 🐛 2 | Legacy mode feature roto | ⏳ **Pendiente** — no afecta el flujo activo (usa tiers T1/T2/T3) |
