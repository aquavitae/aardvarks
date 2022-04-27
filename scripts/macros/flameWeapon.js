export default async (actor, itemName, extraDamage) => {
  await game.dfreds.effectInterface.toggleEffect(itemName, uuids = [actor.uuid]);

  const isBurning = await game.dfreds.effectInterface.hasEffectApplied(itemName, actor.uuid);
  const item = actor.items.find((x) => x.name === itemName);
  const damage = item.data.data.damage.parts;

  if (isBurning) {
    await item.update({ 'data.damage.parts': [damage[0], extraDamage] });
  } else {
    await item.update({ 'data.damage.parts': [damage[0]] });
  }
};
