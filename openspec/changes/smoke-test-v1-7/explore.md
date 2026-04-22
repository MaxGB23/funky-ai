# Exploración: Smoke Test v1.7.0

## Contexto
Hemos completado la v1.7.0 que incluye el generador dinámico de `PROJECT-CANVAS.md` mediante `funky init`, soportando tanto el flujo interactivo con `@clack/prompts` como el modo headless. Tenemos 14/14 tests pasando (unitarios y de integración).

## Problema
Los tests de integración mockean la entrada del usuario o actúan sobre un entorno muy controlado. Necesitamos validar que la CLI empaquetada o ejecutada localmente funciona de manera impecable en un entorno real ("from scratch") antes de dar por cerrada la v1.7 definitivamente.

## Objetivos
1. Ejecutar `funky init` en un directorio vacío.
2. Validar la experiencia de usuario con `@clack/prompts`.
3. Confirmar que el output `PROJECT-CANVAS.md` refleje las opciones seleccionadas.
4. (Opcional) Validar también el modo headless en un entorno real.
