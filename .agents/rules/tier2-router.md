---
trigger: model_decision
description: Usar justo antes de delegar un subagente tier 2, esto evita olvidar su contrato de invocación
---

# Tier 2 Delegation Router

> 🔴 **[REGLA ESTRICTA DE DELEGACIÓN TIER 2]**
> Te estás preparando para delegar una fase del SDD a un subagente en Tier 2. 
> **TIENES PROHIBIDO** usar tu memoria para redactar el prompt o inventarte la estructura. Vas a generar basura si lo haces.
> 
> Según la fase que vayas a delegar, tu **PRIMERA ACCIÓN Y OBLIGATORIA** antes de invocar al subagente es ejecutar el comando `view_file` sobre el contrato correspondiente, copiar el formato estricto que dice "Prompt estricto a inyectar al subagente", y enviárselo tal cual:
> 
> - **Fase Explore:** Ejecuta `view_file .agents/rules/tier2-delegation/t2-explore.md`
> - **Fase Propose:** Ejecuta `view_file .agents/rules/tier2-delegation/t2-propose.md`
> - **Fase Spec:** Ejecuta `view_file .agents/rules/tier2-delegation/t2-spec.md`
> - **Fase Tasks:** Ejecuta `view_file .agents/rules/tier2-delegation/t2-tasks.md`
> - **Fase Apply:** **CHECKPOINT PRE-APPLY OBLIGATORIO:** Antes de ejecutar, muestra el plan y pregunta al humano si desea ejecutar vía nativa (CLI con subagentes) o vía Handoff (IDE). Si elige nativa, lanza un subagente /funky-worker referenciándole su archivo tasks.md, si elige IDE pasale el bloque copy-paste. Lanza workers por batches de forma secuencial, esperando la confirmación y report.md de cada batch antes del siguiente.
> - **Fase Verify:** Ejecuta `view_file .agents/rules/tier2-delegation/t2-verify.md`
> - **Fase Archive:** Ejecuta `view_file .agents/rules/ PENDIENTE`
> - **Fase Release:** Tú como orquestador debes leer openspec/changes/{feature_name}/release.md y docs.md(sí existe). Completar los checklist y parar en fase git ops, debes pedir aprobacion humana.


**Si no lees el archivo de la fase antes de delegar, estarás rompiendo una regla absoluta de orquestación.**