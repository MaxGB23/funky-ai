# Blueprint de Migración: Estrategia de Delegación en AGY CLI

> **Propósito:** Documentar los patrones de delegación acordados para mantener el contexto del Orquestador limpio y optimizar el consumo de tokens cuando Funky AI migre completamente a AGY CLI.
>
> **Fecha:** 2026-06-09

---

## 1. El "Explore Ligero" (Protección de Contexto)

Para investigaciones rápidas (ej. revisar el stack trace de un error, buscar dónde se define una variable) donde el workflow robusto de `/funky-explore` es excesivo.

**El Problema:** El Orquestador no debe ensuciar su memoria a corto plazo leyendo decenas de archivos de código fuente.
**La Solución:** Delegar a un "sabueso" desechable.

- **Herramienta:** Usar el subagente estático integrado (`TypeName: "research"`).
- **Skill:** NINGUNO. No requiere `SKILL.md` ni `define_subagent`.
- **Ejecución:** Se usa `invoke_subagent` con un prompt hiper-estricto.
  > *"Instrucciones: Usa grep_search para buscar X. No leas archivos innecesarios. Responde ÚNICAMENTE con los paths involucrados y un resumen de 2 líneas. Nada de saludos."*

### Ciclo de Vida de la Regla (v1 → v2)

**`v1` (Validación — Canary Behavior Test):**
La regla en `sdd-orchestrator.md` se redacta con una directiva de **pedir aprobación** antes de lanzar el sabueso. Esto NO es el comportamiento final; es un test de comportamiento intencionado. Si el Orquestador pregunta "¿Puedo investigar esto con un subagente?", confirma que sus rules están en contexto y que detectó el patrón de forma autónoma.

**`v2` (Producción — Autónomo):**
Una vez validado el comportamiento, la rule se actualiza para que el Orquestador decida y ejecute el Explore Ligero **de forma autónoma**, sin avisar. Solo reporta el resultado al humano como parte de su respuesta. La aprobación desaparece.

---

## 2. Workflows Pesados y Skills Custom (Threshold Rule)

Cuando llegue el momento de delegar tareas pesadas del SDD (`sdd-apply`, `sdd-design`) al CLI usando `define_subagent`, la forma en que cargamos el `SKILL.md` dependerá de su peso para balancear tokens vs control.

### A. Eager Loading (Inyección Directa)
Para skills ligeros (**< 300 líneas**), ej: `branch-pr`, `go-testing`.
- **Proceso:** El Orquestador usa `view_file` para leer el SKILL.md y lo inyecta **completo** dentro del parámetro `system_prompt` de `define_subagent`.
- **Ventaja:** El subagente nace genéticamente condicionado. Cero riesgo de que "olvide" sus instrucciones base.
- **Costo:** El Orquestador paga los tokens de lectura e inyección. Aceptable para textos cortos.

### B. Lazy Loading (Referencia por Ruta)
Para skills y documentación masiva, ej: `sdd-apply`, arquitecturas completas.
- **Proceso:** El Orquestador NO lee el archivo. Crea el `define_subagent` con un `system_prompt` dictatorial:
  > *"Eres un experto SDD. TU PRIMERA Y ÚNICA ACCIÓN antes de trabajar debe ser usar `view_file` en el path absoluto `M:\funky-ai\.agents\skills\sdd-apply\SKILL.md` y obedecerlo."*
- **Ventaja:** El Orquestador se mantiene magro y gasta casi cero tokens. El costo de lectura lo paga el subagente, que de todas formas lo necesita.

### C. Validación Post-Facto (Feedback Loop Manual)
Para mitigar el riesgo de que el subagente omita leer el archivo en la modalidad Lazy Loading, se inyecta un contrato de validación en el Prompt de lanzamiento (`invoke_subagent`):
- **Regla:** *"Tu primer mensaje de respuesta hacia mí debe empezar OBLIGATORIAMENTE con `SKILL_LOADED: [nombre-del-skill]`. Si no veo ese texto, asumiré que estás operando ciego y mataré tu proceso."*
- **Por qué:** Imita el "Skill Resolution Feedback" de OpenCode, pero a nivel de convención de texto, asegurando que el worker cargó su cerebro antes de tocar el código.

---

## Resumen de Acción

1. Orquestador lee el problema.
2. ¿Es trivial? → `invoke_subagent(TypeName: "research")` (Explore ligero).
3. ¿Requiere worker custom? → Evaluar tamaño del SKILL.md.
   - Chico → Leer e inyectar completo (`define_subagent`).
   - Grande → Pasar ruta y exigir `SKILL_LOADED` (`define_subagent`).

---

## Descubrimientos nuevos encontrados

> **Contexto:** Hallazgos surgidos en sesión de Q&A con el Orquestador el 2026-06-15. Requieren análisis del equipo antes de ser integrados formalmente al RFC.

### D1. El Prompt del subagente controla el formato de retorno

El output que recibe el Orquestador no es un dump automático — es **exactamente lo que el Prompt le indica que devuelva**. Esto significa que el "return envelope" (mini report estructurado) es una convención de diseño, no una feature del sistema. El contrato de output debe estar explícito en el Prompt de lanzamiento.

### D2. Los workflows del sistema son accesibles por los subagentes

Los subagentes de tipo `self` heredan el system prompt completo del padre, incluyendo la sección `<workflows>` con todos los paths disponibles. Esto habilita un patrón donde el Orquestador le indica a un subagente que ejecute un workflow específico (ej. `/funky-propose`) pasándole el nombre y el contexto necesario. El subagente leerá el `.md` del workflow y lo ejecutará de forma autónoma.

**Implicación:** Las fases del SDD pueden delegarse a workers sin duplicar lógica de workflow en el system_prompt del subagente.

**Limitación crítica:** El contexto situacional del Orquestador (estado actual del SDD, archivos abiertos, historial de decisiones) **no se hereda automáticamente**. Debe pasarse explícitamente en el Prompt de lanzamiento.

### D3. Costo de tokens: delegación ≠ ahorro, delegación = velocidad

El costo de tokens de un subagente worker es **equivalente** al del flujo manual actual (humano abre chat nuevo → ejecuta workflow → pega report). Ambos pagan:
- System prompt completo al inicio.
- Tokens de ejecución del workflow.

El valor real de la delegación está en **dos ganancias no monetarias**:
1. **Eliminar fricción humana** — el round-trip manual desaparece.
2. **Paralelismo** — fases no críticas del SDD (ej. `apply` de módulos independientes) pueden ejecutarse en paralelo, reduciendo el tiempo de ciclo sin reducir el gasto por fase.

**Conclusión para el equipo:** No migrar a subagentes buscando ahorro de tokens. Migrar buscando velocidad de ciclo y reducción de carga cognitiva del humano orquestador.

---

## D4. Costo base del System Prompt por sección

> **Metodología:** Estimación basada en inspección directa del system prompt activo (~4 chars/token). Cada subagente `self` hereda este costo completo al nacer.
> **Fecha de medición:** 2026-06-15

| Sección | Peso estimado | Prioridad de optimización | Función |
|---|---|---|---|
| **User rules** | 700–900 tokens 🔴 | Baja — es esencial | Reglas de comportamiento, persona, convenciones de proyecto. Define cómo opera el Orquestador. |
| **Web App Dev guidelines** | 600–800 tokens 🔴 | Alta — si no se usa | Stack web, diseño UI, SEO, animaciones. Pre-instalado por AGY CLI. No editable actualmente. |
| **Artifacts formatting guide** | 400–500 tokens 🟡 | Media | Instrucciones para generar documentos enriquecidos (Mermaid, carousels, alertas). Sistema interno del IDE. |
| **Conversation transcript guide** | 250–350 tokens 🟡 | Media | Explica cómo leer el historial de conversación desde el filesystem cuando el contexto se trunca. |
| **Skills** (solo índice) | 300–400 tokens 🟢 | Baja — ya es ligero | Catálogo de skills: nombre + descripción corta. El SKILL.md completo **no** se carga aquí. |
| **Workflows** (slash commands) | 200–300 tokens 🟢 | Baja — ya es ligero | Lista de workflows SDD con slash command, path absoluto y descripción corta. |
| **Subagents + Messaging** | 200–300 tokens 🟢 | Baja — es infraestructura | Instrucciones para lanzar subagentes y el sistema de mensajería entre agentes. |
| **Resto** (identity, guidelines, slash commands, MCP) | 150–200 tokens 🟢 | Baja | Fragmentos cortos de configuración general. |
| **TOTAL ESTIMADO** | **~2,800–3,750 tokens** | — | Costo fijo pagado en cada conversación y en cada subagente `self` lanzado. |

### Hallazgos clave

- **Las skills no son el cuello de botella.** Solo su índice vive en el system prompt. El SKILL.md se lee bajo demanda.
- **Web App Dev es el candidato principal de optimización** si Funky AI no construye web apps regularmente — ~700 tokens de ruido por subagente.
- **El costo es multiplicativo con subagentes.** Si se lanzan 3 workers en paralelo, el system prompt se paga 3 veces. El paralelismo tiene costo base, no es gratis.
- **Workaround disponible para secciones no editables:** Una directiva explícita en las user rules con mayor peso semántico puede neutralizar el efecto de secciones hardcodeadas sin eliminar sus tokens.
