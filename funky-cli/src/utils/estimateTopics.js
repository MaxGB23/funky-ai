// PR 1 (estimate-redesign): heurísticas puras de tópicos de pricing.
// Espeja assessRules.js en intención (sin acceso a fs, determinístico y
// testeable). Topic key == flag name para los 6 tópicos, así `opts[topic]`
// funciona directo en estimate.js (PR 3).

export const TOPICS = [
  'roles',
  'multi-tenant',
  'transactions',
  'security',
  'concurrency',
  'integrations',
];

export const DISPLAY_NAMES = {
  roles: 'Roles del equipo',
  'multi-tenant': 'Multi-tenant',
  transactions: 'Transacciones',
  security: 'Seguridad',
  concurrency: 'Concurrencia',
  integrations: 'Integraciones',
};

export const STATUS = {
  APPLIES: 'Aplica',
  NOT_APPLICABLE: 'No aplica según lo documentado',
  INDETERMINATE: 'Indeterminado (revisar)',
};

const EVIDENCE = {
  CANVAS_MISSING: 'canvas ausente',
  SECTION_UNFILLED: 'sección sin completar',
  NO_SIGNALS: 'sin señales en lo documentado',
};

const UNFILLED_MARKER = /\[responde aquí\]/i;

// Señales por tópico (case-insensitive). `.?` = separador opcional:
// "multi-tenant", "multi tenant" y "multitenant" matchean "multi.?tenant".
// regions: null = canvas completo; [n] = sección numerada `## n.` del canvas.
const TOPIC_RULES = [
  {
    topic: 'roles',
    canvasKey: 'projectCanvas',
    regions: null,
    signals: ['equipo', 'junior', 'senior', 'roles', 'dedicación', 'full.?time', 'part.?time'],
  },
  {
    topic: 'multi-tenant',
    canvasKey: 'infraCanvas',
    regions: [1, 2],
    signals: ['tenant', 'multi.?tenant', 'organización', 'workspace', 'aislamiento', 'RLS'],
  },
  {
    topic: 'transactions',
    canvasKey: 'infraCanvas',
    regions: [1],
    signals: ['transaccion', 'ACID', 'pagos', 'payment', 'wallet', 'saldo', 'ledger', 'checkout', 'stripe'],
  },
  {
    topic: 'security',
    canvasKey: 'infraCanvas',
    regions: [2, 4],
    signals: ['auth', 'oauth', 'jwt', 'sso', 'mfa', '2fa', 'rbac', 'gdpr', 'encript', 'secret', 'api.?key', 'rate.?limit'],
  },
  {
    topic: 'concurrency',
    canvasKey: 'infraCanvas',
    regions: [1, 4],
    signals: ['concurrenc', 'race', 'lock', 'queue', 'cola', 'worker', 'redis', 'shard', 'eventu', 'retry', 'backpressure'],
  },
  {
    topic: 'integrations',
    canvasKey: 'projectCanvas',
    regions: null,
    signals: ['integraci', 'webhook', 'api.?externa', 'third.?party', 'stripe', 'slack', 'salesforce', 'crm', 'erp'],
  },
];

// Compilado una sola vez: regex precompilada + keyword normalizada como
// evidencia (el separador opcional `.?` se reporta como "-").
const TOPIC_PATTERNS = TOPIC_RULES.map((rule) => ({
  topic: rule.topic,
  canvasKey: rule.canvasKey,
  regions: rule.regions,
  patterns: rule.signals.map((signal) => ({
    signal,
    regex: new RegExp(signal, 'i'),
    evidence: signal.replace(/\.\?/g, '-'),
  })),
}));

/**
 * Superficia el estado de los 6 tópicos de pricing según las Status Rules:
 * 1. canvas ausente → `Indeterminado (revisar)` ("canvas ausente")
 * 2. región relevante con `[Responde aquí]` → `Indeterminado (revisar)`
 *    ("sección sin completar")
 * 3. señal en región o decisiones → `Aplica` (evidence = keyword matcheada)
 * 4. resto → `No aplica según lo documentado` ("sin señales en lo documentado")
 *
 * Precedencia: Indeterminado > Aplica > No aplica.
 *
 * @param {{ projectCanvas?: string, infraCanvas?: string }} canvases
 * @param {string} [decisions] Texto de decisiones arquitectónicas.
 * @returns {{ signals: Array<{ topic: string, status: string, evidence: string }> }}
 *   6 filas en orden canónico. Función pura: sin fs, sin estado.
 */
export function surfaceEstimateTopics(canvases, decisions) {
  const sources = canvases ?? {};
  const decisionsText = String(decisions ?? '');
  const signals = TOPIC_PATTERNS.map((rule) => {
    const { status, evidence } = evaluateTopic(rule, sources, decisionsText);
    return { topic: rule.topic, status, evidence };
  });
  return { signals };
}

function evaluateTopic(rule, sources, decisionsText) {
  const canvasText = sources[rule.canvasKey];
  if (canvasText == null) {
    return { status: STATUS.INDETERMINATE, evidence: EVIDENCE.CANVAS_MISSING };
  }
  const regionText = regionTextFor(rule, canvasText);
  if (UNFILLED_MARKER.test(regionText)) {
    return { status: STATUS.INDETERMINATE, evidence: EVIDENCE.SECTION_UNFILLED };
  }
  const hit = matchFirstSignal(regionText, decisionsText, rule.patterns);
  if (hit) {
    return { status: STATUS.APPLIES, evidence: hit.evidence };
  }
  return { status: STATUS.NOT_APPLICABLE, evidence: EVIDENCE.NO_SIGNALS };
}

function regionTextFor(rule, canvasText) {
  if (rule.regions === null) {
    return String(canvasText);
  }
  return rule.regions.map((n) => extractSectionText(canvasText, n)).join('\n');
}

/** Devuelve el cuerpo de la sección numerada `## n.` (sin el encabezado). */
function extractSectionText(canvasText, sectionNumber) {
  const lines = String(canvasText ?? '').split(/\r?\n/);
  const body = [];
  let active = false;
  for (const line of lines) {
    const match = line.match(/^#{1,6}\s*(\d+)\.\s/);
    if (match) {
      active = Number(match[1]) === sectionNumber;
    } else if (active) {
      body.push(line);
    }
  }
  return body.join('\n');
}

/** Primera señal que matchea, en el orden del design (primera gana). */
function matchFirstSignal(regionText, decisionsText, patterns) {
  const haystack = `${regionText}\n${decisionsText}`;
  for (const entry of patterns) {
    if (entry.regex.test(haystack)) {
      return entry;
    }
  }
  return null;
}
