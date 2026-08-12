# Crítica Constructiva — Pipeline de Planeación Funky Forge

> Análisis técnico del sistema de 3 fases: init → assess → estimate.
> Incluye fortalezas reales, brechas con evidencia y propuesta de evolución del pipeline.

---

## Lo que funciona bien — y genuinamente bien

### SSOT con los canvases como árbitro

La decisión de centralizar toda la información del proyecto en tres archivos (`brief-funcional.md`, `PROJECT-CANVAS.md`, `INFRA-CANVAS.md`) y prohibirle a cualquier fase posterior inventar lo que no está escrito es una decisión arquitectónica correcta. La mayoría de los equipos tienen esa información fragmentada en Notion, Slack, correos y cabezas humanas. Cuando un proyecto falla o una cotización sale mal, el problema casi siempre tiene raíz en ese caos. Este sistema lo resuelve de raíz.

### El mecanismo de patch (SSOT activo)

Que `assess` no solo detecte fallas sino que corrija el canvas directamente (con aprobación del humano) y registre el cambio como changelog en `architecture-decisions.md` es un patrón maduro. No crea una "copia alternativa" del diseño que vive en el prompt y nunca se refleja en los archivos — ese es el error que cometen el 90% de los equipos que usan IA para revisar arquitecturas.

### El enfoque socrático anti-monólogo

El principio de "un punto a la vez, detente y espera" es diferenciador. La mayoría de los agentes de IA producen un análisis completo de una vez y el humano termina scrolleando sin procesar nada ni tomar decisiones reales. La estructura de discusión del pipeline fuerza decisiones atomizadas que sí quedan registradas.

### Las flags como mecanismo de complejidad condicional

El diseño de las flags de `estimate` es elegante: si el proyecto no tiene multi-tenancy, el flag no se recomienda, no se discute y no se cobra. Es defensa activa contra la sobreingeniería de la cotización. La regla multiplicativa para flags de alto riesgo combinadas es el tipo de detalle que separa un sistema pensado de una plantilla genérica.

### `risk-patterns.md` como conocimiento acumulado separado de la sesión

Tener el catálogo de patrones de riesgo fuera del prompt de la sesión (read-only, al final del análisis) evita que la IA ancle su evaluación en los patrones en lugar de en el proyecto real. Es un mecanismo anti-sesgo correcto.

---

## Las brechas — con evidencia

### 1. Init es demasiado pasivo para la responsabilidad que carga

El `init-prompt.md` declara su rol como "recolector pasivo de requerimientos". Eso significa que si alguien llena los canvases con decisiones técnicas evidentemente problemáticas — Mongo para un sistema de transacciones financieras, K8s en un MVP de un solo desarrollador — `init` los acepta sin decir nada y los manda a `assess` como si fueran válidos.

El resultado es que `assess` tiene que hacer todo el trabajo de corrección. Si los canvases están mal de raíz, la sesión de `assess` se vuelve larga y costosa en tiempo. Init está diseñado para no contaminar con juicios técnicos, lo cual tiene sentido, pero hay decisiones que son tan obviamente problemáticas que debería existir al menos un "semáforo" superficial al cierre del llenado.

**Evidencia:** el `canvas-planning-guide.md` ya contiene notas de arquitecto que advierten sobre decisiones problemáticas (K8s, MongoDB para transacciones). Ese conocimiento está en la guía de referencia pero no tiene ningún efecto en la sesión de la IA.

### 2. No hay Definition of Done entre fases

El CLI emite una advertencia cuando hay secciones sin completar (`"9 secciones sin completar"`), pero el pipeline procede igualmente. Eso significa que es posible correr `assess` sobre canvases al 50% de completitud y la IA va a trabajar con datos parciales — produciendo hallazgos que parecen válidos pero se basan en supuestos implícitos.

En sistemas robustos, esto se resuelve con una **Definition of Done por fase**: un conjunto mínimo de condiciones que deben cumplirse antes de que el pipeline avance. Sin eso, la calidad del resultado depende de la disciplina del humano, no del sistema.

### 3. El flujo es unidireccional y los proyectos reales no lo son

El pipeline `init → assess → estimate` es una línea recta. Pero hay escenarios reales que el modelo no contempla:

- Durante `estimate`, el costo de tres flags combinadas hace el proyecto económicamente inviable. ¿Se vuelve a `assess` para simplificar la arquitectura? ¿Se vuelve a `init` para redefinir el scope del MVP?
- Durante `assess`, se detecta una falla crítica que requiere cambiar el caso de uso principal del brief. ¿Se actualiza `brief-funcional.md` y se re-ejecuta `init`?

No existe un **mecanismo de re-entrada documentado**. El pipeline asume que cada fase cierra limpiamente y que el flujo siempre avanza. Eso no ocurre en proyectos reales.

### 4. El pipeline termina en la cotización, no en la ejecución

`pricing-decisions.md` cierra con la tabla de cotización y el resumen ejecutivo. Pero el gap entre "tenemos un precio acordado" y "comenzamos a construir" está completamente fuera del sistema. ¿Cómo se traduce el estimate en un plan de sprints? ¿Quién asigna los roles definidos en `--roles`? ¿Qué artefacto conecta el pipeline de planeación con el pipeline de desarrollo de features?

El pipeline de Funky Forge termina en `pricing-decisions.md` con la tabla de cotización y el resumen ejecutivo. Pero el gap entre "tenemos un precio acordado" y "arrancamos el proyecto" no está cubierto. La cotización define cuánto cuesta, pero no revisa formalmente si el scope del MVP original sigue siendo viable una vez que se conoce el precio real, ni produce un documento de arranque que el equipo pueda usar como referencia de partida. Ese cierre del ciclo de planeación no existe en el pipeline actual.

### 5. Los prompts comparten texto por copy-paste, no por composición

El caso de los NFRs (documentado en `evaluacion-flujo.md`) es el ejemplo concreto. Un párrafo correcto en `assess-prompt.md` fue copiado a `estimate-prompt.md` sin ajustarlo a la frontera de esa fase, generando una instrucción contradictoria.

El mecanismo de `<!-- topics -->` en `pricing-guide.md` resuelve este problema para las flags de `estimate` — el CLI inyecta contenido, no lo copia. Pero ese patrón no está generalizado: los demás prompts (`init-prompt.md`, `assess-prompt.md`, `estimate-prompt.md`) siguen siendo archivos de texto independientes que comparten secciones por duplicación. A medida que el sistema evolucione, ese patrón va a generar más casos de drift.

---

## Comparativa con alternativas de la industria

| Práctica | Qué resuelve | Qué no resuelve vs este pipeline |
|---|---|---|
| **ADR (Architecture Decision Records)** | Registro de decisiones con rationale. Tu `architecture-decisions.md` ya es básicamente un ADR. | No tiene fases de validación ni cotización. |
| **Shape Up (Basecamp)** | Pitch + Shaping + Cycle: muy similar a init + assess en intención. | No conecta con pricing ni con la composición del equipo. |
| **RFC process** | Propuesta pública con periodo de revisión antes de decidir. | Útil en equipos grandes; overhead excesivo en agencias pequeñas. No tiene cotización. |
| **C4 Model** | 4 niveles de abstracción arquitectónica (Context, Container, Component, Code). | Puramente técnico, sin dimensión de negocio ni pricing. |

Ninguna de esas alternativas resuelve lo que este pipeline sí resuelve: **conectar validación arquitectónica con cotización de forma trazable y socrática**. Eso no está documentado en ningún framework público conocido. La propuesta tiene valor real.

El problema no es el diseño de las fases — es que aún delega demasiado a la disciplina del humano en puntos donde el sistema podría ser más estricto.

---

## Propuesta: ¿Escalar a más fases o rediseñar el pipeline?

### La respuesta corta

No más fases por ahora — primero cerrar los gaps estructurales del sistema actual. Agregar fases sobre un pipeline sin gates de calidad y sin mecanismo de re-entrada solo amplifica los problemas existentes.

### Lo que sí propongo: 2 adiciones y 1 refactor

**Adición 1 — Fase `gate` (entre init y assess)**

Un comando `funky gate` que valide condiciones mínimas antes de avanzar:

- Todos los campos obligatorios de los tres canvases están completos (no `[Completar]` ni `[Responde aquí]`).
- El brief tiene al menos: nombre, objetivo, tipo de usuario, caso de uso principal, KPIs y definición de MVP.
- Los canvases tienen al menos: framework, arquitectura, DB, auth y despliegue definidos.

Si no pasa el gate, el pipeline se detiene y lista exactamente qué falta. No es opcional.

**Adición 2 — Fase `scope` (cierre del pipeline de planeación)**

Un comando `funky scope` que tome el resultado de `estimate` y produzca el artefacto de cierre del ciclo de planeación:

- **Confirmación del scope del MVP** a la luz del presupuesto real aprobado: ¿todo lo que entró al brief inicial sigue siendo viable con el costo acordado? ¿Hay ítems que deben moverse a Fase 2?
- **Reasignación de ítems del brief** a fases del proyecto (Fase 1, Fase 2, Fase 3) con criterio de costo, como primera actualización formal de la sección §10 y §11 del `brief-funcional.md`.
- **Documento de kickoff**: resumen ejecutivo del proyecto listo para presentar al cliente o al equipo interno — qué se construye, en qué fases, con qué equipo, a qué costo y con qué riesgos aceptados.

Este artefacto cierra el pipeline de planeación de forma completa: el proyecto ya tiene definición, arquitectura validada, precio acordado y scope confirmado.

**Refactor — Mecanismo de re-entrada documentado**

En lugar de agregar una nueva fase, documentar formalmente los caminos de retorno:

```
estimate → assess    Si el costo hace inviable la arquitectura actual
assess → init        Si se detecta una falla que requiere redefinir el scope de negocio
gate (falla) → init  Si los canvases no pasan la validación mínima
```

Cada camino de re-entrada debería tener una instrucción explícita: qué archivos se pueden modificar, cuáles quedan protegidos y qué artefactos de la fase anterior quedan invalidados.

### El pipeline propuesto

```
funky init
    │
    ▼
funky gate          ← NUEVO: gate de calidad mínima, bloqueante
    │
    ▼
funky assess
    │ (si falla crítica → re-entrada documentada a init o assess)
    ▼
funky estimate [--flags]
    │ (si costo inviable → re-entrada documentada a assess)
    ▼
funky scope         ← NUEVO: cierre formal del ciclo de planeación
```

### Lo que NO cambiaría

- La separación de responsabilidades entre las 3 fases actuales — está bien pensada.
- El enfoque socrático de 1 punto a la vez.
- El mecanismo de patch con SSOT.
- El sistema de flags condicionales.
- `risk-patterns.md` como documento vivo separado de la sesión.

Esos elementos son la columna vertebral del sistema y funcionan. El problema no es la arquitectura de las fases — es la ausencia de estructura en los puntos de transición entre ellas.
