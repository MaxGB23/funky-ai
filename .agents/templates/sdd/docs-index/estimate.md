# Índice de Secciones: `docs/funky-forge/estimate.md`

- **1. ¿Qué problema resuelve?:** Estimación de costos cruzando decisiones de arquitectura y canvases.
- **2. ¿Cuándo usarlo standalone?:** Sesión de pricing independiente sin pipeline activo.
- **3. ¿Cuándo usarlo con pipeline?:** Paso final tras `assess`, integrado vía `--context`.
- **4. Requisitos previos:** Canvases, decisiones de arquitectura (recomendado) y directorio de salida auto-creado.
- **5. Inputs:** Canvases (referenciados, no incrustados), `architecture-decisions.md` y templates de pricing.
- **6. Outputs:** `pricing-guide.md` (aditiva por marcadores), `estimate-prompt.md`, `pricing-decisions.md` y resumen por archivo en stdout.
- **7. Contrato de feedback por archivo:** Aditivo sin preguntar; Y/N solo ante pérdida potencial; decisiones no sobrescribibles.
- **8. Diagrama de flujo:** Lectura de contexto, descubrimiento de canvases, incrustación aditiva de flags y escritura de archivos.
- **9. Flags:** `--context, -c`, `--brief`, tópicos (`--roles`, `--multi-tenant`, `--transactions`, `--security`, `--concurrency`, `--integrations`) y `--pricing-team`.
- **10. Próximos pasos:** Copiar el prompt, discutir pricing con la IA y documentar los acuerdos.
