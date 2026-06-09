# [brittle-tests-filecount] Pruebas de CLI frágiles: el test de feature.js usaba toHaveBeenCalledTimes(10) para verificar copias de templates. Al remover un archivo del scaffold (worker-handoff), la prueba falló. Se ajustó a 9, pero el patrón sugiere evitar conteos hardcodeados de archivos esperados.

Fecha: 2026-06-09

## Contexto

## Detalle
