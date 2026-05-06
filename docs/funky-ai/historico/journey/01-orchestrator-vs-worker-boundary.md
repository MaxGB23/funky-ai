# Journey #01: La Línea Divisoria entre Orquestar y Ejecutar

**Fecha:** Abril 2026  
**Etapa de Madurez:** Transición de Developer a Arquitecto (Funky AI v1.1)

---
### 🧩 Engram Meta-Data (MCP Format)
**What:** Formalizamos que escribir Especificaciones y Conceptos Base (`.md`) es labor del Orquestador. Escribir código de negocio (`.js`, `.go`) es labor del Worker.
**Why:** Para resolver la duda de si el Orquestador violaba su restricción de "No Ejecutar" al crear archivos en disco. Resulta que trazar arquitectura en texto es su función natural.
**Where:** Frontera conceptual entre Tiers (Humano Router vs Orquestador vs Worker) y el ecosistema `docs/`.
**Learned:** Funky AI funciona como un Sistema de Actores. Aislar al Worker pasándole planos estructurales en disco (en vez de filosofar en su chat) es la clave definitiva para la escalabilidad.
---

## 🧠 La Epifanía
Durante la estructuración de los conceptos base de Funky AI (Específicamente al separar `Rules` de `Skills`), surgió una contradicción aparente: le ordené al Orquestador (el agente conversacional principal) que creara y escribiera un archivo `.md` directo en el disco. 

Mi mente de programador encendió una alarma: *"Nuestra regla global de Funky AI dice que el Orquestador planifica (Mode 1) y el Worker ejecuta (Mode 2) picando código. ¿Acaso no acabo de hacer que el Orquestador rompa su abstracción al pedirle que redacte un archivo?"*

## 🏛️ La Resolución Arquitectónica (The Funky Way)
La madurez llegó al entender la diferencia semántica entre "Escribir Especificaciones" y "Picar Código de Dominio".

1. **El Terreno del Orquestador (El Arquitecto):** 
   Escribir documentos teóricos, conceptos core, ADRs (Decisiones de Arquitectura) y propuestas de diseño (`propuestas/`, `core-concepts/`) **es la definición misma de Orquestar**. El Orquestador ES dueño del Falso Engram teórico. Es su trabajo bajar las ideas abstractas a discos para generar los planos. Pedirle a un Orquestador que documente la teoría es el uso más congruente de un Tier 1.

2. **El Terreno del Worker (El Albañil):**
   El límite sagrado se cruza cuando tocamos código ejecutable (`.js`, `.go`, `.ts`) o lógica de negocio. Si le pido al Orquestador que cree el archivo `funky-cli/index.js`, ahí sí estoy violando el framework. Eso le corresponde estrictamente a un Worker de Tier 2/Tier 3 al que se le asigan tareas cerradas y ejecutables.

## 🚀 Crecimiento Profesional
Este fue el insight donde mi interacción con IA pasó de un "chateo improvisado" a un Sistema de Actores estructurado. Entendí que un Arquitecto no ensucia a sus albañiles con debates teóricos sobre guardarraíles, sino que prepara los planos técnicos en crudo para que el ecosistema fluya de forma determinista y predecible.
