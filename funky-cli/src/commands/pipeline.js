import { Command } from 'commander';
import { initContext, readContext, writeContext } from '../utils/context.js';
import { runAssess } from './assess.js';
import { runEstimate } from './estimate.js';

export const pipelineCommand = new Command('pipeline')
  .description('Orquesta el pipeline funky: init → assess → estimate');

pipelineCommand
  .command('assess')
  .description('Ejecuta assess con el contexto compartido del pipeline')
  .action(() => {
    const targetBase = process.cwd();

    // Inicializa el context si falta
    let ctx = readContext(targetBase);
    if (!ctx) {
      ctx = initContext();
      writeContext(targetBase, ctx);
    }

    runAssess(targetBase, { context: true });
    process.exit(0);
    return;
  });

pipelineCommand
  .command('estimate')
  .description('Ejecuta estimate con el contexto compartido del pipeline')
  .action(() => {
    const targetBase = process.cwd();

    // Valida que exista el context
    const ctx = readContext(targetBase);
    if (!ctx) {
      console.error('❌ Contexto de pipeline no encontrado. Ejecuta "funky pipeline assess" primero.');
      process.exit(1);
      return;
    }

    // Valida que assess ya se haya ejecutado
    if (!ctx.assess?.runAt) {
      console.error('❌ Assess aún no se ha ejecutado. Ejecuta "funky pipeline assess" primero.');
      process.exit(1);
      return;
    }

    runEstimate(targetBase, { context: true });
    process.exit(0);
    return;
  });

pipelineCommand
  .command('all')
  .description('Ejecuta el pipeline completo: assess → estimate')
  .action(() => {
    const targetBase = process.cwd();

    // Inicializa el context si falta
    let ctx = readContext(targetBase);
    if (!ctx) {
      ctx = initContext();
      writeContext(targetBase, ctx);
    }

    // Ejecuta assess
    try {
      runAssess(targetBase, { context: true });
      console.log('\n✅ Assess completado. Ejecutando estimate...\n');
    } catch (err) {
      console.error('❌ Assess falló:', err.message);
      process.exit(1);
      return;
    }

    // Ejecuta estimate (solo si assess tuvo éxito)
    try {
      runEstimate(targetBase, { context: true });
      console.log('\n✅ Pipeline completado.');
    } catch (err) {
      console.error('❌ Estimate falló:', err.message);
      process.exit(1);
      return;
    }

    process.exit(0);
    return;
  });

pipelineCommand
  .command('status')
  .description('Muestra el estado actual del pipeline')
  .action(() => {
    const targetBase = process.cwd();
    const ctx = readContext(targetBase);

    if (!ctx) {
      console.log('📋 Pipeline no iniciado.');
      console.log('Ejecuta "funky pipeline assess" para comenzar.');
      process.exit(0);
      return;
    }

    console.log('📋 Estado del Pipeline');
    console.log('──────────────────────');
    console.log(`Creado: ${ctx.createdAt}`);
    console.log('');

    // Estado de assess
    console.log('🔍 Assess:');
    console.log(`  ${ctx.assess?.runAt ? 'Completado: ' + ctx.assess.runAt : '⏳ Aún no ejecutado'}`);
    if (ctx.assess?.dynamicQuestions?.length) {
      console.log(`  Preguntas dinámicas: ${ctx.assess.dynamicQuestions.length}`);
    }
    console.log('');

    // Estado de estimate
    console.log('💰 Estimate:');
    console.log(`  ${ctx.estimate?.runAt ? 'Completado: ' + ctx.estimate.runAt : '⏳ Aún no ejecutado'}`);
    console.log('');

    // Progreso del pipeline
    console.log('📊 Progreso:');
    const completed = ctx.pipeline?.completed || [];
    if (completed.length > 0) {
      completed.forEach(s => console.log(`  ✅ ${s}`));
    } else if (ctx.assess?.runAt) {
      console.log('  ✅ assess');
      console.log('  ⏳ estimate — pendiente');
    } else {
      console.log('  ⏳ No iniciado');
    }

    process.exit(0);
    return;
  });
