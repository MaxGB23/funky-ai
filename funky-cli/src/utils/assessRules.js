export function evaluateAssessment(metadata) {
  const challenges = [];

  const budget = parseFloat(metadata.budget);
  const rps = parseInt(metadata.rps, 10);
  const sla = parseFloat(metadata.sla);
  const redundancy = (metadata.redundancy || '').toLowerCase();
  const dbTech = (metadata.db_tech || '').toLowerCase();
  const infraTech = (metadata.infra_tech || '').toLowerCase();

  // 1. Budget vs Infra (Overengineering)
  if (budget < 50 && (infraTech.includes('k8s') || infraTech.includes('kubernetes'))) {
    challenges.push(
      "**Budget vs Infra (Overengineering)**: El presupuesto mensual es menor a $50 USD pero se eligió K8s/Kubernetes. Justificá cómo planean costear y mantener un clúster con ese presupuesto."
    );
  }

  // 2. RPS vs DB (Cuello de Botella)
  const isSQLite = dbTech.includes('sqlite');
  const mentionsSharding = dbTech.includes('sharding') || dbTech.includes('replica') || dbTech.includes('réplica');
  if (rps > 1000 && isSQLite && !mentionsSharding) {
    challenges.push(
      "**RPS vs DB (Cuello de Botella)**: Los RPS esperados (>1000) son muy altos para SQLite sin una estrategia explícita de sharding o réplicas de lectura. Posibles lockeos en la base de datos."
    );
  }

  // 3. SLA vs Redundancia (Underengineering)
  if (sla >= 99.9 && redundancy === 'single node') {
    challenges.push(
      "**SLA vs Redundancia (Underengineering)**: El SLA esperado es >= 99.9% pero la redundancia es 'Single Node'. Cualquier downtime o deploy invalida este SLA."
    );
  }

  return challenges;
}
