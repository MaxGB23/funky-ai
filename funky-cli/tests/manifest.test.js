import { describe, it, expect } from 'vitest';

import sddReleaseManifest from '../src/skills/sdd-release/manifest.js';
import sddDocsSyncManifest from '../src/skills/sdd-docs-sync/manifest.js';

describe('manifests de skills (R-SK-8: manifest = única fuente de recursos)', () => {
  it('sdd-release: SKILL.md + release-notes.md opcional desde bootstrap/sdd/ compartido', () => {
    expect(sddReleaseManifest).toEqual([
      { src: 'skills/sdd-release/SKILL.md', dest: '.agents/skills/sdd-release/SKILL.md' },
      {
        src: 'templates/bootstrap/sdd/release-notes.md',
        dest: '.agents/templates/sdd/release-notes.md',
        optional: true,
      },
    ]);
  });

  it('sdd-docs-sync: SKILL.md + docs compartidos desde bootstrap/sdd/ (paridad R-SK-5)', () => {
    expect(sddDocsSyncManifest).toEqual([
      { src: 'skills/sdd-docs-sync/SKILL.md', dest: '.agents/skills/sdd-docs-sync/SKILL.md' },
      { src: 'templates/bootstrap/sdd/docs-live-index.md', dest: '.agents/templates/sdd/docs-live-index.md' },
      { src: 'templates/bootstrap/sdd/docs-index/template.md', dest: '.agents/templates/sdd/docs-index/template.md' },
    ]);
  });
});
