import { describe, it, expect } from 'vitest';
import { evaluateAssessment } from '../src/utils/assessRules.js';

describe('evaluateAssessment', () => {
  it('should return empty array when no rules are violated', () => {
    const metadata = {
      budget: '100',
      rps: '500',
      sla: '99.9',
      redundancy: 'Multi-AZ',
      db_tech: 'PostgreSQL',
      infra_tech: 'VPS'
    };
    const result = evaluateAssessment(metadata);
    expect(result).toHaveLength(0);
  });

  it('should trigger rule 1 (Overengineering) when budget < 50 and infra is K8s', () => {
    const metadata = {
      budget: '40',
      rps: '50',
      sla: '99.0',
      redundancy: 'Single Node',
      db_tech: 'SQLite',
      infra_tech: 'K8s cluster'
    };
    const result = evaluateAssessment(metadata);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('Budget vs Infra (Overengineering)');
  });

  it('should trigger rule 2 (Cuello de Botella) when rps > 1000 and db is SQLite without sharding', () => {
    const metadata = {
      budget: '100',
      rps: '2000',
      sla: '99.0',
      redundancy: 'Single Node',
      db_tech: 'SQLite',
      infra_tech: 'VPS'
    };
    const result = evaluateAssessment(metadata);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('RPS vs DB (Cuello de Botella)');
  });

  it('should NOT trigger rule 2 if SQLite uses sharding/replicas', () => {
    const metadata = {
      budget: '100',
      rps: '2000',
      sla: '99.0',
      redundancy: 'Single Node',
      db_tech: 'SQLite with sharding',
      infra_tech: 'VPS'
    };
    const result = evaluateAssessment(metadata);
    expect(result).toHaveLength(0);
  });

  it('should trigger rule 3 (Underengineering) when sla >= 99.9 and redundancy is Single Node', () => {
    const metadata = {
      budget: '100',
      rps: '500',
      sla: '99.9',
      redundancy: 'Single Node',
      db_tech: 'PostgreSQL',
      infra_tech: 'VPS'
    };
    const result = evaluateAssessment(metadata);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('SLA vs Redundancia (Underengineering)');
  });

  it('should trigger multiple rules if multiple violations exist', () => {
    const metadata = {
      budget: '30',
      rps: '1500',
      sla: '99.99',
      redundancy: 'Single Node',
      db_tech: 'SQLite',
      infra_tech: 'kubernetes'
    };
    const result = evaluateAssessment(metadata);
    expect(result).toHaveLength(3);
  });
});
