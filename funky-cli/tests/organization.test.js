import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Legacy debt: files grandfathered under the current conventions.
// Each entry must still violate its rule; migrate the file and remove it here.
// Removing the file entirely also requires removing its entry.
const LEGACY_EXCEPTIONS = {
  'assess.test.js': ['over-unit-lines', 'imports-commands'],
  'pipeline.test.js': ['over-unit-lines', 'imports-commands'],
  'context.test.js': ['over-unit-lines'],
  'engram.test.js': ['imports-commands'],
  'feature.test.js': ['imports-commands'],
  'init.test.js': ['imports-commands'],
  'scaffold.test.js': ['imports-commands'],
  'skills.test.js': ['imports-commands'],
  'skills.interactive.test.js': ['imports-commands'],
};

// Convention: one unit under test per file, named {unit}.test.js. Integration
// goes in {cmd}.integration.test.js. Shared fs mocks live in tests/helpers/.
const UNIT_MAX_LINES = 500;
const INTEGRATION_MAX_LINES = 800;
const COMMANDS_IMPORT_RE = /from ['"][^'"]*\/src\/commands\//;

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function testFiles() {
  return fs
    .readdirSync(__dirname)
    .filter((name) => name.endsWith('.test.js'))
    .sort();
}

function isIntegration(name) {
  return name.endsWith('.integration.test.js');
}

function lineCount(name) {
  return fs.readFileSync(path.join(__dirname, name), 'utf8').split(/\r?\n/).length;
}

function importsCommands(name) {
  const content = fs.readFileSync(path.join(__dirname, name), 'utf8');
  return COMMANDS_IMPORT_RE.test(content);
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
    if (importsCommands(name)) {
      result.push('imports-commands');
    }
  }
  return result;
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

  it('unit test files do not import from src/commands/', () => {
    const offenders = files.filter((name) => {
      const exempt = (LEGACY_EXCEPTIONS[name] || []).includes('imports-commands');
      return !exempt && violations(name).includes('imports-commands');
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
