# Explore: v2.0.1 Context Fix

## Contexto del Problema
La Arquitectura v2.0.0 introdujo una división en tres capas, moviendo la lógica del Orquestador a un Workflow On-Demand (Capa 3: `/funky-orchestrator`) para reducir tokens.
Sin embargo, el uso en el mundo real demostró una falla crítica: **Context Fading por Asimetría Operativa**.
Las sesiones de planificación del Orquestador son largas (múltiples iteraciones de SDD). Al inyectar el rol como un comando (mensaje de usuario), la regla sufre degradación por *Positional Bias*, provocando que el LLM olvide sus checklists y asuma un rol genérico.

Adicionalmente, se descubrió una regresión (Doc Rot) grave: la Feature 012 (Auto-Tiering) se perdió en los templates del CLI (`funky-cli/src/templates/bootstrap/agents-rules-sdd-orchestrator.md`), causando que los nuevos repositorios nazcan con un Orquestador "lobotomizado" incapaz de realizar el Razonamiento Pre-Vuelo (Paso 0).

## Viability
Solucionar esto requiere revertir la inyección del Orquestador hacia la Capa 2 (Workspace Rules) para aprovechar el caché estático del IDE en el `System Prompt`, mientras se preserva el flujo de ejecución efímera del Worker en la Capa 3. Es altamente viable y de prioridad crítica.
