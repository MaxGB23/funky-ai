# Arquitectura SDD en Funky AI

## ¿Qué es Funky AI y el Framework SDD?

**Funky AI** no es solo un asistente de IA, es un ecosistema agéntico diseñado para el desarrollo de software complejo. En su núcleo opera bajo el framework **SDD (Spec Driven Development)**, una metodología que emula cómo un Arquitecto de Software delega tareas a su equipo de ingenieros. 

En lugar de lanzar un prompt masivo esperando un milagro, SDD fragmenta el desarrollo en un pipeline determinista de diseño, especificación y ejecución. Esto reduce el error (alucinaciones) y permite intervención humana en puntos críticos.

---

## 🏛️ Tiers de Orquestación

Funky AI categoriza la delegación por "Tiers" dependiendo del impacto y la complejidad del cambio. La regla fundamental es **Carga JIT (Just-In-Time) de contexto**: los agentes solo ven lo que necesitan para su tarea específica, protegiendo el token window.

### Tier 1 (Flash)
- **Finalidad:** Cambios rápidos, refactors menores, typos o ajustes que afectan a 1 o 2 archivos.
- **Fases:** Inline. El Orquestador planifica mentalmente y ejecuta directamente usando la skill de `Worker`.
- **Características:** No requiere generación de documentos (templates) y se ejecuta en un solo paso. Rápido y barato.

### Tier 2 (Standard - Subagentes Ligeros)
- **Finalidad:** Features regulares que impactan entre 3 y 5 archivos.
- **Fases (Delegación estricta):** 
  - `Explore`: Entiende el codebase actual.
  - `Propose`: Propone una solución.
  - `Spec`: Redacta las especificaciones.
  - `Tasks`: Divide en tareas.
  - `Apply`: Ejecuta la implementación por batches mediante un *funky-worker* (contrato `t2-apply.md`), tras un checkpoint pre-apply obligatorio.
  - `Verify`: Valida contra la especificación.
  - `Archive`: Cierra y documenta la feature internamente.
  - `Post-Archive (Release)`: Inyectado condicionalmente por `funky feature`. Llena `release-checklist.md` y `docs.md` si el impacto lo amerita. El proceso frena estrictamente en operaciones Git para pedir aprobación humana antes de cerrar el SDD.
- **Características:** Utiliza *subagentes ligeros*. Cada fase se apoya en *templates inyectables* (ej. `t2-explore.md`). El contexto se pasa entre fases a través de artefactos markdown, pero todo ocurre en el mismo hilo/sesión.

### Tier 3 (Insano - Custom Workflows)
- **Finalidad:** Cambios arquitectónicos mayores, refactors complejos o scaffolding de features completas.
- **Fases:** Utiliza un workflow SDD profundo con fases homólogas al T2, añadiendo fases exclusivas como `Design` y validación de NFRs. Al igual que el T2, culmina con un **Post-Archive** condicional donde se llenan `release-checklist.md` y `docs.md`, requiriendo aprobación humana para las operaciones de Git.
- **Características:** Emplea **Subagentes Nativos**. El Orquestador delega cada fase a un LLM en un entorno aislado con su propio hilo. Esto asegura que el contexto global del Orquestador no se contamine (ni explote por tokens) con los pormenores de una implementación gigante.

---

## 🤖 Modos de Ejecución

Para adaptarse a distintos entornos (y niveles de confianza), el framework SDD soporta 3 modos de operación:

1. **Auto:** Flujo continuo. El framework pasa de una fase a otra automáticamente (útil para pruebas o cuando el CI/CD es muy robusto). Ojo: siempre pide validación humana *antes* de modificar código destructivamente.
2. **Interactivo:** El modo recomendado. El subagente pausa entre fases clave (ej. después de proponer diseño) para revisión humana. El agente entra en estado *Idle*, esperando feedback sin gastar tokens en reinicializarse.
3. **Handoff (Legacy IDE):** Pensado para entornos donde el IDE no soporta llamadas nativas a subagentes. El Orquestador genera un bloque de texto estricto con las instrucciones de la siguiente fase. El usuario lo copia y pega en un chat nuevo, continuando la cadena sin perder contexto.

---

## 🏗️ Estructura Inyectada por `funky sdd install`

Cuando corres `funky sdd install`, se materializa la estructura necesaria para que SDD funcione. Cada directorio tiene un propósito estricto:

### 1. `.agents/rules/`
El "cerebro operativo". Contiene 27 reglas que dictan el comportamiento.
- Reglas globales planas: Orquestador, enrutadores T1/T2/T3, preflight, matriz de escalamiento, seguridad (`secops.md`), protocolo Engram.
- `metodologias.md`: restricciones de trabajo data-driven (TDD estricto, convenciones) que el orquestador cachea e inyecta como bloque `Contexto Previo` en cada delegación.
- `sabueso-route-a.md` y `codegraph.md`: contratos de exploración read-only (subagente sabueso Route A) y de consulta estructural JIT vía codegraph.
- `tier2-delegation/`: Contratos por fase para que los subagentes ligeros sepan qué hacer en cada fase del T2 (incluye `t2-apply.md`, la ejecución por batches).
- `tier3-interactive/`: Reglas pesadas para validación de riesgo y workflows nativos interactivos.

### 2. `.agents/templates/sdd/`
La "burocracia útil". Aquí viven las plantillas Markdown (`explore.md`, `proposal.md`, `spec.template.md`, etc.) que los agentes deben llenar en el T2 y T3 para garantizar que la información fluya estructurada entre fases. También contiene el índice dinámico de la documentación viva.

### 3. `docs/funky-ai/prompts/sdd/`
Los **workflows T3** (custom workflows): un prompt por fase (`funky-explore.md` … `funky-archive.md`, más `funky-worker.md`) que cada subagente nativo lee al inicio de su fase para adoptar su rol. Es la única pieza inyectada fuera de `.agents/` además del RFC template.

### 4. `docs/engram/`
La "memoria a largo plazo" (Memoria Persistente). Está dividida en 7 subdirectorios/shards:
- `architecture/`: Cambios estructurales.
- `pattern/`: Patrones de código descubiertos o creados.
- `discovery/`: Hallazgos de edge cases o restricciones.
- `decision/`: ADRs (Architecture Decision Records).
- `bugfix/`: RCAs de bugs complejos.
- `session/`: Resúmenes de sesiones.
- `release/`: Notas de versión.

### 5. `openspec/rfcs/`
Donde viven los *Request For Comments*. Al estar fuera de la carpeta `.agents`, fomenta que estos documentos sean del dominio del equipo de ingeniería completo y no solo un artefacto interno de la IA.

### 6. Archivos Raíz (`ORCHESTRATOR-STATE.md`)
Archivos de anclaje que mantienen al Orquestador al tanto del estado global del proyecto desde el inicio de cualquier sesión.
