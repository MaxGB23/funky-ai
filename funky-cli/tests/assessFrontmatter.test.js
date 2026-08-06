import { describe, it, expect } from 'vitest';

import { parseFrontmatter } from '../src/commands/assess.js';

describe('assess Command - parseFrontmatter', () => {
  it('should extract correct values including new NFRs', () => {
    const content = `---
budget: 50
rps: 1000
sla: 99.99
redundancy: "Multi-AZ"
db_tech: "PostgreSQL"
infra_tech: "AWS"
compliance: "GDPR"
team_seniority: "Senior"
---

# Architecture Assessment
`;
    const metadata = parseFrontmatter(content);
    expect(metadata.budget).toBe('50');
    expect(metadata.rps).toBe('1000');
    expect(metadata.sla).toBe('99.99');
    expect(metadata.redundancy).toBe('Multi-AZ');
    expect(metadata.db_tech).toBe('PostgreSQL');
    expect(metadata.infra_tech).toBe('AWS');
    expect(metadata.compliance).toBe('GDPR');
    expect(metadata.team_seniority).toBe('Senior');
  });

  it('should handle missing fields gracefully', () => {
    const content = `---
budget: 50
---
`;
    const metadata = parseFrontmatter(content);
    expect(metadata.budget).toBe('50');
    expect(metadata.compliance).toBeUndefined();
  });
});
