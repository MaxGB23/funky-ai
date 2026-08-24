---
trigger: manual
---

# Regla JIT — Codegraph
El schema de la herramienta MCP ya documenta su uso técnico. Esta regla cubre solo la **política de decisión** y los límites del proyecto. Referenciada desde el protocolo de investigación del prompt global.

## Política
1. Pregunta estructural → UNA consulta codegraph inline ANTES de cualquier loop de search/grep/read.
2. Índice ausente (`<raíz>/.codegraph/` no existe) → inicialízalo UNA vez: `gentle-ai codegraph init --cwd <raíz>` si tienes gentle-ai; si no, `codegraph init`. Un índice faltante es disparador de init, no razón para saltar a grep.
3. NO re-verifiques sus resultados con grep — la fuente devuelta es exacta y con líneas.
4. Tras editar confía en el watcher; fuerza sync solo si reporta stale que no refresca.
5. Si la herramienta o el índice fallan de forma persistente → cae a herramientas nativas y continúa. No bloquees la tarea.

## Límites duros
- PROHIBIDO ejecutar comandos destructivos o administrativos: `uninit`, `uninstall`, `upgrade`, `install`.
- `index` solo para recuperación explícita de corrupción, nunca de rutina.
- No inicializar en `$HOME`, carpetas temporales ni directorios no-proyecto.

> Capa 2 de Route A usa este contrato. También aplica fuera de ella: lectura de RFCs, diseño y verificación.