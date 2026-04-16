# ORCHESTRATOR-STATE.md
> Archivo canónico de estado. Leer al inicio de CADA sesión de Orquestador antes de hacer cualquier cosa.

---

## Objetivo
Implementación de la Versión 1.2 (`feature/v1.2-funky-cli`): Creación del CLI de Funky AI en Node.js, automatización de plantillas y sharding del Falso Engram para resolver el token bloat y oficialización de slash commands.

## Instrucciones Aprendidas
- El usuario prefiere estricta adherencia al protocolo de delegación manual "Un Worker a la vez" para no generar cruces cognitivos.
- Los templates SDD se acordó guardarlos como archivos físicos `.md` en lugar de variables de JavaScript para mayor flexibilidad (implementado en V1.2-D).

## Descubrimientos
- **Grep Regex Topic Key:** Identificado en la etapa inicial. La rule `.agents/rules/engram-protocol.md` fue corregida para instruir a los subagentes a buscar los `topic_key` compuestos (ej. `[bugfix][auth-model]`) usando `IsRegex: true` con backslashes en la tool de `grep_search`.
- **API Status:Approved (Gentle AI):** El chequeo de etiquetas vía GitHub API es excesivo para nosotros ahora. Usamos validaciones simples (`Closes #XY`).
- **Sharding en Acción:** El viejo y grandote `post-mortem.md` fue purgado. La data histórica ahora vive limpia bajo `docs/engram/bugfixes.md` y `docs/engram/discoveries.md`.

## Completado
- `PATCH-A`, `PATCH-B`, `PATCH-D`, `PATCH-F` ✅ (Estabilidad del core lograda, rule de engram actualizada y bug de regex fixed).
- `V1.2-A` ✅ (Auditoría CI/CD Gentle AI).
- `V1.2-B` ✅ (Diseño técnico del CLI en markdown).
- `V1.2-C` ✅ (Scaffolding Node + `funky init` con Commander).
- `V1.2-D` ✅ (Comando `funky phase` y carga dinámica de templates MD protectivos).
- `V1.2-E` ✅ (Manuales de equipo actualizados sobre el workflow `/sdd-*` + CLI).
- `V1.2-F` ✅ (Sharding completado: Migrado post-mortem a `docs/engram/*` y engram-protocol.md actualizado enseñándole a la IA a escribir dinámicamente).

## Próximos Pasos
- **Release V1.2:** Crear un PR de la rama `feature/v1.2-funky-cli` a `main`. Documentar el release notes de la v1.2 y publicarlo a nivel repo.
- **Horizonte V1.3:** Setup the Git-Ops Skills (automatización e interceptación de git diffs).

## Archivos Relevantes
- `funky-cli/bin/funky.js` — Core router del nuevo CLI automatizado.
- `.agents/rules/engram-protocol.md` — La regla sagrada, ya configurada para soportar memoria distribuida.
- `docs/BACKLOG.md` — Todo V1.2 y V1.1.1 tildado.
- `docs/engram/` — El directorio físico de nuestra nueva memoria dividida. 
