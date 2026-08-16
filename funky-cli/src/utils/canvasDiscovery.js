import { readFileSync } from 'node:fs';
import { join } from 'node:path';

function canvasDir(targetBase) {
  return join(targetBase, 'docs', 'funky-ai', 'canvas');
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
