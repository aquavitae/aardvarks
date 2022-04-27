import './macros/index.js';
import { log } from './common.js';
import inspiration from './inspiration.js';
import returning from './returning.js';
import wrapper from './wrapper.js';
import './hide-price.js';

Hooks.once('ready', () => {
  if (!game.modules.get('lib-wrapper')?.active && game.user.isGM) {
    ui.notifications.error("Module homebrew requires the 'libWrapper' module. Please install and activate it.");
  }

  inspiration();
});

Hooks.once('setup', async () => {
  log('Loading homebrew rules.');
  await returning();
  await wrapper();
  log('Loaded homebrew rules.');
});
