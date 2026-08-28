# Guía del Equipo: Operando Funky AI (SDD)

Bienvenido a la Torre de Control. Funky AI no es un plugin que escribe código por arte de magia; es un **framework de delegación estructurada (SDD)** donde tú eres el Arquitecto Principal y el Enrutador.

Tu objetivo principal: **Dejar de picar código de bajo nivel y enfocarte en tomar decisiones arquitectónicas de alto impacto.**

---

## 🧠 1. Tu Rol: El Router Humano
En Funky AI, los agentes (Orquestador y Workers) no toman decisiones destructivas ni saltan de una fase a otra por su cuenta en proyectos complejos. Tú eres la pieza clave de seguridad y contexto:

1. **Defines la misión:** Eres quien da el banderazo de salida.
2. **Ruteas y Apruebas:** Si el Orquestador te entrega un diseño, tú lo validas antes de que un Worker lo programe.
3. **Proteges el `main`:** Tú eres el único con autoridad moral para hacer merge a la rama principal.

---

## 🛤️ 2. El Flujo de Trabajo (Día a Día)

### Paso A: El Pre-Vuelo (Iniciando Tarea)
Arranca una sesión con tu Orquestador (ya sea mencionándolo en tu IDE o usando el CLI `funky feature mi-tarea`).
- El Orquestador evaluará lo que pides y te soltará el **Bloque de Recomendación**:
  ```
  Tier: [T1, T2 o T3]
  Docs: [Sí/No]
  Modo: [Interactivo/Auto]
  ```
- **Tu trabajo:** Confirmar estos parámetros. Sin esto, el Orquestador no cargará las reglas (Carga JIT) para ahorrar memoria.

### Paso B: Ejecución según el Tier
- **Tier 1 (Flash):** Tareas súper rápidas (1-2 archivos). Se ejecutan en caliente.
- **Tier 2 (Ligeros) y Tier 3 (Nativos):** El Orquestador pasará por fases: `Explore` -> `Propose` -> `Spec` -> `Tasks`.
- **Intervención:** En **Modo Interactivo**, el Orquestador se pondrá en pausa (estado *Idle*) en puntos clave (ej. después del Propose). Lee el documento generado. Si está bien, dile "Dale pa' lante". Si la regó, dile "Corrige esto" (así no gasta tokens recreando todo).

### Paso C: Cierre y Memoria (Engram)
Antes de cerrar el chat, asegúrate de que el Orquestador guarde lo importante (nuevos patrones, RCAs de bugs, ADRs) en la memoria persistente usando `funky engram add`.

---

## 🚨 3. Las 6 Reglas Inviolables (Hard Rules)
Estas son las "leyes de la física" de Funky AI. Romperlas significa ensuciar el contexto y causar que la IA alucine:

1. **El Orquestador NO pica código de negocio:** Su chat es para crear arquitectura (`.md`). Si le pides hacer una función en `.ts`, vas a saturar su memoria con detalles de implementación. Usa Workers.
2. **Todo Worker entrega un archivo físico:** Los resultados van a disco (`report.md` o artefactos SDD). El chat es descartable, el archivo es el contrato.
3. **El Engram se consulta ANTES de modificar:** Prohibido reinventar la rueda. Los agentes deben usar `grep_search` en `docs/engram/` antes de tomar decisiones.
4. **Protección de Contexto en 2 Pasos:** Prohibido leer (con `view_file`) un archivo gigante de 500 líneas a ciegas. Primero se busca la línea con `grep_search`, luego se lee. Los tokens son sagrados.
5. **`main` es Intocable:** Todo código generado por Workers va a una rama `feature/*` o `fix/*`.
6. **Uso Consciente:** Funky AI se activa para resolver ingeniería real. Si solo quieres un script desechable o arreglar un typo, hazlo tú a mano, no prendas toda la maquinaria.
7. **El Humano como Tool:** Las reglas de Funky AI están diseñadas por defecto para que el agente **proponga antes de tocar disco** — el humano aprueba cada cambio antes de que ocurra. Esto tiene una ventaja extra: cuando la propuesta es sencilla, el humano puede copiarla del chat y pegarla directamente, sin que el agente gaste `view_file` + `replace_file_content`. La acción física del humano es la tool call más barata del sistema. Es parte del diseño *free-tier-friendly* de Funky AI: úsala.
