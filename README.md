# 👻 Funky AI v3.0.0: Protocolo de Arquitectura de Agentes

Bienvenido a **Funky AI**, el framework de Inteligencia Artificial diseñado para emular redes asíncronas de agentes (SDD - Software Design Document) integrándose de forma nativa con el IDE Antigravity.

> **🚀 Estado del Arte (v3.1.0): Subagentes Nativos y Carga JIT**
> El framework utiliza carga JIT (Just-In-Time) para aislar reglas por Tier y minimizar el ruido de contexto. El Orquestador delega exploraciones pesadas a subagentes nativos (sabuesos), iterando sobre ellos sin destruirlos. ¡Ahorramos tokens y mantenemos la memoria inmaculada!
>
> **🛡️ CI Status:** ![CI](https://github.com/MaxGB23/funky-ai/actions/workflows/ci.yml/badge.svg)

---

## ⚡ Quick Start

Deja de leer teoría y empieza a construir. Así se inicia la orquestación:

1. **Bootstrap inicial:** Inyecta las reglas, la memoria y el lienzo del proyecto.
   ```bash
   funky init
   ```
2. **Iniciar un feature:** Genera el andamiaje SDD para delegar código.
   ```bash
   funky feature mi-nuevo-modulo
   ```

*(Consulta [`docs/funky-ai/workflows/guia-flujo-completo.md`](./docs/funky-ai/workflows/guia-flujo-completo.md) para dominar el flujo End-to-End).*

---

## 🏛️ Flujo de Orquestación y Tiers (Escalation Matrix)

Funky AI categoriza y enruta dinámicamente las tareas para evitar sobre-ingeniería. Carga las reglas precisas en el momento preciso.

| Tier | Escala de Impacto | Flujo y Delegación |
|------|-------------------|--------------------|
| **T1 (Flash)** | 1-2 archivos. Fixes rápidos. | Sin planning pesado. El Orquestador redacta tasks inline y ejecuta directo. |
| **T2 (Standard)**| 3-5 archivos. Features regulares. | Delegación estricta vía templates inyectables. Mantiene el scope seguro y acotado. |
| **T3 (Deep)** | Refactors, arquitecturas complejas. | SDD completo (Explore → Propose → Spec → Design → Tasks → Apply). Uso intenso de Subagentes nativos para investigación profunda. |

### 🛠️ Checkpoint Pre-Apply: ¿CLI o IDE?
En cualquier Tier, justo antes de meterle mano al código (Fase Apply), el framework hace una pausa obligatoria y te da el control para elegir cómo ejecutar:
- **CLI (Nativo):** Ejecución 100% automatizada con Subagentes asíncronos en background.
- **IDE (Handoff):** Generación de bloques copy-paste listos para que tú tengas el control visual en tu editor.

---

## 📦 Releases Históricos

| Versión | Detalle |
|---|---|
| **[v3.0.0](./docs/funky-ai/releases/v3.0.0-release.md)** | ⭐ **Actual** — Arquitectura JIT, Sabuesos de investigación y separación estricta de contexto por Tiers. |

> 📂 [Explora el historial completo de versiones en `docs/funky-ai/releases/`](./docs/funky-ai/releases/)

---

## 📚 Índice Profundo (Wiki y Teoría)

¿Quieres meterte a las tripas del protocolo? Todo el material de diseño, el Engram (memoria) y el diario de evolución fue movido al interior del repositorio para mantener este lobby limpio.

- **[Manifiesto y Filosofía Core](./docs/funky-ai/core-concepts/manifiesto.md)**
- **[Base de Conocimiento (Engram)](./docs/engram/index.md)**
- **[Diario Arquitectónico (Journey)](./docs/funky-ai/journey/journey.md)**
- **[Auditorías y Referencia de Gentle AI](./docs/gentle-ai/)**
