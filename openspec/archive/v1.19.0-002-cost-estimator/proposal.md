# Proposal: Project Cost & Pricing Estimator (RFC 002)

## 1. Contexto
Basado en la exploración aprobada, construiremos una herramienta dentro de `funky-cli` usando el patrón **"Prompt Generator"**. Su objetivo es combatir el *Underpricing* en el desarrollo de software y enseñar a cotizar de manera profesional.

El comando (ej. `funky estimate`) cruzará datos del proyecto para armar un análisis integral. En lugar de calcular una fórmula final rígida, el script generará un artefacto `pricing-prompt.md` inyectado con todo el contexto, listo para ser discutido en una sesión de mentoría con un LLM.

## 2. Decisiones Técnicas & Modelo de Dominio

Aquí es donde brilla el análisis del RFC original. Hemos dividido los factores y asignado un responsable claro a cada uno:

| Dimensión | Responsable de extraer el dato | Qué representa en la Herramienta |
|-----------|--------------------------------|----------------------------------|
| **Factores Técnicos** (El Costo Real) | **CLI (Parsing Automático)** | Extrae del `canvas-planning-guide.md` (y otros artefactos) la complejidad arquitectónica: Integraciones de terceros, asincronía, NFRs, y alcance de Bounded Contexts. |
| **Factores Contextuales** (Ajuste Regional) | **Humano (Consola CLI)** | La CLI hará 3 o 4 preguntas rápidas por consola antes de generar el prompt: *País/Mercado del cliente*, *Tamaño de la empresa*, *Urgencia*. Esto define los multiplicadores de precio. |
| **Factores de Valor** (Value-Based Pricing) | **IA (Evaluación en Chat)** | ¿Cuánto le hace ahorrar o ganar este sistema al cliente? La CLI inyecta el *framework* de evaluación en el prompt, pero el análisis de este impacto lo resuelven el Humano y la IA debatiendo juntos. |

## 3. Stack / Scope
**Stack Tecnológico:**
- Node.js (Core existente de Funky CLI).
- Prompts interactivos por consola nativos de Node/Inquirer para los Factores Contextuales.
- Utilidades de Regex/Parsing para leer y extraer las secciones clave del Canvas de arquitectura.

**Fuera de Scope (Non-Goals):**
- **NO haremos requests API a LLMs:** El CLI *no llama* a OpenAI ni Anthropic. Solo genera un archivo `.md`. El desarrollador pega el contenido en su ChatGPT/Claude de confianza. Esto mantiene la CLI agnóstica, rápida y gratuita.
- **NO exportaremos a SaaS:** La visión a futuro (Frontend) queda descartada para esta iteración. Nos enfocamos 100% en la experiencia Dev-Local.
- **NO daremos un número exacto:** La herramienta entrega un "Piso de Riesgo" y un rango sugerido, pero el output principal es el debate.

## 4. Riesgos
- **Variabilidad del Canvas:** Si el usuario modifica los títulos del Canvas original, el parser de la CLI podría fallar al no encontrar las secciones técnicas.
  *Mitigación:* Dependeremos del parser robusto. Si no encuentra las secciones por Regex, la CLI debe hacer un fallback elegante: avisar que no pudo leer el Canvas y pedirle al usuario un resumen en 1 línea.

> **[SISTEMA - PARA EL ORQUESTADOR]** Si la propuesta es aprobada, procedé a generar el `sdd-tasks.md` dividiendo el trabajo en fases accionables.
