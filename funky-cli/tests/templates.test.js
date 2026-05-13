import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Templates Validation', () => {
  it('tasks.md should contain FASE 0 — Branch Setup [T1]', () => {
    const tasksPath = path.join(__dirname, '../src/templates/sdd/tasks.md');
    const content = fs.readFileSync(tasksPath, 'utf8');
    expect(content).toContain('FASE 0 — Branch Setup [T1]');
  });

  it('gentle templates should exist', () => {
    const gentleFiles = ['01-explore.md', '02-proposal.md', '03-spec.md', '04-design.md', '05-tasks.md', '06-implement.md', '07-verify.md'];
    for (const file of gentleFiles) {
      const p = path.join(__dirname, '../src/templates/gentle', file);
      expect(fs.existsSync(p)).toBe(true);
    }
  });
});
