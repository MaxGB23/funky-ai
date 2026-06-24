Análisis funky-tasks.md — solo lo específico
El prompt se divide en dos: secciones de siempre (bootstrap genérico, artifact_state, etc. — ya sabemos que hay que corregirlas en todos los workflows) y una particularidad propia: has_design.
- has_design es un parámetro opcional, no obligatorio como artifact_state o feature_name. Solo lo pasa el orquestador cuando el tier SDD incluye design phase.
- Si el orquestador lo pasa → el agente lee design.md como input.
- Si no lo pasa → el agente ni lo intenta. Cero tool calls al pedo.
- Es opcional porque has_design es un dato de contexto del tier, no un campo universal como artifact_state. Tasks es la única fase donde design.md es condicional — en propose/spec/design/apply/verify/archive o no entra o entra siempre.
- El contrato queda: feature_name (obligatorio), artifact_state (obligatorio), has_design (opcional — solo si aplica).
