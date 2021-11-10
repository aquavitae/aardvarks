import { log } from './common.js';

export default async () => {
  await game.actors
    .filter((a) => a.hasPlayerOwner)
    .forEach(async (a) => {
      log(`Adding inspiration for ${a.name}`);
      await a.update({ 'data.attributes.inspiration': true });
    });
};
