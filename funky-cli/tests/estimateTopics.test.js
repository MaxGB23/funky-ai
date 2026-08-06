import { describe, it, expect } from 'vitest';

import { surfaceEstimateTopics, TOPICS, DISPLAY_NAMES, STATUS } from '../src/utils/estimateTopics.js';
import { NEUTRAL_DECISIONS, projectCanvasWith, infraCanvasWith } from './helpers/fsMock.js';

// ═══════════════════════════════════════════════════
// PR 1 (estimate-redesign): surfaceEstimateTopics
// ═══════════════════════════════════════════════════

// Por tópico: qué canvas usa, en qué región sembrar la señal y qué evidencia
// debe resultar. Lockea las Status Rules y los sets de señales del design.
const TOPIC_FIXTURES = [
  {
    topic: 'roles',
    canvasKey: 'projectCanvas',
    canvasWith: projectCanvasWith,
    section: 'whole',
    regionContent: 'Dedicación: full-time',
    regionEvidence: 'dedicación',
    upperContent: 'DEDICACIÓN 100%',
    upperEvidence: 'dedicación',
    decisionsSignal: 'dedicación 50%',
    decisionsEvidence: 'dedicación',
  },
  {
    topic: 'multi-tenant',
    canvasKey: 'infraCanvas',
    canvasWith: infraCanvasWith,
    section: 1,
    regionContent: 'Aislamiento por tenant',
    regionEvidence: 'tenant',
    upperContent: 'RLS HABILITADO',
    upperEvidence: 'RLS',
    decisionsSignal: 'Aislamiento por tenant',
    decisionsEvidence: 'tenant',
  },
  {
    topic: 'transactions',
    canvasKey: 'infraCanvas',
    canvasWith: infraCanvasWith,
    section: 1,
    regionContent: 'Procesamos pagos',
    regionEvidence: 'pagos',
    upperContent: 'USAMOS STRIPE',
    upperEvidence: 'stripe',
    decisionsSignal: 'El saldo se guarda en un ledger',
    decisionsEvidence: 'saldo',
  },
  {
    topic: 'security',
    canvasKey: 'infraCanvas',
    canvasWith: infraCanvasWith,
    section: 2,
    regionContent: 'Login con JWT',
    regionEvidence: 'jwt',
    upperContent: 'USAMOS JWT',
    upperEvidence: 'jwt',
    decisionsSignal: 'rate limit por api key',
    decisionsEvidence: 'api-key',
  },
  {
    topic: 'concurrency',
    canvasKey: 'infraCanvas',
    canvasWith: infraCanvasWith,
    section: 1,
    regionContent: 'Cola de jobs',
    regionEvidence: 'cola',
    upperContent: 'REDIS + WORKER',
    upperEvidence: 'worker',
    decisionsSignal: 'Eventos con retry',
    decisionsEvidence: 'retry',
  },
  {
    topic: 'integrations',
    canvasKey: 'projectCanvas',
    canvasWith: projectCanvasWith,
    section: 'whole',
    regionContent: 'Recibimos webhooks',
    regionEvidence: 'webhook',
    upperContent: 'CRM + ERP',
    upperEvidence: 'crm',
    decisionsSignal: 'Slack para terceros',
    decisionsEvidence: 'slack',
  },
];

describe('surfaceEstimateTopics', () => {
  describe.each(TOPIC_FIXTURES)('$topic', (fixture) => {
    const {
      topic, canvasKey, canvasWith, section, regionContent, regionEvidence,
      upperContent, upperEvidence, decisionsSignal, decisionsEvidence,
    } = fixture;

    const signalFor = (result) => result.signals.find((s) => s.topic === topic);

    function withRegion(content) {
      const overrides = section === 'whole' ? { 1: content } : { [section]: content };
      return { [canvasKey]: canvasWith(overrides) };
    }

    it('Aplica cuando la región relevante contiene una señal', () => {
      const result = surfaceEstimateTopics(withRegion(regionContent), NEUTRAL_DECISIONS);
      expect(signalFor(result)).toEqual({ topic, status: STATUS.APPLIES, evidence: regionEvidence });
    });

    it('Aplica cuando la señal aparece en mayúsculas (case-insensitive)', () => {
      const result = surfaceEstimateTopics(withRegion(upperContent), NEUTRAL_DECISIONS);
      expect(signalFor(result)).toEqual({ topic, status: STATUS.APPLIES, evidence: upperEvidence });
    });

    it('Aplica cuando la señal está solo en las decisiones', () => {
      const result = surfaceEstimateTopics({ [canvasKey]: canvasWith() }, decisionsSignal);
      expect(signalFor(result)).toEqual({ topic, status: STATUS.APPLIES, evidence: decisionsEvidence });
    });

    it('No aplica según lo documentado cuando no hay señales ni marcadores', () => {
      const result = surfaceEstimateTopics({ [canvasKey]: canvasWith() }, NEUTRAL_DECISIONS);
      expect(signalFor(result)).toEqual({
        topic,
        status: STATUS.NOT_APPLICABLE,
        evidence: 'sin señales en lo documentado',
      });
    });

    it('Indeterminado (revisar) cuando la región relevante está sin completar', () => {
      const result = surfaceEstimateTopics(withRegion('[Responde aquí]'), NEUTRAL_DECISIONS);
      expect(signalFor(result)).toEqual({
        topic,
        status: STATUS.INDETERMINATE,
        evidence: 'sección sin completar',
      });
    });

    it('Indeterminado (revisar) cuando el canvas está ausente', () => {
      const result = surfaceEstimateTopics({}, NEUTRAL_DECISIONS);
      expect(signalFor(result)).toEqual({
        topic,
        status: STATUS.INDETERMINATE,
        evidence: 'canvas ausente',
      });
    });
  });

  it('devuelve 6 señales en orden canónico (topic key == flag name)', () => {
    const result = surfaceEstimateTopics({}, '');
    expect(result.signals).toHaveLength(6);
    expect(result.signals.map((s) => s.topic)).toEqual(TOPICS);
    expect(TOPICS).toEqual(['roles', 'multi-tenant', 'transactions', 'security', 'concurrency', 'integrations']);
  });

  it('expone DISPLAY_NAMES y STATUS con el copy exacto del design', () => {
    expect(DISPLAY_NAMES).toEqual({
      roles: 'Roles del equipo',
      'multi-tenant': 'Multi-tenant',
      transactions: 'Transacciones',
      security: 'Seguridad',
      concurrency: 'Concurrencia',
      integrations: 'Integraciones',
    });
    expect(STATUS).toEqual({
      APPLIES: 'Aplica',
      NOT_APPLICABLE: 'No aplica según lo documentado',
      INDETERMINATE: 'Indeterminado (revisar)',
    });
  });

  it('precedencia: sección sin completar gana sobre señal detectada', () => {
    const result = surfaceEstimateTopics(
      { infraCanvas: infraCanvasWith({ 1: 'Pagos con Stripe\n[Responde aquí]' }) },
      NEUTRAL_DECISIONS
    );
    const txn = result.signals.find((s) => s.topic === 'transactions');
    expect(txn).toEqual({
      topic: 'transactions',
      status: STATUS.INDETERMINATE,
      evidence: 'sección sin completar',
    });
  });

  it('solo las regiones relevantes del canvas cuentan', () => {
    const infra = infraCanvasWith({ 3: '[Responde aquí]' });
    const result = surfaceEstimateTopics({ infraCanvas: infra }, NEUTRAL_DECISIONS);
    expect(result.signals.find((s) => s.topic === 'transactions').status).toBe(STATUS.NOT_APPLICABLE);

    const infra2 = infraCanvasWith({ 2: '[Responde aquí]' });
    const result2 = surfaceEstimateTopics({ infraCanvas: infra2 }, NEUTRAL_DECISIONS);
    expect(result2.signals.find((s) => s.topic === 'multi-tenant').status).toBe(STATUS.INDETERMINATE);

    const infra4 = infraCanvasWith({ 4: '[Responde aquí]' });
    const result4 = surfaceEstimateTopics({ infraCanvas: infra4 }, NEUTRAL_DECISIONS);
    expect(result4.signals.find((s) => s.topic === 'security').status).toBe(STATUS.INDETERMINATE);
    expect(result4.signals.find((s) => s.topic === 'concurrency').status).toBe(STATUS.INDETERMINATE);
    expect(result4.signals.find((s) => s.topic === 'transactions').status).toBe(STATUS.NOT_APPLICABLE);
  });

  it('normaliza el separador opcional de la señal como evidencia', () => {
    const result = surfaceEstimateTopics(
      { projectCanvas: projectCanvasWith({ 1: 'Contratación part time' }) },
      ''
    );
    const roles = result.signals.find((s) => s.topic === 'roles');
    expect(roles).toEqual({ topic: 'roles', status: STATUS.APPLIES, evidence: 'part-time' });
  });

  it('trata decisiones ausentes como vacías', () => {
    const result = surfaceEstimateTopics({
      projectCanvas: projectCanvasWith(),
      infraCanvas: infraCanvasWith(),
    });
    expect(result.signals).toHaveLength(6);
    expect(result.signals.every((s) => s.status === STATUS.NOT_APPLICABLE)).toBe(true);
  });

  it('acepta el marcador sin completar en mayúsculas', () => {
    const result = surfaceEstimateTopics(
      { infraCanvas: infraCanvasWith({ 1: '[RESPONDE AQUÍ]' }) },
      NEUTRAL_DECISIONS
    );
    expect(result.signals.find((s) => s.topic === 'transactions').status).toBe(STATUS.INDETERMINATE);
  });
});
