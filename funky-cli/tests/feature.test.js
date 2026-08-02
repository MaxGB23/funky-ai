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

    it('T1 never includes release-checklist.md', () => {
      const files = resolveFiles({ tier: 'T1', docsImpact: false });
      expect(files).not.toContain('release-checklist.md');
    });

    // T2: tasks.md + report.md + explore/proposal/spec + release-checklist.md (always) + [docs].
    it('T2 / No → 6 files (base + tier + release)', () => {
      const files = resolveFiles({ tier: 'T2', docsImpact: false });
      expect(files).toEqual([
        'tasks.md', 'report.md', 'explore.md', 'proposal.md', 'spec.md',
        'release-checklist.md',
      ]);
    });

    it('T2 / Sí → 7 files (+ docs)', () => {
      const files = resolveFiles({ tier: 'T2', docsImpact: true });
      expect(files).toEqual([
        'tasks.md', 'report.md', 'explore.md', 'proposal.md', 'spec.md',
        'docs.md', 'release-checklist.md',
      ]);
    });

    it('T2 always injects release-checklist.md', () => {
      const files = resolveFiles({ tier: 'T2', docsImpact: false });
      expect(files).toContain('release-checklist.md');
    });

    // T3: tasks.md + release-checklist.md (always) + [docs]. No report.md.
    it('T3 / No → 2 files (tasks.md + release-checklist.md)', () => {
      const files = resolveFiles({ tier: 'T3', docsImpact: false });
      expect(files).toEqual(['tasks.md', 'release-checklist.md']);
    });

    it('T3 / Sí → 3 files (tasks.md + docs.md + release-checklist.md)', () => {
      const files = resolveFiles({ tier: 'T3', docsImpact: true });
      expect(files).toEqual(['tasks.md', 'docs.md', 'release-checklist.md']);
    });

    it('T3 always injects release-checklist.md', () => {
      const files = resolveFiles({ tier: 'T3', docsImpact: false });
      expect(files).toContain('release-checklist.md');
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

      const result = runFeature({ featureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd, hasGoldenTemplates: true });

      expect(result.success).toBe(true);
      expect(result.path).toBe(expectedFeaturePath);
      expect(result.copiedFiles).toHaveLength(9);
      expect(result.intentions).toContainEqual({ action: 'mkdir', dest: expectedFeaturePath });
      expect(result.intentions).toHaveLength(10); // 1 mkdir + 9 copy
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('uses fallback templates when golden templates do not exist', () => {
      const featureName = 'auth-login';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', featureName);

      const result = runFeature({ featureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd, hasGoldenTemplates: false });

      expect(result.success).toBe(true);
      expect(result.usedFallback).toBe(true);
      expect(result.copiedFiles).toHaveLength(9);
      expect(result.intentions).toHaveLength(10);
    });
  });

  describe('with injectionParams', () => {
    it('T2 / Sí → copies 7 files from golden', () => {
      const featureName = 'auth-login';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', featureName);

      const result = runFeature({
        featureName,
        cliTemplatesDir: fakeCliTemplatesDir,
        cwd: fakeCwd,
        injectionParams: { tier: 'T2', docsImpact: true },
        hasGoldenTemplates: true
      });

      expect(result.success).toBe(true);
      expect(result.copiedFiles).toHaveLength(7);
      expect(result.copiedFiles).toContain('docs.md');
      expect(result.copiedFiles).toContain('release-checklist.md');
      expect(result.copiedFiles).toContain('explore.md');
      expect(result.copiedFiles).toContain('proposal.md');
      expect(result.copiedFiles).toContain('spec.md');
      expect(result.copiedFiles).not.toContain('apply.md');
      expect(result.copiedFiles).not.toContain('verify.md');
      expect(result.copiedFiles).not.toContain('planning-handoff.md');
      expect(result.intentions.length).toBe(8);
    });

    it('T1 / No → copies 2 base files only', () => {
      const featureName = 'tweak-fix';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', featureName);

      const result = runFeature({
        featureName,
        cliTemplatesDir: fakeCliTemplatesDir,
        cwd: fakeCwd,
        injectionParams: { tier: 'T1', docsImpact: false },
        hasGoldenTemplates: true
      });

      expect(result.success).toBe(true);
      expect(result.copiedFiles).toHaveLength(2);
      expect(result.copiedFiles).toEqual(['tasks.md', 'report.md']);
      expect(result.intentions.length).toBe(3);
    });

    it('T3 / No → copies tasks.md + release-checklist.md (release always injected)', () => {
      const featureName = 'deep-feature';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', featureName);

      const result = runFeature({
        featureName,
        cliTemplatesDir: fakeCliTemplatesDir,
        cwd: fakeCwd,
        injectionParams: { tier: 'T3', docsImpact: false },
        hasGoldenTemplates: true
      });

      expect(result.success).toBe(true);
      expect(result.copiedFiles).toHaveLength(2);
      expect(result.copiedFiles).toContain('tasks.md');
      expect(result.copiedFiles).toContain('release-checklist.md');
      expect(result.copiedFiles).not.toContain('report.md');
    });
  });

  describe('existing guards (unchanged)', () => {
    it('sanitizes the feature name correctly', () => {
      const rawFeatureName = '  Auth Login API  ';
      const expectedSanitized = 'auth-login-api';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', expectedSanitized);

      const result = runFeature({ featureName: rawFeatureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd, hasGoldenTemplates: true });

      expect(result.success).toBe(true);
      expect(result.path).toBe(expectedFeaturePath);
      expect(result.intentions).toContainEqual({ action: 'mkdir', dest: expectedFeaturePath });
    });

    it('fails if the feature directory already exists', () => {
      const featureName = 'auth-login';
      const expectedFeaturePath = path.join(fakeCwd, 'openspec', 'changes', featureName);

      const result = runFeature({ featureName, cliTemplatesDir: fakeCliTemplatesDir, cwd: fakeCwd, hasGoldenTemplates: true, featureExists: true });

      expect(result.success).toBe(false);
      expect(result.error).toMatch(/ya existe/i);
      expect(result.intentions).toBeUndefined();
    });
  });
});
