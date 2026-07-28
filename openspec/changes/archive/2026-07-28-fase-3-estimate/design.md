# Design: Fase 3 — Estimate (Sesión de Pricing Colaborativa)

## Technical Approach

Transformar `funky estimate` de calculadora hardcodeada a **facilitador de sesión de pricing** (mismo patrón que Fase 2 assess). El comando lee `docs/architecture-decisions.md` (warning si no existe), descubre canvases (root → docs/), genera guía de discusión de pricing + template de decisiones + prompt IA en español neutro, y siempre termina con `exit(0)`. Sin modo interactivo, sin `@inquirer/prompts`, headless total.

## Architecture Decisions

### Decisión: Organización del módulo

| Opción | Tradeoff | Decisión |
|--------|----------|----------|
| Funciones en estimate.js | Simple pero no testeable aisladamente | Rechazado |
| **Módulo separado `estimateDomain.js`** | Testeable, mismo patrón que assessRules.js | **Seleccionado** — 4 funciones exportadas: `loadDecisions()`, `findCanvases()`, `generatePricingGuide()`, `generateDecisionsTemplate()`, `generateIAPrompt()` |

### Decisión: Prerrequisito de decisions

`docs/architecture-decisions.md` es entrada, no salida. Si no existe, se genera guía parcial con texto "Sin decisiones documentadas". Mismo patrón que canvas faltante en assess — warning + continuar.

### Decisión: Sobrescritura de archivos de salida

Ambos archivos en `.agents/prompts/` se sobrescriben siempre. No hay lógica "skip si existe". La sesión de pricing siempre empieza fresca.

### Decisión: Prompt IA embebido vs. archivo separado

El prompt IA se genera en JS (no es template) y se imprime en consola. No se escribe a disco. El contenido combina decisiones + canvases + estructura de discusión de pricing.

## Data Flow

```
funky estimate
  │
  ├─ 1. loadDecisions(targetBase)
  │     └─ docs/architecture-decisions.md → contenido | null + warning
  │
  ├─ 2. findCanvases(targetBase)
  │     ├─ findCanvas('PROJECT-CANVAS.md', targetBase) → root | docs/ | null
  │     ├─ findCanvas('INFRA-CANVAS.md', targetBase)   → root | docs/ | null
  │     └─ countUnfilledSections() → warning si [Responde aquí]
  │
  ├─ 3. generatePricingGuide(decisions, projectCanvas, infraCanvas)
  │     └─ .agents/prompts/pricing-guide.md (sobrescribe)
  │
  ├─ 4. generateDecisionsTemplate()
  │     └─ .agents/prompts/pricing-decisions-template.md (sobrescribe)
  │
  ├─ 5. generateIAPrompt(decisions, projectCanvas, infraCanvas)
  │     └─ texto en español neutro → imprimir en consola
  │
  └─ 6. Summary + instrucciones → exit(0)
```

## File Changes

| Archivo | Acción | Líneas | Descripción |
|---------|--------|--------|-------------|
| `funky-cli/src/commands/estimate.js` | Modificar | ~70 | Command wrapper delgado que llama a funciones del módulo. Sin interactividad. `exit(0)` siempre. |
| `funky-cli/src/utils/estimateDomain.js` | Nuevo | ~100 | 5 funciones puras: `loadDecisions`, `findCanvases`, `generatePricingGuide`, `generateDecisionsTemplate`, `generateIAPrompt` |
| `funky-cli/src/templates/sdd/pricing-guide-template.md` | Nuevo | ~50 | Template de guía de discusión de pricing: contexto, factores de costo, infra, acuerdos |
| `funky-cli/src/templates/sdd/pricing-decisions-template.md` | Nuevo | ~25 | Template para documentar acuerdos de pricing: decisión, justificación, impacto, alternativas, fecha |
| `funky-cli/tests/estimate.test.js` | Nuevo | ~200-250 | Tests con mock de fs siguiendo patrón de assess.test.js |

## Interfaces / Contracts

```js
// estimateDomain.js
function loadDecisions(targetBase: string): string | null
  // Lee docs/architecture-decisions.md. Retorna contenido o null.

function findCanvases(targetBase: string): {
  projectCanvas: string | null;
  infraCanvas: string | null;
  projectSource: 'root' | 'docs' | null;
  infraSource: 'root' | 'docs' | null;
  unfilledCount: number;
}
  // Busca PROJECT-CANVAS.md e INFRA-CANVAS.md (root → docs/ fallback).
  // Cuenta ocurrencias de [Responde aquí].

function generatePricingGuide(decisions: string | null, projectCanvas: string | null, infraCanvas: string | null): string
  // Interpola pricing-guide-template.md con decisiones + canvases.
  // decisions null → "Sin decisiones documentadas".
  // canvas null → "Canvas no disponible".

function generateDecisionsTemplate(): string
  // Interpola pricing-decisions-template.md con {{DATE}}.

function generateIAPrompt(decisions: string | null, projectCanvas: string | null, infraCanvas: string | null): string
  // Genera prompt en español neutro para iniciar sesión de pricing.

// estimate.js (command wrapper)
// Reutiliza findCanvas() y countUnfilledSections() desde assess.js o estimateDomain.js.
// process.exit(0) en todos los caminos.
```

## Template Content Design

### pricing-guide-template.md (nuevo)

```
# Guía de Discusión de Pricing

> Generado por `funky estimate`. Usa este documento para tu sesión de pricing colaborativa.

## Contexto del Proyecto

### Decisiones Arquitectónicas
{{DECISIONS_CONTENT}}

### PROJECT-CANVAS
{{PROJECT_CANVAS_CONTENT}}

### INFRA-CANVAS
{{INFRA_CANVAS_CONTENT}}

## Estructura de Discusión

### 1. Contexto de Pricing (5 min)
Revisar decisiones arquitectónicas y canvases para entender el alcance del proyecto.

### 2. Factores de Costo (10 min)
- Infraestructura: hosting, servicios, herramientas
- Complejidad técnica: stack, integraciones, deuda técnica
- Equipo: seniority, tamaño, dedicación
- Timeline: urgencia, hitos, mantenimiento post-lanzamiento

### 3. Referencia de Infraestructura (10 min)
Costos estimados de los servicios elegidos en los canvases. Investigar precios actuales de cada proveedor.

### 4. Acuerdos de Pricing (15 min)
Definir precio final usando la guía de la sesión. Documentar en pricing-decisions-template.md.

## Instrucciones
1. Revisa esta guía con el equipo.
2. Discute cada factor de costo.
3. Documenta los acuerdos en el template de decisiones.
```

### pricing-decisions-template.md (nuevo)

```
# Decisiones de Pricing

> Fecha: {{DATE}}

## Decisiones

### [Decisión 1: Título breve]
- **Decisión:** ...
- **Justificación:** ...
- **Impacto en presupuesto:** ...
- **Alternativas consideradas:** ...
- **Fecha:** {{DATE}}

### [Decisión 2: Título breve]
- **Decisión:** ...
- **Justificación:** ...
- **Impacto en presupuesto:** ...
- **Alternativas consideradas:** ...
- **Fecha:** {{DATE}}
```

## Prompt IA

El prompt se genera en español neutro, se imprime en consola y no se persiste a disco. Estructura:

1. Saludo y propósito: iniciar sesión de pricing colaborativa
2. Contexto del proyecto (extraído de canvases + decisions)
3. Invitación a discutir factores de costo y definir precio
4. Referencia al archivo `.agents/prompts/pricing-guide.md` como material de apoyo

## Error Handling Strategy

| Condición | Comportamiento |
|-----------|---------------|
| `docs/architecture-decisions.md` no existe | `console.warn` + guía con contenido parcial ("Sin decisiones documentadas"). Continuar. |
| Canvas no encontrado (uno o ambos) | `console.warn` + `null` como contenido. Continuar. |
| Canvas contiene `[Responde aquí]` | `console.warn` con conteo de secciones. Continuar con contenido parcial. |
| Error de lectura/permisos | `console.warn`. Continuar con `exit(0)`. |
| Archivos de salida ya existen | Sobrescribir sin respaldo. Sin warning. |
| Cualquier error no esperado | `console.warn`. `exit(0)`. Nunca salir con código distinto de 0. |

## Testing Strategy

| Capa | Qué | Enfoque |
|------|-----|---------|
| Unit | `loadDecisions()` | Mock fs: archivo existe vs. no existe. Contenido vs. null. |
| Unit | `findCanvases()` | Mock fs: root/docs/null. Combinaciones de 2 canvases × 3 ubicaciones. Placeholder detection. |
| Unit | `generatePricingGuide()` | decisions null vs. string. canvases null vs. string. Verificar placeholders en output. |
| Unit | `generateDecisionsTemplate()` | Fecha interpolada correctamente. |
| Unit | `generateIAPrompt()` | decisions null → invitar desde cero. decisions presente → contexto incluido. Español neutro verificado por contenido. |
| Integration | Flujo completo | Mock fs global. Verificar escritura de ambos archivos. Verificar console.warn en canvas faltante. Verificar console.log con prompt IA. |
| Integration | Exit code | `exit(0)` en todos los escenarios. Usar `vi.spyOn(process, 'exit')`. |
| Integration | Sin decisiones | decisions faltante → warning + guía parcial + `exit(0)`. |

## Threat Matrix

**N/A** — `funky estimate` solo lee/escribe archivos. No involucra routing, comandos shell, subprocesos, automatización VCS/PR, clasificación de ejecutables ni fronteras de integración de procesos.
