import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, isAbsolute, resolve } from 'node:path';

export function initContext() {
  return {
    version: 1,
    createdAt: new Date().toISOString(),
    canvases: {
      projectCanvas: null,
      projectSource: null,
      infraCanvas: null,
      infraSource: null,
      unfilledCount: 0
    },
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
  const contextPath = join(targetBase, 'context.json');
  try {
    const raw = readFileSync(contextPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeContext(targetBase, ctx) {
  const contextPath = join(targetBase, 'context.json');
  writeFileSync(contextPath, JSON.stringify(ctx, null, 2), 'utf-8');
}

function findCanvas(name, targetBase) {
  const rootPath = join(targetBase, name);
  if (existsSync(rootPath)) {
    return { content: readFileSync(rootPath, 'utf-8'), source: 'root' };
  }

  const docsPath = join(targetBase, 'docs', name);
  if (existsSync(docsPath)) {
    return { content: readFileSync(docsPath, 'utf-8'), source: 'docs' };
  }

  return null;
}

export function findCanvases(targetBase) {
  const projectResult = findCanvas('PROJECT-CANVAS.md', targetBase);
  const infraResult = findCanvas('INFRA-CANVAS.md', targetBase);

  let unfilledCount = 0;
  if (projectResult) {
    unfilledCount += countUnfilledSections(projectResult.content);
  }
  if (infraResult) {
    unfilledCount += countUnfilledSections(infraResult.content);
  }

  return {
    projectCanvas: projectResult ? projectResult.content : null,
    projectSource: projectResult ? projectResult.source : null,
    infraCanvas: infraResult ? infraResult.content : null,
    infraSource: infraResult ? infraResult.source : null,
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
    resolvedPath = join(targetBase, 'docs', 'architecture-decisions.md');
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
