# Estrategia: rediseño de `funky estimate`

> **Estado: PROPUESTA — NO OFICIAL, NO IMPLEMENTADA.**
> Este documento es una estrategia de discusión, no una spec vigente ni una orden de implementación.
> Requiere una ronda de diseño acordada antes de tocar código (decisión de alcance: ver memoria #241).

---

## 1. Origen y contexto

Durante el smoke test v3.5.0, un agente generó `smoke-test-v3.5.0/recomendaciones-agente.md` (904 líneas) sobre cómo mejorar el comando `funky estimate` aplicado a un proyecto real Next.js + SQLite.

El documento diagnostica un problema real, pero su forma contradice la filosofía funky-forge: es un doc monolítico que impone ceremonia. Esta estrategia rescata el diagnóstico y las ideas útiles, y descarta la ceremonia.

## 2. Diagnóstico que se rescata (el problema real)

- **El stack no alcanza para estimar costos.** Describe el *cómo* (tecnología), no el *qué* (producto, usuarios, MVP, reglas de negocio).
- Falta un brief funcional: quién usa el producto, qué hace, cómo se administra, qué integra, qué complejidad tiene, qué se entrega en el MVP.
- **"Mismo stack ≠ mismo precio"**: cotizar por tecnología es cotizar a ciegas.

## 3. Observaciones al agente (por qué el doc es ineficiente)

1. **Se contradice a sí mismo**: predica contra los docs inflados (sección 14) pero ES un doc inflado de 904 líneas, con 4 conclusiones que dicen lo mismo (secciones 10, 17, 18, 22) y un brief de producto duplicado 5 veces.
2. **Manda en lugar de ofrecer**: secciones "obligatorias" (13 "Paso inicial obligatorio", 19 "Sección obligatoria: estructura del equipo") y una "secuencia formal" de 6 pasos. La filosofía es: **el CLI facilita, no dictamina**.
3. **Propone 9 archivos por proyecto** (sección 16) — exactamente la ceremonia monolítica que el equipo rechazó. Ni siquiera se reconcilia con su propia sección 18 (5 documentos).
4. **Inventa lo que dice exigir**: fabrica un producto ("dashboard con autenticación") partiendo solo del stack, y luego acusa a la IA de inventar escenarios. La sección 13 hace exactamente lo que critica.
5. **Detalles descuidados**: numeración rota (dos secciones "14"), duplicados ("ERP, ERP"), señales de edición sin revisión.

## 4. Lo que se rescata (la estrategia correcta)

### 4.1. Brief funcional — OPCIONAL, nunca bloqueante

El CLI puede *ofrecer* guiar un brief funcional (preguntas de producto, usuarios, alcance MVP) como referencia/ayuda, pero **nunca detener la sesión por no tenerlo**. El stack actual ya genera la guía con contenido parcial y exit(0); esa resiliencia se mantiene.

### 4.2. Plantillas condicionales — se activan solo si aplican

Las plantillas del documento (roles, multi-tenant, transacciones, seguridad, concurrencia, integraciones) son útiles **como opciones a demanda**, no como batería fija. Un proyecto simple no necesita las 7.

- Patrón aplicable al CLI: opciones/flags a demanda (ej. `estimate --brief`, `--pricing-team`) o templates que se incorporan a la guía solo cuando el usuario las pide o cuando los datos lo justifican.
- La "Regla de uso" del propio doc lo dice bien: *"Si el proyecto es simple, usar solo base + pricing guide"*. Esa es la semilla correcta: **estructura perfilada, no fija**.

### 4.3. Patrón "No aplica en esta fase" = heurísticas condicionales

Es la idea más valiosa y **ya se incorporó** en el refactor de `assess` (risk-patterns como markdown vivo: cada patrón declara cuándo aplica). Para estimate significa: la guía puede incluir una ficha de descarte corta (tabla "tema → aplica/no aplica en esta fase") que limite la imaginación de la IA sin exigir secciones vacías.

### 4.4. Costos de equipo y pricing por fases — opciones, no secciones obligatorias

Las fórmulas de costo (rol × dedicación × duración) y las plantillas por tamaño de equipo son material de referencia útil si el usuario pide desglose de equipo. **No** son un bloque obligatorio del pricing guide: para un precio fijo o un solo dev no aplican.

## 5. Principios rectores de la implementación futura

1. **El CLI facilita, no dictamina**: toda adición es opcional o condicional; nunca un paso bloqueante.
2. **Docs vivos**: templates editables en markdown, propiedad del equipo (mismo patrón que `risk-patterns-template.md`).
3. **Sin ceremonia monolítica**: no hay batería fija de archivos ni secciones obligatorias.
4. **Resiliencia headless**: sin modo interactivo obligatorio, exit(0) siempre (spec R6 actual se mantiene).
5. **Lo que no aplica se declara, no se documenta**: la ficha de descarte reemplaza a las secciones vacías.

## 6. No-goals (descartado explícitamente)

- ❌ Secciones "obligatorias" (brief, equipo, secuencias formales).
- ❌ Batería fija de 9 (o 5) archivos por proyecto.
- ❌ Bloquear la sesión de estimate por falta de brief.
- ❌ Convertir recomendaciones-agente.md en spec.
- ❌ Agregar ceremonia al CLI.

## 7. Estado y próximo paso

- **Estado**: discusión futura. No implementar sin nueva ronda (mem #241).
- **Punto de partida cuando se retome**:
  - Spec vigente: `openspec/specs/estimate/spec.md` (R1-R6 + R-E1/R-E2/R-E3)
  - Código: `funky-cli/src/utils/estimateDomain.js`, `funky-cli/src/commands/estimate.js`, `funky-cli/src/utils/context.js`
  - Templates: `funky-cli/src/templates/estimate/`
  - Referencia de patrones: `funky-cli/src/templates/assess/risk-patterns-template.md` (mismo patrón markdown vivo)
- **Próximo paso recomendado**: ronda de diseño del rediseño de estimate, partiendo de esta estrategia, con decisiones explícitas de qué se convierte en flag opcional, template condicional o referencia de ayuda.

## 8. Fuentes

- `smoke-test-v3.5.0/recomendaciones-agente.md` (904 líneas, generado por agente — diagnóstico + ideas, forma descartada)
- Memoria #238: rescate acordado (brief opcional, plantillas condicionales, "No aplica en esta fase")
- Memoria #241: decisión de alcance (discusión futura, no implementar ahora)
- `openspec/specs/estimate/spec.md` — spec vigente (no modificada por esta estrategia)
- Filosofía funky-forge: `docs/funky-forge/README.md`
