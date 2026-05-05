# Especificación: Mapa Estructural y Auditoría (010)

## Objetivo Final
Producir un documento vivo, preferiblemente `docs/repo-map.md` (o integrarlo en el Engrama de Arquitectura), que documente el árbol de directorios válido del repositorio y exponga la deuda técnica estructural.

## Entregables Requeridos
1. **Mapa del Repositorio (`docs/repo-map.md`)**: Un markdown con la estructura de carpetas y una tabla explicando: Rol, Propósito y Estado (Activo / Deprecated / Ghost).
2. **Propuesta de Limpieza**: Dentro del `report.md` del Worker, listar los comandos exactos (ej. `rm -rf docs/gentle-ai`) que se recomiendan ejecutar para limpiar la basura en la próxima iteración.
3. **Actualización de Estado**: Tachar el pendiente 010 en `ORCHESTRATOR-STATE.md`.

## Restricciones (Worker)
- **Modo Read-Only para eliminación**: El Worker **NO** debe eliminar las carpetas en esta fase. Solo debe mapearlas y marcarlas para su posterior destrucción.
- El análisis debe ser profundo. Si una carpeta como `docs/gentle-ai` tiene archivos con directivas valiosas, se debe advertir que hay que migrar esos archivos al engrama antes de borrar la carpeta.
