# Exploración: Auditoría de Estructura del Repositorio (010)

## Contexto
El objetivo es recorrer el repositorio `funky-ai` para detectar "carpetas fantasma" (legacy o sin uso), validar que la estructura real coincida con la documentada, y crear un mapa estructural.

## Hallazgos Iniciales
Al realizar un primer escaneo rápido como Orquestador, se detectaron varias anomalías:
1. **Directorio `docs/`**: Contiene subdirectorios sospechosos como `gentle-ai` (posible legacy del bot anterior), `github-logs`, `issues`, y `funky-ai` (redundante con el repo).
2. **Directorio `funky-cli/`**: Existen dos carpetas de testing a simple vista: `test/` y `tests/`. Esto es un *code smell* de estructura que rompe la convenciones TDD que se implementaron en la v1.6.

## Riesgos
- Eliminar carpetas que parecen "fantasma" pero que son referenciadas en el `ORCHESTRATOR-STATE.md` o en engramas históricos.
- Romper el CLI si eliminamos algo dentro de `funky-cli/src` por error.

## Conclusión
La auditoría es crítica y debe realizarse antes de agregar nuevas features. El Worker deberá entrar carpeta por carpeta, documentar el propósito y marcar cuáles son candidatas a limpieza.
