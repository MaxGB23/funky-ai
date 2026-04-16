# ORCHESTRATOR-STATE.md
> Archivo canónico de estado. Leer al inicio de CADA sesión de Orquestador antes de hacer cualquier cosa.
> Equivalente a `mem_context()` de Gentle AI.

---

## 🎯 Objetivo Actual
La v1.1.1 (Patches de protocolo) está **100% completada**. El próximo objetivo es diseñar técnicamente el `funky-cli` para la `v1.2`.

## 📋 Estado del Proyecto
- **Versión activa:** v1.1.1 (patches aplicados en esta sesión)
- **Rama en progreso:** `feature/v1.2-funky-cli` (scaffolding Node.js inicializado en sesión anterior)
- **Siguiente acción inmediata:** Atacar los items de la v1.2 del BACKLOG. Empezar por `V1.2-A` (auditar CI/CD de Gentle AI) antes de picar código del CLI.

## ✅ Completado en Esta Sesión — Patches v1.1.1
- `PATCH-A` ✅ — `.agents/rules/engram-protocol.md` enriquecido con §3 Trigger Taxonomy, §4 Topic Key/Upsert, §5 Session Close Protocol. Worker 1.
- `PATCH-B` ✅ — `docs/post-mortem.md` estandarizado: topic_keys `[worker-prompt-persistence]` y `[proposal-sin-estado]` agregados a headers. Worker 2.
- `PATCH-D` ✅ — `docs/funky-ai/funky-ai.md` §Parametrización corregido: contradicción resuelta con 2 bullets diferenciados (global vs `.agents/rules/`). Worker 2.
- `PATCH-F` ✅ — `.agents/skills/sdd-proposal.md` creado: primer Skill del ecosistema, template PRD-style con trigger: manual. Worker 3.
- `BACKLOG.md` ✅ — Todos los patches marcados como completados.
- `docs/post-mortem.md` ✅ — 2 nuevas entradas de discovery agregadas por el Orquestador.

## 🧠 Instrucciones Aprendidas
- El usuario prefiere el flujo Worker-por-Worker con análisis de reporte entre cada uno. **NUNCA pre-generar todos los briefs en cadena.** Ver `[discovery][prompts-adelantados]` en post-mortem.
- Los briefs de Workers deben construirse DESPUÉS de leer el reporte del Worker anterior — el ciclo de feedback es el valor central del protocolo.

## 🔍 Descubrimientos de Esta Sesión
1. **grep_search falla con topic_keys compuestos en headers H3.** El modo substring no matchea `### [discovery][topic-key] Título`. Solución: usar `IsRegex: true` con patrón escapado `\[tipo\]\[topic-key\]`. Documentado en `[discovery][grep-regex-topic-key]` del post-mortem. **PENDIENTE:** Actualizar §4 del `engram-protocol.md` para incluir esta advertencia.
2. **Primer Skill del ecosistema creado.** La distinción `trigger: manual` (Skills) vs `trigger: glob/model_decision` (Rules) quedó formalizada en el frontmatter de `sdd-proposal.md`.

## 🔴 Pending Inmediato
- **[DEUDA TÉCNICA]** Actualizar `engram-protocol.md` §4 Topic Key/Upsert con advertencia sobre `IsRegex: true` para búsquedas de topic_keys compuestos. (Detectado por W3, no estaba en el scope original.)
- **[V1.2-A]** Auditar CI/CD de Gentle AI — mandar Worker Analista a leer `docs/gentle-ai/.github/workflows/`.
- **[V1.2-B]** Diseño técnico del CLI (Orquestador — sin picar código).

## 📁 Archivos Clave
- `docs/BACKLOG.md` — Fuente de verdad de tareas.
- `docs/post-mortem.md` — Engram del proyecto (ahora con 5 entries y topic_keys estandarizados).
- `.agents/rules/engram-protocol.md` — Rule de memoria completa (v1.1.1).
- `.agents/skills/sdd-proposal.md` — Primer Skill PRD-style del ecosistema.
- `docs/funky-ai/funky-ai.md` — Protocolo corregido en §Parametrización.
- `funky-cli/package.json` — Scaffolding Node.js del CLI (rama feature/v1.2-funky-cli).
- `docs/funky-ai/workers/` — Carpeta con Return Envelopes de W1, W2, W3 de esta sesión.

## 🔭 Horizonte
- `v1.2` → `funky-cli` en Node.js (scaffolding, slash commands, sharding de memoria).
- `v1.3` → Git-Ops Skill (PR automation, git diff analysis).
