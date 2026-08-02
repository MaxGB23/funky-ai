import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Templates Validation', () => {
  it('release-checklist.md should satisfy the machine contract <MANDATORY_RELEASE_PROTOCOL>', () => {
    const releasePath = path.join(__dirname, '../src/templates/bootstrap/sdd/release-checklist.md');
    const content = fs.readFileSync(releasePath, 'utf8');
    expect(content).toMatch(/<MANDATORY_RELEASE_PROTOCOL>/);
  });

  it('release-notes.md should exist in the base bootstrap/sdd templates', () => {
    const releaseNotesPath = path.join(__dirname, '../src/templates/bootstrap/sdd/release-notes.md');
    const content = fs.readFileSync(releaseNotesPath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
  });
});
