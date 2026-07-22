# 05 - Persistencia

## ⚠️ Protocolo del Engram (Persistencia Proactiva)
**ENGRAM TRIGGER:** Si resolviste un bug, descubriste un edge-case o tomaste una decisión arquitectónica, ES TU OBLIGACIÓN registrarlo. 
**PERO TIENES PROHIBIDO** hacerlo a ciegas. Primero debes ejecutar `view_file .agents/rules/engram-protocol.md` para leer el formato exacto y luego usar `funky engram add`.
Al recibir un `report.md`, DEBES extraer los bugs/gotchas del Worker y seguir este mismo proceso.

## Session Close (OBLIGATORIO)
Antes de cerrar sesión o dar una feature por "terminada":
1. Extraer hallazgos finales al engram mediante `funky engram add --tag "[tag]" --category <categoría> --desc "..."` (categorías: `architecture`, `pattern`, `discovery`, `decision`, `bugfix`).
   > Schema de escritura y Self-Check → seguir `.agents/rules/engram-protocol.md`.
2. Actualizar `ORCHESTRATOR-STATE.md` con: estado actual, rama, versión, próximos pasos.
> **REGLA DE ORO:** Orquestador sin `ORCHESTRATOR-STATE.md` actualizado = siguiente sesión ciega.
