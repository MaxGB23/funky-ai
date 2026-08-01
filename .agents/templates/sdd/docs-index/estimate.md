# Índice de Secciones: `docs/funky-forge/estimate.md`

- **1. ¿Qué problema resuelve?:** Estimación de costos basada en decisiones de arquitectura y canvases.
- **2. ¿Cuándo usarlo standalone?:** Sesión de pricing independiente sin pipeline activo.
- **3. ¿Cuándo usarlo con pipeline?:** Paso final tras `assess`, integrado vía `--context`.
- **4. Requisitos previos:** Canvases, decisiones de arquitectura (recomendado) y directorio de salida auto-creado.
- **5. Inputs:** Canvases, `architecture-decisions.md` y templates de pricing.
- **6. Outputs:** `pricing-guide.md`, `pricing-decisions.md` y prompt completo en stdout.
- **7. Diagrama de flujo:** Proceso de lectura de contexto, interpolación de templates y escritura de archivos.
- **8. Flags:** `--context, -c <path>` para integración con pipeline.
- **9. Próximos pasos:** Copiar el prompt, discutir pricing con la IA y documentar los acuerdos.
