const toKey = (name) => name.replace(/[ ']/, '');

const markedOnUse = async (markName, { hitTargets, actorUuid, item, itemUuid }) => {
  // Sample Hunters mark
  const targetUuid = hitTargets[0].uuid;
  const actor = await MidiQOL.MQfromActorUuid(actorUuid); // actor who cast the spell

  if (!actor || !targetUuid) {
    console.error(`${markName}: no token/target selected`);
    return;
  }

  // create an active effect,
  //  one change showing the hunter's mark icon on the caster
  //  the second setting the flag for the macro to be called when damaging an opponent

  const effectData = {
    changes: [
      { key: `flags.midi-qol.${toKey(markName)}`, mode: 5, value: targetUuid, priority: 20 }, // who is marked
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

const markedDamageBonus = (
  { hitTargets, item, actor, isCritical },
  markName,
  attackTypes,
  damageDice,
  overrideDamageType
) => {
  // only weapon attacks
  if (!attackTypes.includes(item.data.actionType)) {
    return {};
  }
  const targetUuid = hitTargets[0].uuid;
  // only on the marked target
  if (targetUuid !== getProperty(actor.flags, `midi-qol.${toKey(markName)}`)) {
    return {};
  }
  const damageType = overrideDamageType || item.data.damage.parts[0][1];
  const critDamage = isCritical ? `+${damageDice}` : '';

  return { damageRoll: `d${damageDice}${critDamage}[${damageType}]`, flavor: `${markName} Damage` };
};

// Main function that should be called from an ItemMacro. markName is the name of
// the spell or effect, e.g. "Hunter's Mark". overrideDamageType is optional. If omitted,
// the weapon damage type is used. damageDice is the extra damage dice as a number.
export default async ({ workflow, markName, attackTypes, damageDiceSize, overrideDamageType }) => {
  if (workflow.hitTargets.length > 0) {
    if (workflow.tag === 'OnUse') {
      await markedOnUse(markName, workflow);
    } else if (workflow.tag === 'DamageBonus') {
      return markedDamageBonus(workflow, markName, attackTypes, damageDiceSize, overrideDamageType);
    }
  }

  return {};
};
