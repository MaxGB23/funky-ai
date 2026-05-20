# Explore: 016 Environment Selector (IDE vs CLI)

## Análisis del Problema
Actualmente, el comando `funky init` inyecta las reglas globales de agente y plantillas de SDD en el directorio de inicialización asumiendo siempre el entorno interactivo de Antigravity IDE. Con el surgimiento del Antigravity CLI y sus capacidades asíncronas de delegación en background, necesitamos que los templates y reglas de sistema diverjan sin afectar la retrocompatibilidad.

## Investigación
1. **Directorio actual de templates:** `funky-cli/src/templates/bootstrap/` contiene archivos críticos como `agents-rules-sdd-orchestrator.md` y `agents-rules-engram-protocol.md`.
2. **Impacto en `init.js`:** La función `runInit` mapea estáticamente los archivos a copiar. El comando Commander (`initCommand`) no pregunta por el entorno objetivo.
3. **Restricción Operativa:** No debemos depreciar el soporte para IDE. La solución requiere separar los directorios destino en subcarpetas lógicas (`ide/` y `cli/`) dentro de `bootstrap/`, y hacer que la función resuelva estas rutas dinámicamente en base a una variable de entorno inyectada por un prompt.

## Conclusión
La arquitectura es clara. Se necesita refactorizar `init.js` para incluir la pregunta de Clack (`p.select`) al inicio del flujo y parametrizar la resolución de los *source paths* de reglas dependientes del entorno, conservando archivos universales compartidos para evitar deuda técnica innecesaria.
