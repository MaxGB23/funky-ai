# Reporte de Auditoría de Estructura (010-repo-audit)

## Resumen de Hallazgos
La extracción automatizada y el análisis de la estructura del repositorio permitieron generar el `docs/repo-map.md`. Se identificaron los siguientes puntos críticos:

1. **Anomalías en Core (`funky-cli/`):**
   - Existen dos carpetas de testing: `test/` (2 archivos) y `tests/` (varios archivos de integración). Esto rompe la consistencia. Deben consolidarse en `tests/`.

2. **Carpetas Legacy/Ghost en Documentación (`docs/`):**
   - `gentle-ai/`: Artefactos del viejo sistema Gentle AI. Ya no tiene propósito activo y ensucia el contexto.
   - `github-logs/`: Logs de fallos viejos que ya no aportan valor.

## Acciones Propuestas (Limpieza)
Se recomienda al Orquestador ejecutar los siguientes comandos para limpiar el proyecto y consolidar las pruebas:

```powershell
# 1. Consolidar testing en funky-cli
Move-Item -Path "funky-cli\test\*" -Destination "funky-cli\tests\" -Force
Remove-Item -Path "funky-cli\test" -Recurse -Force

# 2. Limpiar carpetas ghost en docs
Remove-Item -Path "docs\gentle-ai" -Recurse -Force
Remove-Item -Path "docs\github-logs" -Recurse -Force
```

## Artefactos Generados
- `docs/repo-map.md` con la taxonomía oficial de directorios y su estado.
- `raw-tree.txt` (temporal) usado para la inferencia.

## Fase 5 — Deep-Dive y Resolución
- **Status:** ✅ Completada
- **Resolución de Testing:** Los archivos `assess.test.js` y `assessRules.test.js` en `funky-cli/test/` eran complementarios a la batería principal. Fueron movidos exitosamente a `funky-cli/tests/` y la carpeta `test/` fue eliminada para evitar redundancia.
- **Archivos Mapeados:** Se escanearon 8 subdirectorios dentro de `docs/funky-ai/` (`auditoria-gentle-ai`, `core-concepts`, `guias`, `journey`, `mierdilla`, `releases`, `retrospectivas-lecciones`, `workflows`) y se añadieron como un nuevo nivel de detalle al `repo-map.md`. Adicionalmente, se preservó `gentle-ai` moviéndola a `docs/archive/gentle-ai/` y se marcó `github-logs/` como Activo (Standby) por su utilidad de fallback.
- **Próxima acción:** Instruir al humano a regresar al Orquestador con el reporte final.
