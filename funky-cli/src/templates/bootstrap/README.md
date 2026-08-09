# 🚀 {{project_name}}

Bienvenido a la matriz documental de **{{project_name}}**. Este proyecto coordina la colaboración humano + agentes LLM con **Spec-Driven Development (SDD)** sobre especificaciones abiertas (OpenSpec).

## 🧭 Punto de Entrada

- **[ORCHESTRATOR-STATE.md](./ORCHESTRATOR-STATE.md)**: Estado del proyecto, tareas y contexto de recuperación de sesión. **Leer primero** al iniciar cualquier sesión.

## 📚 Estructura Documental

- **[`docs/`](./docs/)**: Documentación del proyecto (arquitectura, decisiones, guías).
- **[`openspec/`](./openspec/)**: Especificaciones y cambios del ciclo SDD (OpenSpec).
- **[`.agents/`](./.agents/)**: Reglas y templates de los agentes del ecosistema.

## 🔄 Ciclo de Trabajo SDD

El trabajo se planifica y ejecuta vía **cambios** en [`openspec/changes/`](./openspec/changes/): cada cambio declara intención, especificación, tareas y reporte siguiendo los templates del ecosistema. Los **RFCs** del proyecto viven en [`openspec/rfcs/`](./openspec/rfcs/).
