# Explore: Prevención de Agentic Drift (Overwrite Trap & Batching)
**TIER DE ORQUESTACIÓN ELEGIDO: "2"**

## 1. Contexto del Problema
El Orquestador, al recibir libertad total ("haz lo tuyo"), sufre de "Agentic Drift": busca optimizar tokens y atajos. Esto causa dos problemas críticos detallados en el RFC 02:
1. **Overwrite Trap:** Sobrescribe templates fundacionales (inyectados por `funky feature`) usando la herramienta de escritura masiva, destruyendo el andamiaje arquitectónico en vez de editarlo quirúrgicamente.
2. **Batching:** Ejecuta múltiples fases SDD de corrido, saltándose las "Interactive Gates" humanas y diluyendo el contexto.

## 2. Opciones de Arquitectura

| Opción | Descripción | Pros | Contras / Tradeoffs |
|--------|-------------|------|---------------------|
| **Opción A: Action Forcing en CLI (Fases Escalonadas)** | El CLI `funky phase` controla el ritmo. No inyecta el template de la siguiente fase hasta que la anterior esté marcada como aprobada. Se apoya con una regla estricta en el Orquestador prohibiendo el `Overwrite: true` en la carpeta `docs/openspec`. | - Bloqueo físico real contra el Batching.<br>- Fuerza al humano a revisar. | - Requiere modificar el CLI para inyectar fases de a una, en vez de todo de golpe.<br>- Pequeña fricción DX. |
| **Opción B: Puro Prompt Engineering (Reglas Duras)** | Actualizar `.agents/rules/sdd-orchestrator.md` con instrucciones en mayúsculas y bloques XML prohibiendo explícitamente el batching y el Overwrite. | - Cero esfuerzo de desarrollo en el CLI.<br>- Rápido de implementar. | - Ya falló antes. Los LLMs pueden ignorar las reglas si el contexto se vuelve muy largo. |
| **Opción C: Híbrido: Reglas de Orquestador + Validación de Git** | Reglas estrictas en el Orquestador y un hook en Git o paso en el CLI que aborte si detecta que un template base fue reemplazado en su totalidad (midiendo la entropía del diff). | - Red de seguridad técnica.<br>- No cambia el scaffolding actual de `funky feature`. | - Alta complejidad. Medir diffs puede arrojar falsos positivos. |
| **Opción D: CLI Stateful Wizard (Enfoque Recomendado)** | Al ejecutar `funky feature`, el CLI pregunta interactivamente el Tier, inyecta `explore.md`, y se queda *en espera* (REPL o Inquirer prompt). El usuario avanza usando comandos como "next". El CLI es el dueño del estado en memoria y orquesta físicamente la inyección de los archivos uno a uno. | - DX espectacular.<br>- Bloqueo físico absoluto contra Agentic Drift.<br>- Maneja explícitamente los Tiers. | - Bloquea una terminal mientras dura la sesión (requiere mecanismo de `--resume`).<br>- Mayor refactor del código CLI. |

## 3. Recomendación + Riesgos
**Opción recomendada:** Opción D (CLI Stateful Wizard)

**Justificación:**
La idea de mantener un Wizard interactivo (REPL) en el CLI soluciona la fricción de tener que escribir comandos múltiples y actúa como un guardián de estado. El LLM ya no puede hacer batching porque los archivos físicos de las siguientes fases no existen hasta que el humano selecciona "next" en la terminal.

**Riesgos mitigables:**
- **Terminal Secuestrada:** Al ser un proceso continuo, ocupa una pestaña de la consola. Se mitiga agregando un comando `funky feature --resume <id>` para poder salir del proceso y retomarlo más tarde sin perder el estado de la máquina de estados.
- **Acoplamiento Fuerte:** Se mitiga separando la lógica del "Wizard Inquirer" de la lógica de inyección de templates (`src/utils/canvas.js`).

> **[SISTEMA - PARA EL ORQUESTADOR]** Una vez finalizada la exploración, utilizá este documento como base para generar el `sdd-proposal.md`.
