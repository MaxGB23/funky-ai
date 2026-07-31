# 🗺️ Escenarios de Uso — Funky AI CLI

> **Propósito:** Guía de referencia rápida. Según el estado en el que llegas al proyecto, este doc te dice cuál es tu flujo de comandos recomendado y cuándo estás listo para el siguiente paso.

---

## Tabla de Referencia Rápida

| # | ¿En qué estado estás? | Primer comando |
|---|---|---|
| [Escenario 1](#escenario-1) | No tienes claro qué construir ni con qué stack | Chat vacío → debate → `funky init` |
| [Escenario 2](#escenario-2) | Sabes qué construir, empiezas desde cero | `funky init` |
| [Escenario 3](#escenario-3) | Repo existente, quieres incorporar Funky AI | `funky init` (genera canvases) |
| [Escenario 4](#escenario-4) | Quieres discutir arquitectura o pricing | `funky assess` / `funky estimate` / `funky pipeline all` |
| [Escenario 5](#escenario-5) | Quieres registrar un hallazgo o decisión técnica | `funky engram add` |

---

## Escenario 1

### "No tengo claro qué quiero construir"

**Condición de entrada:** No hay directorio del proyecto todavía. El problema a resolver está vago o la solución técnica no está definida.

#### Flujo recomendado

**Paso 1.1 — Abre un chat vacío y debate**

No tags de archivos. Describe el problema en lenguaje natural:

```
"Quiero construir algo para [problema]. No sé si es una API, una CLI,
una web app. Ayúdame a pensar qué construir y con qué stack."
```

El agente actúa como Senior Architect. Explora, cuestiona, no te comprometas todavía.

**✅ Criterio de salida del Paso 1.1:** Tienes una decisión técnica concreta — qué construir, con qué stack y por qué.

---

**Paso 1.2 — Crea el directorio y genera los Canvas vacios**

```bash
mkdir mi-proyecto && cd mi-proyecto
git init
funky init
```

**Output esperado:**
```
🚀 Funky AI — Inicializando...
✅ Creado: PROJECT-CANVAS.md
✅ Creado: INFRA-CANVAS.md
✅ Creado: canvas-planning-guide.md

📘 Canvases generados. Ejecuta `funky scaffold`.
```

---

**Paso 1.3 — Llenas los Canvas**

Abre `canvas-planning-guide.md` como referencia. Completa `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con las decisiones del debate anterior.

**✅ Criterio de salida:** Ambos Canvas tienen valores concretos en todos los campos (sin `[Responde aquí]`).

---

**Paso 1.4 — (Opcional) Discute la arquitectura con `funky assess`**

Si la arquitectura tiene puntos de riesgo o no estás seguro de alguna decisión:

```bash
funky assess
```

**Qué hace:** El CLI lee PROJECT-CANVAS.md e INFRA-CANVAS.md e inyecta una guía de discusión de 6 fases (Contexto → Preocupaciones → Preguntas Guía → Riesgos → Alternativas → Acuerdos), más un template de decisiones. Sin reglas estáticas, sin validación binaria, nunca falla. Si hay placeholders sin completar (`[Responde aquí]`), advierte pero continúa.

**Output esperado:**
```
📄 Guía de discusión generada → docs/funky-ai/assess/architecture-review.md
📄 Template de decisiones → docs/funky-ai/assess/architecture-decisions.md (si no existía)
```

> 💡 Copia el contenido de `docs/funky-ai/assess/architecture-review.md` en un chat con IA y discute: riesgos, alternativas, trade-offs. Documenta los acuerdos en `docs/funky-ai/assess/architecture-decisions.md`.

---

**Paso 1.5 — Inicializa el ecosistema completo**

Con los Canvas llenos, ejecuta `funky scaffold` para copiar toda la estructura del ecosistema Funky AI:

```bash
funky scaffold
```

**Output esperado:**
```
🚀 Instalando estructura Funky AI...
✅ Creado: .agents/rules/engram-protocol.md
✅ Creado: .agents/rules/secops.md
✅ Creado: .agents/rules/secops-setup.md
✅ Creado: .agents/rules/sdd-orchestrator.md
... (~20 archivos/directorios)
✅ Funky AI instalado.
```

**✅ Criterio de salida:** Tienes el ecosistema completo.

---

**Paso 1.6 — (Opcional) Sesión de pricing con `funky estimate`**

Si quieres discutir costos y trade-offs de pricing basados en las decisiones arquitectónicas:

```bash
funky estimate
```

O si prefieres orquestar assess + estimate en secuencia:

```bash
funky pipeline all
```

✅ **Criterio de salida:** Puedes hacer el primer commit y arrancar con SDD usando `funky feature`.

---

## Escenario 2

### "Sé qué quiero construir, arranco desde cero"

**Condición de entrada:** Tienes el stack definido mentalmente. No existe el directorio del proyecto todavía.

#### Flujo recomendado

**Paso 2.1 — Crea el directorio y genera los Canvas vacíos**

```bash
mkdir mi-proyecto && cd mi-proyecto
git init
funky init
```

El CLI genera `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con placeholders guía, más `canvas-planning-guide.md` como referencia.

> 💡 **Nota:** No hay prompts interactivos. `funky init` genera los canvases vacíos. Cuando estén llenos, ejecuta `funky scaffold` para copiar toda la estructura Funky AI.

**✅ Criterio de salida:** Tienes los canvases llenos. Ejecuta `funky scaffold` para el ecosistema completo, luego primer commit y al flujo SDD.

---

**Paso 2.2 — Primer commit y arranque SDD**

```bash
git add -A
git commit -m "chore: init funky ai ecosystem"
git checkout -b feature/nombre-de-la-primera-feature
funky feature nombre-de-la-feature    # → scaffolding de feature SDD
```

---

## Escenario 3

### "Tengo un repo existente sin Funky AI"

**Condición de entrada:** Hay código en el directorio. No existe `PROJECT-CANVAS.md` ni la estructura `.agents/`.

#### Flujo recomendado

**Paso 3.1 — Genera los Canvas sin tocar el codigo existente**

```bash
cd mi-repo-existente
funky init
```

**Output esperado:**
```
✅ PROJECT-CANVAS.md generado
✅ INFRA-CANVAS.md generado
✅ canvas-planning-guide.md copiado.
```

> ✅ `funky init` solo escribe los Canvas y la guia. No toca ningun archivo existente del proyecto.

---

**Paso 3.2 — Llenas los Canvas con el stack actual del proyecto**

No estás decidiendo — estás documentando lo que ya existe. Cada campo del Canvas debe reflejar la realidad actual, no lo ideal.

---

**Paso 3.3 — Inicializa el ecosistema completo**

Con los canvases llenos, ejecuta `funky scaffold` para copiar la estructura Funky AI sin sobrescribir archivos existentes:

```bash
funky scaffold
```

**✅ Criterio de salida:** El ecosistema Funky AI está activo sobre tu repo existente. Puedes empezar a usar `funky feature` para planificar la próxima feature.

---

## ❌ Anti-patrones a evitar

| Anti-patron | Por que es un problema |
|---|---|
| Ejecutar `funky scaffold` sin haber llenado los Canvas | ✅ Válido — instala el framework sin canvases. Si después quieres los canvases, ejecuta `funky init` y luego `funky scaffold` de nuevo (es idempotente) |
| Saltear `funky init` y llenar los Canvas directamente en el editor | Sin la `canvas-planning-guide.md` como referencia, se omiten campos o se usan valores invalidos |
| Ejecutar `funky scaffold` dos veces sin cambios | Es idempotente, no causa dano pero tampoco avanza |
| Ejecutar `funky estimate` sin haber corrido `funky assess` antes | El pricing no tendrá contexto de decisiones arquitectónicas — se genera igual pero con contenido parcial |
| Ejecutar `funky assess` con canvases incompletos | El CLI advierte pero continúa — la guía se genera con contenido parcial |

---

## Escenario 4

### "Quiero discutir la arquitectura o pricing de mi proyecto"

**Condición de entrada:** Ya tienes los canvases llenos (PROJECT-CANVAS.md e INFRA-CANVAS.md) y quieres una sesión de discusión con IA.

#### Flujo recomendado

**Paso 4.1 — Discute la arquitectura**

```bash
funky assess
```

Genera `docs/funky-ai/assess/architecture-review.md` (guía de discusión de 6 fases) y `docs/funky-ai/assess/architecture-decisions.md` (template de decisiones). Copia la guía en un chat con IA y discute riesgos, alternativas y trade-offs.

**Paso 4.2 — Sesión de pricing**

```bash
funky estimate
```

Inyecta guía de pricing + prompt IA. Copia el prompt en un chat y discute costos, alternativas más económicas y value-based pricing.

**Paso 4.3 — O todo en uno con pipeline**

```bash
funky pipeline all
```

Orquesta assess → estimate en secuencia con estado compartido vía `context.json`. No tienes que ejecutar los comandos manualmente.

✅ **Criterio de salida:** Tienes `docs/funky-ai/assess/architecture-decisions.md` y `docs/funky-ai/estimate/pricing-decisions.md` documentados.

---

## Escenario 5

### "Encontré un bug o tomé una decisión de arquitectura que debe ser recordada"

**Condición de entrada:** El ecosistema ya está inicializado y ocurrió algo digno de ser guardado en la memoria persistente (Engram) para que los agentes lo recuerden en futuras fases.

#### Flujo recomendado

**Paso 5.1 — Ejecutar el comando de engrama**

```bash
funky engram add
```

El CLI arrancará un wizard interactivo con `@inquirer/prompts` que te guiará para ingresar:
- La categoría (`architecture`, `pattern`, `discovery`, `decision`, `bugfix`)
- El tag único (ej. `[auth-middleware-fix]`)
- Un resumen de una línea para el índice
- Los bloques detallados (`What`, `Why`, `Where`, `Learned`) usando tu editor de sistema.

> 💡 **Tip para agentes:** Si un Worker necesita documentar esto de forma automatizada, puede saltarse el menú interactivo pasando los flags correspondientes (`--tag`, `--category`, `--desc`, etc.).

**✅ Criterio de salida:** El engrama está fragmentado en disco en su directorio correspondiente y el `index.md` ha sido actualizado atómicamente. Los agentes ya pueden acceder a él mediante `grep_search`.
