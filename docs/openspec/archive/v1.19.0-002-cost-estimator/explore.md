# Explore: Project Cost & Pricing Estimator (RFC 002)

## 1. Contexto del Problema
Muchos desarrolladores juniors o agencias pequeñas sufren de "Underpricing". Cobran basándose únicamente en horas trabajadas, ignorando el mantenimiento, los costos ocultos de infraestructura, y el riesgo tecnológico (integraciones, concurrencia, asincronía). Esto genera burnout, abandono de proyectos y clientes insatisfechos.

El objetivo es proveer una herramienta dentro de `funky-cli` que no sea una simple "calculadora", sino un **Generador de Prompts (Mentoría)**:
1. Extrae los datos duros (entidades, dependencias, constraints) de los Canvas del proyecto.
2. Calcula un piso matemático base (costo estructural).
3. Genera un prompt inyectado con todo el contexto para que el desarrollador debata y analice los "trade-offs" de negocio y arquitectura junto a la IA.

## 2. Opciones de Arquitectura

| Opción | Descripción | Pros | Contras / Tradeoffs |
|--------|-------------|------|---------------------|
| **Opción A: Calculadora Standalone Web** | App web independiente con un Wizard donde el usuario completa manualmente cada detalle del proyecto. | - UI atractiva.<br>- Agnóstico del entorno local. | - Cero contexto automático (fricción).<br>- Promueve un enfoque de "fórmula rígida". |
| **Opción B: CLI Hardcoded Script** | Script interactivo en la CLI (tipo Inquirer.js) que hace muchas preguntas y escupe un precio final. | - Fácil de implementar MVP.<br>- Se ejecuta en el repo. | - No lee semántica (ej. la complejidad real de los Bounded Contexts).<br>- Falta razonamiento cualitativo. |
| **Opción C: Patrón "Prompt Generator"** | La CLI lee los Canvas (ej. `canvas-planning-guide.md`), calcula un piso base y genera un `pricing-prompt.md` listo para LLMs. | - Aprovecha contexto existente (Cero Fricción).<br>- Enseña "Value-based pricing".<br>- IA resuelve la complejidad semántica. | - Depende de que el Canvas esté bien documentado.<br>- Requiere un LLM externo (ChatGPT/Claude/etc). |

## 3. Recomendación + Riesgos
**Opción recomendada:** **Opción C (Patrón "Prompt Generator")**

**Justificación:**
Es la única arquitectura que respeta nuestra filosofía: *Conceptos > Código* y *La IA es una herramienta, el humano decide*. En lugar de escupir un "número mágico", prepara el terreno (recopilando contexto de los Canvas) para forzar un debate de alto nivel sobre riesgo, infraestructura y valor de negocio. Además, reutiliza la lógica de parsing de la CLI que ya maduramos.

**Riesgos mitigables:**
- **Canvas Incompleto:** Si el proyecto no tiene Canvas o está vacío, el generador no tendrá contexto.
  *Mitigación:* La CLI debe hacer un "pre-flight check" rápido; si faltan datos críticos, le advierte al usuario o hace 2-3 preguntas clave por consola como fallback.
- **Context Dilution / Prompt Enorme:** Mandar todo el Canvas crudo puede saturar LLMs chicos.
  *Mitigación:* La CLI debe extraer solo "Hard Facts" (Lista de APIs, Volumetría, NFRs) y meterlos en un formato comprimido (YAML o bullet points) dentro del prompt.

> **[SISTEMA - PARA EL ORQUESTADOR]** Una vez finalizada la exploración, utilizá este documento como base para generar el `sdd-proposal.md`.
