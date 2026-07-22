import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

vi.mock('fs');

import fs from 'fs';
import { runFeature, resolveFiles } from '../src/commands/feature.js';

// --- resolveFiles() pure function tests ---

describe('resolveFiles()', () => {
  describe('backward compat (no injectionParams)', () => {
    it('returns the legacy 9-file list when undefined', () => {
      const files = resolveFiles(undefined);
      expect(files).toEqual([
        'explore.md', 'proposal.md', 'design.md', 'spec.md', 'tasks.md',
        'planning-handoff.md', 'report.md', 'apply.md', 'verify.md',
      ]);
    });

    it('returns the legacy 9-file list when null', () => {
      const files = resolveFiles(null);
      expect(files).toHaveLength(9);
    });
  });

  describe('conditional injection matrix', () => {
    // T1: tasks.md + report.md only. No docs, no release.
    it('T1 → 2 files (tasks.md + report.md)', () => {
      const files = resolveFiles({ tier: 'T1', docsImpact: false });
      expect(files).toEqual(['tasks.md', 'report.md']);
    });

    it('T1 ignores docsImpact (docs never injected)', () => {
      const files = resolveFiles({ tier: 'T1', docsImpact: true });
      expect(files).toEqual(['tasks.md', 'report.md']);
      expect(files).not.toContain('docs.md');
    });

    it('T1 never includes release.md', () => {
      const files = resolveFiles({ tier: 'T1', docsImpact: false });
      expect(files).not.toContain('release.md');
    });

    // T2: tasks.md + report.md + explore/proposal/spec + release.md (always) + [docs].
    it('T2 / No → 6 files (base + tier + release)', () => {
      const files = resolveFiles({ tier: 'T2', docsImpact: false });
      expect(files).toEqual([
        'tasks.md', 'report.md', 'explore.md', 'proposal.md', 'spec.md',
        'release.md',
      ]);
    });

    it('T2 / Sí → 7 files (+ docs)', () => {
      const files = resolveFiles({ tier: 'T2', docsImpact: true });
      expect(files).toEqual([
        'tasks.md', 'report.md', 'explore.md', 'proposal.md', 'spec.md',
        'docs.md', 'release.md',
      ]);
    });

    it('T2 always injects release.md', () => {
      const files = resolveFiles({ tier: 'T2', docsImpact: false });
      expect(files).toContain('release.md');
    });

    // T3: tasks.md + release.md (always) + [docs]. No report.md.
    it('T3 / No → 2 files (tasks.md + release.md)', () => {
      const files = resolveFiles({ tier: 'T3', docsImpact: false });
      expect(files).toEqual(['tasks.md', 'release.md']);
    });

    it('T3 / Sí → 3 files (tasks.md + docs.md + release.md)', () => {
      const files = resolveFiles({ tier: 'T3', docsImpact: true });
      expect(files).toEqual(['tasks.md', 'docs.md', 'release.md']);
    });

    it('T3 always injects release.md', () => {
      const files = resolveFiles({ tier: 'T3', docsImpact: false });
      expect(files).toContain('release.md');
    });

    it('T3 never includes report.md', () => {
      const files = resolveFiles({ tier: 'T3', docsImpact: true });
      expect(files).not.toContain('report.md');
    });

    // Cross-tier guards
    it('never includes design.md (created by sdd-design phase)', () => {
      for (const tier of ['T1', 'T2', 'T3']) {
        const files = resolveFiles({ tier, docsImpact: true });
        expect(files).not.toContain('design.md');
      }
    });

    it('never includes legacy files (apply.md, verify.md, planning-handoff.md)', () => {
      const legacy = ['apply.md', 'verify.md', 'planning-handoff.md'];
      for (const tier of ['T1', 'T2', 'T3']) {
        const files = resolveFiles({ tier, docsImpact: true });
        for (const l of legacy) {
          expect(files).not.toContain(l);
        }
      }
    });
  });
});

// --- runFeature() integration tests ---

describe('runFeature()', () => {
  const fakeCliTemplatesDir = path.join('C:', 'fake', 'cli', 'templates', 'sdd');
  const fakeCwd = path.join('C:', 'fake', 'project');
  const goldenTemplatesDir = path.join(fakeCwd, '.agents', 'templates', 'sdd');

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('backward compat (no injectionParams)', () => {
    it('copies 9 legacy files from golden templates', () => {
      const featureName = 'auth-login';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', featureName);

      fs.existsSync.mockImplementation((p) => {
        if (p === goldenTemplatesDir) return true;
        if (p === expectedFeaturePath) return false;
        if (typeof p === 'string' && p.startsWith(goldenTemplatesDir)) return true;
        return false;
      });
      fs.mkdirSync.mockImplementation(() => {});
      fs.copyFileSync.mockImplementation(() => {});

      const result = runFeature({ featureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd });

      expect(result.success).toBe(true);
      expect(result.path).toBe(expectedFeaturePath);
      expect(fs.mkdirSync).toHaveBeenCalledWith(expectedFeaturePath, { recursive: true });
      expect(fs.copyFileSync).toHaveBeenCalledTimes(9);
      expect(result.copiedFiles).toHaveLength(9);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('uses fallback templates when golden templates do not exist', () => {
      const featureName = 'auth-login';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', featureName);

      fs.existsSync.mockImplementation((p) => {
        if (p === goldenTemplatesDir) return false;
        if (p === expectedFeaturePath) return false;
        if (typeof p === 'string' && p.startsWith(fakeCliTemplatesDir)) return true;
        return false;
      });
      fs.mkdirSync.mockImplementation(() => {});
      fs.copyFileSync.mockImplementation(() => {});

      const result = runFeature({ featureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd });

      expect(result.success).toBe(true);
      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Usando fallback de CLI'));
      expect(fs.copyFileSync).toHaveBeenCalledTimes(9);
    });
  });

  describe('with injectionParams', () => {
    it('T2 / Sí → copies 7 files from golden', () => {
      const featureName = 'auth-login';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', featureName);

      fs.existsSync.mockImplementation((p) => {
        if (p === goldenTemplatesDir) return true;
        if (p === expectedFeaturePath) return false;
        if (typeof p === 'string' && p.startsWith(goldenTemplatesDir)) return true;
        return false;
      });
      fs.mkdirSync.mockImplementation(() => {});
      fs.copyFileSync.mockImplementation(() => {});

      const result = runFeature({
        featureName,
        cliTemplatesDir: fakeCliTemplatesDir,
        cwd: fakeCwd,
        injectionParams: { tier: 'T2', docsImpact: true },
      });

      expect(result.success).toBe(true);
      expect(result.copiedFiles).toHaveLength(7);
      expect(result.copiedFiles).toContain('docs.md');
      expect(result.copiedFiles).toContain('release.md');
      expect(result.copiedFiles).toContain('explore.md');
      expect(result.copiedFiles).toContain('proposal.md');
      expect(result.copiedFiles).toContain('spec.md');
      expect(result.copiedFiles).not.toContain('apply.md');
      expect(result.copiedFiles).not.toContain('verify.md');
      expect(result.copiedFiles).not.toContain('planning-handoff.md');
    });

    it('T1 / No → copies 2 base files only', () => {
      const featureName = 'tweak-fix';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', featureName);

      fs.existsSync.mockImplementation((p) => {
        if (p === goldenTemplatesDir) return true;
        if (p === expectedFeaturePath) return false;
        if (typeof p === 'string' && p.startsWith(goldenTemplatesDir)) return true;
        return false;
      });
      fs.mkdirSync.mockImplementation(() => {});
      fs.copyFileSync.mockImplementation(() => {});

      const result = runFeature({
        featureName,
        cliTemplatesDir: fakeCliTemplatesDir,
        cwd: fakeCwd,
        injectionParams: { tier: 'T1', docsImpact: false },
      });

      expect(result.success).toBe(true);
      expect(result.copiedFiles).toHaveLength(2);
      expect(result.copiedFiles).toEqual(['tasks.md', 'report.md']);
    });

    it('T3 / No → copies tasks.md + release.md (release always injected)', () => {
      const featureName = 'deep-feature';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', featureName);

      fs.existsSync.mockImplementation((p) => {
        if (p === goldenTemplatesDir) return true;
        if (p === expectedFeaturePath) return false;
        if (typeof p === 'string' && p.startsWith(goldenTemplatesDir)) return true;
        return false;
      });
      fs.mkdirSync.mockImplementation(() => {});
      fs.copyFileSync.mockImplementation(() => {});

      const result = runFeature({
        featureName,
        cliTemplatesDir: fakeCliTemplatesDir,
        cwd: fakeCwd,
        injectionParams: { tier: 'T3', docsImpact: false },
      });

      expect(result.success).toBe(true);
      expect(result.copiedFiles).toHaveLength(2);
      expect(result.copiedFiles).toContain('tasks.md');
      expect(result.copiedFiles).toContain('release.md');
      expect(result.copiedFiles).not.toContain('report.md');
    });
  });

  describe('existing guards (unchanged)', () => {
    it('sanitizes the feature name correctly', () => {
      const rawFeatureName = '  Auth Login API  ';
      const expectedSanitized = 'auth-login-api';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', expectedSanitized);

      fs.existsSync.mockImplementation((p) => {
        if (p === goldenTemplatesDir) return true;
        if (p === expectedFeaturePath) return false;
        return false;
      });

      const result = runFeature({ featureName: rawFeatureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd });

      expect(result.success).toBe(true);
      expect(result.path).toBe(expectedFeaturePath);
      expect(fs.mkdirSync).toHaveBeenCalledWith(expectedFeaturePath, { recursive: true });
    });

    it('fails if the feature directory already exists', () => {
      const featureName = 'auth-login';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', featureName);

      fs.existsSync.mockImplementation((p) => {
        if (p === goldenTemplatesDir) return true;
        if (p === expectedFeaturePath) return true;
        return false;
      });

      const result = runFeature({ featureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/ya existe/i);
      expect(fs.mkdirSync).not.toHaveBeenCalled();
      expect(fs.copyFileSync).not.toHaveBeenCalled();
    });
  });
});
