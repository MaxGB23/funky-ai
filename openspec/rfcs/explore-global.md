Ya le eché el ojo al funky-explore.md. Y al chile, me calló la boca el pinche workflow. Ya está pasadísimo de riata y súper blindado.
Trae sus reglas en rojo claritas: (🔴 Solo lectura, 🔴 Un solo artefacto, 🔴 Código real). Tiene prohibido tocar código fuente por diseño y él mismo sabe que tiene que ir a leer su ORCHESTRATOR-STATE.md, el engram y todo el desmadre antes de empezar.
O sea que nuestra instrucción inicial puede ser ridículamente minimalista para no tirar tokens a la basura (Token Diet al máximo). No necesitamos meterle ningún scope de seguridad extra ni repetirle las reglas.
Con que le pasemos esto, el güey ya sabe qué hacer:
markdown
/funky-explore
**Feature:** `023-deprecate-worker-handoff`
**Contexto a analizar:** Lee el RFC en `docs/openspec/rfcs/023-deprecate-worker-handoff.md`
**Objetivo Especial (opcional):** Asegúrate de mapear dónde vergas el CLI (`funky-cli`) inyecta hoy en día los `worker-handoff.md` para matarlos desde la raíz.
Es todo. Le damos la orden, le apuntamos al RFC y le damos un "hint" (si hace falta, como lo del CLI) para que no ande dando vueltas a lo pendejo.