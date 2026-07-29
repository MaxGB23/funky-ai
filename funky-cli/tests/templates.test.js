import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Templates Validation', () => {
  it('release.md should satisfy the machine contract <MANDATORY_RELEASE_PROTOCOL>', () => {
    const releasePath = path.join(__dirname, '../src/templates/sdd/release.md');
    if (fs.existsSync(releasePath)) {
      const content = fs.readFileSync(releasePath, 'utf8');
      expect(content).toMatch(/<MANDATORY_RELEASE_PROTOCOL>/);
    }
  });

});
