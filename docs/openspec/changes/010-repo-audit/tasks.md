# Tareas (010 - Auditoría de Estructura)

> **Instrucción para el Worker**: Ejecutar las fases de a una por vez y confirmar al finalizar. NO elimines archivos ni carpetas en estas fases, solo documentá.

## Fase 1 — Extracción del Árbol Crudo (Automatización)
- [ ] NO escanees carpeta por carpeta a mano. Ejecutá un comando de terminal (PowerShell) para dumpear el árbol completo del repositorio a un archivo temporal `docs/openspec/changes/010-repo-audit/raw-tree.txt`.
- [ ] Asegurate de excluir `node_modules`, `.git` y `.github` para no saturar el contexto.
- [ ] Validá que el archivo de texto contenga la estructura real y completa del proyecto.

## Fase 2 — Análisis Semántico por Partes
- [ ] Leé el `raw-tree.txt`. Dado que puede ser largo, procesá la estructura mentalmente separándola en dominios: 1. Core (`funky-cli/`), 2. Docs (`docs/`), 3. Configuración Raíz.
- [ ] Identificá anomalías de forma integral. Prestar especial atención a duplicados (`test/` vs `tests/` en el CLI) y carpetas legacy (`gentle-ai`, `github-logs` en `docs/`).
- [ ] Determiná el estado real de cada directorio (Activo / Deprecated / Ghost).

## Fase 3 — Generación de Artefactos
- [ ] Crear el archivo físico `docs/repo-map.md` siguiendo el formato definido en el `spec.md`. Incluir tablas con el Rol, Propósito y Estado de cada directorio analizado.
- [ ] En caso de identificar "carpetas fantasma", marcarlas explícitamente como "Ghost / To Be Deleted".

## Fase 4 — Cierre y Reporte
- [ ] Generar un archivo `docs/openspec/changes/010-repo-audit/report.md` resumiendo los hallazgos y proponiendo los comandos de limpieza (ej. `Remove-Item -Recurse -Force`).
- [ ] Actualizar el `ORCHESTRATOR-STATE.md`, moviendo la tarea **010** a la sección de "Tareas Completadas" de la versión correspondiente o actual.
- [ ] Extraer cualquier descubrimiento útil al engrama (`docs/engram/discoveries.md`).
- [ ] Instruir al usuario a regresar al Orquestador con el reporte listo.
