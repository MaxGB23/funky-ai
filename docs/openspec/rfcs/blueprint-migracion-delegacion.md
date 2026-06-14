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
