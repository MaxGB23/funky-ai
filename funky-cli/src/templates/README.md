# 🚀 {{project_name}}

Bienvenido a la matriz documental de **{{project_name}}**. Este proyecto utiliza el protocolo **Funky AI** (Spec-Driven Development asíncrono) para la colaboración entre humanos y agentes LLM.

## 🧭 Mapa de Navegación

### 1. Estado del Proyecto
*La fuente de verdad del estado actual y la memoria a corto plazo.*
- **[ORCHESTRATOR-STATE.md](./ORCHESTRATOR-STATE.md)**: El punto de entrada obligatorio para iniciar cualquier sesión.
- **[PROJECT-CANVAS.md](./PROJECT-CANVAS.md)**: Definiciones de arquitectura, stack y testing.
- **[INFRA-CANVAS.md](./INFRA-CANVAS.md)**: (Si aplica) Definiciones de infraestructura y despliegue.

### 2. Memoria Persistente (Engram)
*El cerebro del proyecto. Decisiones, bugs y lecciones.*
- **[`docs/engram/`](./docs/engram/)**: Base de datos de conocimientos estructurada.

### 3. Fases SDD Activas
*El trabajo en curso.*
- **[`docs/openspec/changes/`](./docs/openspec/changes/)**: Carpeta de propuestas, tareas y reportes de agentes.

## 🛠️ Flujo de Trabajo (Funky AI)
Para trabajar en este proyecto:
1. Lee `ORCHESTRATOR-STATE.md`.
2. Para proponer un cambio: `funky phase explore` o `funky phase proposal`.
3. Para ejecutar: Define tareas en `tasks.md` y delega a workers con `worker-handoff.md`.
4. Documenta aprendizajes en `docs/engram/` antes de cerrar la sesión.
