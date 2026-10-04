import { describe, it, expect } from 'vitest';

import releaseManifest from '../src/skills/release/manifest.js';
import docsSyncManifest from '../src/skills/docs-sync/manifest.js';

describe('manifests de skills (R-SK-8: manifest = única fuente de recursos)', () => {
  it('release: SKILL.md + release-notes.md opcional desde bootstrap/sdd/ compartido', () => {
    expect(releaseManifest).toEqual([
      { src: 'skills/release/SKILL.md', dest: '.agents/skills/release/SKILL.md' },
      {
        src: 'templates/bootstrap/sdd/release-notes.md',
        dest: '.agents/templates/sdd/release-notes.md',
        optional: true,
      },
    ]);
  });

  it('docs-sync: SKILL.md + docs compartidos desde bootstrap/sdd/ (paridad R-SK-5)', () => {
    expect(docsSyncManifest).toEqual([
      { src: 'skills/docs-sync/SKILL.md', dest: '.agents/skills/docs-sync/SKILL.md' },
      { src: 'templates/bootstrap/sdd/docs-live-index.md', dest: '.agents/templates/sdd/docs-live-index.md' },
      { src: 'templates/bootstrap/sdd/docs-index/_indice-seccional-template.md', dest: '.agents/templates/sdd/docs-index/_indice-seccional-template.md' },
    ]);
  });
});
