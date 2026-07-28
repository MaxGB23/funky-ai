# 🗺️ Escenarios de Uso — Funky AI CLI

> **Propósito:** Guía de referencia rápida. Según el estado en el que llegás al proyecto, este doc te dice cuál es tu flujo de comandos recomendado y cuándo estás listo para el siguiente paso.

---

## Tabla de Referencia Rápida

| # | ¿En que estado estas? | Primer comando |
|---|---|---|
| [Escenario 1](#escenario-1) | No tenes claro que construir ni con que stack | Chat vacio → debate → `funky init` |
| [Escenario 2](#escenario-2) | Sabes que construir, empezas desde cero | `funky init` |
| [Escenario 3](#escenario-3) | Repo existente, queres incorporar Funky AI | `funky init` (genera canvases) |
| [Escenario 4](#escenario-4) | Queres registrar un hallazgo o decision tecnica | `funky engram add` |

---

## Escenario 1

### "No tengo claro qué quiero construir"

**Condición de entrada:** No hay directorio del proyecto todavía. El problema a resolver está vago o la solución técnica no está definida.

#### Flujo recomendado

**Paso 1.1 — Abrí un chat vacío y debatí**

No tags de archivos. Describí el problema en lenguaje natural:

```
"Quiero construir algo para [problema]. No sé si es una API, una CLI,
una web app. Ayudame a pensar qué construir y con qué stack."
```

El agente actúa como Senior Architect. Explorá, cuestioná, no te comprometas todavía.

**✅ Criterio de salida del Paso 1.1:** Tenés una decisión técnica concreta — qué construir, con qué stack y por qué.

---

**Paso 1.2 — Crea el directorio y genera los Canvas vacios**

```bash
mkdir mi-proyecto && cd mi-proyecto
git init
funky init
```

**Output esperado:**
```
✅ PROJECT-CANVAS.md generado
✅ INFRA-CANVAS.md generado
✅ canvas-planning-guide.md copiado. Úsala como referencia para llenar los Canvas.
✅ Templates generados. Llénalos y vuelve a ejecutar `funky init`.
```

---

**Paso 1.3 — Llenás los Canvas**

Abrí `canvas-planning-guide.md` como referencia. Completá `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con las decisiones del debate anterior.

**✅ Criterio de salida:** Ambos Canvas tienen valores concretos en todos los campos (no "No definido").

---

**Paso 1.4 — (Opcional) Validá la arquitectura con `funky assess`**

Si la arquitectura tiene puntos de riesgo o no estás seguro de alguna decisión:

```bash
funky assess
```

El comando evalúa `docs/architecture-assessment.md` contra el motor de reglas y genera challenges para debatir con la IA antes de comprometerte al stack.

> ⚠️ Si `funky assess` detecta campos incompletos o contradicciones, revisá los Canvas y repetí hasta que pase.

---

**Paso 1.5 — Inicializa el ecosistema completo**

Con los Canvas llenos, ejecuta `--bootstrap` para copiar toda la estructura del ecosistema Funky AI:

```bash
funky init --bootstrap
```

**Output esperado:**
```
📄 Inicializando estructura completa del ecosistema...
✅ Creado: .agents/rules/engram-protocol.md
✅ Creado: .agents/rules/secops.md
... (resto de la estructura)
✅ Funky AI inicializado.
```

**✅ Criterio de salida:** Tenés el ecosistema completo. Podés hacer el primer commit y arrancar con `funky phase explore`.

---

## Escenario 2

### "Sé qué quiero construir, arranco desde cero"

**Condición de entrada:** Tenés el stack definido mentalmente. No existe el directorio del proyecto todavía.

#### Flujo recomendado

**Paso 2.1 — Crea el directorio y genera los Canvas vacios**

```bash
mkdir mi-proyecto && cd mi-proyecto
git init
funky init
```

El CLI genera `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con placeholders guia, mas `canvas-planning-guide.md` como referencia.

> 💡 **Nota:** No hay prompts interactivos. `funky init` genera los canvases vacios para que el equipo los llene discutiendo con IA. Cuando esten listos, ejecuta `funky init --bootstrap` para copiar toda la estructura Funky AI.

**✅ Criterio de salida:** Tenés el ecosistema completo + Canvas pre-poblados. Primer commit y al flujo SDD.

---

**Paso 2.2 — Primer commit y arranque SDD**

```bash
git add -A
git commit -m "chore: init funky ai ecosystem"
git checkout -b feature/nombre-de-la-primera-feature
funky phase explore    # → genera sdd-explore.md
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

**Paso 3.2 — Llenás los Canvas con el stack actual del proyecto**

No estás decidiendo — estás documentando lo que ya existe. Cada campo del Canvas debe reflejar la realidad actual, no lo ideal.

---

**Paso 3.3 — Inicializá el ecosistema en modo Headless**

```bash
funky init
```

El CLI detecta ambos Canvas y activa el modo Headless: copia toda la estructura de Funky AI sin sobreescribir ningún archivo existente y asumiendo `'ide'` de manera determinista y retrocompatible (evitando colgar prompts en CI/CD).

> ⚠️ **Migración Legacy:** Si solo existe `PROJECT-CANVAS.md` pero no `INFRA-CANVAS.md` (proyecto pre-v1.7), el CLI genera automáticamente `INFRA-CANVAS.md` con una advertencia de migración en el encabezado. Completá los campos de infra antes de continuar.

**✅ Criterio de salida:** El ecosistema Funky AI está activo sobre tu repo existente. Podés empezar a usar `funky phase` para planificar la próxima feature.

---

## ❌ Anti-patrones a evitar

| Anti-patron | Por que es un problema |
|---|---|
| Ejecutar `funky init --bootstrap` sin haber llenado los Canvas | El ecosistema se copia pero sin datos reales de stack en los archivos generados |
| Saltear `funky init` y llenar los Canvas directamente en el editor | Sin la `canvas-planning-guide.md` como referencia, se omiten campos o se usan valores invalidos |
| Ejecutar `funky init --bootstrap` dos veces sin cambios | Es idempotente, no causa dano pero tampoco avanza |
| Usar `funky assess` sin haber completado los Canvas | El motor de reglas no puede validar lo que no está definido |

---

## Escenario 4

### "Encontré un bug o tomé una decisión de arquitectura que debe ser recordada"

**Condición de entrada:** El ecosistema ya está inicializado y ocurrió algo digno de ser guardado en la memoria persistente (Engram) para que los agentes lo recuerden en futuras fases.

#### Flujo recomendado

**Paso 4.1 — Ejecutar el comando de engrama**

```bash
funky engram add
```

El CLI arrancará un wizard interactivo con `@inquirer/prompts` que te guiará para ingresar:
- La categoría (`architecture`, `pattern`, `discovery`, `decision`, `bugfix`)
- El tag único (ej. `[auth-middleware-fix]`)
- Un resumen de una línea para el índice
- Los bloques detallados (`What`, `Why`, `Where`, `Learned`) usando tu editor de sistema.

> 💡 **Tip para agentes:** Si un Worker necesita documentar esto de forma automatizada, puede saltearse el menú interactivo pasando los flags correspondientes (`--tag`, `--category`, `--desc`, etc.).

**✅ Criterio de salida:** El engrama está fragmentado en disco en su directorio correspondiente y el `index.md` ha sido actualizado atómicamente. Los agentes ya pueden acceder a él mediante `grep_search`.
