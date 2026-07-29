import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, isAbsolute, resolve } from 'node:path';

function pipelineDir(targetBase) {
  return join(targetBase, 'docs', 'funky-ai', 'pipeline');
}

function canvasDir(targetBase) {
  return join(targetBase, 'docs', 'funky-ai', 'canvas');
}

export function initContext() {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    assess: {
      runAt: null,
      dynamicQuestions: []
    },
    estimate: {
      runAt: null
    },
    pipeline: {
      lastCommand: null,
      completed: []
    }
  };
}

export function readContext(targetBase) {
  const contextPath = join(pipelineDir(targetBase), 'context.json');
  try {
    const raw = readFileSync(contextPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeContext(targetBase, ctx) {
  const dir = pipelineDir(targetBase);
  try {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  } catch {}
  const contextPath = join(dir, 'context.json');
  writeFileSync(contextPath, JSON.stringify(ctx, null, 2), 'utf-8');
}

/**
 * Lee un archivo de canvas desde docs/funky-ai/canvas/.
 */
function readCanvas(name, targetBase) {
  const path = join(canvasDir(targetBase), name);
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}

export function findCanvases(targetBase) {
  const projectCanvas = readCanvas('PROJECT-CANVAS.md', targetBase);
  const infraCanvas = readCanvas('INFRA-CANVAS.md', targetBase);

  let unfilledCount = 0;
  if (projectCanvas) {
    unfilledCount += countUnfilledSections(projectCanvas);
  }
  if (infraCanvas) {
    unfilledCount += countUnfilledSections(infraCanvas);
  }

  return {
    projectCanvas,
    infraCanvas,
    unfilledCount
  };
}

export function countUnfilledSections(markdown) {
  const regex = /\[Responde aquí\]/g;
  const matches = markdown.match(regex);
  return matches ? matches.length : 0;
}

export function loadDecisions(targetBase, decisionsPath) {
  let resolvedPath;
  if (decisionsPath === null || decisionsPath === undefined) {
    resolvedPath = join(targetBase, 'docs', 'funky-ai', 'assess', 'architecture-decisions.md');
  } else if (isAbsolute(decisionsPath)) {
    resolvedPath = decisionsPath;
  } else {
    resolvedPath = resolve(targetBase, decisionsPath);
  }

  try {
    return readFileSync(resolvedPath, 'utf-8');
  } catch {
    return null;
  }
}
