import { Command } from 'commander';
import { installCommand, runScaffoldCommand, scaffoldCommand } from './scaffold.js';

/**
 * Namespace `funky sdd` del framework Funky AI. Compone los subcomandos del
 * ciclo SDD; por ahora registra `install`, que delega en `runScaffoldCommand`
 * (handler compartido con el alias deprecado `funky scaffold`).
 */
export const sddCommand = new Command('sdd')
  .description('Instala el andamiaje SDD del ecosistema Funky AI (reglas de agentes, ORCHESTRATOR-STATE, plantillas SDD, directorios engram)')
  .addCommand(installCommand);

export { runScaffoldCommand, scaffoldCommand };
