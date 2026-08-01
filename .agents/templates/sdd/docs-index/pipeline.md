# Índice de Secciones: `docs/funky-forge/pipeline.md`

- **1. ¿Qué problema resuelve?:** Orquestación de `assess` y `estimate` con estado compartido en `context.json`.
- **2. ¿Cuándo usar pipeline vs comandos individuales?:** Comparativa entre el flujo multi-fase y los comandos sueltos.
- **3. Subcomandos:** `assess`, `estimate`, `all` y `status`.
  - **`funky pipeline assess`:** Crea/lee `context.json` y ejecuta `assess` con `--context`.
  - **`funky pipeline estimate`:** Valida el contexto y `assess.runAt` antes de ejecutar `estimate`.
  - **`funky pipeline all`:** Ejecuta ambos en secuencia; corta si `assess` falla.
  - **`funky pipeline status`:** Muestra fechas de ejecución y progreso del pipeline.
- **4. `context.json` — estructura y funcionamiento:** Estado compartido entre fases.
  - **Estructura:** Schema con `version`, `assess`, `estimate` y `pipeline`.
  - **Cómo se crea:** `initContext()` genera los metadatos iniciales al vuelo.
  - **Cómo se usa:** Fuente de verdad leída con `readContext()` y escrita con `writeContext()`.
  - **Cómo NO usarlo (anti-patrones):** No editar a mano, no guardar canvases ni usar en proyectos chicos.
- **5. Diagrama de flujo:** Secuencia assess → estimate con validación de contexto.
- **6. Reglas:** Orden obligatorio de fases y ubicación de `context.json`.
