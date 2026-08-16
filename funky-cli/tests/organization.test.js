import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Legacy debt: files grandfathered under the current conventions.
// Each entry must still violate its rule; migrate the file and remove it here.
// Removing the file entirely also requires removing its entry.
// The map may be empty once all legacy debt is migrated.
const LEGACY_EXCEPTIONS = {};

// Anti-brittle debt (testing-modernization): remaining fragile copy assertions
// per test file. A fragile assertion is toContain/toMatch/.includes with a
// quoted string literal (full-copy or console-copy); structural assertions
// (markers, tokens, paths, flags, regex args) never count. Entries are removed
// as each file migrates to snapshots/semantic-token validation. The map total
// MUST reach ZERO at the change end: once all entries are removed, the
// "files without entries have zero fragile assertions" test forces every file
// to zero. Initial values calibrated against the committed counter regex.
const FRAGILE_DEBT = {
  'estimateDomain.test.js': 17,
  'scaffold.test.js': 10,
  'engram.test.js': 7,
  'engram.integration.test.js': 5,
  'sdd.test.js': 3,
  'scaffold.integration.test.js': 2,
  'context.test.js': 1,
  'secureRunner.test.js': 1,
  'skills.integration.test.js': 1,
  'skills.test.js': 1,
};

// Convention: one unit under test per file, named {unit}.test.js. Integration
// goes in {cmd}.integration.test.js; interactive command harnesses (real prompt
// I/O) go in {cmd}.interactive.test.js — both count as command-level files with
// the 800-line cap and no single-command-import restriction. Shared fs mocks
// live in tests/helpers/.
const UNIT_MAX_LINES = 500;
const INTEGRATION_MAX_LINES = 800;
const COMMAND_IMPORT_RE = /from ['"]([^'"]*\/src\/commands\/[^'"]+)['"]/g;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function testFiles() {
  return fs
    .readdirSync(__dirname)
    .filter((name) => name.endsWith('.test.js'))
    .sort();
}

function isIntegration(name) {
  return name.endsWith('.integration.test.js') || name.endsWith('.interactive.test.js');
}

function lineCount(name) {
  return fs.readFileSync(path.join(__dirname, name), 'utf8').split(/\r?\n/).length;
}

function countCommandImports(name) {
  const content = fs.readFileSync(path.join(__dirname, name), 'utf8');
  const modules = new Set();
  let match;
  const re = new RegExp(COMMAND_IMPORT_RE.source, 'g');
  while ((match = re.exec(content)) !== null) {
    modules.add(match[1]);
  }
  return modules.size;
}

function violations(name) {
  const result = [];
  if (isIntegration(name)) {
    if (lineCount(name) > INTEGRATION_MAX_LINES) {
      result.push('over-integration-lines');
    }
  } else {
    if (lineCount(name) > UNIT_MAX_LINES) {
      result.push('over-unit-lines');
    }
    if (countCommandImports(name) > 1) {
      result.push('multi-commands');
    }
  }
  return result;
}

// Fragile-assertion counter (D1): toContain/toMatch/.includes with a quoted
// string literal (single, double, bare backtick). Regex args (/.../) never
// match -> structural. Backticks containing ${} are dynamic -> structural.
// organization.test.js is self-exempt: its own rule-key strings are
// identifiers, not copy.
const FRAGILE_ASSERT_RE =
  /\b(?:not\.)?(?:toContain|toMatch)\s*\(\s*(['"`])((?:[^'"`\\]|\\.)*?)\1\s*\)|\.includes\s*\(\s*(['"`])((?:[^'"`\\]|\\.)*?)\3\s*\)/g;

// Structural exclusions (category a): markers, tokens, placeholders, paths,
// bare filenames, CLI flags.
function isStructuralLiteral(lit) {
  if (/<!--|-->/.test(lit)) return true; // XML marker pairs
  if (/\{\{|\}\}/.test(lit)) return true; // {{TOKEN}} interpolation
  if (/^<[^<>]+>$/.test(lit)) return true; // <placeholder>
  if (/[/\\]/.test(lit)) return true; // path separators
  if (/\.(md|json|js|mjs|ts|yml|yaml|txt|toml|lock)$/i.test(lit)) return true; // bare filenames
  if (/^--/.test(lit)) return true; // CLI flag tokens
  return false;
}

function countFragileAssertions(name) {
  if (name === path.basename(__filename)) return 0; // self-exempt
  const content = fs.readFileSync(path.join(__dirname, name), 'utf8');
  let count = 0;
  const re = new RegExp(FRAGILE_ASSERT_RE.source, 'g');
  let match;
  while ((match = re.exec(content)) !== null) {
    const lit = match[2] ?? match[4];
    if (lit === undefined) continue;
    if (lit.includes('${')) continue; // template literal with interpolation
    if (isStructuralLiteral(lit)) continue;
    count++;
  }
  return count;
}

describe('test file organization conventions', () => {
  const files = testFiles();

  it('unit test files (non-integration) stay under the 500-line cap', () => {
    const offenders = files.filter((name) => {
      const exempt = (LEGACY_EXCEPTIONS[name] || []).includes('over-unit-lines');
      return !exempt && violations(name).includes('over-unit-lines');
    });
    expect(offenders).toEqual([]);
  });

  it('integration test files stay under the 800-line cap', () => {
    const offenders = files.filter((name) => {
      const exempt = (LEGACY_EXCEPTIONS[name] || []).includes('over-integration-lines');
      return !exempt && violations(name).includes('over-integration-lines');
    });
    expect(offenders).toEqual([]);
  });

  it('unit test files import from at most ONE src/commands/ module', () => {
    const offenders = files.filter((name) => {
      const exempt = (LEGACY_EXCEPTIONS[name] || []).includes('multi-commands');
      return !exempt && violations(name).includes('multi-commands');
    });
    expect(offenders).toEqual([]);
  });

  it('LEGACY_EXCEPTIONS entries still violate their annotated rules', () => {
    const stale = Object.keys(LEGACY_EXCEPTIONS).filter((name) => {
      const remaining = violations(name).filter((v) => LEGACY_EXCEPTIONS[name].includes(v));
      return remaining.length === 0;
    });
    expect(stale.map((name) => `${name} is in LEGACY_EXCEPTIONS but no longer violates; migrate and remove it`)).toEqual([]);
  });
});

describe('anti-brittle gate (FRAGILE_DEBT)', () => {
  const files = testFiles();
  const mapped = new Set(Object.keys(FRAGILE_DEBT));

  it('FRAGILE_DEBT entries match the exact remaining fragile count (stale or drifted entries fail)', () => {
    const issues = [];
    for (const name of Object.keys(FRAGILE_DEBT)) {
      if (!files.includes(name)) {
        issues.push(`${name} is in FRAGILE_DEBT but the file no longer exists; remove the entry`);
        continue;
      }
      const actual = countFragileAssertions(name);
      if (actual !== FRAGILE_DEBT[name]) {
        issues.push(
          `${name} records ${FRAGILE_DEBT[name]} fragile assertions but the file has ${actual}; migrate the file and update/remove the entry`,
        );
      }
    }
    expect(issues).toEqual([]);
  });

  it('files without a FRAGILE_DEBT entry have zero fragile assertions (no new debt)', () => {
    const offenders = files.filter((name) => !mapped.has(name) && countFragileAssertions(name) > 0);
    expect(offenders).toEqual([]);
  });
});

describe('module boundary: estimateDomain -> estimateMarkers (one direction)', () => {
  it('estimateDomain.js never references estimateMarkers (D5)', () => {
    const source = fs.readFileSync(path.join(__dirname, '..', 'src', 'utils', 'estimateDomain.js'), 'utf8');
    expect(source).not.toMatch(/estimateMarkers/);
  });
});
