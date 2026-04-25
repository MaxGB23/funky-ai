# 🔧 Mejoras Pendientes: `funky init` — Observaciones Post Smoke Test v1.7.0

> **Origen:** Smoke Test manual ejecutado el 2026-04-23  
> **Estado:** 🟡 Pre-planificación — Ideas en curso, sin spec formal todavía  
> **Relacionado con:** [`funky-init-flow.md`](./funky-init-flow.md) — flujo interno documentado  
> **Smoke test:** `testeo-de-features/v1.7/interactive/observaciones-interactive.md`

---

## Resumen ejecutivo

El Smoke Test v1.7.0 validó que el flujo headless funciona al 100%. El flujo interactivo presentó bugs de mapping que impiden que el canvas refleje correctamente las decisiones del usuario. Adicionalmente, el análisis del código reveló deuda técnica estructural: los templates son estáticos y no consumen los datos del canvas, y los prompts del CLI son demasiado superficiales para proyectos de escala real.

Esta feature agrupa todo lo necesario para convertir `funky init` en una herramienta de inicialización seria.

---

## 🐛 Bugs a corregir (v1.7.x — Parche rápido)

### BUG-01 — Mismatch de clave `ui` → `styling`

**Síntoma:** El usuario elige "Tailwind" pero la sección 4 del canvas muestra `No definido`.  
**Causa:** `init.js` guarda la clave como `ui`, pero `canvas.js` la lee como `styling`.  
**Impacto:** Bajo (naming). Fix de una línea.  
**Prioridad:** 🔴 Alta — afecta la confianza en el output del CLI.

---

### BUG-02 — `testing` se interpola como boolean literal

**Síntoma:** La sección 5 del canvas muestra `true` en lugar de texto descriptivo.  
**Causa:** `p.confirm()` de `@clack/prompts` devuelve `boolean`. No se transforma antes de pasarlo al canvas.  
**Fix propuesto:**
```js
testing: group.testing ? 'TDD — Test-Driven Development' : 'Sin estrategia de testing definida'
```
**Prioridad:** 🔴 Alta — mismo impacto que BUG-01.

---

## 🏗️ Decisiones de Diseño (No es Deuda Técnica)

### Templates estáticos vs dinámicos
Se determinó que los archivos de bootstrap (`ORCHESTRATOR-STATE.md`, reglas de agente, etc.) **deben ser estáticos por diseño**. No necesitan consumir el `PROJECT-CANVAS.md` en el momento del `init` porque:
1. El Orquestador lee el Canvas dinámicamente durante la sesión.
2. Los archivos generados son reglas de funcionamiento para los agentes, que deben ser universales en el ecosistema Funky AI.
3. Las dependencias específicas del stack (skills) se manejan a través de una librería externa (`autoskills`).

Por lo tanto, el comportamiento actual del modo Headless (que solo preserva el Canvas y no lo parsea para interpolar) es **correcto y esperado**.

---

## 🏗️ Deuda técnica estructural (Feature mayor — sin versión asignada aún)

### DT-01 — Falta de esquema compartido entre modos Headless e Interactivo

**Problema:** No existe un contrato/schema que defina la estructura canónica del canvas. El modo `--template` genera un canvas con secciones vacías, mientras que el interactivo genera uno dinámico. Si las secciones difieren (por versión o por bug), los canvas son estructuralmente inconsistentes.

**Consecuencia:** Riesgo de incompatibilidad si un colaborador genera el canvas en un modo y otro lo parsea desde el otro modo. También dificulta validaciones y tests.

**Dirección de solución:** Definir un `CANVAS_SCHEMA` centralizado (objeto JS con las claves canónicas) que sea la única fuente de verdad para `generateCanvasMarkdown()`, el parser headless y los tests.

---

## 🚀 Mejora de UX: Prompts más ricos para proyectos reales

### Contexto

Los prompts actuales cubren solo 3 dimensiones: patrón arquitectónico, UI y TDD. No son suficientes para definir un proyecto con seriedad. El canvas resultante no le da a la IA el contexto que necesita para asistir de forma relevante.

### Propuesta de nuevas preguntas (orden por impacto arquitectónico)

> ⚠️ Esto todavía está en etapa de observación. Las dimensiones exactas, el wording de cada prompt y las opciones disponibles requieren una spec formal antes de implementar.

1. **Framework base** *(primera pregunta — condiciona todo lo demás)*
   - Next.js (App Router)
   - React + Vite
   - Astro
   - Otro

2. **Patrón arquitectónico** *(mejorar opciones actuales)*
   - Clean Architecture
   - Hexagonal Architecture
   - Screaming Architecture
   - Modular (Feature-Sliced)

3. **Estrategia de estilos y UI**
   - Tailwind CSS (puro)
   - Tailwind + shadcn/ui
   - CSS Modules
   - Styled Components / Emotion
   - Sistema de diseño propio

4. **Estrategia de testing** *(separar en dos dimensiones)*
   - Metodología: TDD / Integration-first / Solo cobertura mínima / Sin testing
   - Runner: Vitest / Jest + herramientas E2E: Playwright / Cypress / Ninguno

5. **Gestión de estado y datos** *(opcional — preguntar solo si aplica al framework)*
   - Redux Toolkit
   - Zustand
   - React Query / TanStack Query
   - Signals (Angular/Preact)
   - Sin estado global (server-side)

### Lo que NO entra en el `init`

- TypeScript strictness → la IA puede leer el `tsconfig.json` directamente
- Deployment target → no es arquitectónico, va en documentación operacional aparte
- CI/CD → idem, va en una fase posterior o en `funky add ci`

### Nota sobre deployment

Mencionarlo en el canvas está bien como sección informativa, pero **no como prompt en el `init`**. Podría ser una sección pre-llenada con `"No definido"` que el usuario complete manualmente, o un comando futuro `funky add deployment`.

---

## 📝 Notas abiertas (sin decisión todavía)

- ¿Usamos un motor de templates (mustache, handlebars) o literales de template JS para DT-01? Tradeoff: simplicidad vs potencia.
- ¿El parser de headless (DT-02) es regex o un parser de Markdown real? Depende de cuán estricto sea el schema.
- ¿Los prompts nuevos van todos juntos o en grupos colapsables (ej. "configuración avanzada")? La UX de `@clack/prompts` permite `group()` con condicionales.
- ¿El `CANVAS_SCHEMA` es un JSON Schema, un objeto JS tipado con JSDoc, o eventualmente un tipo TypeScript si migramos a TS?

---

## 📌 Próximo paso sugerido

Antes de abrir una spec formal, cerrar los **BUG-01 y BUG-02** como parche rápido. Son fixes de 2-3 líneas que no requieren planificación y desbloquean un `funky init` interactivo correcto.

Una vez corregidos, abrir `/sdd-propose` para la feature completa que incluya DT-01, DT-02, DT-03 y los nuevos prompts.
