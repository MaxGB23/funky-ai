import { Command } from 'commander';
import fs from 'fs';
import path from 'path';
import { select } from '@inquirer/prompts';

/**
 * Lógica pura del comando `funky estimate` (Fase 1: Extracción).
 * Separada del Command de Commander para ser testeable.
 *
 * @param {string} targetBase - Directorio destino (normalmente process.cwd()).
 * @returns {object} - Factores Técnicos extraídos.
 */
export function runEstimateExtraction(targetBase) {
  const projectCanvasPath = path.join(targetBase, 'PROJECT-CANVAS.md');
  const infraCanvasPath = path.join(targetBase, 'INFRA-CANVAS.md');

  const factors = {
    project: {},
    infra: {}
  };

  const parseCanvas = (filePath, targetObj) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Advertencia: No se encontró ${path.basename(filePath)} en el directorio actual.`);
      return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const sections = content.split('## ');

    for (let i = 1; i < sections.length; i++) { // Skip the first part (title)
      const lines = sections[i].split('\n').map(line => line.trim()).filter(line => line.length > 0);
      if (lines.length > 0) {
        const title = lines[0].replace(/^\d+\.\s*/, '').trim(); // Remove numbering like "1. "
        const value = lines.slice(1).join('\n').trim();
        targetObj[title] = value;
      }
    }
  };

  parseCanvas(projectCanvasPath, factors.project);
  parseCanvas(infraCanvasPath, factors.infra);

  return factors;
}

/**
 * Calcula el "Piso Base" y "Nivel de Riesgo" usando factores técnicos y contextuales.
 */
export function calculateEstimate(technicalFactors, contextFactors) {
  let baseComplexityScore = 1;
  const techKeysCount = Object.keys(technicalFactors.project || {}).length + Object.keys(technicalFactors.infra || {}).length;
  
  if (techKeysCount > 10) baseComplexityScore = 3;
  else if (techKeysCount > 5) baseComplexityScore = 2;

  let regionMultiplier = 1;
  if (contextFactors.region === 'US/EU') regionMultiplier = 3;

  let sizeMultiplier = 1;
  if (contextFactors.size === 'Enterprise') sizeMultiplier = 2;

  let urgencyMultiplier = 1;
  if (contextFactors.urgency === 'Alta (Rush)') urgencyMultiplier = 1.5;

  let riskLevel = 'Bajo';
  if (baseComplexityScore === 3 || urgencyMultiplier === 1.5) riskLevel = 'Alto';
  else if (baseComplexityScore === 2 || sizeMultiplier === 2) riskLevel = 'Medio';

  const basePrice = 1000 * baseComplexityScore * regionMultiplier * sizeMultiplier * urgencyMultiplier;

  return {
    basePrice,
    riskLevel,
    complexityScore: baseComplexityScore,
    multipliers: {
      region: regionMultiplier,
      size: sizeMultiplier,
      urgency: urgencyMultiplier
    }
  };
}

/**
 * Genera el contenido markdown para el archivo de pricing analysis.
 */
export function generatePricingMarkdown(technicalFactors, contextFactors, estimateResult) {
  return `# Análisis de Estimación y Pricing

## 1. Registro de Datos

### Factores Contextuales (Ingresados)
- **Región / Poder Adquisitivo:** ${contextFactors.region}
- **Tamaño de la Empresa:** ${contextFactors.size}
- **Urgencia del Proyecto:** ${contextFactors.urgency}

### Factores Técnicos (Extraídos del Canvas)
- **Complejidad Base (Score):** ${estimateResult.complexityScore}
- **Riesgo Identificado:** ${estimateResult.riskLevel}

\`\`\`json
${JSON.stringify(technicalFactors, null, 2)}
\`\`\`

## 2. Cálculo Base Orientativo

- **Piso Base Calculado:** $${estimateResult.basePrice.toLocaleString()} USD
- **Multiplicadores Aplicados:**
  - Región: x${estimateResult.multipliers.region}
  - Tamaño: x${estimateResult.multipliers.size}
  - Urgencia: x${estimateResult.multipliers.urgency}

> *Nota: Este piso es puramente orientativo y representa el costo de producción + un margen de seguridad inicial.*

## 3. Prompt de Mentoría (Value-Based Pricing)

> **[SISTEMA - INSTRUCCIÓN PARA LA IA]**
> Sos un Mentor Experto en Ventas B2B y Value-Based Pricing. El usuario acaba de generar este cálculo base usando la CLI de Funky AI.
> Tu objetivo AHORA no es hablar de código, sino de NEGOCIO.
> 
> Leé los datos de las secciones 1 y 2, y luego iniciá un debate con el usuario preguntando:
> 1. ¿Cuál es el impacto de negocio que esta herramienta le va a generar al cliente? (ej: ¿Ahorra horas? ¿Genera ventas?)
> 2. Basado en ese impacto, ¿cómo podemos ajustar este "Piso Base" para cobrar por el VALOR entregado y no solo por las horas de desarrollo?
> 
> Hacé una sola pregunta a la vez y ayudá al usuario a definir el precio final a presupuestar.
`;
}

export const estimateCommand = new Command('estimate')
  .description('Calcula el presupuesto estimado del proyecto basado en el Canvas y factores de riesgo')
  .action(async () => {
    try {
      const targetBase = process.cwd();
      console.log('🔍 Analizando arquitectura del proyecto...');
      const technicalFactors = runEstimateExtraction(targetBase);

      console.log('✅ Factores Técnicos extraídos:');
      console.log(JSON.stringify(technicalFactors, null, 2));

      // FASE 2: Interactividad y Lógica de Cálculo
      console.log('\n📊 Ingrese los Factores Contextuales:');
      const region = await select({
        message: '¿Región / Poder adquisitivo del cliente?',
        choices: [
          { name: 'LATAM (Base)', value: 'LATAM' },
          { name: 'US/EU (Alto)', value: 'US/EU' }
        ]
      });

      const size = await select({
        message: '¿Tamaño de la empresa?',
        choices: [
          { name: 'Startup / Pyme', value: 'Startup' },
          { name: 'Enterprise', value: 'Enterprise' }
        ]
      });

      const urgency = await select({
        message: '¿Urgencia del proyecto?',
        choices: [
          { name: 'Normal', value: 'Normal' },
          { name: 'Alta (Rush)', value: 'Alta (Rush)' }
        ]
      });

      const contextFactors = { region, size, urgency };
      const estimateResult = calculateEstimate(technicalFactors, contextFactors);

      // FASE 3: Generación Persistente del Artefacto
      const markdownContent = generatePricingMarkdown(technicalFactors, contextFactors, estimateResult);
      const docsDir = path.join(targetBase, 'docs');
      if (!fs.existsSync(docsDir)) {
        fs.mkdirSync(docsDir, { recursive: true });
      }
      const outputPath = path.join(docsDir, 'pricing-analysis.md');
      fs.writeFileSync(outputPath, markdownContent, 'utf-8');

      console.log('\n💰 Resultado de la Estimación:');
      console.log(`Piso Base Calculado: $${estimateResult.basePrice.toLocaleString()}`);
      console.log(`Nivel de Riesgo: ${estimateResult.riskLevel}`);
      console.log(`\n✅ Artefacto generado con éxito en: ${outputPath}`);
      console.log(`Abre el archivo e interactúa con la IA para definir el precio final (Value-Based Pricing).`);

    } catch (error) {
      console.error('❌ Error al ejecutar estimate:', error.message);
      process.exit(1);
    }
  });
