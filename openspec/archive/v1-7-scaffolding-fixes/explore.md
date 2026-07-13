# Exploración: Scaffolding Fixes v1.7.0

## Contexto
Durante el Smoke Test de v1.7.0 se detectaron dos deficiencias estructurales en el proceso de inicialización del CLI (`funky init`):
1. **Sync Drift:** Las reglas base (`secops.md`, `engram-protocol.md`, etc.) y estados de la carpeta `funky-cli/src/templates/bootstrap/` están desfasados con la realidad del proyecto, ya que se copian manualmente.
2. **Incomplete Scaffolding:** El ecosistema inyectado no provee las plantillas canónicas SDD completas (especialmente el `plantilla-worker-handoff.md`). Sin ellas, los Agentes en el nuevo proyecto carecen de contexto para ejecutar sus tareas bajo el protocolo estricto.

## Objetivos
- Automatizar la sincronización de templates desde el workspace vivo hacia el CLI.
- Asegurar que `funky init` inyecte la plantilla canónica del Worker Handoff en el nuevo ecosistema.
