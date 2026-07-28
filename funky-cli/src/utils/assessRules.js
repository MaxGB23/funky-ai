export function generateGuideQuestions(canvasData) {
  const { projectCanvas = '', infraCanvas = '' } = canvasData || {};
  const combined = (projectCanvas + ' ' + infraCanvas).toLowerCase();
  const dynamic = [];

  // Pattern: K8s/Kubernetes
  if (/k8s|kubernetes/i.test(infraCanvas)) {
    dynamic.push({
      category: 'K8s',
      question: 'Elegiste Kubernetes. ¿Ya evaluaron los costos operativos de un clúster? En proyectos pequeños puede ser más caro que usar un PaaS.'
    });
  }

  // Pattern: SQLite
  if (/sqlite/i.test(infraCanvas)) {
    dynamic.push({
      category: 'SQLite',
      question: 'SQLite es liviano pero tiene límites de concurrencia. Si el proyecto escala, ¿tienen pensado migrar a PostgreSQL u otro motor?'
    });
  }

  // Pattern: Single Node
  if (/single\s*nodo?|single\s*node/i.test(infraCanvas)) {
    dynamic.push({
      category: 'SingleNode',
      question: 'Con un solo nodo, cualquier deploy o fallo de hardware causa downtime. ¿Tienen ventanas de mantenimiento o toleran cierto downtime?'
    });
  }

  // Pattern: Junior + Complex Infra
  if (/junior/i.test(combined) && /k8s|kubernetes/i.test(infraCanvas)) {
    dynamic.push({
      category: 'Junior',
      question: 'El equipo es principalmente Junior y eligieron una infraestructura compleja. ¿Tienen DevOps dedicado o planean usar un PaaS que abstraiga la complejidad?'
    });
  }

  return { dynamic };
}
