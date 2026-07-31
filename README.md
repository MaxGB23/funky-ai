<div align="center">
  <h1>👻 Funky AI</h1>
  <p><strong>v3.1.0</strong></p>
  <p>
    <em>CLI que unifica la instalación de reglas agénticas, templates SDD, y tools de planeación de proyecto asistida con IA.</em>
  </p>
  <p>
    <a href="https://github.com/MaxGB23/funky-ai/actions"><img src="https://img.shields.io/github/actions/workflow/status/MaxGB23/funky-ai/ci.yml?branch=main&style=for-the-badge&logo=github" alt="Build Status"></a>
    <a href="https://github.com/MaxGB23/funky-ai/blob/main/LICENSE"><img src="https://img.shields.io/github/license/MaxGB23/funky-ai?style=for-the-badge&color=blue" alt="License"></a>
  </p>
</div>

---


```
funky-cli/
├── scaffold       ← Instala el ecosistema agéntico (rules, templates, engram)
├── feature        ← Scaffolding de cambios SDD
├── engram add     ← Captura knowledge base (funciona standalone)
│
├── init           ← Crea PROJECT-CANVAS.md e INFRA-CANVAS.md
├── assess         ← Architecture review con preguntas dinámicas
├── estimate       ← Estimación de costos de infraestructura
└── pipeline       ← Orquesta assess + estimate con estado compartido
```

---

## ⚡ Quick Start

### Instalar el framework agéntico

```bash
funky init         # Canvases del proyecto
funky scaffold     # Rules, templates SDD, engram dirs
funky feature      # Crear una feature SDD
```

### O solo engram (sin scaffold)

```bash
funky init
funky engram add   # Inyecta la regla on-demand + crea docs/engram/
```

### Planear un proyecto

```bash
funky init         # Canvases
funky assess       # Architecture review
funky estimate     # Costos
```

Para entender cuándo usar cada comando forge, ver [`docs/funky-forge/command-flow.md`](docs/funky-forge/command-flow.md).

---

## 🧩 Dos dominios, un CLI

### funky-ai — Framework agéntico para Antigravity (CLI / IDE)

Instala y gestiona el ecosistema de reglas, templates y memoria que los agentes de IA necesitan para operar.

| Comando | Docs | Propósito |
|---------|------|-----------|
| `funky scaffold` | [`docs/funky-ai/scaffold.md`](docs/funky-ai/scaffold.md) | Inyecta .agents/rules/, templates SDD, ORCHESTRATOR-STATE, docs/engram/ |
| `funky feature` | [`docs/funky-ai/feature.md`](docs/funky-ai/feature.md) | Scaffolding SDD por tiers (T1/T2/T3) |
| `funky engram add` | [`docs/funky-ai/engram.md`](docs/funky-ai/engram.md) | Knowledge base — funciona standalone sin scaffold |

Conceptos del framework: [`docs/funky-ai/conceptos/`](docs/funky-ai/conceptos/)

### funky-forge — Project Planning

Tools de planeación asistida: convertir una idea difusa en stack, arquitectura y costos.

| Comando | Docs | Propósito |
|---------|------|-----------|
| `funky init` | [`docs/funky-forge/init.md`](docs/funky-forge/init.md) | PROJECT-CANVAS.md + INFRA-CANVAS.md |
| `funky assess` | [`docs/funky-forge/assess.md`](docs/funky-forge/assess.md) | Architecture review con preguntas dinámicas |
| `funky estimate` | [`docs/funky-forge/estimate.md`](docs/funky-forge/estimate.md) | Pricing guide y decisiones de costos |
| `funky pipeline` | [`docs/funky-forge/pipeline.md`](docs/funky-forge/pipeline.md) | Orquesta assess + estimate con context.json |

Docs completos: [`docs/funky-forge/`](docs/funky-forge/)

---

## 🏛️ Tiers de Orquestación (SDD)

Para el flujo SDD, Funky AI categoriza las tareas por impacto, aprovechando la **Carga JIT (Just-In-Time) de contexto**:

| Tier | Escala | Flujo |
|------|--------|-------|
| **T1 (Flash)** | 1-2 archivos, fixes rápidos | Tasks inline → Ejecución vía Worker. Sin templates. |
| **T2 (Standard)** | 3-5 archivos, features regulares | Delegación estricta vía templates inyectables directos (ej. `t2-explore.md`). |
| **T3 (Insano 👻)** | Refactors complejos | SDD profundo con **Subagentes Nativos** (aislados, no contaminan el contexto global). |

### 🤖 Modos de Ejecución (Subagentes)

El framework soporta 3 modos de operación para adaptarse a tus herramientas:

- **Interactivo:** El subagente pausa entre fases para revisión humana. Entra en estado *Idle* para recibir feedback sin gastar tokens en re-inicializarse.
- **Auto:** Flujo continuo e ininterrumpido (excepto antes de modificar código, donde siempre pide validación).
- **Handoff (Legacy IDE):** Si tu IDE no soporta llamadas nativas a subagentes, el Orquestador genera un bloque de texto estricto. Tú lo copias, lo pegas en un nuevo chat, y la magia continúa sin romper la cadena.
---

## 📚 Referencias

| Si buscas... | Acá está |
|-------------|----------|
| Cómo instalar el framework en un proyecto | [`docs/funky-ai/scaffold.md`](docs/funky-ai/scaffold.md) |
| Cómo planear un proyecto (init, assess, estimate) | [`docs/funky-forge/command-flow.md`](docs/funky-forge/command-flow.md) |
| Cómo crear features SDD por tier | [`docs/funky-ai/feature.md`](docs/funky-ai/feature.md) |
| Cómo capturar conocimiento (standalone o con scaffold) | [`docs/funky-ai/engram.md`](docs/funky-ai/engram.md) |
| Conceptos del framework | [`docs/funky-ai/conceptos/`](docs/funky-ai/conceptos/) |
| Base de conocimiento del proyecto | [`docs/engram/index.md`](docs/engram/index.md) |
| Releases y retrospectivas | [`docs/funky-ai/releases/`](docs/funky-ai/releases/) |
| Mapa completo del repo | [`docs/repo-map.md`](docs/repo-map.md) |

