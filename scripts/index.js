import { log } from './common.js';
import './whisper-to-gm.js';

Hooks.once('ready', () => {
  if (!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
    ui.notifications.error("Module homebrew requires the 'libWrapper' module. Please install and activate it.");
  }
});

Hooks.once('setup', async () => {
  log('Aardvarks loaded.');
});
