# Tareas (010 - Auditoría de Estructura)

> **Instrucción para el Worker**: Ejecutar las fases de a una por vez y confirmar al finalizar. NO elimines archivos ni carpetas en estas fases, solo documentá.

## Fase 1 — Extracción del Árbol Crudo (Automatización)
- [x] NO escanees carpeta por carpeta a mano. Ejecutá un comando de terminal (PowerShell) para dumpear el árbol completo del repositorio a un archivo temporal `docs/openspec/changes/010-repo-audit/raw-tree.txt`.
- [x] Asegurate de excluir `node_modules`, `.git` y `.github` para no saturar el contexto.
- [x] Validá que el archivo de texto contenga la estructura real y completa del proyecto.

## Fase 2 — Análisis Semántico por Partes
- [x] Leé el `raw-tree.txt`. Dado que puede ser largo, procesá la estructura mentalmente separándola en dominios: 1. Core (`funky-cli/`), 2. Docs (`docs/`), 3. Configuración Raíz.
- [x] Identificá anomalías de forma integral. Prestar especial atención a duplicados (`test/` vs `tests/` en el CLI) y carpetas legacy (`gentle-ai`, `github-logs` en `docs/`).
- [x] Determiná el estado real de cada directorio (Activo / Deprecated / Ghost).

## Fase 3 — Generación de Artefactos
- [x] Crear el archivo físico `docs/repo-map.md` siguiendo el formato definido en el `spec.md`. Incluir tablas con el Rol, Propósito y Estado de cada directorio analizado.
- [x] En caso de identificar "carpetas fantasma", marcarlas explícitamente como "Ghost / To Be Deleted".

## Fase 4 — Cierre y Reporte
- [x] Generar un archivo `docs/openspec/changes/010-repo-audit/report.md` resumiendo los hallazgos y proponiendo los comandos de limpieza (ej. `Remove-Item -Recurse -Force`).
- [x] Actualizar el `ORCHESTRATOR-STATE.md`, moviendo la tarea **010** a la sección de "Tareas Completadas" de la versión correspondiente o actual.
- [x] Extraer cualquier descubrimiento útil al engram (`docs/engram/discoveries.md`).
- [x] Instruir al usuario a regresar al Orquestador con el reporte listo.

## Fase 5 — Deep-Dive y Resolución de Conflictos (Análisis Humano)
- [x] Escanear en detalle el directorio `docs/funky-ai/`. Identificar sus subdirectorios/archivos clave y agregarlos como un nuevo nivel de detalle en `docs/repo-map.md`.
- [x] Analizar el código de `funky-cli/test/` vs `funky-cli/tests/`. Determinar si los tests son redundantes o complementarios. Proponer el plan exacto para unificarlos en `tests/` sin romper nada en el mergeo.
- [x] Archivar `docs/gentle-ai/` moviéndolo a `docs/archive/gentle-ai/` (crear el directorio si no existe) para preservarlo sin que contamine la raíz de docs.
- [x] Validar que `docs/github-logs/` esté correctamente documentado como directorio activo de logs en el mapa.
- [x] Actualizar el `report.md` con los resultados de esta fase.
