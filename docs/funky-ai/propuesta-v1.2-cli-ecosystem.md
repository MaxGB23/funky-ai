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

### 4. Automatización "Doc-Ops" (Housekeeping Autosuficiente)
- **El Problema:** Sincronizar el `README.md`, generar notas de versión en `docs/releases/` o consolidar reportes genera fatiga burocrática. El humano no debería abrir un chat exclusivamente para "escribir documentación" tras un feature.
- **La Solución:** Desarrollar un comando de orquestación (ej: `/sdd-release`) inspirado en la arquitectura forense de Gentle AI.
- **Implementación:** El Orquestador, al mantener las referencias del `ORCHESTRATOR-STATE.md` (Punteros limpios), tiene suficiente contexto de alto nivel para deducir qué sub-sistemas cambiaron. Esto le permite auto-generar las notas de versión y mantener la sincronización del índice sin ensuciar la ventana de contexto del desarrollo de código.

---

## 📈 Impacto Académico y Profesional
Construir una CLI desde cero implica comprender el Event Loop, manipulación cruda de archivos (`fs` de Node), parseo de argumentos de línea de comandos (ej. `commander` o `yargs`) y publicación de paquetes globales. Es el ejercicio técnico perfecto y definitivo para solidificar las bases de arquitectura y subir un escalón masivo como desarrollador. 

## 🔭 Horizonte a Futuro (Post v1.2)
- **v1.3 (Git-Ops & CI/CD):** La generación de *Pull Requests*, análisis autónomo de `git diff` y estandarización estricta de Commits convencionales se desarrollará como un módulo de "Skills" totalmente independiente en el futuro. *Justificación arquitectónica: Evitar el "Feature Bloat" en la v1.2 y focalizarse 100% en el scaffolding y sistema de archivos locales primero.*

*Estado: Fase de Ideación. Pendiente de diseño de arquitectura técnica (Node.js).*
