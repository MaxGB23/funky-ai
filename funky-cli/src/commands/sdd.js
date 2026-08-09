import { Command } from 'commander';
import { installCommand, runScaffoldCommand } from './scaffold.js';

/**
 * Namespace `funky sdd` del framework Funky AI. Compone los subcomandos del
 * ciclo SDD; por ahora registra `install`, que delega en `runScaffoldCommand`.
 * El comando `funky scaffold` (scaffold agnóstico) es un comando aparte que
 * vive en `scaffold.js` y no se exporta por este namespace.
 */
export const sddCommand = new Command('sdd')
  .description('Instala el andamiaje SDD del ecosistema Funky AI (reglas de agentes, ORCHESTRATOR-STATE, plantillas SDD, directorios engram)')
  .addCommand(installCommand);

export { runScaffoldCommand };
