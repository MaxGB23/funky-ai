# Explore: refactor-cli-testing

## 1. Contexto del Problema
El equipo ha detectado que los tests unitarios y de integración del CLI de Funky AI en la carpeta `funky-cli/tests/` fallan constantemente ante cambios menores de texto en los templates (ej. corrección de typos, mejoras de prompt para los agentes). Esto sucede debido a un anti-patrón en el que se validan strings literales de lenguaje natural o prosa humana/IA (`toContain('texto literal')`). Esto añade fricción al desarrollo y degrada la Developer Experience (DX). 

## 2. Estado Actual del Codebase
Tras una auditoría de `funky-cli/tests/`, se confirmó la presencia del anti-patrón de aserciones literales:
- Uso generalizado de `expect(...).toContain(...)` para strings literales, títulos de markdown y viñetas estéticas.
- Afecta severamente a los tests: `canvas.test.js`, `assessRules.test.js`, `engram.test.js`, `engram.integration.test.js`, `release.test.js` y `templates.test.js`.
- Por otro lado, en `funky-cli/src/commands/`, la lógica de comandos como `init.js` (14.5 KB) mezcla definición de comandos, lógica de negocio e interacción pura con FileSystem de una forma que hace difícil probar el flujo sin depender de archivos de templates físicos reales, lo que contribuye a las malas prácticas de testing.

## 3. Context Preservation

### Reglas del RFC / input fuente
- **Prosa Humana/IA:** No afirmar (`assert`) textos literales, títulos de markdown, advertencias, o frases dentro de los templates de los agentes.
- **Formateo Estético:** Espacios, saltos de línea o emojis dentro de los templates.
- Validar que los comandos (`funky init`, `funky feature`) creen los archivos en los paths correctos.
- Validar que si un archivo ya existe (idempotencia), el CLI no lo destruya (a menos que se use un flag de sobrescritura).
- Comprobar que los parámetros dinámicos cambien el flujo (ej. `--skipProjectCanvas` no debe generar el canvas).
- Si el Orquestador o el script del CLI depende estructuralmente de encontrar una etiqueta para funcionar (ej. `<MANDATORY_RELEASE_PROTOCOL>`, `<OPTIONAL_DOC_UPDATE>`), esa etiqueta **sí es testeable**, ya que su eliminación rompe la máquina, no solo la legibilidad.

### Definiciones clave
- Ninguna regla explícita identificada.

### Scope no-negociable
- Auditar la carpeta `funky-cli/tests/` para purgar aserciones literales y mantener únicamente las pruebas que garanticen la integridad estructural y de inyección del CLI.

## 4. Opciones de Arquitectura

| Opción | Descripción | Pros | Contras / Tradeoffs |
|--------|-------------|------|---------------------|
| **Opción A: Purga In-place de Tests** | Únicamente borrar las aserciones frágiles (`toContain`) de `funky-cli/tests/` reemplazándolas por aserciones de paths (`fs.existsSync`) y regex de contratos máquina obligatorios. | - Rápido de implementar. - Menor riesgo de romper comandos core. | - Deja intacto el código de `src/` limitando las posibilidades de aislar pruebas. |
| **Opción B: Purga Integral + Desacople de Inyección (Recomendada)** | Purgar aserciones frágiles en `tests/` y extraer lógicas complejas de file system a servicios inyectables/utilidades (ej. separando `I/O` de la pura resolución de templates en `init.js`). | - Refuerza la DX. - Mejora la mantenibilidad de `src/` reduciendo el código espagueti. | - Requiere tocar `src/` con mayor cuidado. |

## 5. Recomendación + Riesgos
**Opción recomendada:** Opción B

**Justificación:**
El RFC prohíbe directamente evaluar strings de markdown en test de integración. Implementar la Opción B cumple con el RFC, a la par que resuelve el requerimiento del orquestador sobre "código espagueti y malas prácticas en `funky-cli/src`" (por ejemplo, el sobrepeso de `init.js`). Mejorar el diseño del CLI separando responsabilidades I/O vs Lógica facilitará escribir tests estructurales que no requieran leer los strings de texto de la capa de presentación.

**Riesgos mitigables:**
- [Regresiones silenciosas]: Al borrar aserciones, tests previamente restrictivos dejarán pasar errores. Mitigación: Consolidar "Golden path tests" verificando existencia de rutas y validando etiquetas de orquestación obligatorias.

## 6. NFR Candidates (Opcional)
Ninguno evidente.
