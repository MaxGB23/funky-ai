# 🗺️ Escenarios de Uso — Funky AI CLI

> **Propósito:** Guía de referencia rápida. Según el estado en el que llegás al proyecto, este doc te dice cuál es tu flujo de comandos recomendado y cuándo estás listo para el siguiente paso.

---

## Tabla de Referencia Rápida

| # | ¿En qué estado estás? | Primer comando |
|---|----------------------|----------------|
| [Escenario 1](#escenario-1) | No tenés claro qué construir ni con qué stack | Chat vacío → debate → `funky init --template` |
| [Escenario 2](#escenario-2) | Sabés qué construir, empezás desde cero | `funky init` (modo interactivo) |
| [Escenario 3](#escenario-3) | Repo existente, querés incorporar Funky AI | `funky init --template` (modo migración) |

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

**Paso 1.2 — Creá el directorio y generá los Canvas vacíos**

```bash
mkdir mi-proyecto && cd mi-proyecto
git init
funky init --template
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

**Paso 1.5 — Inicializá el ecosistema completo**

Con los Canvas llenos, el CLI detecta el modo Headless automáticamente:

```bash
funky init
```

**Output esperado:**
```
📄 Ambos Canvas detectados, inicializando en modo Headless...
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

**Paso 2.1 — Creá el directorio e iniciá el modo interactivo**

```bash
mkdir mi-proyecto && cd mi-proyecto
git init
funky init
```

El CLI arranca un wizard interactivo con `@clack/prompts`:

```
Framework Base:          → [seleccionar]
Patrón Arquitectónico:   → [seleccionar]
Gestión de Estado:       → [seleccionar]
Estrategia UI:           → [seleccionar]
Estrategia de Testing:   → [seleccionar]
Base de Datos / ORM:     → [seleccionar]
Autenticación:           → [seleccionar]
Linter / Formatter:      → [seleccionar]
Deployment & CI/CD:      → [seleccionar]
```

El CLI genera `PROJECT-CANVAS.md` e `INFRA-CANVAS.md` con las respuestas y copia toda la estructura de Funky AI.

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

**Paso 3.1 — Generá los Canvas sin tocar el código existente**

```bash
cd mi-repo-existente
funky init --template
```

**Output esperado:**
```
✅ PROJECT-CANVAS.md generado
✅ INFRA-CANVAS.md generado
✅ canvas-planning-guide.md copiado.
```

> ✅ El flag `--template` solo escribe los Canvas y la guía. No toca ningún archivo existente del proyecto.

---

**Paso 3.2 — Llenás los Canvas con el stack actual del proyecto**

No estás decidiendo — estás documentando lo que ya existe. Cada campo del Canvas debe reflejar la realidad actual, no lo ideal.

---

**Paso 3.3 — Inicializá el ecosistema en modo Headless**

```bash
funky init
```

El CLI detecta ambos Canvas y activa el modo Headless: copia toda la estructura de Funky AI sin sobreescribir ningún archivo existente.

> ⚠️ **Migración Legacy:** Si solo existe `PROJECT-CANVAS.md` pero no `INFRA-CANVAS.md` (proyecto pre-v1.7), el CLI genera automáticamente `INFRA-CANVAS.md` con una advertencia de migración en el encabezado. Completá los campos de infra antes de continuar.

**✅ Criterio de salida:** El ecosistema Funky AI está activo sobre tu repo existente. Podés empezar a usar `funky phase` para planificar la próxima feature.

---

## ❌ Anti-patrones a evitar

| Anti-patrón | Por qué es un problema |
|-------------|------------------------|
| Ejecutar `funky init` sin haber definido el stack | El modo interactivo obliga a decidir en tiempo real bajo presión — malas decisiones arquitectónicas |
| Saltear `funky init --template` y llenar los Canvas directamente en el editor | Sin la `canvas-planning-guide.md` como referencia, se omiten campos o se usan valores inválidos |
| Ejecutar `funky init` dos veces sin leer el output | El modo Headless es idempotente, pero si los Canvas están vacíos, el segundo init no los completa |
| Usar `funky assess` sin haber completado los Canvas | El motor de reglas no puede validar lo que no está definido |
