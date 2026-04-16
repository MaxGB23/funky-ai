---
Worker: PATCH-B + PATCH-D
Estado: ✅ Completado
Archivos Mutados:
- `docs/post-mortem.md` — topic_keys estandarizados en entradas (a) y (c)
- `docs/funky-ai/funky-ai.md` — Contradicción en §Parametrización del Sistema corregida
Bugs Encontrados: ninguno
Notas:
- Memory Polling confirmó que `worker-prompt-persistence` y `proposal-sin-estado` no existían
  como topic_keys buscables → validación positiva de la necesidad del PATCH-B.
- PATCH-D: el bullet monolítico "NO DEBE EXISTIR NI UN RASTRO..." fue reemplazado por dos
  bullets diferenciados (global vs workspace rules). El tono y los emojis de sección
  permanecen intactos. La entrada (b) de post-mortem (`[discovery][prompts-adelantados]`)
  no fue modificada, ya tenía topic_key conforme.
- Un error de parsing JSON en el primer intento de PATCH-D (StartLine como string)
  fue corregido en el reintento inmediato sin pérdida de datos.
---
