# Spec: Project Cost & Pricing Estimator (RFC 002)

## 1. Arquitectura y Componentes
La solución se implementará directamente en el CLI usando las herramientas existentes.
- **Comando CLI:** Nuevo comando `funky estimate`.
- **Extractor de Contexto:** Utilidad para leer el `canvas-planning-guide.md` del proyecto y contar/extraer variables de complejidad (NFRs, integraciones).
- **Consola Interactiva:** Flujo con `@inquirer/prompts` para recolectar los Factores Contextuales.
- **Generador de Markdown:** Motor que inyecta la información en un template y lo guarda en disco para no perder el historial.

## 2. Flujo de Ejecución
1. El usuario ejecuta `funky estimate` en la terminal.
2. La CLI intenta localizar y escanear el Canvas del proyecto.
3. La CLI pregunta por consola:
   - *¿Región / Poder adquisitivo del cliente?*
   - *¿Tamaño de la empresa?*
   - *¿Urgencia del proyecto?*
4. La CLI calcula un "Multiplicador de Riesgo" y un "Piso Base".
5. La CLI genera y guarda un archivo físico (ej. `docs/pricing-analysis.md`).

## 3. Estructura del Artefacto Generado (`pricing-analysis.md`)
Este archivo cumple **doble función**: es un **registro histórico persistente** de las variables elegidas en la consola, y a su vez es un **prompt** para la IA.

*Estructura del archivo:*
- **1. Registro de Datos:** Respuestas ingresadas en consola (País, Urgencia) y factores técnicos extraídos.
- **2. Cálculo Base:** El piso de precio crudo que calculó la CLI.
- **3. Prompt de Mentoría:** Instrucciones inyectadas para que el LLM lea el registro y debata el Value-Based Pricing con el usuario.
