# Proposal: 015 Protocolos On-Demand

## 1. Resumen
Esta propuesta resuelve el problema de "Context Dilution" creando protocolos hiperespecializados bajo demanda. Implementaremos una arquitectura donde los protocolos viven en `.agents/protocols/` de forma local. Además, se construirá un mecanismo en el CLI para distribuir protocolos estándar y permitir al humano importarlos interactivamente (a-la-carte), garantizando portabilidad sin inflar el proyecto.

## 2. Motivación
- **Portabilidad y Aislamiento:** Evitar Workflows globales del IDE.
- **Descubrimiento (Discoverability):** Un `index.md` permite al Orquestador saber qué protocolos existen en el proyecto sin tener que leer todos los archivos, habilitando recomendaciones proactivas.
- **Opt-in Explícito (CLI):** Un repositorio no necesita todos los protocolos del framework. Un selector interactivo en el CLI asegura que solo instalamos lo que vamos a usar.

## 3. Alcance (Scope)
**In-Scope:**
- Creación de `.agents/protocols/` y su `index.md` local.
- Creación de protocolo PoC: `devil-advocate.md`.
- Modificación de templates `tasks.md`.
- Separación de directorios en el CLI (`funky-cli/src/templates/protocols/`).
- Integración de selector interactivo en el CLI (Inquirer) para la inyección selectiva.

**Out-of-Scope:**
- Creación masiva de otros protocolos (se harán en issues separados).
