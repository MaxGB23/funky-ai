# Propuesta de Actualización V1.2: El Ecosistema CLI & Automatización

## 🎯 Objetivo Arquitectónico
Transformar Funky AI de un "protocolo puramente conversacional y manual" a un entorno productivo dotado de herramientas de software propias. El objetivo de la v1.2 es eliminar la "burocracia humana" en el inicio y gestión de proyectos, delegando la creación física del Falso Engram a un sistema externo desarrollado a medida. Esto marca el salto transicional del developer de operario a creador de herramientas (Tool-smithing).

## 💡 Patrones y Herramientas a Introducir

### 1. Proyecto `funky-cli` (Automatización por Software)
- **El Problema:** Actualmente, inicializar un proyecto para que Funky AI funcione requiere trasladar carpetas (`.agents/rules`, `docs/`) a mano. Antigravity no tiene scaffolder nativo para esto.
- **La Solución:** Programar un CLI liviano en `Node.js` (ej. instalable vía `npx` o globalmente).
- **Funciones Propuestas:**
  - `funky init`: Genera automáticamente en milisegundos toda la estructura base para el "Falso Engram" y clona las reglas maestras.
  - `funky phase <name>`: Despliega templates vacíos en crudo (ej: `explore.md` o `design.md`) para que estén listos cuando el usuario abra un nuevo chat.

### 2. Estructuración del Router: Sistema de Comandos (`/slash-commands`)
- **El Problema:** El Orquestador necesita largos prompts descriptivos para entender en qué fase se encuentra la conversación.
- **La Solución:** Oficializar e inyectar en el cerebro global el soporte a comandos cortos como "triggers" de contexto.
- **Ejemplos:**
  - `/sdd-explore` → Pone al modelo en modo Analista pasivo, exigiendo que entregue *3 opciones de arquitectura*.
  - `/sdd-propose` → Pone al modelo en modo Arquitecto rígido, diseñando APIs pero dictando cero código.

### 3. Identidad Primada (El Bozal de Tiers)
- **El Problema:** Los sub-agentes no saben qué tan "encorsetados" deben estar al operar.
- **La Solución:** Formalizar el uso de los *Tiers de Complejidad* no solo como métrica humana, sino como "Identidad" a declarar en el primer mensaje.
- **Implementación:** Al delegar, el humano arrancará explícitamente diciendo *"Agente, sos Worker Tier 3"*. Esto activará heurísticas internas donde el agente aniquilará su creatividad y se convertirá en un transductor estricto de requerimientos.

### 4. Automatización "Doc-Ops" y Sharding de Memoria (Housekeeping Autosuficiente)
- **El Problema:** Archivos como el `post-mortem.md` generan "Token Bloat" si crecen infinitamente, destruyendo el límite de contexto del LLM al momento de leerlos. Además, mantener a mano el `README.md` o hacer las Release Notes genera fatiga burocrática.
- **La Solución:** Implementar Particionamiento de memoria (Sharding) y crear comandos Doc-Ops explícitos (ej: `/sdd-archive`, `/sdd-release`).
- **Implementación:** 
  1. **Sharding CLI:** El comando `funky init` configurará la memoria como un directorio distribuido (`docs/engram/`) para que el `grep_search` encuentre aguja en un pajar sin arrastrar monolitos gigantes de texto.
  2. **Archivado Autónomo:** El Orquestador responderá a comandos de limpieza delegando a Workers la reducción de logs viejos y la compresión de "Learned" en resúmenes densos, manteniendo el Falso Engram rápido y blindado.

### 5. Delegación de Git Branching (Autonomía de Workers)
- **El Problema:** El Humano debe recordar aislar el entorno (`git checkout -b feature/...`) antes de ordenar picar código, lo cual es una intervención manual tediosa que pone en riesgo la rama `main`.
- **La Solución:** Facultar a los Sub-Agentes (Workers) para que asuman la autoría de su propio entorno de trabajo utilizando herramientas de terminal de la IDE.
- **Implementación:** Añadir al archivo `docs/funky-ai/funky-ai-team-guide.md` (Sección: Paso 2 - La Delegación) la restricción explícita de que la **primera acción** de todo Worker Tier 2/3 antes de escribir código es ejecutar `git checkout -b feature/[nombre-tarea]`. Esta norma también debe reflejarse en el template de prompt que el Orquestador usa al instanciar Workers.

---

## 📈 Impacto Académico y Profesional
Construir una CLI desde cero implica comprender el Event Loop, manipulación cruda de archivos (`fs` de Node), parseo de argumentos de línea de comandos (ej. `commander` o `yargs`) y publicación de paquetes globales. Es el ejercicio técnico perfecto y definitivo para solidificar las bases de arquitectura y subir un escalón masivo como desarrollador. 

## 🔭 Horizonte a Futuro (Post v1.2)
- **v1.3 (Git-Ops & CI/CD):** La generación de *Pull Requests*, análisis autónomo de `git diff` y estandarización estricta de Commits convencionales se desarrollará como un módulo de "Skills" totalmente independiente en el futuro. *Justificación arquitectónica: Evitar el "Feature Bloat" en la v1.2 y focalizarse 100% en el scaffolding y sistema de archivos locales primero.*

*Estado: 🚧 In Progress — Rama `feature/v1.2-funky-cli` activa. `funky-cli/package.json` e `index.js` inicializados. Pendiente diseño técnico de comandos Node.js.*
