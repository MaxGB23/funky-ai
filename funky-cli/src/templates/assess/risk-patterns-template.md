# Patrones de Riesgo de Referencia

> Documento VIVO y editable por el equipo. Agrega, modifica o elimina patrones según tu contexto.
> No es un checklist obligatorio: la IA evalúa en la Fase 4 de la guía cuáles patrones aplican al proyecto concreto, leyendo los canvases. El análisis real lo hace la IA, no este archivo.

## K8s / Kubernetes

- **Señal a buscar en los canvases:** el INFRA-CANVAS menciona K8s, Kubernetes o un clúster gestionado.
- **Por qué importa:** un clúster tiene costos operativos y de mantenimiento que pueden superar a un PaaS en proyectos pequeños.
- **Riesgo a considerar:** ¿Ya evaluaron los costos operativos del clúster? ¿El tamaño del proyecto y la experiencia del equipo justifican la complejidad?

## SQLite

- **Señal a buscar en los canvases:** el INFRA-CANVAS elige SQLite como base de datos principal.
- **Por qué importa:** SQLite es liviano pero tiene límites de concurrencia en escrituras y conexiones.
- **Riesgo a considerar:** ¿La concurrencia esperada cabe dentro de esos límites? ¿Hay un plan de migración a PostgreSQL u otro motor si el proyecto escala?

## Single Node

- **Señal a buscar en los canvases:** el INFRA-CANVAS describe un solo nodo o un único servidor.
- **Por qué importa:** con un solo nodo, cualquier deploy o fallo de hardware causa downtime.
- **Riesgo a considerar:** ¿Tienen ventanas de mantenimiento o toleran cierto downtime? ¿Hay respaldos y una estrategia de recuperación?

## Junior + Infraestructura Compleja

- **Señal a buscar en los canvases:** el PROJECT-CANVAS describe un equipo principalmente junior y el INFRA-CANVAS elige infraestructura compleja (K8s, microservicios, multi-cluster, etc.).
- **Por qué importa:** la complejidad operativa exige experiencia; un equipo junior sin soporte puede verse superado.
- **Riesgo a considerar:** ¿Hay DevOps dedicado o planean usar un PaaS que abstraiga la complejidad?
