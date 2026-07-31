# 👻 Funky AI v3.1.0 — Protocolo de Arquitectura de Agentes

Bienvenido a **Funky AI**, el framework de Inteligencia Artificial diseñado para emular redes asíncronas de agentes (SDD — Spec Driven Development) integrándose de forma nativa con el IDE Antigravity.

> **🚀 Estado del Arte (v3.1.0): Subagentes Nativos y Carga JIT**
> El framework utiliza carga JIT (Just-In-Time) para aislar reglas por Tier y minimizar el ruido de contexto. El Orquestador delega exploraciones pesadas a subagentes nativos (sabuesos), iterando sobre ellos sin destruirlos.
>
> **🛡️ CI Status:** ![CI](https://github.com/MaxGB23/funky-ai/actions/workflows/ci.yml/badge.svg)

---

## ⚡ Quick Start

```bash
# 1. Inicializar los canvases del proyecto
funky init

# 2. Instalar el ecosistema agéntico (rules, templates, engram)
funky scaffold

# 3. Crear una feature SDD
funky feature mi-nuevo-modulo
```

Consulta [`docs/funky-forge/command-flow.md`](./docs/funky-forge/command-flow.md) para entender el flujo completo de planeación de proyecto.

---

## 🏛️ Flujo de Orquestación y Tiers (Escalation Matrix)

Funky AI categoriza y enruta dinámicamente las tareas para evitar sobre-ingeniería. Carga las reglas precisas en el momento preciso.

| Tier | Escala de Impacto | Flujo y Delegación |
|------|-------------------|--------------------|
| **T1 (Flash)** | 1-2 archivos. Fixes rápidos. | Sin planning pesado. El Orquestador redacta tasks inline y ejecuta directo. |
| **T2 (Standard)** | 3-5 archivos. Features regulares. | Delegación estricta vía templates inyectables. Mantiene el scope seguro y acotado. |
| **T3 (Deep)** | Refactors, arquitecturas complejas. | SDD completo (Explore → Propose → Spec → Design → Tasks → Apply). Uso intenso de Subagentes nativos para investigación profunda. |

---

## 📂 Estructura del Repositorio

| Ruta | Propósito |
|------|-----------|
| [`funky-cli/`](funky-cli/) | CLI del framework y tools de planeación |
| [`docs/funky-ai/`](docs/funky-ai/) | Documentación del framework agéntico |
| [`docs/funky-forge/`](docs/funky-forge/) | Documentación de las tools de planeación |
| [`docs/engram/`](docs/engram/) | Memoria persistente del sistema |
| [`docs/openspec/`](docs/openspec/) | RFCs, cambios SDD y archivos |
| [`init-observaciones/`](init-observaciones/) | Histórico de refactors y exploraciones |

Para un mapa detallado, ver [`docs/repo-map.md`](./docs/repo-map.md).

---

## 📚 Referencias

| Si buscas... | Acá está |
|-------------|----------|
| Cómo instalar el framework en un proyecto | [`docs/funky-ai/scaffold.md`](docs/funky-ai/scaffold.md) |
| Cómo planear un proyecto (init, assess, estimate) | [`docs/funky-forge/command-flow.md`](docs/funky-forge/command-flow.md) |
| Cómo crear features SDD | [`docs/funky-ai/feature.md`](docs/funky-ai/feature.md) |
| Cómo capturar conocimiento | [`docs/funky-ai/engram.md`](docs/funky-ai/engram.md) |
| Conceptos del framework | [`docs/funky-ai/conceptos/`](docs/funky-ai/conceptos/) |
| Base de conocimiento | [`docs/engram/index.md`](docs/engram/index.md) |
| Releases y retrospectivas | [`docs/funky-ai/releases/`](docs/funky-ai/releases/) |

> 📂 [Explora el historial completo de versiones](docs/funky-ai/releases/)
