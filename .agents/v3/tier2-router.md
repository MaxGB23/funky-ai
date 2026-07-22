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
> - **Fase Apply:** Lanza un subagente /funky-worker, referenciandole su archivo tasks.md a ejecutar. En caso de que funky-tasks haya devuelto un gran riesgo o cantidad de líneas o files, lanza workers por batches. En forma secuencial, nunca paralela, siempre se confirma que termine uno antes de lanzar el siguiente. El report.md es la clave para asegurar el éxito de cada batch.
> - **Fase Verify:** Ejecuta `view_file .agents/rules/tier2-delegation/t2-verify.md`
> - **Fase Archive:** Ejecuta `view_file .agents/rules/ PENDIENTE`
> - **Fase Release:** Tú como orquestador debes leer openspec/changes/{feature_name}/release.md y docs.md(sí existe). Completar los checklist y parar en fase git ops, debes pedir aprobacion humana.


**Si no lees el archivo de la fase antes de delegar, estarás rompiendo una regla absoluta de orquestación.**
