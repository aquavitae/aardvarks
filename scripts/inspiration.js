import { log } from './common.js';

export default async () => {
  if (game.user.isGM) {
    await game.actors
      .filter((a) => a.hasPlayerOwner && a.name !== 'Shadow')
      .forEach(async (a) => {
        log(`Adding inspiration for ${a.name}`);
        await a.update({ 'data.attributes.inspiration': true });
      });
  }
};
