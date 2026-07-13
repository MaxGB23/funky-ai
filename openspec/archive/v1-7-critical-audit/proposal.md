# Propuesta: Auditoría Crítica y Matriz de Simulaciones v1.7.0

## Solución Propuesta (Estrategia de Worker)

No vamos a parchear a ciegas. La estrategia es despachar a un Worker con un mandato dual de Quality Assurance (QA) y Fix:

### Fase 1: Auditoría y Modelado de Simulaciones
El Worker no tocará código inicialmente. Deberá leer el AST y la lógica de `init.js` y `phase.js` y generar un nuevo artefacto documental (ej. `docs/funky-ai/cli-simulations.md`). 
Este documento detallará una Matriz de Casos de Uso, definiendo explícitamente el contexto, la acción del usuario y el resultado esperado innegociable. Ejemplos de simulaciones a incluir:
- **Simulación A:** Ejecutar `init` con `PROJECT-CANVAS.md` ya existente. (Esperado: Inicialización silenciosa, **sin sobreescritura**).
- **Simulación B:** Ejecutar `init --template` en un disco donde ya hay un Canvas. (Esperado: Error graceful, sin destrucción).
- **Simulación C:** Cancelar los prompts interactivos con `Ctrl+C`. (Esperado: Salida limpia sin dejar archivos a medio escribir).
- **Simulación D:** Disco con permisos de solo lectura (`EACCES`).

### Fase 2: Fix y TDD
Una vez que el Orquestador apruebe el documento de simulaciones, el Worker implementará:
1. El fix del bug destructivo (ignorando la escritura de `PROJECT-CANVAS.md` si viene de `canvasConfig.fromHeadless`).
2. Los Integration Tests que automaticen las simulaciones documentadas en la Fase 1.

### Fase 3: Consolidación
El Worker documentará los hallazgos en el `report.md` y actualizará el engrama si descubre algún nuevo anti-patrón de Commander o fs.

## Riesgos Considerados
- Que el Worker se salte la redacción del documento de simulaciones y vaya directo a codear. Se mitigará usando un `tasks.md` estricto que lo obligue a pausar después de la Fase 1 para revisión humana.
