// v2 shape (R-P8) shared across tests
export const V2_CTX = {
  version: 2,
  createdAt: '2024-01-01T00:00:00.000Z',
  currentPhase: null,
  assess: {
    status: 'pending',
    startedAt: null,
    finishedAt: null,
    durationMs: null,
    error: null,
    artifacts: [],
    runAt: null,
    surfacedPatterns: [],
    decisionsFile: null
  },
  estimate: {
    status: 'pending',
    startedAt: null,
    finishedAt: null,
    durationMs: null,
    error: null,
    artifacts: [],
    runAt: null
  }
};

export function fsError(code, message = code) {
  const err = new Error(`${code}: ${message}`);
  err.code = code;
  return err;
}
