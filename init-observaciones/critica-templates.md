# Crítica Constructiva: Templates de Headless Mode

> Análisis crítico de los 3 archivos que componen el sistema de planeación de `funky init --template`: PROJECT-CANVAS.md, INFRA-CANVAS.md y canvas-planning-guide.md.
>
> **Contexto:** Estos problemas ya fueron explorados en profundidad en los RFCs de `openspec/rfcs/costos/` (001, 008, 1.13.1, recomendaciones). Esta crítica los reorganiza, prioriza y cruza con esas propuestas para tener una foto clara de dónde estamos y qué falta.

---

## Principio rector (de los RFCs)

> **"No más campos, sino mejor extracción de constraints con carga cognitiva progresiva."**
> — `1.13.1-idea.md`

Los canvases deben permanecer ligeros (MVPs, juniors, freelancers). Los constraints operacionales van en una **capa separada** que se activa cuando el proyecto lo requiere. No convertir la inicialización en burocracia enterprise.

> **"Diseñá para tu realidad operacional actual + 30%, no para Google-scale todavía."**
> — `recomendaciones.md`

---

## 1. PROJECT-CANVAS.md

**El problema general: es un formulario de 1 línea por sección.**

```markdown
## 1. Framework Base
Next.js (App Router)
```

Esto no es un canvas de arquitectura. Es un **checklist de una columna**. Un senior que llena esto siente que está perdiendo su tiempo. Un junior no sabe qué poner ni por qué.

### Problemas específicos

| # | Problema | Por qué importa | Resuelto en RFC? |
|---|---|---|---|
| 1 | **No hay campo de "por qué"** | Elegí Next.js porque necesito SSR + SEO, o porque me obliga el team? Son decisiones completamente distintas. Sin el "por qué", el canvas es inútil para un agente de IA que necesita contexto | Parcialmente — `1.13.1` separa "¿qué construimos?" de "¿qué riesgos hay?" pero no resuelve el "por qué" dentro del canvas |
| 2 | **No hay campo de "alternativas descartadas"** | Si descarté Astro por X razón, el agente necesita saberlo para no proponerlo de vuelta | No |
| 3 | **No hay restricciones** | Presupuesto, timeline, tamaño del team, seniority. Un proyecto de 1 persona con 2 semanas no es lo mismo que un equipo de 8 con 6 meses | **Sí** — `1.13.1` propone ARCHITECTURE-CONSTRAINTS.md como capa separada |
| 4 | **No hay NFRs** | Performance targets, accessibility (WCAG level), i18n, offline support. Estas son decisiones que condicionan TODO lo demás | Parcialmente — `001` explica NFRs en la guía de assess, pero no en los canvases |
| 5 | **El placeholder "No definido / Pendiente" no guía** | No dice qué debería ir ahí. Un junior pone "React" y se siente bien, sin haber considerado si Astro sería mejor | **Sí** — `recomendaciones.md` propone "mejores preguntas, no más campos" y "Architect Notes" |
| 6 | **Falta sección de "contexto del proyecto"** | ¿Es un side project? ¿Un MVP? ¿Producción desde día 1? ¿Legacy que hay que migrar? El contexto cambia todas las decisiones | No directamente, pero `001` habla de `team_seniority` como proxy |

### Lo que funciona bien

- Las 5 categorías son correctas como punto de partida
- El orden tiene lógica (framework → pattern → state → UI → testing)
- **El canvas debe seguir siendo corto** — la propuesta de `1.13.1` de mantenerlo ligero es correcta

---

## 2. INFRA-CANVAS.md

**Mismo problema de profundidad, pero peor porque infra tiene más aristas.**

### Problemas específicos

| # | Problema | Por qué importa | Resuelto en RFC? |
|---|---|---|---|
| 1 | **Deployment es un solo campo** | "Vercel" no es una estrategia de deployment. ¿Cuántos ambientes? ¿Feature branches? ¿Preview deployments? | No |
| 2 | **Falta monitoreo/observability** | Logging, métricas, alertas. Esto define la operabilidad del proyecto | No |
| 3 | **Falta strategy de ambientes** | dev/staging/prod. ¿Cómo se manejan secrets? ¿Cómo se promueve entre ambientes? | No |
| 4 | **Falta CI/CD real** | "GitHub Actions" no es una estrategia. ¿Qué corre en CI? ¿Lint, tests, build, security scan? ¿Cuándo deploya? | No |
| 5 | **No hay guidance de versionado** | SemVer? Conventional Commits? Esto afecta el release workflow | No |
| 6 | **Falta "cómo se instala el proyecto"** | `pnpm install` y listo, o hay pasos manuales? Esto define el onboarding | No |

### Lo que funciona bien

- Las 4 categorías son los pilares correctos de infra
- La guía da buenas opciones por categoría
- **Infra también debe seguir siendo corto** — los detalles operacionales (ambientes, CI/CD pipeline, monitoring) van en la capa de constraints o en documentación posterior

---

## 3. canvas-planning-guide.md

**Es el mejor de los 3, pero tiene gaps importantes.**

### Problemas específicos

| # | Problema | Por qué importa | Resuelto en RFC? |
|---|---|---|---|
| 1 | **No dice cuándo NO usar cada opción** | "Next.js: ideal para SEO" — ¿y cuándo NO usarlo? Un junior no sabe que Next.js es overkill para un dashboard interno | No directamente, pero `001` da contexto de tradeoffs |
| 2 | **No hay análisis de compatibilidades** | Astro + NextAuth = nonsensico. Junior + K8s = overengineering. El dev no lo sabe. **Resolución propuesta**: no hardcodear reglas en el CLI (pesado, difícil de mantener, criterio limitado). En su lugar, agregar una sección en los templates que instruya al agente LLM para que analice los canvases completados y redacte incompatibilidades, riesgos y trade-offs. El agente tiene todo el conocimiento del mundo sobre compatibilidades — no hay que codificarlo. Este es solo el primer análisis que conocemos; hay muchos aspectos que iremos descubriendo con el uso |
| 3 | **Profundidad despareja** | Testing tiene metodología + runner (bueno). Deployment solo tiene nombres de servicios (pobre) | No |
| 4 | **Opciones que no están** | No menciona Bun, Deno, SvelteKit, SolidJS, tRPC | No — pero `recomendaciones.md` dice "no diseñes para el proyecto gigante todavía" |
| 5 | **Falta "revisitar esta decisión cuando..."** | Cada opción debería tener una condición de re-evaluación | No directamente, pero `recomendaciones.md` propone "mejores preguntas" |
| 6 | **Falta ejemplo de canvas lleno** | El dev no tiene referencia de qué se ve un canvas bien llenado | **Sí** — `recomendaciones.md` propone "Architect Notes" como micro-lecciones operacionales |
| 7 | **TypeScript Strict como opción de Linter** | No es un linter, es un compiler setting. Mezcla categorías | No |
| 8 | **Idioma inconsistente** | "Obligatorio activar" (español) vs "Drop-in components" (inglés) en la misma guía | No |

### Lo que funciona bien

- La estructura de "menú a la carta" es correcta
- Las descripciones cortas por opción dan contexto suficiente para investigar
- El principio de "no inyectes complejidad hasta que el proyecto lo pida" (del TEMPLATE_GUIDE) es sólido
- **La guía es el archivo más valioso de los 3** — `recomendaciones.md` lo confirma: "tu activo principal NO es el scaffold, es el criterio codificado"

---

## 4. Lo que los RFCs ya resolvieron (y no hay que repetir)

| Insight | RFC | Estado |
|---|---|---|
| Separar constraints de los canvases | `1.13.1-idea.md` | Propuesto, no implementado |
| "Pull not push" — secciones avanzadas solo si aplica | `recomendaciones.md` | Recomendado, no implementado |
| "Mejores preguntas, no más campos" | `recomendaciones.md` | Recomendado, no implementado |
| funky assess SIEMPRE genera review IA | `recomendaciones.md` | Recomendado, no implementado |
| Architect Notes — micro-lecciones operacionales | `recomendaciones.md` | Recomendado, no implementado |
| Reglas estáticas para incompatibilidades | `008` | **Descartado** — se reemplaza por análisis LLM-driven en el template |
| Prevenir defaults ciegos (budget:0, rps:0) | `008` | Propuesto, no implementado |
| NFRs explicados con ejemplos concretos | `001` | Propuesto, no implementado |

---

## 5. Top 5 mejoras priorizadas (conRFCs)

| Rank | Mejora | Fuente | Esfuerzo | Nota |
|---|---|---|---|---|
| **1** | **Architect Notes** — micro-lecciones operacionales en la guía (ej: "muchos SMB tienen límite psicológico de gasto mensual") | `recomendaciones.md` | Bajo | Es solo agregar texto a la guía. Alto valor pedagógico |
| **2** | **"Mejores preguntas"** — en vez de `rps: 1000`, preguntar "¿cuál es el peor pico realista de tráfico? ¿Qué evento de negocio lo causaría?" | `recomendaciones.md` | Bajo | Cambia la calidad del contexto dev+IA dramáticamente |
| **3** | **Análisis LLM-driven de compatibilidades** — sección en los templates que instruya al agente para que analice los canvases y redacte incompatibilidades, riesgos y trade-offs. No hardcodear reglas en el CLI | `008` (revisado) | Bajo | El agente ya tiene el conocimiento; solo hay que pedirle que lo use. Cero mantenimiento. Iremos descubriendo más aspectos con el uso |
| **4** | **Pull not push** — marcar secciones avanzadas como "si aplica, completa esta sección" en vez de obligar | `recomendaciones.md` | Bajo | Cambio de wording en los templates |
| **5** | **Separar constraints en capa dedicada** — ARCHITECTURE-CONSTRAINTS.md como propone `1.13.1` | `1.13.1-idea.md` | Alto | Es la mejora más ambiciosa pero la más estratégica |

> **Las 4 primeras son las que más valor dan con menos esfuerzo.** La #5 es la más estratégica pero requiere más diseño. No hay que hacerla ahora — los RFCs ya la diseñaron, falta implementarla cuando el workflow la pida.

---

## 6. Resumen estratégico

Los templates actuales **no están mal** — `recomendaciones.md` lo dice textualmente: "ya están muy bien. Especialmente el tono, las explicaciones, los tradeoffs, la pedagogía y el enfoque práctico."

Lo que falta no es **más campos** sino:
1. **Mejor contexto pedagógico** (Architect Notes, mejores preguntas)
2. **Análisis de compatibilidades via LLM** — sección en templates que instruya al agente para que analice y redacte incompatibilidades, riesgos y trade-offs. No reglas estáticas en el CLI
3. **Progressive disclosure** (pull not push, capa de constraints separada)

El sistema actual cubre el 80% de los casos. Las mejoras deben ser incrementales, no una revolución.
