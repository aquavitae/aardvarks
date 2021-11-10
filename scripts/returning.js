import { findToken, log, measureGrid, moduleName } from './common.js';

const returningUsed = 'returningUsed';

const hasQuiverOfReturning = (actor) =>
  actor.items.filter((item) => item.name.toLowerCase() === 'quiver of returning').length > 0;

const hasBeltOfReturning = (actor) =>
  actor.items.filter((item) => item.name.toLowerCase() === 'belt of returning').length > 0;

const isReturningItem = (item) => !!(item?.name || '').match(/\(returning\)/i);

const addItemCount = async (item, n) => {
  const quantity = item.data.data.quantity || 0;
  await item.update({ 'data.quantity': quantity + n });
};

const flagReturningItem = async (actor, item) => {
  if (game.combat?.started) {
    const usedItems = (await actor.getFlag(moduleName, returningUsed)) || [];
    await actor.setFlag(moduleName, returningUsed, [...usedItems, item.id]);
    log(`${actor} used ${item.name}. It will return at the end of the turn`);
  } else {
    await addItemCount(item, 1);
  }
};

const onPreAttackRollComplete = async (workflow) => {
  const { actor, ammo, item, targets, tokenId } = workflow;

  if (isReturningItem(ammo) && hasQuiverOfReturning(actor)) {
    await flagReturningItem(actor, ammo);
    return;
  }

  if (targets.size !== 1) {
    log('ERROR: incorrect number of targets', targets);
    return;
  }

  const isRangedAttack = (await measureGrid(findToken(tokenId), [...targets][0])) >= 5;

  if (isRangedAttack) {
    if (isReturningItem(item) && item.data.data.properties.thr && hasBeltOfReturning(actor)) {
      await flagReturningItem(actor, item);
    }
  } else {
    // return it to inventory immediately
    await addItemCount(item, 1);
  }
};

const onUpdateCombat = async () => {
  await game.actors.forEach(async (actor) => {
    const used = (await actor.getFlag(moduleName, returningUsed)) || [];
    used.forEach(async (itemId) => {
      const item = actor.items.get(itemId);
      await addItemCount(item, 1);
      log(`Returned 1 ${item.name} to ${actor.name}`);
    });
    await actor.unsetFlag(moduleName, returningUsed);
  });
};

export default async () => {
  Hooks.on('midi-qol.preAttackRollComplete', onPreAttackRollComplete);
  Hooks.on('updateCombat', onUpdateCombat);
  log('Loaded returning items');
};
