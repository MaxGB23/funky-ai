# Spec — Estimate Domain
> Domain: estimate | Status: Living | Source of Truth: `openspec/specs/estimate/spec.md`

Living spec canónico para el dominio `estimate`. Refleja el estado actual tras `fase-3-estimate`.

---

## Propósito

`funky estimate` facilita una sesión de pricing colaborativa humano+IA. No calcula precios con fórmulas hardcodeadas. Inyecta una guía de discusión basada en decisiones arquitectónicas (del assess) y canvases del proyecto, más un template para documentar acuerdos. La discusión real ocurre en el chat.

---

## Requirements

### R1: Validación de prerrequisito

El sistema DEBE verificar que `docs/architecture-decisions.md` exista. Si no existe, DEBE advertir y generar guía con contenido parcial. Nunca debe fallar.

- GIVEN `docs/architecture-decisions.md` existe
- WHEN `funky estimate` se ejecuta
- THEN se lee y se incorpora en la guía
- AND no hay warning de decisión faltante

- GIVEN `docs/architecture-decisions.md` no existe
- WHEN `funky estimate` se ejecuta
- THEN se imprime un warning
- AND la guía se genera con "Sin decisiones documentadas"
- AND exit(0)

### R2: Canvas Discovery + Placeholders

El sistema DEBE localizar PROJECT-CANVAS.md e INFRA-CANVAS.md (root → `docs/`). DEBE detectar `[Responde aquí]` en el contenido. Siempre CONTINUAR con contenido parcial. El comportamiento es idéntico al R1/R2 del spec de assess.

- GIVEN ambos canvases en root
- WHEN `funky estimate` se ejecuta
- THEN se leen sin fallback
- AND no hay warning

- GIVEN un canvas contiene `[Responde aquí]`
- WHEN `funky estimate` se ejecuta
- THEN se imprime warning listando secciones incompletas
- AND la guía se genera con el contenido disponible

### R3: Generación de guía de pricing

El sistema DEBE generar `.agents/prompts/pricing-guide.md` con: decisiones arquitectónicas (o "Sin decisiones documentadas"), contenido de ambos canvases, y estructura de discusión (contexto de pricing, factores de costo, referencia de infra, acuerdos). DEBE sobrescribir si existe.

- GIVEN canvases completos y decisions existen
- WHEN `funky estimate` se ejecuta
- THEN `.agents/prompts/pricing-guide.md` se crea
- AND contiene decisions, canvases y estructura de pricing

- GIVEN `.agents/prompts/pricing-guide.md` ya existe
- WHEN `funky estimate` se ejecuta
- THEN se sobrescribe sin respaldo

### R4: Template de decisiones de pricing

El sistema DEBE crear `.agents/prompts/pricing-decisions-template.md` con secciones: decisión, justificación, impacto en presupuesto, alternativas, fecha. DEBE sobrescribir si existe.

- GIVEN `funky estimate` se ejecuta
- WHEN se genera el template
- THEN `.agents/prompts/pricing-decisions-template.md` se crea/sobrescribe con la estructura estándar

### R5: Prompt IA en español neutro

El sistema DEBE generar un prompt en español neutro para que la IA inicie la sesión de pricing. Incluye: contexto del proyecto (canvases), decisiones arquitectónicas, e invitación a discutir pricing. Se imprime en consola como parte del summary.

- GIVEN datos completos
- WHEN se genera el prompt
- THEN se produce texto en español neutro listo para copiar al chat
- AND invita a discutir pricing basado en decisiones y canvases

- GIVEN no existe `docs/architecture-decisions.md`
- WHEN se genera el prompt
- THEN indica que no hay decisiones previas
- AND invita a discutir desde cero con la info de canvases disponible

### R6: Códigos de salida y output

El sistema DEBE salir con exit(0) en todos los escenarios. DEBE imprimir resumen con rutas de archivos generados, el prompt IA, e instrucciones para iniciar la sesión.

- GIVEN el comando se completa por cualquier camino
- WHEN termina la ejecución
- THEN exit(0)
- AND resumen con rutas generadas
- AND prompt IA impreso
- AND instrucciones para iniciar sesión de pricing

---

## Non-Functional Requirements

| Área | Especificación |
|------|---------------|
| Performance | Lectura+generación DEBE completar en <500ms en inicio frío |
| Error handling | Errores de lectura/permisos DEBEN imprimir warning y seguir con exit(0) |
| Sin modo interactivo | NO DEBE usar `@inquirer/prompts` ni preguntar nada al usuario. Todo headless |
| Determinismo | Mismos inputs → idéntico `.agents/prompts/pricing-guide.md` |
