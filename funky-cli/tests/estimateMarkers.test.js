import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('fs', () => ({ ...fsMock, default: fsMock }));
vi.mock('node:fs', () => ({ ...fsMock, default: fsMock }));
import { fsMock, applyMocks, PRICING_GUIDE_TPL_PATH as TPL_PRICING_GUIDE_PATH, DEFAULT_GUIDE_TEMPLATE, TOPIC_FRAGMENT_ROLES, TOPIC_FRAGMENT_SECURITY, TOPIC_FRAGMENT_TRANSACTIONS, TEAM_COST_TEMPLATE, addOptionalTemplates, embedTopicIntoGuide } from './helpers/fsMock.js';
import { buildPricingGuide, embedTopicSections, detectEmbeddedTopics, refreshPricingGuideBase, validatePricingGuideTemplate } from '../src/utils/estimateMarkers.js';

// Suites movidas de estimateDomain.test.js (testing-modernization, Front 2):
// el mecanismo de incrustación de la zona vive ahora en src/utils/estimateMarkers.js.
// Comportamiento sin cambios; 4 aserciones de copia literal pasaron a forma
// estructural (regex/tokens) para no contar como frágiles en el gate FRAGILE_DEBT.

// ═══════════════════════════════════════════════════
// Fase 2, 2.3: mecanismo de incrustación aditiva (TDD red)
// La implementación vive en la tanda siguiente (2.4); estos tests
// expresan el CONTRATO y caen rojos con "Not implemented (Fase 2, 2.3)".
// ═══════════════════════════════════════════════════

describe('buildPricingGuide — 2.3a', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('produce una guía fresca desde el template base con la zona de topics y el header de discusión', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    addOptionalTemplates(mf);
    applyMocks(mf);

    const guide = buildPricingGuide([]);
    expect(guide).toContain('<!-- topics -->');
    expect(guide).toContain('<!-- /topics -->');
    expect(guide).toMatch(/^## Estructura de Discusión$/m);
  });

  it('M4: buildPricingGuide sin topics NO emite ningún par de marcadores en la zona', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    addOptionalTemplates(mf);
    applyMocks(mf);

    const guide = buildPricingGuide([]);
    expect(guide).not.toMatch(/<!-- topic:[a-z0-9-]+ -->/);
    expect(guide).not.toMatch(/<!-- \/topic:[a-z0-9-]+ -->/);
  });

  it("R10: con 'pricing-team' incrusta la referencia de costos de equipo al final de la zona", () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    addOptionalTemplates(mf);
    applyMocks(mf);

    const guide = buildPricingGuide(['roles', 'pricing-team']);
    expect(guide).toContain('<!-- topic:pricing-team -->');
    expect(guide).toContain(TEAM_COST_TEMPLATE);
    expect(guide.indexOf('<!-- topic:roles -->')).toBeLessThan(guide.indexOf('<!-- topic:pricing-team -->'));
  });

  it('valida el template base y lanza error de instalación claro si no tiene zona o header (1.2)', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = '# Guía sin zona ni header';
    applyMocks(mf);

    expect(() => buildPricingGuide([])).toThrow(/instalaci[oó]n/i);
  });
});

describe('embedTopicSections — 2.3b (aditivo, orden canónico)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('incrusta una sección de topic ausente sin tocar el resto de la guía', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const seeded = embedTopicIntoGuide(DEFAULT_GUIDE_TEMPLATE, 'roles', TOPIC_FRAGMENT_ROLES);
    const result = embedTopicSections(seeded, ['security']);

    expect(result).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(result).toContain(TOPIC_FRAGMENT_ROLES);
    expect(result.indexOf(TOPIC_FRAGMENT_ROLES)).toBeLessThan(result.indexOf(TOPIC_FRAGMENT_SECURITY));
    expect(result).toMatch(/^## Estructura de Discusión$/m);
  });

  it('es aditivo en orden canónico: respeta el orden de TOPICS aunque se pidan en otro orden', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const result = embedTopicSections(DEFAULT_GUIDE_TEMPLATE, ['security', 'roles']);
    const idxRoles = result.indexOf('<!-- topic:roles -->');
    const idxSecurity = result.indexOf('<!-- topic:security -->');
    expect(idxRoles).toBeGreaterThan(-1);
    expect(idxSecurity).toBeGreaterThan(-1);
    expect(idxRoles).toBeLessThan(idxSecurity);
  });

  it('no duplica una sección ya presente (idempotente)', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const once = embedTopicSections(DEFAULT_GUIDE_TEMPLATE, ['roles']);
    const twice = embedTopicSections(once, ['roles']);
    expect(twice).toBe(once);
    expect(twice.match(/<!-- topic:roles -->/g)).toHaveLength(1);
  });

  it('M4: incrusta topics sobre una base SIN pares vacíos (la zona solo lleva contenido)', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const result = embedTopicSections(DEFAULT_GUIDE_TEMPLATE, ['security']);

    expect(result).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(result).toContain('<!-- topic:security -->');
    expect(result).not.toContain('<!-- topic:roles -->');
    expect(result.indexOf('<!-- topic:security -->')).toBeLessThan(result.indexOf('## Estructura de Discusión'));
  });

  it('M4: NO emite pares de marcadores vacíos para topics no solicitados', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const result = embedTopicSections(DEFAULT_GUIDE_TEMPLATE, ['security', 'roles']);

    expect(result).toContain(TOPIC_FRAGMENT_SECURITY);
    expect(result).toContain(TOPIC_FRAGMENT_ROLES);
    expect(result).not.toContain('<!-- topic:transactions -->\n<!-- /topic:transactions -->');
    expect(result).not.toContain('<!-- topic:multi-tenant -->\n<!-- /topic:multi-tenant -->');
    expect(result).not.toContain('<!-- topic:concurrency -->\n<!-- /topic:concurrency -->');
    expect(result).not.toContain('<!-- topic:integrations -->\n<!-- /topic:integrations -->');
  });

  it('M4: la zona NO duplica el prefijo (Paso Inicial) al incrustar sobre una base sin pares', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const result = embedTopicSections(DEFAULT_GUIDE_TEMPLATE, ['security']);
    const zoneStart = result.indexOf('<!-- topics -->');
    const zoneEnd = result.indexOf('<!-- /topics -->');
    const zone = result.slice(zoneStart, zoneEnd);
    expect(zone.match(/## Paso Inicial/g) || []).toHaveLength(1);
    expect(zone.indexOf('## Paso Inicial')).toBeLessThan(zone.indexOf('<!-- topic:security -->'));
  });

  it('R10: incrusta pricing-team sobre una guía existente, al final y sin duplicarlo', () => {
    const mf = {};
    addOptionalTemplates(mf);
    applyMocks(mf);

    const seeded = embedTopicIntoGuide(DEFAULT_GUIDE_TEMPLATE, 'roles', TOPIC_FRAGMENT_ROLES);
    const once = embedTopicSections(seeded, ['security', 'roles', 'pricing-team']);

    expect(once).toContain(TEAM_COST_TEMPLATE);
    expect(once.indexOf('<!-- topic:roles -->')).toBeLessThan(once.indexOf('<!-- topic:security -->'));
    expect(once.indexOf('<!-- topic:security -->')).toBeLessThan(once.indexOf('<!-- topic:pricing-team -->'));

    const twice = embedTopicSections(once, ['pricing-team']);
    expect(twice).toBe(once);
    expect(twice.match(/<!-- topic:pricing-team -->/g)).toHaveLength(1);
  });
});

describe('detectEmbeddedTopics — 2.3', () => {
  it('detecta los topics presentes por marcador exacto', () => {
    const guide = embedTopicIntoGuide(
      embedTopicIntoGuide(DEFAULT_GUIDE_TEMPLATE, 'roles', TOPIC_FRAGMENT_ROLES),
      'security',
      TOPIC_FRAGMENT_SECURITY
    );

    const result = detectEmbeddedTopics(guide);
    expect(result).toEqual(expect.arrayContaining(['roles', 'security']));
    expect(result.sort()).toEqual(['roles', 'security']);
  });

  it('devuelve lista vacía cuando no hay topics incrustados', () => {
    expect(detectEmbeddedTopics(DEFAULT_GUIDE_TEMPLATE)).toEqual([]);
  });

  it('R10: detecta pricing-team por marcador exacto cuando está incrustado', () => {
    const guide = embedTopicIntoGuide(DEFAULT_GUIDE_TEMPLATE, 'pricing-team', TEAM_COST_TEMPLATE);

    const result = detectEmbeddedTopics(guide);
    expect(result).toEqual(expect.arrayContaining(['pricing-team']));
  });
});

describe('refreshPricingGuideBase — 2.3e (reincrusta TODOS los topics)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('reconstruye la base fresca y reincrusta todos los topics detectados, ninguno se pierde', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    addOptionalTemplates(mf);
    applyMocks(mf);

    const stale = embedTopicIntoGuide(
      embedTopicIntoGuide(DEFAULT_GUIDE_TEMPLATE, 'roles', TOPIC_FRAGMENT_ROLES),
      'transactions',
      TOPIC_FRAGMENT_TRANSACTIONS
    );

    const result = refreshPricingGuideBase(DEFAULT_GUIDE_TEMPLATE, stale);
    expect(result).toContain(TOPIC_FRAGMENT_ROLES);
    expect(result).toContain(TOPIC_FRAGMENT_TRANSACTIONS);
    expect(result).toMatch(/^## Estructura de Discusión$/m);
  });

  it('M4: refresca sobre una base SIN pares vacíos y solo reincrusta topics con contenido', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    addOptionalTemplates(mf);
    applyMocks(mf);

    const stale = embedTopicIntoGuide(DEFAULT_GUIDE_TEMPLATE, 'roles', TOPIC_FRAGMENT_ROLES);

    const result = refreshPricingGuideBase(DEFAULT_GUIDE_TEMPLATE, stale);
    expect(result).toContain(TOPIC_FRAGMENT_ROLES);
    expect(result).not.toContain('<!-- topic:security -->');
    expect(result).not.toContain('<!-- topic:transactions -->\n<!-- /topic:transactions -->');
  });

  it('R10: refresca la base y reincrusta pricing-team detectado sin perderlo', () => {
    const mf = {};
    mf[TPL_PRICING_GUIDE_PATH] = DEFAULT_GUIDE_TEMPLATE;
    addOptionalTemplates(mf);
    applyMocks(mf);

    const stale = embedTopicIntoGuide(
      embedTopicIntoGuide(DEFAULT_GUIDE_TEMPLATE, 'roles', TOPIC_FRAGMENT_ROLES),
      'pricing-team',
      TEAM_COST_TEMPLATE
    );

    const result = refreshPricingGuideBase(DEFAULT_GUIDE_TEMPLATE, stale);
    expect(result).toContain('<!-- topic:pricing-team -->');
    expect(result).toContain(TEAM_COST_TEMPLATE);
  });
});

describe('validatePricingGuideTemplate — 1.2', () => {
  it('acepta un template con zona de topics y header de discusión', () => {
    expect(() => validatePricingGuideTemplate(DEFAULT_GUIDE_TEMPLATE)).not.toThrow();
  });

  it('lanza error de instalación claro si falta la zona de topics', () => {
    expect(() => validatePricingGuideTemplate('# Guía sin zona')).toThrow(/instalaci[oó]n/i);
  });

  it('lanza error de instalación claro si falta ## Estructura de Discusión', () => {
    const noHeader = DEFAULT_GUIDE_TEMPLATE.replace('## Estructura de Discusión', '## Otra Sección');
    expect(() => validatePricingGuideTemplate(noHeader)).toThrow(/Estructura de Discusión/i);
  });
});
