const favoredFoeOnUse = async ({ hitTargets, actorUuid, item, itemUuid }) => {
  const targetUuid = hitTargets[0].uuid;
  const actor = await MidiQOL.MQfromActorUuid(actorUuid); // actor who cast the spell

  if (!actor || !targetUuid) {
    console.error('Favored Foe: no token/target selected');
    return {};
  }

  // create an active effect,
  //  one change showing the hunter's mark icon on the caster
  //  the second setting the flag for the macro to be called when damaging an opponent

  const effectData = {
    changes: [
      { key: 'flags.aardvarks.favoredFoeTarget', mode: 5, value: targetUuid, priority: 20 }, // who is marked
      { key: 'flags.dnd5e.DamageBonusMacro', mode: 0, value: `ItemMacro.${item.name}`, priority: 20 }, // macro to apply the damage
    ],
    origin: itemUuid, // flag the effect as associated to the spell being cast
    disabled: false,
    duration: item.effects[0].duration,
    icon: item.img,
    label: item.name,
  };

  effectData.duration.startTime = game.time.worldTime;
  await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);
};

const favoredFoeDamageBonus = async ({ hitTargets, item, actorUuid, isCritical, itemUuid }) => {
  const actor = await MidiQOL.MQfromActorUuid(actorUuid); // actor who cast the spell

  // only weapon attacks
  if (!['mwak', 'rwak'].includes(item.data.actionType)) {
    return {};
  }

  // only on the marked target
  if (hitTargets[0].uuid !== getProperty(actor.data.flags, 'aardvarks.favoredFoeTarget')) {
    return {};
  }

  // only once per turn
  if (getProperty(actor.data.flags, 'aardvarks.favoredFoeUsed')) {
    return {};
  }

  const effectData = {
    changes: [{ key: 'flags.aardvarks.favoredFoeUsed', mode: 5, value: true, priority: 20 }],
    origin: itemUuid, // flag the effect as associated to the spell being cast
    disabled: false,
    duration: { turns: 1, startTime: game.time.worldTime },
    icon: item.img,
    label: `${item.name} has been used`,
  };

  await actor.createEmbeddedDocuments('ActiveEffect', [effectData]);

  const damageType = item.data.damage.parts[0][1];
  const critDamage = isCritical ? '+6' : '';

  return { damageRoll: `1d6${critDamage}[${damageType}]`, flavor: 'Favored Foe Damage' };
};

export default async (workflow) => {
  if (workflow.hitTargets.length > 0) {
    if (workflow.tag === 'OnUse') {
      await favoredFoeOnUse(workflow);
    } else if (workflow.tag === 'DamageBonus') {
      return favoredFoeDamageBonus(workflow);
    }
  }

  return {};
};
