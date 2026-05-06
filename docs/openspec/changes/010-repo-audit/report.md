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
