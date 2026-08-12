# Evaluación del Flujo — Diagnóstico y Estrategia de Revisión

> Documento de análisis interno. Registra hallazgos sobre inconsistencias entre fases del pipeline y propone una estrategia de revisión sistemática para el equipo de desarrollo.

---

## Diagnóstico: El caso de los NFRs en `estimate`

### Qué se detectó

La instrucción de evaluar NFRs (rendimiento, seguridad, disponibilidad, escala) aparece en tres archivos:

| Archivo | Ubicación | Texto clave |
|---|---|---|
| `docs/funky-ai/assess/assess-prompt.md` | L12 — §Rol | "Evalúa explícitamente cada NFR: si aplica, acuerda cómo se cumple; si no aplica, declara el porqué." |
| `docs/funky-ai/estimate/estimate-prompt.md` | L12 — §Rol | Párrafo idéntico, palabra por palabra. |
| `docs/funky-ai/estimate/pricing-guide.md` | L118 — §NFRs, Patrones y Referencias | Sección que repite el mismo principio en prosa, sin anclaje a ningún paso del flujo de discusión. |

### Por qué es un problema

La frontera de `estimate` está definida en el mismo `estimate-prompt.md` (L10):

> "Tu trabajo es COBRAR el esfuerzo de implementar la arquitectura, no reevaluar si es correcta o debatir el stack técnico elegido."

La instrucción de NFRs contradice esa frontera: le pide a la IA de estimate que "evalúe y acuerde cómo se cumplen" los NFRs, que es exactamente lo que hace `assess`. El resultado es ambigüedad para la IA: ¿debe re-debatir si el sistema soporta seguridad/escala, o solo verificar si aplica un flag de costo?

**Causa raíz:** el párrafo de NFRs fue copiado del prompt de `assess` al de `estimate` sin ajustarlo a la responsabilidad de esa fase. Es un caso de **drift de responsabilidad por copy-paste**: el texto es correcto en su origen, pero pierde precisión al trasladarse a otro contexto sin revisión crítica.

### Impacto real

- Una IA siguiendo `estimate-prompt.md` al pie de la letra podría reabrir debates arquitectónicos que `assess` ya cerró, rompiendo la separación de fases.
- La sección `## NFRs, Patrones y Referencias` en `pricing-guide.md` queda suelta al final del documento, después de la tabla de cotización, sin estar anclada a ningún paso del flujo de discusión declarativo.
- Si el humano no conoce bien el workflow, no detectará que esa instrucción está fuera de lugar.

---

## Estrategia de Revisión para el Equipo

El caso de los NFRs revela un patrón de punto ciego frecuente en sistemas de prompts y documentación multi-fase: **las instrucciones se acumulan por inercia sin verificar si pertenecen a la fase que las contiene**. La siguiente estrategia busca que el equipo detecte esos puntos ciegos antes de que lleguen a producción.

### 1. Prueba de Pertenencia por Fase (el "¿Quién lo hace?" test)

Antes de escribir o aceptar cualquier instrucción en un prompt o guía, hacerse estas dos preguntas:

1. **¿Esta instrucción produce un artefacto que ya produce otra fase?**
   Si la respuesta es sí, la instrucción está duplicada o desplazada.

2. **¿Si esta instrucción no existiera aquí, alguna fase anterior ya la cubre?**
   Si la respuesta es sí, la instrucción es redundante y potencialmente contradictoria.

En el caso de los NFRs: la respuesta a ambas preguntas es "sí, `assess` ya lo hace" → la instrucción no pertenece a `estimate`.

### 2. Matriz de Responsabilidad Explícita

Mantener una tabla viva que mapee **temas** contra **fases**, con una sola celda marcada como dueña por tema. Cada vez que se agrega una instrucción nueva a cualquier prompt o guía, verificar que no esté marcada como responsabilidad de otra fase.

Formato mínimo:

| Tema | init | assess | estimate |
|---|---|---|---|
| Definir el producto y el stack | ✅ | — | — |
| Coherencia entre brief y canvas | — | ✅ | — |
| Validar que el diseño soporta NFRs | — | ✅ | — |
| Cobrar el costo de implementar NFRs complejos | — | — | ✅ (flags) |

> Esta tabla ya existe parcialmente en `funky-forge-workflow.md`. La estrategia es usarla como checklist de validación activo, no solo como documentación descriptiva.

### 3. Revisión de "Fronteras de Responsabilidad" al hacer cambios

Cada vez que se modifique un prompt, guía o template, el autor debe leer explícitamente la sección `🛑 Frontera de responsabilidad` (o equivalente) del mismo archivo y verificar que el cambio no la viola. Si el archivo no tiene esa sección, agregarla antes de modificarlo.

Este paso es especialmente crítico cuando el cambio proviene de copiar texto de otro archivo del mismo sistema.

### 4. Review Cross-Fase (el "¿Lo dice alguien más?" check)

Al cerrar un PR o una iteración de templates, hacer un grep o búsqueda manual del concepto clave que se está introduciendo (ej. "NFR", "seguridad", "multi-tenant") en todos los archivos del sistema. Si el concepto aparece en más de una fase, revisar que cada mención esté ajustada a la responsabilidad de esa fase — no copiada literalmente de otra.

Herramienta mínima:

```bash
# Ejemplo: buscar dónde aparece un concepto en todos los templates
grep -rn "NFR\|rendimiento\|disponibilidad" docs/funky-ai/
```

### 5. Validación con la IA como "usuario adversarial"

Antes de publicar un prompt nuevo o modificado, abrirlo en una sesión de IA y pedirle explícitamente:

> "Lee este prompt. ¿Hay alguna instrucción que contradiga tu frontera de responsabilidad declarada en §Rol? ¿Hay alguna instrucción que pertenezca a una fase diferente?"

La IA detectará contradicciones internas con más facilidad que un revisor humano que ya tiene el contexto asumido.

---

## Resumen de la Lección

> El mayor riesgo en sistemas de documentación multi-fase no es escribir mal una instrucción, sino **copiar una instrucción correcta al contexto equivocado**. El texto puede ser técnicamente preciso y aun así romper la separación de responsabilidades, porque el origen era diferente.

La defensa no es escribir mejor: es **verificar activamente la pertenencia** de cada instrucción a la fase que la contiene, usando la matriz de responsabilidad como árbitro.
